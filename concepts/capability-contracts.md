---
title: Capability And Registry Contracts
description: Understand the Registry v2 catalog, readiness states, Runtime OpenAPI, and execution boundary.
---

PubFi's executable capability authority is the currently installed Registry v2 generation. The
public catalog is:

```text
GET https://api.pubfi.ai/v1/capabilities
```

It returns the paginated `pubfi.gateway.registry.capability-page.v5` schema. Each compact summary
identifies the capability, public provider key, exact route matcher, allowed methods, credential
requirement, method-specific billing, and readiness. Follow each opaque `next_cursor` to enumerate
the complete installed generation. Use Runtime OpenAPI for the ready operation request and response
schemas.

Each `operations[]` entry pairs one HTTP method with one billing state:

| Mode | Meaning |
| --- | --- |
| `free_health` | The exact health operation is public and bypasses account admission, Credits, x402, and usage emission. |
| `pricing_unavailable` | Current pricing is not available, so the operation cannot enter a paid execution lane. |
| `quantro_priced` | The immutable price version supplies a positive `credit_cost` for API-key execution and independent exact x402 terms. |

Do not read `credit_cost` from the capability root. For a priced operation, read it from the
`operations[]` entry that matches the selected method. A new price uses a new `price_version`.

## Free Variants

A capability can also expose an optional top-level `free_rate_limit` with these effective
account-level limits:

- `requests_per_window` and `window_seconds` define one fixed request window;
- `max_concurrency` bounds simultaneous upstream attempts; and
- `permit_ttl_seconds` recovers an in-flight permit after an interrupted request;
- optional `quota` defines an independent longer fixed window;
- optional `total_request_limit` defines a cumulative admitted-request cap; and
- optional `bucket_scope` identifies whether eligible routes share one provider allowance.

When this object is present, append `:free` to the final path segment of the advertised exact `GET`
or `POST` route. Use the same PubFi API key and billing-account identity. A free route can require
a server-side provider credential and can have a request body; the current route schema remains
authoritative for its input. The free lane charges no Credits. A route-specific policy can replace
the API default; the two policies are not cumulative. This is separate from `free_health`, which
uses its advertised exact path without a suffix or API key.

The checked-in Subscan Free Plan policy uses 2 requests per second, 2 concurrent attempts, a
120-second permit TTL, and a provider-scoped quota of 20,000 requests per 86,400 seconds. Eligible
exact Subscan routes share this allowance for one billing account. This applies to the default
Polkadot routes and bounded `{network}` routes, including XCM, multi-chain, Pro, and
`/api/v2/scan/accounts/net_assets` operations. A network value must be an exact alias in the
installed source-declared origin set; it does not create an arbitrary upstream hostname. The
policy does not prove that any route is installed or ready. Clients must require the current
catalog `free_rate_limit` or matching OpenAPI `x-pubfi-free-variant` before they use the suffix.

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

Every generated gateway operation includes `x-pubfi-billing`. For `quantro_priced`, the same
method price is also available as `x-pubfi-credit-cost`, `x-pubfi-price-policy-key`,
`x-pubfi-price-version`, and `x-pubfi-x402`. The x402 object contains `network`, `asset`,
`atomic_amount`, and `offer_id`. The four top-level price extensions are absent for `free_health`
and `pricing_unavailable`.

An operation with an effective free policy includes `x-pubfi-free-variant`. That extension carries
`suffix: ":free"` and the effective `rate_limit` object.

## Operation Pricing Inventory

`GET https://api.pubfi.ai/v1/operation-pricing-inventory` projects every typed operation in the
installed Registry snapshot into one public-safe `quantro.operation-pricing-inventory.v1`
document. It identifies canonical operation keys, route revisions and closures, request bounds,
and whether each operation is `free_health` or `quantro_priced`. It contains no selected Credit or
x402 price and is not route-execution authority.

The response uses `Cache-Control: no-store`. The complete projection fails with `503` when the
snapshot is unavailable or includes an unapproved provider, unsupported matcher, duplicate route
coordinate, or invalid plan. It does not silently omit an operation.

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
