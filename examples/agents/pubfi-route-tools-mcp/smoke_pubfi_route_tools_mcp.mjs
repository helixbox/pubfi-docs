#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";

const expectedTools = [
  "pubfi.capabilities.search",
  "pubfi.route.plan",
  "pubfi.route.execute",
  "pubfi.route.explain",
  "pubfi.schema.get",
  "pubfi.pricing.quote"
];
const defaultWalletAddress = process.env.PUBFI_MCP_SMOKE_WALLET_ADDRESS || "";
const defaultNetwork = process.env.PUBFI_MCP_SMOKE_NETWORK || "polkadot";
const executeLive = process.env.PUBFI_MCP_EXECUTE_LIVE === "1";
const apiKeyEnvName = apiKeyEnvNameForEndpoint(
  process.env.PUBFI_MCP_ENDPOINT || process.env.PUBFI_MCP_ORIGIN || "https://mcp.pubfi.ai"
);
const hasApiKey = Boolean(process.env[apiKeyEnvName]);
const scriptPath = fileURLToPath(import.meta.url);
const serverPath = path.join(path.dirname(scriptPath), "server.mjs");
const server = spawn(process.execPath, [serverPath], {
  cwd: path.resolve(path.dirname(scriptPath), "../../.."),
  env: process.env,
  stdio: ["pipe", "pipe", "pipe"]
});

let nextId = 1;
let outputBuffer = Buffer.alloc(0);
let serverExited = false;
const pending = new Map();

server.stdout.on("data", (chunk) => {
  outputBuffer = Buffer.concat([outputBuffer, chunk]);
  readFrames();
});

server.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

server.on("exit", (code, signal) => {
  serverExited = true;
  if (pending.size > 0) {
    for (const { reject } of pending.values()) {
      reject(new Error(`MCP server exited before responding: code=${code} signal=${signal}`));
    }
    pending.clear();
  }
});

try {
  const initialized = await request("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: {
      name: "pubfi-route-tools-smoke",
      version: "0.1.0"
    }
  });

  notify("notifications/initialized");

  assert.equal(initialized.protocolVersion, "2025-11-25");
  assert.deepEqual(initialized.capabilities, { tools: { listChanged: false } });

  const listed = await request("tools/list", {});
  const toolNames = listed.tools.map((tool) => tool.name);

  assert.deepEqual(toolNames, expectedTools);
  assert.equal(toolNames.some((name) => /subscan|degov|provider|gateway\./i.test(name)), false);

  if (!hasApiKey) {
    const missingKey = await requestAllowError("tools/call", {
      name: "pubfi.capabilities.search",
      arguments: {
        query: "native account balance for a Polkadot wallet"
      }
    });

    assert.equal(missingKey.error.code, -32001);
    assert.match(missingKey.error.message, new RegExp(apiKeyEnvName));
    printReport({
      verdict: "pass",
      mode: "auth_required",
      tool_count: toolNames.length,
      checks: ["initialize", "tools_list", "missing_api_key_call_gate"]
    });
  } else {
    const search = await callTool("pubfi.capabilities.search", {
      query: "native account balance for a Polkadot wallet"
    });

    assert.equal(search.schema_version, "pubfi.capabilities.search.response.v1");
    assert.equal(search.provider_specific_public_tools.length, 0);
    assert.ok(
      search.candidate_capabilities.some(
        (candidate) => candidate.capability_id === "wallet.account_balance"
      )
    );

    const plan = await callTool("pubfi.route.plan", {
      intent: {
        objective: "Need the native wallet account balance for a Polkadot account.",
        chains: [defaultNetwork],
        categories: ["wallet", "on_chain_state"],
        required_capabilities: ["account_balance"],
        allow_paid: false
      },
      dry_run: true
    });

    assert.equal(plan.outcome, "callable_route");
    assert.equal(plan.selected_route_id, "capability:wallet.account_balance");
    assert.equal(plan.selected_callability, "callable");
    assert.equal(plan.production_route_time_model_enabled, false);

    const explain = await callTool("pubfi.route.explain", {
      intent: {
        objective: "Need account balance data.",
        required_capabilities: ["account_balance"],
        categories: ["wallet"]
      },
      dry_run: true
    });

    assert.equal(explain.tool, "pubfi.route.explain");
    assert.ok(explain.reason_codes.includes("decision_kind:callable_route"));

    const schema = await callTool("pubfi.schema.get", {
      tool: "pubfi.route.execute"
    });

    assert.equal(schema.tool.name, "pubfi.route.execute");
    assert.equal(schema.tool.input_schema.required.includes("route_plan"), true);

    const quote = await callTool("pubfi.pricing.quote", {
      route_id: "capability:wallet.account_balance"
    });

    assert.equal(quote.selected_quote.capability_id, "wallet.account_balance");
    assert.equal(quote.payment_execution_enabled, false);
    assert.equal(quote.no_payment_payload_created, true);

    const providerSpecific = await callTool("pubfi.route.execute", {
      route_id: "/v1/gateway/subscan/polkadot/api/now"
    });

    assert.equal(providerSpecific.ok, false);
    assert.equal(providerSpecific.reason_code, "provider_specific_route_rejected");

    const checks = [
      "initialize",
      "tools_list",
      "capabilities_search",
      "route_plan_callable",
      "route_explain",
      "schema_readback",
      "pricing_quote",
      "provider_specific_execute_rejected"
    ];

    if (executeLive) {
      if (!defaultWalletAddress) {
        throw new Error("Set PUBFI_MCP_SMOKE_WALLET_ADDRESS before live execution.");
      }

      const execute = await callTool("pubfi.route.execute", {
        route_id: "capability:wallet.account_balance",
        route_plan: plan,
        arguments: {
          wallet_address: defaultWalletAddress,
          network: defaultNetwork,
          chain: defaultNetwork
        }
      });

      assert.equal(execute.ok, true);
      assert.equal(execute.execution_authority, "capability_runtime_v1");
      assert.equal(execute.supplier_execution_enabled, false);
      assert.equal(execute.payment_execution_enabled, false);
      assert.equal(execute.capability_response_body.meta.readiness, "gateway_available");
      checks.push("route_execute_live_gateway");
    }

    printReport({
      verdict: "pass",
      mode: executeLive ? "live_execute" : "authenticated_dry_run",
      tool_count: toolNames.length,
      checks
    });
  }
} finally {
  if (!serverExited) {
    server.kill();
    await once(server, "exit").catch(() => {});
  }
}

async function callTool(name, args) {
  const response = await request("tools/call", {
    name,
    arguments: args
  });

  return response.structuredContent;
}

function request(method, params) {
  return requestAllowError(method, params).then((message) => {
    if (message.error) {
      throw new Error(message.error.message);
    }

    return message.result;
  });
}

function requestAllowError(method, params) {
  const id = nextId++;
  const message = {
    jsonrpc: "2.0",
    id,
    method,
    params
  };

  server.stdin.write(frame(message));

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (pending.delete(id)) {
        reject(new Error(`Timed out waiting for MCP response to ${method}.`));
      }
    }, 15000);
    timer.unref?.();
    pending.set(id, {
      resolve: (message) => {
        clearTimeout(timer);
        resolve(message);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      }
    });
  });
}

function apiKeyEnvNameForEndpoint(endpoint) {
  const host = new URL(endpoint).hostname;

  return host === "stg.pubfi.ai" || host.endsWith("-stg.pubfi.ai")
    ? "STG_PUBFI_API_KEY"
    : "PROD_PUBFI_API_KEY";
}

function notify(method, params = {}) {
  server.stdin.write(
    frame({
      jsonrpc: "2.0",
      method,
      params
    })
  );
}

function readFrames() {
  while (true) {
    const headerEnd = outputBuffer.indexOf("\r\n\r\n");

    if (headerEnd === -1) {
      return;
    }

    const header = outputBuffer.subarray(0, headerEnd).toString("utf8");
    const lengthMatch = /^content-length:\s*(\d+)$/im.exec(header);

    assert.ok(lengthMatch, `Missing Content-Length in MCP response header: ${header}`);

    const length = Number.parseInt(lengthMatch[1], 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;

    if (outputBuffer.length < bodyEnd) {
      return;
    }

    const body = outputBuffer.subarray(bodyStart, bodyEnd).toString("utf8");
    outputBuffer = outputBuffer.subarray(bodyEnd);

    const message = JSON.parse(body);
    const pendingRequest = pending.get(message.id);

    if (!pendingRequest) {
      continue;
    }

    pending.delete(message.id);
    pendingRequest.resolve(message);
  }
}

function frame(message) {
  const body = Buffer.from(JSON.stringify(message), "utf8");

  return `Content-Length: ${body.byteLength}\r\n\r\n${body}`;
}

function printReport(report) {
  console.log(
    JSON.stringify(
      {
        schema_version: "pubfi_mcp_agent_smoke_report.v1",
        ...report
      },
      null,
      2
    )
  );
}
