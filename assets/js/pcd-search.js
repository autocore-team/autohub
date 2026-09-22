(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PCD_SEARCH = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const makerAliases = {
    volkswagen: ['vw'],
    'mercedes benz': ['mercedes', 'benz', 'mb'],
    'opel vauxhall': ['opel', 'vauxhall']
  };
  const romanByNumber = { 1: 'i', 2: 'ii', 3: 'iii', 4: 'iv', 5: 'v', 6: 'vi', 7: 'vii', 8: 'viii', 9: 'ix' };

  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/×/g, 'x')
      .replace(/\b([3-9])\s*[-x]\s*(\d{2,3}(?:\.\d+)?)\b/g, '$1x$2')
      .replace(/\b(m\d{2})\s*[-x]\s*(\d(?:\.\d+)?)\b/g, '$1x$2')
      .replace(/[_/\\-]+/g, ' ')
      .replace(/[^a-z0-9.]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function tokens(value) {
    const normalized = normalizeSearchText(value);
    return normalized ? normalized.split(' ') : [];
  }

  function fieldTokens(value) {
    const result = new Set(tokens(value));
    for (const token of [...result]) {
      const mk = token.match(/^mk(\d+)$/);
      if (mk) {
        result.add(mk[1]);
        result.add(`mark${mk[1]}`);
        if (romanByNumber[mk[1]]) result.add(romanByNumber[mk[1]]);
      }
    }
    return result;
  }

  function searchableRecord(brand, model, record) {
    const maker = normalizeSearchText(brand.name);
    const modelName = normalizeSearchText(model.name);
    const generation = normalizeSearchText(record.generation);
    const aliases = (record.aliases || []).map(normalizeSearchText);
    const technical = [
      record.years, record.market, record.pcd, record.centerBore, record.thread,
      record.fastener, record.offset, record.status
    ].map(normalizeSearchText);
    const allTokens = new Set([
      ...fieldTokens(brand.name),
      ...fieldTokens(brand.slug),
      ...fieldTokens(model.name),
      ...fieldTokens(model.slug),
      ...fieldTokens(record.generation),
      ...aliases.flatMap((alias) => [...fieldTokens(alias)]),
      ...technical.flatMap(tokens),
      ...(makerAliases[maker] || []).flatMap(tokens)
    ]);
    return {
      maker,
      model: modelName,
      generation,
      technical,
      tokens: allTokens,
      phrases: new Set([
        maker,
        modelName,
        generation,
        ...aliases,
        `${maker} ${modelName}`,
        `${modelName} ${generation}`,
        `${maker} ${modelName} ${generation}`,
        ...technical
      ])
    };
  }

  function scoreRecord(brand, model, record, query) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return 1;
    const queryTokens = tokens(normalizedQuery);
    const searchable = searchableRecord(brand, model, record);
    if (!queryTokens.every((token) => searchable.tokens.has(token))) return 0;

    let score = queryTokens.length * 20;
    if (searchable.phrases.has(normalizedQuery)) score += 500;
    if (`${searchable.maker} ${searchable.model}` === normalizedQuery) score += 400;
    if (`${searchable.model} ${searchable.generation}` === normalizedQuery) score += 450;
    if (`${searchable.maker} ${searchable.generation}` === normalizedQuery) score += 350;
    if (searchable.generation === normalizedQuery) score += 300;
    if (searchable.technical.includes(normalizedQuery)) score += 250;
    if (queryTokens.some((token) => searchable.generation.split(' ').includes(token))) score += 80;
    return score;
  }

  function byScoreThenName(left, right) {
    return right.score - left.score || left.name.localeCompare(right.name);
  }

  function searchDatabase(data, query) {
    const normalizedQuery = normalizeSearchText(query);
    return data.map((brand) => {
      const models = brand.models.map((model) => {
        const records = model.records
          .map((record, index) => ({ record, index, score: scoreRecord(brand, model, record, normalizedQuery) }))
          .filter((result) => result.score > 0)
          .sort((left, right) => right.score - left.score || left.index - right.index);
        return {
          model,
          name: model.name,
          score: records.length ? Math.max(...records.map((result) => result.score)) : 0,
          records: records.map((result) => result.record)
        };
      }).filter((result) => result.records.length > 0);

      if (normalizedQuery) models.sort(byScoreThenName);
      else models.sort((left, right) => left.name.localeCompare(right.name));
      return {
        brand,
        name: brand.name,
        score: models.length ? Math.max(...models.map((result) => result.score)) : 0,
        models
      };
    }).filter((result) => result.models.length > 0)
      .sort(normalizedQuery ? byScoreThenName : (left, right) => left.name.localeCompare(right.name));
  }

  function uniqueSelection(results) {
    const brandResult = results.length === 1 ? results[0] : null;
    const modelResult = brandResult?.models.length === 1 ? brandResult.models[0] : null;
    return {
      selectedBrand: brandResult?.brand || null,
      selectedModel: modelResult?.model || null
    };
  }

  function verificationNoticeState(records) {
    const hasReviewed = records.some((record) => ['verified', 'corroborated'].includes(record.status));
    const hasLegacy = records.some((record) => !['verified', 'corroborated'].includes(record.status));
    if (hasReviewed && hasLegacy) return 'mixed';
    if (hasLegacy) return 'legacy-only';
    return 'verified-only';
  }

  function resolveSelection(data, query, makerSlug, modelSlug) {
    const results = searchDatabase(data, query);
    const inferred = uniqueSelection(results);
    const brandResult = results.find((result) => result.brand.slug === makerSlug)
      || results.find((result) => result.brand === inferred.selectedBrand)
      || null;
    const modelResult = brandResult?.models.find((result) => result.model.slug === modelSlug)
      || brandResult?.models.find((result) => result.model === inferred.selectedModel)
      || null;
    return {
      results,
      selectedBrand: brandResult?.brand || null,
      selectedModel: modelResult?.model || null
    };
  }

  function resolveUrlState(data, search, supportedLanguages) {
    const params = new URLSearchParams(search);
    const query = params.get('search') || '';
    const requestedLanguage = params.get('lang');
    const selection = resolveSelection(data, query, params.get('make'), params.get('model'));
    return {
      query,
      language: supportedLanguages.includes(requestedLanguage) ? requestedLanguage : 'en',
      ...selection
    };
  }

  return {
    normalizeSearchText,
    scoreRecord,
    searchDatabase,
    uniqueSelection,
    verificationNoticeState,
    resolveSelection,
    resolveUrlState
  };
});
