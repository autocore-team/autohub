// Field evidence uses the existing values and sources; it never upgrades record.status.
import { validateDocumentApplication, validateDocumentField, validateTableRequirement } from './document-evidence.mjs';
export const technicalFields = ['engineIdentity', 'displacementLiters', 'fuelType', 'aspiration',
  'allowedSaeViscosities', 'industrySpecifications', 'requiredManufacturerApprovals',
  'preferredManufacturerApprovals', 'serviceFillCapacity', 'capacityUnit', 'capacityNote',
  'serviceInterval', 'climateLimitations', 'emissionsEquipment'];
const states = new Set(['confirmed', 'unknown', 'conflict']);
const official = new Set(['ownersManual', 'serviceManual', 'technicalBulletin', 'lubricationChart', 'oemServicePortal']);
const reviewedHosts = new Set(['techinfo.honda.com', 'crmshonda.my.salesforce-sites.com', 'vpic.nhtsa.dot.gov', 'static.nhtsa.gov', 'www.fordservicecontent.com', 'content.fordpro.com', 'assets.sipb.toyota.com', 'www.toyota.ca', 'www.volvocars.com']);
const assessedFields = record => Object.hasOwn(record, 'oemOilSpecifications') ? [...technicalFields, 'oemOilSpecifications'] : technicalFields;
function reviewedSourceUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !reviewedHosts.has(url.hostname)) return false;
  if (url.hostname === 'www.volvocars.com') return !url.username && !url.password && !url.port && !url.search && !url.hash
    && /^\/uk\/support\/car\/[a-z0-9-]+\/[a-z0-9-]+\/article\/[a-f0-9]{32}(?:[_/][a-f0-9]{32}){2}\/$/.test(url.pathname);
  return url.hostname !== 'www.toyota.ca' || /^\/content\/dam\/toyota\/documents\/manuals\/en\/|^\/bin\/api\/get-manuals\.toyota\.en\.json$/.test(url.pathname);
}
const die = (message) => { throw new Error(message); };
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const literal = (text, value) => new RegExp(`(^|[^A-Za-z0-9])${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^A-Za-z0-9])`, 'i').test(text);
export const hasFieldAssessment = (r) => ['applicationEvidence', 'engineIdentity', 'fieldEvidence', 'oilRequirements'].some((key) => Object.hasOwn(r, key));
export const identityValue = (record) => record.engineIdentity?.type === 'engineeringCode' ? record.engineCode : record.engineIdentity?.value;
export const getValue = (record, field) => field.split('.').reduce((value, key) => value?.[key], record);
const rootField = (field) => field.split('.')[0];

function context(record) {
  const sources = new Map();
  for (const source of record.sources || []) {
    if (!source.id || sources.has(source.id)) die('Field assessment requires unique source IDs');
    if (record.applicationEvidence?.scopeType === 'documentRow' && !reviewedSourceUrl(source.url)) die('Document source has an unsafe or unreviewed URL');
    sources.set(source.id, source);
    const ids = new Set();
    for (const locator of source.locators || []) {
      if (!locator.id || ids.has(locator.id)) die('Duplicate or missing locator ID');
      ids.add(locator.id);
      if (!locator.excerpt?.trim() || !Array.isArray(locator.fields) || !locator.fields.length) die('Locator requires excerpt and fields');
      if (locator.pageNumbers) {
        if (!locator.pageNumbers.length || locator.pageNumbers.some((p) => !Number.isInteger(p) || p < 1 || !source.pageNumbers?.includes(p))) die('Locator pages must be positive pages declared by the source');
      } else if (!locator.section?.trim()) die('Locator requires exact PDF pages or HTML section');
      if (locator.fields.some((field) => !source.fields.includes(field))) die('Locator field is not declared by source');
    }
  }
  function resolve(ref) {
    const source = sources.get(ref?.sourceId);
    const locator = source?.locators?.find((l) => l.id === ref.locatorId);
    if (!source || !locator) die('Invalid source ID or locator reference');
    return { source, locator };
  }
  function trusted(ref, field) {
    const { source, locator } = resolve(ref);
    if (source.provenanceStatus !== 'confirmed' || !official.has(source.type)) return false;
    if (!reviewedSourceUrl(source.url) || !/^[a-f0-9]{64}$/.test(source.documentSha256 || '')) return false;
    if (!source.scope || source.scope.make !== record.make || !source.scope.models?.includes(record.model)) return false;
    if (source.scope.applicationCodes && !record.applicationEvidence?.applications?.every((a) => source.scope.applicationCodes.includes(a.code))) return false;
    if (source.applicableYears.from > record.productionYears.from || source.applicableYears.to < record.productionYears.to) return false;
    if (!record.market.every((m) => source.applicableMarket.includes(m))) return false;
    return locator.fields.includes(field);
  }
  return { sources, resolve, trusted };
}

function refsState(evidence, field, ctx) {
  if (!evidence || !states.has(evidence.state) || !Array.isArray(evidence.evidenceRefs)) die(`Missing or invalid field evidence: ${field}`);
  for (const ref of evidence.evidenceRefs) {
    if (!ctx.resolve(ref).locator.fields.includes(field)) die(`Locator does not cover ${field}`);
  }
  if (evidence.state === 'confirmed' && (!evidence.evidenceRefs.length || !evidence.evidenceRefs.every((ref) => ctx.trusted(ref, field)))) die(`Confirmed ${field} lacks trusted scoped source/locator evidence`);
  if (evidence.state === 'conflict' && new Set(evidence.evidenceRefs.map((r) => `${r.sourceId}:${r.locatorId}`)).size < 2) die(`Conflict ${field} requires both source locators`);
  return evidence.state;
}

function validateIdentity(record, ctx) {
  const identity = record.engineIdentity;
  if (!identity || !['engineeringCode', 'officialVariantDesignation', 'vinEngineSymbol'].includes(identity.type) || !identityValue(record)?.trim()) die('Invalid engineIdentity type or value');
  if (identity.type === 'engineeringCode') {
    if (Object.hasOwn(identity, 'value')) die('Engineering identity uses existing engineCode; duplicate value is forbidden');
  } else if (Object.hasOwn(record, 'engineCode')) die('VIN symbol or official designation must not masquerade as engineering code');
  const evidence = record.fieldEvidence.engineIdentity;
  refsState(evidence, `engineIdentity.${identity.type}`, ctx);
  if (evidence.state === 'confirmed') {
    for (const ref of evidence.evidenceRefs) {
      const { source, locator } = ctx.resolve(ref);
      if (source.identityBindingRef || !literal(locator.excerpt, identityValue(record))) die('Identity requires direct literal evidence, not an alias/binding chain');
    }
  }
}

function validateApplication(record, ctx) {
  const e = record.applicationEvidence;
  refsState(e, 'application', ctx);
  if (e.state !== 'confirmed') return e.state;
  if (e.review?.unambiguous !== true || !e.review.notes?.trim()) die('Confirmed application requires an explicit unambiguous scope review');
  if (e.scopeType !== 'documentRow' && e.documentScope) die('Unused document-row application scope');
  if (e.scopeType === 'documentRow') return validateDocumentApplication(record, ctx);
  if (e.scopeType === 'engineScoped') return validateEngineScope(record, ctx);
  if (e.scopeType && e.scopeType !== 'exactApplication') die('Invalid application scope type');
  if (e.engineScope) die('Exact application cannot carry an unused engine scope');
  const apps = e.applications;
  if (!Array.isArray(apps) || !apps.length || new Set(apps.map((a) => a.code)).size !== apps.length) die('Application requires unique exact application codes');
  for (const app of apps) {
    for (const key of ['code', 'trim', 'transmission', 'driveType']) if (!app[key]?.trim()) die('Application scope requires code, trim, transmission and drivetrain');
    if (!e.evidenceRefs.some((ref) => {
      const { source, locator } = ctx.resolve(ref);
      return source.scope.applicationCodes?.includes(app.code)
        && locator.excerpt.split(/[;\n]|\.\s+/).some((row) => [app.code, app.trim, app.transmission, app.driveType, identityValue(record)].every((v) => literal(row, v)));
    })) die(`Application ${app.code} is not bound to exact variant/trim/transmission/drivetrain by its cited locator`);
  }
  if (record.fieldEvidence.engineIdentity.state !== 'confirmed') die('Application requires a confirmed typed identity');
  return 'confirmed';
}

const refKey = (ref) => `${ref?.sourceId}:${ref?.locatorId}`;
const restrictedApplication = (text) => /\b(except|excluding|excluded)\b|\b(?:does not|do not|not)\s+apply\b|\bnot applicable\b|\b(?:AWD|2WD|FWD|trim|transmission)\s+only\b|\bonly\s+(?:for\s+)?(?:AWD|2WD|FWD|trim|transmission)\b/i.test(text);

function hasAllModelScope(excerpt) {
  // Match a direct assertion, not a positive phrase embedded in a contrary quote.
  // Normalize whitespace for matching only; keep the stored excerpt unchanged.
  const text = excerpt.replace(/\s+/g, ' ').trim();
  const supported = /^(?:please note that )?(?:this )?manual applies to (?:all models(?: and (?:explains )?all equipment, including options)?|explains all models and all equipment, including options)(?:[.!](?=\s|$)|$)/i;
  const contrary = /\b(?:only|solely|exclusively|limited|restricted|exclude|excludes|omit|omits|false|incorrect|invalid|unless)\b|\bsubject to\b|\b(?:not|never)\s+(?:all|every|for|to|valid|applicable|true|correct)\b|\b(?:does|do|is|are)\s+not\s+(?:cover|include|apply|applicable|valid)\b|\b(?:cannot|can['’]t|doesn['’]t|don['’]t)\s+(?:apply|cover|include)\b/i;
  return supported.test(text) && !restrictedApplication(text) && !contrary.test(text);
}

// An engine table is sufficient only when its publication, market, all-model
// coverage and exact identity are linked by reviewed source locators.
function validateEngineScope(record, ctx) {
  const e = record.applicationEvidence, scope = e.engineScope;
  if (!scope || e.applications != null || record.engineIdentity.type !== 'engineeringCode' || record.fieldEvidence.engineIdentity.state !== 'confirmed') die('Engine scope requires a confirmed engineering identity, not invented variant attributes');
  for (const lang of ['en', 'es', 'fr', 'de']) if (!scope.description?.[lang]?.trim()) die('Engine scope description must be localized');
  const roles = ['manualRef', 'marketRef', 'coverageRef', 'identityRef'];
  for (const role of roles) if (!e.evidenceRefs.some((r) => refKey(r) === refKey(scope[role])) || !ctx.trusted(scope[role], 'application')) die(`Engine scope lacks trusted ${role} evidence`);
  const manual = ctx.resolve(scope.manualRef), market = ctx.resolve(scope.marketRef), coverage = ctx.resolve(scope.coverageRef), identity = ctx.resolve(scope.identityRef);
  const publication = manual.source.publicationId;
  if (!publication || !literal(manual.locator.excerpt, publication) || !literal(manual.locator.excerpt, record.model) || ![record.productionYears.from, record.productionYears.to].every((y) => literal(manual.locator.excerpt, y))) die('Engine scope manual edition/model/year is not evidenced');
  const binding = market.locator.documentBinding;
  if (!binding || binding.url !== manual.source.url || binding.publicationId !== publication || !literal(market.locator.excerpt, publication) || !market.locator.excerpt.includes(manual.source.url) || !literal(market.locator.excerpt, record.model) || ![record.productionYears.from, record.productionYears.to].every((y) => literal(market.locator.excerpt, y))) die('Catalogue does not bind this model/year to the exact manual');
  if (!Array.isArray(binding.markets) || !record.market.every((m) => binding.markets.includes(m) && literal(market.locator.excerpt, m === 'CA' ? 'Canada' : m))) die('Engine scope market is not documented');
  if (coverage.source.id !== manual.source.id || identity.source.id !== manual.source.id || !hasAllModelScope(coverage.locator.excerpt)) die('Manual excludes or does not establish all-model engine scope');
  if (!record.fieldEvidence.engineIdentity.evidenceRefs.some((r) => refKey(r) === refKey(scope.identityRef)) || !literal(identity.locator.excerpt, record.engineCode)) die('Engine scope has contradictory or unbound identity');
  const links = scope.links;
  if (!Array.isArray(links) || !links.length) die('Engine scope requires explicit locator links');
  for (const link of links) {
    const from = ctx.resolve(link.from), to = ctx.resolve(link.to);
    if (![link.from, link.to].every((r) => e.evidenceRefs.some((x) => refKey(x) === refKey(r)))) die('Scope link must use declared application evidence');
    if (link.relation === 'publication') {
      if (refKey(link.from) !== refKey(scope.marketRef) || refKey(link.to) !== refKey(scope.manualRef)) die('Invalid publication link');
    } else if (link.relation === 'sameDocument') {
      if (from.source.id !== to.source.id || from.source.id !== manual.source.id) die('Scope link crosses unrelated documents');
    } else die('Unsupported scope link relation');
  }
  const reached = new Set([refKey(scope.marketRef)]);
  const visiting = new Set(), visited = new Set();
  const visit = (key) => {
    if (visiting.has(key)) die('Cyclic application evidence chain');
    if (visited.has(key)) return;
    visiting.add(key);
    for (const link of links.filter((l) => refKey(l.from) === key)) visit(refKey(link.to));
    visiting.delete(key); visited.add(key);
  };
  visit(refKey(scope.marketRef));
  for (let i = 0; i < links.length; i++) for (const link of links) if (reached.has(refKey(link.from))) reached.add(refKey(link.to));
  if (!roles.every((role) => reached.has(refKey(scope[role])))) die('Incomplete application evidence chain');
  return 'confirmed';
}

function validateEngineField(record, ref, field, ctx) {
  const scope = record.applicationEvidence.engineScope, { source, locator } = ctx.resolve(ref);
  if (source.id !== scope.manualRef.sourceId || !source.scope.engineCodes?.includes(record.engineCode) || !locator.engineCodes?.includes(record.engineCode) || !literal(locator.excerpt, record.engineCode)) die(`Engine-scoped ${field} lacks exact engine/table applicability`);
  if (locator.engineCodes.length !== 1 || source.scope.engineCodes.some((code) => code !== record.engineCode && literal(locator.excerpt, code))) die(`Engine-scoped ${field} has contradictory engine identity`);
  if (restrictedApplication(locator.excerpt)) die(`Engine-scoped ${field} contains an unresolved application exclusion`);
  if (!locator.applicabilityRef || refKey(locator.applicabilityRef) !== refKey(scope.coverageRef)) die(`Engine-scoped ${field} lacks an explicit all-model coverage link`);
}

function validateSubstitutions(record, ctx) {
  const substitutions = record.fieldEvidence.allowedSaeViscosities.evidenceRefs.filter((ref) => ctx.resolve(ref).locator.temporarySubstitution);
  const used = new Set();
  function walk(node, conditions = []) {
    const inherited = node.conditionRef ? [...conditions, refKey(node.conditionRef)] : conditions;
    if (node.field === 'allowedSaeViscosities') {
      used.add(node.index);
      for (const ref of substitutions) if (node.index === ctx.resolve(ref).locator.temporarySubstitution.temporaryIndex && !inherited.includes(refKey(ref))) die('Temporary SAE must retain its source-backed unavailability and return condition');
    }
    for (const child of node.allOf || node.anyOf || []) walk(child, inherited);
  }
  walk(record.oilRequirements.expression);
  if (record.allowedSaeViscosities.some((_, i) => !used.has(i))) die('Engine-scoped SAE values must be represented in the conditional requirement tree');
  for (const ref of substitutions) {
    const { locator } = ctx.resolve(ref), s = locator.temporarySubstitution;
    const preferred = record.allowedSaeViscosities[s.preferredIndex], temporary = record.allowedSaeViscosities[s.temporaryIndex];
    if (!preferred || !temporary || s.preferredIndex === s.temporaryIndex || !literal(locator.excerpt, preferred) || !literal(locator.excerpt, temporary) || !/not available/i.test(locator.excerpt) || !/must be replaced with/i.test(locator.excerpt) || !/at the next oil change/i.test(locator.excerpt)) die('Temporary substitution lacks the original source requirement');
    if (!locator.excerpt.includes(`If SAE ${preferred} is not available, SAE ${temporary}`) || !locator.excerpt.includes(`must be replaced with SAE ${preferred} at the next oil change`)) die('Temporary substitution reverses or changes the documented SAE path');
    for (const lang of ['en', 'es', 'fr', 'de']) if (!locator.condition?.[lang]?.trim()) die('Temporary SAE condition must be localized');
    if (!/not available/i.test(locator.condition.en) || !/next oil change/i.test(locator.condition.en) || !literal(locator.condition.en, preferred)) die('Temporary SAE condition loses the mandatory return');
  }
}

function checkClaimValue(record, field, evidence, ctx) {
  if (evidence.state !== 'confirmed') return;
  let value = getValue(record, field);
  if (field === 'engineIdentity') return;
  const strings = (v) => Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [String(v ?? '')];
  if (value == null) die(`Confirmed ${field} needs a value`);
  if (Array.isArray(value) && !value.length) {
    if (!evidence.evidenceRefs.some((ref) => /\b(no|none|not required)\b/i.test(ctx.resolve(ref).locator.excerpt))) die(`Confirmed empty ${field} requires explicit absence evidence`);
    return;
  }
  if (field === 'capacityNote') {
    if (!evidence.evidenceRefs.some((ref) => /with (?:oil )?filter|including (?:the )?(?:oil )?filter/i.test(ctx.resolve(ref).locator.excerpt))) die('Capacity note requires filter-included evidence');
    return;
  }
  if (field === 'serviceFillCapacity' && !evidence.evidenceRefs.some((ref) => {
    const excerpt = ctx.resolve(ref).locator.excerpt;
    return /\b(service|change|drain|refill)\b/i.test(excerpt) && /with (?:oil )?filter|including (?:the )?(?:oil )?filter/i.test(excerpt);
  })) die('Confirmed capacity requires explicit service-fill-with-filter evidence');
  if (field === 'serviceInterval') value = [value.distanceKm, value.months].filter((v) => v != null);
  // Source excerpts hold the published wording; the record value is not duplicated in a parallel claims table.
  const aliases = { petrol: ['gasoline', 'petrol'], naturallyAspirated: ['naturally aspirated', 'Turbo Charged or not Not Applicable'] };
  for (const part of strings(value).filter(Boolean)) {
    if (!evidence.evidenceRefs.some((ref) => {
      const excerpt = ctx.resolve(ref).locator.excerpt;
      if (/^\d+(?:\.\d+)?$/.test(part)) {
        const numbers = [...excerpt.matchAll(/(?<![A-Za-z0-9])\d+(?:[.,]\d+)?(?![A-Za-z0-9.])/g)].map((m) => Number(m[0].replace(',', '.')));
        return numbers.includes(Number(part));
      }
      if (field === 'capacityUnit') return literal(excerpt, part);
      return (aliases[part] || [part]).some((term) => norm(excerpt).includes(norm(term)));
    })) die(`Confirmed ${field} value is absent from cited excerpt`);
  }
}

function validateRequirements(record, ctx) {
  const req = record.oilRequirements;
  if (!req || !states.has(req.state) || !['documentedPath', 'exhaustive'].includes(req.coverage)) die('Invalid oilRequirements state/coverage');
  const seen = new Set();
  function walk(node, depth = 0) {
    if (!node || depth > 12 || seen.has(node)) die('Invalid or cyclic requirement tree');
    seen.add(node);
    const kinds = ['allOf', 'anyOf', 'field'].filter((key) => Object.hasOwn(node, key));
    if (kinds.length !== 1) die('Requirement node must be exactly allOf, anyOf or a field reference');
    if (node.conditionRef) {
      const { locator } = ctx.resolve(node.conditionRef);
      if (!ctx.trusted(node.conditionRef, 'oilRequirements') || !locator.condition) die('Requirement condition requires a trusted condition locator');
      for (const lang of ['en', 'es', 'fr', 'de']) if (!locator.condition[lang]?.trim()) die('Requirement condition must be localized');
    }
    if (kinds[0] === 'field') {
      const supported = ['allowedSaeViscosities', 'industrySpecifications.acea', 'industrySpecifications.api', 'industrySpecifications.ilsac', 'requiredManufacturerApprovals', 'oemOilSpecifications'];
      if (!supported.includes(node.field) || !Number.isInteger(node.index)) die('Invalid requirement field/index');
      const value = getValue(record, node.field)?.[node.index];
      if (typeof value !== 'string' || !value.trim()) die('Requirement points to a missing value');
      const evidence = record.fieldEvidence[rootField(node.field)];
      return { valid: evidence.state === 'confirmed', hasSae: node.field === 'allowedSaeViscosities', hasSpec: node.field !== 'allowedSaeViscosities' };
    }
    const op = kinds[0];
    if (!Array.isArray(node[op]) || node[op].length < 2 || !Array.isArray(node.evidenceRefs) || !node.evidenceRefs.length) die('Logical requirement requires children and source locators');
    for (const ref of node.evidenceRefs) {
      const { locator } = ctx.resolve(ref);
      if (!ctx.trusted(ref, 'oilRequirements') || locator.relation !== op) die('Requirement allOf/anyOf operator is not supported by the cited source relation');
      if (op === 'anyOf' && !/\bor\b/i.test(locator.excerpt) && !(record.applicationEvidence.scopeType === 'engineScoped' && locator.temporarySubstitution)) die('anyOf requires alternative wording in its source');
      if (op === 'allOf' && record.applicationEvidence.scopeType === 'documentRow') validateTableRequirement(record, node, ref, ctx);
      else if (op === 'allOf' && !/\b(and|also|together)\b/i.test(locator.excerpt)) die('allOf requires conjunctive wording in its source');
    }
    const children = node[op].map((n) => walk(n, depth + 1));
    // Every branch must be reviewed; an unresolved branch cannot be silently omitted as a supposed complete list.
    return { valid: children.every((c) => c.valid), hasSae: op === 'allOf' ? children.some((c) => c.hasSae) : children.every((c) => c.hasSae), hasSpec: op === 'allOf' ? children.some((c) => c.hasSpec) : children.every((c) => c.hasSpec) };
  }
  const path = walk(req.expression);
  if (req.coverage === 'exhaustive' && (!req.review?.exhaustive || !req.review.notes?.trim())) die('Exhaustive requirements need explicit source-backed review');
  return req.state === 'confirmed' && path.valid && path.hasSae && path.hasSpec;
}

export function assessOilEvidence(record) {
  if (!hasFieldAssessment(record)) return {
    mode: 'legacyUnassessed', application: 'notAssessed', fields: Object.fromEntries(technicalFields.map((f) => [f, 'notAssessed'])),
    requirements: 'notAssessed', eligible: false, completeness: { state: 'notAssessed', confirmedFields: 0, totalFields: technicalFields.length }
  };
  if (!record.fieldEvidence) die('Incomplete field assessment');
  if (Object.hasOwn(record, 'oemOilSpecifications') !== Object.hasOwn(record.fieldEvidence, 'oemOilSpecifications')
    || Object.hasOwn(record, 'oemOilSpecifications') && (!Array.isArray(record.oemOilSpecifications) || record.oemOilSpecifications.some(s => typeof s !== 'string' || !s.trim()))) die('OEM oil-quality specification requires its own values and field assessment');
  const evaluatedFields = assessedFields(record);
  const ctx = context(record);
  validateIdentity(record, ctx);
  const fields = {};
  for (const field of evaluatedFields) {
    if (field === 'engineIdentity') fields[field] = record.fieldEvidence[field].state;
    else {
      fields[field] = refsState(record.fieldEvidence[field], field, ctx);
      checkClaimValue(record, field, record.fieldEvidence[field], ctx);
    }
  }
  const application = validateApplication(record, ctx);
  if (fields.serviceFillCapacity === 'confirmed' && fields.capacityUnit !== 'confirmed') die('Confirmed capacity requires confirmed units');
  if (fields.capacityNote === 'confirmed' && fields.serviceFillCapacity !== 'confirmed') die('Confirmed capacity note requires confirmed service-fill quantity');
  // Supplemental technical evidence must explicitly bind to the direct identity source.
  for (const field of evaluatedFields.filter((f) => fields[f] === 'confirmed')) {
    for (const ref of record.fieldEvidence[field].evidenceRefs) {
      const { source } = ctx.resolve(ref);
      if (record.applicationEvidence.scopeType === 'documentRow') {
        validateDocumentField(record, ref, field, ctx);
      } else if (record.applicationEvidence.scopeType === 'engineScoped') {
        validateEngineField(record, ref, field, ctx);
      } else if (source.identityBindingRef) {
        const direct = ctx.sources.get(source.identityBindingRef);
        if (!direct || direct.identityBindingRef || !record.fieldEvidence.engineIdentity.evidenceRefs.some((r) => r.sourceId === direct.id)) die('Invalid supplemental identity binding');
        if (!source.scope.engineClasses?.includes(direct.scope.engineClass)) die('Supplemental evidence does not cover the exact bound engine class');
      } else if (field !== 'engineIdentity' && !source.scope.applicationCodes?.length) die('Technical evidence lacks direct application scope or an identity binding');
    }
  }
  const validPath = validateRequirements(record, ctx);
  if (record.applicationEvidence.scopeType === 'documentRow') {
    const check = node => { for (const ref of [...node.evidenceRefs || [], ...node.conditionRef ? [node.conditionRef] : []]) validateDocumentField(record, ref, 'oilRequirements', ctx); for (const child of node.allOf || node.anyOf || []) check(child); };
    check(record.oilRequirements.expression);
    validateSubstitutions(record, ctx);
  }
  if (record.applicationEvidence.scopeType === 'engineScoped') {
    const check = (node) => { for (const ref of [...node.evidenceRefs || [], ...node.conditionRef ? [node.conditionRef] : []]) validateEngineField(record, ref, 'oilRequirements', ctx); for (const child of node.allOf || node.anyOf || []) check(child); };
    check(record.oilRequirements.expression);
    validateSubstitutions(record, ctx);
  }
  const count = Object.values(fields).filter((s) => s === 'confirmed').length;
  const completeness = { state: count === evaluatedFields.length ? 'complete' : 'partial', confirmedFields: count, totalFields: evaluatedFields.length };
  if (Object.hasOwn(record, 'completeness') && !equal(record.completeness, completeness)) die('completeness is computed, not manually assigned');
  return { mode: 'fieldAssessed', application, fields, ...(record.applicationEvidence.scopeType === 'documentRow' ? { geography: record.market[0] === 'UNKNOWN' ? 'unknown' : 'confirmed' } : {}), requirements: record.oilRequirements.state,
    eligible: application === 'confirmed' && validPath && record.oilRequirements.state !== 'conflict', completeness };
}

export function publicFieldRecord(record) {
  const assessment = assessOilEvidence(record);
  if (!assessment.eligible) return null;
  const result = structuredClone(record);
  delete result.researchIssues;
  delete result.completeness;
  const empty = { displacementLiters: null, fuelType: 'unknown', aspiration: 'unknown', allowedSaeViscosities: [],
    industrySpecifications: { acea: [], api: [], ilsac: [] }, requiredManufacturerApprovals: [], preferredManufacturerApprovals: [],
    serviceFillCapacity: null, capacityUnit: null, capacityNote: null, serviceInterval: null, climateLimitations: [],
    emissionsEquipment: { dpf: 'unknown', gpf: 'unknown', catalyst: 'unknown' } };
  const refs = [...record.applicationEvidence.evidenceRefs];
  if (Object.hasOwn(record, 'oemOilSpecifications')) empty.oemOilSpecifications = [];
  for (const field of assessedFields(record)) {
    if (assessment.fields[field] === 'confirmed') refs.push(...record.fieldEvidence[field].evidenceRefs);
    else { result[field] = structuredClone(empty[field]); result.fieldEvidence[field] = { state: assessment.fields[field], evidenceRefs: [] }; }
  }
  function collect(node) { if (node.evidenceRefs) refs.push(...node.evidenceRefs); if (node.conditionRef) refs.push(node.conditionRef); for (const n of node.allOf || node.anyOf || []) collect(n); }
  collect(record.oilRequirements.expression);
  // Preserve explicit locator dependencies, including across composite sources.
  if (record.applicationEvidence.scopeType === 'documentRow') {
    const ctx = context(record), visited = new Set();
    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i], key = `${ref.sourceId}:${ref.locatorId}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const { locator } = ctx.resolve(ref);
      for (const dep of [locator.applicabilityRef, locator.contextRef, locator.tableRow?.documentRef, locator.tableCell?.rowRef]) if (dep) refs.push(dep);
    }
  }
  const used = new Set(refs.map((r) => r.sourceId));
  // Notes-only sources support context, never confirmation of a technical field.
  const notesOnly = s => record.applicationEvidence.scopeType === 'documentRow' && s.fields.length === 1 && s.fields[0] === 'notes';
  result.sources = result.sources.filter((s) => (used.has(s.id) || notesOnly(s)) && s.provenanceStatus === 'confirmed').map((s) => ({ ...s, locators: s.locators.filter((l) => refs.some((r) => r.sourceId === s.id && r.locatorId === l.id) || notesOnly(s) && l.fields.includes('notes')) }));
  result.evidenceAssessment = assessment;
  result.completeness = assessment.completeness;
  return result;
}
