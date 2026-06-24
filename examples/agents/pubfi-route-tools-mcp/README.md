# PubFi Route Tools MCP Example

This example runs a dependency-free stdio bridge for PubFi's hosted MCP endpoint.

PubFi's MCP server remains hosted at `https://mcp.pubfi.ai`. This local file exists only because
some MCP clients launch integrations as local stdio commands. It does not run a local provider
adapter, it does not implement PubFi routing locally, and it does not accept upstream provider keys.
It forwards MCP JSON-RPC frames to the hosted Rust MCP endpoint and reads the PubFi caller key from
an environment variable.

## Requirements

- Node.js 18 or newer.
- A PubFi API key only for authenticated tool listing or execution.
- No upstream Subscan, DeGov, supplier, wallet, or payment credentials.

## No-Secret Smoke

The smoke passes without secrets by checking initialization and the missing-key gate:

```sh
node examples/agents/pubfi-route-tools-mcp/smoke_pubfi_route_tools_mcp.mjs
```

Expected report mode:

```json
{
  "schema_version": "pubfi_mcp_agent_smoke_report.v1",
  "verdict": "pass",
  "mode": "auth_required"
}
```

## Authenticated Dry Run

```sh
export PROD_PUBFI_API_KEY='<PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/smoke_pubfi_route_tools_mcp.mjs
```

The dry run verifies:

- the six generic PubFi MCP tool names;
- capability search;
- route planning;
- route explanation;
- schema readback;
- pricing quote;
- provider-specific execution rejection.

## Optional Live Execution

Live execution spends account credits and requires the hosted backend to have server-side provider
credentials configured:

```sh
export PROD_PUBFI_API_KEY='<PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp.pubfi.ai'
export PUBFI_MCP_EXECUTE_LIVE=1
export PUBFI_MCP_SMOKE_WALLET_ADDRESS='<wallet address to query>'
node examples/agents/pubfi-route-tools-mcp/smoke_pubfi_route_tools_mcp.mjs
```

Do not paste the API key or wallet address into issue comments, prompts, public logs, or docs.

## MCP Client Config

```json
{
  "mcpServers": {
    "pubfi-route-tools": {
      "command": "node",
      "args": ["examples/agents/pubfi-route-tools-mcp/server.mjs"],
      "env": {
        "PUBFI_MCP_ENDPOINT": "https://mcp.pubfi.ai"
      }
    }
  }
}
```

Load `PROD_PUBFI_API_KEY` through your local secret store rather than committing it to this file.
