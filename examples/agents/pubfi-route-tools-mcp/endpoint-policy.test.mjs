import assert from "node:assert/strict";
import test from "node:test";

import {
  apiKeyEnvNameForEndpoint,
  normalizePubfiMcpEndpoint,
  rustMcpRequestInit
} from "./endpoint-policy.mjs";

test("accepts only exact production and staging roots", () => {
  assert.equal(normalizePubfiMcpEndpoint("https://mcp.pubfi.ai"), "https://mcp.pubfi.ai");
  assert.equal(normalizePubfiMcpEndpoint("https://mcp.pubfi.ai/"), "https://mcp.pubfi.ai");
  assert.equal(
    normalizePubfiMcpEndpoint("https://mcp-stg.pubfi.ai"),
    "https://mcp-stg.pubfi.ai"
  );
  assert.equal(
    normalizePubfiMcpEndpoint("https://mcp-stg.pubfi.ai/"),
    "https://mcp-stg.pubfi.ai"
  );
});

test("rejects attacker, suffix, userinfo, port, path, query, fragment, and non-TLS endpoints", () => {
  const invalid = [
    "https://attacker.example",
    "https://mcp.pubfi.ai.attacker.example",
    "https://attacker-mcp.pubfi.ai",
    "https://user@mcp.pubfi.ai",
    "https://mcp.pubfi.ai:443",
    "https://mcp.pubfi.ai:8443",
    "https://mcp.pubfi.ai/mcp",
    "https://mcp.pubfi.ai/?target=attacker",
    "https://mcp.pubfi.ai/#fragment",
    "http://mcp.pubfi.ai",
    " https://mcp.pubfi.ai",
    "https://MCP.pubfi.ai"
  ];

  for (const endpoint of invalid) {
    assert.throws(() => normalizePubfiMcpEndpoint(endpoint), /exact PubFi MCP root/);
  }
});

test("selects a caller key only after exact endpoint validation", () => {
  assert.equal(apiKeyEnvNameForEndpoint("https://mcp.pubfi.ai"), "PROD_PUBFI_API_KEY");
  assert.equal(apiKeyEnvNameForEndpoint("https://mcp-stg.pubfi.ai"), "STG_PUBFI_API_KEY");
  assert.throws(
    () => apiKeyEnvNameForEndpoint("https://mcp-stg.pubfi.ai.attacker.example"),
    /exact PubFi MCP root/
  );
});

test("forbids redirects and forwards only the selected caller credential", () => {
  const message = { jsonrpc: "2.0", id: 7, method: "tools/list", params: {} };
  const authenticated = rustMcpRequestInit(message, "scoped-key");

  assert.equal(authenticated.redirect, "error");
  assert.equal(authenticated.method, "POST");
  assert.equal(authenticated.headers.authorization, "Bearer scoped-key");
  assert.equal(authenticated.body, JSON.stringify(message));

  const anonymous = rustMcpRequestInit(message, "");
  assert.equal(anonymous.redirect, "error");
  assert.equal("authorization" in anonymous.headers, false);
});
