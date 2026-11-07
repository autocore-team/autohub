import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { loadCanonical, validateCanonical, isPublicOilRecord } from '../../scripts/oil/validate.mjs';
import { assessOilEvidence, technicalFields } from '../../scripts/oil/evidence.mjs';
import { toPublicOilData, generatedOilFile, generatedOilFileMatches } from '../../scripts/oil/generate.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/toyota-canada-pilot.json', import.meta.url)));
const previous = JSON.parse(fs.readFileSync(new URL('./fixtures/batch-5-production.json', import.meta.url)));
const data = loadCanonical(), pub = toPublicOilData(data), summary = validateCanonical(data);
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');
const sha = x => crypto.createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
assert.deepEqual([summary.records, summary.researchRecords, summary.legacyRecords], [68, 13, 59]);
assert.equal(summary.productionRecommendations, 64);
assert.deepEqual(summary.statuses, { legacyPending: 4, verified: 25, preliminary: 39 });
const baseline = structuredClone(data);
baseline.records = baseline.records.slice(0, 66); baseline.audit.selectableExactCodeRecordCount = 66;
assert.equal(sha(baseline), fixture.baselineCanonicalHash);
assert.equal(fixture.baselineCanonicalHash, previous.finalCanonicalHash);
assert.equal(sha(data.records.slice(0, 66)), fixture.baselineRecordsHash);
assert.equal(fixture.baselineRecordsHash, previous.finalRecordsHash);
assert.equal(sha(data.records.slice(0, 66).map(r => r.id)), fixture.baselineOrderHash);
assert.equal(sha(pub.records.slice(0, 66)), fixture.baselinePublicHash);
assert.equal(fixture.baselinePublicHash, previous.finalPublicHash);
assert.equal(sha(data.researchRecords), fixture.researchHash);
assert.equal(sha(data.legacyRecords), fixture.quarantineHash);
assert.deepEqual(data.records.slice(66).map(r => r.id), fixture.records.map(r => r.id));
assert.equal(new Set([...data.records, ...data.researchRecords].map(r => r.id)).size, 81);
for (const [file, hash] of Object.entries(fixture.protectedFiles)) assert.equal(sha(fs.readFileSync(new URL('../../' + file, import.meta.url), 'utf8').replace(/\r\n/g, '\n')), hash, file);

for (const expected of fixture.records) {
  const raw = data.records.find(r => r.id === expected.id), record = pub.records.find(r => r.id === expected.id);
  const scope = raw.applicationEvidence.engineScope;
  const assessment = assessOilEvidence(raw);
  assert.equal(raw.status, 'preliminary'); assert.equal(record.status, 'preliminary');
  assert.equal(assessment.application, 'confirmed'); assert.equal(assessment.eligible, true);
  assert.deepEqual(record.market, ['CA']); assert.deepEqual(record.productionYears, { from: 2020, to: 2020 });
  assert.deepEqual(raw.engineIdentity, { type: 'engineeringCode' });
  assert.equal(raw.applicationEvidence.scopeType, 'engineScoped');
  assert.equal(Object.hasOwn(raw.applicationEvidence, 'applications'), false);
  assert.ok(scope.links.length >= 3);
  assert.deepEqual(Object.keys(assessment.fields).filter(f => assessment.fields[f] === 'confirmed'), fixture.confirmedFields);
  assert.deepEqual(record.completeness, { state: 'partial', confirmedFields: 6, totalFields: technicalFields.length });
  assert.equal(record.engineCode, expected.engineCode);
  assert.equal(record.serviceFillCapacity, expected.withFilterLitres); assert.equal(record.capacityUnit, 'L');
  assert.equal(record.serviceInterval, null); assert.equal(record.displacementLiters, null);
  assert.deepEqual(record.requiredManufacturerApprovals, []); assert.deepEqual(record.preferredManufacturerApprovals, []);
  assert.deepEqual(record.climateLimitations, []);
  assert.deepEqual(record.emissionsEquipment, { dpf: 'unknown', gpf: 'unknown', catalyst: 'unknown' });
  assert.deepEqual(record.allowedSaeViscosities, [expected.primary, expected.temporary]);
  const expr = record.oilRequirements.expression;
  assert.equal(expr.anyOf.length, 2); assert.ok(expr.anyOf.every(n => n.allOf.length === 2));
  assert.equal(expr.anyOf[1].conditionRef.locatorId, 'temporary');
  assert.equal(record.oilRequirements.coverage, 'documentedPath');
  for (const source of record.sources) {
    const known = fixture.documents.find(d => d.url === source.url);
    assert.ok(known); assert.equal(source.documentSha256, known.sha256);
  }
  const lookup = ref => record.sources.find(s => s.id === ref.sourceId)?.locators.find(l => l.id === ref.locatorId);
  for (const ref of [...record.applicationEvidence.evidenceRefs, ...Object.values(record.fieldEvidence).flatMap(f => f.evidenceRefs)]) assert.ok(lookup(ref));
  for (const link of scope.links) { assert.ok(lookup(link.from)); assert.ok(lookup(link.to)); }
  assert.equal(lookup(scope.marketRef).documentBinding.url, record.sources[0].url);
  assert.equal(lookup(scope.marketRef).documentBinding.publicationId, 'OM06158U');
  assert.ok(record.sources[0].locators.find(l => l.id === 'service-fill').excerpt.includes(raw.engineCode));
  for (const lang of ['en', 'es', 'fr', 'de']) {
    const html = ui.renderOilCard(record, lang);
    assert.ok(html.includes(scope.description[lang]));
    assert.ok(html.includes(lookup(expr.anyOf[1].conditionRef).condition[lang]));
    assert.ok(html.includes(record.capacityNote[lang]));
    assert.match(html, /data-operator="anyOf"/); assert.match(html, /data-operator="allOf"/);
    assert.doesNotMatch(html, /undefined|>Verified</);
    const state = ui.resolveUrlState(pub, `https://d3orient.com/oil-guide.html?engine=${record.id}&lang=${lang}`);
    assert.equal(state.record.id, record.id); assert.equal(state.lang, lang);
    assert.equal(ui.resolveUrlState(pub, ui.selectionUrl('https://d3orient.com/oil-guide.html', state, lang).href).record.id, record.id);
  }
  const bad = mutate => {
    const r = structuredClone(raw); mutate(r);
    assert.equal(isPublicOilRecord(r), false);
    assert.equal(toPublicOilData({ ...data, records: [r] }).records.length, 0);
  };
  const manual = r => r.sources[0], catalogue = r => r.sources[1];
  const locator = (r, id) => manual(r).locators.find(l => l.id === id);
  bad(r => { r.applicationEvidence.evidenceRefs = []; });
  bad(r => { delete r.applicationEvidence.engineScope; });
  bad(r => { r.applicationEvidence.engineScope.links = []; });
  bad(r => { r.applicationEvidence.engineScope.links.pop(); });
  bad(r => { const s = r.applicationEvidence.engineScope; s.links.push({ from: s.identityRef, to: s.coverageRef, relation: 'sameDocument' }); });
  bad(r => { r.market = ['US']; });
  bad(r => { catalogue(r).locators[0].documentBinding.markets = []; });
  bad(r => { catalogue(r).locators[0].excerpt = catalogue(r).locators[0].excerpt.replaceAll('Canada', 'Unconfirmed'); });
  bad(r => { catalogue(r).locators[0].documentBinding.publicationId = 'ANOTHER-MANUAL'; });
  bad(r => { r.applicationEvidence.review.unambiguous = false; });
  bad(r => { r.engineCode = r.engineCode === 'A25A-FKS' ? '2GR-FKS' : 'A25A-FKS'; });
  bad(r => { locator(r, 'engine').excerpt += ' Conflicting engine ' + (r.engineCode === 'A25A-FKS' ? '2GR-FKS' : 'A25A-FKS'); });
  bad(r => { locator(r, 'all-models').excerpt += ' Except AWD models.'; });
  bad(r => { locator(r, 'all-models').excerpt += ' This manual does not apply to AWD models.'; });
  bad(r => { locator(r, 'selection').excerpt += ' Only for 2WD models.'; });
  bad(r => { locator(r, 'selection').excerpt += ' AWD only.'; });
  bad(r => { r.serviceFillCapacity = r.engineCode === 'A25A-FKS' ? 5.4 : 4.5; });
  bad(r => { locator(r, 'service-fill').engineCodes = [r.engineCode === 'A25A-FKS' ? '2GR-FKS' : 'A25A-FKS']; });
  bad(r => { delete locator(r, 'service-fill').applicabilityRef; });
  bad(r => { locator(r, 'service-fill').excerpt = `${r.engineCode} dry capacity ${r.serviceFillCapacity} L without filter`; });
  bad(r => { delete r.oilRequirements.expression.anyOf[1].conditionRef; });
  bad(r => { r.oilRequirements.expression.anyOf[0].allOf.push({ field: 'allowedSaeViscosities', index: 1 }); });
  bad(r => { locator(r, 'temporary').condition.en = 'Use either SAE without restrictions'; });
  bad(r => { locator(r, 'temporary').excerpt = `${r.engineCode} ${expected.primary} or ${expected.temporary}`; });
  bad(r => { locator(r, 'temporary').temporarySubstitution = { preferredIndex: 1, temporaryIndex: 0 }; });
  bad(r => { r.allowedSaeViscosities.push('10W-40'); locator(r, 'selection').excerpt += ' 10W-40'; });
  bad(r => { manual(r).url = 'https://example.com/OM06158U.pdf'; });
  bad(r => { manual(r).url = 'https://unreviewed.toyota.ca/OM06158U.pdf'; });
  bad(r => { manual(r).url = 'https://www.toyota.ca/unreviewed/OM06158U.pdf'; });
  bad(r => { manual(r).documentSha256 = 'invalid'; });
  bad(r => { r.engineIdentity = { type: 'vinEngineSymbol', value: 'A' }; });
  const optional = structuredClone(raw);
  for (const f of ['serviceFillCapacity', 'capacityUnit', 'capacityNote']) optional.fieldEvidence[f] = { state: 'unknown', evidenceRefs: [] };
  assert.equal(assessOilEvidence(optional).eligible, true);
  const withheld = toPublicOilData({ ...data, records: [optional] }).records[0];
  assert.equal(withheld.serviceFillCapacity, null); assert.equal(withheld.capacityUnit, null); assert.equal(withheld.capacityNote, null);
}
for (const r of data.researchRecords) {
  assert.equal(isPublicOilRecord(r), false);
  assert.equal(ui.resolveUrlState(pub, `https://d3orient.com/oil-guide.html?engine=${r.id}`).record, null);
}
assert.ok(generatedOilFileMatches(fs.readFileSync(new URL('../../oil-data.js', import.meta.url), 'utf8'), generatedOilFile(data)));
console.log('PASS Toyota Canada pilot: immutable 66/13/59 baseline, two preliminary partial records, source-linked engine scope, conditional SAE paths, with-filter quantities, negative evidence gate cases, EN/ES/FR/DE and URL regressions, generated freshness');
