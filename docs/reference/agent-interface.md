# Agent Interface Reference

## Hosted MCP

```text
https://mcp.pubfi.ai
https://mcp.pubfi.ai/.well-known/mcp.json
```

## Public API Schema

```text
https://api.pubfi.ai/openapi.json
```

## Generic MCP Tools

| Tool | Purpose |
| --- | --- |
| `pubfi.capabilities.search` | Find candidate capabilities, routes, providers, schemas, source-fit evidence, freshness evidence, and readiness posture. |
| `pubfi.route.plan` | Turn an agent data need into a selected route, ranked candidates, rejected candidates, abstention, unsupported result, or procurement preview. |
| `pubfi.route.execute` | Execute a previously planned supported PubFi capability route id, or return a fail-closed gate readback. |
| `pubfi.route.explain` | Return route reasons, hard filters, provenance evidence, redaction state, and production-gate status. |
| `pubfi.schema.get` | Return schemas for a capability, route, envelope, or planned argument set. |
| `pubfi.pricing.quote` | Estimate price, payment mode, quota impact, and budget impact before execution. |

Durable provider-specific public tools are rejected. Provider identity belongs in route-result data,
not tool names.

## Auth

```text
Authorization: Bearer <PubFi API key>
X-PubFi-Api-Key: <PubFi API key>
```

Upstream provider keys remain server-side.

## Execution Rule

`pubfi.route.execute` should execute only a supported callable PubFi capability route id with
validated planning evidence. Unsupported provider-specific route ids, non-callable plans, and paid
supplier intents should fail closed with explicit reasons.

