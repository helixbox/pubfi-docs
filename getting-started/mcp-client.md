---
title: MCP Client Setup
description: Connect an MCP client to PubFi's hosted Registry v2 tools.
---

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

Provider ids, exact paths, methods, request policies, response policies, and readiness appear as
Registry catalog or route-result data. They are not public tool names.

## Execution Modes

Public handshake and introspection methods, such as `initialize`, `ping`, `tools/list`,
`resources/list`, `resources/templates/list`, `prompts/list`, and `notifications/initialized`,
can be called without a key.

`pubfi.route.execute` supports two mutually exclusive execution modes:

- An API-key call uses account admission and allocation. Pass the key through the transport as
  `Authorization: Bearer <PubFi API key>` or `X-PubFi-Api-Key: <PubFi API key>`.
- An accountless x402 call uses a wallet payment for one eligible request. Do not send a PubFi API
  key in this mode.

Sending both authorities is a conflict. An invalid API key never falls back to x402.

Do not pass upstream provider keys as MCP arguments. PubFi leases upstream credentials server-side
when the selected route is callable and configured.

## Local Stdio Bridge

The current public-safe local example lives in the source repository at:

```text
examples/agents/pubfi-route-tools-mcp/
```

PubFi's MCP server is hosted at `https://mcp.pubfi.ai`. The local file is not a second MCP backend
and it does not run provider logic locally. It is a dependency-free stdio bridge for MCP clients
that launch tools as local commands. The bridge forwards `initialize`, `ping`, `tools/list`, and
authenticated `tools/call` requests to the hosted Rust MCP endpoint, then writes the response back
to stdio. Other hosted public introspection methods remain available on `https://mcp.pubfi.ai`;
the local bridge keeps its stdio surface intentionally small.

```sh
export PROD_PUBFI_API_KEY='<PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

## Recommended Agent Flow

1. Call `pubfi.capabilities.search` with a query or exact path and method.
2. Call `pubfi.route.plan` with the exact `raw_path` and `method`.
3. Call `pubfi.route.explain` when the plan needs a reason readback.
4. Call `pubfi.schema.get` before constructing execution input.
5. Call `pubfi.route.execute` only for an exact ready `raw_path` and `method`.
6. Select API-key admission or x402 payment. Never send both.

## Accountless x402 Tool Flow

MCP uses the official x402 metadata flow. It does not return HTTP 402 on the MCP POST and does not
use a JSON-RPC payment error.

1. Call `pubfi.route.execute` without API-key auth and without payment metadata.
2. For an eligible route, require a normal JSON-RPC success whose `CallToolResult` has:
   - `isError: true`;
   - the exact x402 V2 `PaymentRequired` object in `structuredContent`; and
   - compact JSON of the same object in `content[0].text`.
3. Validate the payment requirements and create an x402 V2 `PaymentPayload` with your wallet.
4. Retry the same tool and arguments. Put the payment object at
   `params._meta["x402/payment"]`.
5. On success, read the decoded settlement response at
   `result._meta["x402/payment-response"]`.

The bounded `_meta` object can also contain unrelated MCP client metadata. Only
`_meta["x402/payment"]` is a payment carrier. Other `_meta` entries do not select the payment lane.

Use an x402 MCP client that implements this flow. Do not convert the MCP challenge into a
`PAYMENT-SIGNATURE` HTTP header yourself.

The wire shape is:

```json
{
  "method": "tools/call",
  "params": {
    "name": "pubfi.route.execute",
    "arguments": {
      "raw_path": "/v1/gateway/example",
      "method": "GET"
    },
    "_meta": {
      "x402/payment": "<x402 V2 PaymentPayload object>"
    }
  }
}
```

The string above marks the position of the object. Send the actual validated JSON object, not a
string and not a private key.

HTTP and MCP share the same Registry route, Quantro quote and claim, provider fence, settlement,
and exact replay. A replay of the same paid tool call returns the retained result and payment
response without a second provider call. Replay equivalence applies to `structuredContent` and
`result._meta["x402/payment-response"]`, not to raw JSON-RPC response bytes.

## Tool Inputs

The hosted `tools/list` method publishes the current JSON Schema for each tool. The current public
input fields are:

| Tool | Input fields |
| --- | --- |
| `pubfi.capabilities.search` | `query`, `raw_path`, `method` |
| `pubfi.route.plan` | `raw_path`, `method`, `objective`, `query` |
| `pubfi.route.execute` | required `raw_path`, `method`; optional `query`, `body`, `idempotency_key`, `request_id` |
| `pubfi.route.explain` | `raw_path`, `method`, `objective`, `query` |
| `pubfi.schema.get` | `tool` |

## Fail-Closed Behavior

Unsupported paths, methods, non-ready operations, invalid exact query or body bytes, and supplier
procurement attempts return explicit gate readbacks rather than silently calling upstream APIs.

An unsupported route, invalid payment, mixed API-key and payment authorities, or changed replay
binding fails closed before a second provider execution. SIWX and anonymous Credits are not part
of the current MCP flow.
