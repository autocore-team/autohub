import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { loadCanonical, validateCanonical, isPublicOilRecord } from '../../scripts/oil/validate.mjs';
import { assessOilEvidence, technicalFields } from '../../scripts/oil/evidence.mjs';
import { toPublicOilData, generatedOilFile, generatedOilFileMatches } from '../../scripts/oil/generate.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch-3-production.json', import.meta.url)));
const data = loadCanonical(), pub = toPublicOilData(data), summary = validateCanonical(data);
const current = fixture.current || { counts: fixture.finalCounts, canonicalHash: fixture.finalCanonicalHash, remainingResearchHash: fixture.remainingResearchHash, remainingResearchRecords: fixture.remainingResearchRecords };
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');
const sha = (x) => crypto.createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
assert.deepEqual(fixture.baselineCounts, { selectable: 31, research: 48, quarantine: 59 });
assert.deepEqual(fixture.finalCounts, { selectable: 42, research: 37, quarantine: 59 });
assert.equal(summary.records, current.counts.selectable);
assert.equal(summary.researchRecords, current.counts.research);
assert.equal(summary.legacyRecords, fixture.finalCounts.quarantine);
assert.equal(sha(data.records.slice(0, 31)), fixture.baselineRecordsHash);
assert.equal(sha(data.records.slice(0, 31).map(r => r.id)), fixture.baselineOrderHash);
assert.equal(sha(pub.records.slice(0, 31)), fixture.baselinePublicHash);
assert.equal(sha(data.legacyRecords), fixture.legacyQuarantineHash);
assert.equal(sha(data.researchRecords), current.remainingResearchHash);
assert.equal(sha(data), current.canonicalHash);
assert.equal(sha(data.records.slice(0, fixture.finalCounts.selectable)), fixture.finalRecordsHash);
assert.equal(sha(pub.records.slice(0, fixture.finalCounts.selectable)), fixture.finalPublicHash);
assert.deepEqual(data.records.slice(31, fixture.finalCounts.selectable).map(r => r.id), fixture.accepted);
assert.equal(fixture.considered.length, 15);
assert.equal(fixture.accepted.length, 11);
assert.equal(fixture.retained.length, 4);
assert.deepEqual([...fixture.accepted, ...fixture.retained.map(r => r.id)].sort(), [...fixture.considered].sort());
assert.equal(new Set([...data.records, ...data.researchRecords].map(r => r.id)).size, 87);
for (const r of data.researchRecords) assert.equal(sha(r), current.remainingResearchRecords[r.id]);
for (const [file, hash] of Object.entries(fixture.protectedFiles)) {
  assert.equal(sha(fs.readFileSync(new URL('../../' + file, import.meta.url), 'utf8').replace(/\r\n/g, '\n')), hash, file);
}
console.log('PASS Batch 3: 31 unchanged baseline records and public payload, 59 quarantine; 15 reviewed / 11 accepted / 4 retained; protected schema/UI/policy/PCD/Engines/CI');

for (const expected of fixture.records) {
  const raw = data.records.find(r => r.id === expected.id), record = pub.records.find(r => r.id === expected.id);
  assert.equal(raw.status, 'preliminary'); assert.equal(record.status, 'preliminary');
  assert.deepEqual(raw.engineIdentity, { type: 'engineeringCode' });
  assert.equal(record.engineCode, expected.engineCode);
  assert.equal(record.model, expected.model);
  assert.deepEqual(record.productionYears, { from: 2017, to: 2017 });
  assert.deepEqual(record.market, ['US']);
  assert.deepEqual(record.applicationEvidence.applications, expected.applications);
  assert.ok(!data.researchRecords.some(r => r.id === record.id));
  assert.equal(raw.serviceFillCapacity, expected.capturedCapacity);
  assert.equal(raw.capacityUnit, expected.capturedCapacityUnit);
  assert.equal(sha(raw.capacityNote), expected.capturedCapacityNoteHash);
  const { id: archiveId, ...archive } = raw.sources[1];
  assert.equal(archiveId, 'archival-working-copy'); assert.equal(sha(archive), expected.archivedSourceHash);
  assert.deepEqual(raw.sources.map(s => s.url), expected.sourceUrls);
  const assessment = assessOilEvidence(raw);
  assert.equal(assessment.eligible, true); assert.equal(assessment.application, 'confirmed');
  assert.deepEqual(Object.keys(assessment.fields).filter(f => assessment.fields[f] === 'confirmed'), expected.confirmedFields);
  assert.deepEqual(record.completeness, { state: 'partial', confirmedFields: expected.confirmedFields.length, totalFields: technicalFields.length });
  assert.deepEqual(record.allowedSaeViscosities, ['0W-20']);
  assert.deepEqual(record.industrySpecifications, { acea: [], api: ['API Certification Seal'], ilsac: [] });
  for (const field of ['serviceFillCapacity', 'capacityUnit', 'capacityNote', 'serviceInterval']) assert.equal(record[field], null);
  assert.deepEqual(record.requiredManufacturerApprovals, []); assert.deepEqual(record.preferredManufacturerApprovals, []);
  if (!expected.confirmedFields.includes('displacementLiters')) assert.equal(record.displacementLiters, null);
  assert.equal(record.sources.length, 2);
  assert.equal(record.sources[0].url, expected.identityEvidence.url);
  assert.equal(record.sources[0].documentSha256, expected.identityEvidence.documentSha256);
  assert.deepEqual(record.sources[0].pageNumbers, expected.identityEvidence.pages);
  assert.equal(record.sources[1].locators[0].section, expected.faqSection);
  assert.ok(!JSON.stringify(record).includes('laboratoryb.org'));
  assert.ok(!JSON.stringify(record).includes('WORKING COPY'));
  assert.ok(!JSON.stringify(record).includes('with filter'));
  for (const source of record.sources) {
    assert.equal(source.provenanceStatus, 'confirmed'); assert.match(source.documentSha256, /^[a-f0-9]{64}$/);
    assert.ok(source.locators.every(l => l.excerpt && (l.section || l.pageNumbers?.length)));
  }
  const refs = [...record.applicationEvidence.evidenceRefs, ...Object.values(record.fieldEvidence).flatMap(e => e.evidenceRefs)];
  for (const ref of refs) assert.ok(record.sources.find(s => s.id === ref.sourceId)?.locators.some(l => l.id === ref.locatorId));
  assert.equal(record.oilRequirements.coverage, 'documentedPath');
  assert.deepEqual(record.oilRequirements.expression.allOf, [{ field: 'allowedSaeViscosities', index: 0 }, { field: 'industrySpecifications.api', index: 0 }]);
  assert.ok(record.oilRequirements.expression.conditionRef);
  const selected = ui.cascade(pub.records, { make: record.make, model: record.model, variant: ui.variantKey(record), engine: record.id });
  assert.equal(selected.engine, record.id); assert.ok(selected.engines.some(r => r.id === record.id));
  assert.equal(ui.findRecord(pub, record.id).value.id, record.id);
  for (const lang of ['en', 'es', 'fr', 'de']) {
    const state = ui.resolveUrlState(pub, `https://d3orient.com/oil-guide.html?engine=${record.id}&lang=${lang}`);
    assert.equal(state.record.id, record.id); assert.equal(state.lang, lang);
    assert.equal(ui.resolveUrlState(pub, ui.selectionUrl('https://d3orient.com/oil-guide.html?ref=batch3', state, lang).href).record.id, record.id);
    const html = ui.renderOilCard(record, lang);
    assert.ok(html.includes(ui.evidenceText[lang].unknown)); assert.ok(html.includes(ui.evidenceText[lang].partial));
    assert.ok(html.includes(ui.evidenceText[lang].documentedPath)); assert.ok(html.includes('data-operator="allOf"'));
    assert.ok(html.includes(record.sources[1].locators[1].condition[lang]));
    assert.doesNotMatch(html, />Verified</); assert.ok(!html.includes(`${raw.serviceFillCapacity} US qt`));
  }
  for (const [field, value] of [['applicationEvidence', 'unknown'], ['applicationEvidence', 'conflict'], ['oilRequirements', 'unknown'], ['oilRequirements', 'conflict']]) {
    const bad = structuredClone(raw); bad[field].state = value;
    if (field === 'applicationEvidence' && value === 'conflict') {
      bad.sources[0].locators.push({ ...bad.sources[0].locators[0], id: 'conflicting-app' });
      bad.applicationEvidence.evidenceRefs.push({ sourceId: bad.sources[0].id, locatorId: 'conflicting-app' });
    }
    assert.equal(isPublicOilRecord(bad), false);
    assert.equal(toPublicOilData({ ...data, records: [bad] }).records.length, 0);
  }
  for (const mutate of [r => r.applicationEvidence.applications[0].transmission = '9AT', r => r.market = ['EU'], r => r.productionYears.from = 2016, r => r.fieldEvidence.allowedSaeViscosities.evidenceRefs[0].locatorId = 'missing']) {
    const bad = structuredClone(raw); mutate(bad); assert.equal(isPublicOilRecord(bad), false);
  }
}
console.log('PASS exact applications, typed identity, source locators, evidence gate, conditional SAE/API path, optional unknowns/completeness and multilingual selectors/URLs');

for (const r of data.researchRecords) {
  assert.equal(isPublicOilRecord(r), false);
  assert.ok(!pub.records.some(p => p.id === r.id));
  assert.notEqual(ui.findRecord(pub, r.id)?.value?.id, r.id);
  assert.equal(ui.resolveUrlState(pub, `https://d3orient.com/oil-guide.html?engine=${r.id}&make=Honda`).record, null);
}
for (const deferred of fixture.retained) assert.ok(data.researchRecords.some(r => r.id === deferred.id));
const fit = pub.records.find(r => r.id === 'honda-fit-2017-l15b1');
assert.ok(fit.applicationEvidence.applications.every(a => a.transmission === '6MT'));
assert.equal(pub.records.find(r => r.id === 'honda-civic-hatchback-2017-l15ba').applicationEvidence.applications[0].trim, 'LX');
assert.ok(generatedOilFileMatches(fs.readFileSync(new URL('../../oil-data.js', import.meta.url), 'utf8'), generatedOilFile(data)));
console.log('PASS current research-only records blocked by direct URL/search; Fit restricted to unambiguous 6MT, hatchback to LX; generated freshness');
