import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { assessOilEvidence, technicalFields } from '../../scripts/oil/evidence.mjs';
import { loadCanonical, validateCanonical, isPublicOilRecord } from '../../scripts/oil/validate.mjs';
import { toPublicOilData, generatedOilFile, generatedOilFileMatches } from '../../scripts/oil/generate.mjs';
const ui = createRequire(import.meta.url)('../../assets/js/oil-guide.js');
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/field-evidence.json', import.meta.url)));
const data = loadCanonical();
const publicData = toPublicOilData(data);
const sha = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const partial = data.records.find((r) => r.id === fixture.partialIds[0]);
const ref = (sourceId, locatorId) => ({ sourceId, locatorId });
const copy = () => structuredClone(partial);
const invalid = (mutate, pattern) => { const r = copy(); mutate(r); assert.throws(() => assessOilEvidence(r), pattern); assert.equal(isPublicOilRecord(r), false); };
assert.equal(data.records.length, fixture.selectableCount);
assert.equal(data.researchRecords.length, fixture.researchCount);
assert.equal(data.legacyRecords.length, 59);
assert.equal(sha(data.records.slice(0,29)), fixture.baselineRecordsHash);
assert.equal(sha(data.records.filter((r) => r.make === 'Toyota')), fixture.toyotaHash);
assert.equal(sha(data.records.slice(0,4)), fixture.foundationHash);
assert.equal(sha(data.legacyRecords), fixture.legacyQuarantineHash);
assert.equal(sha(data.researchRecords), fixture.remainingResearchHash);
assert.equal(new Set([...data.records, ...data.researchRecords].map((r) => r.id)).size, 79);
for (const id of fixture.partialIds) {
  const source = data.records.find((r) => r.id === id), pub = publicData.records.find((r) => r.id === id);
  assert.equal(source.status, 'preliminary');
  assert.equal(Object.hasOwn(source.engineIdentity, 'value'), false);
  assert.equal(ui.engineLabel(pub), source.engineCode);
  assert.equal(pub.status, 'preliminary');
  const assessment = assessOilEvidence(source);
  assert.equal(assessment.eligible, true);
  assert.equal(assessment.application, 'confirmed');
  assert.equal(assessment.fields.serviceFillCapacity, 'unknown');
  assert.equal(assessment.completeness.state, 'partial');
  assert.equal(assessment.completeness.confirmedFields, 6);
  assert.equal(pub.serviceFillCapacity, null);
  assert.equal(pub.capacityUnit, null);
  assert.equal(pub.capacityNote, null);
  assert.equal(pub.serviceInterval, null);
  assert.deepEqual(pub.industrySpecifications, {acea:[], api:['API Certification Seal'], ilsac:[]});
  assert.equal(pub.sources.length, 2);
  assert.ok(!JSON.stringify(pub).includes('laboratoryb.org'));
  assert.ok(!JSON.stringify(pub).includes('WORKING COPY'));
  assert.equal(ui.resolveUrlState(publicData, `https://d3orient.com/oil-guide.html?engine=${id}&lang=de`).record.id, id);
  assert.equal(ui.findRecord(publicData, id).value.id, id);
}
for (const r of publicData.records.slice(0,29)) {
  assert.equal(r.evidenceAssessment.mode, 'legacyUnassessed');
  assert.equal(r.evidenceAssessment.application, 'notAssessed');
  assert.ok(Object.values(r.evidenceAssessment.fields).every((s) => s === 'notAssessed'));
}
assert.ok(generatedOilFileMatches(fs.readFileSync(new URL('../../oil-data.js', import.meta.url),'utf8'), generatedOilFile(data)));
console.log('PASS immutable Toyota/foundation/quarantine, 22 research-only records, original two scoped preliminary partial cards, safe unknown fields and legacy-unassessed state');

for (const state of ['unknown','conflict']) {
  const r=copy();r.applicationEvidence.state=state;
  if(state==='conflict') {const s=r.sources[0];s.locators.push({...structuredClone(s.locators[0]),id:'other-app'});r.applicationEvidence.evidenceRefs.push(ref(s.id,'other-app'));}
  assert.equal(assessOilEvidence(r).eligible,false);
  assert.equal(isPublicOilRecord(r),false);
  const c=structuredClone(data);c.records[c.records.findIndex(x=>x.id===r.id)]=r;
  assert.throws(()=>validateCanonical(c),/unresolved research evidence/);
  assert.ok(!toPublicOilData(c).records.some(x=>x.id===r.id));
}
for (const state of ['unknown','conflict']) {const r=copy();r.oilRequirements.state=state;assert.equal(assessOilEvidence(r).eligible,false);assert.equal(isPublicOilRecord(r),false);}
invalid(r=>{r.applicationEvidence.review.unambiguous=false;},/unambiguous scope review/);
invalid(r=>{r.applicationEvidence.applications[0].transmission='9AT';},/not bound/);
invalid(r=>{r.applicationEvidence.applications[0].transmission='CVT';},/not bound/);
invalid(r=>{r.engineIdentity.value=r.engineCode;},/duplicate value is forbidden/);
invalid(r=>{r.displacementLiters=24;},/absent from cited excerpt/);
invalid(r=>{r.market=['EU'];},/trusted scoped/);
invalid(r=>{r.productionYears={from:2018,to:2018};},/trusted scoped/);
invalid(r=>{r.fieldEvidence.allowedSaeViscosities.evidenceRefs=[];},/lacks trusted/);
invalid(r=>{r.allowedSaeViscosities=['5W-30'];},/absent from cited excerpt/);
invalid(r=>{r.fieldEvidence.allowedSaeViscosities.evidenceRefs[0].sourceId='missing';},/Invalid source ID/);
invalid(r=>{r.fieldEvidence.industrySpecifications.evidenceRefs[0].locatorId='missing';},/Invalid source ID/);
invalid(r=>{r.sources[0].locators[0].pageNumbers=[999];},/Locator pages/);
invalid(r=>{r.sources[1].id=r.sources[0].id;},/unique source IDs/);
invalid(r=>{r.sources[2].identityBindingRef='archival-working-copy';},/Invalid supplemental identity binding/);
invalid(r=>{r.sources[2].scope.engineClasses=['hybrid'];},/exact bound engine class/);
invalid(r=>{r.sources[2].url='https://example.com/copied-honda-faq';},/trusted scoped/);
invalid(r=>{r.sources[2].documentSha256='not-a-hash';},/trusted scoped/);
invalid(r=>{r.oilRequirements.expression.anyOf=r.oilRequirements.expression.allOf;delete r.oilRequirements.expression.allOf;},/operator is not supported/);
invalid(r=>{r.completeness={state:'complete'};},/completeness is computed/);
console.log('PASS unknown/conflicting application or requirements block publication; scoped sources, literal values, typed locators and computed completeness enforced');
const globalIssue=copy();globalIssue.researchIssues=['Unresolved application review'];assert.equal(isPublicOilRecord(globalIssue),false);
const invalidStatus=copy();invalidStatus.status='trusted';assert.equal(isPublicOilRecord(invalidStatus),false);

const conflict=copy();const archive=conflict.sources[1];archive.locators=[
 {id:'candidate-a',pageNumbers:[3],fields:['serviceFillCapacity'],excerpt:'Candidate oil fill 4.4 US qt with filter.'},
 {id:'candidate-b',pageNumbers:[3],fields:['serviceFillCapacity'],excerpt:'Conflicting candidate oil fill 5.0 US qt with filter.'}
];
conflict.fieldEvidence.serviceFillCapacity={state:'conflict',evidenceRefs:[ref(archive.id,'candidate-a'),ref(archive.id,'candidate-b')]};
assert.equal(assessOilEvidence(conflict).eligible,true);
const conflictData=structuredClone(data);conflictData.records[conflictData.records.findIndex(r=>r.id===conflict.id)]=conflict;
const safe=toPublicOilData(conflictData).records.find(r=>r.id===conflict.id);
assert.equal(safe.serviceFillCapacity,null);assert.equal(safe.capacityUnit,null);
assert.equal(safe.fieldEvidence.serviceFillCapacity.state,'conflict');
assert.deepEqual(safe.fieldEvidence.serviceFillCapacity.evidenceRefs,[]);
assert.ok(!JSON.stringify(safe).includes('5.0 US qt'));
assert.ok(!JSON.stringify(safe).includes('4.4 US qt'));
assert.ok(!JSON.stringify(safe).includes('candidate-a'));
assert.doesNotMatch(ui.renderOilCard(safe,'en'),/4\.4|5\.0|Verified/);
console.log('PASS optional conflicting capacity remains withheld, including candidate numbers and unconfirmed source locators');

// Synthetic in-memory source text exercises grammar; it is never added to production data.
const choice=copy(),faq=choice.sources[2];
choice.allowedSaeViscosities.push('5W-30');faq.locators[0].excerpt+=' Synthetic alternative SAE 5W-30.';
faq.locators.push({id:'alternative-rule',section:'Synthetic alternatives',fields:['oilRequirements'],relation:'anyOf',excerpt:'Use the first oil path or the second oil path.'},
 {id:'cold-condition',section:'Synthetic condition',fields:['oilRequirements'],excerpt:'Below zero Celsius use the second path.',condition:{en:'Below 0 °C',es:'Por debajo de 0 °C',fr:'Sous 0 °C',de:'Unter 0 °C'}});
const first=structuredClone(choice.oilRequirements.expression),second=structuredClone(first);second.allOf[0].index=1;second.conditionRef=ref(faq.id,'cold-condition');
choice.oilRequirements.expression={anyOf:[first,second],evidenceRefs:[ref(faq.id,'alternative-rule')]};
assert.equal(assessOilEvidence(choice).eligible,true);
const choiceData=structuredClone(data);choiceData.records[choiceData.records.findIndex(r=>r.id===choice.id)]=choice;
const choicePublic=toPublicOilData(choiceData).records.find(r=>r.id===choice.id);
assert.ok(choicePublic.oilRequirements.expression.anyOf);
assert.ok(choicePublic.oilRequirements.expression.anyOf.every(n=>n.allOf));
for(const [lang,word] of Object.entries({en:'or',es:'o',fr:'ou',de:'oder'})){
 const rendered=ui.renderRequirements(choicePublic,lang);
 assert.match(rendered,/data-operator="anyOf"/);assert.match(rendered,/data-operator="allOf"/);assert.ok(rendered.includes(`>${word}</strong>`));
 assert.ok(rendered.includes(ui.evidenceText[lang].when));
 assert.ok(rendered.includes(faq.locators.at(-1).condition[lang]));
}
console.log('PASS nested conditional allOf/anyOf remains structured and localized, without flattening alternative requirements');

const vin=copy();vin.engineIdentity={type:'vinEngineSymbol',value:'Z'};
assert.throws(()=>assessOilEvidence(vin),/must not masquerade/);
delete vin.engineCode;
assert.throws(()=>assessOilEvidence(vin),/Locator does not cover|trusted scoped/);
vin.engineIdentity.type='engineeringCode';delete vin.engineIdentity.value;vin.engineCode='Z';
assert.throws(()=>assessOilEvidence(vin),/literal evidence/);
const displayed=structuredClone(publicData.records.at(-1));delete displayed.engineCode;displayed.engineIdentity={type:'vinEngineSymbol',value:'Z'};
assert.ok(ui.engineLabel(displayed).includes('VIN engine symbol'));
const vinHtml=ui.renderOilCard(displayed,'en');assert.ok(vinHtml.includes('VIN engine symbol: Z'));assert.doesNotMatch(vinHtml,/Engineering code: Z/);
console.log('PASS VIN symbols cannot substitute for engineering codes or borrow engineering-code evidence');

const complete=copy(),completeSource=complete.sources[2];
Object.assign(complete,{requiredManufacturerApprovals:[],preferredManufacturerApprovals:[],serviceFillCapacity:4.2,capacityUnit:'L',capacityNote:{en:'With filter',es:'Con filtro',fr:'Avec filtre',de:'Mit Filter'},serviceInterval:{distanceKm:10000,months:12,note:{en:'Normal',es:'Normal',fr:'Normal',de:'Normal'}},climateLimitations:[],emissionsEquipment:{dpf:'absent',gpf:'absent',catalyst:'present'}});
for(const field of technicalFields.filter(f=>complete.fieldEvidence[f].state!=='confirmed')){
 const id='synthetic-'+field;completeSource.fields.push(field);completeSource.locators.push({id,section:'Synthetic completeness fixture',fields:[field],excerpt:'Service fill with filter: '+JSON.stringify(complete[field])+'; no separate limits or approvals.'});
 complete.fieldEvidence[field]={state:'confirmed',evidenceRefs:[ref(completeSource.id,id)]};
}
const full=assessOilEvidence(complete);assert.equal(full.completeness.state,'complete');assert.equal(full.completeness.confirmedFields,technicalFields.length);
const ambiguousFill=structuredClone(complete);ambiguousFill.sources[2].locators.find(l=>l.id==='synthetic-serviceFillCapacity').excerpt='Engine oil capacity 4.2 L';assert.throws(()=>assessOilEvidence(ambiguousFill),/explicit service-fill-with-filter/);
complete.fieldEvidence.serviceInterval={state:'unknown',evidenceRefs:[]};assert.equal(assessOilEvidence(complete).completeness.state,'partial');
for(const lang of ['en','es','fr','de']){
 assert.deepEqual(Object.keys(ui.evidenceText[lang]).sort(),Object.keys(ui.evidenceText.en).sort());
 const html=ui.renderOilCard(publicData.records.at(-1),lang);
 assert.ok(html.includes(ui.evidenceText[lang].unknown));assert.ok(html.includes(ui.evidenceText[lang].documentedPath));assert.ok(html.includes(ui.evidenceText[lang].completeness));assert.match(html,/field-sources/);assert.match(html,/#page=6/);assert.doesNotMatch(html,/>Verified</);
 const state=ui.resolveUrlState(publicData,`https://d3orient.com/oil-guide.html?engine=${fixture.partialIds[0]}&lang=${lang}`);
 assert.equal(state.record.id,fixture.partialIds[0]);assert.equal(state.lang,lang);
 const reset=ui.resetUrl(ui.selectionUrl('https://d3orient.com/oil-guide.html',state,lang).href,lang);assert.equal(reset.searchParams.get('engine'),null);assert.equal(reset.searchParams.get('lang'),lang);
}
for(const r of data.researchRecords)assert.equal(ui.resolveUrlState(publicData,`https://d3orient.com/oil-guide.html?engine=${r.id}`).record,null);
console.log('PASS computed complete/partial, field sources, EN/ES/FR/DE, partial-card URL state and research URL exclusion');

// Exercise the real browser controller without a network or a DOM package.
class Element {
  constructor(id) { this.id=id; this.options=[{value:''}]; this.value=''; this.listeners={}; this.dataset={}; this.classList={toggle(){}}; }
  appendChild(option) { this.options.push(option); }
  remove(index) { this.options.splice(index,1); }
  addEventListener(name, handler) { this.listeners[name]=handler; }
  setAttribute(name,value) { this[name]=value; }
  click() { return this.listeners.click?.(); }
}
const ids=['makeSelect','modelSelect','variantSelect','engineSelect','oilQuickSearch','oilSearchSuggestions','findButton','resetButton','copyLinkButton','requestLink','finderSummary','resultPanel','resultContent'];
const elements=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
const buttons=['en','es','fr','de'].map(language=>{const e=new Element(language);e.dataset.lang=language;return e;});
const doc={documentElement:{},getElementById:id=>elements[id],createElement:()=>new Element('option'),querySelector:()=>new Element('meta'),querySelectorAll:selector=>selector==='[data-lang]'?buttons:[]};
let copied='';const events={};
const win={AUTOHUB_OIL_DATA:publicData,AUTOHUB_OIL_TRANSLATIONS:{en:{}},location:{href:`https://d3orient.com/oil-guide.html?engine=${fixture.partialIds[0]}&lang=en`},navigator:{clipboard:{async writeText(value){copied=value;}}},addEventListener:(name,handler)=>{events[name]=handler;}};
win.history={pushState(_state,_title,url){win.location.href=new URL(url,win.location.href).href;},replaceState(_state,_title,url){win.location.href=new URL(url,win.location.href).href;}};
ui.initBrowser(win,doc);
assert.equal(elements.engineSelect.value,fixture.partialIds[0]);
assert.ok(elements.resultContent.innerHTML.includes('API Certification Seal'));
assert.ok(elements.resultContent.innerHTML.includes(ui.evidenceText.en.unknown));
assert.doesNotMatch(elements.resultContent.innerHTML,/4\.4 US qt/);
buttons.find(b=>b.dataset.lang==='de').click();
assert.equal(doc.documentElement.lang,'de');
assert.ok(elements.resultContent.innerHTML.includes(ui.evidenceText.de.documentedPath));
await elements.copyLinkButton.click();assert.equal(copied,win.location.href);
const beforeReset=win.location.href;
elements.resetButton.click();assert.equal(elements.resultPanel.hidden,true);assert.equal(new URL(win.location.href).searchParams.get('engine'),null);
win.location.href=beforeReset;events.popstate();assert.equal(elements.resultPanel.hidden,false);assert.equal(elements.engineSelect.value,fixture.partialIds[0]);
win.location.href=`https://d3orient.com/oil-guide.html?engine=${data.researchRecords[0].id}&lang=de`;events.popstate();assert.equal(elements.resultPanel.hidden,true);
win.location.href=beforeReset;events.popstate();
elements.oilQuickSearch.value=fixture.partialIds[1];elements.oilQuickSearch.listeners.keydown({key:'Enter'});
assert.equal(elements.engineSelect.value,fixture.partialIds[1]);assert.equal(new URL(win.location.href).searchParams.get('engine'),fixture.partialIds[1]);
assert.ok(elements.resultContent.innerHTML.includes('CR3F8'));assert.doesNotMatch(elements.resultContent.innerHTML,/4\.5 US qt/);
console.log('PASS real controller selector, language switch, Copy link, Reset, Back/Forward, research URL blocking and Enter quick search');
