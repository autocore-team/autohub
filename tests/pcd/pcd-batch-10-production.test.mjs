import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedPcdFile, generatedPcdFileMatches } from '../../scripts/pcd/generate-pcd-data.mjs';
import { loadPcdSource, validatePcdData } from '../../scripts/pcd/validate-pcd-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/pcd/fixtures/batch-10-production.json'), 'utf8'));
const source = loadPcdSource();
const summary = validatePcdData(source);
const check = (condition, message) => { if (!condition) throw new Error(message); };
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const normalize = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

check(summary.records === fixture.expected.records, `Expected ${fixture.expected.records} records, found ${summary.records}`);
check(summary.makers === fixture.expected.makers, 'Maker count changed');
check(summary.models === fixture.expected.models, 'Model count changed');
check(JSON.stringify(summary.statuses) === JSON.stringify(fixture.expected.statuses), 'Verification status counts changed');
const audit = fixture.candidateAudit;
check(audit.considered === audit.accepted + audit.rejected, 'Candidate audit does not balance');
check(audit.rejected === audit.incompleteExclusions + audit.fieldConflictExclusions + audit.semanticCollisionsRemoved + audit.trimBodyOverlapsRemoved + audit.badgeEngineeredDuplicatesRemoved + audit.sharedSourceDuplicatesRemoved, 'Exclusion categories do not balance');
check(audit.accepted >= 200, 'Batch 10 misses its production target');

const baseline = source.records.slice(0, fixture.baseline.records);
check(hash(baseline) === fixture.baseline.semanticHash, 'First 2302 records changed semantically');
check(hash(baseline.map((record) => record.id)) === fixture.baseline.orderHash, 'First 2302 record order changed');
check(hash(source.records) === fixture.expected.finalSemanticHash, 'Final Batch 10 semantic hash changed');

const priorIds = new Set([1,2,3,4,5,6,7,8,9].flatMap((batch) => JSON.parse(fs.readFileSync(path.join(root, `tests/pcd/fixtures/batch-${batch}-production.json`), 'utf8')).ids));
const ids = new Set(fixture.ids);
const batch = source.records.filter((record) => ids.has(record.id));
check(ids.size === audit.accepted && batch.length === ids.size, 'Batch 10 ID count changed');
check(batch.every((record) => record.id.startsWith('pcd-b10-') && !priorIds.has(record.id)), 'Batch 10 overlaps an earlier fixture');

const baselineUrls = new Set(baseline.flatMap((record) => record.sources.map((item) => item.url)));
const urls = new Set();
const scopes = new Set();
const breakdown = {};
const publisherCounts = { 2: 0, 3: 0 };
const markets = { US: 0, EU: 0, JP: 0, OTHER: 0, GLOBAL: 0 };
const statuses = { verified: 0, corroborated: 0 };
for (const record of batch) {
  const scope = `${record.makerSlug}/${record.modelSlug}|${normalize(record.generation)}|${record.market.join(',')}|${record.boltPattern.holes}x${record.boltPattern.diameterMm}|${record.centerBore}`;
  check(!scopes.has(scope), `${record.id} duplicates a generation/hardware scope`);
  scopes.add(scope);
  check(record.verificationStatus === 'corroborated', `${record.id} is not corroborated`);
  statuses.corroborated++;
  check(record.lastVerifiedAt === '2026-10-29', `${record.id} verification date changed`);
  check(record.years.length === 1 && record.years[0].from === record.years[0].to, `${record.id} lacks exact-year scope`);
  check(record.market.length === 1 && Object.hasOwn(markets, record.market[0]), `${record.id} market is invalid`);
  markets[record.market[0]]++;
  check(Number.isInteger(record.boltPattern.holes) && Number.isFinite(record.boltPattern.diameterMm) && Number.isFinite(record.centerBore), `${record.id} has invalid PCD/DIA`);
  check(['bolt', 'nut'].includes(record.fastenerType) && /^M\d+x\d+(?:\.\d+)?$/.test(record.threadSize), `${record.id} has invalid hardware`);
  check(Number.isFinite(record.offset.minEt) && Number.isFinite(record.offset.maxEt) && record.offset.minEt <= record.offset.maxEt, `${record.id} has invalid ET`);
  check(record.torque === null || Number.isFinite(record.torque.valueNm), `${record.id} has invalid torque`);
  check(JSON.stringify(record.notes.map((note) => note.language)) === JSON.stringify(['en','es','fr','de']), `${record.id} lacks translations`);
  const publishers = new Set(record.sources.map((item) => item.publisher));
  const domains = new Set(record.sources.map((item) => new URL(item.url).hostname.replace(/^www\./, '')));
  check(publishers.size === record.sources.length && domains.size === record.sources.length, `${record.id} sources are not independent`);
  check(record.sources.length === 2, `${record.id} must have two independent publishers`);
  publisherCounts[record.sources.length]++;
  check(record.sources.every((item) => item.pages.includes('Exact-generation page')), `${record.id} has a non-exact source`);
  check(record.sources.every((item) => item.fields.includes('generation') && item.fields.includes('years') && item.fields.includes('market') && item.fields.includes('boltPattern') && item.fields.includes('centerBore') && item.fields.includes('fastenerType') && item.fields.includes('threadSize') && item.fields.includes('offset') && item.fields.includes('torque')), `${record.id} source coverage is incomplete`);
  for (const item of record.sources) {
    check(!baselineUrls.has(item.url), `${record.id} reuses a baseline source URL`);
    check(!urls.has(item.url), `${record.id} reuses a Batch 10 source URL`);
    urls.add(item.url);
    breakdown[item.publisher] = (breakdown[item.publisher] || 0) + 1;
  }
}
check(JSON.stringify(markets) === JSON.stringify(fixture.expected.markets), 'Batch 10 market distribution changed');
check(JSON.stringify(statuses) === JSON.stringify(fixture.expected.batchStatuses), 'Batch 10 status distribution changed');
check(JSON.stringify(breakdown) === JSON.stringify(fixture.expected.sourceBreakdown), 'Batch 10 publisher distribution changed');
check(urls.size === fixture.expected.sourceUrls, 'Batch 10 unique source URL count changed');
check(publisherCounts[2] === fixture.expected.recordsWithTwoIndependentPublishers && publisherCounts[3] === fixture.expected.recordsWithThreeIndependentPublishers, 'Independent-publisher coverage changed');
check(batch.filter((record) => record.torque === null).length === fixture.expected.recordsWithNullTorque, 'Null-torque count changed');
check(fixture.suspectedLegacyRecords.length === 0, 'Legacy audit unexpectedly contains an unreviewed correction');
const generated = generatedPcdFile(source);
const disk = fs.readFileSync(path.join(root, 'pcd-data.js'), 'utf8');
check(generatedPcdFileMatches(disk, generated), 'pcd-data.js is stale');
console.log(`PASS Batch 10 production regression: ${batch.length} coverage-oriented corroborated records.`);
console.log(`Candidate audit: ${audit.considered} considered, ${audit.rejected} excluded/consolidated, ${audit.accepted} accepted.`);
console.log(`Independent publishers: ${publisherCounts[2]} with two, ${publisherCounts[3]} with three; ${urls.size} unique URLs.`);
