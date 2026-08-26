import { asObject, requiredString } from './json.ts';

const endpoints = new Map<string, string>([
  ['https://mcp.pubfi.ai', 'PROD_PUBFI_API_KEY'],
  ['https://mcp.pubfi.ai/', 'PROD_PUBFI_API_KEY'],
  ['https://mcp-stg.pubfi.ai', 'STG_PUBFI_API_KEY'],
  ['https://mcp-stg.pubfi.ai/', 'STG_PUBFI_API_KEY'],
]);
export const pubfiMcpProtocolVersion = '2026-07-28';

export interface RustMcpRequestInit extends RequestInit {
  body: string;
  headers: Record<string, string>;
  method: 'POST';
  redirect: 'error';
}

export function normalizePubfiMcpEndpoint(raw: unknown): string {
  if (typeof raw !== 'string' || !endpoints.has(raw)) {
    throw new Error(
      'PUBFI_MCP_ENDPOINT must be an exact PubFi MCP root: ' +
        'https://mcp.pubfi.ai or https://mcp-stg.pubfi.ai.',
    );
  }
  return new URL(raw).origin;
}

export function apiKeyEnvNameForEndpoint(raw: unknown): string {
  return normalizePubfiMcpEndpoint(raw) === 'https://mcp-stg.pubfi.ai'
    ? 'STG_PUBFI_API_KEY'
    : 'PROD_PUBFI_API_KEY';
}

export function rustMcpRequestInit(message: unknown, apiKey: string): RustMcpRequestInit {
  const request = asObject(message, 'JSON-RPC request');
  const id = request['id'];
  const method = requiredString(request['method'], 'JSON-RPC method');
  const parameters = asObject(request['params'], 'JSON-RPC params');
  if (request['jsonrpc'] !== '2.0' || (typeof id !== 'string' && typeof id !== 'number')) {
    throw new Error('PubFi MCP stdio bridge accepts one modern JSON-RPC request object.');
  }
  let meta;
  try {
    meta = asObject(parameters['_meta'], 'JSON-RPC request metadata');
  } catch {
    throw new Error('PubFi MCP stdio bridge requires complete 2026-07-28 request metadata.');
  }
  if (
    meta['io.modelcontextprotocol/protocolVersion'] !== pubfiMcpProtocolVersion ||
    typeof meta['io.modelcontextprotocol/clientCapabilities'] !== 'object' ||
    meta['io.modelcontextprotocol/clientCapabilities'] === null ||
    Array.isArray(meta['io.modelcontextprotocol/clientCapabilities'])
  ) {
    throw new Error('PubFi MCP stdio bridge requires complete 2026-07-28 request metadata.');
  }
  const headers: Record<string, string> = {
    accept: 'application/json, text/event-stream',
    'content-type': 'application/json',
    'mcp-protocol-version': pubfiMcpProtocolVersion,
    'mcp-method': method,
  };
  const name =
    method === 'resources/read'
      ? parameters['uri']
      : ['tools/call', 'prompts/get'].includes(method)
        ? parameters['name']
        : undefined;
  if (typeof name === 'string') headers['mcp-name'] = encodeHeaderValue(name);
  if (apiKey !== '') headers['authorization'] = `Bearer ${apiKey}`;
  return {
    method: 'POST',
    headers,
    body: JSON.stringify(message),
    redirect: 'error',
  };
}

function encodeHeaderValue(value: string): string {
  const safe =
    /^[\x21-\x7e](?:[\x20-\x7e]*[\x21-\x7e])?$/u.test(value) &&
    !(value.startsWith('=?base64?') && value.endsWith('?='));
  return safe ? value : `=?base64?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}
