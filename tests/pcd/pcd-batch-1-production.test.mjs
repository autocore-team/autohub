import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedPcdFile, generatedPcdFileMatches } from '../../scripts/pcd/generate-pcd-data.mjs';
import { loadPcdSource, validatePcdData } from '../../scripts/pcd/validate-pcd-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/pcd/fixtures/batch-1-production.json'), 'utf8'));
const source = loadPcdSource();
const summary = validatePcdData(source);

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

check(summary.records === fixture.expected.records, `Expected ${fixture.expected.records} records, found ${summary.records}`);
check(summary.makers === fixture.expected.makers, `Expected ${fixture.expected.makers} makers, found ${summary.makers}`);
check(summary.models === fixture.expected.models, `Expected ${fixture.expected.models} models, found ${summary.models}`);
check(JSON.stringify(summary.statuses) === JSON.stringify(fixture.expected.statuses), 'Verification status counts changed');
check(
  fixture.candidateAudit.considered === fixture.candidateAudit.accepted + fixture.candidateAudit.rejected,
  'Candidate audit totals do not balance'
);

const baseline = source.records.slice(0, fixture.baseline.records);
check(hash(baseline) === fixture.baseline.semanticHash, 'The first 296 baseline records changed semantically');
check(hash(baseline.map((record) => record.id)) === fixture.baseline.orderHash, 'The first 296 baseline record order changed');

const expectedIds = new Set(fixture.ids);
const batch = source.records.filter((record) => expectedIds.has(record.id));
check(expectedIds.size === 100 && batch.length === 100, `Expected exactly 100 Batch 1 records, found ${batch.length}`);
check(batch.every((record) => record.id.startsWith('pcd-b1-')), 'Batch 1 contains an unexpected ID prefix');

const baselineIds = new Set(baseline.map((record) => record.id));
const baselineModels = new Set(baseline.map((record) => `${record.makerSlug}/${record.modelSlug}`));
const identities = new Set();
const sourceUrls = new Set();
const marketCounts = {};

for (const record of batch) {
  check(!baselineIds.has(record.id), `${record.id} collides with a baseline ID`);
  check(!baselineModels.has(`${record.makerSlug}/${record.modelSlug}`), `${record.id} overlaps a baseline maker/model`);
  const identity = [
    record.makerSlug,
    record.modelSlug,
    record.generation,
    JSON.stringify(record.years),
    JSON.stringify(record.market),
    record.boltPattern.holes,
    record.boltPattern.diameterMm
  ].join('|');
  check(!identities.has(identity), `${record.id} duplicates another Batch 1 identity`);
  identities.add(identity);

  check(record.verificationStatus === 'corroborated', `${record.id} is not corroborated`);
  check(record.lastVerifiedAt === '2026-10-27', `${record.id} has the wrong verification date`);
  check(record.years.length === 1 && record.years[0].from === 2021 && record.years[0].to === 2021, `${record.id} is not scoped to exact year 2021`);
  check(record.market.length === 1 && ['US', 'EU', 'JP'].includes(record.market[0]), `${record.id} has an unsupported production market`);
  marketCounts[record.market[0]] = (marketCounts[record.market[0]] || 0) + 1;

  check(Number.isInteger(record.boltPattern.holes) && Number.isFinite(record.boltPattern.diameterMm), `${record.id} has invalid PCD`);
  check(Number.isFinite(record.centerBore) && record.centerBore > 0, `${record.id} has invalid centre bore`);
  check(['bolt', 'nut'].includes(record.fastenerType), `${record.id} has invalid fastener type`);
  check(/^M\d+x\d+(?:\.\d+)?$/.test(record.threadSize), `${record.id} has invalid thread size`);
  check(Number.isFinite(record.offset.minEt) && record.offset.minEt === record.offset.maxEt, `${record.id} lacks an exact ET`);
  check(Number.isFinite(record.torque.valueNm) && record.torque.valueNm > 0, `${record.id} lacks wheel torque`);
  check(record.wheelSizes.length === 1 && Number.isFinite(record.wheelSizes[0].diameterIn) && Number.isFinite(record.wheelSizes[0].widthIn), `${record.id} lacks an exact OEM wheel`);
  check(record.tireSizes.length === 1 && /^\d{3}\/\d{2,3}R\d{2}$/.test(record.tireSizes[0].size), `${record.id} lacks an exact OEM tyre`);
  check(JSON.stringify(record.notes.map((note) => note.language)) === JSON.stringify(['en', 'es', 'fr', 'de']), `${record.id} lacks EN/ES/FR/DE notes`);

  check(record.sources.length === 2, `${record.id} does not have two sources`);
  const domains = new Set(record.sources.map((item) => new URL(item.url).hostname.replace(/^www\./, '')));
  check(domains.has('avtoreference.com') && domains.has('wheel-fitment.com') && domains.size === 2, `${record.id} source domains are not distinct`);
  for (const item of record.sources) {
    check(item.url.startsWith('https://'), `${record.id} has a non-HTTPS source`);
    check(!sourceUrls.has(item.url), `${record.id} reuses a source URL from another production record`);
    sourceUrls.add(item.url);
    check(item.pages && item.fields.length && item.limitations, `${record.id} has incomplete source metadata`);
  }
}

check(JSON.stringify(marketCounts) === JSON.stringify(fixture.expected.markets), 'Batch 1 market counts changed');
check(sourceUrls.size === 200, `Expected 200 unique exact source URLs, found ${sourceUrls.size}`);

const generated = generatedPcdFile(source);
const generatedOnDisk = fs.readFileSync(path.join(root, 'pcd-data.js'), 'utf8');
check(generatedPcdFileMatches(generatedOnDisk, generated), 'pcd-data.js is stale after Batch 1');

console.log('PASS PCD Production Batch 1: 100 unique corroborated records');
console.log(`PASS candidate audit: ${fixture.candidateAudit.considered} considered, ${fixture.candidateAudit.rejected} rejected, ${fixture.candidateAudit.accepted} accepted`);
console.log(`PASS markets: US=${marketCounts.US}, EU=${marketCounts.EU}, JP=${marketCounts.JP}`);
