import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { generatedOilFile, generatedOilFileMatches, toPublicOilData } from '../../scripts/oil/generate.mjs';
import { loadCanonical, validateCanonical } from '../../scripts/oil/validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/oil/fixtures/batch-2-production.json'), 'utf8'));
const canonical = loadCanonical();
const summary = validateCanonical(canonical);
const batch = canonical.researchRecords;
const sha = (value) => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const publicData = toPublicOilData(canonical);
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');

assert.equal(fixture.baselineCount, 29);
assert.equal(fixture.quarantineCount, 59);
assert.equal(fixture.addedCount, 37);
assert.equal(fixture.researchAddedCount, 50);
assert.equal(batch.length, fixture.researchCount);
assert.equal(summary.records, fixture.finalCount);
assert.equal(summary.productionRecommendations, fixture.productionRecommendationCount);
assert.equal(summary.researchRecords, 13);
assert.equal(summary.legacyRecords, fixture.quarantineCount);
assert.deepEqual(summary.statuses, { legacyPending: 4, verified: 25, preliminary: 52 });
assert.deepEqual(summary.statuses, fixture.finalStatuses);
assert.deepEqual(summary.researchStatuses, fixture.researchStatuses);
assert.deepEqual(summary.researchStatuses, { preliminary: 13 });
assert.equal(sha(canonical.records.slice(0, fixture.baselineCount)), fixture.baselineSemanticHash);
assert.equal(sha(canonical.records.slice(0, fixture.baselineCount).map((r) => r.id)), fixture.baselineOrderHash);
assert.equal(sha(canonical.legacyRecords), fixture.baselineQuarantineHash);
const restoredBaseline = structuredClone(canonical);
delete restoredBaseline.researchRecords;
restoredBaseline.records = restoredBaseline.records.slice(0, fixture.baselineCount);
restoredBaseline.audit.selectableExactCodeRecordCount = fixture.baselineCount;
assert.equal(sha(restoredBaseline), fixture.baselineCanonicalHash);
assert.equal(sha(canonical.records), fixture.finalSemanticHash);
assert.equal(sha(canonical.records.map((r) => r.id)), fixture.finalOrderHash);
assert.equal(sha(canonical), fixture.finalCanonicalHash);
assert.equal(sha(fs.readFileSync(path.join(root, 'data/oil/canonical.json'), 'utf8').replace(/\r\n/g, '\n')), fixture.finalCanonicalFileHash);
assert.equal(sha(batch), fixture.researchSemanticHash);
assert.equal(sha(batch.map((r) => r.id)), fixture.researchOrderHash);
assert.equal(sha(batch.map((r) => r.sources.map((s) => s.url))), fixture.originalResearchSourceUrlsHash);
assert.equal(sha(batch.map(({ id, status, sources, notes, capacityNote, researchIssues, ...claims }) => ({ id, ...claims }))), fixture.originalResearchClaimsHash);
assert.equal(fixture.candidateAudit.considered, fixture.candidateAudit.acceptedProduction + fixture.candidateAudit.retainedPreliminary + fixture.candidateAudit.excluded);
assert.equal(fixture.candidateAudit.acceptedProduction, 37);
assert.equal(fixture.candidateAudit.retainedPreliminary, 13);
assert.equal(fixture.candidateAudit.exclusions.length, fixture.candidateAudit.excluded);
console.log('PASS 29 unchanged baseline + 37 partial cards, 13 preliminary research, 59 unchanged legacy quarantine; hashes and captured claims preserved');

const documents = new Map(fixture.documents.map((document) => [document.url, document]));
assert.equal(documents.size, 27);
const semantics = new Set();
for (const record of [...canonical.records, ...batch]) {
  const semantic = [record.make, record.model, record.generation, record.productionYears.from,
    record.productionYears.to, record.engineCode, [...record.market].sort().join(',')].join('|').toLowerCase();
  assert.ok(!semantics.has(semantic), `${record.id}: semantic duplicate`);
  semantics.add(semantic);
}
for (const [index, record] of batch.entries()) {
  const expected = fixture.researchRecords[index];
  const { identityEvidence, oilEvidence, industryEvidence, ...identity } = expected;
  for (const [field, value] of Object.entries(identity)) assert.deepEqual(record[field], value, `${record.id}: ${field}`);
  assert.equal(record.status, 'preliminary');
  assert.equal(record.make, 'Honda');
  assert.equal(record.legacyRecordId, null);
  assert.match(record.engineCode, /^[A-Z][A-Z0-9]+$/);
  assert.equal(record.productionYears.from, record.productionYears.to);
  assert.deepEqual(record.market, ['US']);
  assert.equal(record.capacityUnit, 'US qt');
  assert.ok(Number.isFinite(record.serviceFillCapacity) && record.serviceFillCapacity > 0, 'Preserve the captured value only in research');
  assert.deepEqual(record.researchIssues.slice(0, 3), [
    'Archived WORKING COPY provenance is unconfirmed.',
    'Capacity with filter has no confirmed official source.',
    'Applicability of capacity to the exact engine code is unproven.'
  ]);
  for (const language of ['en', 'es', 'fr', 'de']) {
    assert.match(record.notes[language], /WORKING COPY/);
    assert.match(record.capacityNote[language], /WORKING COPY/);
  }
  assert.match(record.notes.en, /not a production recommendation/);
  assert.match(record.capacityNote.en, /no confirmed official source/);
  assert.equal(record.sources.length, 3);
  for (const source of record.sources) {
    const document = documents.get(source.url);
    assert.ok(document, `${record.id}: lost research URL`);
    assert.match(document.sha256, /^[a-f0-9]{64}$/);
    assert.equal(source.publisher, document.publisher);
    assert.ok(source.evidenceNotes.length > 50);
    assert.deepEqual(source.applicableMarket, ['US']);
    assert.ok(source.applicableYears.from <= record.productionYears.from);
    assert.ok(source.applicableYears.to >= record.productionYears.to);
  }
  const vin = record.sources.find((s) => s.url === identityEvidence.url);
  assert.equal(new URL(vin.url).hostname, 'vpic.nhtsa.dot.gov');
  assert.deepEqual(vin.pageNumbers, identityEvidence.pageNumbers);
  assert.ok(vin.fields.includes('engineCode'));
  assert.ok(vin.evidenceNotes.includes(record.engineCode));
  for (const code of identityEvidence.modelCodes) assert.ok(vin.evidenceNotes.includes(code));
  const oil = record.sources.find((s) => s.url === oilEvidence.url);
  assert.deepEqual(oil.pageNumbers, oilEvidence.pageNumbers);
  assert.equal(oil.type, 'technicalReference');
  assert.equal(oil.provenanceStatus, 'unconfirmed');
  assert.equal(documents.get(oil.url).provenanceStatus, 'unconfirmed');
  assert.match(oil.evidenceNotes, /WORKING COPY provenance is unconfirmed/);
  assert.match(oil.evidenceNotes, /Capacity with filter has no confirmed official source/);
  assert.match(oil.evidenceNotes, /Applicability of capacity to the exact engine code is unproven/);
  assert.doesNotMatch(oil.evidenceNotes, /Original American Honda publication/);
  assert.ok(oil.evidenceNotes.includes(`${record.serviceFillCapacity} qt`));
  assert.ok(record.sources.some((s) => s.url === industryEvidence.url));
}
console.log('PASS all 13 remaining research records retain URLs, locators, identity evidence and captured quantities with explicit unresolved provenance/capacity warnings');

const generated = fs.readFileSync(path.join(root, 'oil-data.js'), 'utf8');
assert.ok(generatedOilFileMatches(generated, generatedOilFile(canonical)));
assert.deepEqual(publicData.records.slice(0, 29).map(({ evidenceAssessment, completeness, ...r }) => r), canonical.records.slice(0, 29));
assert.deepEqual(publicData.records.slice(29, 66).map(r=>r.id), fixture.publishedPartialIds);
assert.equal(publicData.records.length, 81);
assert.equal(publicData.legacyRecords.length, 59);
assert.ok(!Object.hasOwn(publicData, 'researchRecords'));
assert.ok(ui.cascade(publicData.records).makes.includes('Honda'));
assert.ok(!generated.includes('laboratoryb.org'));
for (const record of batch) {
  assert.ok(!generated.includes(record.id), `${record.id}: research leaked into browser payload`);
  assert.notEqual(ui.findRecord(publicData, record.id)?.type, 'record');
  assert.notEqual(ui.findRecord(publicData, record.engineCode)?.value.id, record.id);
  for (const lang of ['en', 'de']) {
    const state = ui.resolveUrlState(publicData, `https://d3orient.com/oil-guide.html?engine=${record.id}&make=Honda&lang=${lang}`);
    assert.equal(state.record, null);
    assert.equal(state.engine, '');
  }
}
for (const id of ['toyota-venza-2013-1ar-fe', 'toyota-tacoma-4wd-prerunner-2013-1gr-fe', 'bmw-e46-m54b25']) {
  assert.equal(ui.resolveUrlState(publicData, `https://d3orient.com/oil-guide.html?engine=${id}&lang=en`).record.id, id);
}
console.log('PASS public/generated parity; all 13 research-only IDs, capacities and archive source excluded from selectors, quick search and URL recommendations');

const expectFailure = (mutate, pattern) => {
  const copy = structuredClone(canonical);
  mutate(copy);
  assert.throws(() => validateCanonical(copy), pattern);
};
expectFailure((data) => {
  data.records.push(data.researchRecords.shift());
  data.audit.selectableExactCodeRecordCount++;
}, /preliminary records must stay in researchRecords/);
for (const status of ['verified', 'corroborated']) {
  expectFailure((data) => { data.researchRecords[0].status = status; }, /research records must remain preliminary/);
  for (const retainIssues of [true, false]) {
    const data = structuredClone(canonical);
    const record = data.researchRecords.shift();
    record.status = status;
    if (!retainIssues) delete record.researchIssues;
    data.records.push(record);
    data.audit.selectableExactCodeRecordCount++;
    assert.throws(() => validateCanonical(data), /unresolved research evidence cannot enter production recommendations/);
    const defended = toPublicOilData(data);
    assert.deepEqual(defended.records, publicData.records, 'Generator must defend against unconfirmed claims even if validation is bypassed');
  }
}
const bypass = structuredClone(canonical);
bypass.records.push(...bypass.researchRecords);
assert.deepEqual(toPublicOilData(bypass).records, publicData.records);
expectFailure((data) => { data.researchRecords[0].researchIssues = []; }, /researchIssues must explain/);
expectFailure((data) => { data.researchRecords[0].sources[0].pageNumbers = [0]; }, /unique positive integers/);
expectFailure((data) => { data.researchRecords[0].sources[0].evidenceNotes = ''; }, /evidenceNotes is required/);
expectFailure((data) => { data.records[0].status = 'verified'; }, /official source/);
const singlePublisher = structuredClone(canonical.records[4]);
singlePublisher.id = 'unsafe-single-publisher-corroboration';
singlePublisher.status = 'corroborated';
singlePublisher.productionYears = { from: 2099, to: 2099 };
expectFailure((data) => { data.records.push(singlePublisher); }, /two independent sources/);
for (const [file, expectedHash] of Object.entries(fixture.protectedFiles)) {
  assert.equal(sha(fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')), expectedHash, `${file}: protected dataset/UI/CI changed`);
}
console.log('PASS validator rejects research promotion/leakage; generator independently blocks it; verified/corroborated rules and protected PCD/Engine/UI/CI unchanged');
