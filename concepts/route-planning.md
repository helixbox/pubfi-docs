---
title: Route Planning
description: Resolve an exact path and method against the current Registry generation before execution.
---

Route planning resolves an exact path and HTTP method against the currently installed Registry v2
generation. It can return a match, candidate list, rejection, or abstention without executing an
upstream provider.

## Default Flow

1. Read the current Registry generation.
2. Supply an exact `raw_path` and `method`, or a bounded provider-neutral `objective` or `query`.
3. Apply the Registry matcher and readiness rules.
4. Return the generation-bound route decision and reason.
5. Execute only an exact ready path and method from that generation.

## Example Intent

```json
{
  "raw_path": "/v1/gateway/quantro/health",
  "method": "GET",
  "objective": "Check the current Quantro gateway route."
}
```

## Hard Filters

Hard filters can include:

- exact canonical path and method;
- current Registry generation and matcher;
- operation readiness;
- request query and body bounds;
- configured provider credential when required;
- response content and status policy;
- caller API-key scope and allocation for authenticated execution; and
- x402 eligibility for an accountless HTTP or MCP request.

## Outcomes

| Outcome | Meaning |
| --- | --- |
| ready exact route | execution may proceed after immediate request-time preflight |
| abstention | PubFi should not select a route from available evidence |
| unsupported | request is outside current product boundary |
| no match | the current Registry has no operation for that exact request |

## Non-Goals

Route planning must not call providers, create x402 payment payloads, consume allocation, grant
credentials, or hide rejected candidates and policy reasons.

After planning, use [Registry Gateway Examples](/reference/provider-gateway-examples) for HTTP or
[MCP Client Setup](/getting-started/mcp-client) for agent execution.
