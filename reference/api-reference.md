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
- API-key, account, credit, and usage routes;
- response schemas, parameters, and auth requirements.

## How It Fits With These Docs

Use this docs site for product concepts, agent workflows, claim boundaries, public examples, and
integration guidance. Use the API reference when you need concrete HTTP methods, request bodies,
response schemas, auth headers, or route-level details.

## Auth Boundary

API reference visibility does not mean every route can be executed without an account. Live runtime
calls require a PubFi API key, matching scope, credits when applicable, and current route readiness.
