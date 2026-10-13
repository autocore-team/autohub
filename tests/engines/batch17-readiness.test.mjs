import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';
import { engineIdentityCollisionErrors } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch17-readiness.json', import.meta.url)));
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');
const baselineLimits = { europe: 715, japan: 451, korea: 65, 'north-america': 171, 'south-america': 0 };
const baseline = data.regionFiles.flatMap((file) => file.records.slice(0, baselineLimits[file.region]));
const added = data.records.filter((record) => record.id.startsWith('batch17-'));
const baselineUrls = new Set(baseline.flatMap((record) => record.verification?.sources?.map((source) => source.url) ?? []));
const initialFive = [
  'batch17-mercedes-e200-w214-2024',
  'batch17-bmw-m4-competition-rwd-2024',
  'batch17-audi-rs6-avant-gt-2024',
  'batch17-porsche-panamera-4-2024',
  'batch17-ford-mustang-dark-horse-na-2024'
];

assert.equal(fixture.batch, '17');
assert.equal(fixture.production.initialConfirmed, 5);
assert.equal(fixture.production.additionalProvisional, 120);
assert.equal(fixture.production.totalProvisional, 125);
assert.equal(fixture.production.recoveredDraftCandidates, 100);
assert.equal(fixture.production.freshReplacementCandidates, 20);
assert.equal(fixture.production.retainedRecovered, 76);
assert.equal(fixture.production.retainedFresh, 24);
assert.equal(fixture.production.removedCollisions, 25);
assert.equal(fixture.production.accepted, 100);
assert.equal(fixture.production.removedCollisionIds.length, 25);
assert.equal(new Set(fixture.production.removedCollisionIds).size, 25);
assert.equal(fixture.productionIds.length, 100);
assert.equal(new Set(fixture.productionIds).size, 100);
assert.ok(initialFive.every((id) => fixture.productionIds.includes(id)), 'One of the five confirmed candidates was not retained');

assert.equal(baseline.length, fixture.baseline.records);
assert.equal(digest(baseline), fixture.baseline.semanticHash);
assert.equal(added.length, 100);
assert.deepEqual(added.map((record) => record.id).sort(), fixture.productionIds.toSorted());
assert.equal(data.records.length, fixture.result.records);
assert.equal(data.records.filter((record) => record.verification.status === 'verified').length, fixture.result.verified);
assert.equal(data.records.filter((record) => record.verification.status === 'legacyPending').length, fixture.result.legacyPending);
assert.equal(digest(data.records), fixture.result.semanticHash);
assert.deepEqual(Object.fromEntries(['europe', 'japan', 'korea', 'north-america', 'south-america'].map((region) => [
  region,
  data.records.filter((record) => record.regionKey === region).length
])), fixture.result.regions);

const urls = [];
for (const record of added) {
  assert.equal(record.identity.type, 'applicationScopedSpecification', record.id);
  assert.equal(record.identity.review.manualReviewConfirmed, true, record.id);
  assert.equal(record.identity.review.codeOrDesignationNotClaimed, true, record.id);
  assert.equal(record.verification.evidenceBasis, 'corroborated', record.id);
  assert.equal(record.completeness, 'core', record.id);
  assert.match(record.layout, /\b\d+ valves\b/, record.id);
  assert.match(record.layout, /\b\d+ camshafts? total\b/, record.id);
  assert.ok(Number.isFinite(record.performance.powerKw.min), `${record.id}: missing power`);
  assert.ok(Number.isFinite(record.performance.torqueNm.min), `${record.id}: missing torque`);
  assert.equal(Object.hasOwn(record.performance.powerKw, 'rpm') || Object.hasOwn(record.performance.torqueNm, 'rpm'), false, record.id);
  assert.equal(record.verification.sources.length, 2, record.id);
  assert.equal(new Set(record.verification.sources.map((source) => source.publisher)).size, 2, record.id);
  assert.equal(new Set(record.verification.sources.map((source) => new URL(source.url).hostname)).size, 2, record.id);
  assert.ok(record.verification.sources.every((source) => source.scope.level === 'exactVariant'), record.id);
  assert.ok(record.verification.sources.every((source) => !source.url.includes('automobile-catalog.com') || source.url.includes('/car/')), `${record.id}: non-exact Automobile-Catalog URL`);
  assert.ok(record.verification.sources.every((source) => !baselineUrls.has(source.url)), `${record.id}: baseline source URL reused`);
  assert.deepEqual(verificationPolicyErrors(record), [], record.id);
  urls.push(...record.verification.sources.map((source) => source.url));
}
assert.equal(urls.length, 200);
assert.equal(new Set(urls).size, 200);
assert.deepEqual(engineIdentityCollisionErrors(data.records), []);

console.log(`PASS Batch 17: 125 provisional - 25 collisions = 100 accepted, baseline ${digest(baseline)}, dataset ${digest(data.records)}`);
