---
title: Capability And Registry Contracts
description: Understand the Registry v2 catalog, readiness states, Runtime OpenAPI, and execution boundary.
---

PubFi's executable capability authority is the currently installed Registry v2 generation. The
public catalog is:

```text
GET https://api.pubfi.ai/v1/capabilities
```

It returns the paginated `pubfi.gateway.registry.capability-page.v4` schema. Each compact summary
identifies the capability, public provider key, exact route matcher, allowed methods, credential
requirement, current Credit cost, and readiness. Follow each opaque `next_cursor` to enumerate the
complete installed generation. Use Runtime OpenAPI for the ready operation request and response
schemas.

## Current Readiness

Registry v2 exposes two execution readiness states:

| State | Meaning |
| --- | --- |
| `ready` | the exact operation is present in the installed generation and can continue to request-time preflight |
| `blocked` | the operation must not execute |

Terms such as `requestable`, `contract_ready`, and `research_spike` belong to Discovery editorial
context. They do not make a Registry operation executable.

## OpenAPI

`https://api.pubfi.ai/openapi.json` is generated from the installed Registry snapshot. It includes
only current ready gateway routes. PubFi does not publish separate static provider OpenAPI files as
execution authority.

## Execution Response

A successful Registry gateway request returns the validated provider JSON for that exact operation.
The response also identifies the PubFi request and Registry generation through response headers.
It does not use a PubFi success envelope.

## Execution Boundary

A catalog entry is necessary but not sufficient for execution. Request-time checks still enforce:

- the exact path and HTTP method;
- request query and body policy;
- provider and credential readiness;
- route response policy;
- caller authentication and allocation for the API-key lane; or
- route-specific payment eligibility and valid authorization for the x402 lane.

Clients must refresh the catalog or Runtime OpenAPI instead of caching a route from an older
generation as permanent authority.

Continue with [Provider Readiness](/concepts/provider-readiness) for gate evidence and [Route
Planning](/concepts/route-planning) for exact path-and-method selection.
