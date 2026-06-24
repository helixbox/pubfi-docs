# MCP Client Setup

PubFi exposes generic route and capability tools over MCP. The hosted endpoint is:

```text
https://mcp.pubfi.ai
```

The discovery manifest is:

```text
https://mcp.pubfi.ai/.well-known/mcp.json
```

## Tools

- `pubfi.capabilities.search`
- `pubfi.route.plan`
- `pubfi.route.execute`
- `pubfi.route.explain`
- `pubfi.schema.get`
- `pubfi.pricing.quote`

Provider ids, endpoint paths, schemas, prices, source freshness, and readiness appear as catalog or
route-result data. They are not public tool names.

## Auth

Hosted MCP POST requests require a PubFi API key:

```text
Authorization: Bearer <PubFi API key>
X-PubFi-Api-Key: <PubFi API key>
```

Do not pass upstream provider keys as MCP arguments. PubFi leases upstream credentials server-side
when the selected route is callable and configured.

## Local Stdio Bridge

The current public-safe local example lives in the source repository at:

```text
examples/agents/pubfi-route-tools-mcp/
```

PubFi's MCP server is hosted at `https://mcp.pubfi.ai`. The local file is not a second MCP backend
and it does not run provider logic locally. It is a dependency-free stdio bridge for MCP clients
that launch tools as local commands. The bridge reads JSON-RPC frames from the client, forwards
them to the hosted Rust MCP endpoint, and writes the hosted response back to stdio.

```sh
export PROD_PUBFI_API_KEY='<production PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

## Recommended Agent Flow

1. Call `pubfi.capabilities.search`.
2. Call `pubfi.route.plan`.
3. Call `pubfi.route.explain` when the plan needs a reason readback.
4. Call `pubfi.schema.get` before constructing execution input.
5. Call `pubfi.pricing.quote` for paid-capable flows.
6. Call `pubfi.route.execute` only for supported callable capability route ids with planning
   evidence.

## Fail-Closed Behavior

Unsupported provider-specific route ids, missing planning evidence, non-callable plans, and paid
supplier execution attempts should return explicit gate readbacks rather than silently calling
upstream APIs.
