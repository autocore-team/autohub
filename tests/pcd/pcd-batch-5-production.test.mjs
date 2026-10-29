import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedPcdFile, generatedPcdFileMatches } from '../../scripts/pcd/generate-pcd-data.mjs';
import { loadPcdSource, validatePcdData } from '../../scripts/pcd/validate-pcd-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/pcd/fixtures/batch-5-production.json'), 'utf8'));
const source = loadPcdSource();
const summary = validatePcdData(source);

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function normalize(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

check(summary.records >= fixture.expected.records, `Expected at least ${fixture.expected.records} records, found ${summary.records}`);
check(summary.makers >= fixture.expected.makers, `Expected at least ${fixture.expected.makers} makers, found ${summary.makers}`);
check(summary.models >= fixture.expected.models, `Expected at least ${fixture.expected.models} models, found ${summary.models}`);
check(summary.statuses.legacyPending === fixture.expected.statuses.legacyPending && summary.statuses.verified === fixture.expected.statuses.verified && summary.statuses.corroborated >= fixture.expected.statuses.corroborated, 'Verification status baseline changed');
check(fixture.candidateAudit.considered === fixture.candidateAudit.accepted + fixture.candidateAudit.rejected, 'Candidate audit totals do not balance');
check(fixture.candidateAudit.qualifiedMatchesBeforeAudit === fixture.candidateAudit.considered, 'Qualified/considered candidate totals do not match');
check(fixture.candidateAudit.semanticCollisionsRemoved === fixture.candidateAudit.baselineOrEarlierPoolSemanticCollisions + fixture.candidateAudit.finalSemanticCollisionsRemoved, 'Semantic collision audit does not balance');
check(fixture.candidateAudit.rejected === fixture.candidateAudit.semanticCollisionsRemoved + fixture.candidateAudit.consolidatedOrDuplicateSources, 'Rejected candidate categories do not balance');
check(fixture.removed.length === fixture.candidateAudit.rejected, 'Removed-candidate log does not match the audit');

const baseline = source.records.slice(0, fixture.baseline.records);
check(hash(baseline) === fixture.baseline.semanticHash, 'The first 1109 baseline records changed semantically');
check(hash(baseline.map((record) => record.id)) === fixture.baseline.orderHash, 'The first 1109 baseline record order changed');

const previousIds = new Set([1, 2, 3, 4].flatMap((batch) => JSON.parse(fs.readFileSync(path.join(root, `tests/pcd/fixtures/batch-${batch}-production.json`), 'utf8')).ids));
const expectedIds = new Set(fixture.ids);
const batch = source.records.filter((record) => expectedIds.has(record.id));
check(expectedIds.size === fixture.candidateAudit.accepted && batch.length === fixture.candidateAudit.accepted, `Expected exactly ${fixture.candidateAudit.accepted} Batch 5 records, found ${batch.length}`);
check(batch.every((record) => record.id.startsWith('pcd-b5-')), 'Batch 5 contains an unexpected ID prefix');
check(batch.every((record) => !previousIds.has(record.id)), 'Batch 5 overlaps a previous production fixture');

const baselineScopes = new Set(baseline.map((record) => `${record.makerSlug}/${record.modelSlug}|${normalize(record.generation)}`));
const generationScopes = new Set();
const hardwareScopes = new Set();
const baselineSourceUrls = new Set(baseline.flatMap((record) => record.sources).map((item) => item.url.replace(/\/$/, '').toLowerCase()));
const sourceUrls = new Set();
const marketCounts = {};
const batchStatuses = { verified: 0, corroborated: 0 };

for (const record of batch) {
  const modelScope = `${record.makerSlug}/${record.modelSlug}`;
  const generationScope = `${modelScope}|${normalize(record.generation)}`;
  check(!baselineScopes.has(generationScope), `${record.id} exactly overlaps a baseline generation scope`);
  check(!generationScopes.has(generationScope), `${record.id} duplicates a Batch 5 generation scope`);
  generationScopes.add(generationScope);

  const hardwareScope = [generationScope, record.boltPattern.holes, record.boltPattern.diameterMm, record.centerBore, record.fastenerType, record.threadSize, record.offset.minEt, record.torque.valueNm].join('|');
  check(!hardwareScopes.has(hardwareScope), `${record.id} duplicates a Batch 5 hardware scope`);
  hardwareScopes.add(hardwareScope);

  check(record.verificationStatus === 'corroborated', `${record.id} is not corroborated`);
  batchStatuses[record.verificationStatus] += 1;
  check(record.lastVerifiedAt === '2026-10-29', `${record.id} has the wrong verification date`);
  check(record.years.length === 1 && record.years[0].from === record.years[0].to, `${record.id} is not scoped to one exact model year`);
  check(record.market.length === 1 && ['US', 'EU', 'JP', 'OTHER', 'GLOBAL'].includes(record.market[0]), `${record.id} has an unsupported market`);
  marketCounts[record.market[0]] = (marketCounts[record.market[0]] || 0) + 1;

  check(record.aliases.length === 3 && record.aliases.some((alias) => alias.includes(String(record.years[0].from))), `${record.id} lacks exact-year aliases`);
  check(Number.isInteger(record.boltPattern.holes) && Number.isFinite(record.boltPattern.diameterMm), `${record.id} has invalid PCD`);
  check(Number.isFinite(record.centerBore) && record.centerBore > 0, `${record.id} has invalid centre bore`);
  check(['bolt', 'nut'].includes(record.fastenerType), `${record.id} has invalid fastener type`);
  check(/^M\d+x\d+(?:\.\d+)?$/.test(record.threadSize), `${record.id} has invalid thread size`);
  check(Number.isFinite(record.offset.minEt) && record.offset.minEt === record.offset.maxEt, `${record.id} lacks exact ET`);
  check(Number.isFinite(record.torque.valueNm) && record.torque.valueNm > 0, `${record.id} lacks wheel torque`);
  check(record.wheelSizes.length === 1 && Number.isFinite(record.wheelSizes[0].diameterIn) && record.wheelSizes[0].offset.minEt === record.offset.minEt, `${record.id} lacks a source-derived OEM rim diameter/ET`);
  check(record.wheelSizes[0].widthIn === undefined, `${record.id} invents an unsupported rim width`);
  check(record.tireSizes.length === 1 && /^\d{3}\/\d{2,3}R\d{2}$/.test(record.tireSizes[0].size), `${record.id} lacks an exact OEM tyre`);
  check(record.wheelSizes[0].diameterIn === Number(record.tireSizes[0].size.match(/R(\d{2})$/)[1]), `${record.id} rim diameter does not follow its tyre notation`);
  check(JSON.stringify(record.notes.map((note) => note.language)) === JSON.stringify(['en', 'es', 'fr', 'de']), `${record.id} lacks EN/ES/FR/DE notes`);

  check(record.sources.length === 2, `${record.id} does not have exactly two sources`);
  const domains = new Set(record.sources.map((item) => new URL(item.url).hostname.replace(/^www\./, '')));
  check(domains.size === 2 && domains.has('monentraxe.fr') && domains.has('wheel-fitment.com'), `${record.id} source domains are not the audited independent pair`);
  for (const item of record.sources) {
    check(item.url.startsWith('https://'), `${record.id} has a non-HTTPS source`);
    check(!baselineSourceUrls.has(item.url.replace(/\/$/, '').toLowerCase()), `${record.id} reuses a baseline source URL`);
    check(!sourceUrls.has(item.url), `${record.id} reuses a source URL from another Batch 5 record`);
    sourceUrls.add(item.url);
    check(item.pages && item.fields.length && item.limitations, `${record.id} has incomplete source metadata`);
  }
}

check(Object.entries(fixture.expected.markets).every(([market, count]) => (marketCounts[market] || 0) === count), 'Batch 5 market counts changed');
check(JSON.stringify(batchStatuses) === JSON.stringify(fixture.expected.batchStatuses), 'Batch 5 status counts changed');
check(sourceUrls.size === fixture.expected.sourceUrls, `Expected ${fixture.expected.sourceUrls} unique source URLs, found ${sourceUrls.size}`);

const generated = generatedPcdFile(source);
const generatedOnDisk = fs.readFileSync(path.join(root, 'pcd-data.js'), 'utf8');
check(generatedPcdFileMatches(generatedOnDisk, generated), 'pcd-data.js is stale after Batch 5');

console.log(`PASS PCD Production Batch 5: ${batch.length} unique corroborated records`);
console.log(`PASS candidate audit: ${fixture.candidateAudit.considered} considered, ${fixture.candidateAudit.rejected} rejected/consolidated, ${fixture.candidateAudit.accepted} accepted`);
console.log(`PASS semantic collisions removed: ${fixture.candidateAudit.semanticCollisionsRemoved}`);
console.log(`PASS markets: US=${marketCounts.US || 0}, EU=${marketCounts.EU || 0}, JP=${marketCounts.JP || 0}, OTHER=${marketCounts.OTHER || 0}, GLOBAL=${marketCounts.GLOBAL || 0}`);
