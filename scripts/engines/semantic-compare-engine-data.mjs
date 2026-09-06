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
const sourceData = readSourceData();
const sourceRecords = sourceData.records;
const generatedMonolithic = loadMonolithicRecords();
const generatedRegions = loadRegionalRecords();
const generatedRegionalFlat = Object.values(generatedRegions).flat();
const errors = [];

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
    encoding: 'utf8'
  });

  if (legacyResult.status !== 0) {
    errors.push(`Unable to read ${legacyRef}:engine-data.js: ${legacyResult.stderr.trim() || 'git show failed'}`);
  } else {
    const context = loadBrowserGlobal(legacyResult.stdout, `${legacyRef}:engine-data.js`);
    const legacyRecords = context.window.AUTOHUB_ENGINE_DATA?.records || [];

    const sourceById = new Map(sourceRecords.map((record) => [record.id, record]));
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
      const { currentComparable, legacyComparable } = comparableLegacyRecords(record, legacy);
      compareFingerprint(currentComparable, legacyComparable, `${record.id}: legacy preservation`);
    }
  }

  for (const region of REGIONS) {
    const regionResult = spawnSync('git', ['show', `${legacyRef}:data/engines/${region}.js`], {
      cwd: new URL('../../', import.meta.url),
      encoding: 'utf8'
    });
    if (regionResult.status !== 0) continue;

    const legacyRegionContext = loadBrowserGlobal(regionResult.stdout, `${legacyRef}:data/engines/${region}.js`);
    const legacyRegionRecords = legacyRegionContext.window.AUTOHUB_ENGINE_DATA_REGIONS?.[region] || [];
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
