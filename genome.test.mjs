// DriftScore as a cell of the estate genome: its judge (the kernel's own recompute), its lane and its health.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { judge, inLane, health } from './genome/cell.mjs';

const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
const PAIR = { distA: { a: 10, b: 10 }, distB: { a: 20 } };   // the kernel's own test: drift 0.5

test('judge: a claimed score the kernel recomputes is verified; a wrong one is not', async () => {
  assert.equal(await judge({ ...PAIR, score: 0.5 }), 'verified');
  assert.equal(await judge({ ...PAIR, score: 0 }), 'unverified', 'claiming no drift where there is drift');
  assert.equal(await judge({ distA: { a: 3, b: 7 }, distB: { a: 3, b: 7 }, score: 0 }), 'verified');
  assert.equal(await judge({ distA: { a: 5 }, distB: { b: 5 }, score: 1 }), 'verified');
  assert.equal(await judge({ distA: { a: 5 }, distB: { b: 5 }, score: 0.99 }), 'unverified');
  assert.equal(await judge({ ...PAIR, score: NaN }), 'unverified');
});

test('judge: the claim is held to six decimal places', async () => {
  const third = { distA: { a: 1, b: 2 }, distB: { a: 2, b: 1 } };   // drift exactly 1/3
  assert.equal(await judge({ ...third, score: 0.333333 }), 'verified');
  assert.equal(await judge({ ...third, score: 1 / 3 }), 'verified');
  assert.equal(await judge({ ...third, score: 0.333334 }), 'unverified');
  assert.equal(await judge({ ...third, score: 0.33333 }), 'unverified');
});

test('judge: no claimed number, or nothing the kernel can score, is refused', async () => {
  for (const b of [{ ...PAIR }, { ...PAIR, score: '0.5' }, { ...PAIR, score: null }, { distA: {}, distB: { a: 1 }, score: 1 },
    { distA: { a: -1, b: 2 }, distB: { a: 1 }, score: 0 }, null, 'x', seed.boundary.outOfLane]) {
    assert.equal(await judge(b), 'refused', String(JSON.stringify(b)));
  }
});

test('judge: the seed cases split good from bad', async () => {
  assert.equal(await judge(seed.judge.cases.good), 'verified');
  assert.equal(await judge(seed.judge.cases.bad), 'unverified');
});

test('lane: two scorable distributions are in lane; each way of failing the kernel\'s validation is out', async () => {
  assert.equal(await inLane(PAIR), true);
  assert.equal(await inLane(seed.boundary.inLane), true);
  assert.equal(await inLane({ distA: { a: 0, b: 5 }, distB: { a: 1 } }), true);
  const bad = [null, undefined, 'x', 5, {}, seed.boundary.outOfLane, { distA: { a: 1 } }, { distB: { a: 1 } },
    { distA: {}, distB: { a: 1 } }, { distA: { a: 1 }, distB: {} }, { distA: { a: 0 }, distB: { a: 1 } }, { distA: { a: 1 }, distB: { a: 0 } },
    { distA: { a: -1, b: 2 }, distB: { a: 1 } }, { distA: { a: 1 }, distB: { a: NaN } }, { distA: [1, 2], distB: { a: 1 } },
    { distA: { a: '1' }, distB: { a: 1 } }];
  for (const b of bad) assert.equal(await inLane(b), false, String(JSON.stringify(b)));
});

test('health says what DriftScore cannot measure from inside its repository', async () => {
  assert.deepEqual(await health(), { used: null, dependedOn: null, lastEarned: null });
});
