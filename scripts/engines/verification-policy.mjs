export const VERIFICATION_STATUSES = ['verified', 'corroborated', 'legacyPending'];
const SOURCE_TYPES = ['manufacturer', 'technicalReference', 'serviceDocumentation', 'certificationDocument'];
const OFFICIAL_SOURCE_TYPES = ['manufacturer', 'serviceDocumentation', 'certificationDocument'];

const PERFORMANCE_FIELDS = ['performance.powerKw', 'performance.torqueNm'];
const IDENTITY_FIELDS = ['code', 'aliases'];

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
}

export function validateRecordVerificationPolicy(record, label, errors) {
  const verification = record?.verification;
  const hasPerformance = isObject(record) && Object.hasOwn(record, 'performance');
  const hasSourcesProperty = isObject(verification) && Object.hasOwn(verification, 'sources');
  const sources = Array.isArray(verification?.sources) ? verification.sources : [];

  addErrorIf(!isObject(verification), `${label}: verification must be an object.`, errors);
  addErrorIf(!VERIFICATION_STATUSES.includes(verification?.status), `${label}: verification.status must be verified, corroborated or legacyPending.`, errors);
  if (hasSourcesProperty) {
    addErrorIf(!Array.isArray(verification.sources), `${label}: verification.sources must be an array.`, errors);
  }
  if (Array.isArray(verification?.sources)) {
    verification.sources.forEach((source, sourceIndex) => validateSource(source, `${label}: verification.sources[${sourceIndex}]`, errors));
  }

  if (hasPerformance) {
    validateRange(record.performance?.powerKw, `${label}: performance.powerKw`, errors);
    validateRange(record.performance?.torqueNm, `${label}: performance.torqueNm`, errors);
  }

  if (verification?.status === 'verified') {
    validateVerifiedPolicy(hasPerformance, sources, label, errors);
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

function validateVerifiedPolicy(hasPerformance, sources, label, errors) {
  addErrorIf(!hasPerformance, `${label}: verified records must include performance.`, errors);
  addErrorIf(sources.length === 0, `${label}: verified records must include at least one source.`, errors);

  const hasOfficialSource = sources.some((source) => (
    OFFICIAL_SOURCE_TYPES.includes(source.type) && sourceHasPerformanceAndIdentity(source)
  ));
  addErrorIf(
    !hasOfficialSource,
    `${label}: verified records must include an official source linking performance.powerKw, performance.torqueNm and code or aliases.`,
    errors
  );
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
