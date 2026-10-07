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

let passedCases = 0;

function expectPass(name, fixture) {
  const errors = verificationPolicyErrors(fixture);
  assert.deepEqual(errors, [], `${name} should pass, got:\n${errors.join('\n')}`);
  passedCases += 1;
  console.log(`PASS ${name}`);
}

function expectFail(name, fixture, expectedErrorPart) {
  const errors = verificationPolicyErrors(fixture);
  assert.notEqual(errors.length, 0, `${name} should fail.`);
  assert(
    errors.some((error) => error.includes(expectedErrorPart)),
    `${name} should include "${expectedErrorPart}", got:\n${errors.join('\n')}`
  );
  passedCases += 1;
  console.log(`PASS ${name}`);
}

const strictScope = {
  level: 'exactVariant',
  codes: ['X20A'],
  applications: ['Example Model'],
  years: { from: 2010, to: 2015 },
  markets: ['EU']
};

const strictRecordScope = {
  applications: ['Example Model'],
  years: { from: 2012, to: 2014 },
  markets: ['EU']
};

function scoped(overrides = {}) {
  return { ...clone(strictScope), ...overrides };
}

function bridgedScope(overrides = {}) {
  const result = scoped(overrides);
  delete result.codes;
  return result;
}

function officialSource(id, fields, overrides = {}) {
  return source({
    id,
    type: 'manufacturer',
    publisher: 'Example Manufacturer',
    url: `https://manufacturer.example/documents/${id}`,
    fields,
    scope: clone(strictScope),
    pageNotes: [
      'The cited page documents the declared fields for X20A and explicitly includes the Example Model scope.'
    ],
    ...overrides
  });
}

function strictVerifiedRecord(sources, sourceRefs = sources.map((item) => item.id)) {
  return {
    id: 'example-x20a',
    code: 'X20A',
    aliases: ['Example 2.0'],
    maker: 'Example Motors',
    years: '2012-2014',
    displacement: '2.0 L',
    layout: 'I4 · DOHC · 16V',
    fuelKey: 'petrol',
    aspirationKey: 'turbocharged',
    injectionKey: 'directInjection',
    applications: ['Example Model'],
    performance: clone(basePerformance),
    verification: {
      status: 'verified',
      sources,
      sourceRefs,
      scope: clone(strictRecordScope)
    }
  };
}

function strictSources() {
  return [
    officialSource('identity-document', [
      'maker',
      'code',
      'applications',
      'years'
    ]),
    officialSource('technical-specification', [
      'displacement',
      'layout',
      'fuelKey',
      'aspirationKey',
      'injectionKey',
      'code'
    ], {
      type: 'serviceDocumentation',
      scope: scoped({
        level: 'family',
        codes: ['X20A', 'X20B'],
        applications: ['Example Model', 'Example Utility'],
        years: { from: 2008, to: 2020 },
        markets: ['Global']
      })
    }),
    officialSource('performance-certificate', [
      'performance.powerKw',
      'performance.powerKw.rpm',
      'performance.torqueNm',
      'performance.torqueNm.rpm'
    ], {
      type: 'certificationDocument',
      identityBindingRef: 'identity-document',
      scope: bridgedScope({ years: { from: 2012, to: 2014 } })
    })
  ];
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

expectPass(
  'verified strict multi-source with different compatible scopes',
  strictVerifiedRecord(strictSources())
);

{
  const sources = strictSources();
  sources[0].type = 'serviceDocumentation';
  sources[0].title = 'Official Parts and Service Application Guide';
  sources[2].type = 'manufacturer';
  sources[2].title = 'Official Model Brochure';
  expectPass(
    'future batch service identity plus manufacturer brochure performance',
    strictVerifiedRecord(sources)
  );
}

{
  const sources = [
    officialSource('manufacturer-model-page', [
      'maker', 'code', 'applications', 'years', 'displacement', 'layout',
      'fuelKey', 'aspirationKey', 'injectionKey'
    ]),
    officialSource('certification-document', [
      'performance.powerKw', 'performance.powerKw.rpm',
      'performance.torqueNm', 'performance.torqueNm.rpm'
    ], {
      type: 'certificationDocument',
      identityBindingRef: 'manufacturer-model-page',
      scope: bridgedScope({ years: { from: 2011, to: 2016 }, markets: ['Global'] })
    })
  ];
  expectPass(
    'future batch manufacturer model page plus certification document',
    strictVerifiedRecord(sources)
  );
}

{
  const sources = [
    officialSource('identity-and-construction', [
      'maker', 'code', 'applications', 'years', 'displacement', 'layout', 'fuelKey'
    ]),
    officialSource('aspiration-document', ['aspirationKey'], {
      type: 'manufacturer',
      identityBindingRef: 'identity-and-construction',
      scope: bridgedScope({ years: { from: 2009, to: 2018 }, markets: ['Global'] })
    }),
    officialSource('injection-document', ['injectionKey'], {
      identityBindingRef: 'identity-and-construction',
      scope: bridgedScope({ years: { from: 2010, to: 2014 } })
    }),
    officialSource('performance-document', [
      'performance.powerKw', 'performance.powerKw.rpm',
      'performance.torqueNm', 'performance.torqueNm.rpm'
    ], {
      type: 'certificationDocument',
      identityBindingRef: 'identity-and-construction',
      scope: bridgedScope({ years: { from: 2012, to: 2014 } })
    })
  ];
  expectPass(
    'future batch separate aspiration injection and performance documents',
    strictVerifiedRecord(sources)
  );
}

{
  const sources = strictSources();
  sources.forEach((item) => { item.scope.markets = ['Global']; });
  expectPass(
    'global official source scopes cover regional record market',
    strictVerifiedRecord(sources)
  );
}

{
  const sources = strictSources();
  delete sources[2].identityBindingRef;
  sources[2].scope = scoped({ years: { from: 2012, to: 2014 } });
  sources[2].fields.push('code');
  expectPass(
    'direct-code supplemental performance without identity bridge',
    strictVerifiedRecord(sources)
  );
}

{
  const sources = strictSources();
  sources[0].fields = ['maker', 'aliases', 'applications', 'years'];
  expectFail(
    'strict coverage without official exact code binding',
    strictVerifiedRecord(sources),
    'exact code, applications and years identity binding'
  );
}

{
  const sources = strictSources();
  sources[1].fields = sources[1].fields.filter((field) => field !== 'injectionKey');
  expectFail(
    'strict coverage missing one required field',
    strictVerifiedRecord(sources),
    'example-x20a: verified field injectionKey is uncovered'
  );
}

{
  const sources = strictSources();
  delete sources[2].identityBindingRef;
  expectFail(
    'supplemental brochure without code or identityBindingRef',
    strictVerifiedRecord(sources),
    'must use exactly one evidence path: scope.codes or identityBindingRef'
  );
}

{
  const sources = strictSources();
  sources[2].identityBindingRef = 'missing-identity';
  expectFail(
    'identityBindingRef points to unknown source',
    strictVerifiedRecord(sources),
    'identityBindingRef missing-identity does not resolve'
  );
}

{
  const sources = strictSources();
  sources[2].identityBindingRef = 'technical-specification';
  expectFail(
    'identityBindingRef points to family source',
    strictVerifiedRecord(sources),
    'identityBindingRef technical-specification does not point to an exactVariant source'
  );
}

{
  const sources = strictSources();
  sources[1].scope.level = 'aggregate';
  sources[2].identityBindingRef = 'technical-specification';
  expectFail(
    'identityBindingRef points to aggregate source',
    strictVerifiedRecord(sources),
    'identityBindingRef technical-specification does not point to an exactVariant source'
  );
}

{
  const sources = strictSources();
  sources.push(officialSource('bridged-aspiration', ['aspirationKey'], {
    identityBindingRef: 'identity-document',
    scope: bridgedScope()
  }));
  sources[2].identityBindingRef = 'bridged-aspiration';
  expectFail(
    'identityBindingRef points to supplemental source chain',
    strictVerifiedRecord(sources),
    'points to a supplemental binding; chains and cycles are not allowed'
  );
}

{
  const sources = strictSources();
  sources.push(officialSource('cycle-a', ['aspirationKey'], {
    identityBindingRef: 'cycle-b',
    scope: bridgedScope()
  }));
  sources.push(officialSource('cycle-b', ['injectionKey'], {
    identityBindingRef: 'cycle-a',
    scope: bridgedScope()
  }));
  expectFail(
    'identity bridge cycle is rejected',
    strictVerifiedRecord(sources),
    'chains and cycles are not allowed'
  );
}

{
  const sources = strictSources();
  sources[2].scope.applications = ['Example Model', 'Example Model Hybrid'];
  expectFail(
    'bridged brochure application is broader than identity application',
    strictVerifiedRecord(sources),
    'application scope does not exactly match identityBindingRef identity-document'
  );
}

{
  const sources = strictSources();
  sources[2].scope.level = 'family';
  expectFail(
    'bridged brochure covers model with multiple engines',
    strictVerifiedRecord(sources),
    'identity-bridge supplemental scope must be exactVariant'
  );
}

{
  const sources = strictSources();
  sources[2].scope.applications = ['Example Model 2.0'];
  expectFail(
    'identity bridge rejects approximate application match',
    strictVerifiedRecord(sources),
    'scope applications do not contain every record application'
  );
}

{
  const sources = strictSources();
  delete sources[2].identityBindingRef;
  sources[2].scope = scoped({ years: { from: 2012, to: 2014 } });
  expectFail(
    'direct supplemental cannot claim code outside declared fields',
    strictVerifiedRecord(sources),
    'direct-code evidence must declare code in fields'
  );
}

{
  const sources = strictSources();
  sources[0].fields = sources[0].fields.filter((field) => field !== 'years');
  expectFail(
    'identity source must declare code applications and years together',
    strictVerifiedRecord(sources),
    'is not an accepted exact identity source declaring code, applications and years'
  );
}

{
  const sources = strictSources();
  sources[2].identityBindingRef = ['identity-document', 'technical-specification'];
  expectFail(
    'supplemental cannot declare multiple contradictory identity bindings',
    strictVerifiedRecord(sources),
    'identityBindingRef must be a non-empty string'
  );
}

{
  const sources = strictSources();
  sources[2].fields = ['performance.powerKw', 'performance.powerKw.rpm'];
  expectFail(
    'strict coverage with power but no torque',
    strictVerifiedRecord(sources),
    'verified field performance.torqueNm is uncovered'
  );
}

{
  const fixture = strictVerifiedRecord(strictSources());
  delete fixture.performance.powerKw.rpm;
  fixture.verification.sources[2].fields = fixture.verification.sources[2].fields.filter((field) => field !== 'performance.powerKw.rpm');
  expectFail(
    'strict coverage with power but no power rpm',
    fixture,
    'missing required field performance.powerKw.rpm'
  );
}

{
  const fixture = strictVerifiedRecord(strictSources());
  delete fixture.performance.torqueNm.rpm;
  fixture.verification.sources[2].fields = fixture.verification.sources[2].fields.filter((field) => field !== 'performance.torqueNm.rpm');
  expectFail(
    'strict coverage with torque but no torque rpm',
    fixture,
    'missing required field performance.torqueNm.rpm'
  );
}

expectFail(
  'strict coverage with unresolved sourceRef',
  strictVerifiedRecord(strictSources(), ['identity-document', 'technical-specification', 'missing-source']),
  'sourceRef missing-source does not resolve'
);

{
  const sources = strictSources();
  sources[2].fields = sources[2].fields.filter((field) => field !== 'performance.torqueNm');
  expectFail(
    'strict source exists without declared torque field',
    strictVerifiedRecord(sources),
    'sourceRefs [identity-document, technical-specification, performance-certificate] do not declare it in fields'
  );
}

{
  const sources = strictSources();
  sources[1].fields = sources[1].fields.filter((field) => field !== 'injectionKey');
  sources.push(officialSource('secondary-injection', ['injectionKey'], { type: 'technicalReference' }));
  expectFail(
    'strict required field covered only by secondary source',
    strictVerifiedRecord(sources),
    'sourceRef secondary-injection is not accepted: type technicalReference'
  );
}

{
  const sources = strictSources();
  sources[1].fields = sources[1].fields.filter((field) => field !== 'injectionKey');
  sources.push(officialSource('aggregator-injection', ['injectionKey'], { type: 'aggregator' }));
  expectFail(
    'strict required field covered only by aggregator',
    strictVerifiedRecord(sources),
    'sourceRef aggregator-injection is not accepted: type aggregator'
  );
}

{
  const sources = strictSources();
  sources[1].fields = sources[1].fields.filter((field) => field !== 'injectionKey');
  sources.push(officialSource('inferred-injection', ['injectionKey'], { type: 'inferred' }));
  expectFail(
    'strict required field covered only by inferred source',
    strictVerifiedRecord(sources),
    'sourceRef inferred-injection is not accepted: type inferred'
  );
}

{
  const sources = strictSources();
  sources[1].scope.codes = ['X20B'];
  expectFail(
    'strict document lists neighboring variant but not target code',
    strictVerifiedRecord(sources),
    'scope codes do not explicitly include exact record code X20A'
  );
}

{
  const sources = strictSources();
  sources[2].scope.applications = ['Other Model'];
  expectFail(
    'strict source application does not include record application',
    strictVerifiedRecord(sources),
    'scope applications do not contain every record application'
  );
}

{
  const sources = strictSources();
  sources[2].scope.markets = ['US'];
  expectFail(
    'strict source market is incompatible',
    strictVerifiedRecord(sources),
    'scope markets do not contain the record market scope'
  );
}

{
  const sources = strictSources();
  sources[2].scope.years = { from: 2013, to: 2015 };
  expectFail(
    'strict source years cover only part of record years',
    strictVerifiedRecord(sources),
    'scope years do not fully contain the record year interval'
  );
}

{
  const sources = strictSources();
  sources[2].scope.years = { from: 2018, to: 2020 };
  expectFail(
    'strict source years do not overlap record years',
    strictVerifiedRecord(sources),
    'scope years do not fully contain the record year interval'
  );
}

{
  const sources = strictSources();
  sources[1].scope.level = 'family';
  sources[1].scope.codes = ['X20B', 'X20C'];
  expectFail(
    'strict family source without exact variant mapping',
    strictVerifiedRecord(sources),
    'scope codes do not explicitly include exact record code X20A'
  );
}

{
  const sources = strictSources();
  sources[2].scope.level = 'aggregate';
  expectFail(
    'strict aggregate performance range',
    strictVerifiedRecord(sources),
    'scope level aggregate is aggregate or unsupported'
  );
}

{
  const fixture = strictVerifiedRecord(strictSources());
  fixture.verification.scope.markets = ['Global'];
  expectFail(
    'global record cannot use only regional source scope',
    fixture,
    'scope markets do not contain the record market scope'
  );
}

{
  const fixture = strictVerifiedRecord(strictSources());
  fixture.years = 'model years 2012 through 2014';
  expectFail(
    'unparseable record year scope is rejected',
    fixture,
    'cannot be parsed safely'
  );
}

{
  const fixture = strictVerifiedRecord(strictSources());
  fixture.verification.scope.years = { from: 2013, to: 2014 };
  expectFail(
    'normalized verification years cannot narrow the record silently',
    fixture,
    'verification.scope.years must exactly describe parsed record years'
  );
}

{
  const fixture = strictVerifiedRecord(strictSources());
  fixture.applications.push('Example Utility');
  expectFail(
    'normalized verification applications cannot omit a record application',
    fixture,
    'verification.scope.applications must exactly describe record applications'
  );
}

{
  const fixture = strictVerifiedRecord(strictSources());
  fixture.verification.scope.markets = ['Global', 'EU'];
  expectFail(
    'global and regional record markets cannot be mixed',
    fixture,
    'Global cannot be combined with regional markets'
  );
}

expectFail(
  'strict empty sourceRefs cannot bypass coverage',
  strictVerifiedRecord(strictSources(), []),
  'requires at least one sourceRef'
);

{
  const sources = strictSources();
  sources[1].fields = [];
  expectFail(
    'strict empty declared fields cannot bypass coverage',
    strictVerifiedRecord(sources),
    'sourceRef technical-specification is not accepted: declared fields coverage is empty'
  );
}

{
  const sources = strictSources();
  sources[1].pageNotes = [];
  expectFail(
    'strict formal source without evidence notes',
    strictVerifiedRecord(sources),
    'pageNotes do not document the exact evidence and scope'
  );
}

{
  const sources = strictSources();
  sources[1].id = 'identity-document';
  expectFail(
    'strict duplicate source registry id',
    strictVerifiedRecord(sources, ['identity-document', 'performance-certificate']),
    'source id identity-document is duplicated'
  );
}

{
  const sources = strictSources();
  delete sources[1].id;
  expectFail(
    'strict source without registry id',
    strictVerifiedRecord(sources, ['identity-document', 'performance-certificate']),
    'must have a unique id'
  );
}

const tieredRequiredFields = [
  'maker', 'code', 'applications', 'years', 'displacement', 'layout',
  'layout.valves', 'layout.camshaftsTotal', 'fuelKey', 'aspirationKey', 'injectionKey',
  'performance.powerKw', 'performance.powerKw.rpm',
  'performance.torqueNm', 'performance.torqueNm.rpm'
];

function tierASource(id, fields = tieredRequiredFields, overrides = {}) {
  return officialSource(id, fields, { evidenceTier: 'A', ...overrides });
}

function tierBBridge(id, fields, publisher, hostname, dataOrigin, overrides = {}) {
  const claims = {};
  if (fields.some((field) => field.startsWith('performance.powerKw'))) claims['performance.powerKw'] = clone(basePerformance.powerKw);
  if (fields.some((field) => field.startsWith('performance.torqueNm'))) claims['performance.torqueNm'] = clone(basePerformance.torqueNm);
  return officialSource(id, fields, {
    type: 'technicalReference',
    publisher,
    url: `https://${hostname}/engines/x20a`,
    evidenceTier: 'B',
    dataOrigin,
    independenceNotes: [`${publisher} maintains its own editorial dataset independently of the other cited publishers.`],
    identityBindingRef: 'tier-a-identity',
    scope: bridgedScope({ years: { from: 2012, to: 2014 } }),
    ...(Object.keys(claims).length ? { claims } : {}),
    ...overrides
  });
}

function tieredRecord(sources, evidenceBasis = 'official') {
  const fixture = strictVerifiedRecord(sources);
  fixture.layout = 'I4 · DOHC · 16 valves · 2 camshafts total';
  fixture.verification.evidenceBasis = evidenceBasis;
  return fixture;
}

expectPass(
  'tiered authoritative government certification source',
  tieredRecord([tierASource('government-certificate', tieredRequiredFields, {
    type: 'certificationDocument',
    publisher: 'National Vehicle Certification Authority',
    url: 'https://certification.gov.example/type-approval/x20a'
  })])
);

expectPass(
  'tiered authoritative identity plus professional supplemental source',
  tieredRecord([
    tierASource('tier-a-identity', ['maker', 'code', 'applications', 'years']),
    tierASource('licensed-professional-specification', tieredRequiredFields.filter((field) => !['maker', 'code', 'applications', 'years'].includes(field)), {
      type: 'technicalReference',
      publisher: 'Licensed Technical Data Press',
      url: 'https://licensed-data.example/x20a/specification',
      authorityNotes: ['The variant table is maintained under a licensed manufacturer-data programme with named editorial responsibility.'],
      identityBindingRef: 'tier-a-identity',
      scope: bridgedScope({ years: { from: 2012, to: 2014 } })
    })
  ])
);

function tierBInjectionFixture() {
  const tierAFields = tieredRequiredFields.filter((field) => field !== 'injectionKey');
  return tieredRecord([
    tierASource('tier-a-identity', tierAFields),
    tierBBridge('tier-b-injection-one', ['injectionKey'], 'Independent Technical Press One', 'press-one.example', 'press-one-original'),
    tierBBridge('tier-b-injection-two', ['injectionKey'], 'Independent Technical Press Two', 'press-two.example', 'press-two-original')
  ], 'corroborated');
}

expectPass('tiered two independent Tier B sources confirm one field', tierBInjectionFixture());

{
  const tierAFields = tieredRequiredFields.filter((field) => !['aspirationKey', 'injectionKey'].includes(field));
  expectPass(
    'tiered independent Tier B pairs cover different fields',
    tieredRecord([
      tierASource('tier-a-identity', tierAFields),
      tierBBridge('tier-b-aspiration-one', ['aspirationKey'], 'Aspiration Data One', 'aspiration-one.example', 'aspiration-one-original'),
      tierBBridge('tier-b-aspiration-two', ['aspirationKey'], 'Aspiration Data Two', 'aspiration-two.example', 'aspiration-two-original'),
      tierBBridge('tier-b-injection-one', ['injectionKey'], 'Injection Data One', 'injection-one.example', 'injection-one-original'),
      tierBBridge('tier-b-injection-two', ['injectionKey'], 'Injection Data Two', 'injection-two.example', 'injection-two-original')
    ], 'corroborated')
  );
}

expectPass('tiered exact identity bridge for Tier B source without code', tierBInjectionFixture());

expectFail(
  'tiered corroborated basis cannot label an all-Tier-A record',
  tieredRecord([tierASource('all-tier-a', tieredRequiredFields)], 'corroborated'),
  'requires at least one mandatory field to rely on two independent Tier B publishers'
);

{
  const fixture = tierBInjectionFixture();
  fixture.verification.sources.pop();
  fixture.verification.sourceRefs.pop();
  expectFail('tiered one Tier B source without corroboration', fixture, 'requires Tier A or two independent Tier B publishers');
}

{
  const fixture = tierBInjectionFixture();
  fixture.verification.sources[2].publisher = fixture.verification.sources[1].publisher;
  expectFail('tiered two URLs from one publisher', fixture, 'requires Tier A or two independent Tier B publishers');
}

{
  const fixture = tierBInjectionFixture();
  fixture.verification.sources[2].scope.applications = ['Other Model'];
  expectFail('tiered Tier B sources describe different variants', fixture, 'scope applications do not contain every record application');
}

{
  const fixture = tierBInjectionFixture();
  fixture.verification.sources[2].scope.markets = ['US'];
  expectFail('tiered Tier B source has a different market', fixture, 'scope markets do not contain the record market scope');
}

{
  const fixture = tierBInjectionFixture();
  fixture.verification.sources[2].scope.years = { from: 2014, to: 2016 };
  expectFail('tiered Tier B source has a different period', fixture, 'scope years do not fully contain the record year interval');
}

{
  const fixture = tieredRecord([tierASource('family-identity', tieredRequiredFields, { scope: scoped({ level: 'family' }) })]);
  expectFail('tiered family-level page cannot establish exact identity', fixture, 'exact code, applications and years identity binding');
}

{
  const tierAFields = tieredRequiredFields.filter((field) => !field.startsWith('performance.'));
  const performanceFields = tieredRequiredFields.filter((field) => field.startsWith('performance.'));
  const fixture = tieredRecord([
    tierASource('tier-a-identity', tierAFields),
    tierBBridge('tier-b-performance-one', performanceFields, 'Performance Press One', 'performance-one.example', 'performance-one-original'),
    tierBBridge('tier-b-performance-two', performanceFields, 'Performance Press Two', 'performance-two.example', 'performance-two-original')
  ], 'corroborated');
  fixture.verification.sources[2].claims['performance.powerKw'].max = 121;
  expectFail('tiered conflicting power or torque is rejected', fixture, 'performance.powerKw claim conflicts');
}

{
  const fields = tieredRequiredFields.filter((field) => !['layout.valves', 'layout.camshaftsTotal'].includes(field));
  expectFail('tiered source omits valve and camshaft-count declarations', tieredRecord([tierASource('missing-construction-counts', fields)]), 'official evidence field layout.valves is not covered');
}

{
  const fields = tieredRequiredFields.filter((field) => field !== 'injectionKey');
  const fixture = tieredRecord([tierASource('notes-without-coverage', fields, {
    pageNotes: ['The prose mentions injection, but the source does not declare injectionKey field coverage.']
  })]);
  expectFail('tiered pageNotes cannot replace declared field coverage', fixture, 'official evidence field injectionKey is not covered');
}

{
  const tierAFields = tieredRequiredFields.filter((field) => field !== 'injectionKey');
  expectFail(
    'tiered Tier C cannot cover a mandatory field',
    tieredRecord([
      tierASource('tier-a-identity', tierAFields),
      officialSource('tier-c-injection', ['injectionKey'], {
        type: 'technicalReference', evidenceTier: 'C', identityBindingRef: 'tier-a-identity',
        scope: bridgedScope({ years: { from: 2012, to: 2014 } })
      })
    ], 'corroborated'),
    'corroborated evidence field injectionKey requires Tier A or two independent Tier B publishers'
  );
}

{
  const fixture = tierBInjectionFixture();
  fixture.verification.sources[2].dataOrigin = fixture.verification.sources[1].dataOrigin;
  expectFail('tiered portals sharing one upstream dataset are not independent', fixture, 'requires Tier A or two independent Tier B publishers');
}

const designationField = 'identity.officialPublicDesignation';

function officialDesignationFixture() {
  const fixture = tieredRecord([tierASource('designation-identity', tieredRequiredFields.map((field) => field === 'code' ? designationField : field))]);
  delete fixture.code;
  fixture.identity = {
    type: 'officialPublicDesignation',
    value: 'EcoBoost 2.3L High Output',
    review: {
      officialPublicationConfirmed: true,
      stableAndDistinct: true,
      genericDescriptionRejected: true,
      materialVariantsSeparated: true,
      notes: ['Ford publishes this literal designation for the exact application and the review separates materially different variants.']
    }
  };
  delete fixture.verification.sources[0].scope.codes;
  fixture.verification.sources[0].scope.designations = [fixture.identity.value];
  return fixture;
}

function corroboratedDesignationFixture({ mixedTierA = false } = {}) {
  const fixture = officialDesignationFixture();
  const identitySource = fixture.verification.sources[0];
  identitySource.id = 'tier-a-identity';
  fixture.verification.sourceRefs[0] = identitySource.id;
  fixture.verification.evidenceBasis = 'corroborated';
  const identityFields = ['maker', designationField, 'applications', 'years'];
  const technicalFields = identitySource.fields.filter((field) => !identityFields.includes(field));
  identitySource.fields = identityFields;

  let tierBFields = technicalFields;
  if (mixedTierA) {
    const tierAFields = technicalFields.filter((field) => !field.startsWith('performance.') && field !== 'injectionKey');
    tierBFields = technicalFields.filter((field) => !tierAFields.includes(field));
    fixture.verification.sources.push(tierASource('tier-a-designation-technical', tierAFields, {
      identityBindingRef: identitySource.id,
      scope: bridgedScope({ years: { from: 2012, to: 2014 } })
    }));
    fixture.verification.sourceRefs.push('tier-a-designation-technical');
  }

  fixture.verification.sources.push(
    tierBBridge('tier-b-designation-one', tierBFields, 'Designation Data One', 'designation-one.example', 'designation-origin-one'),
    tierBBridge('tier-b-designation-two', tierBFields, 'Designation Data Two', 'designation-two.example', 'designation-origin-two')
  );
  fixture.verification.sourceRefs.push('tier-b-designation-one', 'tier-b-designation-two');
  return fixture;
}

expectPass('official public designation with direct exact-variant Tier A evidence', officialDesignationFixture());

expectPass(
  'Tier A designation identity plus independent Tier B technical coverage is corroborated',
  corroboratedDesignationFixture()
);

expectPass(
  'Tier A designation identity plus mixed Tier A and Tier B technical coverage is corroborated',
  corroboratedDesignationFixture({ mixedTierA: true })
);

{
  const fixture = officialDesignationFixture();
  const identityFields = ['maker', designationField, 'applications', 'years'];
  const supplementalFields = fixture.verification.sources[0].fields.filter((field) => !identityFields.includes(field));
  fixture.verification.sources[0].fields = identityFields;
  fixture.verification.sources.push(tierASource('designation-specification', supplementalFields, {
    identityBindingRef: 'designation-identity',
    scope: bridgedScope({ years: { from: 2012, to: 2014 } })
  }));
  fixture.verification.sourceRefs.push('designation-specification');
  expectPass('official public designation supports an exact-application supplemental bridge', fixture);
}

{
  const fixture = officialDesignationFixture();
  fixture.identity.value = '';
  fixture.verification.sources[0].scope.designations = ['EcoBoost 2.3L High Output'];
  expectFail('official public designation value is required', fixture, 'identity.value must be a non-empty string');
}

{
  const fixture = officialDesignationFixture();
  fixture.identity.value = '2.0L petrol engine';
  fixture.verification.sources[0].scope.designations = [fixture.identity.value];
  expectFail('generic public description is not a stable identity', fixture, 'cannot be a generic displacement');
}

for (const genericDesignation of ['V6 diesel', 'turbocharged four-cylinder', '2.0L petrol I4 turbocharged']) {
  const fixture = officialDesignationFixture();
  fixture.identity.value = genericDesignation;
  fixture.verification.sources[0].scope.designations = [genericDesignation];
  expectFail(`generic designation ${genericDesignation}`, fixture, 'cannot be a generic displacement');
}

for (const stableDesignation of ['EcoBoost 2.3L High Output', 'Power Stroke 6.7L', 'Duratorq TDCi 2.0']) {
  const fixture = officialDesignationFixture();
  fixture.identity.value = stableDesignation;
  fixture.verification.sources[0].scope.designations = [stableDesignation];
  expectPass(`stable branded designation ${stableDesignation}`, fixture);
}

{
  const fixture = officialDesignationFixture();
  delete fixture.identity.review;
  expectFail('official public designation requires manual review declaration', fixture, 'requires an explicit review declaration');
}

{
  const fixture = corroboratedDesignationFixture();
  fixture.verification.sources[2].dataOrigin = fixture.verification.sources[1].dataOrigin;
  expectFail('dependent Tier B designation supplements cannot close a field', fixture, 'requires Tier A or two independent Tier B publishers');
}

{
  const fixture = officialDesignationFixture();
  fixture.verification.evidenceBasis = 'corroborated';
  fixture.verification.sources[0].fields = fixture.verification.sources[0].fields.filter((field) => field !== 'injectionKey');
  fixture.verification.sources.push(tierASource('tier-c-designation-injection', ['injectionKey'], {
    type: 'technicalReference', evidenceTier: 'C', identityBindingRef: 'designation-identity',
    scope: bridgedScope({ years: { from: 2012, to: 2014 } })
  }));
  fixture.verification.sourceRefs.push('tier-c-designation-injection');
  expectFail('Tier C designation supplement cannot close a mandatory field', fixture, 'corroborated evidence field injectionKey requires Tier A or two independent Tier B publishers');
}

{
  const fixture = corroboratedDesignationFixture();
  const identitySource = fixture.verification.sources[0];
  identitySource.evidenceTier = 'B';
  identitySource.type = 'technicalReference';
  identitySource.dataOrigin = 'tier-b-identity-origin';
  identitySource.independenceNotes = ['This publisher maintains its own editorial dataset.'];
  expectFail('corroborated designation record still requires Tier A identity', fixture, 'no accepted Tier A sourceRef declares the exact official public designation');
}

{
  const fixture = corroboratedDesignationFixture();
  const changingSource = fixture.verification.sources[1];
  delete changingSource.identityBindingRef;
  changingSource.fields.push(designationField);
  changingSource.scope.designations = ['EcoBoost 2.3L High-Output'];
  expectFail('Tier B supplement cannot change designation spelling', fixture, 'scope designations do not explicitly include target identity');
}

{
  const fixture = officialDesignationFixture();
  fixture.code = fixture.identity.value;
  expectFail('official public designation cannot masquerade as code', fixture, 'must omit code');
}

{
  const fixture = officialDesignationFixture();
  fixture.verification.sources[0].scope.applications = ['Other Model'];
  expectFail('designation evidence rejects incompatible application', fixture, 'scope applications do not contain every record application');
}

{
  const fixture = officialDesignationFixture();
  fixture.verification.sources[0].scope.years = { from: 2013, to: 2014 };
  expectFail('designation evidence rejects partial year coverage', fixture, 'scope years do not fully contain the record year interval');
}

{
  const fixture = officialDesignationFixture();
  fixture.verification.sources[0].scope.markets = ['US'];
  expectFail('designation evidence rejects incompatible market', fixture, 'scope markets do not contain the record market scope');
}

{
  const fixture = officialDesignationFixture();
  fixture.verification.sources[0].scope.level = 'aggregate';
  expectFail('designation evidence rejects aggregate scope', fixture, 'aggregate or unsupported');
}

{
  const fixture = officialDesignationFixture();
  fixture.verification.sources[0].fields = fixture.verification.sources[0].fields.filter((field) => field !== designationField);
  expectFail('designation identity field must be declared', fixture, `must declare ${designationField}`);
}


{
  const fixture = officialDesignationFixture();
  fixture.verification.sources[0].fields = fixture.verification.sources[0].fields.filter((field) => field !== designationField);
  fixture.verification.sources[0].pageNotes.push(`The prose alone mentions ${fixture.identity.value}.`);
  expectFail('designation mentioned only in notes does not create coverage', fixture, `must declare ${designationField}`);
}

{
  const fixture = officialDesignationFixture();
  delete fixture.verification.sources[0].scope.designations;
  fixture.verification.sources[0].scope.codes = ['X20A'];
  expectFail('designation identity cannot use scope.codes', fixture, 'uses codes for the wrong identity type');
}

{
  const fixture = officialDesignationFixture();
  fixture.verification.sources[0].scope.level = 'family';
  expectFail('designation family source cannot establish identity', fixture, 'exact official public designation');
}

{
  const fixture = officialDesignationFixture();
  const wrongCodeSource = fixture.verification.sources[0];
  wrongCodeSource.fields = wrongCodeSource.fields.map((field) => field === designationField ? 'code' : field);
  delete wrongCodeSource.scope.designations;
  wrongCodeSource.scope.codes = ['NEIGHBOR-CODE'];
  const bridge = tierASource('designation-performance-bridge', ['performance.powerKw'], {
    identityBindingRef: wrongCodeSource.id,
    scope: bridgedScope({ years: { from: 2012, to: 2014 } })
  });
  fixture.verification.sources.push(bridge);
  fixture.verification.sourceRefs.push(bridge.id);
  expectFail('designation bridge cannot bind through neighboring code source', fixture, 'uses codes for the wrong identity type');
}

{
  const fixture = officialDesignationFixture();
  fixture.verification.sources[0].scope.codes = ['X20A'];
  expectFail('designation source cannot declare simultaneous code path', fixture, 'cannot declare both codes and designations');
}

{
  const fixture = officialDesignationFixture();
  const identitySource = fixture.verification.sources[0];
  const bridge = tierASource('designation-bridge', ['performance.powerKw'], {
    identityBindingRef: identitySource.id,
    scope: bridgedScope({ years: { from: 2012, to: 2014 } })
  });
  bridge.identityBindingRef = 'designation-bridge-two';
  const bridgeTwo = tierASource('designation-bridge-two', ['performance.torqueNm'], {
    identityBindingRef: 'designation-bridge',
    scope: bridgedScope({ years: { from: 2012, to: 2014 } })
  });
  fixture.verification.sources.push(bridge, bridgeTwo);
  fixture.verification.sourceRefs.push(bridge.id, bridgeTwo.id);
  expectFail('designation identity bridge chains and cycles are rejected', fixture, 'chains and cycles are not allowed');
}

console.log(`Verification policy fixture tests passed: ${passedCases} cases.`);
