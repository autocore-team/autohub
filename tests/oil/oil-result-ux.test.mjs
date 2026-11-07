import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { loadCanonical } from '../../scripts/oil/validate.mjs';
import { toPublicOilData } from '../../scripts/oil/generate.mjs';

const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');
const canonical = loadCanonical(), data = toPublicOilData(canonical);
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/result-ux.json', import.meta.url)));
const page = fs.readFileSync(new URL('../../oil-guide.html', import.meta.url), 'utf8');
const hash = s => crypto.createHash('sha256').update(s.replace(/\r\n/g, '\n')).digest('hex');
for (const [file, expected] of Object.entries(fixture.protectedFiles)) assert.equal(hash(fs.readFileSync(new URL('../../' + file, import.meta.url), 'utf8')), expected, file);
assert.deepEqual({ selectable: canonical.records.length, research: canonical.researchRecords.length, quarantine: canonical.legacyRecords.length }, fixture.counts);

// A small markup reader verifies structure and initial disclosure state, not browser layout.
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function tree(html) {
  const root = { tag: 'root', children: [] }, stack = [root];
  for (const token of html.match(/<[^>]*>|[^<]+/g) || []) {
    if (token.startsWith('</')) { stack.pop(); continue; }
    if (token.startsWith('<')) {
      const tag = token.match(/^<([\w-]+)/)?.[1]; if (!tag) continue;
      const attrs = Object.fromEntries([...token.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
      const node = { tag, attrs, children: [], parent: stack.at(-1), open: /\sopen(?:\s|=|>)/.test(token) };
      stack.at(-1).children.push(node);
      if (!['br', 'hr', 'input', 'img', 'meta', 'link'].includes(tag)) stack.push(node);
    } else stack.at(-1).children.push(decode(token));
  }
  return root;
}
const nodes = (node, predicate) => [ ...(predicate(node) ? [node] : []), ...node.children.filter(c => typeof c !== 'string').flatMap(c => nodes(c, predicate)) ];
const text = (node, visible = false) => node.children.filter(c => !visible || node.tag !== 'details' || typeof c !== 'string' && c.tag === 'summary').map(c => typeof c === 'string' ? c : text(c, visible)).join(' ');
const count = (s, value) => s.split(value).length - 1;
const honda = data.records.find(r => r.id === 'honda-accord-sedan-2017-k24w1');
const toyota = data.records.find(r => r.id === 'toyota-venza-2013-1ar-fe');
const placeholder = data.records.find(r => r.id === 'bmw-e46-m54b25');
for (const lang of ['en', 'es', 'fr', 'de']) {
  for (const record of [honda, toyota, placeholder]) {
    const markup = tree(ui.renderOilCard(record, lang)), visible = text(markup, true);
    for (const field of nodes(markup, n => n.attrs?.['data-field'])) {
      const state = nodes(field, n => n.attrs?.['data-evidence-state'])[0]?.attrs['data-evidence-state'];
      if (state === 'unknown') assert.equal(count(text(field), ui.evidenceText[lang].unknown), 1, `${record.id}/${lang}/${field.attrs['data-field']}`);
      if (state === 'conflict') { assert.equal(count(text(field), ui.evidenceText[lang].conflict), 1); assert.equal(count(text(field), ui.evidenceText[lang].unknown), 0); }
    }
    for (const details of nodes(markup, n => n.tag === 'details')) { assert.equal(details.open, false); assert.equal(details.children[0].tag, 'summary'); assert.ok(text(details.children[0]).trim()); }
    const heading = nodes(markup, n => n.tag === 'h3')[0];
    assert.ok(text(heading).includes(record.make + ' ' + record.model));
    assert.ok(text(heading).includes(ui.displayYears(record)));
    assert.ok(visible.includes(record.market[0])); assert.ok(visible.includes(record.engineCode));
    const identity = nodes(markup, n => n.attrs?.['data-field'] === 'engineIdentity')[0]; assert.ok(text(identity).includes(ui.evidenceText[lang].engineeringCode));
    const quantity = nodes(markup, n => n.attrs?.['data-field'] === 'serviceFillCapacity')[0];
    assert.ok(text(quantity).includes(record.serviceFillCapacity == null ? ui.evidenceText[lang].unknown : String(record.serviceFillCapacity)));
    assert.ok(!visible.includes(ui.evidenceText[lang].secondary + ' ' + ui.evidenceText[lang].displacement));
  }
  const markup = tree(ui.renderOilCard(honda, lang)), visible = text(markup, true);
  assert.ok(visible.includes('0W-20')); assert.ok(visible.includes('API Certification Seal'));
  assert.ok(visible.includes(ui.evidenceText[lang].partial));
  assert.ok(visible.includes(honda.applicationEvidence.applications[0].code));
  assert.ok(visible.includes(honda.sources[1].locators[1].condition[lang]));
  assert.ok(visible.includes(ui.evidenceText[lang].documentedPath));
  assert.ok(!visible.includes(honda.sources[0].locators[0].excerpt));
  const links = nodes(markup, n => n.tag === 'a').map(n => n.attrs.href);
  for (const source of honda.sources) assert.ok(links.some(href => href.startsWith(source.url)));
  for (const source of honda.sources) for (const locator of source.locators) assert.ok(text(markup).includes(locator.pageNumbers ? ui.evidenceText[lang].page + ' ' + locator.pageNumbers.join(', ') : locator.section));
  const toyotaVisible = text(tree(ui.renderOilCard(toyota, lang)), true);
  assert.ok(toyotaVisible.includes(ui.evidenceText[lang].temporarySae));
  assert.ok(toyotaVisible.includes(ui.evidenceText[lang].legacy));
}
assert.equal(ui.displayYears(honda), '2017'); assert.equal(ui.displayYears(placeholder), '2000–2006');
assert.equal(ui.yearsLabel(honda), '2017-2017'); assert.equal(ui.variantKey(honda), 'CR2|||2017-2017');
assert.equal(ui.variantLabel(ui.variantKey(honda)), 'CR2 · 2017');
assert.equal(ui.variantLabel(ui.variantKey(placeholder)), 'E46 · 2000–2006');
const state = ui.resolveUrlState(data, 'https://d3orient.com/oil-guide.html?engine=' + honda.id + '&variant=CR2%7C%7C%7C2017-2017&lang=fr');
assert.equal(state.record.id, honda.id); assert.equal(ui.selectionUrl('https://d3orient.com/oil-guide.html', state, 'fr').searchParams.get('variant'), 'CR2|||2017-2017');

// Synthetic presentation states never alter data or pass a record through the evidence gate.
const conflict = structuredClone(honda); conflict.fieldEvidence.serviceFillCapacity.state = 'conflict'; conflict.evidenceAssessment.fields.serviceFillCapacity = 'conflict'; conflict.serviceFillCapacity = 99.9; conflict.capacityUnit = 'L';
for (const lang of ['en', 'es', 'fr', 'de']) {
  const markup = tree(ui.renderOilCard(conflict, lang)), field = nodes(markup, n => n.attrs?.['data-field'] === 'serviceFillCapacity')[0];
  assert.equal(count(text(field), ui.evidenceText[lang].conflict), 1); assert.ok(!text(field).includes('99.9')); assert.ok(!text(field).includes(ui.evidenceText[lang].unknown));
  for (const unitState of ['unknown', 'conflict']) {
    const unitIssue = structuredClone(honda); unitIssue.serviceFillCapacity = 99.9; unitIssue.capacityUnit = 'L';
    unitIssue.evidenceAssessment.fields.serviceFillCapacity = 'confirmed'; unitIssue.evidenceAssessment.fields.capacityUnit = unitState;
    const quantity = nodes(tree(ui.renderOilCard(unitIssue, lang)), n => n.attrs?.['data-field'] === 'serviceFillCapacity')[0];
    assert.equal(count(text(quantity), ui.evidenceText[lang][unitState]), 1); assert.ok(!text(quantity).includes('99.9'));
  }
  const badRequirement = structuredClone(honda); badRequirement.oilRequirements.state = 'conflict';
  const visible = text(tree(ui.renderOilCard(badRequirement, lang)), true);
  assert.ok(visible.includes(ui.evidenceText[lang].conflict)); assert.ok(!visible.includes('0W-20'));
  const legacyConflict = structuredClone(toyota); legacyConflict.evidenceAssessment.fields.allowedSaeViscosities = 'conflict';
  const legacyVisible = text(tree(ui.renderOilCard(legacyConflict, lang)), true);
  assert.ok(legacyVisible.includes(ui.evidenceText[lang].conflict)); assert.ok(!legacyVisible.includes('0W-20')); assert.ok(!legacyVisible.includes('5W-20'));
  const badApplication = structuredClone(honda); badApplication.applicationEvidence.state = 'unknown'; badApplication.evidenceAssessment.application = 'unknown';
  assert.ok(!text(tree(ui.renderOilCard(badApplication, lang)), true).includes('0W-20'));
  const complete = structuredClone(toyota); complete.completeness = { state: 'complete', confirmedFields: 14, totalFields: 14 }; complete.evidenceAssessment.fields.allowedSaeViscosities = 'confirmed'; complete.evidenceAssessment.fields.serviceFillCapacity = 'confirmed';
  const completeTree = tree(ui.renderOilCard(complete, lang));
  assert.ok(text(completeTree, true).includes(ui.evidenceText[lang].complete));
  for (const f of ['allowedSaeViscosities', 'serviceFillCapacity']) assert.ok(nodes(completeTree, n => n.attrs?.['data-field'] === f)[0].children.some(n => n.attrs?.['data-evidence-state'] === 'confirmed'));
  const choice = structuredClone(honda), first = structuredClone(choice.oilRequirements.expression), second = structuredClone(first);
  const faq = choice.sources[1]; faq.locators.push({ id: 'synthetic-condition', condition: Object.fromEntries(['en', 'es', 'fr', 'de'].map(l => [l, 'TEST cold condition ' + l])) }); second.conditionRef = { sourceId: faq.id, locatorId: 'synthetic-condition' };
  choice.oilRequirements.expression = { anyOf: [first, second] };
  const choiceTree = tree(ui.renderOilCard(choice, lang));
  assert.equal(nodes(choiceTree, n => n.attrs?.['data-operator'] === 'anyOf').length, 1);
  assert.equal(nodes(choiceTree, n => n.attrs?.['data-operator'] === 'allOf').length, 2);
  assert.ok(text(choiceTree, true).includes('TEST cold condition ' + lang));
  assert.ok(text(choiceTree, true).includes(ui.evidenceText[lang].and)); assert.ok(text(choiceTree, true).includes(ui.evidenceText[lang].or));
}
assert.ok(!page.includes('Starter records are under review'));
assert.match(page, /summary:focus-visible/); assert.match(page, /minmax\(0, 2fr\) minmax\(0, 1fr\)/); assert.match(page, /overflow-wrap: anywhere/);
assert.match(page, /@media \(max-width: 900px\) \{ \.result-primary \{ grid-template-columns: 1fr/);
console.log('PASS Oil result UX: unchanged datasets/gate/CI, one unknown/conflict message per field, single-year display with stable URLs, visible conditions/alternatives, collapsed native evidence, Honda/Toyota/placeholder/complete/conflict fixtures and responsive CSS contracts (not a visual browser test)');
