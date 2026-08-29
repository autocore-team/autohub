import { strict as assert } from 'node:assert';
import { legacyRecordsAreComparable } from './legacy-identity-migration-policy.mjs';

const BEFORE_FIELDS = ['performance.powerKw', 'performance.torqueNm'];
const AFTER_FIELDS = ['performance.powerKw', 'performance.torqueNm', 'code'];

const MIGRATIONS = {
  volvo: {
    id: 'volvo-b5202s',
    sourceIndex: 0,
    title: 'Volvo S70 Specifications 1997',
    url: 'https://www.volvoclub.org.uk/tech/S70Specifications1997.pdf'
  },
  bmw: {
    id: 'bmw-m54',
    sourceIndex: 1,
    title: 'Tre nuovi sei cilindri e restyling estetico per la Serie 5 del 2001',
    url: 'https://www.press.bmwgroup.com/italy/article/detail/T0020000IT/tre-nuovi-sei-cilindri-e-restyling-estetico-per-la-serie-5-del-2001?language=it'
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fillerSource(index) {
  return {
    type: 'technicalReference',
    title: `Unchanged Fixture Source ${index}`,
    publisher: `Fixture Publisher ${index}`,
    year: 2026,
    url: `https://example.test/source-${index}`,
    checkedAt: '2026-08-29',
    fields: ['notes'],
    pageNotes: ['Unchanged fixture source.']
  };
}

function targetSource(migration, fields, overrides = {}) {
  return {
    type: 'manufacturer',
    title: migration.title,
    publisher: 'Fixture Official Publisher',
    year: 2026,
    url: migration.url,
    checkedAt: '2026-08-29',
    fields: [...fields],
    pageNotes: ['Fixture source links identity and performance data.'],
    ...overrides
  };
}

function sourcesFor(migration, fields, targetIndex, overrides = {}) {
  const sourceCount = Math.max(migration.sourceIndex, targetIndex) + 1;
  const sources = Array.from({ length: sourceCount }, (_, index) => fillerSource(index));
  sources[targetIndex] = targetSource(migration, fields, overrides);
  return sources;
}

function record(id, sources, overrides = {}) {
  return {
    id,
    maker: 'Fixture Maker',
    regionKey: 'europe',
    code: 'FIXTURE',
    name: 'Fixture engine',
    years: '1997-2001',
    performance: {
      powerKw: { min: 100, max: 110 },
      torqueNm: { min: 180, max: 190 }
    },
    verification: {
      status: 'verified',
      sources
    },
    ...overrides
  };
}

function pairFor(migration, options = {}) {
  const targetIndex = options.targetIndex ?? migration.sourceIndex;
  const legacy = record(
    options.legacyId ?? migration.id,
    sourcesFor(
      migration,
      options.legacyFields ?? BEFORE_FIELDS,
      targetIndex,
      options.legacySourceOverrides
    ),
    options.legacyRecordOverrides
  );
  const current = record(
    options.currentId ?? migration.id,
    sourcesFor(
      migration,
      options.currentFields ?? AFTER_FIELDS,
      targetIndex,
      options.currentSourceOverrides
    ),
    options.currentRecordOverrides
  );
  return { current, legacy };
}

function expectComparable(name, current, legacy) {
  assert.equal(legacyRecordsAreComparable(current, legacy), true, `${name} should be allowed.`);
  console.log(`PASS ${name}`);
}

function expectRejected(name, current, legacy) {
  assert.equal(legacyRecordsAreComparable(current, legacy), false, `${name} should be rejected.`);
  console.log(`PASS ${name}`);
}

for (const migration of [MIGRATIONS.volvo, MIGRATIONS.bmw]) {
  const { current, legacy } = pairFor(migration);
  expectComparable(`${migration.id} exact one-time code migration`, current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    currentFields: [...AFTER_FIELDS, 'code']
  });
  expectRejected('current source with repeated code', current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    legacyFields: AFTER_FIELDS,
    currentFields: [...AFTER_FIELDS, 'code']
  });
  expectRejected('legacy source already containing code', current, legacy);
}

{
  const changedFields = ['performance.powerKw', 'performance.displacementCc'];
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    legacyFields: changedFields,
    currentFields: [...changedFields, 'code']
  });
  expectRejected('non-whitelisted legacy field sequence plus code', current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    currentFields: ['performance.torqueNm', 'performance.powerKw', 'code']
  });
  expectRejected('changed current field order', current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    currentSourceOverrides: { url: 'https://example.test/changed-url' }
  });
  expectRejected('changed migration URL', current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    currentSourceOverrides: { title: 'Changed migration title' }
  });
  expectRejected('changed migration title', current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.bmw, {
    targetIndex: 0
  });
  expectRejected('changed migration sourceIndex', current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    currentSourceOverrides: { publisher: 'Changed Publisher' }
  });
  expectRejected('changed unrelated source property', current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    currentRecordOverrides: { years: '1998-2001' }
  });
  expectRejected('changed unrelated record property', current, legacy);
}

{
  const { current, legacy } = pairFor(MIGRATIONS.volvo, {
    currentId: 'volvo-b5202s-edited'
  });
  expectRejected('changed migration id', current, legacy);
}

assert.deepEqual(BEFORE_FIELDS, ['performance.powerKw', 'performance.torqueNm']);
assert.deepEqual(AFTER_FIELDS, ['performance.powerKw', 'performance.torqueNm', 'code']);
assert.equal(clone(AFTER_FIELDS).filter((field) => field === 'code').length, 1);

console.log('Legacy identity migration policy fixture tests passed: 12 cases.');
