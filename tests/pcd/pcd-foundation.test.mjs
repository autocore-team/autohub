import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { generatedPcdFile, toPublicPcdData } from '../../scripts/pcd/generate-pcd-data.mjs';
import { loadPcdSource, validatePcdData } from '../../scripts/pcd/validate-pcd-data.mjs';

const require = createRequire(import.meta.url);
const search = require('../../assets/js/pcd-search.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const supportedLanguages = ['en', 'es', 'fr', 'de'];
const legacyPublicHash = '6ba242ce8ca7c1bc6e08d6c4956228ba3d84566a1147619d4145e10859316d7a';

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function expectFailure(callback, pattern, label) {
  try {
    callback();
  } catch (error) {
    check(pattern.test(error.message), `${label} failed for an unexpected reason: ${error.message}`);
    return;
  }
  throw new Error(`${label} unexpectedly passed`);
}

function publicDataFromFile() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${read('pcd-data.js')};this.PCD_DATA_EXPORT=PCD_DATA`, context);
  return context.PCD_DATA_EXPORT;
}

function flattenResults(results) {
  return results.flatMap((brandResult) => brandResult.models.flatMap((modelResult) => {
    return modelResult.records.map((record) => ({
      maker: brandResult.brand.name,
      model: modelResult.model.name,
      record
    }));
  }));
}

function tableRows(relativePath) {
  const tbody = read(relativePath).match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1];
  check(tbody, `${relativePath} has no table body`);
  return [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((row) => {
    return [...row[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1]
      .replace(/<[^>]+>/g, '')
      .replaceAll('&amp;', '&')
      .trim());
  });
}

function yearsLabel(record, override) {
  if (!override && record.legacyYears) return record.legacyYears;
  return (override?.years || record.years).map(({ from, to }) => `${from}-${to}`).join(' / ');
}

function marketLabel(record, override) {
  if (!override && record.legacyMarket) return record.legacyMarket;
  const labels = { EU: 'EU', US: 'US', JP: 'Japan', GLOBAL: 'Global', OTHER: 'some markets' };
  return (override?.market || record.market).map((market) => labels[market]).join(' / ');
}

function pcdLabel(record) {
  return `${record.boltPattern.holes}x${record.boltPattern.diameterMm}`;
}

function offsetLabel(record) {
  if (record.offset.legacyValue) return record.offset.legacyValue;
  return record.offset.minEt === record.offset.maxEt
    ? `ET${record.offset.minEt}`
    : `ET${record.offset.minEt}-${record.offset.maxEt}`;
}

const source = loadPcdSource();
const summary = validatePcdData(source);
check(summary.records === 274, `Expected 274 PCD records, found ${summary.records}`);
check(summary.makers === 33, `Expected 33 PCD makers, found ${summary.makers}`);
check(summary.models === 183, `Expected 183 PCD models, found ${summary.models}`);
check(summary.statuses.legacyPending === 274 && Object.keys(summary.statuses).length === 1, 'Migrated records must all remain legacyPending');
check(source.records.every((record) => record.sources.length === 0 && record.lastVerifiedAt === null), 'Legacy migration invented sources or verification dates');
console.log('PASS PCD schema and 274-record legacyPending migration');

for (const status of ['verified', 'corroborated']) {
  const invalid = structuredClone(source);
  invalid.records[0].verificationStatus = status;
  expectFailure(() => validatePcdData(invalid), /requires sources/, `${status} without sources`);
}
const duplicate = structuredClone(source);
duplicate.records[1].id = duplicate.records[0].id;
expectFailure(() => validatePcdData(duplicate), /Duplicate PCD id/, 'duplicate PCD id');
console.log('PASS PCD verification policy and ID/slug uniqueness checks');

const generated = generatedPcdFile(source);
check(read('pcd-data.js') === generated, 'pcd-data.js differs from the source generator output');
check(generated.startsWith('// This file is generated'), 'pcd-data.js has no generated-file warning');
const publicData = publicDataFromFile();
check(JSON.stringify(publicData) === JSON.stringify(toPublicPcdData(source)), 'Generated public PCD contract differs from vehicles.json');
const publicHash = crypto.createHash('sha256').update(JSON.stringify(publicData)).digest('hex');
check(publicHash === legacyPublicHash, `Legacy public PCD contract changed: ${publicHash}`);
console.log(`PASS generated PCD contract preserves the legacy semantic hash ${publicHash}`);

const requiredQueries = new Map([
  ['Audi A4', 3],
  ['BMW E46', 1],
  ['Volvo S70', 1],
  ['Opel Astra', 4],
  ['Golf 5', 1],
  ['5x112', 56],
  ['5×112', 56],
  ['M14x1.5', 91]
]);
for (const [query, expectedRecords] of requiredQueries) {
  const databaseResults = search.searchDatabase(publicData, query);
  const results = flattenResults(databaseResults);
  check(results.length === expectedRecords, `${query} returned ${results.length} records instead of ${expectedRecords}`);
  if (['Audi A4', 'BMW E46', 'Volvo S70', 'Opel Astra', 'Golf 5'].includes(query)) {
    const inferred = search.uniqueSelection(databaseResults);
    check(inferred.selectedBrand && inferred.selectedModel, `${query} did not resolve to visible record details`);
  }
  console.log(`PASS PCD search "${query}": ${results.length} record${results.length === 1 ? '' : 's'}`);
}
check(search.normalizeSearchText('5×112') === '5x112', 'Multiplication-sign normalization failed');
check(flattenResults(search.searchDatabase(publicData, '5-112')).length === 56, 'PCD hyphen normalization failed');
check(flattenResults(search.searchDatabase(publicData, 'M14-1.5')).length === 91, 'Thread hyphen normalization failed');
check(flattenResults(search.searchDatabase(publicData, 'gOlF-5')).length === 1, 'Case/hyphen normalization failed');
check(flattenResults(search.searchDatabase(publicData, 'VW Golf')).length === 3, 'Volkswagen alias search failed');
check(flattenResults(search.searchDatabase(publicData, 'Golf V')).length === 1, 'Golf generation alias search failed');

const urlState = search.resolveUrlState(
  publicData,
  '?search=BMW%20E46&make=bmw&model=3-series&lang=de',
  supportedLanguages
);
check(urlState.query === 'BMW E46', 'search URL parameter was not restored');
check(urlState.language === 'de', 'lang URL parameter was not restored');
check(urlState.selectedBrand?.slug === 'bmw', 'make URL parameter was not restored');
check(urlState.selectedModel?.slug === '3-series', 'model URL parameter was not restored');
console.log('PASS PCD search URL state for search, make, model and lang');

const pcdHtml = read('pcd.html');
const translationMatch = pcdHtml.match(/const translations = (\{[\s\S]*?\r?\n    \});\r?\n\r?\n    const data/);
check(translationMatch, 'PCD translations could not be parsed');
const translations = vm.runInNewContext(`(${translationMatch[1]})`);
check(JSON.stringify(Object.keys(translations)) === JSON.stringify(supportedLanguages), 'PCD languages must be EN/ES/FR/DE in order');
const translationKeys = Object.keys(translations.en).sort();
for (const language of supportedLanguages) {
  check(JSON.stringify(Object.keys(translations[language]).sort()) === JSON.stringify(translationKeys), `PCD ${language} translation keys differ from EN`);
}
for (const match of pcdHtml.matchAll(/data-i18n="([^"]+)"/g)) {
  check(Object.hasOwn(translations.en, match[1]), `PCD translation key ${match[1]} is missing`);
}
check(/<label\s+for="search"[^>]*data-i18n="searchLabel"/.test(pcdHtml), 'PCD search has no permanent translated label');
check(/<meta\s+name="description"\s+content="[^"]+">/.test(pcdHtml), 'PCD meta description is missing');
for (const filter of ['5x108', '5x110']) check(pcdHtml.includes(`'${filter}'`), `Quick filter ${filter} is missing`);
check(pcdHtml.includes('aria-pressed='), 'Quick PCD filters do not expose aria-pressed');
console.log(`PASS PCD EN/ES/FR/DE translation parity (${translationKeys.length} keys) and safe UI additions`);

const vehiclePages = [
  ['pcd/bmw/e46.html', 'BMW', '3 Series', ['bmw-3-series-e46-1998-2006-5x120']],
  ['pcd/opel/astra.html', 'Opel / Vauxhall', 'Astra', null],
  ['pcd/volvo/s70.html', 'Volvo', 'S70', null],
  ['pcd/vw/golf-5.html', 'Volkswagen', 'Golf', ['volkswagen-golf-mk5-mk6-mk7-mk8-2003-2026-5x112']]
];
for (const [relativePath, maker, model, recordIds] of vehiclePages) {
  const expected = source.records
    .filter((record) => record.maker === maker && record.model === model && (!recordIds || recordIds.includes(record.id)))
    .flatMap((record) => {
      const variants = record.legacyPageVariants?.filter((variant) => variant.path === relativePath);
      const rows = variants?.length ? variants : [null];
      return rows.map((variant) => [
        variant?.generation || record.generation,
        yearsLabel(record, variant),
        marketLabel(record, variant),
        pcdLabel(record),
        `${record.centerBore} mm`,
        record.threadSize,
        record.fastenerType === 'bolt' ? 'bolts' : 'nuts',
        offsetLabel(record)
      ]);
    });
  check(JSON.stringify(tableRows(relativePath)) === JSON.stringify(expected), `${relativePath} table differs from vehicles.json`);
}

for (const pattern of ['5x108', '5x110']) {
  const expected = source.records
    .filter((record) => pcdLabel(record) === pattern)
    .map((record) => [
      record.maker,
      record.model,
      record.generation,
      yearsLabel(record),
      `${record.centerBore} mm`,
      record.threadSize,
      offsetLabel(record)
    ]);
  check(JSON.stringify(tableRows(`pcd/bolt-pattern/${pattern}.html`)) === JSON.stringify(expected), `${pattern} table differs from vehicles.json`);
}
console.log('PASS all existing vehicle and bolt-pattern tables correspond to vehicles.json');

const pcdPages = [
  'pcd.html',
  'pcd/bmw/e46.html',
  'pcd/opel/astra.html',
  'pcd/volvo/s70.html',
  'pcd/vw/golf-5.html',
  'pcd/bolt-pattern/5x108.html',
  'pcd/bolt-pattern/5x110.html'
];
const sitemap = read('sitemap.xml');
for (const relativePath of pcdPages) {
  const publicUrl = `https://d3orient.com/${relativePath}`;
  check(read(relativePath).includes(`<link rel="canonical" href="${publicUrl}">`), `${relativePath} canonical changed`);
  check(sitemap.includes(`<loc>${publicUrl}</loc>`), `${relativePath} is missing from sitemap`);
}
console.log('PASS existing PCD canonical URLs and sitemap entries are preserved');
