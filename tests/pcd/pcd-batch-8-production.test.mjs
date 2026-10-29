import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedPcdFile, generatedPcdFileMatches } from '../../scripts/pcd/generate-pcd-data.mjs';
import { loadPcdSource, validatePcdData } from '../../scripts/pcd/validate-pcd-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/pcd/fixtures/batch-8-production.json'), 'utf8'));
const source = loadPcdSource();
const summary = validatePcdData(source);
const check = (condition, message) => { if (!condition) throw new Error(message); };
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const normalize = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const overlaps = (left, right) => Math.max(left.from, right.from) <= Math.min(left.to, right.to);

check(summary.records === fixture.expected.records, `Expected ${fixture.expected.records} records, found ${summary.records}`);
check(summary.makers === fixture.expected.makers, `Expected ${fixture.expected.makers} makers, found ${summary.makers}`);
check(summary.models === fixture.expected.models, `Expected ${fixture.expected.models} models, found ${summary.models}`);
check(JSON.stringify(summary.statuses) === JSON.stringify(fixture.expected.statuses), 'Verification status counts changed');
check(fixture.candidateAudit.considered === fixture.candidateAudit.accepted + fixture.candidateAudit.rejected, 'Candidate audit totals do not balance');
check(fixture.candidateAudit.rejected === fixture.candidateAudit.incompleteConflictingOrAmbiguousExclusions + fixture.candidateAudit.semanticCollisionsRemoved + fixture.candidateAudit.sharedSourceConsolidations, 'Rejected-candidate categories do not balance');
check(fixture.candidateAudit.accepted === fixture.expected.recordsWithTwoIndependentPublishers + fixture.expected.recordsWithThreeIndependentPublishers, 'Publisher coverage categories do not balance');
check(fixture.candidateAudit.accepted >= 200, 'Batch 8 does not reach the production target');

const baseline = source.records.slice(0, fixture.baseline.records);
const baselineSourceUrls = new Set(baseline.flatMap((record) => record.sources.map((item) => item.url)));
check(hash(baseline) === fixture.baseline.semanticHash, 'The first 1835 baseline records changed semantically');
check(hash(baseline.map((record) => record.id)) === fixture.baseline.orderHash, 'The first 1835 baseline record order changed');
check(hash(source.records) === fixture.expected.finalSemanticHash, 'Final Batch 8 semantic hash changed');

const previousIds = new Set([1, 2, 3, 4, 5, 6, 7].flatMap((batch) => JSON.parse(fs.readFileSync(path.join(root, `tests/pcd/fixtures/batch-${batch}-production.json`), 'utf8')).ids));
const expectedIds = new Set(fixture.ids);
const batch = source.records.filter((record) => expectedIds.has(record.id));
check(expectedIds.size === fixture.candidateAudit.accepted && batch.length === fixture.candidateAudit.accepted, `Expected exactly ${fixture.candidateAudit.accepted} Batch 8 records, found ${batch.length}`);
check(batch.every((record) => record.id.startsWith('pcd-b8-')), 'Batch 8 contains an unexpected ID prefix');
check(batch.every((record) => !previousIds.has(record.id)), 'Batch 8 overlaps a previous production fixture');

const sourceUrls = new Set();
const generationScopes = new Set();
const sourceBreakdown = {};
const publisherCounts = {1:0, 2:0, 3:0};
const markets = {US:0, EU:0, JP:0, OTHER:0, GLOBAL:0};
const statuses = {verified:0, corroborated:0};

for (const record of batch) {
  const scope = `${record.makerSlug}/${record.modelSlug}|${normalize(record.generation)}`;
  check(!generationScopes.has(scope), `${record.id} duplicates a Batch 8 generation scope`);
  generationScopes.add(scope);
  check(record.verificationStatus === 'corroborated', `${record.id} is not corroborated`);
  statuses[record.verificationStatus] += 1;
  check(record.lastVerifiedAt === '2026-10-29', `${record.id} has the wrong verification date`);
  check(record.years.length === 1 && record.years[0].from === record.years[0].to, `${record.id} is not scoped to one exact year`);
  check(record.market.length === 1 && record.market[0] === 'GLOBAL', `${record.id} has an unsupported market scope`);
  markets.GLOBAL += 1;
  check(record.aliases.length === 3 && record.aliases.some((alias) => alias.includes(String(record.years[0].from))), `${record.id} lacks exact-year aliases`);
  check(Number.isInteger(record.boltPattern.holes) && Number.isFinite(record.boltPattern.diameterMm), `${record.id} has invalid PCD`);
  check(Number.isFinite(record.centerBore) && record.centerBore > 0, `${record.id} has invalid centre bore`);
  check(['bolt', 'nut'].includes(record.fastenerType), `${record.id} has invalid fastener type`);
  check(/^M\d+x\d+(?:\.\d+)?$/.test(record.threadSize), `${record.id} has invalid thread size`);
  check(Number.isFinite(record.offset.minEt) && Number.isFinite(record.offset.maxEt) && record.offset.minEt <= record.offset.maxEt, `${record.id} lacks a valid ET range`);
  check(record.torque === null || Number.isFinite(record.torque.valueNm), `${record.id} has invalid torque`);
  check(JSON.stringify(record.notes.map((note) => note.language)) === JSON.stringify(['en','es','fr','de']), `${record.id} lacks EN/ES/FR/DE notes`);
  const publishers = new Set(record.sources.map((item) => item.publisher));
  const domains = new Set(record.sources.map((item) => new URL(item.url).hostname.replace(/^www\./, '')));
  check(publishers.size === record.sources.length && domains.size === record.sources.length, `${record.id} sources are not independently published`);
  check(record.sources.length === 2 || record.sources.length === 3, `${record.id} has unsupported source coverage`);
  publisherCounts[record.sources.length] += 1;
  check(record.sources.filter((item) => item.pages.includes('publication has no regional restriction')).length === 2, `${record.id} GLOBAL scope is not justified by two publishers`);
  for (const item of record.sources) {
    check(item.url.startsWith('https://'), `${record.id} has a non-HTTPS source`);
    check(!baselineSourceUrls.has(item.url), `${record.id} reuses a source URL from the first 1835 records`);
    check(!sourceUrls.has(item.url), `${record.id} reuses a Batch 8 source URL`);
    sourceUrls.add(item.url);
    sourceBreakdown[item.publisher] = (sourceBreakdown[item.publisher] || 0) + 1;
    check(item.pages && item.fields.length && item.limitations, `${record.id} has incomplete source metadata`);
  }
  for (const base of baseline) {
    if (base.makerSlug !== record.makerSlug) continue;
    const relatedModel = record.modelSlug === base.modelSlug || record.modelSlug.startsWith(`${base.modelSlug}-`) || base.modelSlug.startsWith(`${record.modelSlug}-`);
    const sameHardware = record.boltPattern.holes === base.boltPattern.holes && record.boltPattern.diameterMm === base.boltPattern.diameterMm && Math.abs(record.centerBore - base.centerBore) <= .11;
    check(!(relatedModel && sameHardware && record.years.some((years) => base.years.some((baseYears) => overlaps(years, baseYears)))), `${record.id} semantically overlaps baseline record ${base.id}`);
  }
}

check(JSON.stringify(statuses) === JSON.stringify(fixture.expected.batchStatuses), 'Batch 8 status distribution changed');
check(JSON.stringify(markets) === JSON.stringify(fixture.expected.markets), 'Batch 8 market distribution changed');
check(publisherCounts[1] === fixture.expected.recordsWithOneIndependentPublisher, 'Single-publisher count changed');
check(publisherCounts[2] === fixture.expected.recordsWithTwoIndependentPublishers, 'Two-publisher count changed');
check(publisherCounts[3] === fixture.expected.recordsWithThreeIndependentPublishers, 'Three-publisher count changed');
check(sourceUrls.size === fixture.expected.sourceUrls, `Expected ${fixture.expected.sourceUrls} unique source URLs, found ${sourceUrls.size}`);
check(JSON.stringify(sourceBreakdown) === JSON.stringify(fixture.expected.sourceBreakdown), 'Batch 8 source breakdown changed');
check(fixture.finalConsolidations.length === fixture.rejectionBreakdown['badge trim or body-style consolidation'], 'Final consolidation log is incomplete');
const generated = generatedPcdFile(source);
const onDisk = fs.readFileSync(path.join(root, 'pcd-data.js'), 'utf8');
check(generatedPcdFileMatches(onDisk, generated), 'pcd-data.js is stale after Batch 8');

console.log(`PASS PCD Production Batch 8: ${batch.length} unique corroborated records`);
console.log(`PASS candidate audit: ${fixture.candidateAudit.considered} considered, ${fixture.candidateAudit.rejected} rejected/consolidated, ${fixture.candidateAudit.accepted} accepted`);
console.log(`PASS collision audit: ${fixture.candidateAudit.semanticCollisionsRemoved} semantic, ${fixture.candidateAudit.sharedSourceConsolidations} shared-source`);
console.log(`PASS publisher coverage: ${publisherCounts[2]} with two and ${publisherCounts[3]} with three independent publishers`);
