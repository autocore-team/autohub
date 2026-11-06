import fs from 'node:fs';
import zlib from 'node:zlib';

const source = JSON.parse(fs.readFileSync(new URL('../../data/pcd/source/vehicles.json', import.meta.url), 'utf8'));
const currentYear = 2026;
const normalize = (value) => decodeURIComponent(value)
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clean = (value) => value.replace(/&ndash;|&#8211;/g, '–').replace(/&amp;/g, '&').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const unique = (items) => [...new Set(items)];

async function fetchText(url, attempts = 2) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'AutoHub-data-audit/1.0' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      return bytes[0] === 0x1f && bytes[1] === 0x8b ? zlib.gunzipSync(bytes).toString('utf8') : bytes.toString('utf8');
    } catch (error) {
      last = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
    }
  }
  throw last;
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => clean(match[1]));
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      try { results[index] = await mapper(items[index], index); }
      catch (error) { results[index] = { candidate: items[index], rejection: 'fetchFailure', detail: error.message }; }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

function parseExactYearUrl(url, prefix) {
  const match = new URL(url).pathname.match(new RegExp(`^/${prefix}/([^/]+)/([^/]+)/(\\d{4})/$`));
  if (!match) return null;
  return { url, makerKey: normalize(match[1]), modelKey: normalize(match[2]), year: Number(match[3]) };
}

function parseAvto(html) {
  const pcds = unique([...html.matchAll(/<th scope="row">PCD \(Pitch Circle Diameter\)<\/th><td>(\d+)x(\d+(?:\.\d+)?) mm<\/td>/g)].map((match) => `${match[1]}x${match[2]}`));
  const bores = unique([...html.matchAll(/<th scope="row">Center Bore<\/th><td>(\d+(?:\.\d+)?) mm<\/td>/g)].map((match) => Number(match[1])));
  const threads = unique([...html.matchAll(/<th scope="row">Thread Size<\/th><td>M\s*(\d+)\s*x\s*(\d+(?:\.\d+)?)<\/td>/g)].map((match) => `M${Number(match[1])}x${Number(match[2]).toFixed(2)}`));
  const fasteners = unique([...html.matchAll(/<th scope="row">Wheel Fasteners<\/th><td>Lug (bolts|nuts)<\/td>/g)].map((match) => match[1] === 'bolts' ? 'bolt' : 'nut'));
  const generations = unique([...html.matchAll(/Generation:\s*([^<]+)<br>/g)].map((match) => clean(match[1])));
  const markets = unique([...html.matchAll(/Sales market:\s*([^<]+)<br>/g)].map((match) => clean(match[1])));
  if ([pcds, bores, threads, fasteners, generations].some((items) => items.length !== 1) || markets.length === 0) return null;
  return { pcd: pcds[0], centerBore: bores[0], threadSize: threads[0], fastenerType: fasteners[0], generation: generations[0], markets };
}

function facts(html, label) {
  const pattern = new RegExp(`<dt>${label}<\\/dt><dd class="num">([\\s\\S]*?)<\\/dd>`, 'g');
  return unique([...html.matchAll(pattern)].map((match) => clean(match[1])));
}

function parseTwg(html, year) {
  const heading = html.match(new RegExp(`<h1[^>]*><span class="num">${year}<\\/span>\\s*([^<]+?)\\s+tire and wheel sizes`, 'i'));
  if (!heading) return null;
  const display = clean(heading[1]);
  const boltPatterns = facts(html, 'Bolt pattern');
  const bores = facts(html, 'Center bore').map((value) => Number(value.match(/\d+(?:\.\d+)?/)?.[0]));
  const threads = facts(html, 'Thread').map((value) => {
    const match = value.match(/M\s*(\d+)\s*x\s*(\d+(?:\.\d+)?)/i);
    return match ? `M${Number(match[1])}x${Number(match[2]).toFixed(2)}` : null;
  });
  const generations = facts(html, 'Generation');
  const markets = facts(html, 'Market');
  const oeOffsets = unique([...html.matchAll(/<tr><td><b class="oe">OE<\/b><\/td>[\s\S]*?<td><em>Rim<\/em>[^<]*?(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*?\bET(-?\d+(?:\.\d+)?)/g)].map((match) => Number(match[1])));
  const pcds = unique(boltPatterns.map((value) => value.match(/\d+x\d+(?:\.\d+)?/)?.[0]).filter(Boolean));
  if ([pcds, bores, threads, generations].some((items) => items.length !== 1 || items[0] == null) || markets.length === 0 || oeOffsets.length === 0) return null;
  return { display, pcd: pcds[0], centerBore: bores[0], threadSize: threads[0], generation: generations[0], markets, offset: { minEt: Math.min(...oeOffsets), maxEt: Math.max(...oeOffsets) } };
}

function mapMarket(names) {
  const result = [];
  for (const name of names) {
    const lower = name.toLowerCase();
    const market = /europe|eudm/.test(lower) ? 'EU'
      : /united states|usa|canada|mexico|north america|usdm/.test(lower) ? 'US'
      : /japan|jdm/.test(lower) ? 'JP'
      : /global|world/.test(lower) ? 'GLOBAL' : 'OTHER';
    if (!result.includes(market)) result.push(market);
  }
  return result;
}

const twgIndex = sitemapUrls(await fetchText('https://tirewheelguide.com/tara/sitemap_index.xml'));
const avtoIndex = sitemapUrls(await fetchText('https://avtoreference.com/sitemap/index.xml/'));
const [twgMaps, avtoMaps] = await Promise.all([
  mapConcurrent(twgIndex, 7, (url) => fetchText(url)),
  mapConcurrent(avtoIndex, 8, (url) => fetchText(url))
]);
const twgEntries = twgMaps.flatMap((xml) => sitemapUrls(xml)).map((url) => parseExactYearUrl(url, 'sizes')).filter(Boolean);
const avtoEntries = avtoMaps.flatMap((xml) => sitemapUrls(xml)).map((url) => parseExactYearUrl(url, 'en/auto')).filter(Boolean);
const key = (item) => `${item.makerKey}|${item.modelKey}|${item.year}`;
const avtoByKey = new Map(avtoEntries.map((item) => [key(item), item]));
const existingUrls = new Set(source.records.flatMap((record) => record.sources.map((item) => item.url)));
const existingModels = new Set(source.records.map((record) => `${normalize(record.maker)}|${normalize(record.model)}`));
const existingIds = new Set(source.records.map((record) => record.id));
const makerCounts = new Map();
for (const record of source.records) makerCounts.set(normalize(record.maker), (makerCounts.get(normalize(record.maker)) || 0) + 1);

const latestByModel = new Map();
for (const twg of twgEntries) {
  const avto = avtoByKey.get(key(twg));
  if (!avto || twg.year > currentYear || existingUrls.has(twg.url) || existingUrls.has(avto.url)) continue;
  const modelKey = `${twg.makerKey}|${twg.modelKey}`;
  if (existingModels.has(modelKey)) continue;
  const previous = latestByModel.get(modelKey);
  const score = ((makerCounts.get(twg.makerKey) || 0) < 10 ? 100 : 0) + (twg.year < 1990 ? 80 : 0) + twg.year / 10000;
  if (!previous || score > previous.score) latestByModel.set(modelKey, { ...twg, avtoUrl: avto.url, score });
}
const pool = [...latestByModel.values()].sort((left, right) => right.score - left.score || left.makerKey.localeCompare(right.makerKey)).slice(0, 420);
const results = await mapConcurrent(pool, 10, async (candidate) => {
  const [twgHtml, avtoHtml] = await Promise.all([fetchText(candidate.url), fetchText(candidate.avtoUrl)]);
  const twg = parseTwg(twgHtml, candidate.year);
  const avto = parseAvto(avtoHtml);
  if (!twg || !avto) return { candidate, rejection: 'incomplete' };
  if (twg.pcd !== avto.pcd) return { candidate, rejection: 'fieldConflict', detail: 'PCD' };
  if (Math.abs(twg.centerBore - avto.centerBore) > 0.001) return { candidate, rejection: 'fieldConflict', detail: 'DIA' };
  if (twg.threadSize !== avto.threadSize) return { candidate, rejection: 'fieldConflict', detail: 'thread' };
  const [maker, ...modelParts] = twg.display.split(' ');
  const twgMarkets = mapMarket(twg.markets);
  const avtoMarkets = mapMarket(avto.markets);
  const markets = twgMarkets.includes('GLOBAL')
    ? avtoMarkets
    : avtoMarkets.includes('GLOBAL')
      ? twgMarkets
      : twgMarkets.filter((market) => avtoMarkets.includes(market));
  if (markets.length === 0) return { candidate, rejection: 'fieldConflict', detail: 'market' };
  return { candidate, maker, model: modelParts.join(' '), ...twg, markets, fastenerType: avto.fastenerType, avtoGeneration: avto.generation };
});

const accepted = [];
const rejected = [];
const ids = new Set();
for (const result of results) {
  if (result.rejection) { rejected.push(result); continue; }
  const id = `pcd-b11-${result.candidate.makerKey}-${result.candidate.modelKey}-${result.candidate.year}-${result.pcd.replace('.', '-')}`;
  if (existingIds.has(id) || ids.has(id)) { rejected.push({ ...result, rejection: 'semanticCollision' }); continue; }
  ids.add(id);
  accepted.push({ ...result, id });
}

const report = {
  sitemap: { tireWheelGuide: twgEntries.length, avtoReference: avtoEntries.length, newDistinctModels: latestByModel.size },
  pool: pool.length,
  accepted: accepted.length,
  rejected: rejected.length,
  rejectionBreakdown: rejected.reduce((map, item) => { const label = `${item.rejection}${item.detail ? `:${item.detail}` : ''}`; map[label] = (map[label] || 0) + 1; return map; }, {}),
  markets: accepted.flatMap((item) => item.markets).reduce((map, market) => { map[market] = (map[market] || 0) + 1; return map; }, {}),
  pre1990: accepted.filter((item) => item.candidate.year < 1990).length,
  underrepresentedMaker: accepted.filter((item) => (makerCounts.get(item.candidate.makerKey) || 0) < 10).length,
  candidates: (process.env.BATCH11_SUMMARY_ONLY ? accepted.slice(0, 20) : accepted).map((item) => ({
    id: item.id, maker: item.maker, model: item.model, year: item.candidate.year,
    generation: item.generation, avtoGeneration: item.avtoGeneration, markets: item.markets,
    pcd: item.pcd, centerBore: item.centerBore, threadSize: item.threadSize,
    fastenerType: item.fastenerType, offset: item.offset, twgUrl: item.candidate.url, avtoUrl: item.candidate.avtoUrl
  }))
};
const serializedReport = JSON.stringify(report, null, 2);
if (process.env.BATCH11_OUTPUT) fs.writeFileSync(process.env.BATCH11_OUTPUT, `${serializedReport}\n`);
else console.log(serializedReport);
