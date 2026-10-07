import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';
import { engineIdentityCollisionErrors } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/ford-phase-2b-scopes.json', import.meta.url)));
const enrichment = JSON.parse(fs.readFileSync(new URL('../../docs/engine-campaigns/ford/phase-2b-enrichment.json', import.meta.url)));
const sources = JSON.parse(fs.readFileSync(new URL('../../docs/engine-campaigns/ford/phase-2b-sources.json', import.meta.url)));
const coreSource = fs.readFileSync(new URL('../../assets/js/engine-search-core.js', import.meta.url), 'utf8');
const sandbox = { window: {}, URL };
vm.runInNewContext(coreSource, sandbox);
const core = sandbox.window.D3_ENGINE_SEARCH_CORE;
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');
const baselineLimits = { europe: 345, japan: 416, korea: 50, 'north-america': 105, 'south-america': 0 };
const baseline = data.regionFiles.flatMap((file) => file.records.slice(0, baselineLimits[file.region]));
const added = data.regionFiles.flatMap((file) => file.records.slice(baselineLimits[file.region]));

assert.equal(enrichment.candidatePool.total, 54);
assert.equal(enrichment.candidates.length, 54);
assert.equal(new Set(enrichment.candidates.map((candidate) => candidate.candidateId)).size, 54);
assert.deepEqual(enrichment.outcomeCounts, {
  implemented: 5,
  readyButDuplicate: 0,
  holdMissingConstruction: 6,
  holdMissingPerformance: 4,
  holdMissingApplicationScope: 37,
  holdIdentityAmbiguous: 2,
  holdSourceConflict: 0,
  notProductionEligible: 0
});
assert.equal(enrichment.candidates.reduce((sum, candidate) => sum + Number(candidate.outcome !== ''), 0), 54);
assert.equal(sources.sources.length, 6);
assert.ok(sources.sources.every((source) => source.evidenceTier === 'A'));

assert.equal(baseline.length, 916);
assert.equal(digest(baseline), '92b39177bda0e206293b60e4a238a9dad1d42097957fda3d3180bda0aafa6fe1');
assert.deepEqual(added.map((record) => record.id), fixture.map((entry) => entry.id));
assert.equal(added.length, 5);
assert.equal(added.filter((record) => record.verification.evidenceBasis === 'official').length, 5);
assert.equal(added.filter((record) => record.verification.evidenceBasis === 'corroborated').length, 0);
assert.equal(fixture.filter((entry) => entry.evidencePath === 'direct').length, 4);
assert.equal(fixture.filter((entry) => entry.evidencePath === 'bridge').length, 1);

const normalize = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
for (const expected of fixture) {
  const record = added.find((candidate) => candidate.id === expected.id);
  assert.ok(record, expected.id);
  assert.equal(record.identity.type, 'officialPublicDesignation');
  assert.equal(record.identity.value, expected.designation);
  assert.equal(Object.hasOwn(record, 'code'), false);
  assert.deepEqual(record.aliases, []);
  assert.equal(record.regionKey, 'north-america');
  assert.deepEqual(record.applications, [expected.application]);
  assert.deepEqual(record.verification.scope, {
    applications: [expected.application],
    years: { from: expected.year, to: expected.year },
    markets: [expected.market]
  });
  assert.equal(record.layout.includes(`${expected.valves} valves`), true);
  assert.equal(record.layout.includes(`${expected.cams} camshaft${expected.cams === 1 ? '' : 's'} total`), true);
  assert.deepEqual(record.performance, expected.performance);
  assert.ok(record.verification.sourceRefs.every((ref) => record.verification.sources.some((source) => source.id === ref)));
  assert.deepEqual(verificationPolicyErrors(record), []);
  assert.equal(core.searchRecords(data.records, expected.designation)[0]?.id, expected.id);
  assert.equal(core.searchRank(record, expected.designation), 0);
  assert.equal(core.resolveEngine(data.records, expected.designation)?.id, expected.id);
  const restored = core.stateFromUrl(
    `https://d3orient.com/engines.html?engine=${encodeURIComponent(expected.designation)}`,
    data.records,
    ['europe', 'japan', 'korea', 'north-america', 'south-america'],
    ['en', 'es', 'fr', 'de']
  );
  assert.equal(restored.engine, expected.id);
  const display = core.identityDisplay(record, (key) => ({ officialEngineDesignation: 'Official engine designation' })[key]);
  assert.deepEqual(JSON.parse(JSON.stringify(display)), {
    type: 'officialPublicDesignation', value: expected.designation,
    labelKey: 'officialEngineDesignation', label: 'Official engine designation'
  });
  assert.ok(`<strong>${display.value}</strong><span>${display.label}</span>`.includes(expected.designation));
  assert.ok(`<h3>${display.value}</h3><p>${display.label}</p>`.includes('Official engine designation'));
  const owners = data.records.filter((candidate) => core.identityValues(candidate).some((identity) => normalize(identity) === normalize(expected.designation)));
  assert.deepEqual(owners.map((owner) => owner.id), [expected.id], `Unexpected repeated designation owner for ${expected.designation}`);
}

const flexEntries = fixture.filter((entry) => entry.fuelCalibration);
assert.equal(flexEntries.length, 3);
for (const expected of flexEntries) {
  const record = added.find((candidate) => candidate.id === expected.id);
  assert.equal(record.fuelKey, 'alternativeFuel');
  assert.equal(expected.fuelCalibration.stored, 'ethanol');
  assert.equal(record.performance.powerKw.min, record.performance.powerKw.max, `${record.id} recreates a fuel-mixed power range`);
  assert.equal(record.performance.torqueNm.min, record.performance.torqueNm.max, `${record.id} recreates a fuel-mixed torque range`);
  const evidenceNotes = record.verification.sources.flatMap((source) => source.pageNotes || []).join(' ');
  assert.match(evidenceNotes, /Stored headline calibration is ethanol/);
  assert.match(evidenceNotes, /separate gasoline calibration/);
  assert.match(evidenceNotes, /current data model cannot bind multiple performance values to fuel conditions/);
}

const heldPowerStroke = enrichment.candidates.find((candidate) => candidate.candidateId === 'ford-power-stroke-67');
assert.equal(heldPowerStroke.outcome, 'holdMissingConstruction');
assert.equal(heldPowerStroke.productionRecordId, null);
assert.equal(heldPowerStroke.construction.camshaftsTotal, null);
assert.match(heldPowerStroke.holdReason, /OHV alone is not accepted/);
assert.equal(data.records.some((record) => record.id === 'ford-phase2b-power-stroke-67-super-duty-2021'), false);

assert.deepEqual(engineIdentityCollisionErrors(data.records), []);
const duplicate = structuredClone(added[0]);
duplicate.id = `${duplicate.id}-cosmetic-copy`;
duplicate.years = String(Number(duplicate.years) + 1);
duplicate.verification.scope.years = { from: Number(duplicate.years), to: Number(duplicate.years) };
duplicate.applications = duplicate.applications.map((application) => `${application} automatic hatch`);
assert.ok(engineIdentityCollisionErrors([...data.records, duplicate]).length > 0, 'Semantic duplicate guard accepted a cosmetic split');

const bda = enrichment.candidates.find((candidate) => candidate.candidateId === 'ford-cosworth-bda');
const ybb = enrichment.candidates.find((candidate) => candidate.candidateId === 'ford-cosworth-yb');
assert.equal(bda.officialDesignation, 'BDA');
assert.equal(ybb.officialDesignation, 'YBB');
assert.equal(bda.relationship, 'partnerDesigned');
assert.equal(ybb.relationship, 'partnerDesigned');
assert.equal(bda.outcome, 'holdMissingPerformance');
assert.equal(ybb.outcome, 'holdMissingPerformance');

console.log(`PASS Ford Phase 2B: ${enrichment.candidates.length} candidates reconciled, ${added.length} strict designation records, baseline ${digest(baseline)}`);
