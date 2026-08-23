import {
  LANGUAGES,
  LEGACY_CANONICAL_PATH,
  REGIONS,
  SOURCE_SCHEMA_PATH,
  VERIFIED_ENGINE_ID,
  assertCondition,
  formatCounts,
  readSourceData,
  readText,
  sourceRegionFilePath
} from './lib.mjs';

export function validateEngineData(sourceData = readSourceData()) {
  const records = sourceData.records || [];
  const errors = [];

  const requiredStringFields = [
    'id',
    'code',
    'maker',
    'regionKey',
    'years',
    'displacement',
    'layout',
    'fuelKey',
    'aspirationKey',
    'injectionKey',
    'blockKey',
    'timingKey',
    'consumption',
    'declaredLifeKey',
    'typicalLife',
    'oilRecord',
    'statusKey'
  ];

  try {
    JSON.parse(readText(SOURCE_SCHEMA_PATH));
  } catch (error) {
    errors.push(`schema.json must exist and be valid JSON: ${error.message}`);
  }

  try {
    readText(LEGACY_CANONICAL_PATH);
    errors.push('data/engines/canonical.json must not exist; source data lives in data/engines/source/regions/*.json.');
  } catch (error) {
    if (error.code !== 'ENOENT') errors.push(`Unable to check legacy canonical path: ${error.message}`);
  }

  assertCondition(Array.isArray(sourceData.regionFiles), 'sourceData.regionFiles must be an array.', errors);
  assertCondition(Array.isArray(records), 'records must be an array.', errors);
  assertCondition(records.length === 100, `records must contain 100 entries, got ${records.length}.`, errors);

  for (const [regionIndex, region] of REGIONS.entries()) {
    const sourceFile = sourceData.regionFiles?.[regionIndex];
    const sourceLabel = sourceRegionFilePath(region);
    assertCondition(sourceFile?.schemaVersion === 1, `${sourceLabel}: schemaVersion must be 1.`, errors);
    assertCondition(sourceFile?.region === region, `${sourceLabel}: region must be ${region}.`, errors);
    assertCondition(Array.isArray(sourceFile?.records), `${sourceLabel}: records must be an array.`, errors);
    assertCondition((sourceFile?.records || []).length === 25, `${sourceLabel}: expected 25 records, got ${(sourceFile?.records || []).length}.`, errors);
    for (const record of sourceFile?.records || []) {
      assertCondition(record.regionKey === region, `${sourceLabel}: ${record.id || 'record'} has regionKey ${record.regionKey}.`, errors);
    }
  }

  function validateRange(range, label) {
    assertCondition(range && typeof range === 'object' && !Array.isArray(range), `${label} must be an object.`, errors);
    if (!range || typeof range !== 'object') return;
    assertCondition(typeof range.min === 'number' && Number.isFinite(range.min), `${label}.min must be a finite number.`, errors);
    assertCondition(typeof range.max === 'number' && Number.isFinite(range.max), `${label}.max must be a finite number.`, errors);
    if (typeof range.min === 'number' && typeof range.max === 'number') {
      assertCondition(range.min <= range.max, `${label}.min must be <= max.`, errors);
    }
    if (Object.hasOwn(range, 'rpm')) validateRange(range.rpm, `${label}.rpm`);
  }

  const ids = new Set();
  for (const [index, record] of records.entries()) {
    const label = record?.id || `record at index ${index}`;
    assertCondition(record && typeof record === 'object' && !Array.isArray(record), `${label}: record must be an object.`, errors);
    if (!record || typeof record !== 'object') continue;

    for (const field of requiredStringFields) {
      assertCondition(typeof record[field] === 'string', `${label}: ${field} must be a string.`, errors);
    }

    assertCondition(REGIONS.includes(record.regionKey), `${label}: unknown regionKey ${record.regionKey}.`, errors);
    assertCondition(!ids.has(record.id), `${label}: duplicate id.`, errors);
    ids.add(record.id);

    for (const arrayField of ['aliases', 'applications']) {
      assertCondition(Array.isArray(record[arrayField]), `${label}: ${arrayField} must be an array.`, errors);
      if (Array.isArray(record[arrayField])) {
        record[arrayField].forEach((value, valueIndex) => {
          assertCondition(typeof value === 'string', `${label}: ${arrayField}[${valueIndex}] must be a string.`, errors);
        });
      }
    }

    assertCondition(record.text && typeof record.text === 'object', `${label}: text must be an object.`, errors);
    for (const lang of LANGUAGES) {
      const localized = record.text?.[lang];
      assertCondition(localized && typeof localized === 'object', `${label}: missing text.${lang}.`, errors);
      for (const textField of ['construction', 'issues', 'pros', 'cons']) {
        assertCondition(typeof localized?.[textField] === 'string' && localized[textField].length > 0, `${label}: text.${lang}.${textField} must be a non-empty string.`, errors);
      }
    }

    const verification = record.verification;
    assertCondition(verification && typeof verification === 'object' && !Array.isArray(verification), `${label}: verification must be an object.`, errors);
    assertCondition(['verified', 'legacyPending'].includes(verification?.status), `${label}: verification.status must be verified or legacyPending.`, errors);
    assertCondition(Array.isArray(verification?.sources), `${label}: verification.sources must be an array.`, errors);

    if (Object.hasOwn(record, 'performance')) {
      validateRange(record.performance?.powerKw, `${label}: performance.powerKw`);
      validateRange(record.performance?.torqueNm, `${label}: performance.torqueNm`);
    }

    if (record.id === VERIFIED_ENGINE_ID) {
      assertCondition(verification?.status === 'verified', `${label}: B5202S must be verified.`, errors);
      assertCondition(verification?.sources.length === 1, `${label}: verified source must be present.`, errors);
      const source = verification?.sources?.[0];
      assertCondition(source?.type === 'manufacturer', `${label}: source type must be manufacturer.`, errors);
      assertCondition(source?.title === 'Volvo S70 Specifications 1997', `${label}: source title must match Volvo S70 Specifications 1997.`, errors);
      assertCondition(source?.publisher === 'Volvo Car Corporation', `${label}: source publisher must be Volvo Car Corporation.`, errors);
      assertCondition(source?.year === 1997, `${label}: source year must be 1997.`, errors);
      assertCondition(source?.url === 'https://www.volvoclub.org.uk/tech/S70Specifications1997.pdf', `${label}: source URL must match the Volvo S70 Specifications 1997 PDF.`, errors);
      assertCondition(source?.page === 2, `${label}: source page must be 2.`, errors);
      assertCondition(source?.checkedAt === '2026-08-22', `${label}: source checkedAt must be 2026-08-22.`, errors);
      assertCondition(Array.isArray(source?.fields), `${label}: source fields must be an array.`, errors);
      assertCondition(source?.fields?.includes('performance.powerKw'), `${label}: source must link performance.powerKw.`, errors);
      assertCondition(source?.fields?.includes('performance.torqueNm'), `${label}: source must link performance.torqueNm.`, errors);
      assertCondition(record.performance?.powerKw?.min === 93 && record.performance?.powerKw?.max === 93, `${label}: verified power must be 93 kW.`, errors);
      assertCondition(record.performance?.powerKw?.rpm?.min === 6250 && record.performance?.powerKw?.rpm?.max === 6250, `${label}: verified power rpm must be 6250.`, errors);
      assertCondition(record.performance?.torqueNm?.min === 170 && record.performance?.torqueNm?.max === 170, `${label}: verified torque must be 170 Nm.`, errors);
      assertCondition(record.performance?.torqueNm?.rpm?.min === 4800 && record.performance?.torqueNm?.rpm?.max === 4800, `${label}: verified torque rpm must be 4800.`, errors);
    } else {
      assertCondition(verification?.status === 'legacyPending', `${label}: unverified legacy records must be legacyPending.`, errors);
      assertCondition(!Object.hasOwn(record, 'performance'), `${label}: no new performance characteristics are allowed before verification.`, errors);
      assertCondition(verification?.sources.length === 0, `${label}: legacyPending records must not claim sources.`, errors);
    }
  }

  const counts = formatCounts(records);
  for (const region of REGIONS) {
    assertCondition(counts[region] === 25, `${region}: expected 25 records, got ${counts[region]}.`, errors);
  }

  return { errors, counts, records };
}

const { errors, counts, records } = validateEngineData();

if (errors.length) {
  console.error('Engine data validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const verifiedCount = records.filter((record) => record.verification.status === 'verified').length;
const pendingCount = records.filter((record) => record.verification.status === 'legacyPending').length;
console.log(`Engine data validation passed: ${records.length} records.`);
console.log(`Region counts: ${REGIONS.map((region) => `${region}=${counts[region]}`).join(', ')}.`);
console.log(`Verification states: verified=${verifiedCount}, legacyPending=${pendingCount}.`);
console.log('B5202S source: Volvo S70 Specifications 1997 (manufacturer, checked 2026-08-22), page 2.');
