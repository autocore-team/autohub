import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const search = require('../../assets/js/pcd-search.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const context = {};
vm.createContext(context);
vm.runInContext(`${read('pcd-data.js')};this.data=PCD_DATA`, context);
const data = context.data;
const page = read('pcd.html');

const makes = search.makers(data);
assert.equal(makes.length, 67, 'Make selector must expose every unique make');
assert.equal(new Set(makes.map((make) => make.slug)).size, makes.length, 'Make selector contains duplicate slugs');
assert.deepEqual(makes.map((make) => make.name), makes.map((make) => make.name).slice().sort((a, b) => a.localeCompare(b)), 'Makes are not alphabetical');

const bmwModels = search.modelsForMake(data, 'bmw');
assert.ok(bmwModels.length > 1, 'BMW must populate a dependent model list');
assert.equal(new Set(bmwModels.map((model) => model.slug)).size, bmwModels.length, 'Model selector contains duplicates');
assert.deepEqual(bmwModels.map((model) => model.name), bmwModels.map((model) => model.name).slice().sort((a, b) => a.localeCompare(b)), 'Models are not alphabetical');
assert.deepEqual(search.modelsForMake(data, 'missing-make'), [], 'Unknown make must not expose models');

const bmw = makes.find((make) => make.slug === 'bmw');
const audi = makes.find((make) => make.slug === 'audi');
const e46 = bmwModels.find((model) => model.slug === '3-series');
assert.ok(bmw && audi && e46, 'Selector fixtures are missing');
assert.equal(search.selectMake(data, e46, 'bmw').selectedModel, e46, 'Same make should preserve its selected model');
const changedMake = search.selectMake(data, e46, 'audi');
assert.equal(changedMake.selectedBrand, audi, 'Make change did not select the new make');
assert.equal(changedMake.selectedModel, null, 'Make change did not clear the previous model');

const restored = search.resolveUrlState(data, '?search=5x112&make=bmw&model=3-series&lang=de', ['en', 'es', 'fr', 'de']);
assert.equal(restored.language, 'de');
assert.equal(restored.selectedBrand?.slug, 'bmw');
assert.equal(restored.selectedModel?.slug, '3-series');
const copiedUrl = search.urlForState('/pcd.html', '?campaign=selector', {
  query: '5x112', language: 'fr', selectedBrand: bmw, selectedModel: e46
});
assert.equal(copiedUrl, '/pcd.html?campaign=selector&search=5x112&lang=fr&make=bmw&model=3-series');
const clearedUrl = search.urlForState('/pcd.html', copiedUrl.split('?')[1], {
  query: '', language: 'fr', selectedBrand: null, selectedModel: null
});
assert.equal(clearedUrl, '/pcd.html?campaign=selector&lang=fr', 'Reset must clear search/make/model and preserve language');

assert.match(page, /id="makeSelect"[^>]+list="makeOptions"[^>]+role="combobox"/);
assert.match(page, /id="modelSelect" disabled/);
assert.match(page, /id="resetSelector"/);
assert.match(page, /<details class="browse-makes" id="browseMakes">/, 'Browse all makes must be collapsed by default');
assert.doesNotMatch(page, /<details class="browse-makes" id="browseMakes" open/, 'Browse all makes unexpectedly starts open');
assert.match(page, /id="details" aria-live="polite"/);
assert.match(page, /window\.history\.pushState/);
assert.match(page, /window\.addEventListener\('popstate'/);
assert.match(page, /navigator\.clipboard\.writeText\(url\)/);
assert.match(page, /function clearSelector\(historyMode = 'push'\)/);
assert.doesNotMatch(page, /scrollTo\(|scrollIntoView\(|location\.hash/, 'Selector must not force page scrolling');
assert.match(page, /@media \(max-width: 520px\)[\s\S]*?\.selector-grid\s*\{[\s\S]*?grid-template-columns: 1fr/);
assert.match(page, /\.selector-grid\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\) auto/);
assert.match(page, /\.browse-makes \.list button\s*\{[\s\S]*?min-height: 44px/);

const translationMatch = page.match(/const translations = (\{[\s\S]*?\r?\n    \});\r?\n\r?\n    const data/);
assert.ok(translationMatch, 'PCD translations could not be parsed');
const translations = vm.runInNewContext(`(${translationMatch[1]})`);
const languages = ['en', 'es', 'fr', 'de'];
assert.deepEqual(Object.keys(translations), languages);
const keys = Object.keys(translations.en).sort();
for (const language of languages) {
  assert.deepEqual(Object.keys(translations[language]).sort(), keys, `${language} translation keys differ`);
  for (const key of ['vehicleSelector', 'makeLabel', 'makePlaceholder', 'modelLabel', 'chooseMakeFirst', 'resetSelector', 'browseMakes']) {
    assert.ok(translations[language][key], `${language}.${key} is missing`);
  }
}

console.log(`PASS PCD selector: ${makes.length} alphabetical makes and dependent unique models`);
console.log('PASS make changes reset models; URL, lang, copy-link and reset state are preserved');
console.log('PASS collapsed browse list, keyboard controls, aria-live and responsive layout contracts');
console.log('PASS PCD selector translations: EN/ES/FR/DE');
