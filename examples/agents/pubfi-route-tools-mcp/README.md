# PubFi MCP Stdio Bridge Smoke Fixture

This public example is a local, dependency-free MCP-compatible stdio bridge and smoke fixture for
the PubFi hosted MCP endpoint.

The bridge forwards `initialize`, `ping`, `tools/list`, and `tools/call` to the Rust MCP endpoint
instead of synthesizing a second handshake, running a retired TypeScript route-tool
implementation, or creating one public tool per provider. The direct HTTP and stdio views therefore
carry the same tool-change flag, generation, and manifest identity.

For hosted authenticated use, configure an MCP client for PubFi's Streamable HTTP endpoint at
`https://mcp.pubfi.ai`. The hosted service uses the same three fixed Registry v2 tools. Catalog
list/detail reads are public. Exact execution on this root requires a PubFi API key or OAuth access
token. Eligible accountless x402 execution uses `https://mcp.pubfi.ai/x402` without a Bearer
credential. Upstream provider credentials stay server-side.

## Tools

- `pubfi.capabilities.list`
- `pubfi.capabilities.get`
- `pubfi.route.execute`

`pubfi.capabilities.list` enumerates compact summaries with an opaque generation-bound cursor.
`pubfi.capabilities.get` returns the full typed contract for one exact capability id. The client
agent selects the capability; PubFi does not rank candidates or infer intent. Executable paths,
methods, matchers, schemas, one-Credit cost, and readiness come only from the installed signed
Registry generation.

## Run In Staging

From the repository root:

```sh
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp-stg.pubfi.ai'
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

Start the client from an environment that supplies these variables, or use its secret-store
integration. Do not put the key in a tracked configuration file.

## Move To Production

Create a separate Production key and use the exact Production endpoint:

```sh
export PROD_PUBFI_API_KEY='<Production PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

The client configuration above uses the same local command. Do not send a Staging key to the
Production endpoint.

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

Without the endpoint-selected caller key, the smoke verifies initialization, the fixed tool list,
complete catalog pagination, exact capability detail, and the execution credential gate. With
`STG_PUBFI_API_KEY` for staging MCP endpoints or `PROD_PUBFI_API_KEY` for production MCP
endpoints, the same catalog reads remain public. For a deliberate live request, set
`PUBFI_MCP_EXECUTE_LIVE=1`, `PUBFI_MCP_SMOKE_RAW_PATH`, and `PUBFI_MCP_SMOKE_METHOD` from the
current catalog. Optional `PUBFI_MCP_SMOKE_QUERY` and `PUBFI_MCP_SMOKE_BODY` supply the exact
route input. `PUBFI_MCP_SMOKE_BODY` is the exact compact ASCII request body (for example,
`{"limit":10}`), not a nested MCP JSON value. The smoke never invents a provider route or
capability id.

See the [Staging guide](../../../getting-started/staging.md) for login, key creation, HTTP checks,
the Base Sepolia test boundary, and the Production transition.

For accountless payment, use an official x402 MCP client. An unsigned eligible
`pubfi.route.execute` call on `https://mcp-stg.pubfi.ai/x402` or
`https://mcp.pubfi.ai/x402` returns `PaymentRequired` in the MCP tool result. The retry carries the
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

`pubfi.route.execute` accepts an exact `raw_path` and `method` selected after list/detail catalog
reads. The Rust Data Plane resolves that pair through the installed Registry v2 matcher and uses
the same typed executor, credential authority, Credit accounting, generation, and fail-closed
readiness state as the HTTP gateway. A blocked or absent current-catalog route remains
non-executable. This bridge does not add provider branches, capability ranking, compatibility route
ids, supplier procurement, automatic payment, or a second catalog authority.
