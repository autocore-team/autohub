import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { loadCanonical, validateCanonical, isPublicOilRecord } from '../../scripts/oil/validate.mjs';
import { assessOilEvidence, technicalFields } from '../../scripts/oil/evidence.mjs';
import { toPublicOilData, generatedOilFile, generatedOilFileMatches } from '../../scripts/oil/generate.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch-7-production.json', import.meta.url)));
const data = loadCanonical(), pub = toPublicOilData(data), summary = validateCanonical(data);
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');
const sha = x => crypto.createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
assert.deepEqual([summary.records, summary.researchRecords, summary.legacyRecords], [74, 13, 59]);
assert.equal(summary.productionRecommendations, 70);
assert.deepEqual(summary.statuses, { legacyPending: 4, verified: 25, preliminary: 45 });
const historical = structuredClone(data);
historical.records = historical.records.slice(0, 72); historical.audit.selectableExactCodeRecordCount = 72;
const baseline = structuredClone(data);
baseline.records = baseline.records.slice(0, 68); baseline.audit.selectableExactCodeRecordCount = 68;
assert.equal(sha(baseline), fixture.baselineCanonicalHash);
assert.equal(sha(data.records.slice(0, 68)), fixture.baselineRecordsHash);
assert.equal(sha(data.records.slice(0, 68).map(r => r.id)), fixture.baselineOrderHash);
assert.equal(sha(pub.records.slice(0, 68)), fixture.baselinePublicHash);
assert.equal(sha(data.researchRecords), fixture.researchHash);
assert.equal(sha(data.legacyRecords), fixture.quarantineHash);
assert.equal(sha(historical), fixture.finalCanonicalHash);
assert.equal(sha(data.records.slice(0, 72)), fixture.finalRecordsHash);
assert.equal(sha(pub.records.slice(0, 72)), fixture.finalPublicHash);
assert.deepEqual(data.records.slice(68, 72).map(r => r.id), fixture.records.map(r => r.id));
assert.equal(new Set([...data.records, ...data.researchRecords].map(r => r.id)).size, 87);
for (const [file, hash] of Object.entries(fixture.protectedFiles)) assert.equal(sha(fs.readFileSync(new URL('../../' + file, import.meta.url), 'utf8').replace(/\r\n/g, '\n')), hash, file);

for (const expected of fixture.records) {
  const raw = data.records.find(r => r.id === expected.id), record = pub.records.find(r => r.id === expected.id);
  const assessment = assessOilEvidence(raw), scope = record.applicationEvidence.engineScope;
  const locator = id => raw.sources[0].locators.find(l => l.id === id);
  assert.equal(raw.status, 'preliminary'); assert.equal(record.status, 'preliminary');
  assert.equal(assessment.eligible, true); assert.equal(assessment.application, 'confirmed');
  assert.equal(raw.model, expected.model); assert.equal(raw.engineCode, expected.engineCode);
  assert.deepEqual(raw.market, ['CA']); assert.deepEqual(raw.productionYears, { from: 2020, to: 2020 });
  assert.deepEqual(raw.engineIdentity, { type: 'engineeringCode' });
  assert.equal(raw.applicationEvidence.scopeType, 'engineScoped');
  assert.equal(Object.hasOwn(raw.applicationEvidence, 'applications'), false);
  assert.equal(raw.sources[0].publicationId, expected.publication);
  assert.deepEqual(locator('publication').pageNumbers, [1, expected.publication === 'OM12K77U' ? 592 : expected.publication === 'OM0R031U' ? 752 : 612]);
  assert.deepEqual(locator('engine').pageNumbers, [expected.identityPage]);
  assert.deepEqual(locator('all-models').pageNumbers, [expected.coveragePage]);
  assert.deepEqual(Object.keys(assessment.fields).filter(f => assessment.fields[f] === 'confirmed'), expected.confirmedFields);
  assert.deepEqual(record.completeness, { state: 'partial', confirmedFields: expected.capacity == null ? 3 : 6, totalFields: technicalFields.length });
  assert.deepEqual(record.allowedSaeViscosities, [expected.primary, expected.temporary]);
  assert.deepEqual(record.industrySpecifications, { acea: [], api: expected.specField === 'api' ? [expected.spec] : [], ilsac: expected.specField === 'ilsac' ? [expected.spec] : [] });
  assert.deepEqual(record.requiredManufacturerApprovals, []); assert.deepEqual(record.preferredManufacturerApprovals, []);
  assert.equal(record.displacementLiters, null); assert.equal(record.serviceInterval, null);
  assert.deepEqual(record.climateLimitations, []);
  assert.deepEqual(record.emissionsEquipment, { dpf: 'unknown', gpf: 'unknown', catalyst: 'unknown' });
  assert.equal(record.oilRequirements.coverage, 'documentedPath');
  const expression = record.oilRequirements.expression;
  assert.equal(expression.anyOf.length, 2); assert.ok(expression.anyOf.every(n => n.allOf.length === 2));
  assert.equal(expression.anyOf[1].conditionRef.locatorId, 'temporary');
  assert.deepEqual(locator('temporary').temporarySubstitution, { preferredIndex: 0, temporaryIndex: 1 });
  assert.match(locator('temporary').excerpt, /must be replaced with SAE .* at the next oil change/);
  assert.equal(record.serviceFillCapacity, expected.capacity);
  if (expected.capacity != null) {
    assert.equal(record.capacityUnit, 'L');
    assert.match(locator('service-fill').excerpt, /Drain and refill/);
    assert.match(locator('service-fill').excerpt, /With filter/);
    assert.ok(locator('service-fill').excerpt.includes(expected.engineCode));
    assert.deepEqual(locator('service-fill').pageNumbers, expected.engineCode === 'A25A-FXS' ? [681, 682] : [expected.oilPages[0]]);
    assert.match(record.capacityNote.en, /reference|Reference/); assert.match(record.capacityNote.en, /more than 5 minutes/);
    assert.match(record.capacityNote.en, /dipstick/);
    assert.match(record.capacityNote.en, expected.engineCode === 'A25A-FXS' ? /turn off the hybrid system/ : /turn off the engine/);
  } else {
    assert.equal(record.capacityUnit, null); assert.equal(record.capacityNote, null);
    for (const f of ['serviceFillCapacity', 'capacityUnit', 'capacityNote']) assert.deepEqual(record.fieldEvidence[f], { state: 'unknown', evidenceRefs: [] });
    assert.equal(locator('service-fill'), undefined);
    const payload = JSON.stringify(record);
    assert.doesNotMatch(payload, /\b(?:5\.8|5\.9|6\.1|6\.2)\b/);
    assert.ok(!raw.sources[0].fields.includes('serviceFillCapacity'));
  }
  for (const source of record.sources) {
    const known = fixture.documents.find(d => d.url === source.url);
    assert.ok(known); assert.equal(source.documentSha256, known.sha256);
    for (const l of source.locators) assert.ok(l.excerpt && (l.section || l.pageNumbers?.length));
  }
  const resolve = ref => record.sources.find(s => s.id === ref.sourceId)?.locators.find(l => l.id === ref.locatorId);
  for (const ref of [...record.applicationEvidence.evidenceRefs, ...Object.values(record.fieldEvidence).flatMap(f => f.evidenceRefs)]) assert.ok(resolve(ref));
  for (const link of scope.links) { assert.ok(resolve(link.from)); assert.ok(resolve(link.to)); }
  assert.equal(resolve(scope.marketRef).documentBinding.url, record.sources[0].url);
  for (const lang of ['en', 'es', 'fr', 'de']) {
    const html = ui.renderOilCard(record, lang);
    assert.ok(html.includes(scope.description[lang]));
    assert.ok(html.includes(locator('temporary').condition[lang]));
    assert.ok(html.includes(ui.evidenceText[lang].partial));
    assert.match(html, /data-operator="allOf"/); assert.match(html, /data-operator="anyOf"/);
    assert.doesNotMatch(html, />Verified</);
    if (record.capacityNote) assert.ok(html.includes(record.capacityNote[lang]));
    else assert.doesNotMatch(html, /\b(?:5\.8|5\.9|6\.1|6\.2)\b/);
    const state = ui.resolveUrlState(pub, `https://d3orient.com/oil-guide.html?engine=${record.id}&lang=${lang}`);
    assert.equal(state.record.id, record.id); assert.equal(state.lang, lang);
    assert.equal(ui.resolveUrlState(pub, ui.selectionUrl('https://d3orient.com/oil-guide.html', state, lang).href).record.id, record.id);
  }
  const blocked = mutate => {
    const bad = structuredClone(raw); mutate(bad);
    assert.equal(isPublicOilRecord(bad), false);
    assert.equal(toPublicOilData({ ...data, records: [bad] }).records.length, 0);
  };
  blocked(r => { r.market = ['US']; });
  blocked(r => { r.productionYears.to = 2021; });
  blocked(r => { r.applicationEvidence.engineScope.links = []; });
  blocked(r => { r.fieldEvidence.allowedSaeViscosities.evidenceRefs = []; });
  blocked(r => { delete r.oilRequirements.expression.anyOf[1].conditionRef; });
  blocked(r => { r.oilRequirements.expression.anyOf[0].allOf.push({ field: 'allowedSaeViscosities', index: 1 }); });
  blocked(r => { r.engineCode = expected.engineCode === '2ZR-FAE' ? 'M20A-FKS' : '2ZR-FAE'; });
  blocked(r => { r.allowedSaeViscosities[0] = '10W-40'; });
  blocked(r => { r.industrySpecifications[expected.specField] = [expected.specField === 'api' ? 'ILSAC GF-5' : 'API SN/RC']; });
  if (expected.capacity != null) blocked(r => { r.serviceFillCapacity = expected.capacity === 4.2 ? 4.6 : 4.2; });
  else blocked(r => { r.serviceFillCapacity = 5.9; r.capacityUnit = 'L'; r.fieldEvidence.serviceFillCapacity = { state: 'confirmed', evidenceRefs: [{ sourceId: r.sources[0].id, locatorId: 'selection' }] }; });
}
assert.ok(!data.records.some(r => r.market.includes('CA') && r.productionYears.from === 2020 && r.model === 'Tacoma' && r.engineCode === '2TR-FE'));
for (const r of data.researchRecords) {
  assert.equal(isPublicOilRecord(r), false);
  assert.equal(ui.resolveUrlState(pub, `https://d3orient.com/oil-guide.html?engine=${r.id}`).record, null);
}
assert.ok(generatedOilFileMatches(fs.readFileSync(new URL('../../oil-data.js', import.meta.url), 'utf8'), generatedOilFile(data)));
console.log('PASS Batch 7: immutable 68/13/59 baseline, four preliminary partial applications, engine/source/page chains, conditional SAE paths, three with-filter fills, Tacoma quantity suppression, EN/ES/FR/DE and URL separation, protected schema/UI/gate/PCD/Engines/CI, generated freshness');
