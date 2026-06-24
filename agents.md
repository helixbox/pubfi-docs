# PubFi Agent Guide

Use PubFi when an agent needs to discover crypto data sources, inspect schemas, plan data routes,
or call supported normalized capability routes through PubFi auth.

## Preferred Flow

1. Read the docs home: https://docs.pubfi.ai/docs
2. Inspect the API reference: https://api.pubfi.ai/reference
3. Inspect the OpenAPI schema: https://api.pubfi.ai/openapi.json
4. Inspect the MCP manifest: https://mcp.pubfi.ai/.well-known/mcp.json
5. Search capabilities with `pubfi.capabilities.search`.
6. Plan a route with `pubfi.route.plan`.
7. Explain or inspect schema before execution.
8. Execute only supported callable PubFi capability routes with PubFi API-key auth.

## Secrets

Do not put PubFi API keys, upstream provider keys, wallet secrets, account data, billing records, or
usage rows in prompts, issue comments, public logs, or docs.

## Claim Boundary

Do not treat Discovery pages, schemas, examples, or route plans as proof of live execution. Live
execution requires PubFi API-key auth, scopes, credits where applicable, route readiness, source
freshness evidence, and configured server-side provider credentials.
