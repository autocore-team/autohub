import { strict as assert } from 'node:assert';
import { verificationPolicyErrors } from './verification-policy.mjs';

const basePerformance = {
  powerKw: {
    min: 100,
    max: 120,
    rpm: {
      min: 5800,
      max: 6200
    }
  },
  torqueNm: {
    min: 180,
    max: 210,
    rpm: {
      min: 3500,
      max: 4200
    }
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function source(overrides = {}, options = {}) {
  const item = {
    type: 'technicalReference',
    title: 'Reference Engine Handbook',
    publisher: 'Reference Data One',
    year: 2024,
    url: 'https://reference-one.example/engine/x20',
    page: 12,
    checkedAt: '2026-08-29',
    fields: ['performance.powerKw', 'performance.torqueNm', 'code'],
    pageNotes: [
      'The page links engine code X20 to the listed power and torque range boundaries.'
    ],
    ...overrides
  };
  if (options.omitPageNotes) delete item.pageNotes;
  return item;
}

function record(status, sources, options = {}) {
  const item = {
    performance: clone(basePerformance),
    verification: {
      status,
      sources
    }
  };
  if (options.omitPerformance) delete item.performance;
  if (options.omitSources) delete item.verification.sources;
  return item;
}

function corroboratedRecord(sources) {
  return record('corroborated', sources);
}

function verifiedRecord(sources) {
  return record('verified', sources);
}

function expectPass(name, fixture) {
  const errors = verificationPolicyErrors(fixture, name);
  assert.deepEqual(errors, [], `${name} should pass, got:\n${errors.join('\n')}`);
  console.log(`PASS ${name}`);
}

function expectFail(name, fixture, expectedErrorPart) {
  const errors = verificationPolicyErrors(fixture, name);
  assert.notEqual(errors.length, 0, `${name} should fail.`);
  assert(
    errors.some((error) => error.includes(expectedErrorPart)),
    `${name} should include "${expectedErrorPart}", got:\n${errors.join('\n')}`
  );
  console.log(`PASS ${name}`);
}

const independentSourceA = source();
const independentSourceB = source({
  title: 'Independent Engine Data Manual',
  publisher: 'Independent Data Two',
  url: 'https://reference-two.example/specs/x20',
  page: 34,
  pageNotes: [
    'The table identifies X20 and gives the same power and torque range endpoints.'
  ]
});

expectPass(
  'verified official source',
  verifiedRecord([
    source({
      type: 'certificationDocument',
      title: 'Official Certification Data',
      publisher: 'Certification Authority',
      url: 'https://certification.example/documents/x20',
      fields: ['performance.powerKw', 'performance.torqueNm', 'code']
    })
  ])
);

expectPass(
  'corroborated independent technical references',
  corroboratedRecord([independentSourceA, independentSourceB])
);

expectPass(
  'legacyPending without performance or sources',
  record('legacyPending', [], { omitPerformance: true })
);

expectPass(
  'legacyPending without sources property',
  record('legacyPending', undefined, { omitPerformance: true, omitSources: true })
);

expectFail(
  'verified without performance',
  record('verified', [
    source({
      type: 'manufacturer',
      publisher: 'Manufacturer',
      url: 'https://manufacturer.example/specs/x20'
    })
  ], { omitPerformance: true }),
  'must include performance'
);

expectFail(
  'corroborated without performance',
  record('corroborated', [independentSourceA, independentSourceB], { omitPerformance: true }),
  'must include performance'
);

expectFail(
  'corroborated with one source',
  corroboratedRecord([independentSourceA]),
  'at least two sources'
);

expectFail(
  'corroborated with same normalized publisher',
  corroboratedRecord([
    source({ publisher: 'Reference Data One', url: 'https://reference-one.example/a' }),
    source({ publisher: ' reference   data one ', url: 'https://reference-two.example/b' })
  ]),
  'independent publishers'
);

expectFail(
  'corroborated with same normalized domain',
  corroboratedRecord([
    source({ publisher: 'Reference Data One', url: 'https://reference-one.example/a' }),
    source({ publisher: 'Reference Data Two', url: 'https://www.reference-one.example/b' })
  ]),
  'independent domains'
);

expectFail(
  'corroborated source without performance.powerKw',
  corroboratedRecord([
    source({ fields: ['performance.torqueNm', 'code'] }),
    independentSourceB
  ]),
  'performance.powerKw'
);

expectFail(
  'corroborated source without performance.torqueNm',
  corroboratedRecord([
    source({ fields: ['performance.powerKw', 'code'] }),
    independentSourceB
  ]),
  'performance.torqueNm'
);

expectFail(
  'corroborated source without code or aliases',
  corroboratedRecord([
    source({ fields: ['performance.powerKw', 'performance.torqueNm'] }),
    independentSourceB
  ]),
  'code or aliases'
);

expectFail(
  'corroborated source without pageNotes',
  corroboratedRecord([
    source({}, { omitPageNotes: true }),
    independentSourceB
  ]),
  'pageNotes'
);

expectFail(
  'corroborated with manufacturer source',
  corroboratedRecord([
    source({ type: 'manufacturer' }),
    independentSourceB
  ]),
  'technicalReference'
);

expectFail(
  'legacyPending with performance',
  record('legacyPending', []),
  'must not include performance'
);

expectFail(
  'verified without official source type',
  verifiedRecord([independentSourceA]),
  'official source'
);

expectFail(
  'verified official source without full coverage',
  verifiedRecord([
    source({
      type: 'manufacturer',
      publisher: 'Manufacturer',
      url: 'https://manufacturer.example/specs/x20',
      fields: ['performance.powerKw', 'performance.torqueNm']
    })
  ]),
  'code or aliases'
);

console.log('Verification policy fixture tests passed: 17 cases.');
