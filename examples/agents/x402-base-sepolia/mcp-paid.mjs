import assert from 'node:assert/strict';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { x402Client } from '@x402/core/client';
import { toClientEvmSigner } from '@x402/evm';
import { ExactEvmScheme } from '@x402/evm/exact/client';
import { wrapMCPClientWithPayment } from '@x402/mcp';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

import {
  BASE_SEPOLIA_NETWORK,
  buyerPrivateKey,
  expectedPaymentSelector,
  mcpUrlForResource,
  resourceUrl,
} from './payment-policy.mjs';
import { requireSignedOffer, requireSignedReceipt } from './signed-artifacts.mjs';

let stage = 'configuration';

async function main() {
  const resource = resourceUrl();
  const account = privateKeyToAccount(buyerPrivateKey());
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });
  const paymentClient = new x402Client(expectedPaymentSelector()).register(
    BASE_SEPOLIA_NETWORK,
    new ExactEvmScheme(toClientEvmSigner(account, publicClient)),
  );
  const rawClient = new Client({ name: 'pubfi-public-x402-example', version: '1.0.0' });
  const paidClient = wrapMCPClientWithPayment(rawClient, paymentClient, {
    autoPayment: true,
    onPaymentRequested: async ({ toolName, paymentRequired }) => {
      if (toolName !== 'pubfi.route.execute') {
        throw new Error('unexpected paid MCP tool');
      }
      await requireSignedOffer(paymentRequired, resource);
      return true;
    },
  });
  let submittedPayment;
  paidClient.onAfterPayment(({ paymentPayload }) => {
    if (submittedPayment) {
      throw new Error('client submitted more than one payment');
    }
    submittedPayment = paymentPayload;
  });

  await paidClient.connect(new StreamableHTTPClientTransport(mcpUrlForResource(resource)));
  try {
    const arguments_ = {
      raw_path: resource.pathname,
      method: 'GET',
      query: resource.search.slice(1),
    };

    stage = 'paid MCP tool call';
    const result = await paidClient.callTool('pubfi.route.execute', arguments_);
    if (
      result.isError ||
      result.paymentMade !== true ||
      !result.paymentResponse ||
      !submittedPayment
    ) {
      throw new Error('official MCP client did not complete one payment');
    }
    const receipt = await requireSignedReceipt(result.paymentResponse, resource, account.address);

    stage = 'exact MCP replay';
    const replayParams = {
      name: 'pubfi.route.execute',
      arguments: arguments_,
      _meta: { 'x402/payment': submittedPayment },
    };
    const replay = await rawClient.callTool(replayParams);
    if (replay.isError) {
      throw new Error('paid MCP replay failed');
    }
    assert.deepEqual(replay.structuredContent, result.structuredContent);
    assert.deepEqual(replay._meta?.['x402/payment-response'], result.paymentResponse);

    process.stdout.write(
      `${JSON.stringify({
        client: '@x402/mcp@2.19.0',
        network: BASE_SEPOLIA_NETWORK,
        payer: account.address,
        paymentMade: true,
        signedOfferVerified: true,
        signedReceiptVerified: true,
        signerKeyId: receipt.keyId,
        transaction: receipt.transaction,
        exactStructuredContentReplay: true,
        exactPaymentResponseReplay: true,
      })}\n`,
    );
  } finally {
    await paidClient.close();
  }
}

main().catch(() => {
  process.stderr.write(`x402 MCP example failed at ${stage}\n`);
  process.exitCode = 1;
});
