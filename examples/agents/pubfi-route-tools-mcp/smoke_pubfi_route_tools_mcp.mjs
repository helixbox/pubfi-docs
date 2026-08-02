#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { apiKeyEnvNameForEndpoint } from "./endpoint-policy.mjs";

const expectedTools = [
  "pubfi.capabilities.list",
  "pubfi.capabilities.get",
  "pubfi.route.execute"
];
const configuredRawPath = process.env.PUBFI_MCP_SMOKE_RAW_PATH || "";
const configuredMethod = (process.env.PUBFI_MCP_SMOKE_METHOD || "GET").toUpperCase();
const configuredQuery = process.env.PUBFI_MCP_SMOKE_QUERY || "";
const configuredBody = process.env.PUBFI_MCP_SMOKE_BODY || "";
const executeLive = process.env.PUBFI_MCP_EXECUTE_LIVE === "1";
const apiKeyEnvName = apiKeyEnvNameForEndpoint(
  process.env.PUBFI_MCP_ENDPOINT || "https://mcp.pubfi.ai"
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
  assert.equal(initialized.serverInfo.name, "pubfi-rust-mcp");
  assert.equal(initialized.capabilities.tools.listChanged, false);
  assert.ok(initialized._meta?.generation, "initialize omitted Registry generation");
  assert.ok(initialized._meta?.manifest, "initialize omitted Registry manifest");

  const listed = await request("tools/list", {});
  const toolNames = listed.tools.map((tool) => tool.name);

  assert.deepEqual(toolNames, expectedTools);
  assert.deepEqual(listed.tools[2].inputSchema.required, ["raw_path", "method"]);
  assert.equal(
    listed.tools[0].outputSchema.properties.schema_version.const,
    "pubfi.gateway.registry.capability-page.v4"
  );
  assert.equal(
    listed.tools[2].inputSchema["x-pubfi-registry-routes"],
    undefined
  );
  assert.deepEqual(initialized._meta.generation, listed._meta.generation);
  assert.deepEqual(initialized._meta.manifest, listed._meta.manifest);

  const capabilities = [];
  const seenCursors = new Set();
  const catalogPageLimit = 1_000;
  const maximumRegistryGenerationRoutes = 32_768;
  const maximumCatalogPages = Math.ceil(
    maximumRegistryGenerationRoutes / catalogPageLimit
  );
  let cursor;
  let catalogGeneration;
  let totalCapabilityCount;

  for (let pageIndex = 0; pageIndex < maximumCatalogPages; pageIndex += 1) {
    const page = await callTool("pubfi.capabilities.list", {
      limit: catalogPageLimit,
      ...(cursor ? { cursor } : {})
    });

    assert.equal(
      page.schema_version,
      "pubfi.gateway.registry.capability-page.v4"
    );
    assert.ok(Array.isArray(page.capabilities));
    if (!catalogGeneration) {
      catalogGeneration = page.generation;
      totalCapabilityCount = page.total_capability_count;
      assert.ok(
        totalCapabilityCount <= maximumRegistryGenerationRoutes,
        "catalog exceeds the Registry generation route bound"
      );
    } else {
      assert.deepEqual(page.generation, catalogGeneration);
      assert.equal(page.total_capability_count, totalCapabilityCount);
    }
    capabilities.push(...page.capabilities);

    cursor = page.next_cursor;
    if (!cursor) {
      break;
    }
    assert.equal(seenCursors.has(cursor), false, "catalog cursor repeated");
    seenCursors.add(cursor);
  }
  assert.equal(cursor, undefined, "catalog pagination exceeded its bound");
  assert.equal(capabilities.length, totalCapabilityCount);
  assert.ok(capabilities.length > 0, "current Registry has no smoke capability");
  assert.ok(
    capabilities.every((capability) =>
      capability.credit_cost === 1 &&
      capability.meter_key === undefined &&
      capability.maximum_raw_units === undefined &&
      capability.charged_raw_units_after_admitted_attempt === undefined
    ),
    "public capability catalog did not use the exact one-Credit contract"
  );

  const selected =
    capabilities.find((capability) => capability.readiness?.status === "ready") ??
    capabilities[0];
  const detail = await callTool("pubfi.capabilities.get", {
    capability_id: selected.capability_id
  });

  assert.equal(
    detail.schema_version,
    "pubfi.gateway.registry.capability-detail.v4"
  );
  assert.equal(detail.capability.capability_id, selected.capability_id);
  assert.deepEqual(detail.generation, catalogGeneration);
  assert.ok(detail.capability.request);
  assert.ok(detail.capability.response);

  const rawPath = configuredRawPath || materializeRawPath(selected.matcher);
  const method = configuredRawPath ? configuredMethod : selected.methods[0];
  assert.ok(
    ["GET", "POST"].includes(method),
    "selected Registry capability method is unsupported"
  );
  const checks = [
    "initialize",
    "tools_list",
    "complete_capability_pagination",
    "exact_capability_detail"
  ];

  if (!hasApiKey) {
    const missingKey = await requestAllowError("tools/call", {
      name: "pubfi.route.execute",
      arguments: {
        raw_path: rawPath,
        method
      }
    });

    assert.equal(missingKey.error.code, -32001);
    assert.match(missingKey.error.message, new RegExp(apiKeyEnvName));
    checks.push("execution_api_key_gate");
  }

  if (executeLive) {
    if (!hasApiKey) {
      throw new Error(`PUBFI_MCP_EXECUTE_LIVE=1 requires ${apiKeyEnvName}.`);
    }
    if (!configuredRawPath) {
      throw new Error(
        "Set PUBFI_MCP_SMOKE_RAW_PATH from the current Registry catalog before live execution."
      );
    }

    const execute = await callTool("pubfi.route.execute", {
      raw_path: rawPath,
      method,
      ...(configuredQuery ? { query: configuredQuery } : {}),
      ...(configuredBody ? { body: configuredBody } : {}),
      idempotency_key: `pubfi-example-smoke-${Date.now()}`
    });

    assert.equal(execute.ok, true);
    assert.equal(execute.execution_authority, "typed_gateway_registry_v2");
    assert.equal(execute.credits_charged, 1);
    assert.equal(execute.metering, undefined);
    checks.push("route_execute_live_registry_v2");
  }

  printReport({
    verdict: "pass",
    mode: executeLive ? "live_execute" : "catalog_read",
    tool_count: toolNames.length,
    capability_count: capabilities.length,
    checks
  });
} finally {
  if (!serverExited) {
    server.kill();
    await once(server, "exit").catch(() => {});
  }
}

function materializeRawPath(matcher) {
  if (matcher?.kind === "exact" && typeof matcher.path === "string") {
    return matcher.path;
  }
  if (matcher?.kind === "template" && Array.isArray(matcher.template)) {
    return `/${matcher.template.map((segment) =>
      segment.kind === "literal" ? segment.value : "smoke"
    ).join("/")}`;
  }
  if (matcher?.kind === "namespace_contract" && typeof matcher.namespace === "string") {
    return matcher.namespace;
  }
  throw new Error("current Registry route has an unsupported matcher shape");
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
