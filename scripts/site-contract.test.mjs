import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, '..');
const calculatorParams = ['w1', 'p1', 'd1', 'j1', 'et1', 'w2', 'p2', 'd2', 'j2', 'et2'];
const supportedLanguages = ['en', 'es', 'fr', 'de'];

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function objectLiteral(content, startPattern, endPattern, label) {
  const match = content.match(new RegExp(`${startPattern}([\\s\\S]*?)${endPattern}`));
  check(match, `${label} literal not found`);
  return vm.runInNewContext(`(${match[1]})`);
}

function translationsFrom(content, label) {
  return objectLiteral(content, 'const translations = ', ';\\s*(?:const|let) ', `${label} translations`);
}

function assertTranslationParity(translations, label) {
  check(JSON.stringify(Object.keys(translations)) === JSON.stringify(supportedLanguages), `${label} languages must be EN/ES/FR/DE in order`);
  const reference = Object.keys(translations.en).sort();
  for (const language of supportedLanguages) {
    const keys = Object.keys(translations[language]).sort();
    check(JSON.stringify(keys) === JSON.stringify(reference), `${label} ${language} translation keys differ from EN`);
  }
  return reference.length;
}

const indexPath = path.join(root, 'index.html');
const tirePath = path.join(root, 'tire-calculator.html');
check(fs.existsSync(indexPath), 'index.html is missing');
check(fs.existsSync(tirePath), 'tire-calculator.html is missing');
console.log('PASS required homepage and tire calculator files exist');

const indexHtml = read('index.html');
const tireHtml = read('tire-calculator.html');
const b5202Html = read('engines/volvo-b5202.html');
const enginesHtml = read('engines.html');

const idsMatch = tireHtml.match(/const ids = (\[[^;]+\]);/);
check(idsMatch, 'Calculator ids array not found');
const ids = vm.runInNewContext(idsMatch[1]);
check(JSON.stringify(ids) === JSON.stringify(calculatorParams), 'Calculator ids array changed');

const defaults = objectLiteral(tireHtml, 'const defaults = ', ';\\s*let lang', 'Calculator defaults');
check(JSON.stringify(Object.keys(defaults)) === JSON.stringify(calculatorParams), 'Calculator defaults keys changed');
for (const parameter of [...calculatorParams, 'lang']) {
  check(tireHtml.includes(`'${parameter}'`) || tireHtml.includes(`"${parameter}"`), `Calculator parameter ${parameter} is missing`);
}
check(tireHtml.includes("params.get('lang')"), 'Calculator no longer reads lang');
check(tireHtml.includes("params.set('lang', lang)"), 'Calculator no longer writes lang');
console.log('PASS calculator URL parameter contract is intact');

const criticalIds = [
  ...calculatorParams,
  'summary1', 'summary2', 'sideViewSvg', 'positionViewSvg', 'visualVerdict',
  'status', 'clearanceMetric', 'speedMetric', 'actualSpeedMetric', 'resultRows', 'shareButton'
];
for (const id of criticalIds) {
  check(new RegExp(`\\bid="${id}"`).test(tireHtml), `Critical calculator DOM id ${id} is missing`);
}
console.log(`PASS ${criticalIds.length} critical calculator DOM ids are intact`);

const tireTranslations = translationsFrom(tireHtml, 'Calculator');
const homeTranslations = translationsFrom(indexHtml, 'Homepage');
const b5202Translations = translationsFrom(b5202Html, 'B5202 guide');
const tireTranslationCount = assertTranslationParity(tireTranslations, 'Calculator');
const homeTranslationCount = assertTranslationParity(homeTranslations, 'Homepage');
const b5202TranslationCount = assertTranslationParity(b5202Translations, 'B5202 guide');
const b5202PageScript = b5202Html.match(/<script>\s*(const translations = [\s\S]*?)<\/script>/);
check(b5202PageScript, 'B5202 localization script is missing');
new vm.Script(b5202PageScript[1]);
for (const match of b5202Html.matchAll(/data-i18n="([^"]+)"/g)) {
  check(Object.hasOwn(b5202Translations.en, match[1]), `B5202 translation key ${match[1]} is missing`);
}
console.log(`PASS calculator translations match across four languages (${tireTranslationCount} keys)`);
console.log(`PASS homepage translations match across four languages (${homeTranslationCount} keys)`);
console.log(`PASS B5202 guide translations match across four languages (${b5202TranslationCount} keys)`);

const requiredB5202Sections = ['overview', 'specifications', 'applications', 'maintenance', 'oil', 'diagnostics', 'problems', 'reliability', 'tuning', 'sources'];
for (const section of requiredB5202Sections) {
  check(b5202Html.includes(`id="${section}"`), `B5202 guide section ${section} is missing`);
}
check(b5202Html.includes('https://d3orient.com/engines/volvo-b5202.html'), 'B5202 canonical URL is missing');
check(b5202Html.includes('93 kW / 126 hp') && b5202Html.includes('170 Nm'), 'B5202 verified performance is missing');
check(b5202Html.includes('https://www.volvoclub.org.uk/tech/S70Specifications1997.pdf'), 'B5202 manufacturer source link is missing');
check(b5202Html.includes('../oil-guide.html?engine=volvo-s70-b5202s'), 'B5202 oil record link is missing');
check(enginesHtml.includes("'volvo-b5202s': 'engines/volvo-b5202.html'"), 'Engine search does not route B5202S to its full guide');
console.log(`PASS B5202 guide SEO, verified data and ${requiredB5202Sections.length} required sections`);

const homepageScriptMatch = indexHtml.match(/<script>\s*(const translations = [\s\S]*?)<\/script>\s*<\/body>/);
check(homepageScriptMatch, 'Homepage localization script is missing');
for (const language of supportedLanguages) {
  const nodes = ['heroTitle', 'trustLead'].map((key) => ({ dataset: { i18n: key }, textContent: '' }));
  const buttons = supportedLanguages.map((value) => ({
    dataset: { lang: value },
    addEventListener() {},
    classList: { toggle() {} }
  }));
  const meta = { content: '', setAttribute(name, value) { if (name === 'content') this.content = value; } };
  const documentMock = {
    documentElement: { lang: '' },
    title: '',
    querySelector(selector) { return selector === 'meta[name="description"]' ? meta : null; },
    querySelectorAll(selector) {
      if (selector === '[data-i18n]') return nodes;
      if (selector === '[data-lang]') return buttons;
      return [];
    }
  };
  vm.runInNewContext(homepageScriptMatch[1], {
    document: documentMock,
    window: {
      location: { href: `https://example.test/autohub/index.html?lang=${language}` },
      history: { replaceState() {} }
    },
    URL
  });
  check(documentMock.documentElement.lang === language, `Homepage did not apply ?lang=${language}`);
  check(documentMock.title === homeTranslations[language].pageTitle, `Homepage title did not translate for ${language}`);
  check(meta.content === homeTranslations[language].metaDescription, `Homepage meta description did not translate for ${language}`);
  for (const node of nodes) {
    check(node.textContent === homeTranslations[language][node.dataset.i18n], `Homepage ${node.dataset.i18n} did not translate for ${language}`);
  }
}
console.log('PASS homepage renders EN/ES/FR/DE from the lang query parameter');

class MockClassList {
  constructor(initial = []) { this.values = new Set(initial); }
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    const enabled = force === undefined ? !this.values.has(value) : Boolean(force);
    if (enabled) this.values.add(value); else this.values.delete(value);
    return enabled;
  }
}

function mockElement({ href = '', dataset = {}, classes = [] } = {}) {
  const attributes = new Map(href ? [['href', href]] : []);
  const listeners = new Map();
  return {
    dataset,
    textContent: '',
    classList: new MockClassList(classes),
    focused: false,
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type, event = {}) { listeners.get(type)?.(event); },
    getAttribute(name) { return attributes.get(name) || null; },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    hasAttribute(name) { return attributes.has(name); },
    focus() { this.focused = true; }
  };
}

const internalLink = mockElement({ href: 'guides.html?topic=wheels#steps' });
const tireLink = mockElement({ href: 'tire-calculator.html' });
const englishOnlyLink = mockElement({ href: 'pcd/bmw/e46.html' });
const mailLink = mockElement({ href: 'mailto:autocore.team@gmail.com' });
const externalLink = mockElement({ href: 'https://example.org/tool.html' });
const anchorLink = mockElement({ href: '#tools' });
const shellAnchors = [internalLink, tireLink, englishOnlyLink, mailLink, externalLink, anchorLink];
const languageButtons = supportedLanguages.map((language) => mockElement({ dataset: { lang: language }, classes: language === 'en' ? ['selected'] : [] }));
const shellLabel = mockElement({ dataset: { shellI18n: 'navHome' } });
const menu = mockElement();
menu.querySelectorAll = (selector) => selector === 'a' ? shellAnchors : [];
const toggle = mockElement();
const documentListeners = new Map();
const documentMock = {
  documentElement: { classList: new MockClassList() },
  getElementById(id) { return id === 'site-menu' ? menu : null; },
  querySelector(selector) { return selector === '.site-menu-toggle' ? toggle : null; },
  querySelectorAll(selector) {
    if (selector === '[data-shell-i18n]') return [shellLabel];
    if (selector === '[data-lang]') return languageButtons;
    if (selector === 'a[href]') return shellAnchors;
    return [];
  },
  addEventListener(type, listener) { documentListeners.set(type, listener); }
};
const shellWindow = { location: new URL('https://example.test/autohub/index.html?lang=de') };
vm.runInNewContext(read('assets/js/site-shell.js'), { document: documentMock, window: shellWindow, URL, URLSearchParams });
check(documentMock.documentElement.classList.contains('site-shell-ready'), 'Site shell did not enable enhanced mobile navigation');
check(shellLabel.textContent === 'Startseite', 'Site shell did not translate from the current lang parameter');
check(internalLink.getAttribute('href') === 'guides.html?topic=wheels&lang=de#steps', 'Site shell did not preserve query/hash while adding lang');
check(tireLink.getAttribute('href') === 'tire-calculator.html?lang=de', 'Site shell did not pass lang to a localized internal page');
check(englishOnlyLink.getAttribute('href') === 'pcd/bmw/e46.html', 'Site shell added lang to an EN-only PCD page');
check(mailLink.getAttribute('href') === 'mailto:autocore.team@gmail.com', 'Site shell changed a mailto link');
check(externalLink.getAttribute('href') === 'https://example.org/tool.html', 'Site shell changed an external link');
check(anchorLink.getAttribute('href') === '#tools', 'Site shell changed an anchor link');
toggle.dispatch('click');
check(menu.classList.contains('is-open') && toggle.getAttribute('aria-expanded') === 'true', 'Mobile menu did not open');
internalLink.dispatch('click');
check(!menu.classList.contains('is-open') && toggle.getAttribute('aria-expanded') === 'false', 'Mobile menu did not close after a link');
toggle.dispatch('click');
documentListeners.get('keydown')({ key: 'Escape' });
check(!menu.classList.contains('is-open') && toggle.focused, 'Escape did not close the mobile menu and return focus');
languageButtons.find((button) => button.dataset.lang === 'es').dispatch('click');
check(tireLink.getAttribute('href') === 'tire-calculator.html?lang=es', 'Language switch did not refresh internal links');
console.log('PASS shared shell language propagation and mobile menu interactions');

const redirectMatch = indexHtml.match(/<script data-compatibility-redirect>([\s\S]*?)<\/script>/);
check(redirectMatch, 'Compatibility redirect script is missing');

function redirectFor(inputUrl) {
  const input = new URL(inputUrl);
  let redirectedTo = '';
  const location = {
    href: input.href,
    search: input.search,
    hash: input.hash,
    replace(value) { redirectedTo = value; }
  };
  vm.runInNewContext(redirectMatch[1], { window: { location }, URL, URLSearchParams });
  return redirectedTo;
}

for (const parameter of calculatorParams) {
  const redirected = redirectFor(`https://example.test/autohub/index.html?${parameter}=205&lang=de#results`);
  check(redirected === `https://example.test/autohub/tire-calculator.html?${parameter}=205&lang=de#results`, `Partial redirect failed for ${parameter}`);
}

const fullQuery = '?w1=195&p1=65&d1=15&j1=6&et1=45&w2=205&p2=55&d2=16&j2=7&et2=45&lang=fr&future=value';
const fullRedirect = redirectFor(`https://example.test/autohub/index.html${fullQuery}#visual`);
check(fullRedirect === `https://example.test/autohub/tire-calculator.html${fullQuery}#visual`, 'Full calculator redirect did not preserve search and hash');
check(redirectFor('https://example.test/autohub/index.html?lang=de') === '', 'Language-only homepage URL must not redirect');
console.log('PASS compatibility redirect handles full and partial legacy calculator URLs');

const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));
check(htmlFiles.length === 20, `Expected 20 HTML pages after adding the first engine guide, found ${htmlFiles.length}`);
const publicOrigin = 'https://d3orient.com';

function expectedCanonical(relativeFile) {
  return relativeFile === 'index.html' ? `${publicOrigin}/` : `${publicOrigin}/${relativeFile}`;
}

const enOnlyPcdPages = new Set([
  'pcd/bmw/e46.html', 'pcd/bolt-pattern/5x108.html', 'pcd/bolt-pattern/5x110.html',
  'pcd/opel/astra.html', 'pcd/volvo/s70.html', 'pcd/vw/golf-5.html'
]);

const activePages = new Map([
  ['index.html', 'index.html'],
  ['tire-calculator.html', 'tire-calculator.html'],
  ['pcd.html', 'pcd.html'],
  ['fuel.html', 'fuel.html'],
  ['diagnostics.html', 'diagnostics.html'],
  ['engines.html', 'engines.html'],
  ['engines/volvo-b5202.html', '../engines.html'],
  ['guides.html', 'guides.html'],
  ['pcd/bmw/e46.html', '../../pcd.html'],
  ['pcd/bolt-pattern/5x108.html', '../../pcd.html'],
  ['pcd/bolt-pattern/5x110.html', '../../pcd.html'],
  ['pcd/opel/astra.html', '../../pcd.html'],
  ['pcd/volvo/s70.html', '../../pcd.html'],
  ['pcd/vw/golf-5.html', '../../pcd.html']
]);

const expectedMenuFiles = ['index.html', 'tire-calculator.html', 'pcd.html', 'fuel.html', 'diagnostics.html', 'engines.html', 'guides.html'];

const brokenLinks = [];
for (const absoluteFile of htmlFiles) {
  const relativeFile = path.relative(root, absoluteFile).replaceAll('\\', '/');
  const content = fs.readFileSync(absoluteFile, 'utf8');
  check(content.includes('class="site-header"'), `${relativeFile} is missing the shared header`);
  check(content.includes('class="site-footer"'), `${relativeFile} is missing the shared footer`);
  check(content.includes('site-menu-toggle'), `${relativeFile} is missing the mobile menu toggle`);
  check(!content.includes('href="/autohub/'), `${relativeFile} still contains a hard-coded /autohub/ navigation link`);

  const canonicalMatches = [...content.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?\s*>/gi)];
  check(canonicalMatches.length === 1, `${relativeFile} must have exactly one canonical URL`);
  check(canonicalMatches[0][1] === expectedCanonical(relativeFile), `${relativeFile} canonical URL differs: ${canonicalMatches[0][1]}`);
  check(!canonicalMatches[0][1].includes('?lang='), `${relativeFile} canonical URL contains a lang query`);

  const primaryNavMatch = content.match(/<nav class="site-primary-nav"[\s\S]*?<\/nav>/i);
  check(primaryNavMatch, `${relativeFile} is missing the primary navigation`);
  const menuFiles = [...primaryNavMatch[0].matchAll(/href="([^"]+)"/g)].map((match) => path.posix.basename(match[1].split(/[?#]/)[0]));
  check(JSON.stringify(menuFiles) === JSON.stringify(expectedMenuFiles), `${relativeFile} primary navigation order differs`);

  const languageButtonCount = (content.match(/data-lang="(?:en|es|fr|de)"/g) || []).length;
  check(languageButtonCount === (enOnlyPcdPages.has(relativeFile) ? 0 : 4), `${relativeFile} has an unexpected language switcher`);

  const expectedActiveHref = activePages.get(relativeFile);
  if (expectedActiveHref) {
    check(new RegExp(`<a href="${expectedActiveHref.replaceAll('.', '\\.')}"[^>]*(?:class="active"[^>]*aria-current="page"|aria-current="page"[^>]*class="active")`).test(primaryNavMatch[0]), `${relativeFile} has no correct active primary navigation item`);
  } else {
    check(!/aria-current="page"/.test(primaryNavMatch[0]), `${relativeFile} marks an unrelated primary navigation item active`);
  }

  check(!/href="[^"]*index\.html\?[^"#]*(?:w1|p1|d1|j1|et1|w2|p2|d2|j2|et2)=/i.test(content), `${relativeFile} links old calculator parameters to index.html`);
  check(!/["'](?:\.\.\/)*index\.html["']\s*,\s*["']toolTire["']/.test(content), `${relativeFile} still maps a tire tool to index.html`);

  for (const match of content.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].replaceAll('&amp;', '&');
    const anchorText = match[2].replace(/<[^>]+>/g, ' ');
    if (/tire|reifen|neum|pneu/i.test(`${match[0]} ${anchorText}`)) {
      check(!/(?:^|\/)index\.html(?:[?#]|$)/.test(href), `${relativeFile} has a tire link pointing to index.html: ${href}`);
    }
  }

  for (const match of content.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (!raw || raw.includes('${') || raw.startsWith('#') || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
    const pathPart = raw.split(/[?#]/)[0];
    if (!pathPart) continue;
    const resolved = path.resolve(path.dirname(absoluteFile), pathPart);
    if (!fs.existsSync(resolved)) brokenLinks.push(`${relativeFile}: ${raw}`);
  }
}
check(brokenLinks.length === 0, `Broken internal links:\n${brokenLinks.join('\n')}`);
console.log(`PASS shared navigation, footer and internal links across ${htmlFiles.length} HTML pages`);

const allProjectFiles = walk(root);
const cname = read('CNAME');
check(/^d3orient\.com\r?\n?$/.test(cname), 'CNAME must contain only d3orient.com');

const robots = read('robots.txt');
check(/^User-agent: \*\r?\nAllow: \/\r?\nSitemap: https:\/\/d3orient\.com\/sitemap\.xml\r?\n?$/.test(robots), 'robots.txt content differs from the public-domain contract');

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedPublicUrls = htmlFiles
  .map((file) => expectedCanonical(path.relative(root, file).replaceAll('\\', '/')))
  .sort();
check(sitemapUrls.length === htmlFiles.length, `Sitemap must contain ${htmlFiles.length} HTML URLs, found ${sitemapUrls.length}`);
check(sitemapUrls.every((url) => url.startsWith(`${publicOrigin}/`)), 'Sitemap contains a URL outside d3orient.com');
check(sitemapUrls.every((url) => !url.includes('?lang=')), 'Sitemap contains a lang query parameter');
check(JSON.stringify([...sitemapUrls].sort()) === JSON.stringify(expectedPublicUrls), 'Sitemap URLs differ from indexable HTML canonicals');

const oldPublicHost = 'autocore-team.github.io/autohub';
const publicSeoFiles = [
  ...htmlFiles,
  path.join(root, 'sitemap.xml'),
  path.join(root, 'robots.txt'),
  path.join(root, 'data/engines/source/schema.json'),
  path.join(root, 'README.md')
];
for (const file of publicSeoFiles) {
  check(!fs.readFileSync(file, 'utf8').includes(oldPublicHost), `Old public host remains in ${path.relative(root, file)}`);
}

const deployableFiles = allProjectFiles.filter((file) => {
  const relativeFile = path.relative(root, file).replaceAll('\\', '/');
  return file.endsWith('.html') || (file.endsWith('.js') && !relativeFile.startsWith('scripts/'));
});
for (const file of deployableFiles) {
  check(!fs.readFileSync(file, 'utf8').includes('/autohub/'), `Deployable file contains a hard-coded /autohub/ path: ${path.relative(root, file)}`);
}

const engineSchema = JSON.parse(read('data/engines/source/schema.json'));
check(engineSchema.$id === 'https://d3orient.com/data/engines/source/schema.json', 'Engine schema $id does not use d3orient.com');
check(read('README.md').includes('https://d3orient.com/'), 'README does not identify d3orient.com as the public site');
console.log(`PASS domain launch contract: CNAME, robots, ${sitemapUrls.length} sitemap URLs and canonical URLs`);
console.log(`PASS no old public host or hard-coded /autohub/ path remains in deployable files`);

for (const relativePath of [...htmlFiles.map((file) => path.relative(root, file)), 'README.md']) {
  const content = fs.readFileSync(path.join(root, relativePath), 'utf8');
  check(!/AutoHub|Autohub/.test(content), `Visible legacy brand remains in ${relativePath}`);
}
console.log('PASS visible AutoHub/Autohub branding was removed from user-facing files');

const apiContracts = [
  ['engine-data.js', 'AUTOHUB_ENGINE_DATA'],
  ['data/engines/europe.js', 'AUTOHUB_ENGINE_DATA_REGIONS'],
  ['data/engines/japan.js', 'AUTOHUB_ENGINE_DATA_REGIONS'],
  ['data/engines/korea.js', 'AUTOHUB_ENGINE_DATA_REGIONS'],
  ['data/engines/usa.js', 'AUTOHUB_ENGINE_DATA_REGIONS'],
  ['diagnostics-data.js', 'AUTOHUB_DIAGNOSTICS_DATA'],
  ['oil-data.js', 'AUTOHUB_OIL_DATA'],
  ['engines.html', 'AUTOHUB_ENGINE_DATA_REGIONS'],
  ['diagnostics.html', 'AUTOHUB_DIAGNOSTICS_DATA'],
  ['oil-guide.html', 'AUTOHUB_OIL_DATA']
];
for (const [relativePath, apiName] of apiContracts) {
  check(read(relativePath).includes(apiName), `${apiName} contract is missing from ${relativePath}`);
}
console.log(`PASS ${apiContracts.length} internal AUTOHUB_* API contracts are intact`);

console.log('Site contract tests passed.');
