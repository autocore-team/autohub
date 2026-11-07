import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { generatedOilFile, generatedOilFileMatches, toPublicOilData } from '../../scripts/oil/generate.mjs';
import { loadCanonical, officialSourceTypes, validateCanonical } from '../../scripts/oil/validate.mjs';

const require = createRequire(import.meta.url);
const ui = require('../../assets/js/oil-guide.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/oil/fixtures/batch-1-production.json'), 'utf8'));
const canonical = loadCanonical();
const summary = validateCanonical(canonical);
const baseline = canonical.records.slice(0, fixture.baselineCount);
const batch = canonical.records.slice(fixture.baselineCount);
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

assert.equal(summary.records, fixture.finalCount);
assert.equal(summary.legacyRecords, fixture.quarantineCount);
assert.equal(batch.length, fixture.addedCount);
assert.equal(fixture.candidateAudit.considered, fixture.candidateAudit.accepted + fixture.candidateAudit.excluded);
assert.equal(fixture.candidateAudit.accepted, fixture.addedCount);
assert.equal(Object.values(fixture.candidateAudit.exclusionCategories).reduce((sum, value) => sum + value, 0), fixture.candidateAudit.excluded);
assert.equal(sha256(JSON.stringify(baseline)), fixture.baselineSemanticHash);
assert.equal(sha256(JSON.stringify(baseline.map((record) => record.id))), fixture.baselineOrderHash);
assert.deepEqual(
  batch.map(({ id, engineCode, serviceFillCapacity, capacityUnit, status }) => ({ id, engineCode, serviceFillCapacity, capacityUnit, status })),
  fixture.records
);
console.log('PASS Batch 1 exact count, fixture composition and immutable baseline hashes');

const requiredEvidence = [
  'make', 'model', 'generation', 'productionYears', 'engineCode',
  'displacementLiters', 'fuelType', 'aspiration', 'market',
  'allowedSaeViscosities', 'industrySpecifications',
  'serviceFillCapacity', 'capacityUnit'
];
const semantics = new Set();
for (const record of batch) {
  assert.ok(['verified', 'corroborated'].includes(record.status), `${record.id} has an unsafe status`);
  assert.equal(record.legacyRecordId, null, `${record.id} must not pretend to be a migrated legacy record`);
  assert.doesNotMatch(record.engineCode, /[\/,;]|\b(?:family|or)\b/i);
  assert.ok(record.displacementLiters > 0);
  assert.deepEqual(record.market, ['US']);
  assert.ok(record.allowedSaeViscosities.length > 0);
  assert.ok(Object.values(record.industrySpecifications).some((values) => values.length > 0));
  assert.ok(record.serviceFillCapacity > 0);
  assert.equal(record.capacityUnit, 'US qt');
  assert.equal(record.sources.length, 2, `${record.id} must retain both primary and supporting evidence`);
  assert.ok(record.sources.some((source) => officialSourceTypes.has(source.type) && source.url.includes('toyota.com/')));
  const covered = new Set(record.sources.flatMap((source) => source.fields));
  for (const field of requiredEvidence) assert.ok(covered.has(field), `${record.id} lacks field evidence for ${field}`);
  assert.deepEqual(Object.keys(record.emissionsEquipment).sort(), ['catalyst', 'dpf', 'gpf']);
  assert.ok(Object.values(record.emissionsEquipment).every((value) => ['present', 'absent', 'unknown'].includes(value)));
  assert.match(record.notes.en, /emissions hardware by VIN/);
  const requiredApprovals = new Set(record.requiredManufacturerApprovals);
  for (const approval of record.preferredManufacturerApprovals) assert.ok(!requiredApprovals.has(approval));
  const semantic = [
    record.make, record.model, record.generation,
    record.productionYears.from, record.productionYears.to,
    record.engineCode, [...record.market].sort().join(',')
  ].join('|').toLowerCase();
  assert.ok(!semantics.has(semantic), `${record.id} is a semantic duplicate`);
  semantics.add(semantic);
}
assert.notEqual(
  batch.find((record) => record.id === 'toyota-tacoma-2wd-2013-1gr-fe').serviceFillCapacity,
  batch.find((record) => record.id === 'toyota-tacoma-4wd-prerunner-2013-1gr-fe').serviceFillCapacity
);
console.log('PASS verified source minimums, field coverage, exact-code applications, capacity, emissions and approval safety');

const generated = fs.readFileSync(path.join(root, 'oil-data.js'), 'utf8');
assert.ok(generatedOilFileMatches(generated, generatedOilFile(canonical)));
assert.deepEqual(toPublicOilData(canonical).records.slice(fixture.baselineCount), batch);
for (const record of batch) {
  const selection = ui.findRecord(toPublicOilData(canonical), record.id);
  assert.equal(selection.type, 'record');
  assert.equal(selection.value.id, record.id);
}
for (const id of ['toyota-venza-2013-1ar-fe', 'toyota-tacoma-4wd-prerunner-2013-1gr-fe', 'toyota-prius-2013-2zr-fxe']) {
  const restored = ui.resolveUrlState(toPublicOilData(canonical), `https://d3orient.com/oil-guide.html?engine=${id}&lang=en`);
  assert.equal(restored.record.id, id);
}
const uniqueUrls = new Set(batch.flatMap((record) => record.sources.map((source) => source.url)));
assert.equal(uniqueUrls.size, 18);
console.log('PASS canonical/generated parity, selector availability, representative URLs and 18 unique evidence URLs');
