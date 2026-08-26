#!/usr/bin/env node
/* oxlint-disable no-await-in-loop -- The smoke sends protocol messages in wire order. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { apiKeyEnvNameForEndpoint, pubfiMcpProtocolVersion } from './endpoint-policy.ts';
import {
  asArray,
  asObject,
  asObjects,
  optionalString,
  parseJson,
  requiredNumber,
  requiredString,
  type JsonObject,
} from './json.ts';

const expectedTools = [
  'pubfi.capabilities.list',
  'pubfi.capabilities.get',
  'pubfi.route.execute',
  'pubfi.substrate.runtime_upgrade.verify',
];
const configuredRawPath = process.env.PUBFI_MCP_SMOKE_RAW_PATH || '';
const configuredMethod = (process.env.PUBFI_MCP_SMOKE_METHOD || 'GET').toUpperCase();
const configuredQuery = process.env.PUBFI_MCP_SMOKE_QUERY || '';
const configuredBody = process.env.PUBFI_MCP_SMOKE_BODY || '';
const executeLive = process.env.PUBFI_MCP_EXECUTE_LIVE === '1';
const apiKeyEnvName = apiKeyEnvNameForEndpoint(
  process.env.PUBFI_MCP_ENDPOINT || 'https://mcp.pubfi.ai',
);
const hasApiKey = Boolean(process.env[apiKeyEnvName]);
const scriptPath = fileURLToPath(import.meta.url);
const serverPath = path.join(path.dirname(scriptPath), 'server.ts');
const server = spawn(process.execPath, [serverPath], {
  cwd: path.resolve(path.dirname(scriptPath), '../../..'),
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe'],
});

let nextId = 1;
let outputBuffer = Buffer.alloc(0);
let serverExited = false;

interface PendingRequest {
  readonly reject: (error: Error) => void;
  readonly resolve: (message: JsonObject) => void;
}

interface MatcherSegment extends JsonObject {
  kind: string;
  value: string | undefined;
}

interface RegistryMatcher extends JsonObject {
  kind: string;
  namespace: string | undefined;
  path: string | undefined;
  template: MatcherSegment[];
}

interface OperationBilling extends JsonObject {
  credit_cost: number | undefined;
  mode: string;
  price_version: number | undefined;
  x402: JsonObject | undefined;
}

interface RegistryOperation extends JsonObject {
  billing: OperationBilling;
  method: string;
}

interface RegistryCapability extends JsonObject {
  capability_id: string;
  matcher: RegistryMatcher;
  methods: string[];
  operations: RegistryOperation[];
  readiness: JsonObject | undefined;
  request: unknown;
  response: unknown;
}

const pending = new Map<number, PendingRequest>();

server.stdout.on('data', (chunk: Buffer) => {
  outputBuffer = Buffer.concat([outputBuffer, chunk]);
  readFrames();
});

server.stderr.on('data', (chunk: Buffer) => {
  process.stderr.write(chunk);
});

server.on('exit', (code, signal) => {
  serverExited = true;
  if (pending.size > 0) {
    for (const { reject } of pending.values()) {
      reject(new Error(`MCP server exited before responding: code=${code} signal=${signal}`));
    }
    pending.clear();
  }
});

try {
  const discovered = await request('server/discover', {});
  const discoveredMetadata = asObject(discovered['_meta'], 'server/discover metadata');
  const discoveredServer = asObject(
    discoveredMetadata['io.modelcontextprotocol/serverInfo'],
    'server/discover server info',
  );
  const discoveredCapabilities = asObject(
    discovered['capabilities'],
    'server/discover capabilities',
  );
  const discoveredTools = asObject(discoveredCapabilities['tools'], 'server/discover tools');
  assert.equal(discovered['resultType'], 'complete');
  assert.deepEqual(discovered['supportedVersions'], [pubfiMcpProtocolVersion]);
  assert.equal(discoveredServer['name'], 'pubfi-rust-mcp');
  assert.equal(discoveredTools['listChanged'], false);
  assert.ok(discoveredMetadata['generation'], 'server/discover omitted Registry generation');
  assert.ok(discoveredMetadata['manifest'], 'server/discover omitted Registry manifest');
  assert.equal(discovered['cacheScope'], 'public');
  const discoveredTtl = requiredNumber(discovered['ttlMs'], 'server/discover ttlMs');
  assert.ok(Number.isInteger(discoveredTtl) && discoveredTtl >= 0);

  const listed = await request('tools/list', {});
  const tools = asObjects(listed['tools'], 'tools/list tools');
  const toolNames = tools.map((tool, index) =>
    requiredString(tool['name'], `tools/list tools[${index}].name`),
  );

  assert.deepEqual(toolNames, expectedTools);
  assert.equal(listed['resultType'], 'complete');
  assert.equal(listed['cacheScope'], 'public');
  const routeTool = tools[2];
  const listTool = tools[0];
  assert.ok(routeTool);
  assert.ok(listTool);
  const routeInput = asObject(routeTool['inputSchema'], 'route tool input schema');
  const listOutput = asObject(listTool['outputSchema'], 'list tool output schema');
  const listProperties = asObject(listOutput['properties'], 'list output properties');
  const schemaVersion = asObject(listProperties['schema_version'], 'list schema version');
  assert.deepEqual(routeInput['required'], ['raw_path', 'method']);
  assert.equal(schemaVersion['const'], 'pubfi.gateway.registry.capability-page.v5');
  assert.equal(routeInput['x-pubfi-registry-routes'], undefined);
  const listedMetadata = asObject(listed['_meta'], 'tools/list metadata');
  assert.deepEqual(discoveredMetadata['generation'], listedMetadata['generation']);
  assert.deepEqual(discoveredMetadata['manifest'], listedMetadata['manifest']);

  const capabilities: RegistryCapability[] = [];
  const seenCursors = new Set<string>();
  const catalogPageLimit = 1_000;
  const maximumRegistryGenerationRoutes = 100_000;
  const maximumCatalogPages = Math.ceil(maximumRegistryGenerationRoutes / catalogPageLimit);
  let cursor: string | undefined;
  let catalogGeneration: unknown;
  let totalCapabilityCount: number | undefined;

  for (let pageIndex = 0; pageIndex < maximumCatalogPages; pageIndex += 1) {
    const page = await callTool('pubfi.capabilities.list', {
      limit: catalogPageLimit,
      ...(cursor ? { cursor } : {}),
    });

    assert.equal(page['schema_version'], 'pubfi.gateway.registry.capability-page.v5');
    const pageCapabilities = asObjects(page['capabilities'], 'capability page capabilities').map(
      parseCapability,
    );
    if (!catalogGeneration) {
      catalogGeneration = page['generation'];
      totalCapabilityCount = requiredNumber(
        page['total_capability_count'],
        'capability page total count',
      );
      assert.ok(
        totalCapabilityCount <= maximumRegistryGenerationRoutes,
        'catalog exceeds the Registry generation route bound',
      );
    } else {
      assert.deepEqual(page['generation'], catalogGeneration);
      assert.equal(page['total_capability_count'], totalCapabilityCount);
    }
    capabilities.push(...pageCapabilities);

    const nextCursor = page['next_cursor'];
    if (nextCursor !== undefined && typeof nextCursor !== 'string') {
      throw new TypeError('capability page next cursor must be a string');
    }
    cursor = nextCursor;
    if (!cursor) {
      break;
    }
    assert.equal(seenCursors.has(cursor), false, 'catalog cursor repeated');
    seenCursors.add(cursor);
  }
  assert.equal(cursor, undefined, 'catalog pagination exceeded its bound');
  assert.equal(capabilities.length, totalCapabilityCount);
  assert.ok(capabilities.length > 0, 'current Registry has no smoke capability');
  capabilities.forEach(requireOperationBilling);

  const selectedPair = capabilities.flatMap((capability) =>
    capability.operations
      .filter(
        (operation) =>
          capability.readiness?.['status'] === 'ready' &&
          operation.billing.mode === 'quantro_priced' &&
          (!configuredRawPath ||
            (operation.method === configuredMethod &&
              matcherMatchesRawPath(capability.matcher, configuredRawPath))),
      )
      .map((operation) => ({ capability, operation })),
  )[0];
  assert.ok(
    selectedPair,
    'current Registry has no matching ready Quantro-priced non-health smoke operation',
  );
  const selected = selectedPair.capability;
  const detail = await callTool('pubfi.capabilities.get', {
    capability_id: selected.capability_id,
  });
  const detailCapability = parseCapability(detail['capability']);
  assert.equal(detail['schema_version'], 'pubfi.gateway.registry.capability-detail.v5');
  assert.equal(detailCapability.capability_id, selected.capability_id);
  assert.deepEqual(detail['generation'], catalogGeneration);
  assert.ok(detailCapability.request);
  assert.ok(detailCapability.response);
  requireOperationBilling(detailCapability);

  const rawPath = configuredRawPath || materializeRawPath(selected.matcher);
  const method = selectedPair.operation.method;
  const expectedCreditCost = selectedPair.operation.billing.credit_cost;
  assert.ok(['GET', 'POST'].includes(method), 'selected Registry capability method is unsupported');
  const checks = [
    'server_discover',
    'tools_list',
    'complete_capability_pagination',
    'exact_capability_detail',
  ];

  if (!hasApiKey) {
    const missingKey = await requestAllowError('tools/call', {
      name: 'pubfi.route.execute',
      arguments: {
        raw_path: rawPath,
        method,
      },
    });

    const missingKeyError = asObject(missingKey['error'], 'missing-key JSON-RPC error');
    assert.equal(missingKeyError['code'], -32001);
    assert.match(
      requiredString(missingKeyError['message'], 'missing-key error message'),
      new RegExp(apiKeyEnvName),
    );
    checks.push('execution_api_key_gate');
  }

  if (executeLive) {
    if (!hasApiKey) {
      throw new Error(`PUBFI_MCP_EXECUTE_LIVE=1 requires ${apiKeyEnvName}.`);
    }
    const execute = await callTool('pubfi.route.execute', {
      raw_path: rawPath,
      method,
      ...(configuredQuery ? { query: configuredQuery } : {}),
      ...(configuredBody ? { body: configuredBody } : {}),
      idempotency_key: `pubfi-example-smoke-${Date.now()}`,
    });

    assert.equal(execute['ok'], true);
    assert.equal(execute['execution_authority'], 'typed_gateway_registry_v2');
    assert.equal(execute['credits_charged'], expectedCreditCost);
    assert.equal(execute['metering'], undefined);
    checks.push('route_execute_live_registry_v2');
  }

  printReport({
    verdict: 'pass',
    mode: executeLive ? 'live_execute' : 'catalog_read',
    tool_count: toolNames.length,
    capability_count: capabilities.length,
    checks,
  });
} finally {
  if (!serverExited) {
    server.kill();
    await once(server, 'exit').catch(() => {});
  }
}

function parseMatcherSegment(value: unknown): MatcherSegment {
  const segment = asObject(value, 'Registry matcher segment');
  return {
    ...segment,
    kind: requiredString(segment['kind'], 'Registry matcher segment kind'),
    value: optionalString(segment['value']),
  };
}

function parseMatcher(value: unknown): RegistryMatcher {
  const matcher = asObject(value, 'Registry matcher');
  const template =
    matcher['template'] === undefined
      ? []
      : asArray(matcher['template'], 'Registry matcher template').map(parseMatcherSegment);
  return {
    ...matcher,
    kind: requiredString(matcher['kind'], 'Registry matcher kind'),
    namespace: optionalString(matcher['namespace']),
    path: optionalString(matcher['path']),
    template,
  };
}

function parseBilling(value: unknown): OperationBilling {
  const billing = asObject(value, 'Registry operation billing');
  return {
    ...billing,
    credit_cost:
      billing['credit_cost'] === undefined
        ? undefined
        : requiredNumber(billing['credit_cost'], 'Registry operation credit cost'),
    mode: requiredString(billing['mode'], 'Registry operation billing mode'),
    price_version:
      billing['price_version'] === undefined
        ? undefined
        : requiredNumber(billing['price_version'], 'Registry operation price version'),
    x402: billing['x402'] === undefined ? undefined : asObject(billing['x402'], 'x402 price'),
  };
}

function parseOperation(value: unknown): RegistryOperation {
  const operation = asObject(value, 'Registry operation');
  return {
    ...operation,
    billing: parseBilling(operation['billing']),
    method: requiredString(operation['method'], 'Registry operation method'),
  };
}

function parseCapability(value: unknown): RegistryCapability {
  const capability = asObject(value, 'Registry capability');
  return {
    ...capability,
    capability_id: requiredString(capability['capability_id'], 'Registry capability id'),
    matcher: parseMatcher(capability['matcher']),
    methods: asArray(capability['methods'], 'Registry capability methods').map((method, index) =>
      requiredString(method, `Registry capability methods[${index}]`),
    ),
    operations: asArray(capability['operations'], 'Registry capability operations').map(
      parseOperation,
    ),
    readiness:
      capability['readiness'] === undefined
        ? undefined
        : asObject(capability['readiness'], 'Registry capability readiness'),
    request: capability['request'],
    response: capability['response'],
  };
}

function materializeRawPath(matcher: RegistryMatcher): string {
  if (matcher?.kind === 'exact' && typeof matcher.path === 'string') {
    return matcher.path;
  }
  if (matcher?.kind === 'template' && Array.isArray(matcher.template)) {
    return `/${matcher.template
      .map((segment) => (segment.kind === 'literal' ? segment.value : 'smoke'))
      .join('/')}`;
  }
  if (matcher?.kind === 'namespace_contract' && typeof matcher.namespace === 'string') {
    return matcher.namespace;
  }
  throw new Error('current Registry route has an unsupported matcher shape');
}

function matcherMatchesRawPath(matcher: RegistryMatcher, rawPath: string): boolean {
  if (matcher?.kind === 'exact') {
    return matcher.path === rawPath;
  }
  if (matcher?.kind === 'namespace_contract') {
    const namespace = matcher.namespace?.replace(/\/$/, '');
    return (
      typeof namespace === 'string' &&
      (rawPath === namespace || rawPath.startsWith(`${namespace}/`))
    );
  }
  if (matcher?.kind !== 'template' || !Array.isArray(matcher.template)) {
    return false;
  }

  const rawSegments = rawPath.split('/').filter(Boolean);
  return (
    rawSegments.length === matcher.template.length &&
    matcher.template.every((segment, index) =>
      segment.kind === 'literal'
        ? segment.value === rawSegments[index]
        : segment.kind === 'parameter' && (rawSegments[index]?.length ?? 0) > 0,
    )
  );
}

function requireOperationBilling(capability: RegistryCapability): void {
  for (const retired of [
    'credit_cost',
    'meter_key',
    'maximum_raw_units',
    'charged_raw_units_after_admitted_attempt',
  ]) {
    assert.equal(capability[retired], undefined, `capability exposes retired ${retired}`);
  }
  assert.equal(capability.operations.length, capability.methods.length);
  capability.operations.forEach((operation, index) => {
    assert.equal(operation.method, capability.methods[index]);
    const billing = operation.billing;
    if (billing.mode === 'free_health' || billing.mode === 'pricing_unavailable') {
      assert.deepEqual(Object.keys(billing), ['mode']);
      return;
    }
    assert.equal(billing.mode, 'quantro_priced');
    const creditCost = requiredNumber(billing.credit_cost, 'Registry operation credit cost');
    const priceVersion = requiredNumber(billing.price_version, 'Registry operation price version');
    assert.ok(Number.isSafeInteger(creditCost) && creditCost > 0);
    assert.ok(Number.isSafeInteger(priceVersion) && priceVersion > 0);
    assert.ok(billing.x402);
    assert.match(
      requiredString(billing.x402['atomic_amount'], 'x402 atomic amount'),
      /^[1-9][0-9]*$/u,
    );
  });
}

async function callTool(name: string, args: JsonObject): Promise<JsonObject> {
  const response = await request('tools/call', {
    name,
    arguments: args,
  });

  return asObject(response['structuredContent'], `${name} structured content`);
}

function request(method: string, params: JsonObject): Promise<JsonObject> {
  return requestAllowError(method, params).then((message) => {
    if (message['error'] !== undefined) {
      const error = asObject(message['error'], `${method} JSON-RPC error`);
      throw new Error(requiredString(error['message'], `${method} error message`));
    }

    return asObject(message['result'], `${method} JSON-RPC result`);
  });
}

function requestAllowError(method: string, params: JsonObject): Promise<JsonObject> {
  const id = nextId++;
  const requestMetadata = asObject(params['_meta'] ?? {}, 'request metadata');
  const message = {
    jsonrpc: '2.0',
    id,
    method,
    params: {
      ...params,
      ['_meta']: {
        ...requestMetadata,
        'io.modelcontextprotocol/protocolVersion': pubfiMcpProtocolVersion,
        'io.modelcontextprotocol/clientInfo': {
          name: 'pubfi-route-tools-smoke',
          version: '1.0.0',
        },
        'io.modelcontextprotocol/clientCapabilities': {},
      },
    },
  };

  server.stdin.write(frame(message));

  return new Promise<JsonObject>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (pending.delete(id)) {
        reject(new Error(`Timed out waiting for MCP response to ${method}.`));
      }
    }, 15000);
    timer.unref?.();
    pending.set(id, {
      resolve: (responseMessage: JsonObject) => {
        clearTimeout(timer);
        resolve(responseMessage);
      },
      reject: (error: Error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
  });
}

function readFrames(): void {
  while (true) {
    const headerEnd = outputBuffer.indexOf('\r\n\r\n');

    if (headerEnd === -1) {
      return;
    }

    const header = outputBuffer.subarray(0, headerEnd).toString('utf8');
    const lengthMatch = /^content-length:\s*(\d+)$/im.exec(header);

    assert.ok(lengthMatch, `Missing Content-Length in MCP response header: ${header}`);

    const lengthText = lengthMatch[1];
    assert.ok(lengthText);
    const length = Number.parseInt(lengthText, 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;

    if (outputBuffer.length < bodyEnd) {
      return;
    }

    const body = outputBuffer.subarray(bodyStart, bodyEnd).toString('utf8');
    outputBuffer = outputBuffer.subarray(bodyEnd);

    const message = asObject(parseJson(body), 'MCP response');
    const id = requiredNumber(message['id'], 'MCP response id');
    const pendingRequest = pending.get(id);

    if (!pendingRequest) {
      continue;
    }

    pending.delete(id);
    pendingRequest.resolve(message);
  }
}

function frame(message: unknown): string {
  const body = Buffer.from(JSON.stringify(message), 'utf8');

  return `Content-Length: ${String(body.byteLength)}\r\n\r\n${body.toString('utf8')}`;
}

function printReport(report: JsonObject): void {
  console.log(
    JSON.stringify(
      {
        schema_version: 'pubfi_mcp_agent_smoke_report.v1',
        ...report,
      },
      null,
      2,
    ),
  );
}
