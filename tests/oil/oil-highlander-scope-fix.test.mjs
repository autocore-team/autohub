import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { loadCanonical, loadReferenceInformation, validateCanonical, isPublicOilRecord } from '../../scripts/oil/validate.mjs';
import { assessOilEvidence } from '../../scripts/oil/evidence.mjs';
import { toPublicOilData, generatedOilFile, generatedOilFileMatches } from '../../scripts/oil/generate.mjs';
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/highlander-scope-fix.json', import.meta.url)));
const data = loadCanonical(), pub = toPublicOilData(data), summary = validateCanonical(data);
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');
const sha = x => crypto.createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
assert.deepEqual([summary.records, summary.researchRecords, summary.legacyRecords], fixture.counts);
assert.equal(summary.productionRecommendations, 70);
assert.deepEqual(summary.statuses, { legacyPending: 4, verified: 25, preliminary: 45 });
const baseline = structuredClone(data);
baseline.records = baseline.records.slice(0, 73); baseline.audit.selectableExactCodeRecordCount = 73;
assert.equal(sha(baseline), fixture.baselineCanonicalHash);
assert.equal(sha(data.records.slice(0, 73)), fixture.baselineRecordsHash);
assert.equal(sha(data.records.slice(0, 73).map(r => r.id)), fixture.baselineOrderHash);
assert.equal(sha(pub.records.slice(0, 73)), fixture.baselinePublicHash);
assert.equal(sha(data.researchRecords), fixture.researchHash);
assert.equal(sha(data.legacyRecords), fixture.quarantineHash);
assert.equal(sha(loadReferenceInformation()), fixture.referenceHash);
assert.equal(sha(data), fixture.finalCanonicalHash);
assert.equal(sha(data.records), fixture.finalRecordsHash);
assert.equal(sha(pub.records), fixture.finalPublicHash);
for (const [file, hash] of Object.entries(fixture.protectedFiles)) assert.equal(sha(fs.readFileSync(new URL('../../' + file, import.meta.url), 'utf8').replace(/\r\n/g, '\n')), hash, file);
assert.equal(sha(fs.readFileSync(new URL('../../scripts/oil/evidence.mjs', import.meta.url), 'utf8').replace(/\r\n/g, '\n')), fixture.gateHash);
assert.equal(new Set([...data.records, ...data.researchRecords].map(r => r.id)).size, 87);
const record = data.records[73], publicRecord = pub.records[73];
assert.equal(record.id, 'toyota-highlander-2020-ca-2gr-fks');
assert.equal(sha(record), fixture.recordHash); assert.equal(sha(record.sources), fixture.sourcesHash);
assert.equal(record.status, 'preliminary'); assert.equal(publicRecord.completeness.state, 'partial');
assert.equal(record.engineCode, '2GR-FKS'); assert.equal(record.engineIdentity.type, 'engineeringCode');
assert.deepEqual(record.market, ['CA']); assert.deepEqual(record.productionYears, { from: 2020, to: 2020 });
assert.equal(record.applicationEvidence.scopeType, 'engineScoped');
const coverage = r => r.sources[0].locators.find(l => l.id === 'all-models');
const exact = 'Please note that this manual applies to explains all models and all equipment, including options. Therefore, you may find some explanations for equipment not installed on your vehicle.';
assert.equal(coverage(record).excerpt, exact); assert.equal(fixture.coverageExcerpt, exact);
assert.deepEqual(coverage(record).pageNumbers, [7]);
for (const positive of [exact, 'This manual applies to all models.', 'Please note that this manual applies to all models and explains all equipment, including options.', 'Please note that this manual applies to all models and all equipment, including options.', exact.replaceAll(' ', '\n')]) {
  const copy = structuredClone(record); coverage(copy).excerpt = positive;
  assert.equal(assessOilEvidence(copy).eligible, true);
  assert.equal(coverage(copy).excerpt, positive, 'Matching must not rewrite the source excerpt');
}
// Positive wording inside a contrary/limited statement or quote is not evidence.
for (const negative of [
  'This document lists all models.',
  'This manual applies to explains all models.',
  'This manual applies to all models with the towing package.',
  'This manual applies to all models except Hybrid.',
  'This manual applies to all models. Excluding AWD.',
  'This manual applies to all models. Only for 2WD.',
  'This manual applies to all models. This is not applicable to Hybrid.',
  'This manual applies to all models. This does not cover AWD.',
  'This manual applies to all models. This is not true.',
  'This manual applies to all models. Limited to trim X.',
  'This manual applies to all models. Subject to transmission restrictions.',
  'This manual does not apply to all models. It quotes "' + exact + '".',
  'Not all models are covered, despite the quote "' + exact + '".',
  'Only 2WD models are covered. "' + exact + '".',
  '"' + exact + '" is incorrect.',
  exact + ' However, not for AWD.',
  exact + ' This does not apply to all models.',
  exact + ' Not all models are covered.',
  exact + ' Applicable exclusively to trim X.'
]) {
  const copy = structuredClone(record); coverage(copy).excerpt = negative;
  assert.throws(() => assessOilEvidence(copy), /all-model engine scope/, negative);
  assert.equal(isPublicOilRecord(copy), false);
}
const blocked = mutate => {
  const copy = structuredClone(record); mutate(copy);
  assert.equal(isPublicOilRecord(copy), false);
};
blocked(r => r.applicationEvidence.engineScope.links = []);
blocked(r => r.applicationEvidence.engineScope.links.splice(1, 1));
blocked(r => r.applicationEvidence.engineScope.links.push({ from: r.applicationEvidence.engineScope.identityRef, to: r.applicationEvidence.engineScope.manualRef, relation: 'sameDocument' }));
blocked(r => r.sources[1].locators[0].documentBinding.markets = ['US']);
blocked(r => r.sources[0].url = 'https://unreviewed.example/manual.pdf');
blocked(r => r.sources[0].provenanceStatus = 'unconfirmed');
blocked(r => r.engineCode = '2GR-FE');
blocked(r => r.sources[0].locators.find(l => l.id === 'selection').engineCodes = ['2ZR-FXE']);
blocked(r => r.sources[0].locators.find(l => l.id === 'service-fill').applicabilityRef = r.applicationEvidence.engineScope.identityRef);
blocked(r => r.serviceFillCapacity = 4.2);
blocked(r => delete r.oilRequirements.expression.anyOf[1].conditionRef);
blocked(r => r.applicationEvidence.state = 'unknown');
blocked(r => r.applicationEvidence.state = 'conflict');
blocked(r => r.oilRequirements.state = 'conflict');
assert.deepEqual(record.allowedSaeViscosities, ['0W-20', '5W-20']);
assert.deepEqual(record.industrySpecifications, { acea: [], api: [], ilsac: ['ILSAC GF-5'] });
assert.equal(publicRecord.serviceFillCapacity, 5.5); assert.equal(publicRecord.capacityUnit, 'L');
assert.equal(record.oilRequirements.coverage, 'documentedPath');
for (const branch of record.oilRequirements.expression.anyOf) assert.equal(branch.allOf.length, 2);
for (const field of ['displacementLiters', 'fuelType', 'aspiration', 'requiredManufacturerApprovals', 'preferredManufacturerApprovals', 'serviceInterval', 'climateLimitations', 'emissionsEquipment']) assert.equal(publicRecord.evidenceAssessment.fields[field], 'unknown');
for (const lang of ['en', 'es', 'fr', 'de']) {
  const html = ui.renderOilCard(publicRecord, lang);
  for (const id of ['preferred', 'temporary']) assert.ok(html.includes(record.sources[0].locators.find(l => l.id === id).condition[lang]));
  assert.ok(html.includes(record.capacityNote[lang])); assert.ok(html.includes('ILSAC GF-5'));
  assert.ok(!html.includes('API SN/RC')); assert.ok(!html.includes('4.2 L'));
  const url = ui.selectionUrl('https://d3orient.com/oil-guide.html', { make: record.make, model: record.model, variant: ui.variantKey(record), engine: record.id }, lang);
  assert.equal(ui.resolveUrlState(pub, url.href).record.id, record.id);
}
assert.ok(generatedOilFileMatches(fs.readFileSync(new URL('../../oil-data.js', import.meta.url), 'utf8'), generatedOilFile(data)));
console.log('PASS exact OM0E108U scope, legacy wording, denial/quoted restrictions, connected application chain, unchanged baseline and Highlander partial fields');
