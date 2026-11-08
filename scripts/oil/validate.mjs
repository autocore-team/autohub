import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessOilEvidence, hasFieldAssessment } from './evidence.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const canonicalPath = path.join(root, 'data/oil/canonical.json');
export const schemaPath = path.join(root, 'data/oil/schema.json');
export const allowedStatuses = new Set(['verified', 'corroborated', 'preliminary', 'legacyPending']);
export const officialSourceTypes = new Set(['ownersManual', 'serviceManual', 'technicalBulletin', 'lubricationChart', 'oemServicePortal']);

export function isPublicOilRecord(record) {
  if (!allowedStatuses.has(record.status)) return false;
  if (Object.hasOwn(record, 'oemOilSpecifications') && !hasFieldAssessment(record)) return false;
  if (hasFieldAssessment(record)) {
    if (Object.hasOwn(record, 'researchIssues')) return false;
    try { return assessOilEvidence(record).eligible; } catch { return false; }
  }
  return ['verified', 'corroborated', 'legacyPending'].includes(record.status)
    && !Object.hasOwn(record, 'researchIssues')
    && !record.sources?.some((source) => source.provenanceStatus === 'unconfirmed');
}

const fail = (message) => { throw new Error(message); };
const requireText = (value, label) => { if (typeof value !== 'string' || !value.trim()) fail(`${label} is required`); };
const requireArray = (value, label) => { if (!Array.isArray(value)) fail(`${label} must be an array`); };
const normalize = (value) => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const sourceDomain = (source) => new URL(source.url).hostname.replace(/^www\./, '').toLowerCase();

export function loadCanonical() {
  return JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
}

export function loadReferenceInformation() {
  return JSON.parse(fs.readFileSync(path.join(root, 'data/oil/reference-information.json'), 'utf8'));
}

// Descriptive third-party material is never an evidence source or a technical claim.
export function validateReferenceInformation(entries, records) {
  requireArray(entries, 'referenceInformation');
  const seen = new Set();
  const keys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
  for (const entry of entries) {
    if (!entry || !keys(entry, ['recordId', 'kind', 'documents']) || entry.kind !== 'referenceOnly') fail('Invalid reference-only information');
    if (!records.some(record => record.id === entry.recordId) || seen.has(entry.recordId)) fail('Reference-only record binding is invalid or duplicated');
    seen.add(entry.recordId);
    requireArray(entry.documents, 'reference-only documents');
    if (!entry.documents.length) fail('Reference-only documents are empty');
    for (const document of entry.documents) {
      if (!document || !keys(document, ['title', 'url', 'pdfPages', 'summary'])) fail('Invalid reference-only document');
      requireText(document.title, 'reference-only title');
      let url;
      try { url = new URL(document.url); } catch { fail('Invalid reference-only URL'); }
      if (url.protocol !== 'https:' || url.username || url.password) fail('Reference-only URL must use HTTPS without credentials');
      requireArray(document.pdfPages, 'reference-only PDF pages');
      if (!document.pdfPages.length || document.pdfPages.some(page => !Number.isInteger(page) || page < 1) || new Set(document.pdfPages).size !== document.pdfPages.length) fail('Invalid reference-only PDF pages');
      validateLocalized(document.summary, 'reference-only summary');
    }
  }
}

function validateYears(years, label) {
  if (!years || !Number.isInteger(years.from) || !Number.isInteger(years.to) || years.from < 1886 || years.to > 2100 || years.from > years.to) fail(`${label} has an invalid year range`);
}

function validateLocalized(value, label) {
  if (!value || typeof value !== 'object') fail(`${label} must be localized`);
  for (const language of ['en', 'es', 'fr', 'de']) requireText(value[language], `${label}.${language}`);
}

function validateSource(source, record, index) {
  const label = `${record.id} source ${index + 1}`;
  requireText(source?.publisher, `${label} publisher`);
  requireText(source?.title, `${label} title`);
  requireText(source?.type, `${label} type`);
  requireText(source?.checkedAt, `${label} checkedAt`);
  if (!isDate(source.checkedAt)) fail(`${label} checkedAt is invalid`);
  requireText(source?.url, `${label} URL`);
  let url;
  try { url = new URL(source.url); } catch { fail(`${label} URL is invalid`); }
  if (url.protocol !== 'https:') fail(`${label} URL must use HTTPS`);
  validateYears(source.applicableYears, `${label} applicableYears`);
  requireArray(source.applicableMarket, `${label} applicableMarket`);
  if (!source.applicableMarket.length) fail(`${label} applicableMarket is empty`);
  requireArray(source.fields, `${label} fields`);
  if (!source.fields.length) fail(`${label} fields is empty`);
  if (source.evidenceNotes != null) requireText(source.evidenceNotes, `${label} evidenceNotes`);
  if (source.provenanceStatus != null && !['confirmed', 'unconfirmed'].includes(source.provenanceStatus)) fail(`${label} provenanceStatus is invalid`);
  if (source.pageNumbers != null) {
    requireArray(source.pageNumbers, `${label} pageNumbers`);
    if (!source.pageNumbers.length || source.pageNumbers.some((page) => !Number.isInteger(page) || page < 1) || new Set(source.pageNumbers).size !== source.pageNumbers.length) fail(`${label} pageNumbers must be unique positive integers`);
  }
}

export function validateCanonical(data) {
  if (!data || data.schemaVersion !== 1) fail('Unsupported oil schemaVersion');
  requireArray(data.records, 'records');
  requireArray(data.legacyRecords, 'legacyRecords');
  const researchRecords = data.researchRecords ?? [];
  requireArray(researchRecords, 'researchRecords');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  if (schema?.properties?.schemaVersion?.const !== data.schemaVersion || !schema?.$defs?.record || !schema?.$defs?.source) fail('Oil schema is missing the canonical record/source contract');
  const ids = new Set();
  const semantics = new Set();
  const entries = [...data.records.map((record) => ({ record, researchOnly: false })), ...researchRecords.map((record) => ({ record, researchOnly: true }))];
  for (const { record, researchOnly } of entries) {
    requireText(record.id, 'record id');
    if (ids.has(record.id)) fail(`Duplicate oil id: ${record.id}`);
    ids.add(record.id);
    for (const field of ['make', 'model', 'generation', 'checkedAt']) requireText(record[field], `${record.id} ${field}`);
    if (!hasFieldAssessment(record) || record.engineIdentity?.type === 'engineeringCode') requireText(record.engineCode, `${record.id} engineCode`);
    if (!isDate(record.checkedAt)) fail(`${record.id} checkedAt is invalid`);
    if (Object.hasOwn(record, 'oemOilSpecifications') && !hasFieldAssessment(record)) fail(`${record.id} OEM oil-quality values require field evidence`);
    if (/[\/,;]|\b(?:family|or)\b/i.test(record.engineCode)) fail(`${record.id} combines multiple engine codes`);
    validateYears(record.productionYears, `${record.id} productionYears`);
    if (!allowedStatuses.has(record.status)) fail(`${record.id} has unsupported status ${record.status}`);
    if (researchOnly) {
      if (record.status !== 'preliminary') fail(`${record.id} research records must remain preliminary`);
      requireArray(record.researchIssues, `${record.id} researchIssues`);
      if (!record.researchIssues.length) fail(`${record.id} researchIssues must explain unresolved evidence`);
      for (const issue of record.researchIssues) requireText(issue, `${record.id} research issue`);
    } else {
      if (record.status === 'preliminary' && !hasFieldAssessment(record)) fail(`${record.id} preliminary records must stay in researchRecords, outside production recommendations`);
      if (!isPublicOilRecord(record)) fail(`${record.id} unresolved research evidence cannot enter production recommendations`);
    }
    requireArray(record.sources, `${record.id} sources`);
    if (!record.sources.length) fail(`${record.id} has an empty source list`);
    record.sources.forEach((source, index) => validateSource(source, record, index));
    if (hasFieldAssessment(record)) {
      const assessment = assessOilEvidence(record);
      if (!researchOnly && !assessment.eligible) fail(`${record.id} application and oil requirements must be confirmed for publication`);
    }
    if (record.status === 'verified' && !record.sources.some((source) => officialSourceTypes.has(source.type))) fail(`${record.id} verified status requires an official source`);
    if (record.status === 'corroborated') {
      const publishers = new Set(record.sources.map((source) => normalize(source.publisher)));
      const domains = new Set(record.sources.map(sourceDomain));
      if (record.sources.length < 2 || publishers.size < 2 || domains.size < 2) fail(`${record.id} corroborated status requires two independent sources`);
    }
    if (record.serviceFillCapacity != null && !['L', 'US qt'].includes(record.capacityUnit)) fail(`${record.id} capacity requires a supported unit`);
    if (record.serviceFillCapacity == null && record.capacityUnit != null) fail(`${record.id} capacity unit requires a capacity`);
    for (const field of ['engineAliases', 'market', 'allowedSaeViscosities', 'requiredManufacturerApprovals', 'preferredManufacturerApprovals', 'climateLimitations']) requireArray(record[field], `${record.id} ${field}`);
    if (!record.industrySpecifications || !['acea', 'api', 'ilsac'].every((key) => Array.isArray(record.industrySpecifications[key]))) fail(`${record.id} industry specifications are invalid`);
    if (!record.emissionsEquipment || !['dpf', 'gpf', 'catalyst'].every((key) => ['present', 'absent', 'unknown'].includes(record.emissionsEquipment[key]))) fail(`${record.id} emissions equipment is invalid`);
    validateLocalized(record.notes, `${record.id} notes`);
    if (record.capacityNote != null) validateLocalized(record.capacityNote, `${record.id} capacityNote`);
    const required = new Set(record.requiredManufacturerApprovals.map(normalize));
    for (const approval of record.preferredManufacturerApprovals) if (required.has(normalize(approval))) fail(`${record.id} has a contradictory required/preferred approval`);
    for (const approval of [...record.requiredManufacturerApprovals, ...record.preferredManufacturerApprovals]) if (/\s(?:or|\/)\s|where specified/i.test(approval)) fail(`${record.id} has an unresolved approval claim`);
    const covered = new Set(record.sources.flatMap((source) => source.fields));
    const claimed = [
      [record.allowedSaeViscosities.length, 'allowedSaeViscosities'],
      [Object.values(record.industrySpecifications).some((items) => items.length), 'industrySpecifications'],
      [record.requiredManufacturerApprovals.length, 'requiredManufacturerApprovals'],
      [record.preferredManufacturerApprovals.length, 'preferredManufacturerApprovals'],
      [record.serviceFillCapacity != null, 'serviceFillCapacity'],
      [record.serviceInterval != null, 'serviceInterval'],
      [record.climateLimitations.length, 'climateLimitations'],
      [record.oemOilSpecifications?.length, 'oemOilSpecifications']
    ];
    for (const [present, field] of claimed) if (present && !covered.has(field)) fail(`${record.id} publishes ${field} without source coverage`);
    const semantic = [record.make, record.model, record.generation, record.productionYears.from, record.productionYears.to, record.engineCode ?? `${record.engineIdentity?.type}:${record.engineIdentity?.value}`, [...record.market].sort().join(',')].map(normalize).join('|');
    if (semantics.has(semantic)) fail(`${record.id} duplicates a semantic oil record`);
    semantics.add(semantic);
  }
  const legacyIds = new Set();
  for (const legacy of data.legacyRecords) {
    requireText(legacy.id, 'legacy record id');
    if (legacyIds.has(legacy.id)) fail(`Duplicate legacy oil id: ${legacy.id}`);
    legacyIds.add(legacy.id);
    if (legacy.migrationStatus !== 'legacyPending' || legacy.productionReady !== false) fail(`${legacy.id} legacy migration state is unsafe`);
    requireArray(legacy.migrationIssues, `${legacy.id} migrationIssues`);
    if (!legacy.migrationIssues.length) fail(`${legacy.id} lacks migration issues`);
  }
  if (data.audit.originalRecordCount !== data.legacyRecords.length) fail('Legacy migration count does not match the audit');
  if (data.audit.selectableExactCodeRecordCount !== data.records.length) fail('Selectable record count does not match the audit');
  return {
    records: data.records.length,
    legacyRecords: data.legacyRecords.length,
    researchRecords: researchRecords.length,
    productionRecommendations: data.records.filter((record) => hasFieldAssessment(record) ? isPublicOilRecord(record) : ['verified', 'corroborated'].includes(record.status)).length,
    researchStatuses: researchRecords.reduce((map, record) => { map[record.status] = (map[record.status] || 0) + 1; return map; }, {}),
    statuses: data.records.reduce((map, record) => { map[record.status] = (map[record.status] || 0) + 1; return map; }, {})
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const canonical = loadCanonical();
  validateReferenceInformation(loadReferenceInformation(), canonical.records);
  const summary = validateCanonical(canonical);
  console.log(`Oil data validation passed: ${summary.records} selectable records (${summary.productionRecommendations} production recommendations); ${summary.researchRecords} research records; ${summary.legacyRecords} legacy quarantine records.`);
  console.log(`Statuses: ${Object.entries(summary.statuses).map(([key, value]) => `${key}=${value}`).join(', ')}`);
}
