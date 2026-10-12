import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch17-readiness.json', import.meta.url)));
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');
const normalize = (value) => String(value).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
const baselineApplications = new Set(data.records.flatMap((record) => record.applications.map(normalize)));
const baselineSourceUrls = new Set(data.records.flatMap((record) => record.verification.sources || []).map((source) => source.url));

assert.equal(fixture.batch, '17');
assert.equal(fixture.baseline.head, 'ad2d2c83609446498a327372d1d5b0d21811975e');
assert.equal(fixture.baseline.records, 1402);
assert.equal(fixture.baseline.verified, 1313);
assert.equal(fixture.baseline.legacyPending, 89);
assert.equal(fixture.discovery.checked, 5);
assert.deepEqual(fixture.discovery.outcomes, { qualified: 5, holds: 0, rejected: 0 });
assert.equal(fixture.discovery.productionTarget, 100);
assert.equal(fixture.discovery.productionGatePassed, false);
assert.equal(fixture.qualifiedCandidates.length, fixture.discovery.outcomes.qualified);
assert.equal(new Set(fixture.qualifiedCandidates.map((candidate) => candidate.candidateId)).size, fixture.qualifiedCandidates.length);
assert.equal(new Set(fixture.qualifiedCandidates.map((candidate) => candidate.maker)).size, 5);

const allowedStatuses = new Set(fixture.matrixFormat.allowedStatuses);
for (const profile of Object.values(fixture.coverageProfiles)) {
  for (const [field, coverage] of Object.entries(profile)) {
    assert.ok(allowedStatuses.has(coverage[0]), `${field}: invalid coverage status`);
    assert.ok(Array.isArray(coverage[1]) && coverage[1].length > 0, `${field}: missing source references`);
    assert.ok(Array.isArray(coverage[2]) && coverage[2].length > 0, `${field}: missing evidence locations`);
    if (coverage[0] === 'derived') {
      assert.equal(typeof coverage[3], 'string', `${field}: missing derivation formula`);
      assert.match(coverage[3], /explicit|engine/i, `${field}: derivation is not deterministic`);
    }
  }
}

const candidateFingerprints = new Set();
for (const candidate of fixture.qualifiedCandidates) {
  assert.equal(candidate.proposedIdentityType, 'applicationScopedSpecification');
  assert.ok(fixture.coverageProfiles[candidate.coverageProfile], `${candidate.candidateId}: unknown coverage profile`);
  assert.deepEqual(Object.keys(candidate.sources).sort(), ['a', 'b']);
  const sources = Object.values(candidate.sources);
  assert.equal(new Set(sources.map((source) => source.publisher)).size, 2, `${candidate.candidateId}: publishers are not independent`);
  assert.equal(new Set(sources.map((source) => new URL(source.url).hostname.replace(/^www\./, ''))).size, 2, `${candidate.candidateId}: source domains are not independent`);
  assert.ok(sources.every((source) => source.location.length > 0), `${candidate.candidateId}: missing evidence location`);
  assert.ok(sources.every((source) => !baselineSourceUrls.has(source.url)), `${candidate.candidateId}: reuses a baseline source URL`);
  assert.ok(!baselineApplications.has(normalize(`${candidate.maker} ${candidate.application} (${candidate.years[0]})`)), `${candidate.candidateId}: exact application already exists`);
  assert.equal(candidate.duplicatePrecheck, 'clear against 1402-record baseline');
  assert.ok(Number.isFinite(candidate.spec.displacementCc), `${candidate.candidateId}: missing displacement`);
  assert.ok(Number.isFinite(candidate.spec.powerKw), `${candidate.candidateId}: missing power`);
  assert.ok(Number.isFinite(candidate.spec.torqueNm), `${candidate.candidateId}: missing torque`);
  assert.match(candidate.spec.configuration, /^(Inline [346]|V[68])$/, `${candidate.candidateId}: unsupported layout`);
  assert.equal(candidate.spec.valvetrain, 'DOHC');
  assert.equal(candidate.spec.totalValves, Number(candidate.spec.configuration.match(/\d+/)[0]) * candidate.spec.valvesPerCylinder);
  assert.equal(candidate.spec.totalCamshafts, candidate.spec.configuration.startsWith('Inline') ? 2 : 4);
  assert.equal(candidate.spec.fuel, 'Petrol');
  const baselineSpecMatch = data.records.find((record) => {
    const displacementCc = Number(record.displacement.match(/[\d,]+\s*cc/)?.[0].replace(/[^\d]/g, ''));
    return record.maker === candidate.maker
      && displacementCc === candidate.spec.displacementCc
      && record.performance?.powerKw.min === candidate.spec.powerKw
      && record.performance?.powerKw.max === candidate.spec.powerKw
      && record.performance?.torqueNm.min === candidate.spec.torqueNm
      && record.performance?.torqueNm.max === candidate.spec.torqueNm;
  });
  assert.equal(baselineSpecMatch, undefined, `${candidate.candidateId}: matching baseline calibration ${baselineSpecMatch?.id}`);
  const fingerprint = [candidate.maker, candidate.spec.displacementCc, candidate.spec.configuration, candidate.spec.aspiration, candidate.spec.injection, candidate.spec.powerKw, candidate.spec.torqueNm].join('|');
  assert.ok(!candidateFingerprints.has(fingerprint), `${candidate.candidateId}: duplicate candidate specification`);
  candidateFingerprints.add(fingerprint);
}

assert.equal(data.records.length, fixture.baseline.records);
assert.equal(data.records.filter((record) => record.verification.status === 'verified').length, fixture.baseline.verified);
assert.equal(data.records.filter((record) => record.verification.status === 'legacyPending').length, fixture.baseline.legacyPending);
assert.equal(digest(data.records), fixture.baseline.semanticHash);
assert.equal(data.records.some((record) => record.id.startsWith('batch17-')), false);
assert.deepEqual(fixture.result, {
  qualified: 5,
  ready: 5,
  holds: 0,
  rejected: 0,
  accepted: 0,
  duplicateAuditRun: true,
  canonicalChanged: false,
  generatorRun: false,
  enginesCheckRun: true,
  fullNpmTestRun: true,
  reason: 'initial source-first Batch 17 discovery checkpoint; production gate remains closed'
});

console.log(`PASS Batch 17 readiness: ${fixture.result.ready} ready, production gate closed, canonical ${digest(data.records)}`);
