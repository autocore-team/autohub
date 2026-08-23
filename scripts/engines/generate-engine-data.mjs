import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  ROOT_DIR,
  SOURCE_REGIONS_DIR,
  SOURCE_DIR,
  generatedOutputs,
  readSourceData,
  readText,
  writeText
} from './lib.mjs';

const checkOnly = process.argv.includes('--check');
const validation = spawnSync(process.execPath, ['scripts/engines/validate-engine-data.mjs'], {
  cwd: ROOT_DIR,
  encoding: 'utf8',
  stdio: 'inherit'
});

if (validation.status !== 0) {
  process.exit(validation.status || 1);
}

const sourceData = readSourceData();
const outputs = generatedOutputs(sourceData);
const changed = [];

for (const [filePath, content] of outputs) {
  const current = readText(filePath);
  if (current !== content) {
    changed.push(filePath);
  }
}

if (checkOnly && changed.length) {
  console.error(`Generated engine files are out of date with ${SOURCE_REGIONS_DIR}:`);
  changed.forEach((filePath) => console.error(`- ${filePath}`));
  process.exit(1);
}

if (checkOnly) {
  console.log('Generated engine files are up to date.');
} else {
  const temporaryFiles = [];

  try {
    changed.forEach((filePath) => {
      if (filePath.includes(`${SOURCE_DIR}\\`) || filePath.includes(`${SOURCE_DIR}/`)) {
        throw new Error(`Refusing to write source file as generated output: ${filePath}`);
      }
    });

    changed.forEach((filePath, index) => {
      const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}-${index}`;
      writeText(tempPath, outputs.get(filePath));
      temporaryFiles.push({ tempPath, filePath });
    });

    for (const { tempPath, filePath } of temporaryFiles) {
      fs.renameSync(tempPath, filePath);
    }
  } catch (error) {
    for (const { tempPath } of temporaryFiles) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
    console.error(`Engine data generation failed: ${error.message}`);
    process.exit(1);
  }

  if (changed.length) {
    console.log(`Generated ${changed.length} engine data file(s).`);
    changed.forEach((filePath) => console.log(`- ${filePath}`));
  } else {
    console.log('Generated engine files already matched source data.');
  }
}
