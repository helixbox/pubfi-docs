---
title: MCP Client Setup
description: Connect an MCP client to PubFi's hosted Registry v2 tools.
---

PubFi exposes generic route and capability tools over MCP.

| Environment | Authenticated endpoint | Accountless x402 endpoint | Discovery manifest |
| --- | --- | --- | --- |
| Staging | `https://mcp-stg.pubfi.ai` | `https://mcp-stg.pubfi.ai/x402` | `https://mcp-stg.pubfi.ai/.well-known/mcp.json` |
| Production | `https://mcp.pubfi.ai` | `https://mcp.pubfi.ai/x402` | `https://mcp.pubfi.ai/.well-known/mcp.json` |

Use a separate wallet, private key, endpoint, and payment policy for each environment. Do not reuse
Staging payment material in Production, or the reverse.

Use the [Staging guide](/getting-started/staging) for the login, API-key, smoke, and Base Sepolia
test flow.

Use [MCP Client Guides](/getting-started/mcp-clients) for exact setup in Codex, Claude, GitHub
Copilot, VS Code, Cursor, Devin, Windsurf, Gemini CLI, Kiro, Continue, Cline, Roo Code, Zed,
Amazon Q Developer, JetBrains, Raycast, LM Studio, OpenCode, Warp, LibreChat, goose, and Cherry
Studio. The guide also states the current ChatGPT web and Claude web authentication boundaries.

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

`pubfi.route.execute` supports two endpoint-separated execution modes:

- The authenticated root accepts one Bearer credential: a `pf_sk_v1_` PubFi API key or a Supabase
  OAuth access token. Both use account admission and allocation. Invalid credentials never fall
  back to the other credential type or to x402. `X-PubFi-Api-Key` is not accepted.
- The explicit `/x402` endpoint uses a wallet payment for one eligible request. It rejects
  `Authorization`, `X-PubFi-Api-Key`, and every other Bearer carrier.

The discovery manifest publishes the OAuth authorization server and the
`/.well-known/oauth-protected-resource` URL for the selected environment. A client that supports
MCP OAuth can use that metadata. A static API-key client can continue to send
`Authorization: Bearer <PubFi API key>` to the authenticated root.

The authenticated root advertises `oauth2` with no scopes for `pubfi.route.execute`. If that tool
is called without a credential or with an invalid OAuth credential, PubFi returns HTTP `401`, the
protected-resource discovery header, and `_meta["mcp/www_authenticate"]` in the MCP error tool
result so an OAuth-capable host can start or repair account linking. An invalid `pf_sk_v1_` API key
uses the separate API-key `401` response and does not trigger OAuth linking.

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
4. Inspect the selected method's `operations[].billing`. Call `pubfi.route.execute` for the exact
   ready `raw_path` and `method`. A priced API-key call consumes its positive `credit_cost`; an
   exact `free_health` operation is public and has no Credit or x402 charge.
5. Select the authenticated root with an API key or OAuth access token, or select the `/x402`
   endpoint without a Bearer credential. Never mix those lanes.

## Inspect Tool Schemas

Call hosted `tools/list` on the endpoint that the client will use. The authenticated root declares
`noauth` for the capability reads and `oauth2` with no scopes for route execution. Its route output
schema includes free-health, account-free, and account-paid outcomes. `/x402` declares `noauth` for
all tools and includes only free-health, x402 settlement, payment-required, and x402 error
outcomes. Use the
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

For Staging, use the exact staging endpoint and a key created by the Staging dashboard:

```sh
export STG_PUBFI_API_KEY='<Staging PubFi API key>'
export PUBFI_MCP_ENDPOINT='https://mcp-stg.pubfi.ai'
node examples/agents/pubfi-route-tools-mcp/server.mjs
```

See the [stdio bridge example](https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/pubfi-route-tools-mcp)
for client configuration and smoke commands.

## Accountless x402 Tool Flow

MCP uses the official x402 metadata flow on the explicit `/x402` endpoint. It does not return HTTP
402 on the MCP POST and does not use a JSON-RPC payment error.

1. Connect to `https://mcp-stg.pubfi.ai/x402` or `https://mcp.pubfi.ai/x402`. Call
   `pubfi.route.execute` without Bearer auth and without payment metadata.
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
`PAYMENT-SIGNATURE` HTTP header yourself. Do not send payment metadata to the authenticated root.

A pinned Staging-only runnable example uses `@x402/mcp`, `@x402/core`, `@x402/evm`, and the MCP SDK
against `pubfi.route.execute`. It validates a bounded Base Sepolia payment, verifies the signed
offer and receipt through PubFi's `did:web` document, and checks exact replay:

```text
https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/x402-base-sepolia
```

The example never accepts a wallet key as a tool argument. The caller must inject the key into the
client process through a wallet or secret manager.

A separate historical Production example records the route, Base mainnet, canonical Base USDC,
0.001 USDC, and Production payee accepted on 2026-07-27. Schema v5 now classifies exact health
operations as `free_health`, so the pinned payment commands are archival and must not be run:

```text
https://github.com/helixbox/pubfi-docs/tree/main/examples/agents/x402-base-mainnet
```

Historical acceptance is not current route or payment authority. Select a current non-health
`quantro_priced` operation before constructing a new Production payment policy.

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

An unsupported route, invalid payment, or changed replay binding fails closed before a second
provider execution. The `/x402` endpoint rejects Bearer credentials. The authenticated root
rejects payment metadata. SIWX and anonymous Credits are not part of the current MCP flow.

For detailed tool contracts, continue to the [Agent Interface
Reference](/reference/agent-interface). For payment metadata and replay policy, continue to
[Accountless x402](/getting-started/x402).
