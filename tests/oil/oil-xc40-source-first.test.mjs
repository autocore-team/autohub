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
const [pilotCount, researchCount, quarantineCount] = fixture.counts;
assert.deepEqual([summary.records, summary.researchRecords, summary.legacyRecords], [132, researchCount, quarantineCount]);
assert.equal(summary.productionRecommendations, 128);
assert.deepEqual(summary.statuses, { legacyPending: 4, verified: 25, preliminary: 103 });
const baseline = structuredClone(data);
baseline.records = baseline.records.slice(0, 75); baseline.audit.selectableExactCodeRecordCount = 75;
assert.equal(sha(baseline), fixture.baselineCanonicalHash);
assert.equal(sha(data.records.slice(0, 75)), fixture.baselineRecordsHash);
assert.equal(sha(pub.records.slice(0, 75)), fixture.baselinePublicHash);
assert.equal(sha(data.researchRecords), fixture.researchHash);
assert.equal(sha(data.legacyRecords), fixture.quarantineHash);
assert.equal(sha(loadReferenceInformation()), fixture.referenceHash);
const pilot = structuredClone(data);
pilot.records = pilot.records.slice(0, pilotCount);
pilot.audit.selectableExactCodeRecordCount = pilotCount;
assert.equal(sha(pilot), fixture.finalCanonicalHash);
const withoutVolumeReference = ({ filterInclusiveVolumeReference, ...record }) => record;
assert.equal(sha(pub.records.slice(0, pilotCount).map(withoutVolumeReference)), fixture.finalPublicHash);
for (const [file, hash] of Object.entries({ ...fixture.protectedFiles, ...fixture.implementationHashes })) assert.equal(sha(fs.readFileSync(new URL('../../' + file, import.meta.url), 'utf8').replace(/\r\n/g, '\n')), hash, file);
assert.deepEqual(pilot.records.slice(75).map(r => r.id), fixture.accepted);
assert.equal(new Set([...data.records, ...data.researchRecords].map(r => r.id)).size, 145);
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
  assert.ok(!/5\.6|5\.2|6\.1/.test(JSON.stringify(withoutVolumeReference(p))));
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
    assert.doesNotMatch(html, /class="result-secondary"/);
    const quantity = html.match(/<section class="oil-quantity">([\s\S]*?)<\/section>/)[1];
    assert.match(quantity, /class="oil-volume-reference"/);
    assert.doesNotMatch(quantity, /class="spec-value"/);
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

const v60 = data.records.slice(pilotCount, 88);
assert.deepEqual(v60.map(r => r.engineCode), ['B420T4', 'B420T6', 'B420T5', 'D420T8', 'B420T2', 'B420T10', 'B420T']);
const germanUrl = 'https://www.volvocars.com/de/support/car/v60/21w46/article/b0804d54c7fc096bc0a81f6f065ad63e/8899be1dc7fc78b1c0a81f6f5a01b4ab/49dad04cd510c64dc0a8015158ce1c13/';
const germanGrade = 'Castrol Edge Professional V 0W-20 oder VCC RBS0-2AE 0W-20';
for (const [index, record] of v60.entries()) {
  const publicRecord = pub.records.find(r => r.id === record.id);
  assert.equal(record.model, 'V60');
  assert.deepEqual(record.productionYears, { from: 2022, to: 2022 });
  assert.equal(record.status, 'preliminary');
  assert.equal(record.sources[0].url, germanUrl);
  assert.equal(record.sources[0].documentSha256, '41a886a5ae2ffb0e32cf74d708ce47b45132f732ad69801a06a582a73a08d5a5');
  assert.equal(locator(record, 'engine-row').tableRow.rowIndex, index + 1);
  const grade = locator(record, 'oil-grade');
  assert.equal(grade.excerpt, germanGrade);
  assert.deepEqual([grade.tableCell.rowStart, grade.tableCell.rowSpan], [1, 7]);
  assert.deepEqual(publicRecord.completeness, { state: 'partial', confirmedFields: 3, totalFields: 15 });
  assert.equal(publicRecord.evidenceAssessment.geography, 'unknown');
  assert.deepEqual(publicRecord.oemOilSpecifications, ['VCC RBS0-2AE']);
  assert.deepEqual(publicRecord.allowedSaeViscosities, ['0W-20']);
  assert.deepEqual(publicRecord.requiredManufacturerApprovals, []);
  assert.equal(publicRecord.serviceFillCapacity, null);
  assert.equal(record.fieldEvidence.serviceFillCapacity.state, 'unknown');
  assert.equal(locator(record, 'volume-context').quantityType, 'volumeIncludingFilter');
  assert.ok(!JSON.stringify(publicRecord).includes('volume-context'));
}
for (const badUrl of [germanUrl + '?utm_source=test', germanUrl.replace('/support/car/', '/cars/'), germanUrl.replace('/de/', '/fr/')]) {
  const record = structuredClone(v60[0]);
  record.sources[0].url = badUrl;
  assert.throws(() => assessOilEvidence(record), /Document source has an unsafe or unreviewed URL/);
}
for (const badExcerpt of ['VCC RBS0-2AE oder 0W-20', germanGrade.replace('oder', 'Decoder')]) {
  const record = structuredClone(v60[0]);
  locator(record, 'oil-grade').excerpt = badExcerpt;
  assert.throws(() => assessOilEvidence(record), /Cell does not contain the documented specification \+ SAE alternative/);
}
const britishWithGermanGrade = structuredClone(first);
locator(britishWithGermanGrade, 'oil-grade').excerpt = germanGrade;
assert.equal(isPublicOilRecord(first), true);
assert.throws(() => assessOilEvidence(britishWithGermanGrade), /Cell does not contain the documented specification \+ SAE alternative/);
console.log('PASS source-first V60: seven exact rows, German Volvo URL and alternatives, paired SAE and specification, unknown geography and service-fill');

const v60Baseline = structuredClone(data);
v60Baseline.records = v60Baseline.records.slice(0, 88);
v60Baseline.audit.selectableExactCodeRecordCount = 88;
assert.equal(sha(v60Baseline), '8b804dede454513af6ad656d8de44ff9b2168de3dc48d71329c86d090d4b0639');
const xc60 = data.records.slice(88, 100);
assert.deepEqual(xc60.map(r => r.engineCode), ['B4204T31', 'B4204T23', 'B4204T26', 'B4204T20', 'B4204T27', 'D4204T14', 'D4204T23', 'B420T6', 'D420T8', 'B420T2', 'D420T2', 'B420T']);
const xc60CellBounds = [[1, 5], [6, 2], [8, 5]];
const expectedXc60Bounds = xc60CellBounds.flatMap(([start, span]) => Array.from({ length: span }, () => [start, span]));
for (const [index, record] of xc60.entries()) {
  const publicRecord = pub.records.find(r => r.id === record.id);
  const grade = locator(record, 'oil-grade');
  assert.equal(record.model, 'XC60');
  assert.deepEqual(record.productionYears, { from: 2021, to: 2021 });
  assert.equal(record.status, 'preliminary');
  assert.equal(record.sources[0].documentSha256, '667cd35dccd301c4bfe037dd24b579c54968af2d9911528d15bc2ac57ec40a69');
  assert.equal(locator(record, 'engine-row').tableRow.rowIndex, index + 1);
  assert.equal(grade.excerpt, 'Castrol Edge Professional V 0W-20 or VCC RBS0-2AE 0W-20');
  assert.deepEqual([grade.tableCell.rowStart, grade.tableCell.rowSpan], expectedXc60Bounds[index]);
  assert.deepEqual(publicRecord.completeness, { state: 'partial', confirmedFields: 3, totalFields: 15 });
  assert.deepEqual(publicRecord.oemOilSpecifications, ['VCC RBS0-2AE']);
  assert.deepEqual(publicRecord.allowedSaeViscosities, ['0W-20']);
  assert.equal(publicRecord.evidenceAssessment.geography, 'unknown');
  assert.equal(publicRecord.serviceFillCapacity, null);
  assert.equal(locator(record, 'volume-context').quantityType, 'volumeIncludingFilter');
  assert.ok(!JSON.stringify(publicRecord).includes('volume-context'));
}
console.log('PASS source-first XC60: 12 exact engine rows and three reviewed cell spans; baseline, unknown geography and service-fill preserved');

const volumeRecords = pub.records.filter(r => r.filterInclusiveVolumeReference);
const volvo2021 = data.records.slice(100, 124);
const volvo2022 = data.records.slice(124);
assert.deepEqual(volumeRecords.map(r => r.id), [...fixture.accepted, ...v60.map(r => r.id), ...xc60.map(r => r.id), ...volvo2021.map(r => r.id), ...volvo2022.map(r => r.id)]);
assert.deepEqual(volumeRecords.map(r => r.filterInclusiveVolumeReference.litres), [
  5.6, 5.6, 5.6, 5.2, 6.1, 6.1,
  6.1, 6.1, 6.1, 5.6, 6.1, 6.1, 6.1,
  5.6, 5.6, 5.6, 5.6, 5.6, 5.2, 5.2, 6.1, 5.6, 6.1, 5.6, 6.1,
  6.1, 5.6, 6.1, 5.6, 6.1,
  5.6, 5.6, 5.6, 5.2, 6.1, 5.6, 6.1,
  5.6, 5.6, 5.6, 5.6, 5.2, 5.2, 5.2, 5.2, 6.1, 6.1, 5.6, 6.1,
  6.1, 5.6, 6.1, 6.1,
  6.1, 6.1, 6.1, 6.1
]);
for (const record of volumeRecords) {
  const source = record.sources.find(s => s.id === record.filterInclusiveVolumeReference.sourceId);
  assert.equal(source.id, record.applicationEvidence.documentScope.rowRef.sourceId);
  assert.equal(record.serviceFillCapacity, null);
  for (const lang of ['en', 'es', 'fr', 'de']) {
    const rendered = ui.renderOilCard(record, lang);
    const quantity = rendered.match(/<section class="oil-quantity">([\s\S]*?)<\/section>/)[1];
    const litres = new Intl.NumberFormat(lang).format(record.filterInclusiveVolumeReference.litres);
    const text = ui.evidenceText[lang].volvoVolume;
    assert.ok(quantity.includes(text.title));
    assert.ok(quantity.includes(text.value.replace('{volume}', litres)));
    assert.ok(quantity.includes(text.note));
    assert.ok(quantity.includes('href="' + source.url + '" rel="noopener noreferrer">Volvo Support</a>'));
    assert.doesNotMatch(quantity, /data-field="serviceFillCapacity"|class="evidence-status"/);
  }
}
for (const changeLocator of [l => delete l.applicabilityRef, l => l.applicabilityRef.locatorId = 'document', l => l.engineCodes = ['B4204T23'], l => l.excerpt = l.excerpt.replace('B4204T31', 'B4204T23'), l => l.excerpt += ' or more']) {
  const copy = structuredClone(data);
  const record = copy.records.find(r => r.id === xc60[0].id);
  changeLocator(locator(record, 'volume-context'));
  assert.equal(toPublicOilData(copy).records.find(r => r.id === record.id).filterInclusiveVolumeReference, undefined);
}
console.log('PASS Volvo table reference volumes: exact row and source links, four locales, and unbound values withheld');

const xc60Baseline = structuredClone(data);
xc60Baseline.records = xc60Baseline.records.slice(0, 100);
xc60Baseline.audit.selectableExactCodeRecordCount = 100;
assert.equal(sha(xc60Baseline), '911be1fc8cf3875644c89f5dcbde871876cd7709924aec90e93671139ba389d9');
const reviewedTables = [
  { model: 'V90', codes: ['B420T6', 'D420T8', 'B420T2', 'D420T2', 'B420T'], cells: [[1, 5]],
    hash: 'f9240faf75cbcba4d37754f32b08322874c43574b7cc328e7edf1e112d89d620' },
  { model: 'XC90', codes: ['B4204T20', 'B4204T23', 'B4204T27', 'D4204T23', 'B420T2', 'D420T2', 'B420T'], cells: [[1, 3], [4, 1], [5, 3]],
    hash: '552840063b281618fea91f6b9c549636628ec59393a3e66baba08f32486ee026' },
  { model: 'S90', codes: ['B4204T44', 'B4204T20', 'B4204T23', 'B4204T27', 'D4204T16', 'D4204T7', 'D4204T14', 'D4204T23', 'B420T6', 'B420T2', 'D420T2', 'B420T'], cells: [[1, 4], [5, 4], [9, 4]],
    hash: '488619e16512191bbfa5add581a826d7d644c734cab3c8bad0691342452af838' }
];
for (const { model, codes, cells, hash } of reviewedTables) {
  const records = volvo2021.filter(r => r.model === model);
  assert.deepEqual(records.map(r => r.engineCode), codes);
  const bounds = cells.flatMap(([start, span]) => Array.from({ length: span }, () => [start, span]));
  for (const [index, record] of records.entries()) {
    const publicRecord = pub.records.find(r => r.id === record.id);
    const { rowStart, rowSpan } = locator(record, 'oil-grade').tableCell;
    assert.deepEqual([rowStart, rowSpan], bounds[index]);
    assert.equal(locator(record, 'engine-row').tableRow.rowIndex, index + 1);
    assert.equal(record.sources[0].documentSha256, hash);
    assert.deepEqual(record.productionYears, { from: 2021, to: 2021 });
    assert.equal(record.status, 'preliminary');
    assert.equal(publicRecord.completeness.state, 'partial');
    assert.equal(publicRecord.evidenceAssessment.geography, 'unknown');
    assert.deepEqual(publicRecord.oemOilSpecifications, ['VCC RBS0-2AE']);
    assert.deepEqual(publicRecord.allowedSaeViscosities, ['0W-20']);
  }
}
console.log('PASS MY2021 Volvo V90, XC90 and S90: 24 exact engine rows, reviewed cell spans and unchanged baseline');

const reviewed2022 = [
  { model: 'XC90', edition: '21w46', hash: 'b9a26efa99cb7cb34a27cdc232cc74b3ca65c76945fa17b8c2dc10000be8a983',
    rows: [['B5 AWD', 'B420T2'], ['B5 AWD', 'D420T2'], ['B5 AWD', 'B420T10'], ['B6 AWD', 'B420T']] },
  { model: 'S60', edition: '21w22', hash: 'cf5be8bdac20157689dc5fe393ff7c5a2c54226437d4c73a3e0e253ce75945bd',
    rows: [['B3', 'B420T3'], ['B4', 'B420T6'], ['B5 / B5 AWD', 'B420T2'], ['B5 AWD', 'B420T10']] }
];
assert.equal(volvo2022.length, 8);
for (const { model, edition, hash, rows } of reviewed2022) {
  const records = volvo2022.filter(record => record.model === model);
  assert.deepEqual(records.map(record => [record.applicationEvidence.documentScope.variant, record.engineCode]), rows);
  for (const [index, record] of records.entries()) {
    const [source] = record.sources;
    const row = locator(record, 'engine-row').tableRow;
    const cell = locator(record, 'oil-grade').tableCell;
    const publicRecord = pub.records.find(candidate => candidate.id === record.id);
    assert.equal(record.id, `volvo-${model.toLowerCase()}-2022-${row.engineCode.toLowerCase()}`);
    assert.ok(source.url.startsWith(`https://www.volvocars.com/uk/support/car/${model.toLowerCase()}/${edition}/article/`));
    assert.equal(source.documentSha256, hash);
    assert.equal(locator(record, 'document').documentContext.heading, model + ' 2022');
    assert.deepEqual(record.productionYears, { from: 2022, to: 2022 });
    assert.deepEqual([row.rowIndex, cell.rowStart, cell.rowSpan, cell.column], [index + 1, 1, 4, 'Oil grade']);
    assert.deepEqual(cell.rowRef, record.applicationEvidence.documentScope.rowRef);
    assert.equal(record.status, 'preliminary');
    assert.deepEqual(publicRecord.completeness, { state: 'partial', confirmedFields: 3, totalFields: 15 });
    assert.deepEqual(publicRecord.market, ['UNKNOWN']);
    assert.equal(publicRecord.evidenceAssessment.fields.serviceFillCapacity, 'unknown');
    assert.deepEqual(publicRecord.allowedSaeViscosities, ['0W-20']);
    assert.deepEqual(publicRecord.oemOilSpecifications, ['VCC RBS0-2AE']);
  }
}
console.log('PASS MY2022 Volvo XC90 and S60: eight exact engine rows, offline source hashes and shared Oil grade cell spans');
