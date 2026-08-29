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
    const legacyIds = legacyRecords.map((record) => record.id).sort().join('|');
    const currentIds = sourceRecords.map((record) => record.id).sort().join('|');
    if (legacyIds !== currentIds) errors.push('Legacy HEAD ID set differs from source ID set.');

    const legacyById = new Map(legacyRecords.map((record) => [record.id, record]));
    for (const [index, record] of sourceRecords.entries()) {
      const legacy = legacyById.get(record.id);
      if (!legacy) {
        errors.push(`${record.id}: missing from legacy HEAD.`);
        continue;
      }
      const legacyAtIndex = legacyRecords[index];
      if (legacyAtIndex?.id !== record.id) {
        errors.push(`${record.id}: legacy order differs at index ${index}.`);
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
    const legacyRegionById = new Map(legacyRegionRecords.map((record) => [record.id, record]));
    const currentComparableList = currentRegionRecords.map((record, index) => {
      const legacy = legacyRegionById.get(record.id);
      if (!legacy) return record;
      const legacyAtIndex = legacyRegionRecords[index];
      if (legacyAtIndex?.id !== record.id) {
        errors.push(`${region}.js: ${record.id}: legacy order differs at index ${index}.`);
      }
      return comparableLegacyRecords(record, legacy).currentComparable;
    });
    const legacyComparableList = currentRegionRecords.map((record) => {
      const legacy = legacyRegionById.get(record.id);
      if (!legacy) return undefined;
      return comparableLegacyRecords(record, legacy).legacyComparable;
    });
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
  console.log(`Legacy ${legacyRef} comparison passed with only allowed first legacyPending-to-verified/corroborated performance/source additions and exact verified identity-field metadata migrations.`);
}
