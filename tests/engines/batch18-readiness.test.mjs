import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';
import { engineIdentityCollisionErrors } from '../../scripts/engines/validate-engine-data.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/batch18-readiness.json', import.meta.url)));
const data = readSourceData();
const digest = (value) => crypto.createHash('sha256').update(canonicalFingerprint(value)).digest('hex');
const baselineLimits = { europe: 767, japan: 457, korea: 65, 'north-america': 213, 'south-america': 0 };
const baseline = data.regionFiles.flatMap((file) => file.records.slice(0, baselineLimits[file.region]));
const added = data.records.filter((record) => record.id.startsWith('batch18-'));
const baselineUrls = new Set(baseline.flatMap((record) => record.verification?.sources?.map((source) => source.url) ?? []));

assert.equal(fixture.batch, '18');
assert.equal(fixture.production.initialProvisional, 125);
assert.equal(fixture.production.identityCollisionsRemoved, 16);
assert.equal(fixture.production.accepted, 100);
assert.equal(fixture.productionIds.length, 100);
assert.equal(new Set(fixture.productionIds).size, 100);
assert.equal(fixture.removedCollisionIds.length, 16);

assert.equal(baseline.length, fixture.baseline.records);
assert.equal(digest(baseline), fixture.baseline.semanticHash);
assert.equal(added.length, 100);
assert.deepEqual(added.map((record) => record.id).sort(), fixture.productionIds.toSorted());
assert.equal(data.records.length, fixture.result.records);
assert.equal(data.records.filter((record) => record.verification.status === 'verified').length, fixture.result.verified);
assert.equal(data.records.filter((record) => record.verification.status === 'legacyPending').length, fixture.result.legacyPending);
assert.equal(digest(data.records), fixture.result.semanticHash);
assert.deepEqual(Object.fromEntries(data.regionFiles.map((file) => [file.region, file.records.length])), fixture.result.regions);

const urls = [];
for (const record of added) {
  assert.equal(record.identity.type, 'applicationScopedSpecification', record.id);
  assert.equal(record.identity.review.manualReviewConfirmed, true, record.id);
  assert.equal(record.identity.review.codeOrDesignationNotClaimed, true, record.id);
  assert.equal(record.verification.evidenceBasis, 'corroborated', record.id);
  assert.equal(record.completeness, 'core', record.id);
  assert.match(record.layout, /\b\d+ valves\b/, record.id);
  assert.match(record.layout, /\b\d+ camshafts? total\b/, record.id);
  assert.ok(record.verification.sources.every((source) => source.pageNotes.some((note) => /total valves = .* valves\/cylinder × .* cylinders; .* total camshafts = .*\/bank/.test(note))), record.id);
  assert.ok(Number.isFinite(record.performance.powerKw.min), record.id);
  assert.ok(Number.isFinite(record.performance.torqueNm.min), record.id);
  assert.equal(Object.hasOwn(record.performance.powerKw, 'rpm') || Object.hasOwn(record.performance.torqueNm, 'rpm'), false, record.id);
  assert.equal(record.verification.sources.length, 2, record.id);
  assert.equal(new Set(record.verification.sources.map((source) => source.publisher)).size, 2, record.id);
  assert.equal(new Set(record.verification.sources.map((source) => new URL(source.url).hostname)).size, 2, record.id);
  assert.ok(record.verification.sources.every((source) => source.scope.level === 'exactVariant'), record.id);
  assert.ok(record.verification.sources.every((source) => !/\/models?(?:\/|$)|\/generation-|\/compare(?:\?|\/|$)|\/spec(?:\/|$)/i.test(new URL(source.url).pathname)), `${record.id}: index/compare URL`);
  assert.ok(record.verification.sources.every((source) => !source.url.includes('automobile-catalog.com') || source.url.includes('/car/')), record.id);
  assert.ok(record.verification.sources.every((source) => !baselineUrls.has(source.url)), `${record.id}: baseline source URL reused`);
  assert.deepEqual(verificationPolicyErrors(record), [], record.id);
  urls.push(...record.verification.sources.map((source) => source.url));
}
assert.equal(urls.length, 200);
assert.equal(new Set(urls).size, 200);
assert.deepEqual(engineIdentityCollisionErrors(data.records), []);

console.log(`PASS Batch 18: 125 provisional, audited and replaced to 100 accepted; baseline ${digest(baseline)}, dataset ${digest(data.records)}`);
