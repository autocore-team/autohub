import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { REGIONS, canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDirectory, '../..');
const html = fs.readFileSync(path.join(root, 'engines.html'), 'utf8');
const coreText = fs.readFileSync(path.join(root, 'assets/js/engine-search-core.js'), 'utf8');
const context = { window: {}, URL };
vm.runInNewContext(coreText, context, { filename: 'engine-search-core.js' });
const core = context.window.D3_ENGINE_SEARCH_CORE;
const records = readSourceData().records;
const languages = ['en', 'es', 'fr', 'de'];

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

const semanticHash = crypto.createHash('sha256').update(canonicalFingerprint(records)).digest('hex');
check(records.length === 500, `Engine count changed: expected 500, found ${records.length}`);
check(
  semanticHash === 'af4d8e9889ebff098d33241d9c4d9a77ec4bc8788b17c6e495692274400ab60e',
  `Engine semantic hash changed: ${semanticHash}`
);
pass(`engine data count and semantic hash are unchanged (${records.length}, ${semanticHash})`);

const summaries = core.regionSummaries(records, REGIONS);
check(
  JSON.stringify(summaries) === JSON.stringify([
    { region: 'europe', engineCount: 196, manufacturerCount: 11 },
    { region: 'japan', engineCount: 167, manufacturerCount: 15 },
    { region: 'korea', engineCount: 49, manufacturerCount: 2 },
    { region: 'usa', engineCount: 88, manufacturerCount: 13 }
  ]),
  'Region engine/manufacturer summaries changed'
);
check(summaries.every((summary) => Number.isInteger(summary.engineCount) && summary.engineCount > 0), 'A region engineCount is not a positive integer');
check(summaries.reduce((total, summary) => total + summary.engineCount, 0) === 500, 'Regional engineCount sum does not equal 500');
for (const summary of summaries) {
  const renderedSummary = core.formatRegionSummary(summary, { manufacturers: 'manufacturers', engines: 'engines' });
  check(renderedSummary.includes(String(summary.manufacturerCount)), `${summary.region} summary is missing its manufacturer count`);
  check(renderedSummary.includes(String(summary.engineCount)), `${summary.region} summary is missing its engine count`);
  check(!/·\s*engines\b/.test(renderedSummary), `${summary.region} summary renders “· engines” without a count`);
}
pass('existing region classification and counts are preserved');

const initialNavigation = core.navigationModel(records, REGIONS, { region: '', maker: '' });
check(initialNavigation.every((region) => !region.expanded), 'A region is expanded by default');
check(initialNavigation.every((region) => region.makers.length === 0), 'Manufacturer names are created before a region opens');
check(initialNavigation.every((region) => region.selectedEngines.length === 0), 'Engine lists are created before a manufacturer is selected');
pass('initial navigation keeps all regions closed and manufacturers hidden');

const europeNavigation = core.navigationModel(records, REGIONS, { region: 'europe', maker: '' });
const openEurope = europeNavigation.find((region) => region.region === 'europe');
check(openEurope.expanded && openEurope.makers.length === 11, 'Europe did not expose its 11 manufacturers');
check(europeNavigation.filter((region) => region.region !== 'europe').every((region) => region.makers.length === 0), 'A closed region exposed manufacturers');
for (const region of REGIONS) {
  const expected = new Set(records.filter((record) => record.regionKey === region).map((record) => core.makerSlug(record.maker)));
  const actual = new Set(core.makersForRegion(records, region).map((maker) => maker.slug));
  check(JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort()), `${region} contains a manufacturer from another region`);
}
pass('opening a region exposes only that region’s manufacturers');

const bmwSlug = core.makerSlug('BMW');
const bmwNavigation = core.navigationModel(records, REGIONS, { region: 'europe', maker: bmwSlug });
const bmwEngines = bmwNavigation.find((region) => region.region === 'europe').selectedEngines;
check(bmwEngines.length > 0, 'BMW selection produced no engines');
check(bmwEngines.every((record) => record.regionKey === 'europe' && core.makerSlug(record.maker) === bmwSlug), 'BMW selection exposed another manufacturer or region');
pass('manufacturer selection exposes only that manufacturer’s engines');

const exactCodeResults = core.searchRecords(records, 'M54');
check(exactCodeResults[0]?.code === 'M54', 'Exact engine code is not the top result');
check(core.searchRank(exactCodeResults[0], 'M54') === 0, 'Exact engine code did not receive rank zero');
for (const code of ['B5202S', 'EA888', 'K20', 'G4KD', 'LM7']) {
  const results = core.searchRecords(records, code);
  check(results[0]?.code === code && core.searchRank(results[0], code) === 0, `${code} is not the top exact-code result`);
  check(new Set(results.map((record) => record.id)).size === results.length, `${code} search contains a duplicate record`);
}
check(core.searchRecords(records, 'BMW').some((record) => record.maker === 'BMW'), 'Manufacturer search failed');
check(core.searchRecords(records, 'E46').some((record) => record.applications.some((application) => application.includes('E46'))), 'Model/application search failed');
check(core.searchRecords(records, 'M54B30')[0]?.id === 'bmw-m54', 'Searchable alias search failed');
const m54 = records.find((record) => record.id === 'bmw-m54');
check(m54?.verification?.status === 'verified', 'M54 verification precondition changed');
check(html.includes('<span class="status-badge">${escapeHtml(verificationLabel(record))}</span>'), 'Engine details do not use the same verification label as search results');
check(!html.includes('<span class="status-badge">${escapeHtml(t(record.statusKey))}</span>'), 'Engine details still render the legacy statusKey as verification status');
check(core.searchRecords(records, '').length === 0, 'Cleared search retained results');
check(core.navigationModel(records, REGIONS, { region: '', maker: '' }).every((region) => !region.expanded), 'Cleared search cannot return to compact navigation');
pass('global search works independently of closed regions and ranks exact code first');

const restored = core.stateFromUrl(
  'https://d3orient.com/engines.html?search=E46&region=europe&maker=bmw&lang=de',
  records,
  REGIONS,
  languages
);
check(restored.query === 'E46' && restored.region === 'europe' && restored.maker === 'bmw' && restored.lang === 'de', 'Search/region/maker/lang URL state was not restored');
const legacyMake = core.stateFromUrl('https://d3orient.com/engines.html?make=BMW', records, REGIONS, languages);
const legacyManufacturer = core.stateFromUrl('https://d3orient.com/engines.html?manufacturer=BMW', records, REGIONS, languages);
check(legacyMake.region === 'europe' && legacyMake.maker === 'bmw', 'Legacy make URL failed');
check(legacyManufacturer.region === 'europe' && legacyManufacturer.maker === 'bmw', 'Legacy manufacturer URL failed');
const engineByCode = core.stateFromUrl('https://d3orient.com/engines.html?engine=B5202S', records, REGIONS, languages);
check(engineByCode.engine === 'volvo-b5202s' && engineByCode.region === 'europe' && engineByCode.maker === 'volvo', 'Engine-code URL failed');
const normalized = core.applyStateToUrl('https://d3orient.com/engines.html?manufacturer=BMW', { ...legacyManufacturer, query: '', engine: '' });
check(normalized.searchParams.get('maker') === 'bmw' && !normalized.searchParams.has('manufacturer'), 'Legacy manufacturer URL was not normalized');
const historySequence = [
  'https://d3orient.com/engines.html?region=europe',
  'https://d3orient.com/engines.html?region=europe&maker=bmw',
  'https://d3orient.com/engines.html?region=europe'
].map((url) => core.stateFromUrl(url, records, REGIONS, languages));
check(historySequence[0].maker === '' && historySequence[1].maker === 'bmw' && historySequence[2].maker === '', 'Back/Forward state restoration failed');
pass('current and legacy URL states restore and normalize correctly');

const translationsMatch = html.match(/const translations = ([\s\S]*?);\s*\n\s*const engineSearchCore/);
check(translationsMatch, 'Engine page translations literal not found');
const pageScriptMatch = html.match(/<script>\s*(const translations = [\s\S]*?)<\/script>/);
check(pageScriptMatch, 'Engine page script not found');
new vm.Script(pageScriptMatch[1], { filename: 'engines.html:inline-script' });
const translations = vm.runInNewContext(`(${translationsMatch[1]})`);
const englishKeys = Object.keys(translations.en).sort();
const requiredKeys = [
  'browseByRegion', 'manufacturersLabel', 'engineCountLabel', 'showRegion', 'hideRegion',
  'chooseManufacturer', 'backToManufacturers', 'searchResults', 'clearSearch',
  'noMatchingEngines', 'searchHelp', 'searchLabel'
];
for (const language of languages) {
  check(JSON.stringify(Object.keys(translations[language]).sort()) === JSON.stringify(englishKeys), `${language} translation keys differ from EN`);
  for (const key of requiredKeys) check(Boolean(translations[language][key]), `${language}.${key} is missing`);
  check(Object.values(translations[language]).every((value) => String(value).trim()), `${language} contains an empty translation`);
  const dataKeys = new Set(records.flatMap((record) => [
    record.regionKey, record.fuelKey, record.aspirationKey, record.injectionKey,
    record.blockKey, record.timingKey, record.declaredLifeKey
  ].filter(Boolean)));
  for (const key of dataKeys) check(Boolean(translations[language][key]), `${language}.${key} is an unhandled engine-data translation key`);
}
pass(`engine page script syntax and EN/ES/FR/DE translation parity (${englishKeys.length} keys)`);

check(/<label[^>]*for="engineCodeSearch"[^>]*data-i18n="searchLabel"/.test(html), 'Search is missing its permanent label');
check(html.includes('aria-expanded="${item.expanded}"'), 'Region controls do not render aria-expanded');
check(html.includes('aria-controls="${panelId}"'), 'Region controls do not render aria-controls');
check(html.includes('aria-pressed="${maker.slug === activeMaker}"'), 'Manufacturer controls do not render aria-pressed');
check(html.includes("item.expanded ? '' : ' hidden'"), 'Closed region panels are not hidden from keyboard navigation');
check(html.includes("window.addEventListener('popstate'"), 'Popstate restoration handler is missing');
check(html.includes("updateUrl('push')"), 'Navigation does not create restorable history entries');
check(html.includes('focusRegionControl(nextRegion);'), 'Region interaction does not restore keyboard focus');
check(html.includes('focusMakerControl(activeMaker);'), 'Manufacturer selection does not restore keyboard focus');
check(html.includes('focusMakerControl(previousMaker);'), 'Back to manufacturers does not restore keyboard focus');
check(html.includes('engineCodeSearch.focus();'), 'Clear search does not return focus to the search field');
check(!/<div class="maker-tabs"/.test(html), 'Old always-visible manufacturer list remains in the page');
pass('accessible accordion, manufacturer selection and history hooks are present');

console.log('Engine search regional navigation tests passed.');
