import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { canonicalFingerprint, readSourceData } from '../../scripts/engines/lib.mjs';
import { verificationPolicyErrors } from '../../scripts/engines/verification-policy.mjs';

export function checkBatch11() {
  const table = JSON.parse(fs.readFileSync(new URL('./fixtures/batch11-scopes.json', import.meta.url)));
  const data = readSourceData();
  const limits = { europe: 345, japan: 291, korea: 50, 'north-america': 105, 'south-america': 0 };
  const baseline = data.regionFiles.flatMap(f => f.records.slice(0, limits[f.region]));
  const tableIds = new Set(table.map(r => r.id));
  const added = data.records.filter(r => tableIds.has(r.id));
  const digest = x => crypto.createHash('sha256').update(canonicalFingerprint(x)).digest('hex');
  assert.equal(baseline.length, 791);
  assert.equal(digest(baseline), '51f99c7647b95cf56ef13d931d90c2aa27143969cc93d7fb840544eac85e58d0', 'Batch 11 changed baseline data/order');
  assert.deepEqual(added.map(r => r.id), table.map(r => r.id), 'Batch 11 metadata must account for every ID in regional order');
  assert.equal(new Set(table.map(r => r.id)).size, table.length);
  const normalize = x => String(x).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const signature = (r, model) => canonicalFingerprint({
    maker: normalize(r.maker), code: normalize(r.code), model: normalize(model),
    market: r.verification.scope.markets.map(normalize).sort(),
    liters: Math.round(Number(r.displacement.match(/([\d.]+)\s*L/)[1]) * 10) / 10,
    layout: normalize(r.layout.split(' · ')[0].replace('Inline-', 'I')),
    head: r.layout.includes('DOHC') ? 'DOHC' : r.layout.includes('SOHC') ? 'SOHC' : 'other',
    valves: r.layout.match(/(\d+) valves/)?.[1],
    cams: r.layout.match(/(\d+) camshafts total/)?.[1],
    fuel: r.fuelKey, aspiration: r.aspirationKey, injection: r.injectionKey, performance: r.performance
  });
  const seen = new Map();
  for (const expected of table) {
    const r = added.find(r => r.id === expected.id);
    assert.deepEqual(verificationPolicyErrors(r), [], r.id);
    assert.equal(r.verification.status, 'verified');
    assert.equal(r.verification.evidenceBasis, 'official');
    assert.equal(r.regionKey, 'japan');
    for (const [actual, value] of [[r.code, expected.code], [r.maker, expected.maker], [r.fuelKey, expected.fuel], [r.aspirationKey, expected.aspiration], [r.injectionKey, expected.injection]]) assert.equal(actual, value, r.id);
    assert.deepEqual(r.aliases, [], `${r.id} must not introduce broad aliases`);
    assert.deepEqual(r.verification.scope.markets, [expected.market]);
    assert.deepEqual(r.verification.scope.years, { from: expected.year, to: expected.year });
    assert.equal(r.displacement, expected.displacement ?? `${(expected.cc / 1000).toFixed(1)} L · ${expected.cc.toLocaleString('en-US')} cc`, r.id);
    const camshaftLabel = `${expected.cams} camshaft${expected.cams === 1 ? '' : 's'} total`;
    assert.ok(r.layout.includes(`${expected.valves} valves`) && r.layout.includes(camshaftLabel), r.id);
    const range = (n, rpm) => ({ min: n, max: n, rpm: { min: rpm[0], max: rpm[1] } });
    assert.deepEqual(r.performance, { powerKw: range(expected.power, expected.powerRpm), torqueNm: range(expected.torque, expected.torqueRpm) }, r.id);
    assert.ok(expected.reason && expected.baseModel && expected.generation);
    assert.ok(r.verification.sources.every(s => s.evidenceTier === 'A' && s.fields.length && s.pageNotes.length), r.id);
    assert.deepEqual(r.verification.sourceRefs, r.verification.sources.map(s => s.id));
    const key = signature(r, expected.baseModel);
    const cosmeticVariant = structuredClone(r);
    cosmeticVariant.years = String(expected.year + 1);
    cosmeticVariant.verification.scope.years = { from: expected.year + 1, to: expected.year + 1 };
    cosmeticVariant.applications = [`${expected.baseModel} Sport AWD automatic coupe`];
    cosmeticVariant.layout = cosmeticVariant.layout.replace(/ VTEC| i-VTEC| Dual-VTC| EXH| VTC/g, '');
    assert.equal(signature(cosmeticVariant, expected.baseModel), key, 'Year/trim/gearbox/body/head labels must not evade duplicate detection');
    assert.ok(!seen.has(key), `${r.id} duplicates ${seen.get(key)} (years/trim/body ignored)`);
    seen.set(key, r.id);
    for (const b of baseline) {
      if (![b.code, ...b.aliases].some(code => normalize(code) === normalize(r.code)) || !b.applications.some(a => normalize(a).includes(normalize(expected.baseModel)))) continue;
      assert.ok(b.performance && b.verification?.scope, `${r.id} overlaps unresolved baseline aggregate ${b.id}`);
      assert.notEqual(signature(b, expected.baseModel), key, `${r.id} duplicates baseline calibration ${b.id}`);
    }
  }
  const owners = Object.fromEntries([...new Set(table.map(r => r.code))].sort().map(code => [code, added.filter(r => [r.code, ...r.aliases].some(identity => normalize(identity) === normalize(code))).map(r => r.id).sort()]));
  for (const code of Object.keys(owners)) assert.deepEqual(owners[code], table.filter(r => r.code === code).map(r => r.id).sort(), `Unknown or stale repeated-code owner for ${code}`);
  console.log(`PASS Batch 11 ${added.length} implemented scopes: strict evidence, baseline preservation, duplicate and owner contracts`);
}

checkBatch11();
