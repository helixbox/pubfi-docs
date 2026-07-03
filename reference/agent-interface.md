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

| Tool | Purpose | Public input fields |
| --- | --- | --- |
| `pubfi.capabilities.search` | Search PubFi's capability catalog for routeable crypto data needs. This returns read-only catalog metadata and does not call upstream providers or spend credits. | `query`, `required_capabilities`, `categories` |
| `pubfi.route.plan` | Create a dry-run PubFi route plan from an intent, objective, chains, categories, or required capabilities. This is read-only and does not call upstream providers, execute routes, or spend credits. | `intent`, `objective`, `chains`, `categories`, `required_capabilities`, `dry_run` |
| `pubfi.route.execute` | Execute a selected PubFi capability route using route-planning evidence from `pubfi.route.plan`. This requires a PubFi API key, may consume account credits, and rejects provider-specific route ids outside the generic capability surface. | `route_id`, `route_plan`, `arguments`, `idempotency_key`, `request_id` |
| `pubfi.route.explain` | Explain the routing decision PubFi would make for an intent. This read-only diagnostic returns reason codes, filters, and selected route metadata without executing providers or spending credits. | `intent`, `objective`, `chains`, `categories`, `required_capabilities`, `dry_run` |
| `pubfi.schema.get` | Return PubFi MCP input and output schema details for a named tool, especially `pubfi.route.execute`. This is read-only and intended for agent setup and validation before planning or execution. | `tool` |
| `pubfi.pricing.quote` | Estimate PubFi credits and readiness for a capability route. This read-only quote does not create payment payloads, procure supplier access, or execute the route. | `route_id`, `capability_id`, `intent` |

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
