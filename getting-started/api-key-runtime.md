# API Key And Runtime

This page explains how PubFi API-key auth, credits, usage facts, and runtime execution fit
together from a public-docs perspective.

## Runtime Surfaces

| Surface | Role |
| --- | --- |
| `api.pubfi.ai` | HTTP API for capabilities, gateway routes, account, usage, health, and OpenAPI |
| `mcp.pubfi.ai` | hosted MCP endpoint for generic PubFi route/capability tools |
| `pubfi.ai` | product UI, Discovery, docs entry, and dashboard presentation |

## API Key Boundary

PubFi API keys are caller credentials for machine, gateway, capability, and MCP routes. They should
be loaded from a secret store or environment variable, not pasted into prompts, public docs, issue
comments, screenshots, or code examples.

Create keys from the PubFi dashboard under **Manage application keys**. Copy the key when it is
shown, because the full secret is displayed only once.

Supported public auth shapes:

```text
Authorization: Bearer <PubFi API key>
X-PubFi-Api-Key: <PubFi API key>
```

## Account And Credit Model

PubFi uses a credit ledger to track entitlement usage. Public docs should describe the model at a
high level:

- API keys authenticate the caller.
- Scopes determine what the caller can do.
- `invoke_provider` is required for provider-backed gateway or capability execution.
- Credits are entitlement units, not final public pricing.
- Usage facts record accepted execution attempts and their outcome.
- Refunds or corrections should be append-only ledger operations, not edits to historical usage.

## Execution Preflight

A route can execute only when these gates pass:

- valid PubFi API key;
- required scope;
- sufficient credits;
- supported capability or route id;
- current provider readiness;
- server-side upstream credential configuration;
- source freshness evidence;
- request input validation.

## Public Docs Rule

Public docs may explain the auth and credit model, but they must not publish real keys, account
ids, usage rows, billing-provider payloads, customer data, or production ledger records.
