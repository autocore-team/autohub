import fs from 'node:fs';
import path from 'node:path';
import {
  REGIONS,
  ROOT_DIR,
  VERIFIED_ENGINE_ID,
  canonicalFingerprint,
  formatCounts,
  loadRegionalRecords,
  readSourceData
} from './lib.mjs';

const regions = loadRegionalRecords();
const sourceData = readSourceData();
const records = Object.values(regions).flat();
const errors = [];

for (const region of REGIONS) {
  if (!Array.isArray(regions[region])) errors.push(`${region}.js did not register an array.`);
  const sourceRecords = (sourceData.regionFiles || []).find((item) => item.region === region)?.records || [];
  if (canonicalFingerprint(regions[region] || []) !== canonicalFingerprint(sourceRecords)) {
    errors.push(`${region}.js does not match source region ${region}.json.`);
  }
  const sourceOrder = sourceRecords.map((record) => record.id).join('|');
  const generatedOrder = (regions[region] || []).map((record) => record.id).join('|');
  if (sourceOrder !== generatedOrder) errors.push(`${region}.js order differs from source region order.`);
}

if (records.length !== 100) errors.push(`Expected 100 regional records, got ${records.length}.`);
if ((sourceData.records || []).length !== 100) errors.push(`Expected 100 source records, got ${(sourceData.records || []).length}.`);

const searchText = (record) => [record.code, record.maker, record.regionKey, record.years]
  .concat(record.aliases || [], record.applications || [])
  .join(' ')
  .toLowerCase();

const b5202s = records.find((record) => record.id === VERIFIED_ENGINE_ID);
if (!b5202s) {
  errors.push('B5202S record not found.');
} else {
  const matches = records.filter((record) => searchText(record).includes('b5202s'));
  if (matches[0]?.id !== VERIFIED_ENGINE_ID) errors.push('B5202S search did not resolve to volvo-b5202s.');
  if (b5202s.performance?.powerKw?.min !== 93) errors.push('B5202S verified power is missing from generated regional data.');
}

const enginesHtml = fs.readFileSync(path.join(ROOT_DIR, 'engines.html'), 'utf8');
for (const region of REGIONS) {
  if (!enginesHtml.includes(`data/engines/${region}.js`)) {
    errors.push(`engines.html does not load data/engines/${region}.js.`);
  }
}

if (!enginesHtml.includes('Object.values(window.AUTOHUB_ENGINE_DATA_REGIONS || {}).flat()')) {
  errors.push('engines.html is not using the regional engine data global.');
}

if (errors.length) {
  console.error('Engine data smoke test failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const counts = formatCounts(records);
console.log('Engine data smoke test passed.');
console.log(`Loaded regions: ${REGIONS.map((region) => `${region}=${counts[region]}`).join(', ')}.`);
console.log(`Search smoke: B5202S -> ${b5202s.id}.`);
