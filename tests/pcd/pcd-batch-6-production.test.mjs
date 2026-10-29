import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedPcdFile, generatedPcdFileMatches } from '../../scripts/pcd/generate-pcd-data.mjs';
import { loadPcdSource, validatePcdData } from '../../scripts/pcd/validate-pcd-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/pcd/fixtures/batch-6-production.json'), 'utf8'));
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
check(fixture.candidateAudit.rejected === fixture.candidateAudit.incompleteOrConflictingExclusions + fixture.candidateAudit.semanticCollisionsRemoved + fixture.candidateAudit.sharedSourceConsolidations, 'Rejected-candidate categories do not balance');
check(fixture.candidateAudit.accepted === fixture.candidateAudit.twoIndependentSources + fixture.candidateAudit.exactGenerationSingleSource, 'Source coverage categories do not balance');
check(fixture.removed.length === fixture.candidateAudit.semanticCollisionsRemoved, 'Semantic collision log does not match its audit count');

const baseline = source.records.slice(0, fixture.baseline.records);
check(hash(baseline) === fixture.baseline.semanticHash, 'The first 1340 baseline records changed semantically');
check(hash(baseline.map((record) => record.id)) === fixture.baseline.orderHash, 'The first 1340 baseline record order changed');
check(hash(source.records) === fixture.expected.finalSemanticHash, 'Final Batch 6 semantic hash changed');

const previousIds = new Set([1, 2, 3, 4, 5].flatMap((batch) => JSON.parse(fs.readFileSync(path.join(root, `tests/pcd/fixtures/batch-${batch}-production.json`), 'utf8')).ids));
const expectedIds = new Set(fixture.ids);
const batch = source.records.filter((record) => expectedIds.has(record.id));
check(expectedIds.size === fixture.candidateAudit.accepted && batch.length === fixture.candidateAudit.accepted, `Expected exactly ${fixture.candidateAudit.accepted} Batch 6 records, found ${batch.length}`);
check(batch.every((record) => record.id.startsWith('pcd-b6-')), 'Batch 6 contains an unexpected ID prefix');
check(batch.every((record) => !previousIds.has(record.id)), 'Batch 6 overlaps a previous production fixture');

const generationScopes = new Set();
const sourceUrls = new Set();
const marketCounts = {};
const sourceBreakdown = {};
const batchStatuses = { verified: 0, corroborated: 0 };

for (const record of batch) {
  const generationScope = `${record.makerSlug}/${record.modelSlug}|${normalize(record.generation)}`;
  check(!generationScopes.has(generationScope), `${record.id} duplicates a Batch 6 generation scope`);
  generationScopes.add(generationScope);
  check(record.verificationStatus === 'corroborated', `${record.id} is not corroborated`);
  batchStatuses[record.verificationStatus] += 1;
  check(record.lastVerifiedAt === '2026-10-29', `${record.id} has the wrong verification date`);
  check(record.years.length === 1 && record.years[0].from === record.years[0].to, `${record.id} is not scoped to one exact model year`);
  check(record.market.length >= 1 && record.market.every((market) => ['US', 'EU', 'JP', 'OTHER', 'GLOBAL'].includes(market)), `${record.id} has an unsupported market`);
  for (const market of record.market) marketCounts[market] = (marketCounts[market] || 0) + 1;
  check(record.market.includes('GLOBAL') ? record.sources[0].pages.includes('not market-restricted') : record.sources.length === 2, `${record.id} uses an unsupported GLOBAL or explicit market scope`);

  check(record.aliases.length === 3 && record.aliases.some((alias) => alias.includes(String(record.years[0].from))), `${record.id} lacks exact-year aliases`);
  check(Number.isInteger(record.boltPattern.holes) && Number.isFinite(record.boltPattern.diameterMm), `${record.id} has invalid PCD`);
  check(Number.isFinite(record.centerBore) && record.centerBore > 0, `${record.id} has invalid centre bore`);
  check(['bolt', 'nut'].includes(record.fastenerType), `${record.id} has invalid fastener type`);
  check(/^M\d+x\d+(?:\.\d+)?$/.test(record.threadSize), `${record.id} has invalid thread size`);
  check(Number.isFinite(record.offset.minEt) && record.offset.minEt === record.offset.maxEt, `${record.id} lacks exact ET`);
  check(Number.isFinite(record.torque.valueNm) && record.torque.valueNm > 0, `${record.id} lacks wheel torque`);
  check(record.wheelSizes.length === 1 && Number.isFinite(record.wheelSizes[0].diameterIn) && record.wheelSizes[0].offset.minEt === record.offset.minEt, `${record.id} lacks a source-derived wheel diameter/ET`);
  check(record.wheelSizes[0].widthIn === undefined && /width is not asserted/.test(record.wheelSizes[0].notes), `${record.id} invents an unsupported wheel width`);
  check(record.tireSizes.length === 1 && /^\d{3}\/\d{2,3}R\d{2}$/.test(record.tireSizes[0].size), `${record.id} lacks an exact tyre`);
  check(record.wheelSizes[0].diameterIn === Number(record.tireSizes[0].size.match(/R(\d{2})$/)[1]), `${record.id} wheel diameter does not follow its tyre notation`);
  check(JSON.stringify(record.notes.map((note) => note.language)) === JSON.stringify(['en', 'es', 'fr', 'de']), `${record.id} lacks EN/ES/FR/DE notes`);

  check(record.sources.length === 1 || record.sources.length === 2, `${record.id} has an unexpected source count`);
  const domains = new Set(record.sources.map((item) => new URL(item.url).hostname.replace(/^www\./, '')));
  check(domains.has('wheelatlas.cc'), `${record.id} lacks its exact-generation WheelAtlas source`);
  check(record.sources.length === 1 ? domains.size === 1 : domains.size === 2, `${record.id} source independence is invalid`);
  for (const item of record.sources) {
    check(item.url.startsWith('https://'), `${record.id} has a non-HTTPS source`);
    check(!sourceUrls.has(item.url), `${record.id} reuses a Batch 6 source URL`);
    sourceUrls.add(item.url);
    sourceBreakdown[item.publisher] = (sourceBreakdown[item.publisher] || 0) + 1;
    check(item.pages && item.fields.length && item.limitations, `${record.id} has incomplete source metadata`);
  }

  const atlasUrl = record.sources.find((item) => new URL(item.url).hostname === 'wheelatlas.cc').url;
  const years = [...new URL(atlasUrl).pathname.matchAll(/(19\d{2}|20\d{2}|present)/g)].map((match) => match[1] === 'present' ? 2026 : Number(match[1]));
  check(years.length >= 2 && record.years[0].from >= years.at(-2) && record.years[0].to <= years.at(-1), `${record.id} falls outside its exact-generation URL scope`);

  for (const base of baseline) {
    if (base.makerSlug !== record.makerSlug) continue;
    const relatedModel = record.modelSlug === base.modelSlug || record.modelSlug.startsWith(`${base.modelSlug}-`) || base.modelSlug.startsWith(`${record.modelSlug}-`);
    const sameHardware = record.boltPattern.holes === base.boltPattern.holes && record.boltPattern.diameterMm === base.boltPattern.diameterMm && Math.abs(record.centerBore - base.centerBore) <= 0.11;
    check(!(relatedModel && sameHardware && record.years.some((years) => base.years.some((baseYears) => overlaps(years, baseYears)))), `${record.id} semantically overlaps baseline record ${base.id}`);
  }
}

for (let index = 0; index < batch.length; index += 1) for (let other = index + 1; other < batch.length; other += 1) {
  const left = batch[index];
  const right = batch[other];
  const relatedModel = left.makerSlug === right.makerSlug && (left.modelSlug.startsWith(`${right.modelSlug}-`) || right.modelSlug.startsWith(`${left.modelSlug}-`));
  check(!relatedModel, `${left.id} and ${right.id} form a trim/body-style overlap`);
}

check(Object.entries(fixture.expected.markets).every(([market, count]) => (marketCounts[market] || 0) === count), 'Batch 6 market counts changed');
check(JSON.stringify(batchStatuses) === JSON.stringify(fixture.expected.batchStatuses), 'Batch 6 status counts changed');
check(sourceUrls.size === fixture.expected.sourceUrls, `Expected ${fixture.expected.sourceUrls} unique source URLs, found ${sourceUrls.size}`);
check(JSON.stringify(sourceBreakdown) === JSON.stringify(fixture.expected.sourceBreakdown), 'Batch 6 source breakdown changed');

const generated = generatedPcdFile(source);
const generatedOnDisk = fs.readFileSync(path.join(root, 'pcd-data.js'), 'utf8');
check(generatedPcdFileMatches(generatedOnDisk, generated), 'pcd-data.js is stale after Batch 6');

console.log(`PASS PCD Production Batch 6: ${batch.length} unique corroborated records`);
console.log(`PASS candidate audit: ${fixture.candidateAudit.considered} considered, ${fixture.candidateAudit.rejected} rejected/consolidated, ${fixture.candidateAudit.accepted} accepted`);
console.log(`PASS source coverage: ${fixture.candidateAudit.twoIndependentSources} two-source, ${fixture.candidateAudit.exactGenerationSingleSource} exact-generation single-source`);
console.log(`PASS markets: US=${marketCounts.US || 0}, EU=${marketCounts.EU || 0}, JP=${marketCounts.JP || 0}, OTHER=${marketCounts.OTHER || 0}, GLOBAL=${marketCounts.GLOBAL || 0}`);
