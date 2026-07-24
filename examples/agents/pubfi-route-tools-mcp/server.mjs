#!/usr/bin/env node

import { exactDirectMcpResponse } from "./bridge-response.mjs";
import {
  apiKeyEnvNameForEndpoint,
  normalizePubfiMcpEndpoint,
  rustMcpRequestInit
} from "./endpoint-policy.mjs";

const defaultMcpEndpoint = "https://mcp.pubfi.ai";
const mcpEndpoint = normalizePubfiMcpEndpoint(
  process.env.PUBFI_MCP_ENDPOINT || defaultMcpEndpoint
);
const apiKeyEnvName = apiKeyEnvNameForEndpoint(mcpEndpoint);
const apiKey = process.env[apiKeyEnvName] || "";
let inputBuffer = Buffer.alloc(0);

process.stdin.on("data", (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  readFrames();
});

process.stdin.on("end", () => {
  process.exit(0);
});

function readFrames() {
  while (true) {
    const headerEnd = inputBuffer.indexOf("\r\n\r\n");

    if (headerEnd === -1) {
      return;
    }

    const header = inputBuffer.subarray(0, headerEnd).toString("utf8");
    const lengthMatch = /^content-length:\s*(\d+)$/im.exec(header);

    if (!lengthMatch) {
      inputBuffer = inputBuffer.subarray(headerEnd + 4);
      continue;
    }

    const length = Number.parseInt(lengthMatch[1], 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;

    if (inputBuffer.length < bodyEnd) {
      return;
    }

    const body = inputBuffer.subarray(bodyStart, bodyEnd).toString("utf8");
    inputBuffer = inputBuffer.subarray(bodyEnd);

    void handleMessage(JSON.parse(body)).catch((error) => {
      writeJsonRpcError(null, -32603, error instanceof Error ? error.message : String(error));
    });
  }
}

async function handleMessage(message) {
  if (!message || typeof message !== "object") {
    writeJsonRpcError(null, -32600, "Invalid JSON-RPC message.");
    return;
  }
  if (message.id === undefined) {
    return;
  }

  switch (message.method) {
    case "initialize":
    case "ping":
    case "tools/list":
      await forwardToRustMcp(message);
      return;
    case "tools/call":
      if (!apiKey) {
        writeJsonRpcError(
          message.id,
          -32001,
          `Missing ${apiKeyEnvName} for PubFi MCP stdio bridge requests.`
        );
        return;
      }

      await forwardToRustMcp(message);
      return;
    default:
      writeJsonRpcError(message.id, -32601, `Unsupported MCP method: ${message.method}.`);
  }
}

async function forwardToRustMcp(message) {
  const response = await fetch(mcpEndpoint, rustMcpRequestInit(message, apiKey));
  const bodyText = await response.text();
  let body;

  try {
    body = JSON.parse(bodyText);
  } catch (error) {
    throw new Error(`Rust MCP returned non-JSON HTTP ${response.status}: ${error.message}`);
  }

  if (!response.ok) {
    const code = body?.error?.code || "pubfi.mcp.http_error";
    const messageText = body?.error?.message || `Rust MCP returned HTTP ${response.status}.`;

    writeJsonRpcError(message.id, -32002, `${code}: ${messageText}`);
    return;
  }

  writeFrame(exactDirectMcpResponse(message.id, body));
}

function writeJsonRpcResult(id, result) {
  writeFrame({
    jsonrpc: "2.0",
    id,
    result
  });
}

function writeJsonRpcError(id, code, message) {
  writeFrame({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message
    }
  });
}

function writeFrame(message) {
  const body = Buffer.from(JSON.stringify(message), "utf8");

  process.stdout.write(`Content-Length: ${body.byteLength}\r\n\r\n`);
  process.stdout.write(body);
}
