import { canonicalFingerprint } from './lib.mjs';
import { verificationPolicyErrors } from './verification-policy.mjs';

const EXACT_IDENTITY_FIELD_MIGRATIONS = {
  'volvo-b5202s': [
    {
      sourceIndex: 0,
      title: 'Volvo S70 Specifications 1997',
      url: 'https://www.volvoclub.org.uk/tech/S70Specifications1997.pdf',
      beforeFields: ['performance.powerKw', 'performance.torqueNm'],
      afterFields: ['performance.powerKw', 'performance.torqueNm', 'code']
    }
  ],
  'bmw-m54': [
    {
      sourceIndex: 1,
      title: 'Tre nuovi sei cilindri e restyling estetico per la Serie 5 del 2001',
      url: 'https://www.press.bmwgroup.com/italy/article/detail/T0020000IT/tre-nuovi-sei-cilindri-e-restyling-estetico-per-la-serie-5-del-2001?language=it',
      beforeFields: ['performance.powerKw', 'performance.torqueNm'],
      afterFields: ['performance.powerKw', 'performance.torqueNm', 'code']
    }
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function arraysEqual(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function countField(fields, field) {
  return Array.isArray(fields) ? fields.filter((value) => value === field).length : 0;
}

function passesVerificationPolicy(record) {
  return verificationPolicyErrors(record).length === 0;
}

function isFirstVerifiedPerformanceAddition(currentRecord, legacyRecord) {
  return legacyRecord.verification?.status === 'legacyPending'
    && ['verified', 'corroborated'].includes(currentRecord.verification?.status)
    && !Object.hasOwn(legacyRecord, 'performance')
    && Object.hasOwn(currentRecord, 'performance')
    && passesVerificationPolicy(currentRecord);
}

function applyExactIdentityFieldMigrations(currentComparable, legacyComparable) {
  if (currentComparable.verification?.status !== 'verified' || legacyComparable.verification?.status !== 'verified') return;
  if (currentComparable.id !== legacyComparable.id) return;

  const migrations = EXACT_IDENTITY_FIELD_MIGRATIONS[currentComparable.id] || [];
  for (const migration of migrations) {
    const currentSource = currentComparable.verification?.sources?.[migration.sourceIndex];
    const legacySource = legacyComparable.verification?.sources?.[migration.sourceIndex];
    if (currentSource?.title !== migration.title || legacySource?.title !== migration.title) continue;
    if (currentSource?.url !== migration.url || legacySource?.url !== migration.url) continue;
    if (!arraysEqual(legacySource?.fields, migration.beforeFields)) continue;
    if (!arraysEqual(currentSource?.fields, migration.afterFields)) continue;
    if (legacySource.fields.includes('code')) continue;
    if (countField(currentSource.fields, 'code') !== 1) continue;
    legacySource.fields = [...migration.afterFields];
  }
}

export function comparableLegacyRecords(currentRecord, legacyRecord) {
  const currentComparable = clone(currentRecord);
  const legacyComparable = clone(legacyRecord);
  if (isFirstVerifiedPerformanceAddition(currentRecord, legacyRecord)) {
    delete currentComparable.performance;
    delete currentComparable.verification;
    delete legacyComparable.verification;
  } else {
    applyExactIdentityFieldMigrations(currentComparable, legacyComparable);
  }
  return { currentComparable, legacyComparable };
}

export function legacyRecordsAreComparable(currentRecord, legacyRecord) {
  const { currentComparable, legacyComparable } = comparableLegacyRecords(currentRecord, legacyRecord);
  return canonicalFingerprint(currentComparable) === canonicalFingerprint(legacyComparable);
}
