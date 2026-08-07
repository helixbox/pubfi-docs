---
title: Quickstart
description: Choose a PubFi environment and execution path, inspect current contracts, and make a first request.
---

Use this quickstart to choose one environment and one execution lane. You do not need a PubFi API
key to inspect public contracts or use an eligible accountless x402 route.

## 1. Choose An Environment

| Environment | Web | API | MCP |
| --- | --- | --- | --- |
| Staging | `https://stg.pubfi.ai` | `https://api-stg.pubfi.ai` | `https://mcp-stg.pubfi.ai` |
| Production | `https://pubfi.ai` | `https://api.pubfi.ai` | `https://mcp.pubfi.ai` |

Start in Staging. Keep the web, API, MCP, credentials, and payment network in the same environment.
See the [Staging Guide](/getting-started/staging) for login and test details.

## 2. Choose A Path

| Goal | Interface or lane | PubFi API key |
| --- | --- | --- |
| Compare crypto data providers | [Discovery](https://pubfi.ai/discovery) | No |
| Inspect routes and schemas | Registry catalog, Runtime OpenAPI, or MCP `tools/list` | No |
| Execute through HTTP with account allocation | API-key lane | Yes |
| Execute through MCP with account allocation | MCP API-key lane | Yes |
| Buy one eligible response without an account | HTTP or MCP x402 lane | No |

Do not combine a PubFi API key with x402 payment evidence.

## 3. Inspect The Current Contract

Set the API root for the selected environment. This example uses Staging:

```sh
export PUBFI_API_BASE='https://api-stg.pubfi.ai'
```

Fetch the complete Registry catalog and the executable HTTP schema:

```sh
curl --fail --silent --show-error "${PUBFI_API_BASE}/v1/capabilities"
curl --fail --silent --show-error "${PUBFI_API_BASE}/openapi.json"
```

The catalog lists all installed operations and their readiness. Runtime OpenAPI includes current
`ready` HTTP operations. Do not infer execution from Discovery, an old example, or a saved route
from another environment or Registry generation.

## 4. Use The API-Key Lane

Skip this section if you selected accountless x402.

Create a key in the selected environment's **Manage application keys** dashboard. The server
assigns the key environment; the client does not select it. Store the key outside prompts, source
code, logs, and tracked client configuration. For Staging:

```sh
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
```

Select an exact current `ready` path and method whose matching `operations[].billing.mode` is
`quantro_priced`. Set those values, then send the supported auth header:

```sh
export PUBFI_GATEWAY_PATH='<exact ready Quantro-priced path>'
export PUBFI_GATEWAY_METHOD='<GET or POST>'

curl --fail --silent --show-error \
  --request "${PUBFI_GATEWAY_METHOD}" \
  --header "Authorization: Bearer ${STG_PUBFI_API_KEY}" \
  "${PUBFI_API_BASE}${PUBFI_GATEWAY_PATH}"
```

Confirm that the exact route is still `ready` before you call it. Continue with [API Key And
Runtime](/getting-started/api-key-runtime) and [Registry Gateway
Examples](/reference/provider-gateway-examples).

## 5. Connect Through MCP

Use [MCP Client Setup](/getting-started/mcp-client) to choose hosted Streamable HTTP or the local
stdio bridge. Then use [MCP Client Guides](/getting-started/mcp-clients) for exact configuration
in Codex, Claude, GitHub Copilot, VS Code, Cursor, Gemini CLI, and other common clients. MCP
exposes catalog list and detail tools plus exact route execution over the same Registry authority
as the HTTP gateway.

## 6. Or Use Accountless x402

Skip API-key creation. Select a current `ready` Staging operation whose matching billing mode is
`quantro_priced`, confirm its published x402 terms, then call that exact route without auth:

```sh
export PUBFI_X402_PATH='<exact ready Quantro-priced path>'

curl --include \
  "${PUBFI_API_BASE}${PUBFI_X402_PATH}"
```

Only a current unsigned `402` response proves x402 availability for that exact request. Validate
every payment term before you sign. Staging permits Base Sepolia `eip155:84532`. Production
permits Base mainnet `eip155:8453` only when x402 is enabled for the exact route.

Continue with [Accountless x402](/getting-started/x402) for wallet policy, payment, receipt, and
replay rules.

## 7. Check Readiness Before Execution

A source page, schema, or route plan is not execution authority. Every call needs an exact `ready`
operation and its request-time gates. The API-key lane also needs a key for the selected
environment, fresh admission, and sufficient allocation. The x402 lane needs current route
eligibility and a valid request-bound payment authorization.

## Continue By Goal

| Goal | Next page |
| --- | --- |
| Understand API schemas and auth families | [API Reference](/reference/api-reference) |
| Connect an agent runtime | [Agent Interface Reference](/reference/agent-interface) |
| Compare payment and execution lanes | [Payment And Execution Modes](/concepts/payment-and-execution-modes) |
| Understand route authority and readiness | [Capability And Registry Contracts](/concepts/capability-contracts) |
| Browse runnable examples | [Public examples](https://github.com/helixbox/pubfi-docs/tree/main/examples) |
