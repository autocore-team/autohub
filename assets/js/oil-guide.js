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
  const displayYears = (record) => record.productionYears.from === record.productionYears.to ? String(record.productionYears.from) : `${record.productionYears.from}–${record.productionYears.to}`;
  const variantLabel = (key) => { const [generation, range] = key.split('|||'); const [from, to] = range.split('-'); return `${generation} · ${from === to ? from : `${from}–${to}`}`; };
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
Object.assign(evidenceText.en, { oemOilSpecifications: 'OEM oil-quality specification', geography: 'Geographic applicability', geographyUnknown: 'Not established — no worldwide coverage claimed' });
Object.assign(evidenceText.es, { oemOilSpecifications: 'Especificación OEM de calidad del aceite', geography: 'Aplicación geográfica', geographyUnknown: 'No establecida — no se afirma cobertura mundial' });
Object.assign(evidenceText.fr, { oemOilSpecifications: 'Spécification constructeur de qualité d’huile', geography: 'Application géographique', geographyUnknown: 'Non établie — aucune couverture mondiale affirmée' });
Object.assign(evidenceText.de, { oemOilSpecifications: 'OEM-Ölqualitätsspezifikation', geography: 'Geografische Anwendbarkeit', geographyUnknown: 'Nicht festgestellt — keine weltweite Abdeckung behauptet' });
Object.assign(evidenceText.en, {"secondary":"More vehicle details","evidence":"Evidence and sources","notes":"Record notes","blocked":"Oil recommendation unavailable — resolve the application evidence first.","conditions":"Conditions of use","temporarySae":"Temporary substitute only when SAE 0W-20 is unavailable; replace with SAE 0W-20 at the next oil change.","fieldNotAssessed":"Not reassessed","completenessUnknown":"Not assessed"});
Object.assign(evidenceText.es, {"secondary":"Más datos del vehículo","evidence":"Evidencia y fuentes","notes":"Notas del registro","blocked":"Recomendación de aceite no disponible: primero resuelve la evidencia de aplicación.","conditions":"Condiciones de uso","temporarySae":"Sustituto temporal solo si SAE 0W-20 no está disponible; cambia a SAE 0W-20 en el próximo cambio de aceite.","fieldNotAssessed":"Sin reevaluar","completenessUnknown":"Sin evaluar"});
Object.assign(evidenceText.fr, {"secondary":"Autres détails du véhicule","evidence":"Preuves et sources","notes":"Notes de la fiche","blocked":"Recommandation d’huile indisponible : clarifiez d’abord les preuves de l’application.","conditions":"Conditions d’utilisation","temporarySae":"Substitut temporaire uniquement si SAE 0W-20 est indisponible ; revenez à SAE 0W-20 à la prochaine vidange.","fieldNotAssessed":"Non réévalué","completenessUnknown":"Non évaluée"});
Object.assign(evidenceText.de, {"secondary":"Weitere Fahrzeugangaben","evidence":"Nachweise und Quellen","notes":"Hinweise zum Datensatz","blocked":"Keine Ölempfehlung verfügbar — zuerst den Anwendungsnachweis klären.","conditions":"Einsatzbedingungen","temporarySae":"Nur vorübergehend verwenden, wenn SAE 0W-20 nicht verfügbar ist; beim nächsten Ölwechsel wieder SAE 0W-20 verwenden.","fieldNotAssessed":"Nicht neu bewertet","completenessUnknown":"Nicht bewertet"});
const enumText = {
  en: { petrol: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid', unknown: 'Unknown', naturallyAspirated: 'Naturally aspirated', turbocharged: 'Turbocharged', supercharged: 'Supercharged', twinCharged: 'Twin charged', months: 'months' },
  es: { petrol: 'Gasolina', diesel: 'Diésel', hybrid: 'Híbrido', unknown: 'Desconocido', naturallyAspirated: 'Atmosférico', turbocharged: 'Turboalimentado', supercharged: 'Sobrealimentado', twinCharged: 'Doble sobrealimentación', months: 'meses' },
  fr: { petrol: 'Essence', diesel: 'Diesel', hybrid: 'Hybride', unknown: 'Inconnu', naturallyAspirated: 'Atmosphérique', turbocharged: 'Turbocompressé', supercharged: 'Compresseur', twinCharged: 'Double suralimentation', months: 'mois' },
  de: { petrol: 'Benzin', diesel: 'Diesel', hybrid: 'Hybrid', unknown: 'Unbekannt', naturallyAspirated: 'Saugmotor', turbocharged: 'Turbolader', supercharged: 'Kompressor', twinCharged: 'Doppelte Aufladung', months: 'Monate' }
};
Object.assign(enumText.en, {"present":"Present","absent":"Absent","catalyst":"Catalyst"});
Object.assign(enumText.es, {"present":"Presente","absent":"Ausente","catalyst":"Catalizador"});
Object.assign(enumText.fr, {"present":"Présent","absent":"Absent","catalyst":"Catalyseur"});
Object.assign(enumText.de, {"present":"Vorhanden","absent":"Nicht vorhanden","catalyst":"Katalysator"});
const engineLabel = (record, lang = 'en') => record.engineIdentity ? (record.engineIdentity.type === 'engineeringCode' ? record.engineCode : `${record.engineIdentity.value} (${evidenceText[lang][record.engineIdentity.type]})`) : record.engineCode;
const fieldState = (record, field) => record.evidenceAssessment?.fields?.[field] || record.fieldEvidence?.[field]?.state || 'notAssessed';
function sourceLinks(record, field, lang) {
  const text = evidenceText[lang];
  let refs = field === 'application' ? record.applicationEvidence?.evidenceRefs : record.fieldEvidence?.[field]?.evidenceRefs;
  if (field === 'notes' && record.applicationEvidence?.scopeType === 'documentRow') refs = record.sources.filter(s => s.fields.length === 1 && s.fields[0] === 'notes').flatMap(s => (s.locators || []).map(l => ({ sourceId: s.id, locatorId: l.id })));
  if (field === 'oilRequirements' && record.oilRequirements) {
    refs = [];
    const collect = (node) => { refs.push(...node.evidenceRefs || []); if (node.conditionRef) refs.push(node.conditionRef); (node.allOf || node.anyOf || []).forEach(collect); };
    collect(record.oilRequirements.expression);
  }
  const pairs = refs ? refs.map(ref => { const source = record.sources.find(s => s.id === ref.sourceId); return { source, locator: source?.locators?.find(l => l.id === ref.locatorId) }; }).filter(p => p.source && p.locator)
    : record.sources.filter(s => s.fields.includes(field === 'engineIdentity' ? 'engineCode' : field)).map(source => ({ source }));
  const unique = pairs.filter((pair, index) => pairs.findIndex(p => p.source === pair.source && p.locator === pair.locator) === index);
  if (!unique.length) return '';
  return '<details class="field-sources"><summary>' + escapeHtml(text.sources) + '</summary>' + unique.map(({ source, locator }) => {
    const pages = locator?.pageNumbers || source.pageNumbers;
    const location = pages?.length ? text.page + ' ' + pages.join(', ') : locator?.section || '';
    const href = source.url + (pages?.length ? '#page=' + pages[0] : '');
    return '<div class="source-entry"><a href="' + escapeHtml(href) + '" rel="noopener noreferrer">' + escapeHtml(source.publisher) + ' — ' + escapeHtml(source.title) + '</a>'
      + (location ? '<p class="source-locator">' + escapeHtml(location) + '</p>' : '')
      + (locator ? '<p class="source-locator">' + escapeHtml(source.id + ' / ' + locator.id) + '</p>' : '')
      + (locator?.excerpt ? '<blockquote>' + escapeHtml(locator.excerpt) + '</blockquote>' : source.evidenceNotes ? '<p class="source-note">' + escapeHtml(source.evidenceNotes) + '</p>' : '') + '</div>';
  }).join('') + '</details>';
}
function renderRequirements(record, lang = 'en') {
  const text = evidenceText[lang];
  if (!record.oilRequirements) return '';
  if (record.oilRequirements.state !== 'confirmed') return '<p class="evidence-status" data-evidence-state="' + record.oilRequirements.state + '">' + escapeHtml(text[record.oilRequirements.state]) + '</p>';
  const unresolved = [];
  const inspect = node => { if (node.field && fieldState(record, node.field.split('.')[0]) !== 'confirmed') unresolved.push(fieldState(record, node.field.split('.')[0])); (node.allOf || node.anyOf || []).forEach(inspect); };
  inspect(record.oilRequirements.expression);
  if (unresolved.length) { const state = unresolved.includes('conflict') ? 'conflict' : 'unknown'; return '<p class="evidence-status" data-evidence-state="' + state + '">' + escapeHtml(text[state]) + '</p>'; }
  const valueAt = (field) => field.split('.').reduce((v, key) => v?.[key], record);
  function render(node) {
    const locator = node.conditionRef && record.sources.find(s => s.id === node.conditionRef.sourceId)?.locators?.find(l => l.id === node.conditionRef.locatorId);
    const condition = locator?.condition ? '<p class="requirement-condition">' + escapeHtml(text.when) + ': ' + escapeHtml(localize(locator.condition, lang)) + '</p>' : '';
    if (node.field) {
      const state = fieldState(record, node.field.split('.')[0]);
      return condition + (state === 'confirmed' ? '<span class="requirement-value">' + (node.field === 'oemOilSpecifications' ? escapeHtml(text.oemOilSpecifications) + ': ' : '') + escapeHtml(valueAt(node.field)?.[node.index]) + '</span>' : '<span class="evidence-status" data-evidence-state="' + state + '">' + escapeHtml(text[state]) + '</span>');
    }
    const op = node.allOf ? 'allOf' : 'anyOf';
    const children = node[op].map(n => '<div class="requirement-branch">' + render(n) + '</div>').join('<strong class="requirement-operator">' + escapeHtml(text[op === 'allOf' ? 'and' : 'or']) + '</strong>');
    return '<div class="requirement-group" data-operator="' + op + '">' + condition + '<div class="requirement-children">' + children + '</div></div>';
  }
  return render(record.oilRequirements.expression) + '<p class="path-coverage">' + escapeHtml(text[record.oilRequirements.coverage]) + '</p>';
}
const referenceText = {
  en: { title: 'Reference information from third-party sources', warning: 'Reference only — applicability to the selected vehicle is not confirmed' },
  es: { title: 'Información de referencia de fuentes de terceros', warning: 'Solo como referencia — no se confirma su aplicación al vehículo seleccionado' },
  fr: { title: 'Informations de référence de sources tierces', warning: 'À titre indicatif — application au véhicule sélectionné non confirmée' },
  de: { title: 'Referenzinformationen aus Drittquellen', warning: 'Nur zur Information — Anwendbarkeit auf das gewählte Fahrzeug nicht bestätigt' }
};
function renderReferenceInformation(entry, lang) {
  if (!entry || entry.kind !== 'referenceOnly') return '';
  const text = referenceText[lang] || referenceText.en;
  const documents = entry.documents.map(document => {
    let url;
    try { url = new URL(document.url); } catch { return ''; }
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    return '<article><h4><a href="' + escapeHtml(url.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(document.title) + '</a></h4>'
      + '<p class="source-locator">' + escapeHtml(evidenceText[lang].page + ' ' + document.pdfPages.join(', ')) + '</p><p>' + escapeHtml(localize(document.summary, lang)) + '</p></article>';
  }).join('');
  return '<details class="result-reference" data-reference-only="true"><summary>' + escapeHtml(text.title) + ' — ' + escapeHtml(text.warning) + '</summary><p class="result-note">' + escapeHtml(text.warning) + '</p>' + documents + '</details>';
}
function renderOilCard(record, lang = 'en', referenceInformation = null) {
  const text = evidenceText[lang] || evidenceText.en;
  const assessed = !!record.fieldEvidence;
  const appState = record.evidenceAssessment?.application || record.applicationEvidence?.state || 'notAssessed';
  const blocked = assessed && appState !== 'confirmed';
  const completeness = record.completeness?.state || 'notAssessed';
  const labels = { application: text.application, engineIdentity: text[record.engineIdentity?.type || 'engineeringCode'], allowedSaeViscosities: text.viscosity, industrySpecifications: text.standards, oilRequirements: text.requirements, serviceFillCapacity: text.capacity, capacityUnit: text.capacity, capacityNote: text.capacity, serviceInterval: text.interval, requiredManufacturerApprovals: text.approvals, preferredManufacturerApprovals: ui[lang].preferredApproval, displacementLiters: text.displacement, fuelType: text.fuel, aspiration: text.aspiration, climateLimitations: text.climate, emissionsEquipment: text.emissions };
  if (Object.hasOwn(record, 'oemOilSpecifications')) labels.oemOilSpecifications = text.oemOilSpecifications;
  function row(field, value, suppress = false, overrideState = null) {
    const state = overrideState || fieldState(record, field), hasValue = value != null && value !== '';
    const show = !suppress && hasValue && !['unknown', 'conflict'].includes(state) && (!assessed || state === 'confirmed');
    const displayState = state === 'conflict' ? 'conflict' : suppress || state === 'unknown' || !hasValue ? 'unknown' : state;
    const status = displayState === 'notAssessed' ? text.fieldNotAssessed : text[displayState];
    return '<div class="spec-item" data-field="' + field + '"><span class="spec-label">' + escapeHtml(labels[field]) + '</span>'
      + '<span class="evidence-status" data-evidence-state="' + displayState + '">' + escapeHtml(status) + '</span>'
      + (show ? '<div class="spec-value">' + escapeHtml(value) + '</div>' : '') + '</div>';
  }
  const apps = record.applicationEvidence?.scopeType === 'documentRow'
    ? localize(record.applicationEvidence.documentScope.description, lang)
    : record.applicationEvidence?.scopeType === 'engineScoped'
    ? localize(record.applicationEvidence.engineScope.description, lang)
    : record.applicationEvidence?.applications?.map(a => a.trim + ' · ' + a.code + ' · ' + a.transmission + ' · ' + a.driveType).join('; ');
  const identity = record.engineIdentity?.type === 'engineeringCode' || !record.engineIdentity ? record.engineCode : record.engineIdentity.value;
  const climate = (['unknown', 'conflict'].includes(fieldState(record, 'climateLimitations')) ? [] : record.climateLimitations).map(c => (c.sae ? c.sae + ': ' : '') + (c.condition === evidenceText.en.temporarySae ? text.temporarySae : localize(c.condition, lang))).join('; ');
  const unitState = fieldState(record, 'capacityUnit');
  const quantityState = unitState === 'conflict' || fieldState(record, 'serviceFillCapacity') === 'conflict' ? 'conflict' : assessed && unitState !== 'confirmed' ? 'unknown' : fieldState(record, 'serviceFillCapacity');
  const quantity = record.serviceFillCapacity == null || !record.capacityUnit || ['unknown', 'conflict'].includes(quantityState) ? '' : record.serviceFillCapacity + ' ' + record.capacityUnit + (record.capacityNote && (!assessed || fieldState(record, 'capacityNote') === 'confirmed') ? ' — ' + localize(record.capacityNote, lang) : '');
  const requirementsConflict = record.oilRequirements?.state === 'conflict' || !record.oilRequirements && ['allowedSaeViscosities', 'industrySpecifications', 'requiredManufacturerApprovals'].some(field => fieldState(record, field) === 'conflict');
  const requirements = blocked ? '<p class="result-note">' + escapeHtml(text.blocked) + '</p>' : requirementsConflict ? '<p class="evidence-status" data-evidence-state="conflict">' + escapeHtml(text.conflict) + '</p>' : record.oilRequirements ? renderRequirements(record, lang)
    : '<div class="legacy-oil-fields">' + row('allowedSaeViscosities', record.allowedSaeViscosities.join(', '))
      + row('industrySpecifications', [...record.industrySpecifications.acea, ...record.industrySpecifications.api, ...record.industrySpecifications.ilsac].join(', '))
      + (record.requiredManufacturerApprovals.length ? row('requiredManufacturerApprovals', record.requiredManufacturerApprovals.join(', ')) : '') + '</div>';
  const evidence = Object.entries(labels).map(([field, label]) => { const links = sourceLinks(record, field, lang); return links ? '<div class="field-evidence"><h4>' + escapeHtml(label) + '</h4>' + links + '</div>' : ''; }).join('');
  const secondary = row('displacementLiters', record.displacementLiters && record.displacementLiters + ' L')
    + row('fuelType', record.fuelType === 'unknown' ? '' : enumText[lang][record.fuelType] || record.fuelType)
    + row('aspiration', record.aspiration === 'unknown' ? '' : enumText[lang][record.aspiration] || record.aspiration)
    + row('serviceInterval', record.serviceInterval ? [record.serviceInterval.distanceKm && record.serviceInterval.distanceKm + ' km', record.serviceInterval.months && record.serviceInterval.months + ' ' + enumText[lang].months, localize(record.serviceInterval.note, lang)].filter(Boolean).join(' / ') : '')
    + (record.oilRequirements || !record.requiredManufacturerApprovals.length ? row('requiredManufacturerApprovals', record.oilRequirements && record.requiredManufacturerApprovals.length ? text.seePaths : record.requiredManufacturerApprovals.join(', ')) : '')
    + row('preferredManufacturerApprovals', record.preferredManufacturerApprovals.join(', '))
    + row('emissionsEquipment', Object.entries(record.emissionsEquipment).filter(([,v]) => v !== 'unknown').map(([k,v]) => (k === 'catalyst' ? enumText[lang].catalyst : k.toUpperCase()) + ': ' + (enumText[lang][v] || v)).join('; '))
    + (!climate ? row('climateLimitations', '') : '');
  const geography = record.evidenceAssessment?.geography === 'unknown' || record.applicationEvidence?.scopeType === 'documentRow' && record.market.length === 1 && record.market[0] === 'UNKNOWN'
    ? '<p data-field="geography"><strong>' + escapeHtml(text.geography) + ': </strong><span class="evidence-status" data-evidence-state="unknown">' + escapeHtml(text.geographyUnknown) + '</span></p>'
    : '<p>' + escapeHtml(record.market.join(', ') + (record.applicationEvidence?.scopeType === 'engineScoped' && record.generation === 'unknown' ? '' : ' · ' + record.generation)) + '</p>';
  return '<div class="result-header"><div><h3>' + escapeHtml(record.make + ' ' + record.model + ' · ' + displayYears(record)) + '</h3>' + geography
    + (apps ? '<p class="result-application">' + escapeHtml(apps) + '</p>' : '') + '</div><span class="status-badge">' + escapeHtml(text.completeness + ': ' + (completeness === 'notAssessed' ? text.completenessUnknown : text[completeness])) + '</span></div>'
    + '<div class="result-identity">' + row('engineIdentity', identity) + '<div class="spec-item" data-field="application"><span class="spec-label">' + escapeHtml(text.application) + '</span><span class="evidence-status" data-evidence-state="' + appState + '">' + escapeHtml(appState === 'notAssessed' ? text.fieldNotAssessed : text[appState]) + '</span></div></div>'
    + (!assessed ? '<p class="legacy-assessment">' + escapeHtml(text.legacy) + '</p>' : '')
    + '<div class="result-primary"><section class="oil-selection" aria-label="' + escapeHtml(text.requirements) + '"><h4>' + escapeHtml(text.requirements) + '</h4>' + requirements
    + (climate && !blocked && !requirementsConflict ? '<p class="requirement-condition"><strong>' + escapeHtml(text.conditions) + ':</strong> ' + escapeHtml(climate) + '</p>' : '') + '</section>'
    + '<section class="oil-quantity">' + row('serviceFillCapacity', quantity, blocked || requirementsConflict, quantityState) + '</section></div>'
    + '<details class="result-secondary"><summary>' + escapeHtml(text.secondary) + '</summary><div class="spec-grid">' + secondary + '</div></details>'
    + (evidence ? '<details class="result-evidence"><summary>' + escapeHtml(text.evidence) + '</summary>' + evidence + '</details>' : '')
    + '<details class="result-context"><summary>' + escapeHtml(text.notes) + '</summary><p>' + escapeHtml(localize(record.notes, lang)) + '</p>' + (record.applicationEvidence?.scopeType === 'documentRow' ? sourceLinks(record, 'notes', lang) : '') + '</details>'
    + renderReferenceInformation(referenceInformation?.recordId === record.id ? referenceInformation : null, lang);
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
      clear(elements.variantSelect); addOptions(elements.variantSelect, next.variants, variantLabel); elements.variantSelect.disabled = !next.model; elements.variantSelect.value = next.variant;
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
      elements.resultContent.innerHTML = renderOilCard(record, lang, data.referenceInformation?.find(entry => entry.recordId === record.id));
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

  return { displayYears, variantLabel, evidenceText, renderOilCard, renderRequirements, engineLabel, languages, yearsLabel, variantKey, cascade, resolveUrlState, selectionUrl, resetUrl, findRecord, initBrowser };
});
