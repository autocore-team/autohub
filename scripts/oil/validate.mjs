import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const canonicalPath = path.join(root, 'data/oil/canonical.json');
export const schemaPath = path.join(root, 'data/oil/schema.json');
export const allowedStatuses = new Set(['verified', 'corroborated', 'preliminary', 'legacyPending']);
export const officialSourceTypes = new Set(['ownersManual', 'serviceManual', 'technicalBulletin', 'lubricationChart', 'oemServicePortal']);

const fail = (message) => { throw new Error(message); };
const requireText = (value, label) => { if (typeof value !== 'string' || !value.trim()) fail(`${label} is required`); };
const requireArray = (value, label) => { if (!Array.isArray(value)) fail(`${label} must be an array`); };
const normalize = (value) => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const sourceDomain = (source) => new URL(source.url).hostname.replace(/^www\./, '').toLowerCase();

export function loadCanonical() {
  return JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
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
}

export function validateCanonical(data) {
  if (!data || data.schemaVersion !== 1) fail('Unsupported oil schemaVersion');
  requireArray(data.records, 'records');
  requireArray(data.legacyRecords, 'legacyRecords');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  if (schema?.properties?.schemaVersion?.const !== data.schemaVersion || !schema?.$defs?.record || !schema?.$defs?.source) fail('Oil schema is missing the canonical record/source contract');
  const ids = new Set();
  const semantics = new Set();
  for (const record of data.records) {
    requireText(record.id, 'record id');
    if (ids.has(record.id)) fail(`Duplicate oil id: ${record.id}`);
    ids.add(record.id);
    for (const field of ['make', 'model', 'generation', 'engineCode', 'checkedAt']) requireText(record[field], `${record.id} ${field}`);
    if (!isDate(record.checkedAt)) fail(`${record.id} checkedAt is invalid`);
    if (/[\/,;]|\b(?:family|or)\b/i.test(record.engineCode)) fail(`${record.id} combines multiple engine codes`);
    validateYears(record.productionYears, `${record.id} productionYears`);
    if (!allowedStatuses.has(record.status)) fail(`${record.id} has unsupported status ${record.status}`);
    requireArray(record.sources, `${record.id} sources`);
    if (!record.sources.length) fail(`${record.id} has an empty source list`);
    record.sources.forEach((source, index) => validateSource(source, record, index));
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
      [record.climateLimitations.length, 'climateLimitations']
    ];
    for (const [present, field] of claimed) if (present && !covered.has(field)) fail(`${record.id} publishes ${field} without source coverage`);
    const semantic = [record.make, record.model, record.generation, record.productionYears.from, record.productionYears.to, record.engineCode, [...record.market].sort().join(',')].map(normalize).join('|');
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
    statuses: data.records.reduce((map, record) => { map[record.status] = (map[record.status] || 0) + 1; return map; }, {})
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const summary = validateCanonical(loadCanonical());
  console.log(`Oil data validation passed: ${summary.records} selectable exact-code records; ${summary.legacyRecords} legacy records migrated.`);
  console.log(`Statuses: ${Object.entries(summary.statuses).map(([key, value]) => `${key}=${value}`).join(', ')}`);
}
