import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch16r-readiness.json', import.meta.url)));
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');

assert.equal(fixture.batch, '16R');
assert.equal(fixture.baseline.head, '8a4ed660fe529496bba240a9e403aadb0c6aa968');
assert.equal(fixture.baseline.records, 1302);
assert.equal(fixture.baseline.verified, 1213);
assert.equal(fixture.baseline.legacyPending, 89);
assert.equal(fixture.preliminarySeedAudit.checked, 11);
assert.equal(fixture.preliminarySeedAudit.qualified, 10);
assert.equal(fixture.preliminarySeedAudit.holds, 1);
assert.equal(fixture.preliminarySeedAudit.qualified + fixture.preliminarySeedAudit.holds, fixture.preliminarySeedAudit.checked);

assert.equal(fixture.newDiscovery.checked, 0);
assert.deepEqual(fixture.newDiscovery.outcomes, { qualified: 0, holds: 0, rejected: 0 });
assert.equal(fixture.newDiscovery.stopAtReadyTotal, 110);
assert.equal(fixture.newDiscovery.stopAtNewLeads, 400);
assert.equal(fixture.newDiscovery.productionGatePassed, false);
assert.equal(fixture.qualifiedCandidates.length, fixture.preliminarySeedAudit.qualified);
assert.equal(new Set(fixture.qualifiedCandidates.map((candidate) => candidate.candidateId)).size, fixture.qualifiedCandidates.length);
assert.equal(new Set(fixture.qualifiedCandidates.map((candidate) => candidate.maker)).size, 6);

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
}

assert.equal(fixture.result.qualified, fixture.preliminarySeedAudit.qualified);
assert.equal(fixture.result.ready, fixture.preliminarySeedAudit.qualified);
assert.equal(fixture.result.holds, fixture.preliminarySeedAudit.holds);
assert.equal(fixture.result.accepted, 0);
assert.equal(fixture.result.canonicalChanged, false);
assert.equal(fixture.result.generatorRun, false);
assert.equal(fixture.result.enginesCheckRun, true);
assert.equal(fixture.result.fullNpmTestRun, false);

assert.equal(data.records.length, fixture.baseline.records);
assert.equal(data.records.filter((record) => record.verification?.status === 'verified').length, fixture.baseline.verified);
assert.equal(data.records.filter((record) => record.verification?.status === 'legacyPending').length, fixture.baseline.legacyPending);
assert.equal(digest(data.records), fixture.baseline.semanticHash);
assert.equal(data.records.some((record) => record.id.startsWith('batch16')), false);

console.log(`PASS Batch 16R readiness: ${fixture.result.ready} ready, ${fixture.result.holds} hold, canonical ${digest(data.records)}`);
