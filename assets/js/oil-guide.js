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
    const exact = data.records.find((record) => normalize(record.engineIdentity?.value || record.engineCode) === needle || normalize(record.id) === needle);
    if (exact) return { type: 'record', value: exact };
    const record = data.records.find((item) => normalize(`${item.engineIdentity?.value || item.engineCode} ${item.make} ${item.model} ${item.generation} ${yearsLabel(item)}`).includes(needle));
    if (record) return { type: 'record', value: record };
    const legacy = data.legacyRecords.find((item) => normalize(item.id) === needle || normalize(`${item.engine} ${item.make} ${item.model} ${item.generation} ${item.years}`).includes(needle));
    return legacy ? { type: 'legacy', value: legacy } : null;
  }

  const escapeHtml = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const localize = (value, lang) => value && typeof value === 'object' && !Array.isArray(value) ? value[lang] || value.en || '' : value || '';
  const chips = (values, className = '') => values.length ? `<div class="chips">${values.map((value) => `<span class="chip ${className}">${escapeHtml(value)}</span>`).join('')}</div>` : '';

const evidenceText = {
  en: { application: 'Application evidence', confirmed: 'Confirmed', unknown: 'Not confirmed — check exact manual', conflict: 'Conflicting evidence — not recommended', notAssessed: 'Not assessed — legacy evidence retained', completeness: 'Completeness', partial: 'Partial', complete: 'Complete', sources: 'Field sources', and: 'and', or: 'or', when: 'When', documentedPath: 'One documented oil path — other manufacturer options may exist.', exhaustive: 'Reviewed manufacturer alternatives', requirements: 'Oil requirements', legacy: 'Legacy values and sources are retained. Individual fields have not received the new assessment.', engineeringCode: 'Engineering code', officialVariantDesignation: 'Official variant designation', vinEngineSymbol: 'VIN engine symbol', scope: 'Confirmed scope', page: 'PDF page', capacity: 'Service-fill quantity', interval: 'Service interval', viscosity: 'SAE viscosity', standards: 'API / ACEA / ILSAC', approvals: 'Manufacturer approvals', fuel: 'Fuel', aspiration: 'Aspiration', displacement: 'Displacement', emissions: 'Emissions equipment', climate: 'Climate and use' },
  es: { application: 'Evidencia de aplicación', confirmed: 'Confirmado', unknown: 'Sin confirmar — consulta el manual exacto', conflict: 'Evidencia contradictoria — no recomendado', notAssessed: 'Sin evaluar — evidencia heredada conservada', completeness: 'Integridad', partial: 'Parcial', complete: 'Completa', sources: 'Fuentes del campo', and: 'y', or: 'o', when: 'Cuando', documentedPath: 'Una opción de aceite documentada; pueden existir otras opciones del fabricante.', exhaustive: 'Alternativas del fabricante revisadas', requirements: 'Requisitos del aceite', legacy: 'Se conservan valores y fuentes heredados. Los campos individuales no tienen la nueva evaluación.', engineeringCode: 'Código de ingeniería', officialVariantDesignation: 'Designación oficial de variante', vinEngineSymbol: 'Símbolo de motor del VIN', scope: 'Aplicación confirmada', page: 'Página PDF', capacity: 'Cantidad de servicio', interval: 'Intervalo de servicio', viscosity: 'Viscosidad SAE', standards: 'API / ACEA / ILSAC', approvals: 'Homologaciones del fabricante', fuel: 'Combustible', aspiration: 'Aspiración', displacement: 'Cilindrada', emissions: 'Equipo de emisiones', climate: 'Clima y uso' },
  fr: { application: 'Preuves de l’application', confirmed: 'Confirmé', unknown: 'Non confirmé — consultez le manuel exact', conflict: 'Preuves contradictoires — non recommandé', notAssessed: 'Non évalué — preuves héritées conservées', completeness: 'Complétude', partial: 'Partielle', complete: 'Complète', sources: 'Sources du champ', and: 'et', or: 'ou', when: 'Lorsque', documentedPath: 'Une option d’huile documentée ; d’autres options constructeur peuvent exister.', exhaustive: 'Alternatives constructeur examinées', requirements: 'Exigences relatives à l’huile', legacy: 'Valeurs et sources héritées conservées. Les champs individuels n’ont pas reçu la nouvelle évaluation.', engineeringCode: 'Code d’ingénierie', officialVariantDesignation: 'Désignation officielle de variante', vinEngineSymbol: 'Symbole moteur du VIN', scope: 'Application confirmée', page: 'Page PDF', capacity: 'Quantité de vidange', interval: 'Intervalle d’entretien', viscosity: 'Viscosité SAE', standards: 'API / ACEA / ILSAC', approvals: 'Homologations constructeur', fuel: 'Carburant', aspiration: 'Suralimentation', displacement: 'Cylindrée', emissions: 'Équipement antipollution', climate: 'Climat et utilisation' },
  de: { application: 'Anwendungsnachweis', confirmed: 'Bestätigt', unknown: 'Nicht bestätigt — genaues Handbuch prüfen', conflict: 'Widersprüchliche Nachweise — nicht empfohlen', notAssessed: 'Nicht bewertet — bisherige Nachweise erhalten', completeness: 'Vollständigkeit', partial: 'Teilweise', complete: 'Vollständig', sources: 'Quellen des Feldes', and: 'und', or: 'oder', when: 'Wenn', documentedPath: 'Ein dokumentierter Ölweg; weitere Herstelleroptionen können bestehen.', exhaustive: 'Geprüfte Herstelleralternativen', requirements: 'Ölanforderungen', legacy: 'Bisherige Werte und Quellen bleiben erhalten. Einzelne Felder haben noch keine neue Bewertung.', engineeringCode: 'Technischer Motorcode', officialVariantDesignation: 'Offizielle Variantenbezeichnung', vinEngineSymbol: 'VIN-Motorsymbol', scope: 'Bestätigter Einsatzbereich', page: 'PDF-Seite', capacity: 'Servicefüllmenge', interval: 'Serviceintervall', viscosity: 'SAE-Viskosität', standards: 'API / ACEA / ILSAC', approvals: 'Herstellerfreigaben', fuel: 'Kraftstoff', aspiration: 'Aufladung', displacement: 'Hubraum', emissions: 'Abgasausstattung', climate: 'Klima und Einsatz' }
};
Object.assign(evidenceText.en, { seePaths: 'See the documented selection paths' });
Object.assign(evidenceText.es, { seePaths: 'Consulta las opciones documentadas' });
Object.assign(evidenceText.fr, { seePaths: 'Voir les options documentées' });
Object.assign(evidenceText.de, { seePaths: 'Siehe dokumentierte Auswahlwege' });
const enumText = {
  en: { petrol: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid', unknown: 'Unknown', naturallyAspirated: 'Naturally aspirated', turbocharged: 'Turbocharged', supercharged: 'Supercharged', twinCharged: 'Twin charged', months: 'months' },
  es: { petrol: 'Gasolina', diesel: 'Diésel', hybrid: 'Híbrido', unknown: 'Desconocido', naturallyAspirated: 'Atmosférico', turbocharged: 'Turboalimentado', supercharged: 'Sobrealimentado', twinCharged: 'Doble sobrealimentación', months: 'meses' },
  fr: { petrol: 'Essence', diesel: 'Diesel', hybrid: 'Hybride', unknown: 'Inconnu', naturallyAspirated: 'Atmosphérique', turbocharged: 'Turbocompressé', supercharged: 'Compresseur', twinCharged: 'Double suralimentation', months: 'mois' },
  de: { petrol: 'Benzin', diesel: 'Diesel', hybrid: 'Hybrid', unknown: 'Unbekannt', naturallyAspirated: 'Saugmotor', turbocharged: 'Turbolader', supercharged: 'Kompressor', twinCharged: 'Doppelte Aufladung', months: 'Monate' }
};
const engineLabel = (record, lang = 'en') => record.engineIdentity ? (record.engineIdentity.type === 'engineeringCode' ? record.engineCode : `${record.engineIdentity.value} (${evidenceText[lang][record.engineIdentity.type]})`) : record.engineCode;
const fieldState = (record, field) => record.evidenceAssessment?.fields?.[field] || record.fieldEvidence?.[field]?.state || 'notAssessed';
function sourceLinks(record, field, lang) {
  const text = evidenceText[lang];
  const refs = field === 'application' ? record.applicationEvidence?.evidenceRefs : record.fieldEvidence?.[field]?.evidenceRefs;
  const pairs = refs ? refs.map((ref) => { const source = record.sources.find((s) => s.id === ref.sourceId); return { source, locator: source?.locators?.find((l) => l.id === ref.locatorId) }; }).filter((p) => p.source && p.locator)
    : record.sources.filter((s) => s.fields.includes(field === 'engineIdentity' ? 'engineCode' : field)).map((source) => ({ source }));
  return pairs.map(({ source, locator }) => {
    const pages = locator?.pageNumbers || source.pageNumbers;
    const location = pages?.length ? `${text.page} ${pages.join(', ')}` : locator?.section || '';
    const href = source.url + (pages?.length ? `#page=${pages[0]}` : '');
    return `<details class="field-sources"><summary>${escapeHtml(text.sources)}${location ? ' · ' + escapeHtml(location) : ''}</summary><a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(source.publisher)} — ${escapeHtml(source.title)}</a>${locator?.excerpt ? `<p>${escapeHtml(locator.excerpt)}</p>` : ''}</details>`;
  }).join('');
}
function renderRequirements(record, lang = 'en') {
  const text = evidenceText[lang];
  if (record.oilRequirements && record.oilRequirements.state !== 'confirmed') return `<p>${escapeHtml(text[record.oilRequirements.state])}</p>`;
  const valueAt = (field) => field.split('.').reduce((v, key) => v?.[key], record);
  function render(node) {
    const conditionSource = node.conditionRef && record.sources.find((s) => s.id === node.conditionRef.sourceId)?.locators?.find((l) => l.id === node.conditionRef.locatorId);
    const conditionHtml = conditionSource?.condition ? `<p>${escapeHtml(text.when)}: ${escapeHtml(localize(conditionSource.condition, lang))}</p>` : '';
    if (node.field) {
      const field = node.field.split('.')[0];
      return conditionHtml + (fieldState(record, field) === 'confirmed' ? `<span class="requirement-value">${escapeHtml(valueAt(node.field)?.[node.index])}</span>${sourceLinks(record, field, lang)}` : escapeHtml(text.unknown));
    }
    const op = node.allOf ? 'allOf' : 'anyOf';
    const content = (node[op] || []).map((n) => `<div class="requirement-branch">${render(n)}</div>`).join(`<strong class="requirement-operator">${escapeHtml(text[op === 'allOf' ? 'and' : 'or'])}</strong>`);
    const ref = node.conditionRef;
    const locator = ref && record.sources.find((s) => s.id === ref.sourceId)?.locators?.find((l) => l.id === ref.locatorId);
    return `<div class="requirement-group" data-operator="${op}">${locator?.condition ? `<p>${escapeHtml(text.when)}: ${escapeHtml(localize(locator.condition, lang))}</p>` : ''}${content}</div>`;
  }
  return record.oilRequirements ? `<p class="result-note">${escapeHtml(text[record.oilRequirements.coverage])}</p>${render(record.oilRequirements.expression)}` : '';
}
function renderOilCard(record, lang = 'en') {
  const text = evidenceText[lang] || evidenceText.en;
  const assessed = !!record.fieldEvidence;
  const appState = record.evidenceAssessment?.application || record.applicationEvidence?.state || 'notAssessed';
  const completeness = record.completeness?.state || (assessed ? 'partial' : 'notAssessed');
  const row = (label, value, field) => {
    const state = fieldState(record, field);
    const show = !assessed || state === 'confirmed';
    return `<div class="spec-item"><span class="spec-label">${escapeHtml(label)}</span><span class="evidence-status" data-evidence-state="${state}">${escapeHtml(text[state])}</span><div class="spec-value">${show && value ? escapeHtml(value) : escapeHtml(text.unknown)}</div>${show ? sourceLinks(record, field, lang) : ''}</div>`;
  };
  const apps = record.applicationEvidence?.applications?.map((a) => `${a.trim} · ${a.code} · ${a.transmission} · ${a.driveType}`).join('; ') || '';
  const identity = record.engineIdentity ? `${text[record.engineIdentity.type]}: ${record.engineIdentity.type === 'engineeringCode' ? record.engineCode : record.engineIdentity.value}` : record.engineCode;
  return `<div class="result-header"><div><h3>${escapeHtml(record.make)} ${escapeHtml(record.model)} · ${escapeHtml(identity)}</h3><p>${escapeHtml(record.generation)} · ${escapeHtml(yearsLabel(record))} · ${escapeHtml(record.market.join(', '))}</p></div></div><p><strong>${escapeHtml(text.completeness)}:</strong> ${escapeHtml(text[completeness])}</p>${!assessed ? `<p class="result-note">${escapeHtml(text.legacy)}</p>` : ''}<div class="spec-grid"><div class="spec-item"><span class="spec-label">${escapeHtml(text.application)}</span><span class="evidence-status" data-evidence-state="${appState}">${escapeHtml(text[appState])}</span><p>${escapeHtml(apps)}</p>${sourceLinks(record, 'application', lang)}</div>${row(text[record.engineIdentity?.type || 'engineeringCode'], identity, 'engineIdentity')}${row(text.displacement, record.displacementLiters && `${record.displacementLiters} L`, 'displacementLiters')}${row(text.fuel, enumText[lang][record.fuelType] || record.fuelType, 'fuelType')}${row(text.aspiration, enumText[lang][record.aspiration] || record.aspiration, 'aspiration')}${row(text.viscosity, record.allowedSaeViscosities.join(', '), 'allowedSaeViscosities')}${row(text.standards, [...record.industrySpecifications.acea, ...record.industrySpecifications.api, ...record.industrySpecifications.ilsac].join(', '), 'industrySpecifications')}${record.oilRequirements ? `<div class="spec-item requirement-card"><span class="spec-label">${escapeHtml(text.requirements)}</span>${renderRequirements(record, lang)}</div>` : ''}${row(text.approvals, record.oilRequirements ? text.seePaths : record.requiredManufacturerApprovals.join(', '), 'requiredManufacturerApprovals')}${row(ui[lang].preferredApproval, record.preferredManufacturerApprovals.join(', '), 'preferredManufacturerApprovals')}${row(text.capacity, record.serviceFillCapacity == null ? '' : `${record.serviceFillCapacity} ${record.capacityUnit}${record.capacityNote ? ' — ' + localize(record.capacityNote, lang) : ''}`, 'serviceFillCapacity')}${row(text.interval, record.serviceInterval ? [record.serviceInterval.distanceKm && `${record.serviceInterval.distanceKm} km`, record.serviceInterval.months && `${record.serviceInterval.months} ${enumText[lang].months}`, localize(record.serviceInterval.note, lang)].filter(Boolean).join(' / ') : '', 'serviceInterval')}${row(text.emissions, Object.entries(record.emissionsEquipment).map(([k,v])=>`${k}: ${v}`).join('; '), 'emissionsEquipment')}${row(text.climate, record.climateLimitations.map((c) => `${c.sae || ''}: ${c.condition || ''}`).join('; '), 'climateLimitations')}</div><p class="result-note">${escapeHtml(localize(record.notes, lang))}</p>`;
}

  function initBrowser(win = window, doc = document) {
    const data = win.AUTOHUB_OIL_DATA || { records: [], legacyRecords: [] };
    const translations = win.AUTOHUB_OIL_TRANSLATIONS || { en: {} };
    const elements = Object.fromEntries(['makeSelect', 'modelSelect', 'variantSelect', 'engineSelect', 'oilQuickSearch', 'oilSearchSuggestions', 'findButton', 'resetButton', 'copyLinkButton', 'requestLink', 'finderSummary', 'resultPanel', 'resultContent'].map((id) => [id, doc.getElementById(id)]));
    let lang = resolveUrlState(data, win.location.href).lang;
    const t = (key) => translations[lang]?.[key] || translations.en?.[key] || ui[lang]?.[key] || ui.en[key] || key;
    const clear = (select) => { while (select.options.length > 1) select.remove(1); select.value = ''; };
    const addOptions = (select, items, label = (value) => value) => items.forEach((item) => { const option = doc.createElement('option'); option.value = typeof item === 'string' ? item : item.id; option.textContent = label(item); select.appendChild(option); });
    function populate(state = {}) {
      const next = cascade(data.records, state);
      clear(elements.makeSelect); addOptions(elements.makeSelect, next.makes); elements.makeSelect.value = next.make;
      clear(elements.modelSelect); addOptions(elements.modelSelect, next.models); elements.modelSelect.disabled = !next.make; elements.modelSelect.value = next.model;
      clear(elements.variantSelect); addOptions(elements.variantSelect, next.variants); elements.variantSelect.disabled = !next.model; elements.variantSelect.value = next.variant;
      clear(elements.engineSelect); addOptions(elements.engineSelect, next.engines, (record) => engineLabel(record, lang)); elements.engineSelect.disabled = !next.variant; elements.engineSelect.value = next.engine;
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
      elements.resultContent.innerHTML = renderOilCard(record, lang);
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

    for (const item of [...data.records.map((record) => ({ value: `${engineLabel(record)} · ${record.make} ${record.model}`, label: `${engineLabel(record)} · ${record.make} ${record.model}` })), ...data.legacyRecords.map((record) => ({ value: `${record.engine} · ${record.make} ${record.model}`, label: `${record.engine} · ${record.make} ${record.model}` }))]) { const option = doc.createElement('option'); option.value = item.value; elements.oilSearchSuggestions.appendChild(option); }
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

  return { evidenceText, renderOilCard, renderRequirements, engineLabel, languages, yearsLabel, variantKey, cascade, resolveUrlState, selectionUrl, resetUrl, findRecord, initBrowser };
});
