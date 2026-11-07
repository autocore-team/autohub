import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { generatedOilFile, generatedOilFileMatches, toPublicOilData } from '../../scripts/oil/generate.mjs';
import { loadCanonical, officialSourceTypes, validateCanonical } from '../../scripts/oil/validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/oil/fixtures/batch-2-production.json'), 'utf8'));
const canonical = loadCanonical();
const summary = validateCanonical(canonical);
const baseline = canonical.records.slice(0, fixture.baselineCount);
const batch = canonical.records.slice(fixture.baselineCount);
const sha = (value) => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const publicData = toPublicOilData(canonical);
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');

assert.equal(fixture.baselineCount, 29);
assert.equal(fixture.quarantineCount, 59);
assert.equal(fixture.addedCount, 50);
assert.equal(batch.length, fixture.addedCount);
assert.equal(summary.records, fixture.finalCount);
assert.equal(summary.legacyRecords, fixture.quarantineCount);
assert.deepEqual(summary.statuses, fixture.finalStatuses);
assert.equal(sha(baseline), fixture.baselineSemanticHash);
assert.equal(sha(baseline.map((r) => r.id)), fixture.baselineOrderHash);
assert.equal(sha(canonical.legacyRecords), fixture.baselineQuarantineHash);
const restoredBaseline = structuredClone(canonical);
restoredBaseline.records = baseline;
restoredBaseline.audit.selectableExactCodeRecordCount = fixture.baselineCount;
assert.equal(sha(restoredBaseline), fixture.baselineCanonicalHash);
assert.equal(sha(canonical.records), fixture.finalSemanticHash);
assert.equal(sha(canonical.records.map((r) => r.id)), fixture.finalOrderHash);
assert.equal(sha(canonical), fixture.finalCanonicalHash);
assert.equal(sha(fs.readFileSync(path.join(root, 'data/oil/canonical.json'), 'utf8').replace(/\r\n/g, '\n')), fixture.finalCanonicalFileHash);
assert.equal(fixture.candidateAudit.considered, fixture.addedCount + fixture.candidateAudit.excluded);
assert.equal(fixture.candidateAudit.accepted, fixture.addedCount);
assert.equal(fixture.candidateAudit.exclusions.length, fixture.candidateAudit.excluded);
console.log('PASS Batch 2 exact count and immutable 29-record baseline, 59-record quarantine, order and canonical hashes');

const requiredFields = [
  'make', 'model', 'generation', 'productionYears', 'engineCode', 'displacementLiters',
  'fuelType', 'aspiration', 'market', 'allowedSaeViscosities', 'industrySpecifications',
  'serviceFillCapacity', 'capacityUnit'
];
const documents = new Map(fixture.documents.map((document) => [document.url, document]));
assert.equal(documents.size, fixture.documents.length);
assert.equal(documents.size, 27);
const semantics = new Set();
for (const record of canonical.records) {
  const semantic = [record.make, record.model, record.generation, record.productionYears.from,
    record.productionYears.to, record.engineCode, [...record.market].sort().join(',')].join('|').toLowerCase();
  assert.ok(!semantics.has(semantic), `${record.id}: semantic duplicate`);
  semantics.add(semantic);
}
assert.ok(batch.filter((r) => r.make !== 'Toyota').length >= 30);
assert.ok(batch.some((r) => !baseline.some((old) => old.make === r.make)));
assert.equal(batch.filter((r) => r.make === 'Honda').length, 50);

for (const [index, record] of batch.entries()) {
  const expected = fixture.records[index];
  const { identityEvidence, oilEvidence, industryEvidence, ...identity } = expected;
  for (const [field, value] of Object.entries(identity)) assert.deepEqual(record[field], value, `${record.id}: ${field}`);
  assert.ok(['verified', 'corroborated'].includes(record.status));
  assert.equal(record.legacyRecordId, null);
  assert.match(record.engineCode, /^[A-Z][A-Z0-9]+$/);
  assert.doesNotMatch(record.engineCode, /[\/,;]|\bfamily\b/i);
  assert.deepEqual(record.engineAliases, []);
  assert.equal(record.productionYears.from, record.productionYears.to, 'Do not extrapolate model years');
  assert.deepEqual(record.market, ['US']);
  assert.ok(record.displacementLiters > 0);
  assert.ok(['petrol', 'hybrid'].includes(record.fuelType));
  assert.ok(['naturallyAspirated', 'turbocharged'].includes(record.aspiration));
  assert.equal(record.capacityUnit, 'US qt');
  assert.ok(Number.isFinite(record.serviceFillCapacity) && record.serviceFillCapacity > 0);
  assert.match(record.capacityNote.en, /including a new oil filter/);
  assert.deepEqual(record.allowedSaeViscosities, ['0W-20']);
  assert.deepEqual(record.industrySpecifications, {
    acea: [], api: ['API Certification Seal (energy conserving; latest API requirement)'], ilsac: []
  });
  assert.deepEqual(record.requiredManufacturerApprovals, []);
  assert.deepEqual(record.preferredManufacturerApprovals, []);
  assert.equal(record.serviceInterval, null);
  assert.deepEqual(record.emissionsEquipment, { dpf: 'unknown', gpf: 'unknown', catalyst: 'unknown' });
  assert.match(record.notes.en, /emissions hardware by VIN/);
  assert.equal(record.checkedAt, '2026-11-07');
  assert.equal(record.sources.length, 3);
  const covered = new Set(record.sources.flatMap((source) => source.fields));
  for (const field of requiredFields) assert.ok(covered.has(field), `${record.id}: missing evidence for ${field}`);
  for (const source of record.sources) {
    const document = documents.get(source.url);
    assert.ok(document, `${record.id}: unreviewed source URL`);
    assert.match(document.sha256, /^[a-f0-9]{64}$/);
    assert.equal(source.publisher, document.publisher);
    assert.ok(officialSourceTypes.has(source.type));
    assert.ok(source.evidenceNotes.length > 50);
    assert.equal(source.checkedAt, record.checkedAt);
    assert.deepEqual(source.applicableMarket, record.market);
    assert.ok(source.applicableYears.from <= record.productionYears.from);
    assert.ok(source.applicableYears.to >= record.productionYears.to);
  }
  const vin = record.sources.find((s) => s.url === identityEvidence.url);
  assert.equal(new URL(vin.url).hostname, 'vpic.nhtsa.dot.gov');
  assert.deepEqual(vin.pageNumbers, identityEvidence.pageNumbers);
  assert.ok(vin.fields.includes('engineCode'));
  assert.ok(vin.evidenceNotes.includes(record.engineCode));
  assert.ok(vin.evidenceNotes.includes(String(record.productionYears.from)));
  assert.ok(identityEvidence.modelCodes.length);
  for (const modelCode of identityEvidence.modelCodes) {
    assert.ok(vin.evidenceNotes.includes(modelCode));
    assert.ok(record.generation.split('/').some((prefix) => modelCode.startsWith(prefix)));
  }
  const oil = record.sources.find((s) => s.url === oilEvidence.url);
  assert.deepEqual(oil.pageNumbers, oilEvidence.pageNumbers);
  assert.ok(oil.fields.includes('serviceFillCapacity'));
  assert.match(oil.evidenceNotes, /with filter/);
  assert.ok(oil.evidenceNotes.includes(`${record.serviceFillCapacity} qt`));
  const industry = record.sources.find((s) => s.url === industryEvidence.url);
  assert.ok(industry.fields.includes('industrySpecifications'));
  assert.match(industry.evidenceNotes, /No API service-category number/);
}
console.log('PASS 50 Honda verified exact-code applications, reviewed source locators, safe API requirements and with-filter capacities');

const generated = fs.readFileSync(path.join(root, 'oil-data.js'), 'utf8');
assert.ok(generatedOilFileMatches(generated, generatedOilFile(canonical)));
assert.deepEqual(publicData.records.slice(fixture.baselineCount), batch);
for (const record of batch) {
  assert.equal(ui.findRecord(publicData, record.id).value.id, record.id);
  const state = ui.resolveUrlState(publicData, `https://d3orient.com/oil-guide.html?engine=${record.id}&lang=en`);
  assert.equal(state.record.id, record.id);
  const selector = ui.cascade(publicData.records, { make: record.make, model: record.model });
  assert.ok(selector.variants.includes(`${record.generation}|||${record.productionYears.from}-${record.productionYears.to}`));
}
for (const id of ['honda-accord-coupe-2017-j35y2', 'honda-cr-v-2018-k24v9',
  'honda-civic-sedan-2018-l15by', 'honda-civic-type-r-2019-k20c1', 'honda-accord-hybrid-2019-lfb2']) {
  const state = ui.resolveUrlState(publicData, `https://d3orient.com/oil-guide.html?engine=${id}&lang=de`);
  assert.equal(state.record.id, id);
  const url = ui.selectionUrl('https://d3orient.com/oil-guide.html?lang=de', state, 'de');
  assert.equal(ui.resolveUrlState(publicData, url.href).record.id, id);
}
assert.equal(ui.resolveUrlState(publicData, 'https://d3orient.com/oil-guide.html?engine=missing&lang=en').record, null);
console.log('PASS canonical/generated parity, selector availability and URL round trips including alternate codes and hybrids');

for (const [file, expectedHash] of Object.entries(fixture.protectedFiles)) {
  assert.equal(sha(fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')), expectedHash, `${file}: protected dataset/UI/CI changed`);
}
const invalid = structuredClone(canonical);
invalid.records.at(-1).sources[0].pageNumbers = [0];
assert.throws(() => validateCanonical(invalid), /unique positive integers/);
invalid.records.at(-1).sources[0].pageNumbers = [3, 3];
assert.throws(() => validateCanonical(invalid), /unique positive integers/);
invalid.records.at(-1).sources[0].pageNumbers = [3, 4];
invalid.records.at(-1).sources[0].evidenceNotes = '';
assert.throws(() => validateCanonical(invalid), /evidenceNotes is required/);
console.log('PASS protected PCD/Engine datasets, Oil UI and CI hashes; evidence-locator validation');
