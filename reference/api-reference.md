---
title: API Reference
description: Where to find PubFi's interactive API reference and OpenAPI schema.
---

PubFi's interactive API reference is hosted by the runtime API service:

- [Interactive API Reference](https://api.pubfi.ai/reference)

The machine-readable OpenAPI schema is:

- [OpenAPI JSON](https://api.pubfi.ai/openapi.json)

## What It Covers

The API reference is the executable HTTP contract for PubFi runtime routes, including:

- service health and readiness;
- capability discovery and execution;
- gateway route families;
- billing-account, API-key, usage, and authoritative billing-read routes;
- annotated request or response details where the current OpenAPI source publishes them.

## How It Fits With These Docs

Use this docs site for product concepts, agent workflows, claim boundaries, public examples, and
integration guidance. Use the API reference when you need live published route families and
annotated request or response details. Use the Auth Boundary section below for account and key
requirements until the public OpenAPI source publishes security metadata. Use the provider gateway
examples and provider docs for wildcard endpoint paths, supported methods, and nested provider
payloads returned through gateway routes.

Provider-specific OpenAPI snapshots are public for DeGov and Subscan examples. Generic generated
gateway adapters are admitted only for crypto/Web3/on-chain data and become public
`gateway_available` only through the current certified gateway catalog. A Discovery listing or
route-shape example is not availability evidence.

## Auth Boundary

API reference visibility does not mean every route can be executed without authentication. Gateway,
capability, and MCP execution require a PubFi API key, matching scope, fresh active billing
admission, sufficient allocation, and current route readiness. Billing-account management and
readback routes require an authenticated account member with the required account role.
