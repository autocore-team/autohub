import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedOilFile, generatedOilFileMatches, toPublicOilData } from '../../scripts/oil/generate.mjs';
import { loadCanonical, validateCanonical } from '../../scripts/oil/validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const canonical = loadCanonical();
const summary = validateCanonical(canonical);
const expectFailure = (mutate, pattern) => {
  const copy = structuredClone(canonical);
  mutate(copy);
  assert.throws(() => validateCanonical(copy), pattern);
};

assert.equal(summary.records, 74);
assert.equal(summary.legacyRecords, 59);
assert.deepEqual(summary.statuses, { legacyPending: 4, verified: 25, preliminary: 45 });
assert.equal(canonical.audit.originalRecordCount, 59);
assert.equal(canonical.legacyRecords.filter((record) => record.productionReady).length, 0);
assert.ok(canonical.legacyRecords.every((record) => record.migrationStatus === 'legacyPending' && record.migrationIssues.length));
console.log('PASS oil schema and safe migration audit: 59 legacy records retained, 4 placeholders plus 25 verified records selectable');

const generated = fs.readFileSync(path.join(root, 'oil-data.js'), 'utf8');
assert.ok(generatedOilFileMatches(generated, generatedOilFile(canonical)));
const publicData = toPublicOilData(canonical);
assert.equal(publicData.records.length, 74);
assert.equal(publicData.legacyRecords.length, 59);
assert.ok(publicData.legacyRecords.every((record) => !Object.hasOwn(record, 'viscosities') && !Object.hasOwn(record, 'approvals') && !Object.hasOwn(record, 'capacity')));
console.log('PASS canonical/generated parity and legacy-claim quarantine');

const m54 = canonical.records.filter((record) => record.legacyRecordId === 'bmw-e46-m54');
assert.deepEqual(m54.map((record) => record.engineCode).sort(), ['M54B22', 'M54B25', 'M54B30']);
assert.equal(new Set(m54.map((record) => record.id)).size, 3);
assert.ok(m54.every((record) => record.serviceFillCapacity === null && record.allowedSaeViscosities.length === 0 && record.requiredManufacturerApprovals.length === 0));
console.log('PASS BMW M54B22/M54B25/M54B30 are separate and publish no unsupported critical claims');

expectFailure((data) => { data.records[0].engineCode = ''; }, /engineCode is required/);
expectFailure((data) => { data.records[0].productionYears.from = 2007; }, /invalid year range/);
expectFailure((data) => { data.records[0].sources = []; }, /empty source list/);
expectFailure((data) => { data.records[0].status = 'trusted'; }, /unsupported status/);
expectFailure((data) => { data.records[0].engineCode = 'M54B22 \/ M54B25'; }, /combines multiple engine codes/);
expectFailure((data) => { data.records[0].serviceFillCapacity = 6.5; }, /capacity requires a supported unit/);
expectFailure((data) => { data.records[0].sources[0].publisher = ''; }, /publisher is required/);
expectFailure((data) => { data.records[0].status = 'verified'; }, /official source/);
expectFailure((data) => { data.records[1] = structuredClone(data.records[0]); data.records[1].id = 'different-id'; }, /duplicates a semantic oil record/);
expectFailure((data) => { data.records[0].requiredManufacturerApprovals = ['BMW Longlife-01']; data.records[0].preferredManufacturerApprovals = ['BMW Longlife-01']; }, /contradictory required\/preferred approval/);
expectFailure((data) => { data.records[0].allowedSaeViscosities = ['5W-30']; }, /without source coverage/);
console.log('PASS oil validator rejects missing identity/source fields, unsafe statuses, semantic duplicates and unsupported claims');
