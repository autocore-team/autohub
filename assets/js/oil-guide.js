(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OilGuide = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const languages = ['en', 'es', 'fr', 'de'];
  const ui = {
    en: { reset: 'Reset', copy: 'Copy link', copied: 'Link copied', notPublished: 'Not published pending exact source review', requiredApproval: 'Required OEM approvals', preferredApproval: 'Preferred OEM approvals', sources: 'Sources', verified: 'Verified', corroborated: 'Corroborated', preliminary: 'Preliminary', legacyPending: 'Legacy record pending exact-source review', unknown: 'Unknown', legacyNotice: 'This former starter entry is preserved for traceability but is not a production recommendation. Select an exact reviewed engine record or send a request.' },
    es: { reset: 'Restablecer', copy: 'Copiar enlace', copied: 'Enlace copiado', notPublished: 'No publicado hasta revisar una fuente exacta', requiredApproval: 'Homologaciones OEM obligatorias', preferredApproval: 'Homologaciones OEM preferidas', sources: 'Fuentes', verified: 'Verificado', corroborated: 'Corroborado', preliminary: 'Preliminar', legacyPending: 'Registro heredado pendiente de fuente exacta', unknown: 'Desconocido', legacyNotice: 'Esta antigua ficha inicial se conserva para trazabilidad, pero no es una recomendación de producción. Selecciona un motor exacto revisado o envía una solicitud.' },
    fr: { reset: 'Réinitialiser', copy: 'Copier le lien', copied: 'Lien copié', notPublished: 'Non publié avant vérification d’une source exacte', requiredApproval: 'Homologations OEM obligatoires', preferredApproval: 'Homologations OEM préférées', sources: 'Sources', verified: 'Vérifié', corroborated: 'Corroboré', preliminary: 'Préliminaire', legacyPending: 'Fiche héritée en attente d’une source exacte', unknown: 'Inconnu', legacyNotice: 'Cette ancienne fiche initiale est conservée pour traçabilité, mais ne constitue pas une recommandation de production. Sélectionnez un moteur exact vérifié ou envoyez une demande.' },
    de: { reset: 'Zurücksetzen', copy: 'Link kopieren', copied: 'Link kopiert', notPublished: 'Bis zur Prüfung einer genauen Quelle nicht veröffentlicht', requiredApproval: 'Erforderliche OEM-Freigaben', preferredApproval: 'Bevorzugte OEM-Freigaben', sources: 'Quellen', verified: 'Verifiziert', corroborated: 'Bestätigt', preliminary: 'Vorläufig', legacyPending: 'Altdatensatz wartet auf genaue Quelle', unknown: 'Unbekannt', legacyNotice: 'Dieser frühere Starteintrag bleibt zur Rückverfolgbarkeit erhalten, ist aber keine Produktions-Empfehlung. Einen exakt geprüften Motor wählen oder eine Anfrage senden.' }
  };
  const normalize = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const yearsLabel = (record) => `${record.productionYears.from}-${record.productionYears.to}`;
  const variantKey = (record) => `${record.generation}|||${yearsLabel(record)}`;
  const uniqueSorted = (items) => [...new Set(items)].sort((left, right) => left.localeCompare(right));

  function cascade(records, state = {}) {
    const makes = uniqueSorted(records.map((record) => record.make));
    const make = makes.includes(state.make) ? state.make : '';
    const models = make ? uniqueSorted(records.filter((record) => record.make === make).map((record) => record.model)) : [];
    const model = models.includes(state.model) ? state.model : '';
    const variants = model ? uniqueSorted(records.filter((record) => record.make === make && record.model === model).map(variantKey)) : [];
    const variant = variants.includes(state.variant) ? state.variant : '';
    const engines = variant ? records.filter((record) => record.make === make && record.model === model && variantKey(record) === variant) : [];
    const engine = engines.some((record) => record.id === state.engine) ? state.engine : '';
    return { makes, make, models, model, variants, variant, engines, engine };
  }

  function resolveUrlState(data, href) {
    const url = new URL(href, 'https://d3orient.com/oil-guide.html');
    const requestedEngine = url.searchParams.get('engine') || '';
    const record = data.records.find((item) => item.id === requestedEngine);
    const legacyRecord = data.legacyRecords.find((item) => item.id === requestedEngine);
    const state = cascade(data.records, {
      make: url.searchParams.get('make') || record?.make || '',
      model: url.searchParams.get('model') || record?.model || '',
      variant: url.searchParams.get('variant') || (record ? variantKey(record) : ''),
      engine: requestedEngine
    });
    return { ...state, record: state.engine ? record : null, legacyRecord: record ? null : legacyRecord || null, lang: languages.includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'en' };
  }

  function selectionUrl(href, state, lang) {
    const url = new URL(href, 'https://d3orient.com/oil-guide.html');
    for (const key of ['make', 'model', 'variant', 'engine']) {
      if (state[key]) url.searchParams.set(key, state[key]);
      else url.searchParams.delete(key);
    }
    url.searchParams.set('lang', lang);
    return url;
  }

  function resetUrl(href, lang) {
    const url = new URL(href, 'https://d3orient.com/oil-guide.html');
    for (const key of ['make', 'model', 'variant', 'engine']) url.searchParams.delete(key);
    url.searchParams.set('lang', lang);
    return url;
  }

  function findRecord(data, query) {
    const needle = normalize(query);
    if (!needle) return null;
    const exact = data.records.find((record) => normalize(record.engineCode) === needle || normalize(record.id) === needle);
    if (exact) return { type: 'record', value: exact };
    const record = data.records.find((item) => normalize(`${item.engineCode} ${item.make} ${item.model} ${item.generation} ${yearsLabel(item)}`).includes(needle));
    if (record) return { type: 'record', value: record };
    const legacy = data.legacyRecords.find((item) => normalize(item.id) === needle || normalize(`${item.engine} ${item.make} ${item.model} ${item.generation} ${item.years}`).includes(needle));
    return legacy ? { type: 'legacy', value: legacy } : null;
  }

  const escapeHtml = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const localize = (value, lang) => value && typeof value === 'object' && !Array.isArray(value) ? value[lang] || value.en || '' : value || '';
  const chips = (values, className = '') => values.length ? `<div class="chips">${values.map((value) => `<span class="chip ${className}">${escapeHtml(value)}</span>`).join('')}</div>` : '';

  function initBrowser(win = window, doc = document) {
    const data = win.AUTOHUB_OIL_DATA || { records: [], legacyRecords: [] };
    const translations = win.AUTOHUB_OIL_TRANSLATIONS || { en: {} };
    const elements = Object.fromEntries(['makeSelect', 'modelSelect', 'variantSelect', 'engineSelect', 'oilQuickSearch', 'oilSearchSuggestions', 'findButton', 'resetButton', 'copyLinkButton', 'requestLink', 'finderSummary', 'resultPanel', 'resultContent'].map((id) => [id, doc.getElementById(id)]));
    let lang = resolveUrlState(data, win.location.href).lang;
    const t = (key) => translations[lang]?.[key] || translations.en?.[key] || ui[lang]?.[key] || ui.en[key] || key;
    const clear = (select) => { while (select.options.length > 1) select.remove(1); select.value = ''; };
    const addOptions = (select, items, label = (value) => value) => items.forEach((item) => { const option = doc.createElement('option'); option.value = typeof item === 'string' ? item : item.id; option.textContent = label(item); select.appendChild(option); });
    const spec = (label, value) => `<div class="spec-item"><span class="spec-label">${escapeHtml(label)}</span><div class="spec-value">${value || escapeHtml(ui[lang].notPublished)}</div></div>`;
    const industry = (record) => [chips(record.industrySpecifications.acea), chips(record.industrySpecifications.api), chips(record.industrySpecifications.ilsac)].filter(Boolean).join('');
    const capacity = (record) => record.serviceFillCapacity == null ? '' : `${record.serviceFillCapacity} ${record.capacityUnit}${record.capacityNote ? ` — ${escapeHtml(localize(record.capacityNote, lang))}` : ''}`;
    const interval = (record) => record.serviceInterval ? [record.serviceInterval.distanceKm && `${record.serviceInterval.distanceKm} km`, record.serviceInterval.months && `${record.serviceInterval.months} months`, localize(record.serviceInterval.note, lang)].filter(Boolean).join(' / ') : '';
    const emissions = (record) => `DPF: ${record.emissionsEquipment.dpf}; GPF: ${record.emissionsEquipment.gpf}; catalyst: ${record.emissionsEquipment.catalyst}`;
    const sourceLinks = (record) => record.sources.map((source) => `<a href="${escapeHtml(source.url)}" rel="noopener noreferrer">${escapeHtml(source.publisher)} — ${escapeHtml(source.title)}</a>`).join('<br>');

    function populate(state = {}) {
      const next = cascade(data.records, state);
      clear(elements.makeSelect); addOptions(elements.makeSelect, next.makes); elements.makeSelect.value = next.make;
      clear(elements.modelSelect); addOptions(elements.modelSelect, next.models); elements.modelSelect.disabled = !next.make; elements.modelSelect.value = next.model;
      clear(elements.variantSelect); addOptions(elements.variantSelect, next.variants); elements.variantSelect.disabled = !next.model; elements.variantSelect.value = next.variant;
      clear(elements.engineSelect); addOptions(elements.engineSelect, next.engines, (record) => record.engineCode); elements.engineSelect.disabled = !next.variant; elements.engineSelect.value = next.engine;
      return next;
    }

    function currentState() { return { make: elements.makeSelect.value, model: elements.modelSelect.value, variant: elements.variantSelect.value, engine: elements.engineSelect.value }; }
    function updateRequest() { const state = currentState(); const params = new URLSearchParams({ lang, topic: 'engine-oil', ...Object.fromEntries(Object.entries(state).filter(([, value]) => value)) }); elements.requestLink.href = `contact.html?${params}`; }
    function hideResult(message = t('chooseAll')) { elements.resultPanel.hidden = true; elements.resultContent.textContent = ''; elements.finderSummary.textContent = message; }
    function renderLegacy(record, updateHistory = true) {
      elements.resultContent.innerHTML = `<div class="result-header"><div><h3>${escapeHtml(record.make)} ${escapeHtml(record.model)} · ${escapeHtml(record.engine)}</h3><p>${escapeHtml(record.generation)} · ${escapeHtml(record.years)}</p></div><span class="status-badge warning">${escapeHtml(ui[lang].legacyPending)}</span></div><p class="result-note">${escapeHtml(ui[lang].legacyNotice)}</p>`;
      elements.resultPanel.hidden = false; elements.finderSummary.textContent = '';
      if (updateHistory) win.history.pushState({}, '', selectionUrl(win.location.href, { engine: record.id }, lang));
    }
    function renderRecord(record, updateHistory = true) {
      const standards = industry(record);
      elements.resultContent.innerHTML = `<div class="result-header"><div><h3>${escapeHtml(record.make)} ${escapeHtml(record.model)} · ${escapeHtml(record.engineCode)}</h3><p>${escapeHtml(record.generation)} · ${escapeHtml(yearsLabel(record))}</p></div><span class="status-badge warning">${escapeHtml(ui[lang][record.status])}</span></div><div class="spec-grid">${spec(t('vehicle'), escapeHtml(`${record.make} ${record.model}, ${record.generation}, ${yearsLabel(record)}`))}${spec(t('fuel'), escapeHtml(record.fuelType === 'unknown' ? ui[lang].unknown : t(record.fuelType)))}${spec(t('aspiration'), escapeHtml(record.aspiration === 'unknown' ? ui[lang].unknown : t(record.aspiration)))}${spec(t('viscosity'), chips(record.allowedSaeViscosities))}${spec(t('standards'), standards)}${spec(ui[lang].requiredApproval, chips(record.requiredManufacturerApprovals, 'approval'))}${spec(ui[lang].preferredApproval, chips(record.preferredManufacturerApprovals, 'approval'))}${spec(t('capacity'), escapeHtml(capacity(record)))}${spec(t('emissions'), escapeHtml(emissions(record)))}${spec(t('interval'), escapeHtml(interval(record)))}${spec(t('climate'), record.climateLimitations.length ? escapeHtml(JSON.stringify(record.climateLimitations)) : '')}${spec(t('recordStatus'), escapeHtml(ui[lang][record.status]))}${spec(ui[lang].sources, sourceLinks(record))}</div><p class="result-note"><strong>${escapeHtml(t('note'))}:</strong> ${escapeHtml(localize(record.notes, lang))}</p>`;
      elements.resultPanel.hidden = false; elements.finderSummary.textContent = '';
      if (updateHistory) win.history.pushState({}, '', selectionUrl(win.location.href, { make: record.make, model: record.model, variant: variantKey(record), engine: record.id }, lang));
    }
    function restoreFromUrl() {
      const state = resolveUrlState(data, win.location.href); lang = state.lang; populate(state); elements.oilQuickSearch.value = '';
      if (state.record) renderRecord(state.record, false); else if (state.legacyRecord) renderLegacy(state.legacyRecord, false); else hideResult(`${data.records.length} ${t('recordsAvailable').replace('{count}', '').trim()}`);
      translate(); updateRequest();
    }
    function translate() {
      doc.documentElement.lang = lang;
      doc.title = `D3 Orient - ${t('title')}`;
      doc.querySelector('meta[name="description"]')?.setAttribute('content', t('metaDescription'));
      doc.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
      doc.querySelectorAll('[data-lang]').forEach((button) => button.classList.toggle('selected', button.dataset.lang === lang));
      elements.resetButton.textContent = ui[lang].reset; elements.copyLinkButton.textContent = ui[lang].copy;
    }

    for (const item of [...data.records.map((record) => ({ value: `${record.engineCode} · ${record.make} ${record.model}`, label: `${record.engineCode} · ${record.make} ${record.model}` })), ...data.legacyRecords.map((record) => ({ value: `${record.engine} · ${record.make} ${record.model}`, label: `${record.engine} · ${record.make} ${record.model}` }))]) { const option = doc.createElement('option'); option.value = item.value; elements.oilSearchSuggestions.appendChild(option); }
    elements.makeSelect.addEventListener('change', () => { populate({ make: elements.makeSelect.value }); hideResult(); updateRequest(); });
    elements.modelSelect.addEventListener('change', () => { populate({ make: elements.makeSelect.value, model: elements.modelSelect.value }); hideResult(); updateRequest(); });
    elements.variantSelect.addEventListener('change', () => { populate({ make: elements.makeSelect.value, model: elements.modelSelect.value, variant: elements.variantSelect.value }); hideResult(); updateRequest(); });
    elements.engineSelect.addEventListener('change', () => { hideResult(elements.engineSelect.value ? '' : t('chooseAll')); updateRequest(); });
    elements.findButton.addEventListener('click', () => { const match = elements.oilQuickSearch.value.trim() ? findRecord(data, elements.oilQuickSearch.value) : null; if (match?.type === 'record') { const record = match.value; populate({ make: record.make, model: record.model, variant: variantKey(record), engine: record.id }); renderRecord(record); } else if (match?.type === 'legacy') renderLegacy(match.value); else { const record = data.records.find((item) => item.id === elements.engineSelect.value); if (record) renderRecord(record); else hideResult(t('quickNoMatch')); } updateRequest(); });
    elements.oilQuickSearch.addEventListener('keydown', (event) => { if (event.key === 'Enter') elements.findButton.click(); });
    elements.resetButton.addEventListener('click', () => { populate(); elements.oilQuickSearch.value = ''; hideResult(); win.history.pushState({}, '', resetUrl(win.location.href, lang)); updateRequest(); });
    elements.copyLinkButton.addEventListener('click', async () => { await win.navigator.clipboard.writeText(win.location.href); elements.copyLinkButton.textContent = ui[lang].copied; });
    doc.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => { lang = button.dataset.lang; win.history.replaceState({}, '', selectionUrl(win.location.href, currentState(), lang)); translate(); const record = data.records.find((item) => item.id === elements.engineSelect.value); if (record && !elements.resultPanel.hidden) renderRecord(record, false); updateRequest(); }));
    win.addEventListener('popstate', restoreFromUrl);
    restoreFromUrl();
    return { restoreFromUrl, populate };
  }

  return { languages, yearsLabel, variantKey, cascade, resolveUrlState, selectionUrl, resetUrl, findRecord, initBrowser };
});
