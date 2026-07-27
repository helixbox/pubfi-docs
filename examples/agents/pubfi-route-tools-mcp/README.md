# PubFi MCP Stdio Bridge Smoke Fixture

This public example is a local, dependency-free MCP-compatible stdio bridge and smoke fixture for
the PubFi hosted MCP endpoint.

The bridge forwards `initialize`, `ping`, `tools/list`, and `tools/call` to the Rust MCP endpoint
instead of synthesizing a second handshake, running a retired TypeScript route-tool
implementation, or creating one public tool per provider. The direct HTTP and stdio views therefore
carry the same tool-change flag, generation, and manifest identity.

Configure an MCP client for PubFi's Streamable HTTP endpoint at `https://mcp.pubfi.ai`. The hosted
service uses the same five Registry v2 tools and keeps upstream provider credentials server-side.
`pubfi.route.execute` accepts either PubFi API-key admission or the mutually exclusive accountless
x402 metadata flow.

## Tools

- `pubfi.capabilities.search`
- `pubfi.route.plan`
- `pubfi.route.execute`
- `pubfi.route.explain`
- `pubfi.schema.get`

Executable paths, methods, matchers, schemas, metering, and readiness come from the currently
installed signed Registry generation returned by `tools/list`. They are catalog data, not static
MCP tool names or checked-in provider adapters.

## Run

From the repository root:

```sh
export PROD_PUBFI_API_KEY='<PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

Example MCP client config:

```json
{
  "mcpServers": {
    "pubfi-route-tools": {
      "command": "node",
      "args": ["examples/agents/pubfi-route-tools-mcp/server.mjs"]
    }
  }
}
```

## Staging

Use the exact Staging endpoint and its matching key:

```sh
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp-stg.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

The client configuration above can use the same local command. Start the client from an
environment that supplies these variables, or use its secret-store integration. Do not put the
key in a tracked configuration file.

## Smoke

```sh
node examples/agents/pubfi-route-tools-mcp/smoke_pubfi_route_tools_mcp.mjs
node --test examples/agents/pubfi-route-tools-mcp/bridge-response.test.mjs \
  examples/agents/pubfi-route-tools-mcp/endpoint-policy.test.mjs
```

For an authenticated Staging smoke:

```sh
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp-stg.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/smoke_pubfi_route_tools_mcp.mjs
```

Without the endpoint-selected caller key, the smoke verifies initialize plus the missing-key gate.
With `STG_PUBFI_API_KEY` for staging MCP endpoints or `PROD_PUBFI_API_KEY` for production MCP
endpoints, it checks tool discovery, capability search, planning, explanation, schema readback,
and current-generation identity against the Rust MCP endpoint. For a deliberate live request, set
`PUBFI_MCP_EXECUTE_LIVE=1`, `PUBFI_MCP_SMOKE_RAW_PATH`, and `PUBFI_MCP_SMOKE_METHOD` from the
current catalog. Optional `PUBFI_MCP_SMOKE_QUERY` and `PUBFI_MCP_SMOKE_BODY` supply the exact
route input. `PUBFI_MCP_SMOKE_BODY` is the exact compact ASCII request body (for example,
`{"limit":10}`), not a nested MCP JSON value. The smoke never invents a provider route or
capability id.

See the [Staging guide](../../../getting-started/staging.md) for login, key creation, HTTP checks,
the Base Sepolia test boundary, and the Production transition.

For accountless payment, use an official x402 MCP client. An unsigned eligible
`pubfi.route.execute` call returns `PaymentRequired` in the MCP tool result. The retry carries the
x402 V2 payment object at `params._meta["x402/payment"]`; the settled result carries
`result._meta["x402/payment-response"]`. Do not pass a PubFi API key, private key, or
`PAYMENT-SIGNATURE` HTTP header in this flow.

The stdio bridge accepts only the exact production and staging roots
(`https://mcp.pubfi.ai` and `https://mcp-stg.pubfi.ai`). It rejects userinfo, ports, alternate
paths, query strings, fragments, lookalike hosts, and redirects before forwarding a scoped caller
key. `PUBFI_MCP_ORIGIN` is not a supported alias.

The hosted deploy-equivalent smoke is included in:

```sh
npm run smoke:mcp-e2e --workspace apps/web -- --json
npm run smoke:mcp-e2e --workspace apps/web -- --execute-live --json
```

## Execution Boundary

`pubfi.route.execute` accepts an exact `raw_path` and `method` selected from `tools/list`. The Rust
Data Plane resolves that pair through the installed Registry v2 matcher and uses the same typed
executor, credential authority, metering, generation, and fail-closed readiness state as the HTTP
gateway. A blocked or absent current-catalog route remains non-executable. This bridge does not add
provider branches, compatibility route ids, supplier procurement, automatic payment, or a second
catalog authority.
