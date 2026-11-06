import fs from 'node:fs';
import { generatedOilFile, generatedOilFileMatches, generatedPath } from './generate.mjs';
import { loadCanonical, validateCanonical } from './validate.mjs';

const canonical = loadCanonical();
const summary = validateCanonical(canonical);
const expected = generatedOilFile(canonical);
const current = fs.readFileSync(generatedPath, 'utf8');
if (!generatedOilFileMatches(current, expected)) throw new Error('oil-data.js is stale. Run npm run oil:generate.');
console.log(`Generated oil data is up to date: ${summary.records} selectable records; ${summary.legacyRecords} legacy records.`);
