import { createPublicKey, verify } from 'node:crypto';

const OFFER_RECEIPT_EXTENSION = 'offer-receipt';

function compactJws(value) {
  if (typeof value !== 'string') {
    throw new Error('signed offer or receipt omitted its JWS');
  }
  const parts = value.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error('signed offer or receipt JWS is invalid');
  }
  return parts;
}

function requiredString(object, field) {
  const value = object?.[field];
  if (typeof value !== 'string' || !value) {
    throw new Error(`signed artifact omitted ${field}`);
  }
  return value;
}

async function verifiedJws(compact, resourceOrigin) {
  const [protectedHeader, payload, signature] = compactJws(compact);
  const header = JSON.parse(Buffer.from(protectedHeader, 'base64url').toString('utf8'));
  const body = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  const expectedDid = `did:web:${new URL(resourceOrigin).hostname}`;
  const keyId = requiredString(header, 'kid');

  if (
    header.alg !== 'EdDSA' ||
    header.crit !== undefined ||
    !keyId.startsWith(`${expectedDid}#`)
  ) {
    throw new Error('signed artifact uses an unauthorized key identifier');
  }

  const response = await fetch(new URL('/.well-known/did.json', resourceOrigin), {
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error('receipt signer DID document is unavailable');
  }
  const document = await response.json();
  if (
    document.id !== expectedDid ||
    !Array.isArray(document.assertionMethod) ||
    !document.assertionMethod.includes(keyId)
  ) {
    throw new Error('receipt signer DID authorization is invalid');
  }
  const method = document.verificationMethod?.find((candidate) => candidate?.id === keyId);
  const jwk = method?.publicKeyJwk;
  if (
    method?.controller !== expectedDid ||
    jwk?.kty !== 'OKP' ||
    jwk?.crv !== 'Ed25519' ||
    jwk?.alg !== 'EdDSA' ||
    jwk?.kid !== keyId ||
    Object.hasOwn(jwk ?? {}, 'd') ||
    typeof jwk?.x !== 'string'
  ) {
    throw new Error('receipt signer DID key is invalid');
  }
  if (
    !verify(
      null,
      Buffer.from(`${protectedHeader}.${payload}`),
      createPublicKey({ key: jwk, format: 'jwk' }),
      Buffer.from(signature, 'base64url'),
    )
  ) {
    throw new Error('signed artifact signature is invalid');
  }

  return { body, keyId };
}

export async function requireSignedOffer(paymentRequired, resource) {
  const offers = paymentRequired.extensions?.[OFFER_RECEIPT_EXTENSION]?.info?.offers;
  if (!Array.isArray(offers) || offers.length !== 1) {
    throw new Error('payment requirement omitted one signed offer');
  }
  const offer = offers[0];
  const accepted = paymentRequired.accepts?.[offer.acceptIndex];
  const { body, keyId } = await verifiedJws(offer.signature, resource.origin);
  if (
    offer.format !== 'jws' ||
    offer.acceptIndex !== 0 ||
    body.version !== 1 ||
    body.resourceUrl !== resource.href ||
    body.scheme !== accepted?.scheme ||
    body.network !== accepted?.network ||
    body.asset?.toLowerCase() !== accepted?.asset?.toLowerCase() ||
    body.payTo?.toLowerCase() !== accepted?.payTo?.toLowerCase() ||
    body.amount !== accepted?.amount ||
    !Number.isSafeInteger(body.validUntil) ||
    body.validUntil <= Math.floor(Date.now() / 1000)
  ) {
    throw new Error('signed offer does not match the accepted payment terms');
  }
  return keyId;
}

export async function requireSignedReceipt(paymentResponse, resource, expectedPayer) {
  const receipt = paymentResponse?.extensions?.[OFFER_RECEIPT_EXTENSION]?.info?.receipt;
  const { body, keyId } = await verifiedJws(receipt?.signature, resource.origin);
  const now = Math.floor(Date.now() / 1000);
  if (
    receipt?.format !== 'jws' ||
    paymentResponse.success !== true ||
    body.version !== 1 ||
    body.network !== paymentResponse.network ||
    body.resourceUrl !== resource.href ||
    body.payer?.toLowerCase() !== expectedPayer.toLowerCase() ||
    body.payer?.toLowerCase() !== paymentResponse.payer?.toLowerCase() ||
    body.transaction !== paymentResponse.transaction ||
    !Number.isSafeInteger(body.issuedAt) ||
    body.issuedAt < now - 900 ||
    body.issuedAt > now + 60
  ) {
    throw new Error('signed receipt does not match the settled payment');
  }
  return { keyId, transaction: body.transaction };
}
