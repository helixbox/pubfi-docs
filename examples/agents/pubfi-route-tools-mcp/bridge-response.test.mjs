import assert from "node:assert/strict";
import test from "node:test";

import { exactDirectMcpResponse } from "./bridge-response.mjs";

test("stdio bridge preserves the exact direct initialize Registry identity", () => {
  const direct = {
    jsonrpc: "2.0",
    id: 1,
    result: {
      protocolVersion: "2025-11-25",
      capabilities: { tools: { listChanged: true } },
      serverInfo: { name: "pubfi-rust-mcp", version: "0.1.0" },
      _meta: {
        generation: { id: "generation-current", sequence: 12 },
        manifest: { manifest_sequence: 19 }
      }
    }
  };

  assert.strictEqual(exactDirectMcpResponse(1, direct), direct);
  assert.deepEqual(exactDirectMcpResponse(1, direct), direct);
});

test("stdio bridge preserves the exact direct five-tool list and Registry identity", () => {
  const direct = {
    jsonrpc: "2.0",
    id: 2,
    result: {
      tools: [
        "pubfi.capabilities.search",
        "pubfi.route.plan",
        "pubfi.route.execute",
        "pubfi.route.explain",
        "pubfi.schema.get"
      ].map((name) => ({ name })),
      _meta: {
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
