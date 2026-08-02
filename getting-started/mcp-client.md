---
title: MCP Client Setup
description: Connect an MCP client to PubFi's hosted Registry v2 tools.
---

PubFi exposes generic route and capability tools over MCP.

| Environment | Hosted endpoint | Discovery manifest |
| --- | --- | --- |
| Staging | `https://mcp-stg.pubfi.ai` | `https://mcp-stg.pubfi.ai/.well-known/mcp.json` |
| Production | `https://mcp.pubfi.ai` | `https://mcp.pubfi.ai/.well-known/mcp.json` |

Use a separate wallet, private key, endpoint, and payment policy for each environment. Do not reuse
Staging payment material in Production, or the reverse.

Use the [Staging guide](/getting-started/staging) for the login, API-key, smoke, and Base Sepolia
test flow.

## Choose A Transport

| Client capability | Transport |
| --- | --- |
| The client supports remote Streamable HTTP | Connect directly to the hosted endpoint for the selected environment. |
| The client launches MCP servers as local commands | Use the repository's local stdio bridge. |

The stdio bridge requires a checkout of this repository and a supported Node.js runtime. It
forwards MCP requests to the hosted endpoint. It is not a local PubFi backend.

## Tools

- `pubfi.capabilities.list`
- `pubfi.capabilities.get`
- `pubfi.route.execute`

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

An agent with a wallet-capable x402 MCP client can pay an eligible
`pubfi.route.execute` call directly through MCP. It does not need a PubFi account, API key, or a
separate paid HTTP request. The payment uses USDC from the selected wallet and does not create an
invoice or Credits.

Do not pass upstream provider keys as MCP arguments. PubFi leases upstream credentials server-side
when the selected route is callable and configured.

## Recommended Agent Flow

1. Call `pubfi.capabilities.list` and follow every opaque `next_cursor` for one installed
   generation. Optional exact `provider_key` and `method` filters must remain unchanged across
   pages.
2. Select a capability in the client. PubFi does not rank or select one for you.
3. Call `pubfi.capabilities.get` with its exact `capability_id` to read the full typed contract.
4. Call `pubfi.route.execute` only for the selected ready `raw_path` and `method`.
5. Select API-key admission or x402 payment. Never send both.

## Inspect Tool Schemas

Call hosted `tools/list` for current input and output schemas. Use the
[Agent Interface Reference](/reference/agent-interface) for the stable tool-purpose and field
summary. Do not copy an old schema into a client as permanent authority.

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

For Staging, use the exact staging endpoint and its environment-selected key:

```sh
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp-stg.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

See the [stdio bridge example](https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/pubfi-route-tools-mcp)
for client configuration and smoke commands.

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

A pinned Staging-only runnable example uses `@x402/mcp`, `@x402/core`, `@x402/evm`, and the MCP SDK
against `pubfi.route.execute`. It validates a bounded Base Sepolia payment, verifies the signed
offer and receipt through PubFi's `did:web` document, and checks exact replay:

```text
https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/x402-base-sepolia
```

The example never accepts a wallet key as a tool argument. The caller must inject the key into the
client process through a wallet or secret manager.

A separate Production example pins `pubfi.route.execute` to the Production health route, Base
mainnet, canonical Base USDC, 0.001 USDC, and the published Production payee. It verifies the
signed offer and receipt and then checks exact MCP replay:

```text
https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/x402-base-mainnet
```

The Production example spends real USDC. It does not accept Staging origins or Base Sepolia.

The wire shape is:

```json
{
  "method": "tools/call",
  "params": {
    "name": "pubfi.route.execute",
    "arguments": {
      "raw_path": "/v1/gateway/quantro/health",
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

HTTP and MCP share the same x402 V2 `exact` payment path: Registry route, Quantro quote and claim,
provider fence, settlement, Signed Receipt, and exact replay. A replay of the same paid tool call
returns the retained result and payment response without a second provider call, settlement, or
wallet charge. Replay equivalence applies to `structuredContent` and
`result._meta["x402/payment-response"]`, not to raw JSON-RPC response bytes.

## Fail-Closed Behavior

Unsupported paths, methods, non-ready operations, invalid exact query or body bytes, and supplier
procurement attempts return explicit gate readbacks rather than silently calling upstream APIs.

An unsupported route, invalid payment, mixed API-key and payment authorities, or changed replay
binding fails closed before a second provider execution. SIWX and anonymous Credits are not part
of the current MCP flow.

For detailed tool contracts, continue to the [Agent Interface
Reference](/reference/agent-interface). For payment metadata and replay policy, continue to
[Accountless x402](/getting-started/x402).
