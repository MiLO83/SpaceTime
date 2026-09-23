import { test } from 'node:test';
import assert from 'node:assert/strict';
import { observe } from '../physics.js';
test('existing telescope sees the past, but reply reaches Earth later', () => {
  const r = observe('existing', 100, .5, 2026);
  assert.equal(r.seen, 1926); assert.equal(r.arrival, 2026); assert.equal(r.received, 2126);
});
test('launch cannot catch pre-launch light even near light speed', () => {
  for (const d of [1,100,1000]) for (const speed of [.01,.5,.99,.999999]) {
    const r = observe('launch', d, speed, 2026);
    assert.ok(r.seen > 2026); assert.equal(r.received-r.arrival,d);
  }
  assert.equal(observe('launch',100,.5,2026).seen,2126);
});
test('existing mirror returns twice the one-way lookback', () => {
  const r = observe('mirror',100,.5,2026);
  assert.equal(r.seen,1826); assert.equal(r.received,2026);
});
test('one km detail at 100 ly requires roughly 635 thousand km aperture', () => {
  assert.ok(Math.abs(observe('existing',100,.5).apertureKm - 634815) < 1);
});
test('reject superluminal or nonpositive inputs', () => {
  assert.throws(() => observe('launch', 100, 1), RangeError);
  assert.throws(() => observe('existing', 0, .5), RangeError);
});
