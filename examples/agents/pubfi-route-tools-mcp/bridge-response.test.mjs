import assert from "node:assert/strict";
import test from "node:test";

import { exactDirectMcpResponse } from "./bridge-response.mjs";

test("stdio bridge preserves the exact direct discovery Registry identity", () => {
  const direct = {
    jsonrpc: "2.0",
    id: 1,
    result: {
      resultType: "complete",
      supportedVersions: ["2026-07-28"],
      capabilities: { tools: { listChanged: false } },
      ttlMs: 30000,
      cacheScope: "public",
      _meta: {
        "io.modelcontextprotocol/serverInfo": {
          name: "pubfi-rust-mcp",
          version: "0.1.0"
        },
        generation: { id: "generation-current", sequence: 12 },
        manifest: { manifest_sequence: 19 }
      }
    }
  };

  assert.strictEqual(exactDirectMcpResponse(1, direct), direct);
  assert.deepEqual(exactDirectMcpResponse(1, direct), direct);
});

test("stdio bridge preserves the exact direct four-tool list and Registry identity", () => {
  const direct = {
    jsonrpc: "2.0",
    id: 2,
    result: {
      resultType: "complete",
      tools: [
        "pubfi.capabilities.list",
        "pubfi.capabilities.get",
        "pubfi.route.execute",
        "pubfi.substrate.runtime_upgrade.verify"
      ].map((name) => ({ name })),
      ttlMs: 30000,
      cacheScope: "public",
      _meta: {
        "io.modelcontextprotocol/serverInfo": {
          name: "pubfi-rust-mcp",
          version: "0.1.0"
        },
        generation: { id: "generation-current", sequence: 12 },
        manifest: { manifest_sequence: 19 }
      }
    }
  };

  assert.strictEqual(exactDirectMcpResponse(2, direct), direct);
  assert.deepEqual(exactDirectMcpResponse(2, direct), direct);
});

test("stdio bridge rejects malformed or mismatched direct envelopes", () => {
  assert.throws(() => exactDirectMcpResponse(1, { jsonrpc: "2.0", id: 2, result: {} }));
  assert.throws(() => exactDirectMcpResponse(1, { jsonrpc: "2.0", id: 1 }));
  assert.throws(() => exactDirectMcpResponse(1, {
    jsonrpc: "2.0",
    id: 1,
    result: {},
    error: {}
  }));
});
