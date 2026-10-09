import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';
import { engineIdentityCollisionErrors } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch12-scopes.json', import.meta.url)));
const coreSource = fs.readFileSync(new URL('../../assets/js/engine-search-core.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
vm.runInNewContext(coreSource, sandbox);
const core = sandbox.window.D3_ENGINE_SEARCH_CORE;
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');
const baselineLimits = { europe: 345, japan: 416, korea: 50, 'north-america': 110, 'south-america': 0 };
const baseline = data.regionFiles.flatMap((file) => file.records.slice(0, baselineLimits[file.region]));
const batch12Limits = { europe: 408, japan: 422, korea: 50, 'north-america': 114, 'south-america': 0 };
const batch12Checkpoint = data.regionFiles.flatMap((file) => file.records.slice(0, batch12Limits[file.region]));
const fixtureIds = new Set(fixture.records.map((entry) => entry.id));
const added = data.records.filter((record) => fixtureIds.has(record.id));

assert.equal(baseline.length, 921);
assert.equal(digest(baseline), '470d47d40d34f08bbe9b35749541f747f9ec7e9880bc25609ceb1c4c3a8e096c');
assert.equal(fixture.candidatePool, 180);
assert.equal(fixture.maximumBatchSize, 75);
assert.equal(fixture.originalAcceptedCandidates, 75);
assert.equal(fixture.restoredExactCode, 28);
assert.equal(fixture.reviewedApplicationScopedCandidates, 47);
assert.equal(fixture.restoredApplicationScopedSpecification, 45);
assert.equal(fixture.previousDuplicates, 25);
assert.equal(fixture.consolidationDuplicates.length, 2);
assert.equal(fixture.holds, 70);
assert.equal(fixture.rejected, 10);
assert.equal(28 + 47 + 25 + 70 + 10, 180);
assert.equal(28 + 45 + 2, 75);
assert.equal(fixture.records.length, 73);
assert.equal(new Set(fixture.records.map((entry) => entry.id)).size, 73);
assert.deepEqual(added.map((record) => record.id), fixture.records.map((entry) => entry.id));
assert.equal(added.length, 73);
assert.equal(batch12Checkpoint.length, 994);
assert.equal(digest(batch12Checkpoint), '3da8657b2303cba6e3a21858c140c073b4f80f3503d822a3110cc2c43584b1d1');
assert.ok(data.records.length >= 994);

assert.deepEqual(Object.fromEntries(['europe', 'japan', 'korea', 'north-america', 'south-america'].map((region) => [region, batch12Checkpoint.filter((record) => record.regionKey === region).length])), {
  europe: 408, japan: 422, korea: 50, 'north-america': 114, 'south-america': 0
});
assert.equal(added.filter((record) => record.verification.evidenceBasis === 'corroborated').length, 73);
assert.equal(added.filter((record) => record.completeness === 'core').length, 73);
assert.equal(added.filter((record) => record.identity.type === 'exactCode').length, 28);
assert.equal(added.filter((record) => record.identity.type === 'applicationScopedSpecification').length, 45);
assert.equal(added.filter((record) => record.identity.type === 'officialPublicDesignation').length, 0);
assert.equal(added.flatMap((record) => record.verification.sources).filter((source) => source.evidenceTier === 'B').length, 150);
assert.equal(fixture.sourcePair.independent, true);
assert.equal(fixture.sourcePair.commonOriginAllowed, 'manufacturer-published-technical-specifications');

for (const expected of fixture.records) {
  const record = added.find((candidate) => candidate.id === expected.id);
  assert.ok(record, expected.id);
  assert.deepEqual(verificationPolicyErrors(record), [], record.id);
  assert.equal(record.identity.value, expected.identity);
  assert.equal(record.identity.type, expected.identityType);
  assert.equal(record.completeness, 'core');
  assert.equal(record.verification.evidenceBasis, 'corroborated');
  assert.equal(record.layout.includes(`${expected.valves} valves`), true);
  assert.equal(record.layout.includes(`${expected.cams} camshaft${expected.cams === 1 ? '' : 's'} total`), true);
  assert.deepEqual(record.performance, expected.performance);
  assert.equal(Object.hasOwn(record.performance.powerKw, 'rpm'), false);
  assert.equal(Object.hasOwn(record.performance.torqueNm, 'rpm'), false);
  assert.ok(record.verification.sources.every((source) => source.dataOrigin === 'manufacturer-published-technical-specifications'));
  assert.ok(record.verification.sources.every((source) => source.contentRelationship === 'originalEditorial'));
  assert.equal(new Set(record.verification.sources.map((source) => source.publisher)).size >= 2, true);
  assert.equal(new Set(record.verification.sources.map((source) => source.owner)).size >= 2, true);
  assert.equal(new Set(record.verification.sources.map((source) => source.editorialTeam)).size >= 2, true);
  assert.equal(new Set(record.verification.sources.map((source) => new URL(source.url).hostname)).size >= 2, true);

  if (record.identity.type === 'exactCode') {
    assert.equal(record.code, expected.code);
    assert.ok(record.verification.sources.every((source) => source.fields.includes('code')));
    assert.ok(record.verification.sources.every((source) => source.scope.codes.includes(record.code)));
  } else {
    assert.equal(Object.hasOwn(record, 'code'), false);
    assert.equal(record.identity.review.manualReviewConfirmed, true);
    assert.equal(record.identity.review.codeOrDesignationNotClaimed, true);
    assert.ok(record.verification.sources.every((source) => source.fields.includes('identity.applicationScopedSpecification')));
    assert.ok(record.verification.sources.every((source) => !Object.hasOwn(source.scope, 'codes') && !Object.hasOwn(source.scope, 'designations')));
    for (const application of record.applications) {
      assert.equal(record.verification.sources.filter((source) => source.scope.applications.includes(application)).length, 2);
    }
  }

  assert.equal(core.searchRecords(data.records, record.identity.value).some((candidate) => candidate.id === record.id), true);
  assert.equal(core.searchRecords(data.records, record.applications[0]).some((candidate) => candidate.id === record.id), true);
  const resolvedIdentity = core.resolveEngine(data.records, record.identity.value);
  if (record.identity.type === 'exactCode') assert.equal(resolvedIdentity?.code, record.code);
  else assert.equal(resolvedIdentity?.id, record.id);
  const restored = core.stateFromUrl(`https://d3orient.com/engines.html?engine=${encodeURIComponent(record.id)}`, data.records, ['europe', 'japan', 'korea', 'north-america', 'south-america'], ['en', 'es', 'fr', 'de']);
  assert.equal(restored.engine, record.id);
  const expectedLabelKey = record.identity.type === 'exactCode' ? 'engineCodeLabel' : 'applicationSpecificEngineSpecification';
  assert.equal(core.identityDisplay(record, (key) => key).labelKey, expectedLabelKey);
}

for (const consolidation of fixture.consolidationDuplicates) {
  assert.equal(added.some((record) => record.id === consolidation.absorbed), false);
  const kept = added.find((record) => record.id === consolidation.kept);
  assert.ok(kept);
  assert.equal(kept.identity.type, 'applicationScopedSpecification');
  assert.equal(kept.applications.length, 2);
  assert.equal(kept.verification.sources.length, 4);
}

assert.deepEqual(engineIdentityCollisionErrors(data.records), []);
const applicationRecord = added.find((record) => record.identity.type === 'applicationScopedSpecification');
const cosmeticDuplicate = structuredClone(applicationRecord);
cosmeticDuplicate.id = `${cosmeticDuplicate.id}-cosmetic-copy`;
cosmeticDuplicate.identity.value = `${cosmeticDuplicate.identity.value} automatic AWD coupe 2025`;
cosmeticDuplicate.applications = cosmeticDuplicate.applications.map((application) => `${application} automatic AWD coupe 2025`);
assert.ok(engineIdentityCollisionErrors([...data.records, cosmeticDuplicate]).length > 0, 'Application specification duplicate guard accepted a trim/year/body/drivetrain split');

const materialCalibration = structuredClone(cosmeticDuplicate);
materialCalibration.id = `${materialCalibration.id}-material-calibration`;
materialCalibration.performance.powerKw.min += 1;
materialCalibration.performance.powerKw.max += 1;
assert.equal(engineIdentityCollisionErrors([...data.records, materialCalibration]).some((error) => error.includes(materialCalibration.id)), false, 'Materially different calibration was rejected as a cosmetic duplicate');

console.log(`PASS Batch 12: 28 exactCode + 45 applicationScopedSpecification, 2 consolidations, 150 independent Tier B publications, baseline ${digest(baseline)}, dataset ${digest(data.records)}`);
