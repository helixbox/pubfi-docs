export const BASE_MAINNET_NETWORK = 'eip155:8453';
export const BASE_MAINNET_USDC = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
export const PRODUCTION_PAY_TO = '0x35764549c387f6befcbe6d03e6bfbd7ade4543b6';
export const PAYMENT_MICRO_USDC = 1_000n;
export const MAX_AUTHORIZATION_SECONDS = 300;

const PRODUCTION_API_ORIGIN = 'https://api.pubfi.ai';
const PRODUCTION_MCP_ENDPOINT = 'https://mcp.pubfi.ai';
const PRODUCTION_RESOURCE = 'https://api.pubfi.ai/v1/gateway/quantro/health';

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
  const value = process.env.X402_RESOURCE_URL ?? PRODUCTION_RESOURCE;
  const parsed = new URL(value);
  if (
    parsed.href !== PRODUCTION_RESOURCE ||
    parsed.username ||
    parsed.password ||
    parsed.hash
  ) {
    throw new Error('X402_RESOURCE_URL is outside the PubFi Production gateway origin');
  }
  return parsed;
}

export function mcpUrlForResource(resource) {
  if (resource?.origin !== PRODUCTION_API_ORIGIN) {
    throw new Error('x402 Base mainnet MCP requests must use PubFi Production');
  }
  return new URL(PRODUCTION_MCP_ENDPOINT);
}

export function expectedPaymentSelector() {
  return (version, accepts) => {
    if (version !== 2 || !Array.isArray(accepts)) {
      throw new Error('server did not offer x402 V2');
    }
    const matches = accepts.filter(
      (requirement) =>
        requirement?.scheme === 'exact' &&
        requirement.network === BASE_MAINNET_NETWORK &&
        address(requirement.asset) === BASE_MAINNET_USDC &&
        address(requirement.payTo) === PRODUCTION_PAY_TO &&
        requirement.amount === PAYMENT_MICRO_USDC.toString() &&
        Number.isSafeInteger(requirement.maxTimeoutSeconds) &&
        requirement.maxTimeoutSeconds >= 1 &&
        requirement.maxTimeoutSeconds <= MAX_AUTHORIZATION_SECONDS &&
        requirement.extra?.name === 'USD Coin' &&
        requirement.extra?.version === '2' &&
        requirement.extra?.assetTransferMethod === 'eip3009',
    );
    if (matches.length !== 1) {
      throw new Error('server did not offer one bounded expected payment');
    }
    return matches[0];
  };
}
