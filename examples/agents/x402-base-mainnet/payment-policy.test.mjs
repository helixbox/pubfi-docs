import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BASE_MAINNET_NETWORK,
  BASE_MAINNET_USDC,
  PAYMENT_MICRO_USDC,
  PRODUCTION_PAY_TO,
  expectedPaymentSelector,
  mcpUrlForResource,
  resourceUrl,
} from './payment-policy.mjs';

function payment(overrides = {}) {
  return {
    scheme: 'exact',
    network: BASE_MAINNET_NETWORK,
    amount: PAYMENT_MICRO_USDC.toString(),
    asset: BASE_MAINNET_USDC,
    payTo: PRODUCTION_PAY_TO,
    maxTimeoutSeconds: 60,
    extra: {
      name: 'USD Coin',
      version: '2',
      assetTransferMethod: 'eip3009',
    },
    ...overrides,
  };
}

test('disables the historical Production payment example', () => {
  assert.throws(() => resourceUrl(), /historical Production payment example is disabled/);
  assert.throws(() =>
    mcpUrlForResource(new URL('https://api-stg.pubfi.ai/v1/gateway/example/status')),
  );
});

test('selects one bounded Base mainnet exact payment', () => {
  const expected = payment();
  assert.equal(expectedPaymentSelector()(2, [expected]), expected);
});

test('rejects testnet, changed, unbounded, and ambiguous payment terms', () => {
  const select = expectedPaymentSelector();
  for (const rejected of [
    payment({ scheme: 'upto' }),
    payment({ network: 'eip155:84532' }),
    payment({ amount: '999' }),
    payment({ amount: '1001' }),
    payment({ maxTimeoutSeconds: 0 }),
    payment({ maxTimeoutSeconds: 301 }),
    payment({ asset: '0x2222222222222222222222222222222222222222' }),
    payment({ payTo: '0x3333333333333333333333333333333333333333' }),
    payment({ extra: { name: 'USD Coin', version: '1', assetTransferMethod: 'eip3009' } }),
    payment({ extra: { name: 'USD Coin', version: '2', assetTransferMethod: 'permit2' } }),
  ]) {
    assert.throws(() => select(2, [rejected]));
  }
  assert.throws(() => select(1, [payment()]));
  assert.throws(() => select(2, []));
  assert.throws(() => select(2, [payment(), payment()]));
  assert.throws(() => select(2, undefined));
});
