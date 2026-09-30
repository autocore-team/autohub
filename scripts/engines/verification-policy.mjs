export const VERIFICATION_STATUSES = ['verified', 'corroborated', 'legacyPending'];
const SOURCE_TYPES = ['manufacturer', 'technicalReference', 'serviceDocumentation', 'certificationDocument'];
const OFFICIAL_SOURCE_TYPES = ['manufacturer', 'serviceDocumentation', 'certificationDocument'];
const SOURCE_SCOPE_LEVELS = ['exactVariant', 'family', 'aggregate'];

const PERFORMANCE_FIELDS = ['performance.powerKw', 'performance.torqueNm'];
const IDENTITY_FIELDS = ['code', 'aliases'];
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
  'aliases',
  'blockKey',
  'timingKey',
  'consumption'
]);

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
    const hasIdentityBinding = Object.hasOwn(source, 'identityBindingRef');
    if (hasDirectCodes === hasIdentityBinding) {
      rejectionReasons.push('must use exactly one evidence path: scope.codes or identityBindingRef');
    } else if (hasDirectCodes) {
      if (!isNonEmptyUniqueStringArray(scope.codes) || !scope.codes.includes(record?.code)) {
        rejectionReasons.push(`scope codes do not explicitly include exact record code ${record?.code || '(missing)'}`);
      }
      if (!sourceHasField(source, 'code')) {
        rejectionReasons.push('direct-code evidence must declare code in fields');
      }
    } else {
      if (!isNonEmptyString(source.identityBindingRef)) rejectionReasons.push('identityBindingRef is empty');
      if (scope?.level !== 'exactVariant') rejectionReasons.push('identity-bridge supplemental scope must be exactVariant');
      if (sourceHasField(source, 'code') || sourceHasField(source, 'aliases')) {
        rejectionReasons.push('identity-bridge supplemental source must not claim code or aliases coverage');
      }
    }

    if (rejectionReasons.length) {
      rejectionReasons.forEach((reason) => addError(errors, `${label}: sourceRef ${sourceRef} is not accepted: ${reason}.`));
      continue;
    }

    if (hasDirectCodes) directAccepted.set(sourceRef, source);
    else bridgeCandidates.push({ sourceRef, source });
  }

  const identitySources = new Map([...directAccepted].filter(([, source]) => (
    source.scope?.level === 'exactVariant'
    && sourceHasField(source, 'code')
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
      if (!identitySources.has(bindingRef)) rejectionReasons.push(`identityBindingRef ${bindingRef} is not an accepted exact identity source declaring code, applications and years`);
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
    `${label}: no accepted official sourceRef declares the exact code, applications and years identity binding.`,
    errors
  );

  const acceptedFields = new Set(acceptedSources.flatMap((source) => source.fields));
  for (const field of VERIFIED_REQUIRED_FIELDS) {
    if (!recordHasCoverageField(record, field)) {
      addError(errors, `${label}: verified record is missing required field ${field}.`);
    }
    if (!acceptedFields.has(field)) {
      const refs = sourceRefs.filter(isNonEmptyString).join(', ') || '(none)';
      addError(errors, `${label}: verified field ${field} is uncovered; sourceRefs [${refs}] do not declare it in fields.`);
    }
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
