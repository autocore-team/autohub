import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  REGIONS,
  buildRegionalJs,
  canonicalFingerprint,
  loadBrowserGlobal,
  readSourceData
} from '../../scripts/engines/lib.mjs';
import { engineIdentityCollisionErrors, validateEngineData } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';
import './batch11-semantic.test.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDirectory, '../..');
const html = fs.readFileSync(path.join(root, 'engines.html'), 'utf8');
const coreText = fs.readFileSync(path.join(root, 'assets/js/engine-search-core.js'), 'utf8');
const context = { window: {}, URL };
vm.runInNewContext(coreText, context, { filename: 'engine-search-core.js' });
const core = context.window.D3_ENGINE_SEARCH_CORE;
const sourceData = readSourceData();
const records = sourceData.records;
const languages = ['en', 'es', 'fr', 'de'];
const sourceSchema = JSON.parse(fs.readFileSync(path.join(root, 'data/engines/source/schema.json'), 'utf8'));

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function schemaErrors(value, schema, location = '$', errors = []) {
  if (schema.$ref) {
    const target = schema.$ref.split('/').slice(1).reduce((current, key) => current[key.replaceAll('~1', '/').replaceAll('~0', '~')], sourceSchema);
    return schemaErrors(value, target, location, errors);
  }
  const typeMatches = {
    object: value !== null && typeof value === 'object' && !Array.isArray(value),
    array: Array.isArray(value),
    string: typeof value === 'string',
    integer: Number.isInteger(value),
    number: typeof value === 'number' && Number.isFinite(value),
    boolean: typeof value === 'boolean'
  };
  if (schema.type && !typeMatches[schema.type]) {
    errors.push(`${location} must be ${schema.type}`);
    return errors;
  }
  if (schema.const !== undefined && value !== schema.const) errors.push(`${location} must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${location} is not in enum`);
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${location} is too short`);
    if (schema.pattern && !(new RegExp(schema.pattern)).test(value)) errors.push(`${location} does not match pattern`);
    if (schema.format === 'uri') {
      try { new URL(value); } catch { errors.push(`${location} is not a URI`); }
    }
  }
  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) errors.push(`${location} is below minimum`);
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${location} has too few items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${location} has duplicate items`);
    if (schema.items) value.forEach((item, index) => schemaErrors(item, schema.items, `${location}[${index}]`, errors));
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const required of schema.required || []) if (!Object.hasOwn(value, required)) errors.push(`${location}.${required} is required`);
    for (const [key, child] of Object.entries(schema.properties || {})) {
      if (Object.hasOwn(value, key)) schemaErrors(value[key], child, `${location}.${key}`, errors);
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}));
      for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`${location}.${key} is not allowed`);
    }
  }
  for (const child of schema.allOf || []) schemaErrors(value, child, location, errors);
  if (schema.oneOf) {
    const matches = schema.oneOf.filter((child) => schemaErrors(value, child, location, []).length === 0).length;
    if (matches !== 1) errors.push(`${location} must match exactly one oneOf branch`);
  }
  if (schema.if) {
    const branch = schemaErrors(value, schema.if, location, []).length === 0 ? schema.then : schema.else;
    if (branch) schemaErrors(value, branch, location, errors);
  }
  if (schema.not && schemaErrors(value, schema.not, location, []).length === 0) errors.push(`${location} matches a forbidden schema`);
  return errors;
}

function syntheticDesignationRecord(evidenceBasis = 'official') {
  const requiredFields = [
    'maker', 'code', 'applications', 'years', 'displacement', 'layout',
    'layout.valves', 'layout.camshaftsTotal', 'fuelKey', 'aspirationKey', 'injectionKey',
    'performance.powerKw', 'performance.powerKw.rpm', 'performance.torqueNm', 'performance.torqueNm.rpm'
  ];
  const template = records.find((record) => (
    record.verification?.evidenceBasis === 'official'
    && record.verification?.sourceRefs?.length === 1
    && requiredFields.every((field) => record.verification.sources[0]?.fields?.includes(field))
  ));
  check(template, 'No single-source Tier A template exists for synthetic designation validation');
  const record = structuredClone(template);
  record.id = `synthetic-designation-${evidenceBasis}`;
  record.maker = 'Synthetic Motor Company';
  record.applications = ['Synthetic Model X'];
  record.aliases = [`Quantum ${evidenceBasis}`];
  delete record.code;
  record.identity = {
    type: 'officialPublicDesignation',
    value: evidenceBasis === 'official' ? 'QuantumDrive X1' : 'QuantumDrive X1 Corroborated',
    review: {
      officialPublicationConfirmed: true,
      stableAndDistinct: true,
      genericDescriptionRejected: true,
      materialVariantsSeparated: true,
      notes: ['Synthetic fixture records a completed manual review of the literal manufacturer designation and exact scope.']
    }
  };
  record.verification.evidenceBasis = evidenceBasis;
  record.verification.scope.applications = [...record.applications];
  const identitySource = record.verification.sources[0];
  identitySource.id = 'synthetic-tier-a-identity';
  identitySource.type = 'manufacturer';
  identitySource.evidenceTier = 'A';
  identitySource.fields = identitySource.fields.map((field) => field === 'code' ? 'identity.officialPublicDesignation' : field);
  identitySource.scope.applications = [...record.applications];
  delete identitySource.scope.codes;
  identitySource.scope.designations = [record.identity.value];
  identitySource.pageNotes = ['The manufacturer page publishes the literal designation for Synthetic Model X and the complete record scope.'];
  record.verification.sourceRefs = [identitySource.id];

  if (evidenceBasis === 'corroborated') {
    const identityFields = ['maker', 'identity.officialPublicDesignation', 'aliases', 'applications', 'years'];
    const technicalFields = identitySource.fields.filter((field) => !identityFields.includes(field));
    identitySource.fields = identityFields;
    const tierBSource = (id, publisher, hostname, dataOrigin) => ({
      id,
      type: 'technicalReference',
      evidenceTier: 'B',
      dataOrigin,
      independenceNotes: [`${publisher} maintains an independent editorial dataset.`],
      identityBindingRef: identitySource.id,
      title: `${publisher} technical specification`,
      publisher,
      year: 2025,
      url: `https://${hostname}/synthetic-model-x`,
      page: 1,
      checkedAt: '2026-10-07',
      fields: technicalFields,
      claims: {
        'performance.powerKw': structuredClone(record.performance.powerKw),
        'performance.torqueNm': structuredClone(record.performance.torqueNm)
      },
      pageNotes: ['The exact application table supplies the declared technical fields and performance boundaries.'],
      scope: {
        level: 'exactVariant',
        applications: [...record.applications],
        years: structuredClone(record.verification.scope.years),
        markets: structuredClone(record.verification.scope.markets)
      }
    });
    record.verification.sources.push(
      tierBSource('synthetic-tier-b-one', 'Synthetic Technical Press One', 'synthetic-one.example', 'synthetic-origin-one'),
      tierBSource('synthetic-tier-b-two', 'Synthetic Technical Press Two', 'synthetic-two.example', 'synthetic-origin-two')
    );
    record.verification.sourceRefs.push('synthetic-tier-b-one', 'synthetic-tier-b-two');
  }
  return record;
}

function validateSyntheticDesignation(record) {
  const schemaResult = schemaErrors({ schemaVersion: 1, region: record.regionKey, records: [record] }, sourceSchema);
  check(schemaResult.length === 0, `Synthetic designation fails source schema:\n${schemaResult.join('\n')}`);
  const candidateData = structuredClone(sourceData);
  candidateData.regionFiles.find((regionFile) => regionFile.region === record.regionKey).records.push(record);
  candidateData.records = candidateData.regionFiles.flatMap((regionFile) => regionFile.records);
  const validationErrors = validateEngineData(candidateData).errors;
  check(validationErrors.length === 0, `Synthetic designation fails executable validation:\n${validationErrors.join('\n')}`);
}

const semanticHash = crypto.createHash('sha256').update(canonicalFingerprint(records)).digest('hex');
check(records.length === 921, `Engine count changed: expected 921, found ${records.length}`);
check(
  semanticHash === '470d47d40d34f08bbe9b35749541f747f9ec7e9880bc25609ceb1c4c3a8e096c',
  `Engine semantic hash changed: ${semanticHash}`
);
pass(`engine data count and migrated semantic hash match (${records.length}, ${semanticHash})`);

const baselineRegionCounts = {
  europe: 196,
  japan: 167,
  korea: 49,
  'north-america': 88,
  'south-america': 0
};
const baselineRecords = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(0, baselineRegionCounts[sourceFile.region])
));
const baselineHash = crypto.createHash('sha256').update(canonicalFingerprint(baselineRecords)).digest('hex');
check(baselineRecords.length === 500, `Batch 07a baseline changed: expected 500 records, found ${baselineRecords.length}`);
check(
  baselineHash === '285441e2e4c553d817065f1d10de76cd04299b5266bbfbe1ced83388c3862187',
  `Batch 07a changed an original record or its regional order: ${baselineHash}`
);
pass(`Batch 07a preserves all original 500 records (${baselineHash})`);

const batch07aIds = [
  'mercedes-m111-943',
  'mercedes-m111-958',
  'mercedes-m111-973',
  'mercedes-m111-983',
  'mercedes-m112-960',
  'mercedes-m111-955',
  'mercedes-om611-962-c200',
  'mercedes-om612-962',
  'mercedes-m112-961',
  'mercedes-m111-956'
];
const batch07aRecords = batch07aIds.map((id) => records.find((record) => record.id === id));
const batch07aExpectedLayouts = new Map([
  ['mercedes-m111-943', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m111-958', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m111-973', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m111-983', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m112-960', 'V6 · SOHC per bank · 18 valves · 2 camshafts total'],
  ['mercedes-m111-955', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om611-962-c200', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om612-962', 'I5 · DOHC · 20 valves · 2 camshafts total'],
  ['mercedes-m112-961', 'V6 · SOHC per bank · 18 valves · 2 camshafts total'],
  ['mercedes-m111-956', 'I4 · DOHC · 16 valves · 2 camshafts total']
]);
check(batch07aRecords.every(Boolean), 'Batch 07a is missing one or more expected IDs');
check(new Set(batch07aIds).size === batch07aIds.length, 'Batch 07a expected IDs are not unique');
check(new Set(records.map((record) => record.id)).size === records.length, 'Dataset contains duplicate engine IDs');
for (const record of batch07aRecords) {
  check(record.verification?.status === 'verified', `${record.id} is not verified`);
  check(record.verification?.sourceRefs?.length > 0, `${record.id} does not use strict sourceRefs`);
  check(verificationPolicyErrors(record).length === 0, `${record.id} fails strict verification policy`);
  check(record.layout === batch07aExpectedLayouts.get(record.id), `${record.id} cylinder/valve/camshaft layout changed`);
  const results = core.searchRecords(records, record.code);
  check(results[0]?.id === record.id, `${record.code} is not the top exact-code search result`);
}
const om612 = records.find((record) => record.id === 'mercedes-om612-962');
check(om612.years === '2000-2001', 'OM612.962 must remain scoped before the June 2002 torque change');
check(om612.applications.length === 1 && om612.applications[0].includes('6-speed manual transmission'), 'OM612.962 application must retain its gearbox condition');
check(
  om612.performance.torqueNm.min === 370
    && om612.performance.torqueNm.max === 370
    && om612.performance.torqueNm.rpm.min === 1600
    && om612.performance.torqueNm.rpm.max === 2800,
  'OM612.962 must store only the pre-June 2002 manual-transmission torque specification'
);
check(om612.verification.sources[0].pageNotes.some((note) => note.includes('automatic transmission has 400 N·m at 1,800-2,600 rpm')), 'OM612.962 evidence must preserve the excluded automatic-transmission condition');
pass('Batch 07a valve/camshaft layouts and conditional OM612.962 torque scope pass');
const normalizedIdentity = (value) => String(value).trim().toUpperCase().replace(/\s+/g, ' ');
const identityOwners = new Map();
for (const record of records) {
  for (const identity of [record.code, ...record.aliases].map(normalizedIdentity)) {
    if (!identityOwners.has(identity)) identityOwners.set(identity, new Set());
    identityOwners.get(identity).add(record.id);
  }
}
// Batch 08 locks every permitted repeated-code owner set below. Earlier batch
// assertions continue to require unique aliases while allowing those later,
// application-scoped records to share the exact code token.
const isApplicationScopedCodeRepeat = (record, identity) => (
  identity === normalizedIdentity(record.code) && identityOwners.get(identity).size > 1
);
for (const record of batch07aRecords) {
  for (const identity of [record.code, ...record.aliases].map(normalizedIdentity)) {
    check(identityOwners.get(identity).size === 1, `${record.id} introduces code/alias collision ${identity}`);
  }
}
pass('Batch 07a IDs, strict evidence, exact-code search and code/alias collision checks pass');

const batch07bBaselineRegionCounts = {
  europe: 206,
  japan: 167,
  korea: 49,
  'north-america': 88,
  'south-america': 0
};
const batch07bBaselineRecords = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(0, batch07bBaselineRegionCounts[sourceFile.region])
));
const batch07bBaselineHash = crypto.createHash('sha256').update(canonicalFingerprint(batch07bBaselineRecords)).digest('hex');
check(batch07bBaselineRecords.length === 510, `Batch 07b baseline changed: expected 510 records, found ${batch07bBaselineRecords.length}`);
check(
  batch07bBaselineHash === '42c983d3fb6841f2d1b5ba3c2c15a99e804d6787e0c372ff2501f02f5de9cd3c',
  `Batch 07b changed an original record or its regional order: ${batch07bBaselineHash}`
);
pass(`Batch 07b preserves all original 510 records (${batch07bBaselineHash})`);

const batch07bIds = [
  'mercedes-om605-962',
  'mercedes-om612-990',
  'mercedes-m271-946',
  'mercedes-m271-940',
  'mercedes-m271-942',
  'mercedes-m271-948',
  'mercedes-om646-962',
  'mercedes-om646-963',
  'mercedes-om648-960',
  'mercedes-m275-950',
  'mercedes-m113-991',
  'mercedes-m275-980',
  'mercedes-om642-931',
  'mercedes-om629-911',
  'mercedes-m275-953'
];
const batch07bExpectedLayouts = new Map([
  ['mercedes-om605-962', 'I5 · DOHC · 20 valves · 2 camshafts total'],
  ['mercedes-om612-990', 'I5 · DOHC · 20 valves · 2 camshafts total'],
  ['mercedes-m271-946', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m271-940', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m271-942', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m271-948', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om646-962', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om646-963', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om648-960', 'I6 · DOHC · 24 valves · 2 camshafts total'],
  ['mercedes-m275-950', 'V12 · SOHC per bank · 36 valves · 2 camshafts total'],
  ['mercedes-m113-991', 'V8 · SOHC per bank · 24 valves · 2 camshafts total'],
  ['mercedes-m275-980', 'V12 · SOHC per bank · 36 valves · 2 camshafts total'],
  ['mercedes-om642-931', 'V6 · DOHC per bank · 24 valves · 4 camshafts total'],
  ['mercedes-om629-911', 'V8 · DOHC per bank · 32 valves · 4 camshafts total'],
  ['mercedes-m275-953', 'V12 · SOHC per bank · 36 valves · 2 camshafts total']
]);
const batch07bRecords = batch07bIds.map((id) => records.find((record) => record.id === id));
check(batch07bRecords.every(Boolean), 'Batch 07b is missing one or more expected IDs');
check(new Set(batch07bIds).size === batch07bIds.length, 'Batch 07b expected IDs are not unique');
for (const record of batch07bRecords) {
  check(record.verification?.status === 'verified', `${record.id} is not verified`);
  check(record.verification?.sourceRefs?.length === 1, `${record.id} does not use one strict official sourceRef`);
  check(verificationPolicyErrors(record).length === 0, `${record.id} fails strict verification policy`);
  check(record.verification.sources[0].scope.level === 'exactVariant', `${record.id} is not direct exactVariant evidence`);
  check(record.verification.scope.markets.length === 1 && record.verification.scope.markets[0] === 'Unspecified', `${record.id} must retain an explicitly unspecified record market`);
  check(record.verification.sources[0].scope.markets.length === 1 && record.verification.sources[0].scope.markets[0] === 'Unspecified', `${record.id} must retain an explicitly unspecified source market`);
  check(record.verification.sources[0].pageNotes.some((note) => note.includes('does not specify a sales market') && note.includes('does not claim worldwide')), `${record.id} evidence must explain the unknown market scope`);
  check(record.layout === batch07bExpectedLayouts.get(record.id), `${record.id} cylinder/valve/camshaft layout changed`);
  check(record.verification.sources[0].pageNotes.some((note) => note.includes('valves total') && /camshafts? total/.test(note)), `${record.id} evidence does not expose the valve/camshaft derivation`);
  check(core.searchRecords(records, record.code)[0]?.id === record.id, `${record.code} is not the top exact-code search result`);
  for (const identity of [record.code, ...record.aliases].map(normalizedIdentity)) {
    check(isApplicationScopedCodeRepeat(record, identity) || identityOwners.get(identity).size === 1, `${record.id} introduces code/alias collision ${identity}`);
  }
}
const om605 = records.find((record) => record.id === 'mercedes-om605-962');
check(om605.injectionKey === 'indirectInjection', 'OM605.962 must retain indirect injection');
const om612Amg = records.find((record) => record.id === 'mercedes-om612-990');
check(om612Amg.applications[0].includes('5-speed automatic transmission'), 'OM612.990 application lost its gearbox condition');
check(om612Amg.performance.torqueNm.min === 540 && om612Amg.performance.torqueNm.rpm.min === 2000, 'OM612.990 gearbox-qualified torque changed');
const om642 = records.find((record) => record.id === 'mercedes-om642-931');
check(om642.years === '2006-2007', 'OM642.931 must remain before the December 2008 torque-rpm change');
check(om642.performance.torqueNm.rpm.min === 1600 && om642.performance.torqueNm.rpm.max === 2800, 'OM642.931 stores the wrong time-qualified torque rpm band');
check(om642.verification.sources[0].pageNotes.some((note) => note.includes('From December 2008')), 'OM642.931 evidence must preserve the excluded December 2008 condition');
pass('Batch 07b strict evidence, collision, construction and conditional performance checks pass');

const batch07cBaselineRegionCounts = {
  europe: 221,
  japan: 167,
  korea: 49,
  'north-america': 88,
  'south-america': 0
};
const batch07cBaselineRecords = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(0, batch07cBaselineRegionCounts[sourceFile.region])
));
const batch07cBaselineHash = crypto.createHash('sha256').update(canonicalFingerprint(batch07cBaselineRecords)).digest('hex');
check(batch07cBaselineRecords.length === 525, `Batch 07c baseline changed: expected 525 records, found ${batch07cBaselineRecords.length}`);
check(
  batch07cBaselineHash === '570a5ace56bb5baedf17585ff318f2e613a075c89ab2de78798cbb1224b375e2',
  `Batch 07c changed an original record or its regional order: ${batch07cBaselineHash}`
);
pass(`Batch 07c preserves all original 525 records (${batch07cBaselineHash})`);

const batch07cIds = [
  'mercedes-m271-950',
  'mercedes-m271-941',
  'mercedes-om646-952',
  'mercedes-om646-953',
  'mercedes-m271-956',
  'mercedes-m275-951',
  'mercedes-m113-992',
  'mercedes-m275-981',
  'mercedes-om668-941',
  'mercedes-om668-940',
  'mercedes-om668-942',
  'mercedes-om640-942',
  'mercedes-om640-940',
  'mercedes-om640-941',
  'mercedes-m266-980',
  'mercedes-om646-811',
  'mercedes-om651-913',
  'mercedes-om651-911',
  'mercedes-m271-820',
  'mercedes-m271-860'
];
const batch07cExpectedLayouts = new Map([
  ['mercedes-m271-950', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m271-941', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om646-952', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om646-953', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m271-956', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m275-951', 'V12 · SOHC per bank · 36 valves · 2 camshafts total'],
  ['mercedes-m113-992', 'V8 · SOHC per bank · 24 valves · 2 camshafts total'],
  ['mercedes-m275-981', 'V12 · SOHC per bank · 36 valves · 2 camshafts total'],
  ['mercedes-om668-941', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om668-940', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om668-942', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om640-942', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om640-940', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om640-941', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m266-980', 'I4 · SOHC · 8 valves · 1 camshaft total'],
  ['mercedes-om646-811', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om651-913', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om651-911', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m271-820', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m271-860', 'I4 · DOHC · 16 valves · 2 camshafts total']
]);
const batch07cRecords = batch07cIds.map((id) => records.find((record) => record.id === id));
check(batch07cRecords.every(Boolean), 'Batch 07c is missing one or more expected IDs');
check(new Set(batch07cIds).size === batch07cIds.length, 'Batch 07c expected IDs are not unique');
for (const record of batch07cRecords) {
  check(record.verification?.status === 'verified', `${record.id} is not verified`);
  check(record.verification?.sourceRefs?.length === 1, `${record.id} does not use one strict official sourceRef`);
  check(verificationPolicyErrors(record).length === 0, `${record.id} fails strict verification policy`);
  check(record.verification.sources[0].scope.level === 'exactVariant', `${record.id} is not direct exactVariant evidence`);
  check(record.verification.scope.markets.length === 1 && record.verification.scope.markets[0] === 'Unspecified', `${record.id} must retain an explicitly unspecified record market`);
  check(record.verification.sources[0].scope.markets.length === 1 && record.verification.sources[0].scope.markets[0] === 'Unspecified', `${record.id} must retain an explicitly unspecified source market`);
  check(record.verification.sources[0].pageNotes.some((note) => note.includes('does not specify a sales market') && note.includes('does not claim worldwide')), `${record.id} evidence must explain the unknown market scope`);
  check(record.layout === batch07cExpectedLayouts.get(record.id), `${record.id} cylinder/valve/camshaft layout changed`);
  check(record.verification.sources[0].pageNotes.some((note) => note.includes('valves total') && /camshafts? total/.test(note)), `${record.id} evidence does not expose the valve/camshaft derivation`);
  check(core.searchRecords(records, record.code)[0]?.id === record.id, `${record.code} is not the top exact-code search result`);
  for (const identity of [record.code, ...record.aliases].map(normalizedIdentity)) {
    check(isApplicationScopedCodeRepeat(record, identity) || identityOwners.get(identity).size === 1, `${record.id} introduces code/alias collision ${identity}`);
  }
}
const sl55 = records.find((record) => record.id === 'mercedes-m113-992');
check(sl55.years === '2003-2005', 'M113.992 must remain inside the from-June-2002 rated-speed condition');
check(sl55.verification.sources[0].pageNotes.some((note) => note.includes('applies from June 2002')), 'M113.992 evidence must preserve its rated-speed date condition');
pass('Batch 07c strict direct evidence, collision, construction, market and period checks pass');

const batch07dBaselineRegionCounts = {
  europe: 241,
  japan: 167,
  korea: 49,
  'north-america': 88,
  'south-america': 0
};
const batch07dBaselineRecords = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(0, batch07dBaselineRegionCounts[sourceFile.region])
));
const batch07dBaselineHash = crypto.createHash('sha256').update(canonicalFingerprint(batch07dBaselineRecords)).digest('hex');
check(batch07dBaselineRecords.length === 545, `Batch 07d baseline changed: expected 545 records, found ${batch07dBaselineRecords.length}`);
check(
  batch07dBaselineHash === 'b4bc48a819e02a4c679db5e93475c6e09dd485583d3821908a302a16092aff46',
  `Batch 07d changed an original record or its regional order: ${batch07dBaselineHash}`
);
pass(`Batch 07d preserves all original 545 records (${batch07dBaselineHash})`);

const batch07dIds = [
  'toyota-fa20-gt86-2017',
  'toyota-1nd-tv-auris-2015',
  'toyota-1ww-auris-2015',
  'toyota-1ad-ftv-auris-2007',
  'toyota-2ad-fhv-auris-2007',
  'lexus-8ar-fts-is200t-2015',
  'mazda-l3-vdt-atenza-2005',
  'mitsubishi-4m41-pajero-1999',
  'mitsubishi-4b40-destinator-2025',
  'mitsubishi-4n16-triton-2023',
  'mazda-sh-vptr-atenza-2016',
  'lexus-2ur-gse-rcf-2022',
  'mercedes-om642-830',
  'mercedes-om642-832',
  'mercedes-om642-960',
  'mercedes-om642-961',
  'mercedes-om651-912',
  'mercedes-om651-961',
  'mercedes-om651-924',
  'mercedes-m271-952'
];
const batch07dExpectedLayouts = new Map([
  ['toyota-fa20-gt86-2017', 'Boxer-4 · DOHC per bank · 16 valves · 4 camshafts total'],
  ['toyota-1nd-tv-auris-2015', 'I4 · SOHC · 8 valves · 1 camshaft total'],
  ['toyota-1ww-auris-2015', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['toyota-1ad-ftv-auris-2007', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['toyota-2ad-fhv-auris-2007', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['lexus-8ar-fts-is200t-2015', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mazda-l3-vdt-atenza-2005', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mitsubishi-4m41-pajero-1999', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mitsubishi-4b40-destinator-2025', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mitsubishi-4n16-triton-2023', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mazda-sh-vptr-atenza-2016', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['lexus-2ur-gse-rcf-2022', 'V8 · DOHC per bank · 32 valves · 4 camshafts total'],
  ['mercedes-om642-830', 'V6 · DOHC per bank · 24 valves · 4 camshafts total'],
  ['mercedes-om642-832', 'V6 · DOHC per bank · 24 valves · 4 camshafts total'],
  ['mercedes-om642-960', 'V6 · DOHC per bank · 24 valves · 4 camshafts total'],
  ['mercedes-om642-961', 'V6 · DOHC per bank · 24 valves · 4 camshafts total'],
  ['mercedes-om651-912', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om651-961', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-om651-924', 'I4 · DOHC · 16 valves · 2 camshafts total'],
  ['mercedes-m271-952', 'I4 · DOHC · 16 valves · 2 camshafts total']
]);
const batch07dRecords = batch07dIds.map((id) => records.find((record) => record.id === id));
check(batch07dRecords.every(Boolean), 'Batch 07d is missing one or more expected IDs');
check(new Set(batch07dIds).size === batch07dIds.length, 'Batch 07d expected IDs are not unique');
for (const record of batch07dRecords) {
  check(record.verification?.status === 'verified', `${record.id} is not verified`);
  check(record.verification?.sourceRefs?.length === 1, `${record.id} does not use one strict official sourceRef`);
  check(verificationPolicyErrors(record).length === 0, `${record.id} fails strict verification policy`);
  check(record.verification.sources[0].scope.level === 'exactVariant', `${record.id} is not direct exactVariant evidence`);
  check(record.layout === batch07dExpectedLayouts.get(record.id), `${record.id} cylinder/valve/camshaft layout changed`);
  check(record.verification.sources[0].pageNotes.some((note) => note.includes('valve') && /camshafts? total/.test(note)), `${record.id} evidence does not expose valve/camshaft totals`);
  const exactResults = core.searchRecords(records, record.code);
  if (record.id === 'lexus-2ur-gse-rcf-2022') {
    check(exactResults.some((result) => result.id === record.id), '2UR-GSE UK 2022 specification is missing from exact-code search');
  } else {
    check(exactResults[0]?.id === record.id, `${record.code} is not the top exact-code search result`);
  }
  for (const identity of [record.code, ...record.aliases].map(normalizedIdentity)) {
    if (record.id === 'lexus-2ur-gse-rcf-2022' && identity === '2UR-GSE') {
      check(JSON.stringify([...identityOwners.get(identity)].sort()) === JSON.stringify(['lexus-2ur-gse','lexus-2ur-gse-rcf-2022']), '2UR-GSE has an unexplained identity owner');
    } else {
      check(isApplicationScopedCodeRepeat(record, identity) || identityOwners.get(identity).size === 1, `${record.id} introduces code/alias collision ${identity}`);
    }
  }
}
check(batch07dRecords.filter((record) => record.maker !== 'Mercedes-Benz').length === 12, 'Batch 07d must retain 12 non-Mercedes records');
check(batch07dRecords.filter((record) => record.maker === 'Mercedes-Benz').length === 8, 'Batch 07d Mercedes reserve must remain capped at eight records');
check(batch07dRecords.filter((record) => record.maker === 'Mercedes-Benz').every((record) => record.verification.scope.markets[0] === 'Unspecified'), 'Batch 07d Mercedes archive scopes must remain Unspecified');
check(records.find((record) => record.id === 'mitsubishi-4n16-triton-2023').applications[0].includes('high-output'), '4N16 must retain its high-output calibration scope');
check(records.find((record) => record.id === 'mercedes-om651-924').verification.sources[0].pageNotes.some((note) => note.includes('excluding the separately published electric and system ratings')), 'OM651.924 must retain combustion-engine-only performance scope');
pass('Batch 07d strict direct evidence, preservation, diversity, collision, construction and scope checks pass');

const batch08BaselineRegionCounts = {
  europe: 249,
  japan: 179,
  korea: 49,
  'north-america': 88,
  'south-america': 0
};
const batch08BaselineRecords = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(0, batch08BaselineRegionCounts[sourceFile.region])
));
const batch08BaselineHash = crypto.createHash('sha256').update(canonicalFingerprint(batch08BaselineRecords)).digest('hex');
check(batch08BaselineRecords.length === 565, `Batch 08 baseline changed: expected 565 records, found ${batch08BaselineRecords.length}`);
check(
  batch08BaselineHash === '5424d6844589448b0dc7f771f7613c5b80a172f0018b03ac1048cc78ababbf62',
  `Batch 08 changed an original record or its regional order: ${batch08BaselineHash}`
);

const batch08Records = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(batch08BaselineRegionCounts[sourceFile.region], ({
    europe: 345,
    japan: 183,
    korea: 49,
    'north-america': 88,
    'south-america': 0
  })[sourceFile.region])
));
check(batch08Records.length === 100, `Batch 08 must add exactly 100 records, found ${batch08Records.length}`);
const batch08IdHash = crypto.createHash('sha256').update(batch08Records.map((record) => record.id).join('\n')).digest('hex');
check(batch08IdHash === '6d73277858d8377c570811c4215992a6767759ff00b9695b11d548d75cb15a6a', `Batch 08 ID set/order changed: ${batch08IdHash}`);
check(batch08Records.filter((record) => record.regionKey === 'europe').length === 96, 'Batch 08 Europe count must remain 96');
check(batch08Records.filter((record) => record.regionKey === 'japan').length === 4, 'Batch 08 Japan count must remain 4');
check(batch08Records.filter((record) => record.maker === 'Mercedes-Benz').length === 96, 'Batch 08 Mercedes-Benz count must remain 96');
check(batch08Records.filter((record) => record.maker === 'Mazda').length === 3, 'Batch 08 Mazda count must remain 3');
check(batch08Records.filter((record) => record.maker === 'Toyota').length === 1, 'Batch 08 Toyota count must remain 1');

for (const record of batch08Records) {
  check(record.verification?.status === 'verified', `${record.id} is not verified`);
  check(['official', 'corroborated'].includes(record.verification?.evidenceBasis), `${record.id} has no strict evidence basis`);
  check(record.verification?.sourceRefs?.length > 0, `${record.id} has no strict sourceRefs`);
  check(verificationPolicyErrors(record).length === 0, `${record.id} fails tiered strict verification policy: ${verificationPolicyErrors(record).join('; ')}`);
  check(/\b\d+ valves\b/.test(record.layout), `${record.id} does not expose total valves`);
  check(/\b\d+ camshafts? total\b/.test(record.layout), `${record.id} does not expose total camshafts`);
  check(record.verification.sources.every((source) => ['A', 'B', 'C'].includes(source.evidenceTier)), `${record.id} has an unclassified evidence source`);
  check(record.verification.sources.every((source) => source.pageNotes?.length > 0 && source.fields?.length > 0), `${record.id} has evidence without notes or declared coverage`);
  check(record.verification.sourceRefs.every((sourceRef) => record.verification.sources.some((source) => source.id === sourceRef)), `${record.id} has an unresolved sourceRef`);
  check(record.verification.sources.every((source) => source.scope?.codes?.includes(record.code) && !source.identityBindingRef), `${record.id} must retain direct exact-code evidence`);
  check(core.searchRecords(records, record.code).some((result) => result.id === record.id), `${record.id} is missing from exact-code search`);
  for (const alias of record.aliases.map(normalizedIdentity)) {
    check(identityOwners.get(alias).size === 1, `${record.id} introduces alias collision ${alias}`);
  }
}
check(batch08Records.every((record) => record.verification.evidenceBasis === 'official'), 'Batch 08 must retain 100 official evidence-basis records');
check(batch08Records.every((record) => record.verification.sources.every((source) => source.evidenceTier === 'A')), 'Batch 08 must retain Tier A sources only');
check(batch08Records.filter((record) => record.maker === 'Mercedes-Benz').every((record) => record.verification.scope.markets[0] === 'Unspecified'), 'Batch 08 Mercedes archive scopes must remain Unspecified');
check(batch08Records.filter((record) => record.maker !== 'Mercedes-Benz').every((record) => record.verification.scope.markets[0] === 'Japan'), 'Batch 08 Japan manufacturer scopes must remain Japan');

const batch08RepeatedCodeOwners = {};
const batch08OwnerUniverse = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(0, ({
    europe: 345,
    japan: 183,
    korea: 49,
    'north-america': 88,
    'south-america': 0
  })[sourceFile.region])
));
for (const record of batch08Records) {
  const owners = batch08OwnerUniverse.filter((candidate) => normalizedIdentity(candidate.code) === normalizedIdentity(record.code)).map((candidate) => candidate.id).sort();
  if (owners.length > 1) batch08RepeatedCodeOwners[record.code] = owners;
}
const repeatedOwnersHash = crypto.createHash('sha256')
  .update(JSON.stringify(Object.fromEntries(Object.entries(batch08RepeatedCodeOwners).sort())))
  .digest('hex');
check(repeatedOwnersHash === '99534adb45c62e880ffb7f5ebc4aff3c27c0d103b46c4a381daea3b7c1220b2d', `Batch 08 documented repeated-code owners changed: ${repeatedOwnersHash}`);
const l3Records = batch08Records.filter((record) => record.code === 'L3-VDT');
check(new Set(l3Records.map((record) => JSON.stringify(record.performance))).size === 3, 'Batch 08 L3-VDT application calibrations were merged or duplicated');
check(batch08Records.find((record) => record.id === 'toyota-g16e-gts-gr-yaris-2020')?.performance.torqueNm.rpm.max === 4600, 'GR Yaris G16E-GTS scope lost its exact torque-speed boundary');
pass(`Batch 08 preserves the original 565 records and validates 100 tiered strict records (${batch08BaselineHash})`);

const batch09BaselineRegionCounts = {
  europe: 345,
  japan: 183,
  korea: 49,
  'north-america': 88,
  'south-america': 0
};
const batch09BaselineRecords = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(0, batch09BaselineRegionCounts[sourceFile.region])
));
const batch09BaselineHash = crypto.createHash('sha256').update(canonicalFingerprint(batch09BaselineRecords)).digest('hex');
check(batch09BaselineRecords.length === 665, `Batch 09 baseline changed: expected 665 records, found ${batch09BaselineRecords.length}`);
check(
  batch09BaselineHash === 'b9be450558bdb439f60fa67c1d338c565144559aa8653f8623ff9d505a96b16d',
  `Batch 09 changed an original record or its regional order: ${batch09BaselineHash}`
);

const batch09Records = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(batch09BaselineRegionCounts[sourceFile.region], ({
    europe: 345,
    japan: 282,
    korea: 50,
    'north-america': 88,
    'south-america': 0
  })[sourceFile.region])
));
const batch09ExpectedMakerCounts = new Map([
  ['Toyota', 20],
  ['Lexus', 20],
  ['Subaru', 15],
  ['Suzuki', 15],
  ['Honda', 14],
  ['Mazda', 8],
  ['Mitsubishi', 7],
  ['Hyundai Motor Company', 1]
]);
check(batch09Records.length === 100, `Batch 09 must add exactly 100 records, found ${batch09Records.length}`);
const batch09IdHash = crypto.createHash('sha256').update(batch09Records.map((record) => record.id).join('\n')).digest('hex');
check(batch09IdHash === 'f8e2df83559c7469b41d5d388508db9a1c965a7f8baf93d5209492166b0c70bb', `Batch 09 ID set/order changed: ${batch09IdHash}`);
check(new Set(batch09Records.map((record) => record.maker)).size === 8, 'Batch 09 must retain eight manufacturer groups');
check(batch09Records.every((record) => record.regionKey !== 'europe'), 'Batch 09 must retain at least 50 records outside Europe');
for (const [maker, count] of batch09ExpectedMakerCounts) {
  check(batch09Records.filter((record) => record.maker === maker).length === count, `Batch 09 ${maker} count must remain ${count}`);
  check(count <= 40, `Batch 09 ${maker} exceeds the per-group cap`);
}
for (const record of batch09Records) {
  check(record.verification?.status === 'verified', `${record.id} is not verified`);
  check(record.verification?.evidenceBasis === 'official', `${record.id} is not on the official evidence path`);
  check(verificationPolicyErrors(record).length === 0, `${record.id} fails tiered strict verification policy: ${verificationPolicyErrors(record).join('; ')}`);
  check(/\b\d+ valves\b/.test(record.layout), `${record.id} does not expose total valves`);
  check(/\b\d+ camshafts? total\b/.test(record.layout), `${record.id} does not expose total camshafts`);
  check(record.verification.sources.every((source) => source.evidenceTier === 'A'), `${record.id} contains a non-Tier-A source`);
  check(record.verification.sources.every((source) => source.scope?.level === 'exactVariant' && source.scope.codes?.includes(record.code)), `${record.id} lacks direct exact-variant code evidence`);
  check(record.verification.sources.every((source) => source.pageNotes?.length > 0 && source.fields?.length > 0), `${record.id} has incomplete evidence notes`);
  check(core.searchRecords(records, record.code).some((result) => result.id === record.id), `${record.id} is missing from exact-code search`);
  for (const alias of record.aliases.map(normalizedIdentity)) {
    check(identityOwners.get(alias).size === 1, `${record.id} introduces alias collision ${alias}`);
  }
}
check(batch09Records.filter((record) => record.regionKey === 'japan').length === 99, 'Batch 09 Japan count must remain 99');
check(batch09Records.filter((record) => record.regionKey === 'korea').length === 1, 'Batch 09 Korea count must remain 1');
pass(`Batch 09 preserves the original 665 records and validates 100 diverse Tier A records (${batch09BaselineHash})`);

const batch10BaselineRegionCounts = {
  europe: 345,
  japan: 282,
  korea: 50,
  'north-america': 88,
  'south-america': 0
};
const batch10BaselineRecords = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(0, batch10BaselineRegionCounts[sourceFile.region])
));
const batch10BaselineHash = crypto.createHash('sha256').update(canonicalFingerprint(batch10BaselineRecords)).digest('hex');
check(batch10BaselineRecords.length === 765, `Batch 10 baseline changed: expected 765 records, found ${batch10BaselineRecords.length}`);
check(
  batch10BaselineHash === 'df242a63c06cad119811c381ce930da3652dc62d0f1dfda1120034ac87af9fe1',
  `Batch 10 changed an original record or its regional order: ${batch10BaselineHash}`
);

const batch10Records = sourceData.regionFiles.flatMap((sourceFile) => (
  sourceFile.records.slice(batch10BaselineRegionCounts[sourceFile.region], ({
    europe: 345, japan: 291, korea: 50, 'north-america': 105, 'south-america': 0
  })[sourceFile.region])
));
const batch10ExpectedMakerCounts = new Map([
  ['Subaru', 9],
  ['Nissan', 14],
  ['INFINITI', 3]
]);
check(batch10Records.length === 26, `Reconciled Batch 10 must retain exactly 26 honest records, found ${batch10Records.length}`);
const batch10IdHash = crypto.createHash('sha256').update(batch10Records.map((record) => record.id).join('\n')).digest('hex');
check(batch10IdHash === '4741ed84c70d023553e1454a25f435ba8bb0fdb8f3ef48cdb4a592a8337ee1c3', `Batch 10 ID set/order changed: ${batch10IdHash}`);
check(new Set(batch10Records.map((record) => record.maker)).size === 3, 'Reconciled Batch 10 must retain three manufacturer groups');
for (const [maker, count] of batch10ExpectedMakerCounts) {
  check(batch10Records.filter((record) => record.maker === maker).length === count, `Batch 10 ${maker} count must remain ${count}`);
}
const requiredBatch10Fields = new Set([
  'maker', 'code', 'aliases', 'applications', 'years', 'displacement', 'layout',
  'layout.valves', 'layout.camshaftsTotal', 'fuelKey', 'aspirationKey', 'injectionKey',
  'performance.powerKw', 'performance.powerKw.rpm', 'performance.torqueNm', 'performance.torqueNm.rpm'
]);
for (const record of batch10Records) {
  check(record.verification?.status === 'verified', `${record.id} is not verified`);
  check(record.verification?.evidenceBasis === 'official', `${record.id} is not on the official evidence path`);
  check(record.verification?.sourceRefs?.length === 1, `${record.id} must retain one direct sourceRef`);
  check(verificationPolicyErrors(record).length === 0, `${record.id} fails tiered strict verification policy: ${verificationPolicyErrors(record).join('; ')}`);
  check(/\b\d+ valves\b/.test(record.layout), `${record.id} does not expose total valves`);
  check(/\b\d+ camshafts? total\b/.test(record.layout), `${record.id} does not expose total camshafts`);
  check(record.verification.sources.every((source) => source.evidenceTier === 'A'), `${record.id} contains a non-Tier-A source`);
  check(record.verification.sources.every((source) => source.scope?.level === 'exactVariant' && source.scope.codes?.includes(record.code)), `${record.id} lacks direct exact-variant code evidence`);
  check(record.verification.sources.every((source) => !source.identityBindingRef), `${record.id} unexpectedly uses bridge evidence`);
  check(record.verification.sources.every((source) => [...requiredBatch10Fields].every((field) => source.fields.includes(field))), `${record.id} source does not cover every required field`);
  check(record.verification.sources.every((source) => JSON.stringify(source.scope.applications) === JSON.stringify(record.verification.scope.applications)), `${record.id} source/application scope diverged`);
  check(record.verification.sources.every((source) => JSON.stringify(source.scope.years) === JSON.stringify(record.verification.scope.years)), `${record.id} source/year scope diverged`);
  check(record.verification.sources.every((source) => JSON.stringify(source.scope.markets) === JSON.stringify(record.verification.scope.markets)), `${record.id} source/market scope diverged`);
  check(core.searchRecords(records, record.code).some((result) => result.id === record.id), `${record.id} is missing from exact-code search`);
  for (const alias of record.aliases.map(normalizedIdentity)) {
    check(identityOwners.get(alias).size === 1, `${record.id} introduces alias collision ${alias}`);
  }
}
check(batch10Records.filter((record) => record.regionKey === 'north-america').length === 17, 'Batch 10 North America count must remain 17');
check(batch10Records.filter((record) => record.regionKey === 'japan').length === 9, 'Batch 10 Japan count must remain 9');
check(batch10Records.every((record) => record.regionKey !== 'europe' && record.regionKey !== 'south-america'), 'Batch 10 contains an unexpected region');

const batch10ScopeMetadata = new Map([
  ['batch10-subaru-forester-premium-s-hev-ex-10157606', { baseModel: 'Subaru Forester S:HEV' }],
  ['batch10-subaru-impreza-g4-1-6i-l-eyesight-s-style-10118148', { baseModel: 'Subaru Impreza G4' }],
  ['batch10-subaru-subaru-xv-1-6i-l-eyesight-10127607', { baseModel: 'Subaru XV' }],
  ['batch10-subaru-levorg-layback-black-selection-10163624', { baseModel: 'Subaru Levorg Layback' }],
  ['batch10-subaru-wrx-s4-sti-sport-sharp-10162872', { baseModel: 'Subaru WRX S4', materialDifference: 'FA24 Sharp torque calibration: 350 N-m at 2,000-5,200 rpm' }],
  ['batch10-subaru-wrx-s4-sti-sport-r-ex-10155633', { baseModel: 'Subaru WRX S4', materialDifference: 'FA24 standard torque calibration: 375 N-m at 2,000-4,800 rpm' }],
  ['batch10-subaru-impreza-g4-1-6i-l-10100091', { baseModel: 'Subaru Impreza G4', materialDifference: '2015 calibration: power at 5,600 rpm and torque at 4,000 rpm' }],
  ['batch10-subaru-legacy-outback-base-grade-10111520', { baseModel: 'Subaru Legacy Outback' }],
  ['batch10-subaru-levorg-1-6-sti-sport-eyesight-10104617', { baseModel: 'Subaru Levorg' }],
  ['batch10-nissan-hr16de-versa-2025', { baseModel: 'Nissan Versa' }],
  ['batch10-nissan-kr15ddt-rogue-2025', { baseModel: 'Nissan Rogue' }],
  ['batch10-nissan-pr25dd-altima-fwd-2025', { baseModel: 'Nissan Altima', materialDifference: 'FWD calibration: 140 kW and 244 N-m' }],
  ['batch10-nissan-pr25dd-altima-awd-2025', { baseModel: 'Nissan Altima', materialDifference: 'AWD calibration: 136 kW and 241 N-m' }],
  ['batch10-nissan-vr30ddtt-z-standard-2024', { baseModel: 'Nissan Z', materialDifference: 'Sport/Performance calibration: 298 kW and 475 N-m' }],
  ['batch10-nissan-vr30ddtt-z-nismo-2024', { baseModel: 'Nissan Z', materialDifference: 'NISMO calibration: 313 kW and 521 N-m' }],
  ['batch10-nissan-mr20dd-sentra-2025', { baseModel: 'Nissan Sentra' }],
  ['batch10-infiniti-vk56vd-qx80-2024', { baseModel: 'INFINITI QX80', materialDifference: '2024 naturally aspirated VK56VD generation' }],
  ['batch10-infiniti-vr35ddtt-qx80-2025', { baseModel: 'INFINITI QX80', materialDifference: '2025 twin-turbo VR35DDTT generation' }],
  ['batch10-nissan-vq38-frontier-2025', { baseModel: 'Nissan Frontier' }],
  ['batch10-nissan-vq35dd-pathfinder-standard-2025', { baseModel: 'Nissan Pathfinder', materialDifference: 'standard calibration: 212 kW and 351 N-m' }],
  ['batch10-nissan-vq35dd-pathfinder-rock-creek-2025', { baseModel: 'Nissan Pathfinder', materialDifference: 'Rock Creek calibration: 220 kW and 366 N-m' }],
  ['batch10-nissan-vr35ddtt-armada-2025', { baseModel: 'Nissan Armada' }],
  ['batch10-nissan-vk56vd-titan-2024', { baseModel: 'Nissan TITAN' }],
  ['batch10-nissan-vr38dett-gtr-standard-2024', { baseModel: 'Nissan GT-R', materialDifference: 'Premium/T-spec calibration: 421 kW and 633 N-m' }],
  ['batch10-nissan-vr38dett-gtr-nismo-2024', { baseModel: 'Nissan GT-R', materialDifference: 'NISMO calibration: 447 kW and 652 N-m' }],
  ['batch10-infiniti-kr20ddet-qx55-2025', { baseModel: 'INFINITI QX55' }]
]);
check(batch10ScopeMetadata.size === batch10Records.length, 'Batch 10 scope metadata is stale or incomplete');
check(batch10Records.every((record) => batch10ScopeMetadata.has(record.id)), 'A Batch 10 record lacks explicit base-model metadata');

const normalizedMarkets = (record) => [...record.verification.scope.markets].map(normalizedIdentity).sort();
const engineSignature = (record, includeYears = true) => JSON.stringify({
  maker: normalizedIdentity(record.maker),
  code: normalizedIdentity(record.code),
  region: record.regionKey,
  markets: normalizedMarkets(record),
  displacement: record.displacement,
  layout: record.layout,
  fuel: record.fuelKey,
  aspiration: record.aspirationKey,
  injection: record.injectionKey,
  power: record.performance,
  ...(includeYears ? { years: record.verification.scope.years } : {})
});
const identicalBatch10Scopes = Object.values(Object.groupBy(batch10Records, (record) => engineSignature(record))).filter((group) => group.length > 1);
for (const group of identicalBatch10Scopes) {
  const baseModels = new Set(group.map((record) => normalizedIdentity(batch10ScopeMetadata.get(record.id).baseModel)));
  check(baseModels.size === group.length, `Artificial Batch 10 split remains for ${group.map((record) => record.id).join(', ')}`);
}

const yearInterval = (record) => record.verification.scope.years;
const overlapOrAdjacent = (left, right) => left.from <= right.to + 1 && right.from <= left.to + 1;
const normalizedApplicationText = (record) => normalizedIdentity(record.applications.join(' ')).replace(/[^A-Z0-9]+/g, ' ');
for (const record of batch10Records) {
  const metadata = batch10ScopeMetadata.get(record.id);
  const baseModel = normalizedIdentity(metadata.baseModel).replace(/[^A-Z0-9]+/g, ' ');
  const duplicate = batch10BaselineRecords.find((candidate) => (
    candidate.performance
      && candidate.verification?.scope?.years
      && engineSignature(candidate, false) === engineSignature(record, false)
      && overlapOrAdjacent(yearInterval(candidate), yearInterval(record))
      && normalizedApplicationText(candidate).includes(baseModel)
  ));
  check(!duplicate, `${record.id} duplicates baseline scope ${duplicate?.id}`);
}
pass('Batch 10 semantic duplicate and cross-baseline overlap regression passes without trim/year splitting');

const batch10RepeatedCodeOwners = {};
for (const record of batch10Records) {
  const owners = records
    .filter((candidate) => normalizedIdentity(candidate.code) === normalizedIdentity(record.code))
    .map((candidate) => candidate.id)
    .sort();
  if (owners.length > 1) batch10RepeatedCodeOwners[record.code] = owners;
}
const batch10RepeatedOwnersHash = crypto.createHash('sha256')
  .update(JSON.stringify(Object.fromEntries(Object.entries(batch10RepeatedCodeOwners).sort())))
  .digest('hex');
check(batch10RepeatedOwnersHash === '13b7d9bca5b693e6fc8ebb17dad6278e7c88e8d83f8e7534b447e7fe7571e946', `Batch 10 documented repeated-code owners changed: ${batch10RepeatedOwnersHash}`);
pass(`Batch 10 preserves the original 765 records and validates 26 reconciled direct Tier A records (${batch10BaselineHash})`);

const summaries = core.regionSummaries(records, REGIONS);
check(
  JSON.stringify(summaries) === JSON.stringify([
    { region: 'europe', engineCount: 345, manufacturerCount: 11 },
    { region: 'japan', engineCount: 416, manufacturerCount: 20 },
    { region: 'korea', engineCount: 50, manufacturerCount: 2 },
    { region: 'north-america', engineCount: 110, manufacturerCount: 15 }
  ]),
  'Region engine/manufacturer summaries changed'
);
check(summaries.every((summary) => Number.isInteger(summary.engineCount) && summary.engineCount > 0), 'A region engineCount is not a positive integer');
check(summaries.reduce((total, summary) => total + summary.engineCount, 0) === 921, 'Regional engineCount sum does not equal 921');
for (const summary of summaries) {
  const renderedSummary = core.formatRegionSummary(summary, { manufacturers: 'manufacturers', engines: 'engines' });
  check(renderedSummary.includes(String(summary.manufacturerCount)), `${summary.region} summary is missing its manufacturer count`);
  check(renderedSummary.includes(String(summary.engineCount)), `${summary.region} summary is missing its engine count`);
  check(!/·\s*engines\b/.test(renderedSummary), `${summary.region} summary renders “· engines” without a count`);
}
pass('existing region classification and counts are preserved');

check(!summaries.some((summary) => summary.region === 'south-america'), 'Empty South America region is visible');
const futureSouthAmericaRecord = {
  ...records[0],
  id: 'test-south-america-engine',
  maker: 'Test Argentina',
  regionKey: 'south-america'
};
const futureSummaries = core.regionSummaries([...records, futureSouthAmericaRecord], REGIONS);
check(futureSummaries.some((summary) => summary.region === 'south-america' && summary.engineCount === 1), 'South America did not appear after its first record');
pass('regional navigation hides empty regions and reveals them from data');

const initialNavigation = core.navigationModel(records, REGIONS, { region: '', maker: '' });
check(initialNavigation.every((region) => !region.expanded), 'A region is expanded by default');
check(initialNavigation.every((region) => region.makers.length === 0), 'Manufacturer names are created before a region opens');
check(initialNavigation.every((region) => region.selectedEngines.length === 0), 'Engine lists are created before a manufacturer is selected');
pass('initial navigation keeps all regions closed and manufacturers hidden');

const europeNavigation = core.navigationModel(records, REGIONS, { region: 'europe', maker: '' });
const openEurope = europeNavigation.find((region) => region.region === 'europe');
check(openEurope.expanded && openEurope.makers.length === 11, 'Europe did not expose its 11 manufacturers');
check(europeNavigation.filter((region) => region.region !== 'europe').every((region) => region.makers.length === 0), 'A closed region exposed manufacturers');
for (const region of REGIONS) {
  const expected = new Set(records.filter((record) => record.regionKey === region).map((record) => core.makerSlug(record.maker)));
  const actual = new Set(core.makersForRegion(records, region).map((maker) => maker.slug));
  check(JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort()), `${region} contains a manufacturer from another region`);
}
pass('opening a region exposes only that region’s manufacturers');

const bmwSlug = core.makerSlug('BMW');
const bmwNavigation = core.navigationModel(records, REGIONS, { region: 'europe', maker: bmwSlug });
const bmwEngines = bmwNavigation.find((region) => region.region === 'europe').selectedEngines;
check(bmwEngines.length > 0, 'BMW selection produced no engines');
check(bmwEngines.every((record) => record.regionKey === 'europe' && core.makerSlug(record.maker) === bmwSlug), 'BMW selection exposed another manufacturer or region');
pass('manufacturer selection exposes only that manufacturer’s engines');

const exactCodeResults = core.searchRecords(records, 'M54');
check(exactCodeResults[0]?.code === 'M54', 'Exact engine code is not the top result');
check(core.searchRank(exactCodeResults[0], 'M54') === 0, 'Exact engine code did not receive rank zero');
for (const code of ['B5202S', 'EA888', 'K20', 'G4KD', 'LM7']) {
  const results = core.searchRecords(records, code);
  check(results[0]?.code === code && core.searchRank(results[0], code) === 0, `${code} is not the top exact-code result`);
  check(new Set(results.map((record) => record.id)).size === results.length, `${code} search contains a duplicate record`);
}
check(core.searchRecords(records, 'BMW').some((record) => record.maker === 'BMW'), 'Manufacturer search failed');
check(core.searchRecords(records, 'E46').some((record) => record.applications.some((application) => application.includes('E46'))), 'Model/application search failed');
check(core.searchRecords(records, 'M54B30')[0]?.id === 'bmw-m54', 'Searchable alias search failed');
const designationRecord = syntheticDesignationRecord('official');
designationRecord.aliases = ['Quantum X1'];
const corroboratedDesignationRecord = syntheticDesignationRecord('corroborated');
validateSyntheticDesignation(designationRecord);
validateSyntheticDesignation(corroboratedDesignationRecord);
check(core.primaryIdentity(records[0]).value === records[0].code, 'Legacy exact-code fallback identity changed');
check(core.primaryIdentity(designationRecord).labelKey === 'officialEngineDesignation', 'Designation label key is incorrect');
check(core.searchRecords([records[0], designationRecord], designationRecord.identity.value)[0]?.id === designationRecord.id, 'Exact designation search did not receive top priority');
check(core.searchRank(designationRecord, designationRecord.identity.value) === 0, 'Exact designation rank is not zero');
check(core.searchRecords([designationRecord], 'Quantum X1')[0]?.id === designationRecord.id, 'Designation alias search failed');
check(core.resolveEngine([designationRecord], designationRecord.identity.value)?.id === designationRecord.id, 'Designation URL resolution failed');
check(core.identityValues(designationRecord).every(Boolean), 'Designation identity values contain an empty value');
const designationUrlState = core.stateFromUrl(
  `https://d3orient.com/engines.html?engine=${encodeURIComponent(designationRecord.identity.value)}`,
  [designationRecord], REGIONS, languages
);
check(designationUrlState.engine === designationRecord.id, 'Designation URL state restoration failed');
const renderedIdentity = core.identityDisplay(designationRecord, (key) => ({ officialEngineDesignation: 'Official engine designation' })[key]);
const syntheticListMarkup = `<strong>${renderedIdentity.value}</strong><span>${renderedIdentity.label}</span>`;
const syntheticDetailMarkup = `<h3>${renderedIdentity.value}</h3><p>${renderedIdentity.label}</p>`;
check(syntheticListMarkup.includes('QuantumDrive X1') && syntheticListMarkup.includes('Official engine designation'), 'Synthetic list identity rendering failed');
check(syntheticDetailMarkup.includes('QuantumDrive X1') && syntheticDetailMarkup.includes('Official engine designation'), 'Synthetic detail identity rendering failed');
check(core.searchRecords([corroboratedDesignationRecord], corroboratedDesignationRecord.identity.value)[0]?.id === corroboratedDesignationRecord.id, 'Corroborated designation search failed');
check(engineIdentityCollisionErrors([designationRecord]).length === 0, 'Synthetic designation produced a self collision');
pass('direct and corroborated synthetic designation records pass schema, validator, search, rendering, URL and collision paths');

const exactCollision = { ...records[0], id: 'synthetic-code-owner', code: designationRecord.identity.value, aliases: [] };
const designationCollision = {
  ...exactCollision,
  id: 'synthetic-designation-owner',
  identity: structuredClone(designationRecord.identity),
  aliases: []
};
delete designationCollision.code;
check(engineIdentityCollisionErrors([exactCollision, designationCollision]).length > 0, 'Code/designation collision was not rejected');
const aliasCollision = { ...exactCollision, code: 'OTHER-CODE', aliases: [designationRecord.identity.value] };
check(engineIdentityCollisionErrors([aliasCollision, designationCollision]).length > 0, 'Alias/designation collision was not rejected');
const cosmeticYearCollision = {
  ...designationCollision,
  id: 'synthetic-cosmetic-split',
  identity: { ...designationCollision.identity, type: 'exactCode' },
  code: designationCollision.identity.value,
  years: '2099',
  applications: designationCollision.applications.map((application) => `${application} Sport AWD automatic`)
};
check(engineIdentityCollisionErrors([designationCollision, cosmeticYearCollision]).length > 0, 'Cosmetic trim/year identity split was not rejected');
const identityTypeOnlySplit = {
  ...exactCollision,
  id: 'synthetic-identity-type-split',
  identity: { type: 'officialPublicDesignation', value: 'Different Public Name' },
  code: undefined
};
check(engineIdentityCollisionErrors([exactCollision, identityTypeOnlySplit]).length > 0, 'Identity type alone created a duplicate semantic engine');
const provenDifferentScope = {
  ...designationCollision,
  id: 'synthetic-proven-scope',
  applications: ['Different Model'],
  performance: { ...designationCollision.performance, powerKw: { min: 999, max: 999, rpm: { min: 6000, max: 6000 } } }
};
check(engineIdentityCollisionErrors([designationCollision, provenDifferentScope]).length === 0, 'Materially different application/calibration scope was rejected');
const sameApplicationDifferentCalibration = {
  ...designationCollision,
  id: 'synthetic-same-model-calibration',
  performance: { ...designationCollision.performance, torqueNm: { min: 777, max: 777, rpm: { min: 3000, max: 3000 } } }
};
check(engineIdentityCollisionErrors([designationCollision, sameApplicationDifferentCalibration]).length === 0, 'Two documented calibrations in one application were rejected');
const differentModelSameCalibration = {
  ...designationCollision,
  id: 'synthetic-different-model-same-calibration',
  applications: ['Different Model']
};
check(engineIdentityCollisionErrors([designationCollision, differentModelSameCalibration]).length > 0, 'Identical calibration split across application labels was accepted');
const differentMarketSpecification = {
  ...designationCollision,
  id: 'synthetic-market-specification',
  verification: {
    ...designationCollision.verification,
    scope: { ...designationCollision.verification.scope, markets: ['Synthetic Export Market'] }
  }
};
check(engineIdentityCollisionErrors([designationCollision, differentMarketSpecification]).length === 0, 'Documented market-specific specification was rejected');
pass('normalized code, designation and alias collision guard rejects semantic duplicates');
const northAmericaIds = records.filter((record) => record.regionKey === 'north-america').map((record) => record.id);
for (const query of ['North America', 'USA', 'US', 'United States']) {
  const resultIds = core.searchRecords(records, query).map((record) => record.id);
  check(JSON.stringify(resultIds) === JSON.stringify(northAmericaIds), `${query} did not return the exact 110-record North America set`);
  check(new Set(resultIds).size === resultIds.length, `${query} region search contains duplicates`);
}
for (const query of ['South America', 'Argentina', 'Brazil']) {
  check(core.searchRecords(records, query).length === 0, `${query} incorrectly matched an existing region`);
  check(core.searchRecords([futureSouthAmericaRecord], query)[0]?.regionKey === 'south-america', `${query} future region alias search failed`);
}
const m54 = records.find((record) => record.id === 'bmw-m54');
check(m54?.verification?.status === 'verified', 'M54 verification precondition changed');
check(html.includes('<span class="status-badge">${escapeHtml(verificationLabel(record))}</span>'), 'Engine details do not use the same verification label as search results');
check(!html.includes('<span class="status-badge">${escapeHtml(t(record.statusKey))}</span>'), 'Engine details still render the legacy statusKey as verification status');
check(core.searchRecords(records, '').length === 0, 'Cleared search retained results');
check(core.navigationModel(records, REGIONS, { region: '', maker: '' }).every((region) => !region.expanded), 'Cleared search cannot return to compact navigation');
pass('global search works independently of closed regions and ranks exact code first');

const generatedEmptyRegion = buildRegionalJs('south-america', []);
const generatedUnknownHyphenRegion = buildRegionalJs('unknown-region', []);
check(generatedEmptyRegion.includes('AUTOHUB_ENGINE_DATA_REGIONS["south-america"] = []'), 'Empty South America generation does not use bracket notation');
check(generatedUnknownHyphenRegion.includes('AUTOHUB_ENGINE_DATA_REGIONS["unknown-region"] = []'), 'Unknown hyphenated key generation does not use bracket notation');
check(Array.isArray(loadBrowserGlobal(generatedEmptyRegion).window.AUTOHUB_ENGINE_DATA_REGIONS['south-america']), 'Generated empty South America region is not executable');
check(!REGIONS.includes('unknown-region'), 'Validator region allowlist unexpectedly accepts an unknown hyphenated key');
const invalidRegionSource = readSourceData();
invalidRegionSource.records[0].regionKey = 'unknown-region';
const invalidRegionErrors = validateEngineData(invalidRegionSource).errors;
check(invalidRegionErrors.some((error) => error.includes('unknown regionKey unknown-region')), 'Validator did not reject an unknown hyphenated key');
pass('hyphenated region generation is safe and validator allowlist remains closed');

const restored = core.stateFromUrl(
  'https://d3orient.com/engines.html?search=E46&region=europe&maker=bmw&lang=de',
  records,
  REGIONS,
  languages
);
check(restored.query === 'E46' && restored.region === 'europe' && restored.maker === 'bmw' && restored.lang === 'de', 'Search/region/maker/lang URL state was not restored');
const legacyMake = core.stateFromUrl('https://d3orient.com/engines.html?make=BMW', records, REGIONS, languages);
const legacyManufacturer = core.stateFromUrl('https://d3orient.com/engines.html?manufacturer=BMW', records, REGIONS, languages);
check(legacyMake.region === 'europe' && legacyMake.maker === 'bmw', 'Legacy make URL failed');
check(legacyManufacturer.region === 'europe' && legacyManufacturer.maker === 'bmw', 'Legacy manufacturer URL failed');
const engineByCode = core.stateFromUrl('https://d3orient.com/engines.html?engine=B5202S', records, REGIONS, languages);
check(engineByCode.engine === 'volvo-b5202s' && engineByCode.region === 'europe' && engineByCode.maker === 'volvo', 'Engine-code URL failed');
const normalized = core.applyStateToUrl('https://d3orient.com/engines.html?manufacturer=BMW', { ...legacyManufacturer, query: '', engine: '' });
check(normalized.searchParams.get('maker') === 'bmw' && !normalized.searchParams.has('manufacturer'), 'Legacy manufacturer URL was not normalized');
for (const legacyRegion of ['usa', 'us', 'united-states']) {
  const legacyRegionState = core.stateFromUrl(`https://d3orient.com/engines.html?region=${legacyRegion}`, records, REGIONS, languages);
  check(legacyRegionState.region === 'north-america', `${legacyRegion} URL did not restore North America`);
  const canonicalRegionUrl = core.applyStateToUrl(`https://d3orient.com/engines.html?region=${legacyRegion}`, legacyRegionState);
  check(canonicalRegionUrl.searchParams.get('region') === 'north-america', `${legacyRegion} URL did not serialize canonically`);
}
const canonicalNorthAmericaState = core.stateFromUrl('https://d3orient.com/engines.html?region=north-america', records, REGIONS, languages);
check(canonicalNorthAmericaState.region === 'north-america', 'Canonical North America URL did not restore');
const invalidRegionState = core.stateFromUrl('https://d3orient.com/engines.html?region=unknown-region', records, REGIONS, languages);
check(invalidRegionState.region === '', 'Invalid region URL was not safely discarded');
const invalidRegionUrl = core.applyStateToUrl('https://d3orient.com/engines.html?region=unknown-region', invalidRegionState);
check(!invalidRegionUrl.searchParams.has('region'), 'Invalid region URL was not removed during serialization');
const copiedRegionUrl = core.applyStateToUrl('https://d3orient.com/engines.html', {
  lang: 'en', query: '', region: 'usa', maker: '', engine: ''
});
check(copiedRegionUrl.searchParams.get('region') === 'north-america', 'Copy-link state retained legacy USA key');
const historySequence = [
  'https://d3orient.com/engines.html?region=europe',
  'https://d3orient.com/engines.html?region=europe&maker=bmw',
  'https://d3orient.com/engines.html?region=europe'
].map((url) => core.stateFromUrl(url, records, REGIONS, languages));
check(historySequence[0].maker === '' && historySequence[1].maker === 'bmw' && historySequence[2].maker === '', 'Back/Forward state restoration failed');
const legacyRegionHistory = [
  'https://d3orient.com/engines.html?region=usa',
  'https://d3orient.com/engines.html?region=north-america',
  'https://d3orient.com/engines.html?region=us'
].map((url) => core.stateFromUrl(url, records, REGIONS, languages));
check(legacyRegionHistory.every((state) => state.region === 'north-america'), 'Legacy region Back/Forward restoration failed');
check(
  legacyRegionHistory.every((state) => core.applyStateToUrl('https://d3orient.com/engines.html', state).searchParams.get('region') === 'north-america'),
  'Legacy region history did not serialize canonically'
);
pass('current and legacy URL states restore and normalize correctly');

const translationsMatch = html.match(/const translations = ([\s\S]*?);\s*\n\s*const engineSearchCore/);
check(translationsMatch, 'Engine page translations literal not found');
const pageScriptMatch = html.match(/<script>\s*(const translations = [\s\S]*?)<\/script>/);
check(pageScriptMatch, 'Engine page script not found');
new vm.Script(pageScriptMatch[1], { filename: 'engines.html:inline-script' });
const translations = vm.runInNewContext(`(${translationsMatch[1]})`);
const englishKeys = Object.keys(translations.en).sort();
const requiredKeys = [
  'browseByRegion', 'manufacturersLabel', 'engineCountLabel', 'showRegion', 'hideRegion',
  'chooseManufacturer', 'backToManufacturers', 'searchResults', 'clearSearch',
  'noMatchingEngines', 'searchHelp', 'searchLabel', 'engineCodeLabel', 'officialEngineDesignation'
];
for (const language of languages) {
  check(JSON.stringify(Object.keys(translations[language]).sort()) === JSON.stringify(englishKeys), `${language} translation keys differ from EN`);
  for (const key of requiredKeys) check(Boolean(translations[language][key]), `${language}.${key} is missing`);
  check(Object.values(translations[language]).every((value) => String(value).trim()), `${language} contains an empty translation`);
  const dataKeys = new Set(records.flatMap((record) => [
    record.regionKey, record.fuelKey, record.aspirationKey, record.injectionKey,
    record.blockKey, record.timingKey, record.declaredLifeKey
  ].filter(Boolean)));
  for (const key of dataKeys) check(Boolean(translations[language][key]), `${language}.${key} is an unhandled engine-data translation key`);
  for (const region of ['north-america', 'south-america']) check(Boolean(translations[language][region]), `${language}.${region} is missing`);
}
pass(`engine page script syntax and EN/ES/FR/DE translation parity (${englishKeys.length} keys)`);

check(translations.en.officialEngineDesignation === 'Official engine designation', 'English designation label changed');
for (const language of languages) {
  check(translations[language].officialEngineDesignation !== 'officialEngineDesignation', `${language} exposes the raw designation translation key`);
  check(translations[language].engineCodeLabel !== 'engineCodeLabel', `${language} exposes the raw exact-code translation key`);
}
check(html.includes('${escapeHtml(identity.label)}'), 'Engine list/detail does not render the translated identity label');
check(html.match(/engineSearchCore\.identityDisplay\(record, t\)/g)?.length >= 3, 'List, detail and suggestions do not share identityDisplay');
check(!html.includes('<h3>${escapeHtml(record.code)}</h3>'), 'Engine detail still renders code directly');
check(!html.includes('option.label = `${record.maker} · ${record.code}`'), 'Suggestions still render code directly');
pass('identity labels are translated and list/detail/suggestions use the shared helper');

check(/<label[^>]*for="engineCodeSearch"[^>]*data-i18n="searchLabel"/.test(html), 'Search is missing its permanent label');
check(html.includes('aria-expanded="${item.expanded}"'), 'Region controls do not render aria-expanded');
check(html.includes('aria-controls="${panelId}"'), 'Region controls do not render aria-controls');
check(html.includes('aria-pressed="${maker.slug === activeMaker}"'), 'Manufacturer controls do not render aria-pressed');
check(html.includes("item.expanded ? '' : ' hidden'"), 'Closed region panels are not hidden from keyboard navigation');
check(html.includes("window.addEventListener('popstate'"), 'Popstate restoration handler is missing');
check(html.includes("updateUrl('push')"), 'Navigation does not create restorable history entries');
check(html.includes('focusRegionControl(nextRegion);'), 'Region interaction does not restore keyboard focus');
check(html.includes('focusMakerControl(activeMaker);'), 'Manufacturer selection does not restore keyboard focus');
check(html.includes('focusMakerControl(previousMaker);'), 'Back to manufacturers does not restore keyboard focus');
check(html.includes('engineCodeSearch.focus();'), 'Clear search does not return focus to the search field');
check(!/<div class="maker-tabs"/.test(html), 'Old always-visible manufacturer list remains in the page');
check(html.includes('<link rel="canonical" href="https://d3orient.com/engines.html">'), 'Engine canonical URL changed or contains query parameters');
pass('accessible accordion, manufacturer selection and history hooks are present');

console.log('Engine search regional navigation tests passed.');
