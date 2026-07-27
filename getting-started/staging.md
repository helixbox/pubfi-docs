---
title: Staging Guide
description: Test PubFi web, API, MCP, and Base Sepolia x402 flows in the staging environment.
---

# Staging Guide

Use Staging to test a PubFi integration before you move it to Production. Staging has separate web,
API, and MCP roots.

## Environment Roots

| Surface | Staging root |
| --- | --- |
| Web and dashboard | `https://stg.pubfi.ai` |
| HTTP API | `https://api-stg.pubfi.ai` |
| MCP | `https://mcp-stg.pubfi.ai` |

Use only these exact HTTPS origins. Do not add a port, path, query, fragment, or user information to
an origin.

Set reusable shell variables:

```sh
export PUBFI_API_BASE='https://api-stg.pubfi.ai'
export PUBFI_MCP_ENDPOINT='https://mcp-stg.pubfi.ai'
```

## Sign In And Create A Key

1. Open [`https://stg.pubfi.ai/login`](https://stg.pubfi.ai/login).
2. Enter the email address that owns your staging dashboard access.
3. Request a sign-in code.
4. Enter the six-digit code from the email in the same browser tab.
5. Open the dashboard after sign-in.
6. In **Manage application keys**, create a key. Select **Staging** and use a clear name such as
   `staging-agent`.
7. Copy the full key when PubFi shows it. PubFi shows the secret only once.
8. Store the key in a secret manager. Do not put it in source code, shell history, logs, screenshots,
   or a tracked MCP configuration file.

The key manager requires billing-account administration access. If the dashboard has no billing
account, or if the key manager is not available, ask your billing-account owner or administrator
for access.

Load the key into the current shell:

```sh
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
```

## Inspect The Current Contract

Fetch the public Registry catalog before each test:

```sh
curl --fail --silent --show-error \
  "${PUBFI_API_BASE}/v1/capabilities"
```

Fetch the Runtime OpenAPI:

```sh
curl --fail --silent --show-error \
  "${PUBFI_API_BASE}/openapi.json"
```

You can also open the interactive staging reference:

```text
https://api-stg.pubfi.ai/reference
```

The catalog is the authority for the current generation, matcher, method, and readiness. OpenAPI
contains only current `ready` operations. Refresh both surfaces when the generation changes.

## Make An API-Key Call

At the 2026-07-27 source snapshot, the staging catalog included this ready test route:

```text
GET /v1/gateway/quantro/health
```

Confirm that the current catalog still contains the exact path and method before you call it. Then
send the staging key:

```sh
curl --fail --silent --show-error \
  --request GET \
  --header "Authorization: Bearer ${STG_PUBFI_API_KEY}" \
  "${PUBFI_API_BASE}/v1/gateway/quantro/health"
```

You can use `X-PubFi-Api-Key` instead of `Authorization`. Do not send both auth headers. For a
different route, copy the exact matcher and method from the current catalog. Follow its query,
body, and response policy.

## Connect An MCP Client

The staging Streamable HTTP endpoint and discovery manifest are:

```text
https://mcp-stg.pubfi.ai
https://mcp-stg.pubfi.ai/.well-known/mcp.json
```

PubFi also provides a dependency-free local stdio bridge in
`examples/agents/pubfi-route-tools-mcp/`. Start it from the repository root:

```sh
export PUBFI_MCP_ENDPOINT='https://mcp-stg.pubfi.ai'
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

Use this MCP client shape for the bridge:

```json
{
  "mcpServers": {
    "pubfi-staging": {
      "command": "node",
      "args": ["examples/agents/pubfi-route-tools-mcp/server.mjs"]
    }
  }
}
```

Start the MCP client from an environment that supplies `PUBFI_MCP_ENDPOINT` and
`STG_PUBFI_API_KEY`, or use the client's secret-store integration. Environment-variable syntax in
MCP configuration files is client-specific.

Run the safe smoke:

```sh
export PUBFI_MCP_ENDPOINT='https://mcp-stg.pubfi.ai'
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
node examples/agents/pubfi-route-tools-mcp/smoke_pubfi_route_tools_mcp.mjs
```

With the key, this smoke checks initialization, tool discovery, capability search, route planning,
route explanation, schema readback, and Registry generation identity. It does not execute a
provider route unless you explicitly set `PUBFI_MCP_EXECUTE_LIVE=1` and supply an exact current
path and method.

## Base Sepolia Test Boundary

Staging is the PubFi Base Sepolia test boundary for accountless x402. The CAIP-2 network id is
`eip155:84532`.

To inspect a challenge, first confirm that the current catalog marks the route as ready. Then call
the route without a PubFi API key:

```sh
curl --silent --show-error \
  --request GET \
  --dump-header - \
  "${PUBFI_API_BASE}/v1/gateway/quantro/health"
```

Treat only a current unsigned `402` response as x402 availability evidence for the exact route and
method. Require the live challenge to specify Base Sepolia before you sign anything. Use only
testnet funds and a dedicated test wallet. Do not send a PubFi API key and `PAYMENT-SIGNATURE` in
the same request.

For MCP, use the official x402 metadata flow. Put the payment object in
`params._meta["x402/payment"]`. Do not convert it into an HTTP header.

This staging boundary does not prove that x402 is available in Production. A checked-in route,
OpenAPI path, or old challenge is not current availability evidence.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| The email code fails. | Use the newest six-digit code. Request a new code if it expired. Wait for the displayed cooldown before another request. |
| The dashboard has no key manager. | Confirm that the staging identity has a billing-account membership and administration access. |
| The API returns `401`. | Confirm that you used `api-stg.pubfi.ai`, loaded `STG_PUBFI_API_KEY`, and sent one supported API-key header. |
| The route returns `404` or `405`. | Refresh the staging catalog and OpenAPI. Copy the exact current path and method. |
| The route is blocked or returns `503`. | Treat the route as unavailable. Do not bypass Registry readiness or provider-readiness gates. |
| An MCP tool call reports a missing key. | Set `STG_PUBFI_API_KEY` and confirm that `PUBFI_MCP_ENDPOINT` is exactly `https://mcp-stg.pubfi.ai`. |
| An x402 challenge does not appear. | Remove all PubFi API-key headers and confirm that the catalog marks the exact route and method as ready. If an unsigned call still does not return `402`, treat the lane as unavailable. |

## Move To Production

Treat Production as a separate environment:

1. Change the roots to `https://pubfi.ai`, `https://api.pubfi.ai`, and
   `https://mcp.pubfi.ai`.
2. Create and store a separate Production API key. Use `PROD_PUBFI_API_KEY` for the public examples.
3. Fetch the Production catalog and OpenAPI again.
4. Confirm each exact route, method, schema, and readiness state.
5. Run a non-executing MCP smoke before you enable deliberate live execution.
6. Production permits Base mainnet only when x402 is enabled for the exact route. A Production
   payment can have real financial value. Inspect the current catalog and unsigned challenge
   before you infer availability or sign.

See [API Key And Runtime](/getting-started/api-key-runtime), [MCP Client
Setup](/getting-started/mcp-client), and [Runtime Endpoints](/reference/runtime-endpoints) for the
shared contracts.
