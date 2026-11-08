import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { loadCanonical, loadReferenceInformation, validateCanonical, isPublicOilRecord } from '../../scripts/oil/validate.mjs';
import { assessOilEvidence, publicFieldRecord } from '../../scripts/oil/evidence.mjs';
import { toPublicOilData, generatedOilFile, generatedOilFileMatches } from '../../scripts/oil/generate.mjs';
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/xc40-source-first.json', import.meta.url)));
const data = loadCanonical(), pub = toPublicOilData(data), summary = validateCanonical(data);
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');
const sha = x => crypto.createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
assert.deepEqual([summary.records, summary.researchRecords, summary.legacyRecords], fixture.counts);
assert.equal(summary.productionRecommendations, 77);
assert.deepEqual(summary.statuses, { legacyPending: 4, verified: 25, preliminary: 52 });
const baseline = structuredClone(data);
baseline.records = baseline.records.slice(0, 75); baseline.audit.selectableExactCodeRecordCount = 75;
assert.equal(sha(baseline), fixture.baselineCanonicalHash);
assert.equal(sha(data.records.slice(0, 75)), fixture.baselineRecordsHash);
assert.equal(sha(pub.records.slice(0, 75)), fixture.baselinePublicHash);
assert.equal(sha(data.researchRecords), fixture.researchHash);
assert.equal(sha(data.legacyRecords), fixture.quarantineHash);
assert.equal(sha(loadReferenceInformation()), fixture.referenceHash);
assert.equal(sha(data), fixture.finalCanonicalHash);
assert.equal(sha(pub.records), fixture.finalPublicHash);
for (const [file, hash] of Object.entries({ ...fixture.protectedFiles, ...fixture.implementationHashes })) assert.equal(sha(fs.readFileSync(new URL('../../' + file, import.meta.url), 'utf8').replace(/\r\n/g, '\n')), hash, file);
assert.deepEqual(data.records.slice(75).map(r => r.id), fixture.accepted);
assert.equal(new Set([...data.records, ...data.researchRecords].map(r => r.id)).size, 94);
const first = data.records[75], ref = id => ({ sourceId: first.sources[0].id, locatorId: id });
const locator = (r, id) => r.sources[0].locators.find(l => l.id === id);
for (const expected of fixture.records) {
  const r = data.records.find(r => r.id === expected.id), p = pub.records.find(r => r.id === expected.id);
  assert.equal(sha(r), expected.hash); assert.equal(sha(r.sources), expected.sourceHash);
  assert.equal(r.status, 'preliminary'); assert.equal(r.engineCode, expected.code);
  assert.equal(r.engineIdentity.type, 'engineeringCode');
  assert.deepEqual(r.productionYears, { from: 2021, to: 2021 });
  assert.deepEqual(r.market, ['UNKNOWN']); assert.equal(p.evidenceAssessment.geography, 'unknown');
  assert.equal(p.evidenceAssessment.application, 'confirmed');
  assert.deepEqual(p.completeness, { state: 'partial', confirmedFields: 3, totalFields: 15 });
  assert.deepEqual(p.allowedSaeViscosities, ['0W-20']);
  assert.deepEqual(p.oemOilSpecifications, ['VCC RBS0-2AE']);
  assert.deepEqual(p.requiredManufacturerApprovals, []); assert.deepEqual(p.preferredManufacturerApprovals, []);
  assert.deepEqual(p.industrySpecifications, { acea: [], api: [], ilsac: [] });
  for (const f of ['serviceFillCapacity', 'capacityUnit', 'capacityNote', 'serviceInterval']) assert.equal(p[f], null);
  assert.equal(r.fieldEvidence.serviceFillCapacity.state, 'unknown');
  assert.equal(locator(r, 'volume-context').quantityType, 'volumeIncludingFilter');
  assert.equal(locator(r, 'volume-context').excerpt, expected.volumeExcerpt);
  assert.ok(!JSON.stringify(p).includes('volume-context'));
  assert.ok(!/5\.6|5\.2|6\.1/.test(JSON.stringify(p)));
  assert.equal(r.oilRequirements.coverage, 'documentedPath');
  assert.equal(r.oilRequirements.expression.allOf.length, 2);
  assert.equal(p.sources[0].documentSha256, '80f614eadce466f003db7bf9464318f5086b912a0ad7257c6a37dff1753aa30c');
  // Notes-only prior research has no invented original-response hash and cannot confirm fields.
  assert.deepEqual(p.sources[1].fields, ['notes']); assert.equal(p.sources[1].documentSha256, undefined);
  for (const lang of ['en', 'es', 'fr', 'de']) {
    const html = ui.renderOilCard(p, lang);
    assert.ok(html.includes(ui.evidenceText[lang].geographyUnknown));
    assert.ok(html.includes(ui.evidenceText[lang].oemOilSpecifications + ': VCC RBS0-2AE'));
    assert.ok(html.includes(ui.evidenceText[lang].documentedPath));
    assert.ok(html.includes(ui.evidenceText[lang].unknown));
    assert.ok(!html.includes('5.6')); assert.ok(!html.includes('5.2')); assert.ok(!html.includes('6.1'));
    assert.ok(!html.includes('GLOBAL')); assert.ok(!html.includes('>UNKNOWN<'));
    assert.ok(html.includes(r.applicationEvidence.documentScope.description[lang]));
    assert.ok(html.includes(r.notes[lang]));
    assert.ok(html.includes('data-evidence-state="unknown"'));
    assert.ok(!/<details[^>]*\sopen(?:\s|=|>)/.test(html));
    const requirements = html.slice(html.indexOf('<section class="oil-selection"'), html.indexOf('<section class="oil-quantity"'));
    assert.ok(!requirements.includes('Castrol')); assert.ok(!requirements.includes(ui.evidenceText[lang].approvals));
    const url = ui.selectionUrl('https://d3orient.com/oil-guide.html', { make: r.make, model: r.model, variant: ui.variantKey(r), engine: r.id }, lang);
    assert.equal(ui.resolveUrlState(pub, url.href).record.id, r.id);
  }
}
assert.equal(ui.cascade(pub.records, { make: 'Volvo', model: 'XC40', variant: ui.variantKey(first) }).engines.length, 6);
function blocked(mutate, label = '') {
  const r = structuredClone(first); mutate(r);
  assert.equal(isPublicOilRecord(r), false, label);
  const copy = structuredClone(data); copy.records[75] = r;
  assert.ok(!toPublicOilData(copy).records.some(p => p.id === r.id), label);
}
blocked(r => r.market = ['EU']);
blocked(r => { r.market = ['GLOBAL']; r.sources.forEach(s => s.applicableMarket = ['GLOBAL']); });
blocked(r => { r.market = ['EU']; r.sources.forEach(s => s.applicableMarket = ['EU']); });
blocked(r => r.productionYears = { from: 2020, to: 2020 });
blocked(r => locator(r, 'document').documentContext.modelYear = 2020);
blocked(r => locator(r, 'engine-row').tableRow.engineCode = 'B3154T4');
blocked(r => r.applicationEvidence.documentScope.variant = 'T3');
blocked(r => r.applicationEvidence.documentScope.links = []);
blocked(r => r.applicationEvidence.documentScope.links.push({ from: ref('engine-row'), to: ref('document'), relation: 'contains' }));
blocked(r => locator(r, 'oil-grade').tableCell.rowRef = ref('document'));
blocked(r => locator(r, 'oil-grade').tableCell.rowStart = 5);
blocked(r => delete locator(r, 'oil-grade').tableCell);
blocked(r => { locator(r, 'oil-grade').tableCell.column = 'Notes'; locator(r, 'oil-grade').section = 'Notes'; });
blocked(r => delete locator(r, 'oil-grade').tableCell.interpretation.notes);
blocked(r => r.serviceFillCapacity = 5.6);
blocked(r => locator(r, 'oil-grade').excerpt = 'SAE 0W-20 and some nearby prose mentioning VCC RBS0-2AE');
blocked(r => locator(r, 'oil-grade').excerpt += ' except AWD');
blocked(r => locator(r, 'engine-row').excerpt += ' not applicable');
blocked(r => r.sources[0].provenanceStatus = 'unconfirmed');
blocked(r => r.sources[0].documentSha256 = 'not-a-hash');
blocked(r => r.fieldEvidence.oemOilSpecifications.state = 'unknown');
blocked(r => r.applicationEvidence.state = 'unknown');
blocked(r => r.oilRequirements.state = 'conflict');
blocked(r => {
  r.requiredManufacturerApprovals = ['VCC RBS0-2AE'];
  r.fieldEvidence.requiredManufacturerApprovals = { state: 'confirmed', evidenceRefs: [ref('oil-grade')] };
  r.sources[0].fields.push('requiredManufacturerApprovals'); locator(r, 'oil-grade').fields.push('requiredManufacturerApprovals');
  r.oilRequirements.expression.allOf[1].field = 'requiredManufacturerApprovals';
});
for (const bad of [
  'http://www.volvocars.com/uk/support/', 'https://support.volvocars.com/uk/support/',
  'https://www.volvocars.com.evil.example/uk/support/', 'https://evil.example/www.volvocars.com/uk/support/',
  'https://www.volvocars.com/uk/cars/xc40/', first.sources[0].url + '?redirect=https://evil.example',
  first.sources[0].url + '#fragment', first.sources[0].url.replace('www.volvocars.com', 'user:secret@www.volvocars.com'),
  first.sources[0].url.replace('www.volvocars.com', 'www.volvocars.com:8443'),
  first.sources[0].url.replace('/article/', '/article/%2f')
]) blocked(r => r.sources[0].url = bad, bad);
// Declaring the table's filter-inclusive volume confirmed must never promote its fill type.
blocked(r => {
  r.serviceFillCapacity = 5.6; r.capacityUnit = 'L';
  const l = locator(r, 'volume-context'); l.excerpt += ' L. This review discusses an oil change.';
  l.fields.push('capacityUnit'); r.sources[0].fields.push('capacityUnit');
  for (const f of ['serviceFillCapacity', 'capacityUnit']) r.fieldEvidence[f] = { state: 'confirmed', evidenceRefs: [ref('volume-context')] };
});
const conflicting = structuredClone(first);
const secondGrade = structuredClone(locator(conflicting, 'oil-grade')); secondGrade.id = 'conflicting-grade';
secondGrade.excerpt = 'VCC RBS0-2AE 5W-30'; conflicting.sources[0].locators.push(secondGrade);
conflicting.fieldEvidence.oemOilSpecifications = { state: 'conflict', evidenceRefs: [ref('oil-grade'), ref('conflicting-grade')] };
assert.equal(isPublicOilRecord(conflicting), false);
const optionalConflict = structuredClone(first);
const otherVolume = structuredClone(locator(optionalConflict, 'volume-context')); otherVolume.id = 'other-volume';
otherVolume.excerpt = '[Review fixture] Volume including filter, approx. 6.1 litres'; optionalConflict.sources[0].locators.push(otherVolume);
optionalConflict.fieldEvidence.serviceFillCapacity = { state: 'conflict', evidenceRefs: [ref('volume-context'), ref('other-volume')] };
assert.equal(isPublicOilRecord(optionalConflict), true);
assert.equal(publicFieldRecord(optionalConflict).serviceFillCapacity, null);
assert.ok(!/5\.6|6\.1/.test(JSON.stringify(publicFieldRecord(optionalConflict))));
// Column names are interpreted through evidenced document headers, not hardcoded English labels.
const alternateHeader = structuredClone(first);
locator(alternateHeader, 'document').documentContext.tables[0].oilQualityColumn = 'Recommended oil';
locator(alternateHeader, 'document').excerpt = locator(alternateHeader, 'document').excerpt.replace('Oil grade.', 'Recommended oil.');
locator(alternateHeader, 'oil-grade').tableCell.column = 'Recommended oil';
locator(alternateHeader, 'oil-grade').section = locator(alternateHeader, 'oil-grade').section.replace('Oil grade', 'Recommended oil');
assert.equal(isPublicOilRecord(alternateHeader), true);
// Explicit cross-source field -> context -> original engine row; source IDs need not match.
const composite = structuredClone(first), other = structuredClone(composite.sources[0]);
other.id = 'synthetic-supplement'; other.title = 'Synthetic linked document fixture'; other.url = composite.sources[1].url;
other.documentSha256 = 'b'.repeat(64); other.fields = ['application', 'fuelType'];
other.locators = [
  { id: 'context', section: 'Synthetic model-year heading', fields: ['application'], excerpt: 'Volvo XC40 2021', documentContext: { make: 'Volvo', model: 'XC40', modelYear: 2021, heading: 'XC40 2021' } },
  { id: 'fuel', section: 'Synthetic exact engine fuel statement', fields: ['fuelType'], excerpt: 'B3154T9 gasoline', engineCodes: ['B3154T9'], applicabilityRef: ref('engine-row'), contextRef: { sourceId: other.id, locatorId: 'context' } }
];
composite.sources.push(other); composite.fuelType = 'petrol'; composite.fieldEvidence.fuelType = { state: 'confirmed', evidenceRefs: [{ sourceId: other.id, locatorId: 'fuel' }] };
assert.equal(assessOilEvidence(composite).eligible, true);
const compositePublic = publicFieldRecord(composite);
assert.equal(compositePublic.fuelType, 'petrol');
assert.deepEqual(compositePublic.sources.find(s => s.id === other.id).locators.map(l => l.id), ['context', 'fuel']);
const wrongComposite = structuredClone(composite); wrongComposite.sources.at(-1).locators[0].documentContext.modelYear = 2022;
assert.equal(isPublicOilRecord(wrongComposite), false);
const cyclicComposite = structuredClone(composite); cyclicComposite.sources.at(-1).locators[0].contextRef = { sourceId: other.id, locatorId: 'context' };
assert.equal(isPublicOilRecord(cyclicComposite), false);
const missingLink = structuredClone(composite); delete missingLink.sources.at(-1).locators[1].applicabilityRef;
assert.equal(isPublicOilRecord(missingLink), false);
// Old cards retain both data and 14-field completeness; S70 reference is unchanged.
assert.ok(pub.records.slice(0, 75).every(r => r.completeness.totalFields === 14));
for (const research of data.researchRecords) assert.equal(ui.resolveUrlState(pub, 'https://d3orient.com/oil-guide.html?engine=' + research.id).record, null);
assert.ok(generatedOilFileMatches(fs.readFileSync(new URL('../../oil-data.js', import.meta.url), 'utf8'), generatedOilFile(data)));
console.log('PASS source-first XC40: immutable baseline, unknown geography, linked row/cell evidence, OEM quality, non-service volumes, safe URLs and multilingual URLs/UI');
