import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as K from './kernel.mjs';

test('identical distributions score 0', () => {
  const a = { a: 3, b: 7 };
  const b = { a: 3, b: 7 };
  const result = K.driftScore(a, b);
  assert.equal(result.ok, true);
  assert.equal(result.value, 0);
});

test('fully disjoint distributions score 1', () => {
  const a = { a: 5 };
  const b = { b: 5 };
  const result = K.driftScore(a, b);
  assert.equal(result.ok, true);
  assert.equal(result.value, 1);
});

test('partial overlap with missing label produces 0.5', () => {
  const a = { a: 10, b: 10 };
  const b = { a: 20 };
  const result = K.driftScore(a, b);
  assert.equal(result.ok, true);
  assert.equal(result.value, 0.5);
});

test('empty distribution is rejected, not silently zero', () => {
  const result = K.driftScore({}, { a: 1 });
  assert.equal(result.ok, false);
  assert.equal(typeof result.why, 'string');
});

test('negative count is rejected without throwing', () => {
  const result = K.driftScore({ a: -1, b: 2 }, { a: 1, b: 1 });
  assert.equal(result.ok, false);
  assert.match(result.why, /negative/);
});

test('non-object input is rejected without throwing', () => {
  const result = K.driftScore(null, { a: 1 });
  assert.equal(result.ok, false);
  assert.equal(typeof result.why, 'string');
});

// --- boundary / clause-isolating probes added to kill survivors ---

test('negative count error message pins exact text (kills >= to > string mutant)', () => {
  const result = K.driftScore({ a: -1 }, { a: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.why, 'distA.a is negative (-1); counts must be >= 0');
});

test('zero count is valid, not treated as negative (kills v<0 -> v<=0 boundary)', () => {
  const result = K.driftScore({ a: 0, b: 5 }, { a: 0, b: 5 });
  assert.equal(result.ok, true);
  assert.equal(result.value, 0);
});

test('a finite-number check rejects NaN even though typeof is number (kills || -> &&)', () => {
  const result = K.driftScore({ a: NaN, b: 1 }, { a: 1, b: 1 });
  assert.equal(result.ok, false);
  assert.match(result.why, /finite number/);
});

test('normalize rejects a distribution whose total is exactly zero (kills t<=0 -> t<0)', () => {
  const result = K.normalize({ a: 0, b: 0 });
  assert.equal(result.ok, false);
  assert.match(result.why, /zero total/);
});

test('normalize accepts a valid nonzero-total distribution', () => {
  const result = K.normalize({ a: 1, b: 3 });
  assert.equal(result.ok, true);
  assert.equal(result.value.a, 0.25);
  assert.equal(result.value.b, 0.75);
});

test('driftScore rejects distB with total exactly zero (kills totalB<=0 -> totalB<0)', () => {
  const result = K.driftScore({ a: 5 }, { a: 0 });
  assert.equal(result.ok, false);
  assert.match(result.why, /distB/);
});
