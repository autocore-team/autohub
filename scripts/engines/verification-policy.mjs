export const VERIFICATION_STATUSES = ['verified', 'corroborated', 'legacyPending'];
const SOURCE_TYPES = ['manufacturer', 'technicalReference', 'serviceDocumentation', 'certificationDocument'];
const OFFICIAL_SOURCE_TYPES = ['manufacturer', 'serviceDocumentation', 'certificationDocument'];
const SOURCE_SCOPE_LEVELS = ['exactVariant', 'family', 'aggregate'];
const EVIDENCE_BASES = ['official', 'corroborated'];
const EVIDENCE_TIERS = ['A', 'B', 'C'];

const PERFORMANCE_FIELDS = ['performance.powerKw', 'performance.torqueNm'];
const OFFICIAL_DESIGNATION_FIELD = 'identity.officialPublicDesignation';
const IDENTITY_FIELDS = ['code', 'aliases'];
const STRICT_IDENTITY_FIELDS = [...IDENTITY_FIELDS, OFFICIAL_DESIGNATION_FIELD];
export const VERIFIED_REQUIRED_FIELDS = [
  'maker',
  'code',
  'applications',
  'years',
  'displacement',
  'layout',
  'fuelKey',
  'aspirationKey',
  'injectionKey',
  'performance.powerKw',
  'performance.powerKw.rpm',
  'performance.torqueNm',
  'performance.torqueNm.rpm'
];
const STRICT_COVERAGE_FIELDS = new Set([
  ...VERIFIED_REQUIRED_FIELDS,
  OFFICIAL_DESIGNATION_FIELD,
  'layout.valves',
  'layout.camshaftsTotal',
  'aliases',
  'blockKey',
  'timingKey',
  'consumption'
]);

function identityPolicy(record) {
  if (record?.identity?.type === 'officialPublicDesignation') {
    return {
      type: 'officialPublicDesignation',
      value: record.identity.value,
      field: OFFICIAL_DESIGNATION_FIELD,
      scopeKey: 'designations'
    };
  }
  return { type: 'exactCode', value: record?.identity?.value || record?.code, field: 'code', scopeKey: 'codes' };
}

function requiredFieldsFor(record) {
  const identity = identityPolicy(record);
  return VERIFIED_REQUIRED_FIELDS.map((field) => field === 'code' ? identity.field : field);
}

function identityLabel(identity) {
  return identity.type === 'exactCode' ? 'code' : 'official public designation';
}

function validateIdentity(record, label, errors) {
  const identity = record?.identity;
  if (identity === undefined) return;
  addErrorIf(!isObject(identity), `${label}: identity must be an object.`, errors);
  if (!isObject(identity)) return;
  addErrorIf(!['exactCode', 'officialPublicDesignation'].includes(identity.type), `${label}: identity.type must be exactCode or officialPublicDesignation.`, errors);
  addErrorIf(!isNonEmptyString(identity.value), `${label}: identity.value must be a non-empty string.`, errors);
  if (identity.type === 'exactCode') {
    addErrorIf(!isNonEmptyString(record.code), `${label}: exactCode identity requires code.`, errors);
    addErrorIf(identity.value !== record.code, `${label}: exactCode identity.value must equal code.`, errors);
    return;
  }
  if (identity.type !== 'officialPublicDesignation') return;
  addErrorIf(Object.hasOwn(record, 'code'), `${label}: officialPublicDesignation records must omit code.`, errors);
  addErrorIf(record?.verification?.status !== 'verified', `${label}: officialPublicDesignation is only valid for verified records.`, errors);
  addErrorIf(!EVIDENCE_BASES.includes(record?.verification?.evidenceBasis), `${label}: officialPublicDesignation requires an explicit official or corroborated evidenceBasis.`, errors);
  addErrorIf(!Array.isArray(record?.verification?.sourceRefs) || record.verification.sourceRefs.length === 0, `${label}: officialPublicDesignation requires strict sourceRefs.`, errors);
  const review = identity.review;
  addErrorIf(!isObject(review), `${label}: officialPublicDesignation requires an explicit review declaration.`, errors);
  if (isObject(review)) {
    for (const field of ['officialPublicationConfirmed', 'stableAndDistinct', 'genericDescriptionRejected', 'materialVariantsSeparated']) {
      addErrorIf(review[field] !== true, `${label}: identity.review.${field} must be true.`, errors);
    }
    addErrorIf(!isNonEmptyUniqueStringArray(review.notes), `${label}: identity.review.notes must be a non-empty unique string array.`, errors);
  }
  const normalized = String(identity.value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const genericTokens = new Set([
    'engine', 'motor', 'petrol', 'gasoline', 'diesel', 'hybrid', 'turbo', 'turbocharged',
    'naturally', 'aspirated', 'supercharged', 'inline', 'cylinder', 'cylinders', 'cyl',
    'three', 'four', 'five', 'six', 'eight', 'ten', 'twelve', 'efi', 'gdi', 'mpi'
  ]);
  const meaningful = normalized.split(' ').filter(Boolean).filter((token) => (
    !genericTokens.has(token)
    && !/^\d+(?:\.\d+)?(?:l|kw|hp|ps)?$/.test(token)
    && !/^(?:i|v|h|w|flat|boxer)\d{1,2}$/.test(token)
  ));
  addErrorIf(meaningful.length === 0, `${label}: officialPublicDesignation cannot be a generic displacement, fuel, layout, aspiration or power description.`, errors);
}

function addError(errors, message) {
  errors.push(message);
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sourceHasField(source, field) {
  return Array.isArray(source?.fields) && source.fields.includes(field);
}

function sourceHasPerformanceFields(source) {
  return PERFORMANCE_FIELDS.every((field) => sourceHasField(source, field));
}

function sourceHasIdentityField(source) {
  return IDENTITY_FIELDS.some((field) => sourceHasField(source, field));
}

function sourceHasPerformanceAndIdentity(source) {
  return sourceHasPerformanceFields(source) && sourceHasIdentityField(source);
}

function sourceHasPageNotes(source) {
  return Array.isArray(source?.pageNotes)
    && source.pageNotes.length > 0
    && source.pageNotes.every(isNonEmptyString);
}

function valueAtPath(value, path) {
  return path.split('.').reduce((current, part) => current?.[part], value);
}

function recordHasCoverageField(record, field) {
  if (field === OFFICIAL_DESIGNATION_FIELD) return isNonEmptyString(record?.identity?.value);
  if (field === 'layout.valves') return /\b\d+ valves\b/i.test(record?.layout || '');
  if (field === 'layout.camshaftsTotal') return /\b\d+ camshafts? total\b/i.test(record?.layout || '');
  const value = valueAtPath(record, field);
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== '';
}

function isNonEmptyUniqueStringArray(value) {
  return Array.isArray(value)
    && value.length > 0
    && value.every(isNonEmptyString)
    && new Set(value).size === value.length;
}

function validateStringScope(value, label, errors) {
  addErrorIf(!isNonEmptyUniqueStringArray(value), `${label} must be a non-empty array of unique strings.`, errors);
}

function isValidMarketScope(value) {
  return isNonEmptyUniqueStringArray(value)
    && !(value.includes('Global') && value.length > 1);
}

function validateMarketScope(value, label, errors) {
  addErrorIf(!isValidMarketScope(value), `${label} must be a non-empty unique list and Global cannot be combined with regional markets.`, errors);
}

function normalizedYearEnd(value) {
  return value === 'present' ? Number.POSITIVE_INFINITY : value;
}

function isValidYearScope(value) {
  if (!isObject(value) || !Number.isInteger(value.from) || value.from < 1885) return false;
  if (!(Number.isInteger(value.to) || value.to === 'present')) return false;
  if (Number.isInteger(value.to) && value.to < 1885) return false;
  return value.from <= normalizedYearEnd(value.to);
}

function validateYearScope(value, label, errors) {
  addErrorIf(!isValidYearScope(value), `${label} must contain integer from and integer or present to, with from <= to.`, errors);
}

function parseRecordYears(value) {
  if (!isNonEmptyString(value)) return null;
  const match = value.trim().match(/^(\d{4})(?:-(\d{4}|present))?$/);
  if (!match) return null;
  const from = Number(match[1]);
  const to = match[2] ? (match[2] === 'present' ? 'present' : Number(match[2])) : from;
  const parsed = { from, to };
  return isValidYearScope(parsed) ? parsed : null;
}

function sameStringSet(left, right) {
  return isNonEmptyUniqueStringArray(left)
    && isNonEmptyUniqueStringArray(right)
    && left.length === right.length
    && left.every((value) => right.includes(value));
}

function sameYearScope(left, right) {
  return isValidYearScope(left)
    && isValidYearScope(right)
    && left.from === right.from
    && left.to === right.to;
}

function sourceYearsContainRecord(sourceYears, recordYears) {
  return isValidYearScope(sourceYears)
    && isValidYearScope(recordYears)
    && sourceYears.from <= recordYears.from
    && normalizedYearEnd(sourceYears.to) >= normalizedYearEnd(recordYears.to);
}

function sourceApplicationsContainRecord(sourceApplications, recordApplications) {
  return isNonEmptyUniqueStringArray(sourceApplications)
    && isNonEmptyUniqueStringArray(recordApplications)
    && recordApplications.every((application) => sourceApplications.includes(application));
}

function sourceMarketsContainRecord(sourceMarkets, recordMarkets) {
  if (!isValidMarketScope(sourceMarkets) || !isValidMarketScope(recordMarkets)) return false;
  const sourceIsGlobal = sourceMarkets.includes('Global');
  const recordIsGlobal = recordMarkets.includes('Global');
  if (recordIsGlobal) return sourceIsGlobal;
  return sourceIsGlobal || recordMarkets.every((market) => sourceMarkets.includes(market));
}

function validateVerificationScope(scope, label, errors) {
  addErrorIf(!isObject(scope), `${label} must be an object.`, errors);
  if (!isObject(scope)) return;
  validateStringScope(scope.applications, `${label}.applications`, errors);
  validateYearScope(scope.years, `${label}.years`, errors);
  validateMarketScope(scope.markets, `${label}.markets`, errors);
}

function validateSourceScope(scope, label, errors) {
  addErrorIf(!isObject(scope), `${label} must be an object.`, errors);
  if (!isObject(scope)) return;
  addErrorIf(!SOURCE_SCOPE_LEVELS.includes(scope.level), `${label}.level must be exactVariant, family or aggregate.`, errors);
  if (Object.hasOwn(scope, 'codes')) validateStringScope(scope.codes, `${label}.codes`, errors);
  if (Object.hasOwn(scope, 'designations')) validateStringScope(scope.designations, `${label}.designations`, errors);
  validateStringScope(scope.applications, `${label}.applications`, errors);
  validateYearScope(scope.years, `${label}.years`, errors);
  validateMarketScope(scope.markets, `${label}.markets`, errors);
}

function normalizePublisher(publisher) {
  return typeof publisher === 'string'
    ? publisher.trim().toLowerCase().replace(/\s+/g, ' ')
    : '';
}

function normalizeHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function sameClaim(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sourcesAreIndependent(left, right) {
  return normalizePublisher(left?.publisher) !== normalizePublisher(right?.publisher)
    && normalizeHostname(left?.url) !== normalizeHostname(right?.url)
    && left?.dataOrigin.trim().toLowerCase() !== right?.dataOrigin.trim().toLowerCase();
}

function hasIndependentPair(sources) {
  return sources.some((left, leftIndex) => (
    sources.slice(leftIndex + 1).some((right) => sourcesAreIndependent(left, right))
  ));
}

function validateRange(range, label, errors) {
  addErrorIf(!isObject(range), `${label} must be an object.`, errors);
  if (!isObject(range)) return;
  addErrorIf(typeof range.min !== 'number' || !Number.isFinite(range.min), `${label}.min must be a finite number.`, errors);
  addErrorIf(typeof range.max !== 'number' || !Number.isFinite(range.max), `${label}.max must be a finite number.`, errors);
  if (typeof range.min === 'number' && typeof range.max === 'number') {
    addErrorIf(range.min > range.max, `${label}.min must be <= max.`, errors);
  }
  if (Object.hasOwn(range, 'rpm')) validateRange(range.rpm, `${label}.rpm`, errors);
}

function validateSource(source, label, errors) {
  addErrorIf(!isObject(source), `${label} must be an object.`, errors);
  if (!isObject(source)) return;

  addErrorIf(!SOURCE_TYPES.includes(source.type), `${label}.type must be a known source type.`, errors);
  if (Object.hasOwn(source, 'id')) {
    addErrorIf(!isNonEmptyString(source.id), `${label}.id must be a non-empty string.`, errors);
  }
  if (Object.hasOwn(source, 'identityBindingRef')) {
    addErrorIf(!isNonEmptyString(source.identityBindingRef), `${label}.identityBindingRef must be a non-empty string.`, errors);
  }
  if (Object.hasOwn(source, 'evidenceTier')) {
    addErrorIf(!EVIDENCE_TIERS.includes(source.evidenceTier), `${label}.evidenceTier must be A, B or C.`, errors);
  }
  if (Object.hasOwn(source, 'dataOrigin')) {
    addErrorIf(!isNonEmptyString(source.dataOrigin), `${label}.dataOrigin must be a non-empty string.`, errors);
  }
  for (const notesField of ['independenceNotes', 'authorityNotes']) {
    if (Object.hasOwn(source, notesField)) {
      addErrorIf(!Array.isArray(source[notesField]) || source[notesField].length === 0, `${label}.${notesField} must be a non-empty array.`, errors);
      if (Array.isArray(source[notesField])) {
        source[notesField].forEach((note, noteIndex) => {
          addErrorIf(!isNonEmptyString(note), `${label}.${notesField}[${noteIndex}] must be a non-empty string.`, errors);
        });
      }
    }
  }
  if (Object.hasOwn(source, 'claims')) {
    addErrorIf(!isObject(source.claims), `${label}.claims must be an object.`, errors);
    if (isObject(source.claims)) {
      for (const field of ['performance.powerKw', 'performance.torqueNm']) {
        if (Object.hasOwn(source.claims, field)) validateRange(source.claims[field], `${label}.claims.${field}`, errors);
      }
    }
  }
  addErrorIf(!isNonEmptyString(source.title), `${label}.title must be a non-empty string.`, errors);
  addErrorIf(!isNonEmptyString(source.publisher), `${label}.publisher must be a non-empty string.`, errors);
  addErrorIf(!Number.isInteger(source.year), `${label}.year must be an integer.`, errors);
  addErrorIf(!isNonEmptyString(source.url), `${label}.url must be a non-empty string.`, errors);
  if (typeof source.url === 'string') {
    try {
      new URL(source.url);
    } catch {
      addError(errors, `${label}.url must be a valid URL.`);
    }
  }
  addErrorIf(!Number.isInteger(source.page) || source.page < 1, `${label}.page must be an integer >= 1.`, errors);
  addErrorIf(typeof source.checkedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt), `${label}.checkedAt must be YYYY-MM-DD.`, errors);
  addErrorIf(!Array.isArray(source.fields) || source.fields.length === 0, `${label}.fields must be a non-empty array.`, errors);
  if (Array.isArray(source.fields)) {
    source.fields.forEach((field, fieldIndex) => {
      addErrorIf(!isNonEmptyString(field), `${label}.fields[${fieldIndex}] must be a non-empty string.`, errors);
    });
  }
  if (Object.hasOwn(source, 'pageNotes')) {
    addErrorIf(!Array.isArray(source.pageNotes), `${label}.pageNotes must be an array.`, errors);
    if (Array.isArray(source.pageNotes)) {
      source.pageNotes.forEach((note, noteIndex) => {
        addErrorIf(!isNonEmptyString(note), `${label}.pageNotes[${noteIndex}] must be a non-empty string.`, errors);
      });
    }
  }
  if (Object.hasOwn(source, 'scope')) {
    validateSourceScope(source.scope, `${label}.scope`, errors);
  }
}

export function validateRecordVerificationPolicy(record, label, errors) {
  const verification = record?.verification;
  const hasPerformance = isObject(record) && Object.hasOwn(record, 'performance');
  const hasSourcesProperty = isObject(verification) && Object.hasOwn(verification, 'sources');
  const hasSourceRefsProperty = isObject(verification) && Object.hasOwn(verification, 'sourceRefs');
  const sources = Array.isArray(verification?.sources) ? verification.sources : [];
  const sourceRefs = Array.isArray(verification?.sourceRefs) ? verification.sourceRefs : [];

  validateIdentity(record, label, errors);

  addErrorIf(!isObject(verification), `${label}: verification must be an object.`, errors);
  addErrorIf(!VERIFICATION_STATUSES.includes(verification?.status), `${label}: verification.status must be verified, corroborated or legacyPending.`, errors);
  if (hasSourcesProperty) {
    addErrorIf(!Array.isArray(verification.sources), `${label}: verification.sources must be an array.`, errors);
  }
  if (Array.isArray(verification?.sources)) {
    verification.sources.forEach((source, sourceIndex) => validateSource(source, `${label}: verification.sources[${sourceIndex}]`, errors));
  }
  if (hasSourceRefsProperty) {
    addErrorIf(!Array.isArray(verification.sourceRefs), `${label}: verification.sourceRefs must be an array.`, errors);
    addErrorIf(verification?.status !== 'verified', `${label}: verification.sourceRefs is only valid for verified records.`, errors);
    if (Array.isArray(verification.sourceRefs)) {
      verification.sourceRefs.forEach((sourceRef, sourceRefIndex) => {
        addErrorIf(!isNonEmptyString(sourceRef), `${label}: verification.sourceRefs[${sourceRefIndex}] must be a non-empty string.`, errors);
      });
      addErrorIf(new Set(verification.sourceRefs).size !== verification.sourceRefs.length, `${label}: verification.sourceRefs must be unique.`, errors);
    }
  }
  if (Object.hasOwn(verification || {}, 'scope')) {
    validateVerificationScope(verification.scope, `${label}: verification.scope`, errors);
  }
  if (Object.hasOwn(verification || {}, 'evidenceBasis')) {
    addErrorIf(!EVIDENCE_BASES.includes(verification.evidenceBasis), `${label}: verification.evidenceBasis must be official or corroborated.`, errors);
    addErrorIf(!hasSourceRefsProperty, `${label}: verification.evidenceBasis requires strict sourceRefs.`, errors);
  }

  if (hasPerformance) {
    validateRange(record.performance?.powerKw, `${label}: performance.powerKw`, errors);
    validateRange(record.performance?.torqueNm, `${label}: performance.torqueNm`, errors);
  }

  if (verification?.status === 'verified') {
    validateVerifiedPolicy(record, hasPerformance, sources, sourceRefs, hasSourceRefsProperty, label, errors);
  } else if (verification?.status === 'corroborated') {
    validateCorroboratedPolicy(hasPerformance, sources, label, errors);
  } else if (verification?.status === 'legacyPending') {
    validateLegacyPendingPolicy(hasPerformance, sources, label, errors);
  }
}

export function verificationPolicyErrors(record, label = record?.id || 'record') {
  const errors = [];
  validateRecordVerificationPolicy(record, label, errors);
  return errors;
}

function validateVerifiedPolicy(record, hasPerformance, sources, sourceRefs, strictCoverage, label, errors) {
  addErrorIf(!hasPerformance, `${label}: verified records must include performance.`, errors);
  addErrorIf(sources.length === 0, `${label}: verified records must include at least one source.`, errors);

  if (strictCoverage) {
    validateStrictVerifiedPolicy(record, sources, sourceRefs, label, errors);
    return;
  }

  if (record?.identity?.type === 'officialPublicDesignation') {
    addError(errors, `${label}: officialPublicDesignation cannot use the compatible single-source rule.`);
    return;
  }

  const hasOfficialSource = sources.some((source) => (
    OFFICIAL_SOURCE_TYPES.includes(source.type) && sourceHasPerformanceAndIdentity(source)
  ));
  addErrorIf(
    !hasOfficialSource,
    `${label}: verified records must include an official source linking performance.powerKw, performance.torqueNm and code or aliases.`,
    errors
  );
}

function validateStrictVerifiedPolicy(record, sources, sourceRefs, label, errors) {
  addErrorIf(sourceRefs.length === 0, `${label}: strict verified coverage requires at least one sourceRef.`, errors);

  const recordScope = record?.verification?.scope;
  const parsedRecordYears = parseRecordYears(record?.years);
  const hasValidRecordScope = isObject(recordScope)
    && isNonEmptyUniqueStringArray(recordScope.applications)
    && isValidYearScope(recordScope.years)
    && isValidMarketScope(recordScope.markets);
  addErrorIf(!hasValidRecordScope, `${label}: strict verified coverage requires a valid normalized verification.scope.`, errors);
  addErrorIf(!parsedRecordYears, `${label}: record years ${record?.years || '(missing)'} cannot be parsed safely; use YYYY, YYYY-YYYY or YYYY-present.`, errors);
  if (hasValidRecordScope) {
    addErrorIf(!sameStringSet(recordScope.applications, record?.applications), `${label}: verification.scope.applications must exactly describe record applications.`, errors);
    if (parsedRecordYears) {
      addErrorIf(!sameYearScope(recordScope.years, parsedRecordYears), `${label}: verification.scope.years must exactly describe parsed record years.`, errors);
    }
  }

  const sourcesById = new Map();
  sources.forEach((source, sourceIndex) => {
    const sourceLabel = `${label}: verification.sources[${sourceIndex}]`;
    if (!isNonEmptyString(source?.id)) {
      addError(errors, `${sourceLabel} must have a unique id when verification.sourceRefs is present.`);
      return;
    }
    if (sourcesById.has(source.id)) {
      addError(errors, `${label}: source id ${source.id} is duplicated; strict source registry IDs must be unique.`);
      return;
    }
    sourcesById.set(source.id, source);
  });

  if (EVIDENCE_BASES.includes(record?.verification?.evidenceBasis)) {
    validateTieredStrictVerifiedPolicy(record, sourcesById, sourceRefs, label, errors);
    return;
  }

  const identity = identityPolicy(record);
  const requiredFields = requiredFieldsFor(record);
  const directAccepted = new Map();
  const bridgeCandidates = [];
  const referencedSourceIds = new Set(sourceRefs.filter(isNonEmptyString));

  for (const sourceRef of sourceRefs) {
    if (!isNonEmptyString(sourceRef)) continue;
    const source = sourcesById.get(sourceRef);
    if (!source) {
      addError(errors, `${label}: sourceRef ${sourceRef} does not resolve to an existing verification.sources id.`);
      continue;
    }

    const rejectionReasons = [];
    if (!OFFICIAL_SOURCE_TYPES.includes(source.type)) {
      rejectionReasons.push(`type ${source.type || '(missing)'} is not an allowed official source type`);
    }
    if (!Array.isArray(source.fields) || source.fields.length === 0) {
      rejectionReasons.push('declared fields coverage is empty');
    } else {
      if (new Set(source.fields).size !== source.fields.length) rejectionReasons.push('declared fields contain duplicates');
      const unsupportedField = source.fields.find((field) => !STRICT_COVERAGE_FIELDS.has(field));
      if (unsupportedField) rejectionReasons.push(`declared field ${unsupportedField} is not supported by strict verified coverage`);
    }
    if (!sourceHasPageNotes(source)) {
      rejectionReasons.push('pageNotes do not document the exact evidence and scope');
    }

    const scope = source.scope;
    if (!isObject(scope)) {
      rejectionReasons.push('scope is missing');
    } else {
      if (!['exactVariant', 'family'].includes(scope.level)) rejectionReasons.push(`scope level ${scope.level || '(missing)'} is aggregate or unsupported`);
      if (!hasValidRecordScope) {
        rejectionReasons.push('record verification.scope is invalid, so containment cannot be established');
      } else {
        if (!sourceApplicationsContainRecord(scope.applications, recordScope.applications)) {
          rejectionReasons.push('scope applications do not contain every record application');
        }
        if (!sourceYearsContainRecord(scope.years, recordScope.years)) {
          rejectionReasons.push('scope years do not fully contain the record year interval');
        }
        if (!sourceMarketsContainRecord(scope.markets, recordScope.markets)) {
          rejectionReasons.push('scope markets do not contain the record market scope');
        }
      }
    }

    const hasDirectCodes = isObject(scope) && Object.hasOwn(scope, 'codes');
    const hasDirectDesignations = isObject(scope) && Object.hasOwn(scope, 'designations');
    const hasDirectIdentity = identity.type === 'exactCode' ? hasDirectCodes : hasDirectDesignations;
    const hasIdentityBinding = Object.hasOwn(source, 'identityBindingRef');
    if (hasDirectCodes && hasDirectDesignations) rejectionReasons.push('scope cannot declare both codes and designations');
    if (Number(hasDirectCodes) + Number(hasDirectDesignations) + Number(hasIdentityBinding) !== 1) {
      rejectionReasons.push('must use exactly one evidence path: scope.codes or identityBindingRef for exact codes; scope.designations or identityBindingRef for official designations');
    } else if (hasDirectIdentity) {
      if (!isNonEmptyUniqueStringArray(scope[identity.scopeKey]) || !scope[identity.scopeKey].includes(identity.value)) {
        rejectionReasons.push(identity.type === 'exactCode'
          ? `scope codes do not explicitly include exact record code ${identity.value || '(missing)'}`
          : `scope designations do not explicitly include target identity ${identity.value || '(missing)'}`);
      }
      if (!sourceHasField(source, identity.field)) {
        rejectionReasons.push(identity.type === 'exactCode'
          ? 'direct-code evidence must declare code in fields'
          : `direct identity evidence must declare ${identity.field} in fields`);
      }
    } else if (hasDirectCodes || hasDirectDesignations) {
      rejectionReasons.push(`direct evidence uses ${identity.type === 'exactCode' ? 'designations' : 'codes'} for the wrong identity type`);
    } else {
      if (!isNonEmptyString(source.identityBindingRef)) rejectionReasons.push('identityBindingRef is empty');
      if (scope?.level !== 'exactVariant') rejectionReasons.push('identity-bridge supplemental scope must be exactVariant');
      if (STRICT_IDENTITY_FIELDS.some((field) => sourceHasField(source, field))) {
        rejectionReasons.push('identity-bridge supplemental source must not claim identity coverage');
      }
    }

    if (rejectionReasons.length) {
      rejectionReasons.forEach((reason) => addError(errors, `${label}: sourceRef ${sourceRef} is not accepted: ${reason}.`));
      continue;
    }

    if (hasDirectIdentity) directAccepted.set(sourceRef, source);
    else bridgeCandidates.push({ sourceRef, source });
  }

  const identitySources = new Map([...directAccepted].filter(([, source]) => (
    source.scope?.level === 'exactVariant'
    && sourceHasField(source, identity.field)
    && sourceHasField(source, 'applications')
    && sourceHasField(source, 'years')
    && sameStringSet(source.scope?.applications, recordScope?.applications)
  )));

  const acceptedSources = [...directAccepted.values()];
  for (const { sourceRef, source } of bridgeCandidates) {
    const bindingRef = source.identityBindingRef;
    const binding = sourcesById.get(bindingRef);
    const rejectionReasons = [];
    if (!binding) {
      rejectionReasons.push(`identityBindingRef ${bindingRef} does not resolve to an existing source id`);
    } else {
      if (!referencedSourceIds.has(bindingRef)) rejectionReasons.push(`identityBindingRef ${bindingRef} is not included in verification.sourceRefs`);
      if (Object.hasOwn(binding, 'identityBindingRef')) rejectionReasons.push(`identityBindingRef ${bindingRef} points to a supplemental binding; chains and cycles are not allowed`);
      if (binding.scope?.level !== 'exactVariant') rejectionReasons.push(`identityBindingRef ${bindingRef} does not point to an exactVariant source`);
      if (!identitySources.has(bindingRef)) rejectionReasons.push(`identityBindingRef ${bindingRef} is not an accepted exact identity source declaring ${identity.field}, applications and years`);
      if (!sameStringSet(source.scope?.applications, binding.scope?.applications)) {
        rejectionReasons.push(`application scope does not exactly match identityBindingRef ${bindingRef}`);
      }
    }
    if (rejectionReasons.length) {
      rejectionReasons.forEach((reason) => addError(errors, `${label}: sourceRef ${sourceRef} is not accepted: ${reason}.`));
      continue;
    }
    acceptedSources.push(source);
  }

  const hasExactIdentityBinding = identitySources.size > 0;
  addErrorIf(
    !hasExactIdentityBinding,
    `${label}: no accepted official sourceRef declares the exact ${identityLabel(identity)}, applications and years identity binding.`,
    errors
  );

  const acceptedFields = new Set(acceptedSources.flatMap((source) => source.fields));
  for (const field of requiredFields) {
    if (!recordHasCoverageField(record, field)) {
      addError(errors, `${label}: verified record is missing required field ${field}.`);
    }
    if (!acceptedFields.has(field)) {
      const refs = sourceRefs.filter(isNonEmptyString).join(', ') || '(none)';
      addError(errors, `${label}: verified field ${field} is uncovered; sourceRefs [${refs}] do not declare it in fields.`);
    }
  }
}

function validateTieredStrictVerifiedPolicy(record, sourcesById, sourceRefs, label, errors) {
  const recordScope = record.verification.scope;
  const identity = identityPolicy(record);
  const requiredFields = [...requiredFieldsFor(record), 'layout.valves', 'layout.camshaftsTotal'];
  const acceptedDirect = new Map();
  const bridgeCandidates = [];
  const accepted = new Map();
  const referencedSourceIds = new Set(sourceRefs.filter(isNonEmptyString));

  for (const sourceRef of sourceRefs) {
    if (!isNonEmptyString(sourceRef)) continue;
    const source = sourcesById.get(sourceRef);
    if (!source) {
      addError(errors, `${label}: sourceRef ${sourceRef} does not resolve to an existing verification.sources id.`);
      continue;
    }

    const rejectionReasons = [];
    const tier = source.evidenceTier;
    if (!EVIDENCE_TIERS.includes(tier)) rejectionReasons.push('evidenceTier A, B or C is required');
    if (tier === 'A' && source.type === 'technicalReference' && !sourceHasPageNotes({ pageNotes: source.authorityNotes })) {
      rejectionReasons.push('Tier A professional technicalReference requires authorityNotes documenting licensing or editorial provenance');
    }
    if (tier === 'B') {
      if (source.type !== 'technicalReference') rejectionReasons.push('Tier B sources must use type technicalReference');
      if (!isNonEmptyString(source.dataOrigin)) rejectionReasons.push('Tier B source requires dataOrigin');
      if (!sourceHasPageNotes({ pageNotes: source.independenceNotes })) rejectionReasons.push('Tier B source requires independenceNotes');
    }
    if (tier === 'C' && source.type !== 'technicalReference') rejectionReasons.push('Tier C sources must use type technicalReference');
    if (!Array.isArray(source.fields) || source.fields.length === 0) {
      rejectionReasons.push('declared fields coverage is empty');
    } else {
      if (new Set(source.fields).size !== source.fields.length) rejectionReasons.push('declared fields contain duplicates');
      const unsupportedField = source.fields.find((field) => !STRICT_COVERAGE_FIELDS.has(field));
      if (unsupportedField) rejectionReasons.push(`declared field ${unsupportedField} is not supported by strict verified coverage`);
    }
    if (!sourceHasPageNotes(source)) rejectionReasons.push('pageNotes do not document the exact evidence and scope');

    const scope = source.scope;
    if (!isObject(scope)) {
      rejectionReasons.push('scope is missing');
    } else {
      if (!['exactVariant', 'family'].includes(scope.level)) rejectionReasons.push(`scope level ${scope.level || '(missing)'} is aggregate or unsupported`);
      if (!sourceApplicationsContainRecord(scope.applications, recordScope.applications)) rejectionReasons.push('scope applications do not contain every record application');
      if (!sourceYearsContainRecord(scope.years, recordScope.years)) rejectionReasons.push('scope years do not fully contain the record year interval');
      if (!sourceMarketsContainRecord(scope.markets, recordScope.markets)) rejectionReasons.push('scope markets do not contain the record market scope');
    }

    const hasDirectCodes = isObject(scope) && Object.hasOwn(scope, 'codes');
    const hasDirectDesignations = isObject(scope) && Object.hasOwn(scope, 'designations');
    const hasDirectIdentity = identity.type === 'exactCode' ? hasDirectCodes : hasDirectDesignations;
    const hasIdentityBinding = Object.hasOwn(source, 'identityBindingRef');
    if (hasDirectCodes && hasDirectDesignations) rejectionReasons.push('scope cannot declare both codes and designations');
    if (Number(hasDirectCodes) + Number(hasDirectDesignations) + Number(hasIdentityBinding) !== 1) {
      rejectionReasons.push('must use exactly one evidence path: scope.codes or identityBindingRef for exact codes; scope.designations or identityBindingRef for official designations');
    } else if (hasDirectIdentity) {
      if (!isNonEmptyUniqueStringArray(scope[identity.scopeKey]) || !scope[identity.scopeKey].includes(identity.value)) rejectionReasons.push(identity.type === 'exactCode'
        ? `scope codes do not explicitly include exact record code ${identity.value}`
        : `scope designations do not explicitly include target identity ${identity.value}`);
      if (!sourceHasField(source, identity.field)) rejectionReasons.push(identity.type === 'exactCode'
        ? 'direct-code evidence must declare code in fields'
        : `direct identity evidence must declare ${identity.field} in fields`);
    } else if (hasDirectCodes || hasDirectDesignations) {
      rejectionReasons.push(`direct evidence uses ${identity.type === 'exactCode' ? 'designations' : 'codes'} for the wrong identity type`);
    } else {
      if (!isNonEmptyString(source.identityBindingRef)) rejectionReasons.push('identityBindingRef is empty');
      if (scope?.level !== 'exactVariant') rejectionReasons.push('identity-bridge supplemental scope must be exactVariant');
      if (STRICT_IDENTITY_FIELDS.some((field) => sourceHasField(source, field))) rejectionReasons.push('identity-bridge supplemental source must not claim identity coverage');
    }

    if (tier === 'B') {
      for (const performanceField of ['performance.powerKw', 'performance.torqueNm']) {
        const declaresClaim = sourceHasField(source, performanceField) || sourceHasField(source, `${performanceField}.rpm`);
        if (!declaresClaim) continue;
        if (!isObject(source.claims) || !Object.hasOwn(source.claims, performanceField)) {
          rejectionReasons.push(`Tier B ${performanceField} coverage requires a structured claims value`);
        } else if (!sameClaim(source.claims[performanceField], valueAtPath(record, performanceField))) {
          rejectionReasons.push(`Tier B ${performanceField} claim conflicts with the stored record value`);
        }
      }
    }

    if (rejectionReasons.length) {
      rejectionReasons.forEach((reason) => addError(errors, `${label}: sourceRef ${sourceRef} is not accepted: ${reason}.`));
      continue;
    }
    accepted.set(sourceRef, source);
    if (hasDirectIdentity) acceptedDirect.set(sourceRef, source);
    else bridgeCandidates.push({ sourceRef, source });
  }

  const identitySources = new Map([...acceptedDirect].filter(([, source]) => (
    (identity.type === 'exactCode' || (source.evidenceTier === 'A' && OFFICIAL_SOURCE_TYPES.includes(source.type)))
    && source.scope?.level === 'exactVariant'
    && sourceHasField(source, identity.field)
    && sourceHasField(source, 'applications')
    && sourceHasField(source, 'years')
    && sameStringSet(source.scope.applications, recordScope.applications)
  )));

  for (const { sourceRef, source } of bridgeCandidates) {
    const bindingRef = source.identityBindingRef;
    const binding = sourcesById.get(bindingRef);
    const rejectionReasons = [];
    if (!binding) rejectionReasons.push(`identityBindingRef ${bindingRef} does not resolve to an existing source id`);
    else {
      if (!referencedSourceIds.has(bindingRef)) rejectionReasons.push(`identityBindingRef ${bindingRef} is not included in verification.sourceRefs`);
      if (Object.hasOwn(binding, 'identityBindingRef')) rejectionReasons.push(`identityBindingRef ${bindingRef} points to a supplemental binding; chains and cycles are not allowed`);
      if (binding.scope?.level !== 'exactVariant') rejectionReasons.push(`identityBindingRef ${bindingRef} does not point to an exactVariant source`);
      if (!identitySources.has(bindingRef)) rejectionReasons.push(`identityBindingRef ${bindingRef} is not an accepted exact identity source declaring ${identity.field}, applications and years`);
      if (!sameStringSet(source.scope?.applications, binding.scope?.applications)) rejectionReasons.push(`application scope does not exactly match identityBindingRef ${bindingRef}`);
    }
    rejectionReasons.forEach((reason) => addError(errors, `${label}: sourceRef ${sourceRef} is not accepted: ${reason}.`));
    if (rejectionReasons.length) accepted.delete(sourceRef);
  }

  const identityTierLabel = identity.type === 'officialPublicDesignation' ? 'Tier A' : 'Tier A/B';
  addErrorIf(identitySources.size === 0, `${label}: no accepted ${identityTierLabel} sourceRef declares the exact ${identityLabel(identity)}, applications and years identity binding.`, errors);

  let fieldsUsingTierBCorroboration = 0;
  for (const field of requiredFields) {
    if (!recordHasCoverageField(record, field)) addError(errors, `${label}: verified record is missing required field ${field}.`);
    const fieldSources = [...accepted.values()].filter((source) => sourceHasField(source, field));
    const tierA = fieldSources.filter((source) => source.evidenceTier === 'A');
    const tierB = fieldSources.filter((source) => source.evidenceTier === 'B');
    if (record.verification.evidenceBasis === 'official') {
      if (tierA.length === 0) addError(errors, `${label}: official evidence field ${field} is not covered by Tier A evidence.`);
    } else if (tierA.length === 0) {
      if (!hasIndependentPair(tierB)) {
        addError(errors, `${label}: corroborated evidence field ${field} requires Tier A or two independent Tier B publishers with different domains and data origins.`);
      } else {
        fieldsUsingTierBCorroboration += 1;
      }
    }
  }
  if (record.verification.evidenceBasis === 'corroborated' && fieldsUsingTierBCorroboration === 0) {
    addError(errors, `${label}: corroborated evidenceBasis requires at least one mandatory field to rely on two independent Tier B publishers.`);
  }
}

function validateCorroboratedPolicy(hasPerformance, sources, label, errors) {
  addErrorIf(!hasPerformance, `${label}: corroborated records must include performance.`, errors);
  addErrorIf(sources.length < 2, `${label}: corroborated records must include at least two sources.`, errors);

  sources.forEach((source, sourceIndex) => {
    const sourceLabel = `${label}: verification.sources[${sourceIndex}]`;
    addErrorIf(source?.type !== 'technicalReference', `${sourceLabel}.type must be technicalReference for corroborated records.`, errors);
    addErrorIf(!sourceHasField(source, 'performance.powerKw'), `${sourceLabel}.fields must include performance.powerKw.`, errors);
    addErrorIf(!sourceHasField(source, 'performance.torqueNm'), `${sourceLabel}.fields must include performance.torqueNm.`, errors);
    addErrorIf(!sourceHasIdentityField(source), `${sourceLabel}.fields must include code or aliases.`, errors);
    addErrorIf(!sourceHasPageNotes(source), `${sourceLabel}.pageNotes must explain the engine identity and performance range.`, errors);
  });

  const publishers = new Set(sources.map((source) => normalizePublisher(source?.publisher)).filter(Boolean));
  addErrorIf(publishers.size < 2, `${label}: corroborated sources must have at least two independent publishers.`, errors);

  const domains = new Set(sources.map((source) => normalizeHostname(source?.url)).filter(Boolean));
  addErrorIf(domains.size < 2, `${label}: corroborated sources must have at least two independent domains.`, errors);
}

function validateLegacyPendingPolicy(hasPerformance, sources, label, errors) {
  addErrorIf(hasPerformance, `${label}: legacyPending records must not include performance.`, errors);
  addErrorIf(sources.length > 0, `${label}: legacyPending records must not claim sources.`, errors);
}

function addErrorIf(condition, message, errors) {
  if (condition) addError(errors, message);
}
