import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { loadCanonical, loadReferenceInformation, validateCanonical, validateReferenceInformation, isPublicOilRecord } from '../../scripts/oil/validate.mjs';
import { toPublicOilData, generatedOilFile, generatedOilFileMatches } from '../../scripts/oil/generate.mjs';
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/volvo-reference.json', import.meta.url)));
const canonical = loadCanonical(), references = loadReferenceInformation();
const generated = createRequire(import.meta.url)('../../oil-data.js');
assert.deepEqual(generated.referenceInformation, references);
const sha = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const summary = validateCanonical(canonical);
assert.deepEqual([summary.records, summary.researchRecords, summary.legacyRecords], fixture.counts);
assert.equal(summary.productionRecommendations, 68);
assert.equal(sha(canonical), fixture.canonicalHash);
for (const [field, hash] of [['records', 'recordsHash'], ['researchRecords', 'researchHash'], ['legacyRecords', 'quarantineHash']]) assert.equal(sha(canonical[field]), fixture[hash]);
validateReferenceInformation(references, canonical.records);
assert.equal(sha(references), fixture.referenceInformationHash);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../../scripts/oil/evidence.mjs', import.meta.url), 'utf8').replace(/\r\n/g, '\n')).digest('hex'), fixture.evidenceGateHash);
assert.equal(references.length, 1);
const pub = toPublicOilData(canonical, references), without = toPublicOilData(canonical);
assert.deepEqual(pub.records, without.records);
assert.equal(sha(pub.records), fixture.publicRecordsHash);
assert.deepEqual(pub.legacyRecords, without.legacyRecords);
const record = pub.records.find(r => r.id === references[0].recordId);
assert.equal(record.status, 'legacyPending');
assert.equal(record.serviceFillCapacity, null);
assert.deepEqual(record.allowedSaeViscosities, []);
assert.deepEqual(record.industrySpecifications, { acea: [], api: [], ilsac: [] });
assert.deepEqual(record.requiredManufacturerApprovals, []);
assert.equal(Object.hasOwn(record, 'referenceInformation'), false);
assert.deepEqual(pub.records.map(isPublicOilRecord), without.records.map(isPublicOilRecord));
const [entry] = references;
assert.deepEqual(entry.documents.map(d => d.pdfPages), [[1, 2], [2, 3], [1, 2]]);
assert.ok(entry.documents.every(d => new URL(d.url).hostname === 'www.volvoclub.org.uk'));
for (const lang of ['en', 'es', 'fr', 'de']) {
  const html = ui.renderOilCard(record, lang, entry);
  const split = html.indexOf('<details class="result-reference"');
  assert.ok(split > 0);
  const recommendation = html.slice(0, split), reference = html.slice(split);
  assert.equal(recommendation, ui.renderOilCard(record, lang));
  assert.ok(!/<details[^>]*\sopen(?:\s|=|>)/.test(reference));
  assert.ok(reference.startsWith('<details class="result-reference" data-reference-only="true"><summary>'));
  assert.ok(!/data-field=|data-evidence-state=|status-badge/.test(reference));
  assert.ok(!/5[.,]8|5[.,]3|SG\/CC|A2-96|5W\/40/.test(recommendation));
  assert.ok(/5[.,]8/.test(reference)); assert.ok(reference.includes('A2-96'));
  assert.ok(reference.includes('B 5XX2 S')); assert.ok(reference.includes('SG/CD'));
  for (const doc of entry.documents) {
    assert.ok(reference.includes(doc.url));
    assert.ok(reference.includes(doc.summary[lang]));
    assert.ok(reference.includes(ui.evidenceText[lang].page + ' ' + doc.pdfPages.join(', ')));
  }
  if (lang !== 'en') assert.ok(!reference.includes(entry.documents[2].summary.en));
  const synthetic = structuredClone(entry);
  synthetic.documents[0].title = '<img src=x onerror="alert(1)">';
  synthetic.documents[0].summary[lang] = '<script>alert(1)</script>';
  synthetic.documents[0].url = 'https://example.com/a?x="onclick="evil';
  const escaped = ui.renderOilCard(record, lang, synthetic);
  assert.ok(!escaped.includes('<script>')); assert.ok(!escaped.includes('<img'));
  assert.ok(escaped.includes('&lt;script&gt;')); assert.ok(!escaped.includes(' onclick='));
  assert.ok(escaped.includes('rel="noopener noreferrer"'));
  for (const unsafe of ['javascript:alert(1)', 'data:text/html,evil', 'http://example.com', 'https://user:secret@example.com']) {
    synthetic.documents[0].url = unsafe;
    assert.ok(!ui.renderOilCard(record, lang, synthetic).includes('href="' + unsafe));
    assert.throws(() => validateReferenceInformation([synthetic], canonical.records), /URL|HTTPS/);
  }
  const other = pub.records.find(r => r.id !== record.id);
  assert.ok(!ui.renderOilCard(other, lang, entry).includes('data-reference-only'));
}
for (const mutate of [r => r[0].kind = 'confirmed', r => r.push(r[0]), r => r[0].recordId = canonical.researchRecords[0].id, r => r[0].serviceFillCapacity = 5.8, r => r[0].documents[0].pdfPages = [0], r => delete r[0].documents[0].summary.fr]) {
  const invalid = structuredClone(references); mutate(invalid);
  assert.throws(() => validateReferenceInformation(invalid, canonical.records));
  assert.throws(() => toPublicOilData(canonical, invalid));
}
const hidden = structuredClone(canonical);
hidden.records.find(r => r.id === record.id).status = 'preliminary';
assert.equal(toPublicOilData(hidden, references).referenceInformation.length, 0);
const page = fs.readFileSync(new URL('../../oil-guide.html', import.meta.url), 'utf8');
assert.match(page, /\.result-reference\s*\{[^}]*min-width: 0;[^}]*overflow-wrap: anywhere;/);
assert.match(page, /#resultContent\s*\{[^}]*overflow-wrap: anywhere;[^}]*min-width: 0;/);
const controller = fs.readFileSync(new URL('../../assets/js/oil-guide.js', import.meta.url), 'utf8');
assert.ok(controller.includes('data.referenceInformation?.find(entry => entry.recordId === record.id)'));
assert.ok(!controller.includes('volvo-s70-b5202s'));
assert.ok(generatedOilFileMatches(fs.readFileSync(new URL('../../oil-data.js', import.meta.url), 'utf8'), generatedOilFile(canonical)));
console.log('PASS reference-only separation, unchanged baseline, EN/ES/FR/DE, closed disclosure, escaping, safe links and mobile contract');
