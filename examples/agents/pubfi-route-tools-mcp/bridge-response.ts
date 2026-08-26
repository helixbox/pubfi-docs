import { asObject, type JsonObject } from './json.ts';

export type JsonRpcId = number | string | null;

export function exactDirectMcpResponse(requestId: JsonRpcId, responseBody: unknown): JsonObject {
  const response = asObject(responseBody, 'Rust MCP response');
  if (
    response['jsonrpc'] !== '2.0' ||
    response['id'] !== requestId ||
    (response['result'] === undefined) === (response['error'] === undefined)
  ) {
    throw new Error('Rust MCP returned an invalid JSON-RPC response envelope.');
  }

  return response;
}
