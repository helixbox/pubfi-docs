import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import test from 'node:test';

import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { x402Client } from '@x402/core/client';
import { decodePaymentRequiredHeader, decodePaymentResponseHeader } from '@x402/core/http';
import { ExactEvmScheme } from '@x402/evm/exact/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { wrapMCPClientWithPayment } from '@x402/mcp';

import { BoundedMCPClient } from './mcp-boundary.mjs';
import { boundedResponse } from './bounded-response.mjs';
import { BASE_SEPOLIA_NETWORK, BASE_SEPOLIA_USDC, expectedPaymentSelector } from './payment-policy.mjs';
import { canonicalJson, requireSignedOffer, requireSignedReceipt } from './signed-artifacts.mjs';

const RESOURCE = new URL('https://api-stg.pubfi.ai/v1/gateway/example/status');
const PAYEE = '0x1111111111111111111111111111111111111111';
const PAYER = '0x2222222222222222222222222222222222222222';

class MockTransport {
  constructor(respond, initializeResult) { this.respond = respond; this.initializeResult = initializeResult; }
  async start() {}
  async close() { this.onclose?.(); }
  async send(message) {
    if (message.id === undefined) return;
    const response = message.method === 'initialize'
      ? { result: this.initializeResult ?? { protocolVersion: '2025-11-25', capabilities: {}, serverInfo: { name: 'mock', version: '1' } } }
      : this.respond(message);
    queueMicrotask(() => this.onmessage({ jsonrpc: '2.0', id: message.id, ...response }));
  }
}

async function connect(respond) {
  const client = new BoundedMCPClient({ name: 'test', version: '1' });
  await client.connect(new MockTransport(respond));
  return client;
}

function signedFixture() {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const did = 'did:web:api-stg.pubfi.ai';
  const keyId = `${did}#test`;
  const jwk = { ...publicKey.export({ format: 'jwk' }), alg: 'EdDSA', kid: keyId };
  const jws = (value) => {
    const header = Buffer.from(JSON.stringify({ alg: 'EdDSA', kid: keyId })).toString('base64url');
    const payload = Buffer.from(canonicalJson(value)).toString('base64url');
    const message = `${header}.${payload}`;
    return `${message}.${sign(null, Buffer.from(message), privateKey).toString('base64url')}`;
  };
  const requirement = {
    scheme: 'exact', network: BASE_SEPOLIA_NETWORK, amount: '10000', asset: BASE_SEPOLIA_USDC,
    payTo: PAYEE, maxTimeoutSeconds: 60,
    extra: { name: 'USDC', version: '2', assetTransferMethod: 'eip3009' },
  };
  const challenge = {
    x402Version: 2, resource: { url: RESOURCE.href }, accepts: [requirement],
    extensions: { 'offer-receipt': { info: { offers: [{ format: 'jws', acceptIndex: 0,
      signature: jws({ version: 1, resourceUrl: RESOURCE.href, ...requirement,
        validUntil: Math.floor(Date.now() / 1000) + 60 }) }] } } },
  };
  const receipt = {
    success: true, network: BASE_SEPOLIA_NETWORK, payer: PAYER, transaction: 'mock-transaction',
    extensions: { 'offer-receipt': { info: { receipt: { format: 'jws',
      signature: jws({ version: 1, resourceUrl: RESOURCE.href, network: BASE_SEPOLIA_NETWORK,
        payer: PAYER, transaction: 'mock-transaction', issuedAt: Math.floor(Date.now() / 1000) }) } } } },
  };
  const didDocument = { id: did, assertionMethod: [keyId],
    verificationMethod: [{ id: keyId, controller: did, publicKeyJwk: jwk }] };
  return { challenge, receipt, didDocument };
}

function paymentClient() {
  const signer = { address: PAYER, signTypedData: async () => `0x${'11'.repeat(65)}` };
  return new x402Client(expectedPaymentSelector()).register(BASE_SEPOLIA_NETWORK, new ExactEvmScheme(signer));
}

for (const status of [307, 308]) {
  test(`MCP transport blocks cross-origin ${status} with a payment body`, async () => {
    const requests = [];
    const transport = new StreamableHTTPClientTransport(new URL('https://trusted.example/x402'), {
      fetch: async (url, init) => {
        requests.push({ url: String(url), body: init.body });
        return boundedResponse(new Response(null, { status, headers: { location: 'https://other.example/x402' } }));
      },
    });
    await transport.start();
    await assert.rejects(transport.send({ jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { _meta: { 'x402/payment': 'harmless-test-marker' } } }));
    assert.equal(requests.length, 1);
    assert.match(requests[0].body, /harmless-test-marker/);
    await transport.close();
  });
}

test('MCP transport allows a same-origin redirect', async () => {
  const requests = [];
  const transport = new StreamableHTTPClientTransport(new URL('https://trusted.example/x402'), {
    fetch: async (url, init) => {
      requests.push({ url: String(url), body: init.body });
      return boundedResponse(requests.length === 1
        ? new Response(null, { status: 307, headers: { location: '/new-x402' } })
        : new Response(null, { status: 202 }));
    },
  });
  await transport.start();
  await transport.send({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: {} });
  assert.equal(requests[1].url, 'https://trusted.example/new-x402');
  await transport.close();
});

test('rejects oversized initialization metadata before schema validation', async () => {
  const raw = new BoundedMCPClient({ name: 'test', version: '1' });
  const initializeResult = { protocolVersion: '2025-11-25', capabilities: {},
    serverInfo: { name: 'mock', version: '1', icons: [{ sizes: Array(5000).fill(null) }] } };
  await assert.rejects(raw.connect(new MockTransport(() => ({}), initializeResult)), /public example limit/);
  await raw.close();
});

test('bounds streaming JSON and SSE bodies, including without content-length', async () => {
  for (const contentType of ['application/json', 'text/event-stream']) {
    const valid = await boundedResponse(new Response('data: small\n\n', { headers: { 'content-type': contentType } }));
    assert.equal(await valid.text(), 'data: small\n\n');
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(1024 * 1024));
        controller.enqueue(new Uint8Array(1));
        controller.close();
      },
    });
    const oversized = await boundedResponse(new Response(stream, { headers: { 'content-type': contentType } }));
    await assert.rejects(oversized.text(), /public example cap/);
  }
  await assert.rejects(boundedResponse(new Response('x', { headers: { 'content-length': '1048577' } })), /public example cap/);
});

test('rejects oversized MCP payment challenges before the payment client parses them', async () => {
  const challenge = { x402Version: 2, accepts: Array(5000).fill(null) };
  const variants = [
    { result: { isError: true, content: [], structuredContent: challenge } },
    { result: { isError: true, content: [{ type: 'text', text: JSON.stringify(challenge) }] } },
    { error: { code: 402, message: 'payment required', data: challenge } },
    { error: { code: -32042, message: 'payment required', data: { x402: challenge } } },
  ];
  for (const variant of variants) {
    const raw = await connect(() => variant);
    let approved = false;
    const client = wrapMCPClientWithPayment(raw, {}, { onPaymentRequested: () => { approved = true; } });
    await assert.rejects(client.callTool('pubfi.route.execute'), /public example limit/);
    assert.equal(approved, false);
    await client.close();
  }
});

test('rejects oversized MCP content and nested metadata before schema validation', async () => {
  const variants = [
    { content: Array(5000).fill(null) },
    { content: [{ type: 'text', text: 'x', annotations: { audience: Array(5000).fill(null) } }] },
    { content: [{ type: 'resource_link', icons: [{ sizes: Array(5000).fill(null) }] }] },
  ];
  for (const result of variants) {
    const raw = await connect(() => ({ result }));
    await assert.rejects(raw.callTool({ name: 'pubfi.route.execute' }), /public example limit/);
    await raw.close();
  }
});

test('mock HTTP and MCP payments preserve signed offers, receipts, and structured replay', async () => {
  const previousFetch = globalThis.fetch;
  const previousPayee = process.env.X402_EXPECTED_PAY_TO;
  const { challenge, receipt, didDocument } = signedFixture();
  let signatures = 0;
  process.env.X402_EXPECTED_PAY_TO = PAYEE;
  globalThis.fetch = async (url) => {
    assert.equal(String(url), 'https://api-stg.pubfi.ai/.well-known/did.json');
    return Response.json(didDocument);
  };
  try {
    const payloads = [];
    const raw = await connect((message) => {
      const payment = message.params?._meta?.['x402/payment'];
      if (!payment) return { result: { isError: true, content: [], structuredContent: challenge } };
      payloads.push(payment);
      return { result: { content: [{ type: 'text', text: 'mock result' }],
        structuredContent: { price: '12.34', rows: [1, 2] },
        _meta: { 'x402/payment-response': receipt } } };
    });
    const client = wrapMCPClientWithPayment(raw, paymentClient(), {
      onPaymentRequested: async ({ paymentRequired }) => {
        await requireSignedOffer(paymentRequired, RESOURCE, expectedPaymentSelector());
        signatures += 1;
        return true;
      },
    });
    const result = await client.callTool('pubfi.route.execute');
    assert.equal(result.paymentMade, true);
    assert.equal(signatures, 1);
    await requireSignedReceipt(result.paymentResponse, RESOURCE, PAYER);
    const replay = await raw.callTool({ name: 'pubfi.route.execute', _meta: { 'x402/payment': payloads[0] } });
    assert.deepEqual(replay.structuredContent, raw.firstPaidResult.structuredContent);
    assert.deepEqual(replay._meta['x402/payment-response'], result.paymentResponse);
    assert.deepEqual(payloads[1], payloads[0]);
    await client.close();

    let calls = 0;
    const encoded = (value) => Buffer.from(JSON.stringify(value)).toString('base64');
    const fetcher = async (input) => {
      const request = new Request(input);
      calls += 1;
      if (calls === 1) {
        await requireSignedOffer(challenge, RESOURCE, expectedPaymentSelector());
        return boundedResponse(new Response('{}', { status: 402, headers: { 'PAYMENT-REQUIRED': encoded(challenge) } }));
      }
      assert.ok(request.headers.get('PAYMENT-SIGNATURE'));
      return new Response('mock result', { headers: { 'PAYMENT-RESPONSE': encoded(receipt) } });
    };
    const response = await wrapFetchWithPayment(fetcher, paymentClient())(RESOURCE);
    assert.equal(response.status, 200);
    assert.equal(calls, 2);
    await requireSignedReceipt(decodePaymentResponseHeader(response.headers.get('PAYMENT-RESPONSE')), RESOURCE, PAYER);
    assert.deepEqual(decodePaymentRequiredHeader(encoded(challenge)), challenge);

    const changedChallenge = { ...challenge, accepts: [
      { ...challenge.accepts[0], extra: { ...challenge.accepts[0].extra, name: 'other' } },
      { ...challenge.accepts[0], amount: '9000' },
    ] };
    let paidAttempts = 0;
    const changedRaw = await connect((message) => {
      if (message.params?._meta?.['x402/payment']) paidAttempts += 1;
      return { result: { isError: true, content: [], structuredContent: changedChallenge } };
    });
    const changedClient = wrapMCPClientWithPayment(changedRaw, paymentClient(), {
      onPaymentRequested: ({ paymentRequired }) => requireSignedOffer(paymentRequired, RESOURCE, expectedPaymentSelector()),
    });
    await assert.rejects(changedClient.callTool('pubfi.route.execute'), /selected payment does not match/);
    assert.equal(paidAttempts, 0);
    await changedClient.close();

    let httpAttempts = 0;
    const changedFetch = async () => {
      httpAttempts += 1;
      await requireSignedOffer(changedChallenge, RESOURCE, expectedPaymentSelector());
      return new Response('{}', { status: 402, headers: { 'PAYMENT-REQUIRED': encoded(changedChallenge) } });
    };
    await assert.rejects(wrapFetchWithPayment(changedFetch, paymentClient())(RESOURCE), /selected payment does not match/);
    assert.equal(httpAttempts, 1);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousPayee === undefined) delete process.env.X402_EXPECTED_PAY_TO;
    else process.env.X402_EXPECTED_PAY_TO = previousPayee;
  }
});
