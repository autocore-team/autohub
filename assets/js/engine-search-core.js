(function (root) {
  'use strict';

  const API = {};

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function makerSlug(value) {
    return normalize(value)
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function recordSearchParts(record) {
    return {
      code: normalize(record.code),
      maker: normalize(record.maker),
      family: normalize(record.family),
      aliases: (record.aliases || []).map(normalize),
      applications: (record.applications || []).map(normalize),
      region: normalize(record.regionKey),
      years: normalize(record.years)
    };
  }

  function searchRank(record, query) {
    const needle = normalize(query);
    if (!needle) return Number.POSITIVE_INFINITY;

    const parts = recordSearchParts(record);
    if (parts.code === needle) return 0;
    if (parts.aliases.includes(needle)) return 1;
    if (parts.code.startsWith(needle)) return 2;
    if (parts.maker === needle) return 3;
    if (parts.applications.includes(needle)) return 4;
    if (parts.aliases.some((value) => value.includes(needle))) return 5;
    if (parts.maker.includes(needle)) return 6;
    if (parts.applications.some((value) => value.includes(needle))) return 7;
    if (parts.family.includes(needle)) return 8;
    if ([parts.region, parts.years].some((value) => value.includes(needle))) return 9;
    return Number.POSITIVE_INFINITY;
  }

  function searchRecords(records, query) {
    const needle = normalize(query);
    if (!needle) return [];

    return records
      .map((record, index) => ({ record, index, rank: searchRank(record, needle) }))
      .filter((item) => Number.isFinite(item.rank))
      .sort((left, right) => left.rank - right.rank || left.index - right.index)
      .map((item) => item.record);
  }

  function makersForRegion(records, region) {
    const makers = new Map();
    records.forEach((record) => {
      if (record.regionKey !== region) return;
      const slug = makerSlug(record.maker);
      if (!makers.has(slug)) makers.set(slug, { slug, label: record.maker, count: 0 });
      makers.get(slug).count += 1;
    });
    return [...makers.values()].sort((left, right) => left.label.localeCompare(right.label));
  }

  function regionSummaries(records, regions) {
    return regions.map((region) => ({
      region,
      engineCount: records.filter((record) => record.regionKey === region).length,
      manufacturerCount: makersForRegion(records, region).length
    }));
  }

  function formatRegionSummary(summary, labels) {
    return `${summary.manufacturerCount} ${labels.manufacturers} · ${summary.engineCount} ${labels.engines}`;
  }

  function enginesForMaker(records, region, maker) {
    return records.filter((record) => (
      record.regionKey === region && makerSlug(record.maker) === maker
    ));
  }

  function resolveEngine(records, requested) {
    const needle = normalize(requested);
    if (!needle) return null;
    return records.find((record) => normalize(record.id) === needle)
      || records.find((record) => normalize(record.code) === needle)
      || records.find((record) => (record.aliases || []).some((alias) => normalize(alias) === needle))
      || null;
  }

  function stateFromUrl(urlValue, records, regions, languages) {
    const url = urlValue instanceof URL ? urlValue : new URL(urlValue, 'https://example.test/engines.html');
    const requestedEngine = resolveEngine(records, url.searchParams.get('engine'));
    const requestedMaker = makerSlug(
      url.searchParams.get('maker')
      || url.searchParams.get('manufacturer')
      || url.searchParams.get('make')
    );
    const makerRecord = requestedMaker
      ? records.find((record) => makerSlug(record.maker) === requestedMaker)
      : null;
    const requestedRegion = url.searchParams.get('region');
    let region = regions.includes(requestedRegion) ? requestedRegion : '';
    let maker = requestedMaker;

    if (requestedEngine) {
      if (!region) region = requestedEngine.regionKey;
      if (!maker) maker = makerSlug(requestedEngine.maker);
    } else if (makerRecord) {
      region = makerRecord.regionKey;
    }

    if (maker) {
      const makerIsValid = records.some((record) => (
        record.regionKey === region && makerSlug(record.maker) === maker
      ));
      if (!makerIsValid) maker = '';
    }

    const requestedLanguage = url.searchParams.get('lang');
    return {
      lang: languages.includes(requestedLanguage) ? requestedLanguage : 'en',
      query: url.searchParams.get('search') || '',
      region,
      maker,
      engine: requestedEngine ? requestedEngine.id : ''
    };
  }

  function applyStateToUrl(urlValue, state) {
    const url = urlValue instanceof URL ? new URL(urlValue.href) : new URL(urlValue, 'https://example.test/engines.html');
    const managed = {
      lang: state.lang,
      search: state.query,
      region: state.region,
      maker: state.maker,
      engine: state.engine
    };

    Object.entries(managed).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    url.searchParams.delete('make');
    url.searchParams.delete('manufacturer');
    return url;
  }

  function navigationModel(records, regions, state) {
    return regionSummaries(records, regions).map((summary) => {
      const expanded = summary.region === state.region;
      const makers = expanded ? makersForRegion(records, summary.region) : [];
      const selectedEngines = expanded && state.maker
        ? enginesForMaker(records, summary.region, state.maker)
        : [];
      return { ...summary, expanded, makers, selectedEngines };
    });
  }

  API.normalize = normalize;
  API.makerSlug = makerSlug;
  API.searchRank = searchRank;
  API.searchRecords = searchRecords;
  API.makersForRegion = makersForRegion;
  API.regionSummaries = regionSummaries;
  API.formatRegionSummary = formatRegionSummary;
  API.enginesForMaker = enginesForMaker;
  API.resolveEngine = resolveEngine;
  API.stateFromUrl = stateFromUrl;
  API.applyStateToUrl = applyStateToUrl;
  API.navigationModel = navigationModel;

  root.D3_ENGINE_SEARCH_CORE = API;
})(window);
