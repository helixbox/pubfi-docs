# Quickstart

This quickstart shows how to orient around PubFi's public docs, Discovery surfaces, and agent
interfaces.

## 1. Read The Public Index

Start with:

```text
https://pubfi.ai/discovery
https://pubfi.ai/llms.txt
https://pubfi.ai/llms-full.txt
https://docs.pubfi.ai/reference/agent-interface
```

Use Discovery to understand source categories, chains, providers, comparison pages, topic pages,
and public claim-safe readiness.

## 2. Inspect API And MCP Schemas

Open:

```text
https://api.pubfi.ai/reference
https://api.pubfi.ai/openapi.json
https://mcp.pubfi.ai/.well-known/mcp.json
```

The API reference is the interactive HTTP reference. The OpenAPI schema is the machine-readable
HTTP contract source. The MCP manifest is the agent-tool discovery surface.

## 3. Choose The Right Path

| Need | Path |
| --- | --- |
| Compare crypto data providers | Discovery pages |
| Inspect the installed Registry v2 catalog | `GET /v1/capabilities` |
| Search the Registry through MCP | `pubfi.capabilities.search` |
| Plan or explain an exact path and method | `pubfi.route.plan` or `pubfi.route.explain` |
| Inspect current MCP schemas and dynamic routes | `pubfi.schema.get` or `tools/list` |
| Execute through MCP | `pubfi.route.execute` with API-key auth or accountless x402 |
| Execute an eligible accountless HTTP route | x402 V2 with no PubFi API key |

## 4. Create Or Load An API Key

Open the PubFi dashboard, go to **Manage application keys**, and create a key for the
environment or agent runtime you are wiring up. Name keys by where they run, such as
`staging`, `production`, or `agent-runtime`.

Copy the key when it is shown. PubFi keys use the `pf_sk_v1_` prefix and are shown only once after
creation. Multiple keys under the same billing account share its request allowance and usage
history.

## 5. Keep Secrets Out Of Prompts

PubFi API keys belong in a secret store or environment variable. Upstream provider keys stay
server-side and must not be sent by agents.

## 6. Inspect Current Routes

The Registry catalog is public and does not require a PubFi API key:

```bash
curl --silent --show-error 'https://api.pubfi.ai/v1/capabilities'
```

Treat this response and the Runtime OpenAPI as current authority. Do not infer execution from a
Discovery listing, an old provider example, or a static provider schema.

## 7. Send A Minimal Gateway Request

The current Registry includes this exact ready route:

```bash
curl --location 'https://api.pubfi.ai/v1/gateway/quantro/health' \
  --header 'Authorization: Bearer <PubFi API key>'
```

Use only paths and methods present in the current Registry generation.

## 8. Or Use Accountless x402

Omit the API key on an x402-enabled route to receive a `402 Payment Required` challenge. A paid
retry uses `PAYMENT-SIGNATURE`; a settled success returns `PAYMENT-RESPONSE`.

```bash
curl --include 'https://api.pubfi.ai/v1/gateway/quantro/health'
```

Current x402 support uses Base Sepolia test USDC, not real-value Base mainnet USDC. Read
[Accountless x402](/getting-started/x402) before signing.

For MCP, call `pubfi.route.execute` without an API key. An eligible route returns the payment
requirement in the MCP tool result. Retry the same call with
`params._meta["x402/payment"]`. The settled tool result includes
`result._meta["x402/payment-response"]`.

## 9. Check Readiness Before Execution

Do not treat a source page, schema, or route plan as proof of live execution. Live execution also
requires a ready route in the installed Registry generation and all route-owned preflight gates.
The API-key lane also requires valid scope, fresh admission, and sufficient allocation. The x402
lane instead requires an eligible route and a valid request-bound payment authorization.

## Next

- [API reference](/reference/api-reference)
- [Provider Gateway Examples](/reference/provider-gateway-examples)
- [Accountless x402](/getting-started/x402)
- [Payment and execution modes](/concepts/payment-and-execution-modes)
- [MCP client setup](/getting-started/mcp-client)
- [Capability contracts](/concepts/capability-contracts)
- [Readiness and claim safety](/concepts/readiness-and-claim-safety)
- [Public examples](https://github.com/helixbox/pubfi-docs/tree/main/examples)
