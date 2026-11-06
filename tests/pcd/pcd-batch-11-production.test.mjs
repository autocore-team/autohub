import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedPcdFile, generatedPcdFileMatches } from '../../scripts/pcd/generate-pcd-data.mjs';
import { loadPcdSource, validatePcdData } from '../../scripts/pcd/validate-pcd-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/pcd/fixtures/batch-11-production.json'), 'utf8'));
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
check(audit.accepted >= 200, 'Batch 11 misses its production target');

const baseline = source.records.slice(0, fixture.baseline.records);
check(hash(baseline) === fixture.baseline.semanticHash, 'First 2577 records changed semantically');
check(hash(baseline.map((record) => record.id)) === fixture.baseline.orderHash, 'First 2577 record order changed');
check(hash(source.records) === fixture.expected.finalSemanticHash, 'Final Batch 11 semantic hash changed');

const priorIds = new Set(Array.from({ length: 10 }, (_, index) => index + 1).flatMap((batch) => JSON.parse(fs.readFileSync(path.join(root, `tests/pcd/fixtures/batch-${batch}-production.json`), 'utf8')).ids));
const ids = new Set(fixture.ids);
const batch = source.records.filter((record) => ids.has(record.id));
check(ids.size === audit.accepted && batch.length === ids.size, 'Batch 11 ID count changed');
check(batch.every((record) => record.id.startsWith('pcd-b11-') && !priorIds.has(record.id)), 'Batch 11 overlaps an earlier fixture');

const baselineUrls = new Set(baseline.flatMap((record) => record.sources.map((item) => item.url)));
const urls = new Set();
const scopes = new Set();
const breakdown = {};
const markets = { US: 0, EU: 0, JP: 0, OTHER: 0, GLOBAL: 0 };
for (const record of batch) {
  const scope = `${record.makerSlug}/${record.modelSlug}|${normalize(record.generation)}|${record.market.join(',')}|${record.boltPattern.holes}x${record.boltPattern.diameterMm}|${record.centerBore}`;
  check(!scopes.has(scope), `${record.id} duplicates a generation/hardware scope`);
  scopes.add(scope);
  check(record.verificationStatus === 'corroborated', `${record.id} is not corroborated`);
  check(record.lastVerifiedAt === '2026-11-06', `${record.id} verification date changed`);
  check(record.years.length === 1 && record.years[0].from === record.years[0].to, `${record.id} lacks exact-year scope`);
  for (const market of record.market) markets[market]++;
  check(Number.isInteger(record.boltPattern.holes) && Number.isFinite(record.boltPattern.diameterMm) && Number.isFinite(record.centerBore), `${record.id} has invalid PCD/DIA`);
  check(['bolt', 'nut'].includes(record.fastenerType) && /^M\d+x\d+(?:\.\d+)?$/.test(record.threadSize), `${record.id} has invalid hardware`);
  check(Number.isFinite(record.offset.minEt) && Number.isFinite(record.offset.maxEt) && record.offset.minEt <= record.offset.maxEt, `${record.id} has invalid ET`);
  check(record.torque === null, `${record.id} retains uncorroborated torque`);
  check(JSON.stringify(record.notes.map((note) => note.language)) === JSON.stringify(['en', 'es', 'fr', 'de']), `${record.id} lacks translations`);
  const publishers = new Set(record.sources.map((item) => item.publisher));
  const domains = new Set(record.sources.map((item) => new URL(item.url).hostname.replace(/^www\./, '')));
  check(record.sources.length === 2 && publishers.size === 2 && domains.size === 2, `${record.id} sources are not independent`);
  check(record.sources.every((item) => item.pages.includes(`Exact ${record.years[0].from} application page`)), `${record.id} has a non-exact source`);
  const covered = new Set(record.sources.flatMap((item) => item.fields));
  for (const field of ['generation', 'years', 'market', 'boltPattern', 'centerBore', 'fastenerType', 'threadSize', 'offset', 'torque']) check(covered.has(field), `${record.id} lacks ${field} coverage`);
  for (const item of record.sources) {
    check(!baselineUrls.has(item.url), `${record.id} reuses a baseline source URL`);
    check(!urls.has(item.url), `${record.id} reuses a Batch 11 source URL`);
    urls.add(item.url);
    breakdown[item.publisher] = (breakdown[item.publisher] || 0) + 1;
  }
}
check(JSON.stringify(markets) === JSON.stringify(fixture.expected.markets), 'Batch 11 market distribution changed');
check(JSON.stringify(breakdown) === JSON.stringify(fixture.expected.sourceBreakdown), 'Batch 11 publisher distribution changed');
check(urls.size === fixture.expected.sourceUrls, 'Batch 11 unique source URL count changed');
check(batch.length === fixture.expected.recordsWithTwoIndependentPublishers, 'Independent-publisher coverage changed');
check(batch.filter((record) => record.torque === null).length === fixture.expected.recordsWithNullTorque, 'Null-torque count changed');
check(fixture.coverageAudit.selectedGapCoverage.newModel === batch.length, 'New-model coverage changed');
check(fixture.coverageAudit.selectedGapCoverage.explicitRegionalScope === batch.length, 'Regional scope coverage changed');
check(fixture.consolidations.length === audit.semanticCollisionsRemoved + audit.trimBodyOverlapsRemoved + audit.badgeEngineeredDuplicatesRemoved + audit.sharedSourceDuplicatesRemoved, 'Post-research consolidation log is incomplete');
check(fixture.suspectedLegacyRecords.length === 0, 'Legacy audit unexpectedly contains an unreviewed correction');
const generated = generatedPcdFile(source);
const disk = fs.readFileSync(path.join(root, 'pcd-data.js'), 'utf8');
check(generatedPcdFileMatches(disk, generated), 'pcd-data.js is stale');
console.log(`PASS Batch 11 production regression: ${batch.length} exact-year corroborated records.`);
console.log(`Candidate audit: ${audit.considered} considered, ${audit.rejected} excluded, ${audit.accepted} accepted.`);
console.log(`Independent publishers: ${urls.size} unique URLs across ${batch.length} records.`);
