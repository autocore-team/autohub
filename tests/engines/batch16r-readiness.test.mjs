import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';
import { engineIdentityCollisionErrors } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch16r-readiness.json', import.meta.url)));
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');
const baselineLimits = { europe: 624, japan: 448, korea: 65, 'north-america': 165, 'south-america': 0 };
const baseline = data.regionFiles.flatMap((file) => file.records.slice(0, baselineLimits[file.region]));
const added = data.records.filter((record) => record.id.startsWith('batch16r-'));

assert.equal(fixture.batch, '16R');
assert.deepEqual(fixture.production.initialProvisional, 110);
assert.deepEqual(fixture.production.removedCollisions, 29);
assert.deepEqual(fixture.production.retained, 81);
assert.deepEqual(fixture.production.replacements, 19);
assert.deepEqual(fixture.production.accepted, 100);
assert.equal(fixture.production.removedCollisionIds.length, 29);
assert.equal(new Set(fixture.production.removedCollisionIds).size, 29);
assert.equal(fixture.qualifiedCandidates.length, 100);
assert.equal(new Set(fixture.qualifiedCandidates.map((candidate) => candidate.candidateId)).size, fixture.qualifiedCandidates.length);
assert.equal(new Set(fixture.qualifiedCandidates.map((candidate) => candidate.maker)).size, 19);

const allowedStatuses = new Set(fixture.matrixFormat.allowedStatuses);
for (const profile of Object.values(fixture.coverageProfiles)) {
  for (const [field, coverage] of Object.entries(profile)) {
    assert.ok(allowedStatuses.has(coverage[0]), `${field}: invalid coverage status`);
    assert.ok(Array.isArray(coverage[1]) && coverage[1].length > 0, `${field}: missing source references`);
    assert.ok(Array.isArray(coverage[2]) && coverage[2].length > 0, `${field}: missing evidence locations`);
    if (coverage[0] === 'derived') {
      assert.equal(typeof coverage[3], 'string', `${field}: missing derivation formula`);
      assert.match(coverage[3], /explicit|inline engine/i, `${field}: derivation is not deterministic`);
    }
  }
}

for (const candidate of fixture.qualifiedCandidates) {
  assert.equal(candidate.proposedIdentityType, 'applicationScopedSpecification');
  assert.ok(fixture.coverageProfiles[candidate.coverageProfile], `${candidate.candidateId}: unknown coverage profile`);
  assert.deepEqual(Object.keys(candidate.sources).sort(), ['a', 'b']);
  const sources = Object.values(candidate.sources);
  assert.equal(new Set(sources.map((source) => source.publisher)).size, 2, `${candidate.candidateId}: publishers are not independent`);
  assert.equal(new Set(sources.map((source) => new URL(source.url).hostname.replace(/^www\./, ''))).size, 2, `${candidate.candidateId}: source domains are not independent`);
  assert.ok(sources.every((source) => source.location.length > 0), `${candidate.candidateId}: missing evidence location`);
  assert.equal(candidate.duplicatePrecheck, 'clear against 1302-record baseline');
  assert.ok(candidate.spec && Number.isFinite(candidate.spec.displacementCc), `${candidate.candidateId}: missing displacement`);
  assert.ok(Number.isFinite(candidate.spec.powerKw), `${candidate.candidateId}: missing power`);
  assert.ok(Number.isFinite(candidate.spec.torqueNm), `${candidate.candidateId}: missing torque`);
  assert.match(candidate.spec.configuration, /^Inline \d+$/, `${candidate.candidateId}: unsupported layout`);
  assert.ok(['DOHC', 'SOHC'].includes(candidate.spec.valvetrain), `${candidate.candidateId}: unsupported valvetrain`);
  assert.ok(Number.isInteger(candidate.spec.totalValves) && candidate.spec.totalValves > 0, `${candidate.candidateId}: missing total valves`);
  assert.ok(['Petrol', 'Diesel'].includes(candidate.spec.fuel), `${candidate.candidateId}: unsupported fuel`);
  assert.ok(['Natural', 'Turbo', 'Bi-Turbo', 'Supercharged'].includes(candidate.spec.aspiration), `${candidate.candidateId}: unsupported aspiration`);
  assert.ok(['Direct Injection', 'Multi-point', 'Common Rail'].includes(candidate.spec.injection), `${candidate.candidateId}: unsupported injection`);
}

assert.equal(baseline.length, fixture.baseline.records);
assert.equal(digest(baseline), fixture.baseline.semanticHash);
assert.equal(added.length, 100);
assert.deepEqual(added.map((record) => record.id).sort(), fixture.qualifiedCandidates.map((candidate) => candidate.candidateId).sort());
assert.equal(data.records.length, 1402);
assert.equal(data.records.filter((record) => record.verification.status === 'verified').length, 1313);
assert.equal(data.records.filter((record) => record.verification.status === 'legacyPending').length, 89);
assert.equal(digest(data.records), '9d59b7f6c29489f2eb1de47662412d16ce6cd0bd6b0db8431a2fc782e76b7a23');
assert.deepEqual(Object.fromEntries(['europe', 'japan', 'korea', 'north-america', 'south-america'].map((region) => [
  region,
  data.records.filter((record) => record.regionKey === region).length
])), { europe: 715, japan: 451, korea: 65, 'north-america': 171, 'south-america': 0 });

assert.equal(added.filter((record) => record.identity.type === 'applicationScopedSpecification').length, 100);
assert.equal(added.filter((record) => record.verification.evidenceBasis === 'corroborated').length, 100);
assert.equal(added.filter((record) => record.completeness === 'core').length, 100);
assert.equal(added.filter((record) => Object.hasOwn(record.performance.powerKw, 'rpm') || Object.hasOwn(record.performance.torqueNm, 'rpm')).length, 0);
assert.equal(added.reduce((total, record) => total + record.verification.sources.length, 0), 200);
for (const record of added) {
  assert.deepEqual(verificationPolicyErrors(record), [], record.id);
  assert.equal(record.identity.review.manualReviewConfirmed, true);
  assert.equal(record.identity.review.codeOrDesignationNotClaimed, true);
  assert.match(record.layout, /\b\d+ valves\b/);
  assert.match(record.layout, /\b\d+ camshafts? total\b/);
  assert.equal(record.verification.sources.length, 2);
  assert.equal(new Set(record.verification.sources.map((source) => source.publisher)).size, 2);
  assert.equal(new Set(record.verification.sources.map((source) => new URL(source.url).hostname)).size, 2);
  assert.ok(record.verification.sources.every((source) => source.scope.level === 'exactVariant'));
}
assert.deepEqual(engineIdentityCollisionErrors(data.records), []);
assert.deepEqual(fixture.result, {
  qualified: 100,
  ready: 100,
  holds: 1,
  rejected: 29,
  accepted: 100,
  canonicalChanged: true,
  generatorRun: true,
  enginesCheckRun: true,
  fullNpmTestRun: true
});

console.log(`PASS Batch 16R: 81 retained + 19 replacements = 100 accepted, baseline ${digest(baseline)}, dataset ${digest(data.records)}`);
