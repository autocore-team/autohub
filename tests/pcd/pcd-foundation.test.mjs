import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  generatedPcdFile,
  generatedPcdFileMatches,
  toPublicPcdData
} from '../../scripts/pcd/generate-pcd-data.mjs';
import { loadPcdSource, validatePcdData } from '../../scripts/pcd/validate-pcd-data.mjs';

const require = createRequire(import.meta.url);
const search = require('../../assets/js/pcd-search.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const supportedLanguages = ['en', 'es', 'fr', 'de'];

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
  if (record.offset.fitmentSpecific) return 'fitment-specific';
  if (record.offset.legacyValue) return record.offset.legacyValue;
  return record.offset.minEt === record.offset.maxEt
    ? `ET${record.offset.minEt}`
    : `ET${record.offset.minEt}-${record.offset.maxEt}`;
}

const source = loadPcdSource();
const summary = validatePcdData(source);
check(summary.records === 296, `Expected 296 PCD records, found ${summary.records}`);
check(summary.makers === 33, `Expected 33 PCD makers, found ${summary.makers}`);
check(summary.models === 183, `Expected 183 PCD models, found ${summary.models}`);
check(summary.statuses.legacyPending === 281 && summary.statuses.verified === 15, 'Expected 281 legacyPending and 15 verified records');
check(source.records.filter((record) => record.verificationStatus === 'legacyPending').every((record) => record.sources.length === 0 && record.lastVerifiedAt === null), 'Legacy records gained invented sources or verification dates');
check(source.records.filter((record) => record.verificationStatus === 'verified').every((record) => record.sources.length > 0 && ['2026-09-21', '2026-09-24'].includes(record.lastVerifiedAt)), 'Verified batch date/source policy failed');
console.log('PASS PCD schema and verified batch counts');

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
check(generatedPcdFileMatches(read('pcd-data.js'), generated), 'pcd-data.js differs from the source generator output');
check(
  generatedPcdFileMatches(generated.replaceAll('\n', '\r\n'), generated),
  'Generated PCD checks must treat CRLF and LF as equivalent'
);
check(generated.startsWith('// This file is generated'), 'pcd-data.js has no generated-file warning');
const publicData = publicDataFromFile();
check(JSON.stringify(publicData) === JSON.stringify(toPublicPcdData(source)), 'Generated public PCD contract differs from vehicles.json');
check(generatedPcdFile(source) === generated, 'PCD generation is not idempotent');
console.log('PASS generated PCD contract and idempotent generation');

const requiredQueries = new Map([
  ['Audi A4', 3],
  ['BMW E46', 3],
  ['Volvo S70', 1],
  ['Opel Astra', 5],
  ['Golf 5', 1],
  ['Golf VI', 4],
  ['Audi A3 8P', 3],
  ['Octavia II', 3],
  ['Octavia vRS', 1],
  ['Octavia Scout', 1],
  ['Seat Leon II', 4],
  ['Touran I', 2],
  ['CrossTouran', 1],
  ['1Z', 5],
  ['1P', 6],
  ['1T', 3],
  ['Octavia 1Z 5E NX', 5],
  ['Leon 1P 5F KL', 6],
  ['Touran 1T 5T', 3],
  ['5x112', 75],
  ['5×112', 75],
  ['M14x1.5', 110]
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
check(flattenResults(search.searchDatabase(publicData, '5-112')).length === 75, 'PCD hyphen normalization failed');
check(flattenResults(search.searchDatabase(publicData, 'M14-1.5')).length === 110, 'Thread hyphen normalization failed');
check(flattenResults(search.searchDatabase(publicData, 'gOlF-5')).length === 1, 'Case/hyphen normalization failed');
check(flattenResults(search.searchDatabase(publicData, 'VW Golf')).length === 9, 'Volkswagen alias search failed');
check(flattenResults(search.searchDatabase(publicData, 'Golf V')).length === 1, 'Golf generation alias search failed');

const noticeCases = [
  ['Volvo S70', 'verified-only'],
  ['Audi A4', 'legacy-only'],
  ['VW Golf', 'mixed']
];
for (const [query, expectedState] of noticeCases) {
  const records = flattenResults(search.searchDatabase(publicData, query)).map((result) => result.record);
  check(search.verificationNoticeState(records) === expectedState, `${query} notice state is not ${expectedState}`);
}
check(search.verificationNoticeState([{ status: 'corroborated' }]) === 'verified-only', 'Corroborated records must use the reviewed-scope notice');
console.log('PASS verified-only, legacy-only and mixed verification notices');

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
check(pcdHtml.includes('data-verification-notice="${noticeState}"'), 'PCD verification notice is not state-specific');
console.log(`PASS PCD EN/ES/FR/DE translation parity (${translationKeys.length} keys) and safe UI additions`);

const verified = source.records.filter((record) => record.verificationStatus === 'verified');
for (const record of verified) {
  const sourceIds = new Set(record.sources.map((item) => item.id));
  check(record.sources.every((item) => item.fields.length && item.pages && item.limitations), `${record.id} has incomplete source metadata`);
  check((record.fitments || []).every((item) => item.sourceRefs.every((id) => sourceIds.has(id))), `${record.id} has an unresolved fitment source`);
}

const volvo = source.records.find((record) => record.id === 'volvo-s70-p80-1997-2000-5x108');
check(volvo.generation === 'S70 / Type L' && volvo.aliases.includes('P80'), 'Volvo identity scope failed');
check(volvo.fastenerType === 'bolt' && volvo.torque.valueNm === 110, 'Volvo hardware failed');
check(volvo.fitments.length === 6 && volvo.fitments.every((item) => item.wheel.offsetEt === 43), 'Volvo exact ET43 combinations failed');
check(JSON.stringify(volvo.fitments.map((item) => `${item.wheel.widthIn}Jx${item.wheel.diameterIn} ET${item.wheel.offsetEt} ${item.tire.size}`)) === JSON.stringify([
  '6.5Jx15 ET43 195/60R15', '6.5Jx15 ET43 205/55R15', '6.5Jx16 ET43 205/50R16',
  '6.5Jx16 ET43 205/55R16', '7Jx17 ET43 205/45R17', '7Jx17 ET43 215/45R17'
]), 'Volvo combination list changed');

const e46 = verified.filter((record) => record.makerSlug === 'bmw' && record.aliases?.some((alias) => alias.includes('E46')));
check(e46.length === 3, `Expected three verified E46 records, found ${e46.length}`);
check(e46.some((record) => record.generation === 'E46 non-M') && e46.some((record) => record.generation === 'E46 M3') && e46.some((record) => record.generation === 'E46 M3 CSL'), 'E46 split is incomplete');
check(!JSON.stringify(e46).includes('ET35-50'), 'BMW verified data retained generic ET35-50');
check(e46.find((record) => record.generation === 'E46 M3 CSL').years[0].from === 2003, 'CSL is not restricted to exact MY2003 scope');

const batch02VerifiedIds = new Set([
  'volkswagen-golf-vi-5k-base-2008-2012-5x112', 'audi-a3-8p-base-2003-2013-5x112',
  'skoda-octavia-1z-2004-2013-5x112', 'skoda-octavia-vrs-1z-2005-2013-5x112',
  'skoda-octavia-scout-1z-2007-2013-5x112', 'seat-leon-1p-2005-2012-5x112',
  'volkswagen-touran-1t-2003-2015-5x112', 'volkswagen-crosstouran-1t-2007-2015-5x112'
]);
const batch02LegacyIds = new Set([
  'volkswagen-golf-gti-mk6-2009-2012-5x112', 'volkswagen-golf-gtd-mk6-2009-2012-5x112', 'volkswagen-golf-r-mk6-2009-2012-5x112',
  'audi-s3-8p-2006-2013-5x112', 'audi-rs3-8pa-2011-2013-5x112', 'seat-leon-fr-1p-2006-2012-5x112',
  'seat-leon-cupra-1p-2006-2012-5x112', 'seat-leon-cupra-r-1p-2010-2012-5x112', 'skoda-octavia-5e-2012-2020-5x112',
  'skoda-octavia-nx-2019-2026-5x112', 'seat-leon-5f-2012-2020-5x112', 'seat-leon-kl-2020-2026-5x112', 'volkswagen-touran-5t-2015-2026-5x112'
]);
const batch02Records = source.records.filter((record) => batch02VerifiedIds.has(record.id) || batch02LegacyIds.has(record.id));
check(batch02Records.length === 21, 'Batch 02 record count changed');
check(source.records.filter((record) => batch02VerifiedIds.has(record.id) && record.verificationStatus === 'verified').length === 8, 'Batch 02 must contain exactly eight verified records');
check(source.records.filter((record) => batch02LegacyIds.has(record.id)).every((record) => record.verificationStatus === 'legacyPending'), 'Performance and later-generation Batch 02 records must remain legacyPending');
for (const record of source.records.filter((item) => batch02VerifiedIds.has(item.id))) {
  check(record.market.length === 1 && record.market[0] === 'EU', `${record.id} market scope is not EU only`);
  check(record.boltPattern.holes === 5 && record.boltPattern.diameterMm === 112 && record.centerBore === 57.1, `${record.id} core PCD/CB failed`);
  check(record.offset.fitmentSpecific && record.threadSize === 'M14x1.5' && record.torque.valueNm === 120, `${record.id} core offset/thread/torque failed`);
  check(record.notes.some((item) => item.text.includes('57.06 mm')), `${record.id} lacks documented 57.06 mm centre-bore note`);
  check(record.fitments.length > 0 && record.fitments.every((item) => item.tire?.size && Number.isFinite(item.wheel.offsetEt)), `${record.id} has an incomplete exact fitment`);
  check(record.fitments.every((item) => item.sourceRefs.length && item.engines?.length && item.bodyStyles?.length && item.drivetrains?.length && item.brakeRestrictions?.length && item.notes?.some((note) => note.includes('M+S restriction'))), `${record.id} fitment restrictions/source coverage failed`);
}
const a3 = source.records.find((record) => record.id === 'audi-a3-8p-base-2003-2013-5x112');
check(a3.fastenerDetails.seat === 'spherical' && a3.fastenerDetails.lengthMm === 27.5 && a3.torque.valueNm === 120, 'Audi 8P BF1 hardware failed');
check(a3.torque.valueNm !== 140 && !a3.fitments.some((item) => item.notes?.some((note) => /^Torque: 140 Nm/.test(note))), 'Audi 8P must not receive BF2 140 Nm');
for (const record of source.records.filter((item) => ['volkswagen', 'skoda', 'seat'].includes(item.makerSlug) && batch02VerifiedIds.has(item.id))) {
  check(record.fastenerDetails.seat === 'spherical' && record.fastenerDetails.lengthMm === 27, `${record.id} VAG spherical 27 mm hardware failed`);
}
const golfBase = source.records.find((record) => record.id === 'volkswagen-golf-vi-5k-base-2008-2012-5x112');
const golfRecords = [source.records.find((record) => record.generation === 'Golf V / Type 1K')];
check(!source.records.filter((record) => /Golf VI (GTI|GTD|R)/.test(record.generation)).some((record) => record.fitments?.length), 'Golf performance fitments must not be published');
check(golfBase.fitments.every((item) => item.trims.every((trim) => trim.includes('excludes GTI/GTD/R'))), 'Golf base fitments leak into performance scope');
check(Object.values(source.migrationMap).flat().every((id) => source.records.some((record) => record.id === id)), 'Migration map has a dangling replacement');

const astraH = source.records.filter((record) => record.makerSlug === 'opel-vauxhall' && record.generation.startsWith('H —'));
check(astraH.length === 2 && astraH.every((record) => record.verificationStatus === 'verified'), 'Astra H 4/5-bolt split failed');
check(astraH.some((record) => pcdLabel(record) === '4x100' && record.centerBore === 56.6), 'Astra H 4-bolt core failed');
check(astraH.some((record) => pcdLabel(record) === '5x110' && record.centerBore === 65.1), 'Astra H 5-bolt core failed');
const astraFitments = astraH.flatMap((record) => record.fitments);
check(!astraFitments.some((item) => item.wheel.offsetEt === 45 || item.wheel.diameterIn === 19 || item.tire?.size === '215/50R17'), 'Astra banned values entered verified fitments');

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
const unrelatedRecords = source.records.filter((record) => !batch02VerifiedIds.has(record.id) && !batch02LegacyIds.has(record.id));
check(unrelatedRecords.length === 275, `Expected 275 unrelated records, found ${unrelatedRecords.length}`);
const unrelatedHash = crypto.createHash('sha256').update(JSON.stringify(canonical(unrelatedRecords))).digest('hex');
check(unrelatedHash === '7741403851985ed036295d7352b15bb2ca1b1bc7184ecda7c8d17d79723472f6', `Unrelated records changed: ${unrelatedHash}`);

const vehiclePages = new Map([
  ['pcd/volvo/s70.html', [volvo]],
  ['pcd/bmw/e46.html', e46],
  ['pcd/vw/golf-5.html', [golfRecords.find((record) => record.verificationStatus === 'verified')]],
  ['pcd/opel/astra.html', astraH]
]);
for (const [relativePath, records] of vehiclePages) {
  const html = read(relativePath);
  check(html.includes('2026-09-21') && html.includes('contact@d3orient.com'), `${relativePath} lacks verification date or correction contact`);
  for (const record of records) {
    for (const item of record.fitments) {
      check(html.includes(`${item.wheel.widthIn}Jx${item.wheel.diameterIn} ET${item.wheel.offsetEt}`), `${relativePath} lacks ${item.id} wheel`);
      if (item.tire) check(html.includes(item.tire.size), `${relativePath} lacks ${item.id} tyre`);
    }
    for (const item of record.sources) check(html.includes(item.url.replaceAll('&', '&amp;')) || html.includes(item.url), `${relativePath} lacks source ${item.id}`);
  }
}
console.log('PASS verified splits, source coverage, banned values and vehicle-page parity');

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
console.log('PASS bolt-pattern tables correspond to vehicles.json');

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
