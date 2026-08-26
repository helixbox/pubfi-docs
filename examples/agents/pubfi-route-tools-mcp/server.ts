#!/usr/bin/env node

import { exactDirectMcpResponse, type JsonRpcId } from './bridge-response.ts';
import {
  apiKeyEnvNameForEndpoint,
  normalizePubfiMcpEndpoint,
  rustMcpRequestInit,
} from './endpoint-policy.ts';
import { asObject, optionalString, parseJson, type JsonObject } from './json.ts';

const defaultMcpEndpoint = 'https://mcp.pubfi.ai';
const mcpEndpoint = normalizePubfiMcpEndpoint(process.env.PUBFI_MCP_ENDPOINT ?? defaultMcpEndpoint);
const apiKeyEnvName = apiKeyEnvNameForEndpoint(mcpEndpoint);
const apiKey = process.env[apiKeyEnvName] ?? '';
const publicTools = new Set(['pubfi.capabilities.list', 'pubfi.capabilities.get']);
let inputBuffer = Buffer.alloc(0);

process.stdin.on('data', (chunk: Buffer) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  readFrames();
});

process.stdin.on('end', () => {
  process.exit(0);
});

function readFrames(): void {
  while (true) {
    const headerEnd = inputBuffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;
    const header = inputBuffer.subarray(0, headerEnd).toString('utf8');
    const lengthText = /^content-length:\s*(\d+)$/imu.exec(header)?.[1];
    if (lengthText === undefined) {
      inputBuffer = inputBuffer.subarray(headerEnd + 4);
      continue;
    }
    const length = Number.parseInt(lengthText, 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;
    if (inputBuffer.length < bodyEnd) return;
    const body = inputBuffer.subarray(bodyStart, bodyEnd).toString('utf8');
    inputBuffer = inputBuffer.subarray(bodyEnd);
    void handleMessage(parseJson(body)).catch((error: unknown) => {
      writeJsonRpcError(null, -32603, error instanceof Error ? error.message : String(error));
    });
  }
}

function optionalJsonRpcId(value: unknown): JsonRpcId | undefined {
  return typeof value === 'string' || typeof value === 'number' || value === null
    ? value
    : undefined;
}

async function handleMessage(value: unknown): Promise<void> {
  let message: JsonObject;
  try {
    message = asObject(value, 'JSON-RPC message');
  } catch {
    writeJsonRpcError(null, -32600, 'Invalid JSON-RPC message.');
    return;
  }
  const id = optionalJsonRpcId(message['id']);
  if (id === undefined) return;
  const method = optionalString(message['method']);
  switch (method) {
    case 'server/discover':
    case 'tools/list':
    case 'resources/list':
    case 'resources/templates/list':
    case 'prompts/list':
      await forwardToRustMcp(message);
      return;
    case 'tools/call': {
      const parameters = asObject(message['params'], 'JSON-RPC params');
      const toolName = optionalString(parameters['name']) ?? '';
      if (apiKey === '' && !publicTools.has(toolName)) {
        writeJsonRpcError(
          id,
          -32_001,
          `Missing ${apiKeyEnvName} for PubFi MCP stdio bridge requests.`,
        );
        return;
      }
      await forwardToRustMcp(message);
      return;
    }
    case undefined:
    default:
      writeJsonRpcError(id, -32_601, `Unsupported MCP method: ${method ?? 'unknown'}.`);
  }
}

async function forwardToRustMcp(message: JsonObject): Promise<void> {
  const id = optionalJsonRpcId(message['id']);
  if (id === undefined) throw new Error('JSON-RPC request id is invalid.');
  const response = await fetch(mcpEndpoint, rustMcpRequestInit(message, apiKey));
  const bodyText = await response.text();
  let body: JsonObject;
  try {
    body = asObject(parseJson(bodyText), 'Rust MCP response');
  } catch (error: unknown) {
    throw new Error(
      `Rust MCP returned non-JSON HTTP ${response.status}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
  if (!response.ok) {
    const errorBody = body['error'] === undefined ? {} : asObject(body['error'], 'Rust MCP error');
    const code = optionalString(errorBody['code']) ?? 'pubfi.mcp.http_error';
    const messageText =
      optionalString(errorBody['message']) ?? `Rust MCP returned HTTP ${response.status}.`;
    writeJsonRpcError(id, -32_011, `${code}: ${messageText}`);
    return;
  }
  writeFrame(exactDirectMcpResponse(id, body));
}

function writeJsonRpcError(id: JsonRpcId, code: number, message: string): void {
  writeFrame({ jsonrpc: '2.0', id, error: { code, message } });
}

function writeFrame(message: unknown): void {
  const body = Buffer.from(JSON.stringify(message), 'utf8');
  process.stdout.write(`Content-Length: ${body.byteLength}\r\n\r\n`);
  process.stdout.write(body);
}
