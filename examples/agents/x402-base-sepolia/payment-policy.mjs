export const BASE_SEPOLIA_NETWORK = 'eip155:84532';
export const BASE_SEPOLIA_USDC = '0x036cbd53842c5426634e7929541ec2318f3dcf7e';
export const MAX_PAYMENT_MICRO_USDC = 10_000n;
export const MAX_AUTHORIZATION_SECONDS = 300;

const origins = new Map([
  ['https://api-stg.pubfi.ai', 'https://mcp-stg.pubfi.ai'],
  ['https://api.pubfi.ai', 'https://mcp.pubfi.ai'],
]);

export function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`missing ${name}`);
  }
  return value;
}

function address(value) {
  return typeof value === 'string' && /^0x[0-9a-fA-F]{40}$/.test(value)
    ? value.toLowerCase()
    : undefined;
}

export function buyerPrivateKey() {
  const value = requiredEnvironment('X402_BUYER_PRIVATE_KEY');
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error('X402_BUYER_PRIVATE_KEY is not a private key');
  }
  return value;
}

export function resourceUrl() {
  const value = requiredEnvironment('X402_RESOURCE_URL');
  const parsed = new URL(value);
  if (
    parsed.href !== value ||
    !origins.has(parsed.origin) ||
    !parsed.pathname.startsWith('/v1/gateway/') ||
    parsed.username ||
    parsed.password ||
    parsed.hash
  ) {
    throw new Error('X402_RESOURCE_URL is outside a supported PubFi gateway origin');
  }
  return parsed;
}

export function mcpUrlForResource(resource) {
  return new URL(origins.get(resource.origin));
}

export function expectedPaymentSelector() {
  const expectedPayTo = address(requiredEnvironment('X402_EXPECTED_PAY_TO'));
  if (!expectedPayTo) {
    throw new Error('X402_EXPECTED_PAY_TO is not an EVM address');
  }

  return (version, accepts) => {
    if (version !== 2 || !Array.isArray(accepts)) {
      throw new Error('server did not offer x402 V2');
    }
    const matches = accepts.filter(
      (requirement) =>
        requirement?.scheme === 'exact' &&
        requirement.network === BASE_SEPOLIA_NETWORK &&
        address(requirement.asset) === BASE_SEPOLIA_USDC &&
        address(requirement.payTo) === expectedPayTo &&
        typeof requirement.amount === 'string' &&
        /^[1-9]\d{0,4}$/.test(requirement.amount) &&
        BigInt(requirement.amount) <= MAX_PAYMENT_MICRO_USDC &&
        Number.isSafeInteger(requirement.maxTimeoutSeconds) &&
        requirement.maxTimeoutSeconds >= 1 &&
        requirement.maxTimeoutSeconds <= MAX_AUTHORIZATION_SECONDS &&
        requirement.extra?.name === 'USDC' &&
        requirement.extra?.version === '2' &&
        requirement.extra?.assetTransferMethod === 'eip3009',
    );
    if (matches.length !== 1) {
      throw new Error('server did not offer one bounded expected payment');
    }
    return matches[0];
  };
}
