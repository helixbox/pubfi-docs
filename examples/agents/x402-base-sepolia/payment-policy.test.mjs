import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BASE_SEPOLIA_NETWORK,
  BASE_SEPOLIA_USDC,
  expectedPaymentSelector,
  mcpUrlForResource,
  resourceUrl,
} from './payment-policy.mjs';

const EXPECTED_PAY_TO = '0x1111111111111111111111111111111111111111';
const STAGING_RESOURCE =
  'https://api-stg.pubfi.ai/v1/gateway/quantro/health';

function withEnvironment(values, callback) {
  const previous = new Map();
  for (const [name, value] of Object.entries(values)) {
    previous.set(name, process.env[name]);
    process.env[name] = value;
  }
  try {
    return callback();
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
}

function payment(overrides = {}) {
  return {
    scheme: 'exact',
    network: BASE_SEPOLIA_NETWORK,
    amount: '10000',
    asset: BASE_SEPOLIA_USDC,
    payTo: EXPECTED_PAY_TO,
    maxTimeoutSeconds: 60,
    extra: {
      name: 'USDC',
      version: '2',
      assetTransferMethod: 'eip3009',
    },
    ...overrides,
  };
}

test('accepts only the exact PubFi Staging gateway and MCP origins', () => {
  withEnvironment({ X402_RESOURCE_URL: STAGING_RESOURCE }, () => {
    const resource = resourceUrl();
    assert.equal(resource.href, STAGING_RESOURCE);
    assert.equal(mcpUrlForResource(resource).href, 'https://mcp-stg.pubfi.ai/x402');
  });

  for (const rejected of [
    'https://api.pubfi.ai/v1/gateway/quantro/health',
    'https://api-stg.pubfi.ai.example/v1/gateway/quantro/health',
    'https://api-stg.pubfi.ai/v1/accounts',
    'https://api-stg.pubfi.ai/v1/gateway/quantro/health#fragment',
  ]) {
    withEnvironment({ X402_RESOURCE_URL: rejected }, () => {
      assert.throws(() => resourceUrl());
    });
  }

  assert.throws(() =>
    mcpUrlForResource(new URL('https://api.pubfi.ai/v1/gateway/quantro/health')),
  );
});

test('selects one bounded Base Sepolia exact payment', () => {
  withEnvironment({ X402_EXPECTED_PAY_TO: EXPECTED_PAY_TO }, () => {
    const expected = payment();
    assert.equal(expectedPaymentSelector()(2, [expected]), expected);
  });
});

test('rejects production, unbounded, and ambiguous payment terms', () => {
  withEnvironment({ X402_EXPECTED_PAY_TO: EXPECTED_PAY_TO }, () => {
    const select = expectedPaymentSelector();
    for (const rejected of [
      payment({ network: 'eip155:8453' }),
      payment({ amount: '10001' }),
      payment({ maxTimeoutSeconds: 301 }),
      payment({ asset: '0x2222222222222222222222222222222222222222' }),
      payment({ payTo: '0x3333333333333333333333333333333333333333' }),
    ]) {
      assert.throws(() => select(2, [rejected]));
    }
    assert.throws(() => select(1, [payment()]));
    assert.throws(() => select(2, [payment(), payment()]));
  });
});
