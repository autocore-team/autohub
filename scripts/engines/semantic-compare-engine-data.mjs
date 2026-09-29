import { spawnSync } from 'node:child_process';
import {
  ENGINE_DATA_PATH,
  REGIONS,
  canonicalFingerprint,
  formatCounts,
  loadBrowserGlobal,
  loadMonolithicRecords,
  loadRegionalRecords,
  readSourceData,
  readText,
  regionFilePath
} from './lib.mjs';
import { comparableLegacyRecords } from './legacy-identity-migration-policy.mjs';

const compareLegacyHead = process.argv.includes('--legacy-head');
const legacyRef = process.env.ENGINE_DATA_BASE_REF || 'main';
const gitShowMaxBuffer = 32 * 1024 * 1024;
const sourceData = readSourceData();
const sourceRecords = sourceData.records;
const generatedMonolithic = loadMonolithicRecords();
const generatedRegions = loadRegionalRecords();
const generatedRegionalFlat = Object.values(generatedRegions).flat();
const errors = [];
let legacyUsesUsaRegion = false;

function compareFingerprint(left, right, label) {
  if (canonicalFingerprint(left) !== canonicalFingerprint(right)) {
    errors.push(`${label}: semantic data differs.`);
  }
}

function compareLegacyOrder(currentRecords, legacyRecords, label) {
  const legacyIds = legacyRecords.map((record) => record.id);
  const legacyIdSet = new Set(legacyIds);
  const currentLegacyIds = currentRecords
    .map((record) => record.id)
    .filter((id) => legacyIdSet.has(id));

  if (currentLegacyIds.join('|') !== legacyIds.join('|')) {
    errors.push(`${label}: legacy record order differs or legacy records are missing.`);
  }
}

compareFingerprint(generatedMonolithic, sourceRecords, 'engine-data.js vs source');

for (const region of REGIONS) {
  const expected = (sourceData.regionFiles || []).find((item) => item.region === region)?.records || [];
  compareFingerprint(generatedRegions[region], expected, `${region}.js vs source`);
  const expectedOrder = expected.map((record) => record.id).join('|');
  const actualOrder = (generatedRegions[region] || []).map((record) => record.id).join('|');
  if (expectedOrder !== actualOrder) errors.push(`${region}.js: regional order differs from source order.`);
}

const canonicalIds = sourceRecords.map((record) => record.id).sort().join('|');
const regionalIds = generatedRegionalFlat.map((record) => record.id).sort().join('|');
if (canonicalIds !== regionalIds) errors.push('Generated regional files do not contain the same ID set as source data.');

if (compareLegacyHead) {
  const legacyResult = spawnSync('git', ['show', `${legacyRef}:engine-data.js`], {
    cwd: new URL('../../', import.meta.url),
    encoding: 'utf8',
    maxBuffer: gitShowMaxBuffer
  });

  if (legacyResult.status !== 0) {
    errors.push(`Unable to read ${legacyRef}:engine-data.js: ${legacyResult.stderr.trim() || 'git show failed'}`);
  } else {
    const context = loadBrowserGlobal(legacyResult.stdout, `${legacyRef}:engine-data.js`);
    const legacyRecords = context.window.AUTOHUB_ENGINE_DATA?.records || [];
    const legacyUsaCount = legacyRecords.filter((record) => record.regionKey === 'usa').length;
    legacyUsesUsaRegion = legacyUsaCount > 0;

    const sourceById = new Map(sourceRecords.map((record) => [record.id, record]));
    let exactRegionMigrations = 0;
    let semanticallyUnchanged = 0;
    let unchangedStatuses = 0;
    for (const record of sourceRecords) {
      if (sourceById.get(record.id) !== record) continue;
      if (legacyRecords.some((legacyRecord) => legacyRecord.id === record.id)) continue;
      if (!['verified', 'corroborated'].includes(record.verification?.status) || !record.performance) {
        errors.push(`${record.id}: additive new records must be verified or corroborated and include performance.`);
      }
    }
    compareLegacyOrder(sourceRecords, legacyRecords, 'Legacy HEAD');

    for (const legacy of legacyRecords) {
      const record = sourceById.get(legacy.id);
      if (!legacy) {
        errors.push(`${legacy.id}: missing from legacy HEAD.`);
        continue;
      }
      if (!record) {
        errors.push(`${legacy.id}: missing from current source data.`);
        continue;
      }
      if (record.verification?.status === legacy.verification?.status) unchangedStatuses += 1;
      if (canonicalFingerprint(record) === canonicalFingerprint(legacy)) {
        semanticallyUnchanged += 1;
      } else {
        const currentWithoutRegion = structuredClone(record);
        const legacyWithoutRegion = structuredClone(legacy);
        delete currentWithoutRegion.regionKey;
        delete legacyWithoutRegion.regionKey;
        if (
          legacy.regionKey === 'usa'
          && record.regionKey === 'north-america'
          && canonicalFingerprint(currentWithoutRegion) === canonicalFingerprint(legacyWithoutRegion)
        ) {
          exactRegionMigrations += 1;
        }
      }
      const { currentComparable, legacyComparable } = comparableLegacyRecords(record, legacy);
      compareFingerprint(currentComparable, legacyComparable, `${record.id}: legacy preservation`);
    }
    if (legacyUsesUsaRegion && legacyRecords.length === 500 && sourceRecords.length === 500) {
      if (legacyUsaCount !== 88) errors.push(`Legacy USA baseline contains ${legacyUsaCount} records; expected exactly 88.`);
      if (exactRegionMigrations !== 88) errors.push(`Region migration changed ${exactRegionMigrations} records; expected exactly 88.`);
      if (semanticallyUnchanged !== 412) errors.push(`${semanticallyUnchanged} records were unchanged; expected exactly 412.`);
      if (unchangedStatuses !== 500) errors.push(`${unchangedStatuses} verification statuses were preserved; expected 500.`);
    }
    if (!errors.length) {
      if (legacyUsesUsaRegion) {
        console.log(`Legacy migration audit: ${exactRegionMigrations} records changed only regionKey usa -> north-america; ${semanticallyUnchanged} records are identical; ${unchangedStatuses} statuses preserved.`);
      } else {
        console.log(`Legacy baseline audit: ${semanticallyUnchanged} records are identical; ${unchangedStatuses} statuses preserved; one-time USA migration assertions are not applicable.`);
      }
    }
  }

  for (const region of REGIONS) {
    const legacyRegion = region === 'north-america' && legacyUsesUsaRegion ? 'usa' : region;
    const regionResult = spawnSync('git', ['show', `${legacyRef}:data/engines/${legacyRegion}.js`], {
      cwd: new URL('../../', import.meta.url),
      encoding: 'utf8',
      maxBuffer: gitShowMaxBuffer
    });
    if (regionResult.status !== 0) continue;

    const legacyRegionContext = loadBrowserGlobal(regionResult.stdout, `${legacyRef}:data/engines/${legacyRegion}.js`);
    const legacyRegionRecords = legacyRegionContext.window.AUTOHUB_ENGINE_DATA_REGIONS?.[legacyRegion] || [];
    const currentRegionContext = loadBrowserGlobal(readText(regionFilePath(region)), regionFilePath(region));
    const currentRegionRecords = currentRegionContext.window.AUTOHUB_ENGINE_DATA_REGIONS?.[region] || [];
    const currentRegionById = new Map(currentRegionRecords.map((record) => [record.id, record]));
    compareLegacyOrder(currentRegionRecords, legacyRegionRecords, `${region}.js`);

    const currentComparableList = [];
    const legacyComparableList = [];
    for (const legacy of legacyRegionRecords) {
      const record = currentRegionById.get(legacy.id);
      if (!record) {
        errors.push(`${region}.js: ${legacy.id}: missing from current generated data.`);
        continue;
      }
      const { currentComparable, legacyComparable } = comparableLegacyRecords(record, legacy);
      currentComparableList.push(currentComparable);
      legacyComparableList.push(legacyComparable);
    }
    compareFingerprint(currentComparableList, legacyComparableList, `${region}.js: generated legacy preservation`);
  }
}

if (errors.length) {
  console.error('Engine data semantic comparison failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const counts = formatCounts(generatedRegionalFlat);
console.log('Engine data semantic comparison passed.');
console.log(`Source records: ${sourceRecords.length}; monolithic records: ${generatedMonolithic.length}; regional records: ${generatedRegionalFlat.length}.`);
console.log(`Region counts: ${REGIONS.map((region) => `${region}=${counts[region]}`).join(', ')}.`);
if (compareLegacyHead) {
  console.log(`Legacy ${legacyRef} comparison passed with preserved legacy records, allowed first legacyPending-to-verified/corroborated performance/source additions, exact verified identity-field metadata migrations, and additive new records.`);
}
