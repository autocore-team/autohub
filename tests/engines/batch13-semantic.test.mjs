import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';
import { engineIdentityCollisionErrors } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch13-scopes.json', import.meta.url)));
const coreSource = fs.readFileSync(new URL('../../assets/js/engine-search-core.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
vm.runInNewContext(coreSource, sandbox);
const core = sandbox.window.D3_ENGINE_SEARCH_CORE;
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');
const baselineLimits = { europe: 408, japan: 422, korea: 50, 'north-america': 114, 'south-america': 0 };
const baseline = data.regionFiles.flatMap((file) => file.records.slice(0, baselineLimits[file.region]));
const added = data.regionFiles.flatMap((file) => file.records.slice(baselineLimits[file.region]));

assert.equal(baseline.length, 994);
assert.equal(digest(baseline), '3da8657b2303cba6e3a21858c140c073b4f80f3503d822a3110cc2c43584b1d1');
assert.equal(fixture.candidatePool, 200);
assert.equal(fixture.targetMin, 100);
assert.equal(fixture.targetMax, 125);
assert.deepEqual(fixture.actualQuotas, fixture.requestedQuotas);
assert.equal(fixture.accepted, 100);
assert.equal(fixture.duplicates, 5);
assert.equal(fixture.holds, 95);
assert.equal(fixture.rejected, 0);
assert.equal(fixture.accepted + fixture.duplicates + fixture.holds + fixture.rejected, 200);
assert.equal(fixture.candidates.length, 200);
assert.equal(fixture.candidates.filter((entry) => entry.outcome === 'accepted').length, 100);
assert.equal(fixture.candidates.filter((entry) => entry.outcome === 'duplicate').length, 5);
assert.equal(fixture.candidates.filter((entry) => entry.outcome === 'hold').length, 95);
assert.equal(fixture.records.length, 100);
assert.equal(new Set(fixture.records.map((entry) => entry.id)).size, 100);
assert.deepEqual(added.map((record) => record.id), fixture.records.map((entry) => entry.id));
assert.equal(added.length, 100);
assert.equal(data.records.length, 1094);
assert.equal(digest(data.records), '56376a76431798b95d7d64873e4d6e5d4526ed6e23039abdd65ba47faf37ddd0');

assert.deepEqual(Object.fromEntries(['europe', 'japan', 'korea', 'north-america', 'south-america'].map((region) => [region, data.records.filter((record) => record.regionKey === region).length])), {
  europe: 508, japan: 422, korea: 50, 'north-america': 114, 'south-america': 0
});
assert.equal(added.filter((record) => record.verification.evidenceBasis === 'corroborated').length, 100);
assert.equal(added.filter((record) => record.completeness === 'core').length, 100);
assert.equal(added.filter((record) => record.identity.type === 'applicationScopedSpecification').length, 100);
assert.equal(added.filter((record) => Object.hasOwn(record, 'code')).length, 0);
assert.equal(added.filter((record) => Object.hasOwn(record.performance.powerKw, 'rpm') || Object.hasOwn(record.performance.torqueNm, 'rpm')).length, 0);
assert.equal(fixture.sourcePair.independent, true);

for (const expected of fixture.records) {
  const record = added.find((candidate) => candidate.id === expected.id);
  assert.ok(record, expected.id);
  assert.deepEqual(verificationPolicyErrors(record), [], record.id);
  assert.equal(record.identity.value, expected.identity);
  assert.equal(record.identity.type, 'applicationScopedSpecification');
  assert.equal(record.identity.review.manualReviewConfirmed, true);
  assert.equal(record.identity.review.codeOrDesignationNotClaimed, true);
  assert.equal(record.completeness, 'core');
  assert.equal(record.verification.evidenceBasis, 'corroborated');
  assert.match(record.layout, /\b\d+ valves\b/);
  assert.match(record.layout, /\b\d+ camshafts total\b/);
  assert.deepEqual(record.performance, expected.performance);
  assert.ok(record.verification.sources.every((source) => source.evidenceTier === 'B'));
  assert.ok(record.verification.sources.every((source) => source.dataOrigin === 'manufacturer-published-technical-specifications'));
  assert.ok(record.verification.sources.every((source) => source.contentRelationship === 'originalEditorial'));
  assert.equal(new Set(record.verification.sources.map((source) => source.publisher)).size >= 2, true);
  assert.equal(new Set(record.verification.sources.map((source) => source.owner)).size >= 2, true);
  assert.equal(new Set(record.verification.sources.map((source) => source.editorialTeam)).size >= 2, true);
  assert.equal(new Set(record.verification.sources.map((source) => new URL(source.url).hostname)).size >= 2, true);
  assert.ok(record.verification.sources.every((source) => source.fields.includes('layout.valves')));
  assert.ok(record.verification.sources.every((source) => source.fields.includes('layout.camshaftsTotal')));
  assert.ok(record.verification.sources.every((source) => !Object.hasOwn(source.scope, 'codes') && !Object.hasOwn(source.scope, 'designations')));
  for (const application of record.applications) {
    assert.equal(record.verification.sources.filter((source) => source.scope.applications.includes(application)).length, 2);
  }

  assert.equal(core.searchRecords(data.records, record.identity.value).some((candidate) => candidate.id === record.id), true);
  assert.equal(core.searchRecords(data.records, record.applications[0]).some((candidate) => candidate.id === record.id), true);
  assert.equal(core.resolveEngine(data.records, record.identity.value)?.id, record.id);
  assert.equal(core.identityDisplay(record, (key) => key).labelKey, 'applicationSpecificEngineSpecification');
  const restored = core.stateFromUrl(`https://d3orient.com/engines.html?engine=${encodeURIComponent(record.id)}`, data.records, ['europe', 'japan', 'korea', 'north-america', 'south-america'], ['en', 'es', 'fr', 'de']);
  assert.equal(restored.engine, record.id);
}

for (const consolidation of fixture.duplicateConsolidations) {
  assert.equal(added.some((record) => record.id === consolidation.absorbedId), false);
  const kept = added.find((record) => record.id === consolidation.keptId);
  assert.ok(kept);
  assert.equal(kept.applications.length, 2);
  assert.equal(kept.verification.sources.length, 4);
}

assert.deepEqual(engineIdentityCollisionErrors(data.records), []);
const applicationRecord = added.find((record) => record.applications.length === 1);
const cosmeticDuplicate = structuredClone(applicationRecord);
cosmeticDuplicate.id = `${cosmeticDuplicate.id}-cosmetic-copy`;
cosmeticDuplicate.identity.value = `${cosmeticDuplicate.identity.value} automatic AWD coupe 2025`;
cosmeticDuplicate.applications = cosmeticDuplicate.applications.map((application) => `${application} automatic AWD coupe 2025`);
assert.ok(engineIdentityCollisionErrors([...data.records, cosmeticDuplicate]).length > 0, 'Duplicate guard accepted a trim/year/body/drivetrain split');

const materialCalibration = structuredClone(cosmeticDuplicate);
materialCalibration.id = `${materialCalibration.id}-material-calibration`;
materialCalibration.performance.powerKw.min += 1;
materialCalibration.performance.powerKw.max += 1;
assert.equal(engineIdentityCollisionErrors([...data.records, materialCalibration]).some((error) => error.includes(materialCalibration.id)), false, 'Materially different calibration was rejected');

console.log(`PASS Batch 13: 100 applicationScopedSpecification, 5 consolidations, 95 holds, baseline ${digest(baseline)}, dataset ${digest(data.records)}`);
