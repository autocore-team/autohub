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
import { validateEngineData } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

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

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

const semanticHash = crypto.createHash('sha256').update(canonicalFingerprint(records)).digest('hex');
check(records.length === 545, `Engine count changed: expected 545, found ${records.length}`);
check(
  semanticHash === 'b4bc48a819e02a4c679db5e93475c6e09dd485583d3821908a302a16092aff46',
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
    check(identityOwners.get(identity).size === 1, `${record.id} introduces code/alias collision ${identity}`);
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
    check(identityOwners.get(identity).size === 1, `${record.id} introduces code/alias collision ${identity}`);
  }
}
const sl55 = records.find((record) => record.id === 'mercedes-m113-992');
check(sl55.years === '2003-2005', 'M113.992 must remain inside the from-June-2002 rated-speed condition');
check(sl55.verification.sources[0].pageNotes.some((note) => note.includes('applies from June 2002')), 'M113.992 evidence must preserve its rated-speed date condition');
pass('Batch 07c strict direct evidence, collision, construction, market and period checks pass');

const summaries = core.regionSummaries(records, REGIONS);
check(
  JSON.stringify(summaries) === JSON.stringify([
    { region: 'europe', engineCount: 241, manufacturerCount: 11 },
    { region: 'japan', engineCount: 167, manufacturerCount: 15 },
    { region: 'korea', engineCount: 49, manufacturerCount: 2 },
    { region: 'north-america', engineCount: 88, manufacturerCount: 13 }
  ]),
  'Region engine/manufacturer summaries changed'
);
check(summaries.every((summary) => Number.isInteger(summary.engineCount) && summary.engineCount > 0), 'A region engineCount is not a positive integer');
check(summaries.reduce((total, summary) => total + summary.engineCount, 0) === 545, 'Regional engineCount sum does not equal 545');
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
const northAmericaIds = records.filter((record) => record.regionKey === 'north-america').map((record) => record.id);
for (const query of ['North America', 'USA', 'US', 'United States']) {
  const resultIds = core.searchRecords(records, query).map((record) => record.id);
  check(JSON.stringify(resultIds) === JSON.stringify(northAmericaIds), `${query} did not return the exact 88-record North America set`);
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
  'noMatchingEngines', 'searchHelp', 'searchLabel'
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
