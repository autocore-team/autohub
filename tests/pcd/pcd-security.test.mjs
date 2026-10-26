import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const security = require('../../assets/js/pcd-security.js');
const search = require('../../assets/js/pcd-search.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

function publicDataFromFile() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${read('pcd-data.js')};this.PCD_DATA_EXPORT=PCD_DATA`, context);
  return context.PCD_DATA_EXPORT;
}

const payload = '<img src=x onerror="globalThis.__xss=1">';
const scriptPayload = '</script><script>globalThis.__xss=1</script>';
assert.equal(security.escapeHtml('Volvo S70'), 'Volvo S70');
const escapedPayload = security.escapeHtml(payload);
const escapedScriptPayload = security.escapeHtml(scriptPayload);
assert.equal(escapedPayload, '&lt;img src=x onerror=&quot;globalThis.__xss=1&quot;&gt;');
assert.equal(escapedScriptPayload, '&lt;/script&gt;&lt;script&gt;globalThis.__xss=1&lt;/script&gt;');
assert.doesNotMatch(escapedPayload, /<img\b/i);
assert.doesNotMatch(escapedScriptPayload, /<\/?script\b/i);
assert.equal(
  security.escapeHtml(`"' <>&`),
  '&quot;&#39; &lt;&gt;&amp;'
);
console.log('PASS PCD HTML payload and special-character escaping');

for (const unsafeUrl of [
  'javascript:globalThis.__xss=1',
  'data:text/html,<script>globalThis.__xss=1</script>',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  'http://example.com/source',
  'https://[malformed'
]) {
  assert.equal(security.safeHttpsUrl(unsafeUrl), null, `${unsafeUrl} must not be linkable`);
}
const safeUrl = 'https://example.com/source?vehicle=1&ref=pcd';
assert.equal(security.safeHttpsUrl(safeUrl), safeUrl);
assert.equal(security.safeHttpsUrl(null), null);
console.log('PASS PCD HTTPS-only source URL policy');

const page = read('pcd.html');
assert.match(page, /<script src="assets\/js\/pcd-security\.js"><\/script>/);
assert.match(page, /rel="noopener noreferrer"/);
assert.match(page, /const safeUrl = safeHttpsUrl\(item\.url\)/);
assert.match(page, /href="\$\{escapeHtml\(safeUrl\)\}"/);
assert.match(page, /: `<span>\$\{sourceLabel\}<\/span>`/);
assert.match(page, /\$\{escapeHtml\(record\.generation \|\| ''\)\}/);
assert.match(page, /\$\{escapeHtml\(record\.thread \|\| ''\)\}/);
assert.match(page, /\$\{escapeHtml\(item\.limitations\)\}/);
console.log('PASS PCD record rendering applies escaping and unsafe-link fallback');

const records = publicDataFromFile();
const allRecords = records.flatMap((maker) => maker.models.flatMap((model) => model.records));
assert.ok(allRecords.length > 0, 'Expected public PCD records');
for (const record of allRecords) {
  for (const source of record.sources || []) {
    const parsed = security.safeHttpsUrl(source.url);
    assert.ok(parsed === null || new URL(parsed).protocol === 'https:', `${record.id} has an unsafe source URL`);
  }
}
console.log(`PASS URL policy applied to all ${allRecords.length} public PCD records`);

const selection = search.resolveUrlState(
  records,
  '?search=BMW%20E46&make=bmw&model=3-series&lang=de',
  ['en', 'es', 'fr', 'de']
);
assert.equal(selection.query, 'BMW E46');
assert.equal(selection.language, 'de');
assert.equal(selection.selectedBrand?.slug, 'bmw');
assert.equal(selection.selectedModel?.slug, '3-series');
assert.equal(search.searchDatabase(records, 'Volvo S70')[0]?.name, 'Volvo');
console.log('PASS PCD search and query-parameter record selection remain intact');

const workflow = read('.github/workflows/engine-data-ci.yml');
const actions = [...workflow.matchAll(/uses:\s*([^@\s]+)@([^\s#]+)(?:\s+#\s*(.+))?/g)];
assert.deepEqual(actions.map(([, repository]) => repository), ['actions/checkout', 'actions/setup-node']);
for (const [, , sha, version] of actions) {
  assert.match(sha, /^[0-9a-f]{40}$/);
  assert.ok(version, 'Pinned action must retain its readable version comment');
}
assert.match(workflow, /uses: actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7\.0\.1/);
assert.match(workflow, /uses: actions\/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7\.1\.0/);
assert.match(workflow, /persist-credentials:\s*false/);
assert.match(workflow, /name: Engine Data CI/);
assert.match(workflow, /name: Validate engine data/);
assert.match(workflow, /permissions:\s*\r?\n\s+contents:\s*read/);
assert.match(workflow, /^\s+pull_request:/m);
assert.match(workflow, /^\s+push:/m);
assert.match(workflow, /^\s+workflow_dispatch:/m);
assert.match(workflow, /fetch-depth:\s*0/);
assert.match(workflow, /node-version:\s*24/);
assert.match(workflow, /run: npm test/);
assert.match(workflow, /run: npm run engines:legacy-compare/);
assert.match(workflow, /run: git diff --exit-code/);
console.log('PASS workflow action pins, names, permissions and preserved validation steps');
