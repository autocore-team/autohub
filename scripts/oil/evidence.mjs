// Field evidence uses the existing values and sources; it never upgrades record.status.
export const technicalFields = ['engineIdentity', 'displacementLiters', 'fuelType', 'aspiration',
  'allowedSaeViscosities', 'industrySpecifications', 'requiredManufacturerApprovals',
  'preferredManufacturerApprovals', 'serviceFillCapacity', 'capacityUnit', 'capacityNote',
  'serviceInterval', 'climateLimitations', 'emissionsEquipment'];
const states = new Set(['confirmed', 'unknown', 'conflict']);
const official = new Set(['ownersManual', 'serviceManual', 'technicalBulletin', 'lubricationChart', 'oemServicePortal']);
const reviewedHosts = new Set(['techinfo.honda.com', 'crmshonda.my.salesforce-sites.com', 'vpic.nhtsa.dot.gov', 'static.nhtsa.gov', 'www.fordservicecontent.com', 'content.fordpro.com', 'assets.sipb.toyota.com']);
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
    if (!reviewedHosts.has(new URL(source.url).hostname) || !/^[a-f0-9]{64}$/.test(source.documentSha256 || '')) return false;
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
      const supported = ['allowedSaeViscosities', 'industrySpecifications.acea', 'industrySpecifications.api', 'industrySpecifications.ilsac', 'requiredManufacturerApprovals'];
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
      if (op === 'anyOf' && !/\bor\b/i.test(locator.excerpt)) die('anyOf requires alternative wording in its source');
      if (op === 'allOf' && !/\b(and|also|together)\b/i.test(locator.excerpt)) die('allOf requires conjunctive wording in its source');
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
  const ctx = context(record);
  validateIdentity(record, ctx);
  const fields = {};
  for (const field of technicalFields) {
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
  for (const field of technicalFields.filter((f) => fields[f] === 'confirmed')) {
    for (const ref of record.fieldEvidence[field].evidenceRefs) {
      const { source } = ctx.resolve(ref);
      if (source.identityBindingRef) {
        const direct = ctx.sources.get(source.identityBindingRef);
        if (!direct || direct.identityBindingRef || !record.fieldEvidence.engineIdentity.evidenceRefs.some((r) => r.sourceId === direct.id)) die('Invalid supplemental identity binding');
        if (!source.scope.engineClasses?.includes(direct.scope.engineClass)) die('Supplemental evidence does not cover the exact bound engine class');
      } else if (field !== 'engineIdentity' && !source.scope.applicationCodes?.length) die('Technical evidence lacks direct application scope or an identity binding');
    }
  }
  const validPath = validateRequirements(record, ctx);
  const count = Object.values(fields).filter((s) => s === 'confirmed').length;
  const completeness = { state: count === technicalFields.length ? 'complete' : 'partial', confirmedFields: count, totalFields: technicalFields.length };
  if (Object.hasOwn(record, 'completeness') && !equal(record.completeness, completeness)) die('completeness is computed, not manually assigned');
  return { mode: 'fieldAssessed', application, fields, requirements: record.oilRequirements.state,
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
  for (const field of technicalFields) {
    if (assessment.fields[field] === 'confirmed') refs.push(...record.fieldEvidence[field].evidenceRefs);
    else { result[field] = structuredClone(empty[field]); result.fieldEvidence[field] = { state: assessment.fields[field], evidenceRefs: [] }; }
  }
  function collect(node) { if (node.evidenceRefs) refs.push(...node.evidenceRefs); if (node.conditionRef) refs.push(node.conditionRef); for (const n of node.allOf || node.anyOf || []) collect(n); }
  collect(record.oilRequirements.expression);
  const used = new Set(refs.map((r) => r.sourceId));
  result.sources = result.sources.filter((s) => used.has(s.id) && s.provenanceStatus === 'confirmed').map((s) => ({ ...s, locators: s.locators.filter((l) => refs.some((r) => r.sourceId === s.id && r.locatorId === l.id)) }));
  result.evidenceAssessment = assessment;
  result.completeness = assessment.completeness;
  return result;
}
