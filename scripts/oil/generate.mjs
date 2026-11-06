import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCanonical, root, validateCanonical } from './validate.mjs';

export const generatedPath = path.join(root, 'oil-data.js');

export function toPublicOilData(canonical) {
  return {
    schemaVersion: canonical.schemaVersion,
    audit: canonical.audit,
    records: canonical.records,
    legacyRecords: canonical.legacyRecords.map((record) => ({
      id: record.id,
      make: record.make,
      model: record.model,
      generation: record.generation,
      years: record.years,
      engine: record.engine,
      status: 'legacyPending',
      productionReady: false,
      migrationIssues: record.migrationIssues
    }))
  };
}

export function generatedOilFile(canonical) {
  const publicData = toPublicOilData(canonical);
  return `// This file is generated from data/oil/canonical.json. Do not edit manually.\n(function (root, factory) {\n  const data = factory();\n  if (typeof module === 'object' && module.exports) module.exports = data;\n  if (root) root.AUTOHUB_OIL_DATA = data;\n})(typeof window !== 'undefined' ? window : globalThis, function () {\n  return ${JSON.stringify(publicData, null, 2)};\n});\n`;
}

export function generatedOilFileMatches(current, expected) {
  return current.replaceAll('\r\n', '\n') === expected.replaceAll('\r\n', '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const canonical = loadCanonical();
  const summary = validateCanonical(canonical);
  fs.writeFileSync(generatedPath, generatedOilFile(canonical));
  console.log(`Generated oil-data.js from ${summary.records} selectable records and ${summary.legacyRecords} migrated legacy records.`);
}
