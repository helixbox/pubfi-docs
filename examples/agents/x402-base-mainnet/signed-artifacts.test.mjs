import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalJson } from './signed-artifacts.mjs';

test('serializes supported values as canonical JSON', () => {
  assert.equal(
    canonicalJson({
      z: null,
      a: [333333333.33333329, 1e30, 4.5, 0.002, 1e-27, -0],
      text: '€$\u000f\nA',
      nested: { b: true, a: false },
    }),
    '{"a":[333333333.3333333,1e+30,4.5,0.002,1e-27,0],"nested":{"a":false,"b":true},"text":"€$\\u000f\\nA","z":null}',
  );
});

test('rejects lone Unicode surrogates and unsupported values', () => {
  assert.throws(() => canonicalJson('\ud800'), /lone Unicode surrogate/);
  assert.throws(() => canonicalJson('\udfff'), /lone Unicode surrogate/);
  assert.throws(() => canonicalJson({ '\ud800': 'value' }), /lone Unicode surrogate/);
  assert.throws(() => canonicalJson(undefined), /unsupported JSON value/);
  assert.throws(() => canonicalJson(Number.POSITIVE_INFINITY), /non-finite number/);
});
