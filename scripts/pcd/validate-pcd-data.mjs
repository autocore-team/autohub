import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(scriptsDirectory, '../..');
export const sourcePath = path.join(root, 'data/pcd/source/vehicles.json');
export const schemaPath = path.join(root, 'data/pcd/source/schema.json');

export const allowedStatuses = new Set(['verified', 'corroborated', 'legacyPending']);
const allowedMarkets = new Set(['EU', 'US', 'JP', 'GLOBAL', 'OTHER']);
const allowedFasteners = new Set(['bolt', 'nut']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertKeys(record, required, optional, label) {
  const allowed = new Set([...required, ...optional]);
  for (const key of required) assert(Object.hasOwn(record, key), `${label} is missing ${key}`);
  for (const key of Object.keys(record)) assert(allowed.has(key), `${label} has unexpected property ${key}`);
}

function validDate(value) {
  if (!datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateOffset(offset, label) {
  assert(isObject(offset), `${label} must be an object`);
  const numeric = Object.hasOwn(offset, 'minEt') || Object.hasOwn(offset, 'maxEt');
  if (numeric) {
    assertKeys(offset, ['minEt', 'maxEt'], [], label);
    assert(Number.isFinite(offset.minEt) && Number.isFinite(offset.maxEt), `${label} ET bounds must be numbers`);
    assert(offset.minEt <= offset.maxEt, `${label} minEt exceeds maxEt`);
  } else {
    assertKeys(offset, ['legacyValue'], [], label);
    assert(typeof offset.legacyValue === 'string' && offset.legacyValue.length > 0, `${label} legacyValue is empty`);
  }
}

function validateSource(source, label) {
  assert(isObject(source), `${label} must be an object`);
  assertKeys(
    source,
    ['type', 'publisher', 'title', 'url', 'checkedAt', 'fields'],
    ['documentDate', 'pages', 'notes'],
    label
  );
  assert(['manufacturer', 'serviceDocumentation', 'certificationDocument', 'technicalReference'].includes(source.type), `${label} type is invalid`);
  for (const key of ['publisher', 'title', 'url']) assert(typeof source[key] === 'string' && source[key].length > 0, `${label} ${key} is empty`);
  assert(/^https?:\/\//.test(source.url), `${label} URL must be HTTP(S)`);
  assert(validDate(source.checkedAt), `${label} checkedAt is not a valid date`);
  assert(Array.isArray(source.fields) && source.fields.length > 0, `${label} fields must not be empty`);
  assert(source.fields.every((field) => typeof field === 'string' && field.length > 0), `${label} fields contain an invalid value`);
  assert(new Set(source.fields).size === source.fields.length, `${label} fields contain duplicates`);
  for (const key of ['documentDate', 'pages', 'notes']) {
    if (source[key] !== undefined) assert(source[key] === null || typeof source[key] === 'string', `${label} ${key} must be a string or null`);
  }
}

function validateTorque(torque, label) {
  if (torque === null) return;
  assert(isObject(torque), `${label} must be an object or null`);
  assertKeys(torque, [], ['valueNm', 'minNm', 'maxNm', 'legacyValue', 'notes'], label);
  for (const key of ['valueNm', 'minNm', 'maxNm']) {
    if (torque[key] !== undefined) assert(Number.isFinite(torque[key]) && torque[key] > 0, `${label} ${key} is invalid`);
  }
  if (torque.legacyValue !== undefined) assert(typeof torque.legacyValue === 'string' && torque.legacyValue.length > 0, `${label} legacyValue is empty`);
  const hasValue = Number.isFinite(torque.valueNm) && torque.valueNm > 0;
  const hasRange = Number.isFinite(torque.minNm) && Number.isFinite(torque.maxNm) && torque.minNm > 0 && torque.minNm <= torque.maxNm;
  const hasLegacy = typeof torque.legacyValue === 'string' && torque.legacyValue.length > 0;
  assert(hasValue || hasRange || hasLegacy, `${label} has no usable torque value`);
  if (torque.notes !== undefined) assert(typeof torque.notes === 'string' && torque.notes.length > 0, `${label} notes are empty`);
}

function validateWheelSize(size, label) {
  assert(isObject(size), `${label} must be an object`);
  assertKeys(size, [], ['diameterIn', 'widthIn', 'position', 'offset', 'legacyValue', 'notes'], label);
  const hasDiameter = Number.isFinite(size.diameterIn) && size.diameterIn > 0;
  const hasLegacy = typeof size.legacyValue === 'string' && size.legacyValue.length > 0;
  assert(hasDiameter || hasLegacy, `${label} requires diameterIn or legacyValue`);
  if (size.diameterIn !== undefined) assert(Number.isFinite(size.diameterIn) && size.diameterIn > 0, `${label} diameterIn is invalid`);
  if (size.legacyValue !== undefined) assert(typeof size.legacyValue === 'string' && size.legacyValue.length > 0, `${label} legacyValue is empty`);
  if (size.widthIn !== undefined) assert(Number.isFinite(size.widthIn) && size.widthIn > 0, `${label} widthIn is invalid`);
  if (size.position !== undefined) assert(['all', 'front', 'rear'].includes(size.position), `${label} position is invalid`);
  if (size.offset !== undefined) validateOffset(size.offset, `${label}.offset`);
  if (size.notes !== undefined) assert(typeof size.notes === 'string' && size.notes.length > 0, `${label} notes are empty`);
}

function validateTireSize(size, label) {
  assert(isObject(size), `${label} must be an object`);
  assertKeys(size, ['size'], ['position', 'notes'], label);
  assert(typeof size.size === 'string' && size.size.length > 0, `${label} size is empty`);
  if (size.position !== undefined) assert(['all', 'front', 'rear'].includes(size.position), `${label} position is invalid`);
  if (size.notes !== undefined) assert(typeof size.notes === 'string' && size.notes.length > 0, `${label} notes are empty`);
}

function validateNote(note, label) {
  assert(isObject(note), `${label} must be an object`);
  assertKeys(note, ['language', 'text'], [], label);
  assert(['en', 'es', 'fr', 'de'].includes(note.language), `${label} language is invalid`);
  assert(typeof note.text === 'string' && note.text.length > 0, `${label} text is empty`);
}

function validateRecord(record, index) {
  const label = `records[${index}]`;
  const required = [
    'id', 'maker', 'makerSlug', 'model', 'modelSlug', 'generation', 'years', 'market',
    'boltPattern', 'centerBore', 'fastenerType', 'threadSize', 'offset', 'torque',
    'wheelSizes', 'tireSizes', 'notes', 'sources', 'verificationStatus', 'lastVerifiedAt'
  ];
  assert(isObject(record), `${label} must be an object`);
  assertKeys(record, required, ['legacyYears', 'legacyMarket', 'legacyPageVariants'], label);

  assert(slugPattern.test(record.id), `${label} id is not a slug`);
  for (const key of ['maker', 'model', 'generation', 'threadSize']) {
    assert(typeof record[key] === 'string' && record[key].length > 0, `${label} ${key} is empty`);
  }
  assert(slugPattern.test(record.makerSlug), `${label} makerSlug is invalid`);
  assert(slugPattern.test(record.modelSlug), `${label} modelSlug is invalid`);

  assert(Array.isArray(record.years) && record.years.length > 0, `${label} years must not be empty`);
  for (const [yearIndex, interval] of record.years.entries()) {
    assertKeys(interval, ['from', 'to'], [], `${label}.years[${yearIndex}]`);
    assert(Number.isInteger(interval.from) && Number.isInteger(interval.to), `${label} year bounds must be integers`);
    assert(interval.from >= 1886 && interval.to <= 2100 && interval.from <= interval.to, `${label} year interval is invalid`);
  }
  if (record.legacyYears !== undefined) assert(typeof record.legacyYears === 'string' && record.legacyYears.length > 0, `${label} legacyYears is empty`);

  assert(Array.isArray(record.market) && record.market.length > 0, `${label} market must not be empty`);
  assert(record.market.every((market) => allowedMarkets.has(market)), `${label} market contains an invalid value`);
  assert(new Set(record.market).size === record.market.length, `${label} market contains duplicates`);
  if (record.legacyMarket !== undefined) assert(typeof record.legacyMarket === 'string' && record.legacyMarket.length > 0, `${label} legacyMarket is empty`);
  if (record.legacyPageVariants !== undefined) {
    assert(Array.isArray(record.legacyPageVariants) && record.legacyPageVariants.length > 0, `${label} legacyPageVariants must not be empty`);
    record.legacyPageVariants.forEach((variant, variantIndex) => {
      const variantLabel = `${label}.legacyPageVariants[${variantIndex}]`;
      assertKeys(variant, ['path', 'generation', 'years', 'market'], [], variantLabel);
      assert(/^pcd\/.+\.html$/.test(variant.path), `${variantLabel} path is invalid`);
      assert(typeof variant.generation === 'string' && variant.generation.length > 0, `${variantLabel} generation is empty`);
      assert(Array.isArray(variant.years) && variant.years.length > 0, `${variantLabel} years must not be empty`);
      variant.years.forEach((interval) => {
        assertKeys(interval, ['from', 'to'], [], `${variantLabel}.years`);
        assert(Number.isInteger(interval.from) && Number.isInteger(interval.to), `${variantLabel} year bounds must be integers`);
        assert(interval.from >= 1886 && interval.to <= 2100 && interval.from <= interval.to, `${variantLabel} year interval is invalid`);
      });
      assert(Array.isArray(variant.market) && variant.market.length > 0, `${variantLabel} market must not be empty`);
      assert(variant.market.every((market) => allowedMarkets.has(market)), `${variantLabel} market contains an invalid value`);
      assert(new Set(variant.market).size === variant.market.length, `${variantLabel} market contains duplicates`);
    });
  }

  assertKeys(record.boltPattern, ['holes', 'diameterMm'], [], `${label}.boltPattern`);
  assert(Number.isInteger(record.boltPattern.holes) && record.boltPattern.holes >= 3 && record.boltPattern.holes <= 10, `${label} bolt holes are invalid`);
  assert(Number.isFinite(record.boltPattern.diameterMm) && record.boltPattern.diameterMm > 0, `${label} PCD diameter is invalid`);
  assert(Number.isFinite(record.centerBore) && record.centerBore > 0, `${label} centerBore is invalid`);
  assert(allowedFasteners.has(record.fastenerType), `${label} fastenerType is invalid`);
  validateOffset(record.offset, `${label}.offset`);

  validateTorque(record.torque, `${label}.torque`);
  assert(Array.isArray(record.wheelSizes), `${label} wheelSizes must be an array`);
  record.wheelSizes.forEach((size, sizeIndex) => validateWheelSize(size, `${label}.wheelSizes[${sizeIndex}]`));
  assert(Array.isArray(record.tireSizes), `${label} tireSizes must be an array`);
  record.tireSizes.forEach((size, sizeIndex) => validateTireSize(size, `${label}.tireSizes[${sizeIndex}]`));
  assert(Array.isArray(record.notes), `${label} notes must be an array`);
  record.notes.forEach((note, noteIndex) => validateNote(note, `${label}.notes[${noteIndex}]`));
  assert(Array.isArray(record.sources), `${label} sources must be an array`);
  record.sources.forEach((source, sourceIndex) => validateSource(source, `${label}.sources[${sourceIndex}]`));

  assert(allowedStatuses.has(record.verificationStatus), `${label} verificationStatus is invalid`);
  if (record.verificationStatus === 'legacyPending') {
    assert(record.lastVerifiedAt === null || validDate(record.lastVerifiedAt), `${label} lastVerifiedAt is invalid`);
  } else {
    assert(record.sources.length > 0, `${label} ${record.verificationStatus} requires sources`);
    assert(typeof record.lastVerifiedAt === 'string' && validDate(record.lastVerifiedAt), `${label} ${record.verificationStatus} requires lastVerifiedAt`);
  }
}

export function loadPcdSource() {
  return JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
}

export function validatePcdData(data) {
  assert(isObject(data), 'PCD source must be an object');
  assertKeys(data, ['schemaVersion', 'records'], ['$schema'], 'PCD source');
  assert(data.schemaVersion === 1, 'PCD schemaVersion must be 1');
  assert(Array.isArray(data.records), 'PCD records must be an array');

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'PCD schema must use JSON Schema 2020-12');
  assert(schema.$defs?.vehicle, 'PCD schema is missing the vehicle definition');

  const ids = new Set();
  const makerNamesBySlug = new Map();
  const makerSlugsByName = new Map();
  const modelNamesBySlug = new Map();
  const modelSlugsByName = new Map();

  data.records.forEach((record, index) => {
    validateRecord(record, index);
    assert(!ids.has(record.id), `Duplicate PCD id: ${record.id}`);
    ids.add(record.id);

    const priorMakerName = makerNamesBySlug.get(record.makerSlug);
    assert(!priorMakerName || priorMakerName === record.maker, `makerSlug ${record.makerSlug} maps to multiple makers`);
    makerNamesBySlug.set(record.makerSlug, record.maker);
    const priorMakerSlug = makerSlugsByName.get(record.maker);
    assert(!priorMakerSlug || priorMakerSlug === record.makerSlug, `Maker ${record.maker} maps to multiple slugs`);
    makerSlugsByName.set(record.maker, record.makerSlug);

    const modelScope = `${record.makerSlug}/${record.modelSlug}`;
    const modelNameScope = `${record.makerSlug}/${record.model}`;
    const priorModelName = modelNamesBySlug.get(modelScope);
    assert(!priorModelName || priorModelName === record.model, `modelSlug ${modelScope} maps to multiple models`);
    modelNamesBySlug.set(modelScope, record.model);
    const priorModelSlug = modelSlugsByName.get(modelNameScope);
    assert(!priorModelSlug || priorModelSlug === record.modelSlug, `Model ${modelNameScope} maps to multiple slugs`);
    modelSlugsByName.set(modelNameScope, record.modelSlug);
  });

  return {
    records: data.records.length,
    makers: makerNamesBySlug.size,
    models: modelNamesBySlug.size,
    statuses: data.records.reduce((counts, record) => {
      counts[record.verificationStatus] = (counts[record.verificationStatus] || 0) + 1;
      return counts;
    }, {})
  };
}

function main() {
  const summary = validatePcdData(loadPcdSource());
  console.log(`PCD data validation passed: ${summary.records} records, ${summary.makers} makers, ${summary.models} models.`);
  console.log(`Verification states: ${Object.entries(summary.statuses).map(([status, count]) => `${status}=${count}`).join(', ')}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
