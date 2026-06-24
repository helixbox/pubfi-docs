#!/usr/bin/env node

const protocolVersion = "2025-11-25";
const defaultMcpEndpoint = "https://mcp.pubfi.ai";
const mcpEndpoint = normalizeEndpoint(
  process.env.PUBFI_MCP_ENDPOINT || process.env.PUBFI_MCP_ORIGIN || defaultMcpEndpoint
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

function normalizeEndpoint(raw) {
  let parsed;

  try {
    parsed = new URL(raw);
  } catch (error) {
    throw new Error(`Invalid PUBFI_MCP_ENDPOINT: ${error.message}`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("PUBFI_MCP_ENDPOINT must use http or https.");
  }

  parsed.hash = "";

  return parsed.toString();
}

function apiKeyEnvNameForEndpoint(endpoint) {
  const host = new URL(endpoint).hostname;

  return host === "stg.pubfi.ai" || host.endsWith("-stg.pubfi.ai")
    ? "STG_PUBFI_API_KEY"
    : "PROD_PUBFI_API_KEY";
}

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
      writeJsonRpcResult(message.id, {
        protocolVersion,
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: "pubfi-mcp-stdio-bridge",
          title: "PubFi MCP Stdio Bridge",
          version: "0.1.0"
        },
        instructions:
          `This local stdio bridge forwards generic PubFi MCP tools to the hosted Rust MCP endpoint. Set ${apiKeyEnvName} before listing or calling tools.`
      });
      return;
    case "ping":
      writeJsonRpcResult(message.id, {});
      return;
    case "tools/list":
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
  const response = await fetch(mcpEndpoint, {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "mcp-protocol-version": protocolVersion
    },
    body: JSON.stringify(message)
  });
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

  if (body.error) {
    writeFrame({
      jsonrpc: "2.0",
      id: message.id,
      error: body.error
    });
    return;
  }

  writeJsonRpcResult(message.id, body.result);
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
