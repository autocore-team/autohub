// Reviewed document -> engine row -> field evidence. No network or source inference.
const die = message => { throw new Error(message); };
const key = ref => `${ref?.sourceId}:${ref?.locatorId}`;
const same = (a, b) => key(a) === key(b);
const literal = (text, value) => new RegExp(`(^|[^A-Za-z0-9])${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^A-Za-z0-9])`, 'i').test(text);
const excluded = text => /\b(?:except|excluding|excluded|excludes|not applicable|not covered|only|limited|restricted)\b|\b(?:does|do) not apply\b/i.test(text);

function documentContext(record, ref, ctx) {
  const { source, locator } = ctx.resolve(ref), doc = locator.documentContext;
  if (!ctx.trusted(ref, 'application') || !doc || locator.tableRow || locator.tableCell || locator.contextRef || locator.applicabilityRef || doc.make !== record.make || doc.model !== record.model
    || record.productionYears.from !== record.productionYears.to || doc.modelYear !== record.productionYears.from
    || doc.heading !== `${record.model} ${doc.modelYear}` || !locator.excerpt.includes(doc.heading)
    || !literal(locator.excerpt, record.make) || excluded(locator.excerpt)) die('Document model/year context is not evidenced');
  if (doc.tables && (!Array.isArray(doc.tables) || new Set(doc.tables.map(t => t.tableId)).size !== doc.tables.length
    || doc.tables.some(t => !t.tableId?.trim() || ![t.variantColumn, t.engineCodeColumn, t.oilQualityColumn].every(h => typeof h === 'string' && h.trim() && locator.excerpt.includes(h))))) die('Document table headers/roles are not evidenced');
  return { source, locator };
}

function engineRow(record, ref, ctx) {
  const { source, locator } = ctx.resolve(ref), row = locator.tableRow;
  if (!ctx.trusted(ref, 'application') || !row || locator.documentContext || locator.tableCell || !Number.isInteger(row.rowIndex) || row.rowIndex < 1
    || !row.tableId?.trim() || !row.variant?.trim() || row.engineCode !== record.engineCode
    || !literal(locator.excerpt, row.variant) || !literal(locator.excerpt, row.engineCode)
    || !row.engineColumn?.trim() || !locator.section.includes(row.engineColumn)
    || !source.scope.engineCodes?.includes(record.engineCode) || excluded(locator.excerpt)) die('Engine row identity or applicability is not evidenced');
  const parent = documentContext(record, row.documentRef, ctx);
  if (parent.source.id !== source.id) die('Engine row must belong to its cited document');
  const table = parent.locator.documentContext.tables?.find(t => t.tableId === row.tableId);
  if (!table || row.engineColumn !== table.engineCodeColumn || !locator.section.includes(table.variantColumn)) die('Engine row does not match its document table headers');
  return { source, locator, row };
}

export function validateDocumentApplication(record, ctx) {
  const e = record.applicationEvidence, scope = e.documentScope;
  if (!scope || e.applications != null || e.engineScope || record.engineIdentity.type !== 'engineeringCode'
    || record.fieldEvidence.engineIdentity.state !== 'confirmed') die('Document row requires a confirmed engineering identity');
  for (const lang of ['en', 'es', 'fr', 'de']) if (!scope.description?.[lang]?.trim()) die('Document scope description must be localized');
  for (const ref of [scope.documentRef, scope.rowRef]) if (!e.evidenceRefs.some(r => same(r, ref))) die('Document scope lacks declared application evidence');
  documentContext(record, scope.documentRef, ctx);
  const { row } = engineRow(record, scope.rowRef, ctx);
  if (!same(row.documentRef, scope.documentRef) || row.variant !== scope.variant
    || !record.fieldEvidence.engineIdentity.evidenceRefs.some(r => same(r, scope.rowRef))) die('Document scope has an unbound or contradictory engine row');
  // Explicit links remain a required, acyclic proof, not a declaration of eligibility.
  if (!Array.isArray(scope.links) || scope.links.length !== 1 || scope.links[0].relation !== 'contains'
    || !same(scope.links[0].from, scope.documentRef) || !same(scope.links[0].to, scope.rowRef)
    || same(scope.documentRef, scope.rowRef)) die('Disconnected or cyclic document application chain');
  if (record.market.length === 1 && record.market[0] === 'UNKNOWN') {
    if (scope.marketRef) die('Unknown geography cannot carry a confirmed market binding');
  } else {
    if (record.market.some(m => ['UNKNOWN', 'GLOBAL', 'OTHER'].includes(m)) || !scope.marketRef
      || !e.evidenceRefs.some(r => same(r, scope.marketRef)) || !ctx.trusted(scope.marketRef, 'application')) die('Geography requires independent market evidence');
    const { locator } = ctx.resolve(scope.marketRef);
    if (!same(locator.contextRef, scope.documentRef) || !record.market.every(m => literal(locator.excerpt, ({ CA: 'Canada', US: 'United States', EU: 'Europe', JP: 'Japan' })[m] || m))
      || excluded(locator.excerpt)) die('Geographic applicability is not evidenced by the document binding');
  }
  if (record.serviceFillCapacity != null && record.fieldEvidence.serviceFillCapacity.evidenceRefs.some(ref => ctx.resolve(ref).locator.quantityType === 'volumeIncludingFilter')) die('Filter-inclusive document volume must remain evidence, not a service-fill value');
  return 'confirmed';
}

function cellRow(record, ref, ctx) {
  const { source, locator } = ctx.resolve(ref), cell = locator.tableCell;
  if (!cell || !cell.column?.trim() || !locator.section.includes(cell.column)
    || !Number.isInteger(cell.rowStart) || cell.rowStart < 1 || !Number.isInteger(cell.rowSpan) || cell.rowSpan < 1) die('Table field requires exact cell coordinates');
  const { row, source: rowSource } = engineRow(record, cell.rowRef, ctx);
  const parent = documentContext(record, row.documentRef, ctx);
  const table = parent.locator.documentContext.tables.find(t => t.tableId === row.tableId);
  if (cell.column !== table.oilQualityColumn) die('Combination cell is not the documented oil-quality column');
  if (source.id !== rowSource.id || cell.tableId !== row.tableId || row.rowIndex < cell.rowStart
    || row.rowIndex >= cell.rowStart + cell.rowSpan || !same(cell.rowRef, record.applicationEvidence.documentScope.rowRef)) die('Cell does not cover the selected engine row');
  return cell;
}

export function validateDocumentField(record, ref, field, ctx) {
  const scope = record.applicationEvidence.documentScope, { source, locator } = ctx.resolve(ref);
  if (excluded(locator.excerpt)) die(`Document ${field} contains an application exclusion`);
  if (['serviceFillCapacity', 'capacityUnit', 'capacityNote'].includes(field) && locator.quantityType !== 'serviceFillWithFilter') die('Document service-fill claim requires an evidenced fill type; filter-inclusive volume is not service-fill');
  if (field === 'engineIdentity') {
    if (!same(ref, scope.rowRef)) die('Engineering identity requires the direct document row');
    engineRow(record, ref, ctx);
    return;
  }
  if (!same(locator.applicabilityRef, scope.rowRef) || locator.engineCodes?.length !== 1
    || locator.engineCodes[0] !== record.engineCode || !source.scope.engineCodes?.includes(record.engineCode)) die(`Document ${field} lacks an explicit engine-row binding`);
  const root = ctx.resolve(scope.documentRef);
  if (source.id === root.source.id) {
    if (locator.tableCell) cellRow(record, ref, ctx);
    else if (!literal(locator.excerpt, record.engineCode)) die(`Document ${field} lacks row/cell context`);
  } else {
    // Composite source: its own evidenced model/year + explicit link to the direct row.
    const parent = documentContext(record, locator.contextRef, ctx);
    if (parent.source.id !== source.id || !literal(locator.excerpt, record.engineCode)) die('Supplemental field lacks a linked, matching document/engine context');
  }
}

export function validateTableRequirement(record, node, ref, ctx) {
  validateDocumentField(record, ref, 'oilRequirements', ctx);
  const { locator } = ctx.resolve(ref), cell = cellRow(record, ref, ctx), review = cell.interpretation;
  if (locator.relation !== 'allOf' || !review || review.kind !== 'specificationAndSae' || !review.notes?.trim()
    || !Number.isInteger(review.specificationIndex) || !Number.isInteger(review.saeIndex)) die('Table combination lacks a reviewed structural interpretation');
  const spec = record.oemOilSpecifications?.[review.specificationIndex], sae = record.allowedSaeViscosities[review.saeIndex];
  const expected = [{ field: 'allowedSaeViscosities', index: review.saeIndex }, { field: 'oemOilSpecifications', index: review.specificationIndex }];
  if (!spec || !sae || !node.allOf || node.allOf.length !== 2
    || !expected.every(e => node.allOf.some(n => n.field === e.field && n.index === e.index && !n.allOf && !n.anyOf))
    || !locator.fields.includes('oemOilSpecifications') || !locator.fields.includes('allowedSaeViscosities')) die('Table requirement does not match its SAE/specification fields');
  // In this table form one literal alternative is a specification immediately paired
  // with its SAE. Arbitrary words elsewhere in the row/document do not prove AND.
  const branches = locator.excerpt.trim().split(/\s+or\s+/i);
  if (!branches.some(branch => branch.trim() === `${spec} ${sae}`)) die('Cell does not contain the documented specification + SAE alternative');
  for (const field of ['oemOilSpecifications', 'allowedSaeViscosities']) if (!record.fieldEvidence[field].evidenceRefs.some(r => same(r, ref))) die('SAE/specification must cite the reviewed combination cell');
}
