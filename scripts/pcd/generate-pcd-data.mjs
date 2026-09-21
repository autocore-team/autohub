import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPcdSource, root, validatePcdData } from './validate-pcd-data.mjs';

const outputPath = path.join(root, 'pcd-data.js');

function numberLabel(value) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function yearsLabel(record) {
  if (record.legacyYears) return record.legacyYears;
  return record.years.map(({ from, to }) => `${from}-${to}`).join(' / ');
}

function marketLabel(record) {
  if (record.legacyMarket) return record.legacyMarket;
  const labels = { EU: 'EU', US: 'US', JP: 'Japan', GLOBAL: 'Global', OTHER: 'some markets' };
  return record.market.map((market) => labels[market]).join(' / ');
}

function offsetLabel(offset) {
  if (offset.legacyValue) return offset.legacyValue;
  return offset.minEt === offset.maxEt ? `ET${numberLabel(offset.minEt)}` : `ET${numberLabel(offset.minEt)}-${numberLabel(offset.maxEt)}`;
}

function publicStatus(status) {
  return status === 'legacyPending' ? 'needs_review' : status;
}

export function toPublicPcdData(source) {
  const makers = [];
  const makerBySlug = new Map();

  for (const record of source.records) {
    let maker = makerBySlug.get(record.makerSlug);
    if (!maker) {
      maker = { name: record.maker, slug: record.makerSlug, models: [] };
      maker.modelBySlug = new Map();
      makerBySlug.set(record.makerSlug, maker);
      makers.push(maker);
    }

    let model = maker.modelBySlug.get(record.modelSlug);
    if (!model) {
      model = { name: record.model, slug: record.modelSlug, records: [] };
      maker.modelBySlug.set(record.modelSlug, model);
      maker.models.push(model);
    }

    model.records.push({
      generation: record.generation,
      years: yearsLabel(record),
      market: marketLabel(record),
      pcd: `${record.boltPattern.holes}x${numberLabel(record.boltPattern.diameterMm)}`,
      centerBore: numberLabel(record.centerBore),
      thread: record.threadSize,
      fastener: record.fastenerType === 'bolt' ? 'bolts' : 'nuts',
      offset: offsetLabel(record.offset),
      status: publicStatus(record.verificationStatus)
    });
  }

  return makers.map((maker) => {
    delete maker.modelBySlug;
    return maker;
  });
}

function jsString(value) {
  return `'${value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')}'`;
}

function jsLiteral(value, depth = 0) {
  if (typeof value === 'string') return jsString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';

  const indent = '  '.repeat(depth);
  const childIndent = '  '.repeat(depth + 1);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return `[\n${value.map((item) => `${childIndent}${jsLiteral(item, depth + 1)}`).join(',\n')}\n${indent}]`;
  }

  const entries = Object.entries(value);
  if (!entries.length) return '{}';
  return `{\n${entries.map(([key, item]) => `${childIndent}${key}: ${jsLiteral(item, depth + 1)}`).join(',\n')}\n${indent}}`;
}

export function generatedPcdFile(source) {
  const publicData = toPublicPcdData(source);
  return [
    '// This file is generated from data/pcd/source/vehicles.json.',
    '// Do not edit it manually. Run: npm run pcd:generate',
    '',
    `const PCD_DATA = ${jsLiteral(publicData)};`,
    ''
  ].join('\n');
}

export function generatedPcdFileMatches(current, expected) {
  return current.replaceAll('\r\n', '\n') === expected.replaceAll('\r\n', '\n');
}

function main() {
  const source = loadPcdSource();
  const summary = validatePcdData(source);
  const expected = generatedPcdFile(source);
  const checkOnly = process.argv.includes('--check');

  if (checkOnly) {
    const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
    if (!generatedPcdFileMatches(current, expected)) {
      throw new Error('pcd-data.js is stale. Run npm run pcd:generate.');
    }
    console.log(`Generated PCD data is up to date: ${summary.records} records.`);
    return;
  }

  fs.writeFileSync(outputPath, expected);
  console.log(`Generated pcd-data.js from ${summary.records} source records.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
