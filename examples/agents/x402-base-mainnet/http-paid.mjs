import { createHash } from 'node:crypto';

import { x402Client } from '@x402/core/client';
import {
  decodePaymentRequiredHeader,
  decodePaymentResponseHeader,
} from '@x402/core/http';
import { toClientEvmSigner } from '@x402/evm';
import { ExactEvmScheme } from '@x402/evm/exact/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

import {
  BASE_MAINNET_NETWORK,
  buyerPrivateKey,
  expectedPaymentSelector,
  resourceUrl,
} from './payment-policy.mjs';
import { requireSignedOffer, requireSignedReceipt } from './signed-artifacts.mjs';

const MAX_RESPONSE_BYTES = 1024 * 1024;
let stage = 'configuration';

function requirePrivateNoStore(response) {
  const directives = new Set(
    (response.headers.get('cache-control') ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase()),
  );
  if (!directives.has('private') || !directives.has('no-store')) {
    throw new Error('x402 response is not private and non-cacheable');
  }
}

async function boundedBody(response) {
  const contentLength = response.headers.get('content-length');
  if (
    contentLength !== null &&
    (!/^\d+$/.test(contentLength) || BigInt(contentLength) > BigInt(MAX_RESPONSE_BYTES))
  ) {
    throw new Error('response exceeds the public example cap');
  }
  if (!response.body) {
    return Buffer.alloc(0);
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error('response exceeds the public example cap');
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks, total);
}

async function main() {
  const resource = resourceUrl();
  const account = privateKeyToAccount(buyerPrivateKey());
  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'),
  });
  const paymentClient = new x402Client(expectedPaymentSelector()).register(
    BASE_MAINNET_NETWORK,
    new ExactEvmScheme(toClientEvmSigner(account, publicClient)),
  );

  let unsignedAttempts = 0;
  let signedAttempts = 0;
  let signedOfferVerified = false;
  let signedRequest;
  const observingFetch = async (input, init) => {
    const request = new Request(input, init);
    if (
      request.url !== resource.href ||
      request.method !== 'GET' ||
      request.headers.has('authorization') ||
      request.headers.has('x-pubfi-api-key')
    ) {
      throw new Error('x402 request boundary changed');
    }
    if (request.headers.has('PAYMENT-SIGNATURE')) {
      signedAttempts += 1;
      if (signedAttempts !== 1) {
        throw new Error('client attempted more than one payment authorization');
      }
      signedRequest = request.clone();
    } else {
      unsignedAttempts += 1;
      if (unsignedAttempts !== 1) {
        throw new Error('client sent an unexpected unsigned retry');
      }
    }
    const response = await fetch(request);
    if (!request.headers.has('PAYMENT-SIGNATURE')) {
      const paymentRequiredHeader = response.headers.get('PAYMENT-REQUIRED');
      if (response.status !== 402 || !paymentRequiredHeader) {
        throw new Error('unsigned response omitted the x402 challenge');
      }
      await requireSignedOffer(decodePaymentRequiredHeader(paymentRequiredHeader), resource);
      signedOfferVerified = true;
    }
    requirePrivateNoStore(response);
    return response;
  };

  stage = 'paid HTTP request';
  const paidResponse = await wrapFetchWithPayment(observingFetch, paymentClient)(resource, {
    method: 'GET',
    redirect: 'error',
  });
  if (!paidResponse.ok || unsignedAttempts !== 1 || signedAttempts !== 1 || !signedRequest) {
    throw new Error('official client did not complete one bounded payment');
  }
  const paymentResponse = paidResponse.headers.get('PAYMENT-RESPONSE');
  if (!paymentResponse) {
    throw new Error('paid response omitted PAYMENT-RESPONSE');
  }
  const receipt = await requireSignedReceipt(
    decodePaymentResponseHeader(paymentResponse),
    resource,
    account.address,
  );
  const paidBody = await boundedBody(paidResponse);

  stage = 'exact HTTP replay';
  const replayResponse = await fetch(signedRequest.clone());
  requirePrivateNoStore(replayResponse);
  const replayBody = await boundedBody(replayResponse);
  if (
    replayResponse.status !== paidResponse.status ||
    replayResponse.headers.get('PAYMENT-RESPONSE') !== paymentResponse ||
    !paidBody.equals(replayBody)
  ) {
    throw new Error('exact replay differs from the settled response');
  }

  process.stdout.write(
    `${JSON.stringify({
      client: '@x402/fetch@2.19.0',
      network: BASE_MAINNET_NETWORK,
      payer: account.address,
      initialStatus: 402,
      paidStatus: paidResponse.status,
      paymentResponseObserved: true,
      signedOfferVerified,
      signedReceiptVerified: true,
      signerKeyId: receipt.keyId,
      transaction: receipt.transaction,
      exactReplay: true,
      bodyBytes: paidBody.byteLength,
      bodySha256: createHash('sha256').update(paidBody).digest('hex'),
    })}\n`,
  );
}

main().catch(() => {
  process.stderr.write(`x402 HTTP example failed at ${stage}\n`);
  process.exitCode = 1;
});
