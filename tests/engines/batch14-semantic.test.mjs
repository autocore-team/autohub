import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';
import { engineIdentityCollisionErrors } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch14-scopes.json', import.meta.url)));
const coreSource = fs.readFileSync(new URL('../../assets/js/engine-search-core.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
vm.runInNewContext(coreSource, sandbox);
const core = sandbox.window.D3_ENGINE_SEARCH_CORE;
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');
const baselineLimits = { europe: 508, japan: 422, korea: 50, 'north-america': 114, 'south-america': 0 };
const baseline = data.regionFiles.flatMap((file) => file.records.slice(0, baselineLimits[file.region]));
const added = data.records.filter((record) => record.id.startsWith('batch14-'));

assert.equal(baseline.length, 1094);
assert.equal(digest(baseline), '56376a76431798b95d7d64873e4d6e5d4526ed6e23039abdd65ba47faf37ddd0');
assert.equal(fixture.candidatePool, 200);
assert.equal(fixture.targetMin, 100);
assert.equal(fixture.targetMax, 125);
assert.deepEqual(fixture.actualQuotas, fixture.requestedQuotas);
assert.deepEqual(fixture.reserveManufacturersUsed, []);
assert.equal(fixture.accepted, 108);
assert.equal(fixture.duplicates, 3);
assert.equal(fixture.holds, 89);
assert.equal(fixture.rejected, 0);
assert.equal(fixture.accepted + fixture.duplicates + fixture.holds + fixture.rejected, 200);
assert.equal(fixture.candidates.length, 200);
assert.equal(fixture.candidates.filter((entry) => entry.outcome === 'accepted').length, 108);
assert.equal(fixture.candidates.filter((entry) => entry.outcome === 'duplicate').length, 3);
assert.equal(fixture.candidates.filter((entry) => entry.outcome === 'hold').length, 89);
assert.equal(fixture.records.length, 108);
assert.equal(new Set(fixture.records.map((entry) => entry.id)).size, 108);
assert.deepEqual(added.map((record) => record.id).sort(), fixture.records.map((entry) => entry.id).sort());
assert.equal(added.length, 108);
assert.equal(data.records.length, 1202);
assert.equal(digest(data.records), 'fdde0fa624ff1ec32f9abb60b5759df7b413ca16d5af1391e946dd2c083b61f2');

assert.deepEqual(Object.fromEntries(['europe', 'japan', 'korea', 'north-america', 'south-america'].map((region) => [region, data.records.filter((record) => record.regionKey === region).length])), {
  europe: 537, japan: 445, korea: 65, 'north-america': 155, 'south-america': 0
});
assert.deepEqual(fixture.identityBreakdown, { exactCode: 45, applicationScopedSpecification: 63 });
assert.deepEqual(fixture.evidenceBreakdown, { corroborated: 108 });
assert.deepEqual(fixture.completenessBreakdown, { core: 108 });
assert.equal(fixture.withoutRpm, 108);
assert.equal(added.filter((record) => record.verification.evidenceBasis === 'corroborated').length, 108);
assert.equal(added.filter((record) => record.completeness === 'core').length, 108);
assert.equal(added.filter((record) => record.identity.type === 'exactCode').length, 45);
assert.equal(added.filter((record) => record.identity.type === 'applicationScopedSpecification').length, 63);
assert.equal(added.filter((record) => Object.hasOwn(record.performance.powerKw, 'rpm') || Object.hasOwn(record.performance.torqueNm, 'rpm')).length, 0);
assert.equal(fixture.sourcePair.independent, true);
assert.equal(added.reduce((total, record) => total + record.verification.sources.length, 0), 222);

for (const expected of fixture.records) {
  const record = added.find((candidate) => candidate.id === expected.id);
  assert.ok(record, expected.id);
  assert.deepEqual(verificationPolicyErrors(record), [], record.id);
  assert.equal(record.identity.value, expected.identity);
  assert.equal(record.identity.type, expected.identityType);
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
  for (const application of record.applications) {
    assert.equal(record.verification.sources.filter((source) => source.scope.applications.includes(application)).length, 2);
  }

  if (record.identity.type === 'exactCode') {
    assert.equal(record.code, expected.code);
    assert.equal(record.identity.value, record.code);
    assert.ok(record.verification.sources.every((source) => source.fields.includes('code')));
    assert.ok(record.verification.sources.every((source) => source.scope.codes?.includes(record.code)));
  } else {
    assert.equal(record.identity.review.manualReviewConfirmed, true);
    assert.equal(record.identity.review.codeOrDesignationNotClaimed, true);
    assert.ok(record.verification.sources.every((source) => !Object.hasOwn(source.scope, 'codes')));
  }

  assert.equal(core.searchRecords(data.records, record.identity.value).some((candidate) => candidate.id === record.id), true);
  assert.equal(core.searchRecords(data.records, record.applications[0]).some((candidate) => candidate.id === record.id), true);
  if (record.identity.type === 'applicationScopedSpecification') {
    assert.equal(core.resolveEngine(data.records, record.identity.value)?.id, record.id);
  }
  const expectedLabel = record.identity.type === 'exactCode' ? 'engineCodeLabel' : 'applicationSpecificEngineSpecification';
  assert.equal(core.identityDisplay(record, (key) => key).labelKey, expectedLabel);
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

const auditedOutcomes = Object.fromEntries(fixture.candidates.filter((entry) => [
  'batch14-fiat-punto-hgt-1999',
  'batch14-saab-9-3-viggen-1999',
  'batch14-ssangyong-rodius-2-7-xdi-2005',
  'batch14-ssangyong-actyon-2-0-xdi-2006'
].includes(entry.id)).map((entry) => [entry.id, entry.outcome]));
assert.deepEqual(auditedOutcomes, {
  'batch14-fiat-punto-hgt-1999': 'hold',
  'batch14-saab-9-3-viggen-1999': 'accepted',
  'batch14-ssangyong-rodius-2-7-xdi-2005': 'hold',
  'batch14-ssangyong-actyon-2-0-xdi-2006': 'hold'
});
assert.deepEqual(added.find((record) => record.id === 'batch14-saab-9-3-viggen-1999').performance, {
  powerKw: { min: 169, max: 169 }, torqueNm: { min: 350, max: 350 }
});
assert.deepEqual(added.find((record) => record.id === 'batch14-genesis-g80-5-0-2017').performance, {
  powerKw: { min: 313, max: 313 }, torqueNm: { min: 519, max: 519 }
});
assert.equal(added.find((record) => record.id === 'batch14-fiat-barchetta-1995').applications.length, 1);
assert.equal(added.find((record) => record.id === 'batch14-saab-9000-aero-1993').applications.length, 1);
assert.equal(added.find((record) => record.id === 'batch14-ssangyong-rexton-2-7-xdi-2004').applications.length, 1);
assert.equal(added.find((record) => record.id === 'batch14-ssangyong-kyron-2-0-xdi-2006').applications.length, 1);

assert.deepEqual(engineIdentityCollisionErrors(data.records), []);
const applicationRecord = added.find((record) => record.identity.type === 'applicationScopedSpecification' && record.applications.length === 1);
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

console.log(`PASS Batch 14: 108 records, 45 exactCode, 63 applicationScopedSpecification, 3 consolidations, 89 holds, baseline ${digest(baseline)}, dataset ${digest(data.records)}`);
