# API Key And Runtime

This page explains how PubFi API-key auth, billing-account admission, request allowance, usage
facts, and runtime execution fit together from a public-docs perspective.

## Runtime Surfaces

| Surface | Role |
| --- | --- |
| `api.pubfi.ai` | HTTP API for capabilities, gateway routes, account, usage, health, and OpenAPI |
| `mcp.pubfi.ai` | hosted MCP endpoint for generic PubFi route/capability tools |
| `pubfi.ai` | product UI, Discovery, docs entry, and dashboard presentation |

## API Key Boundary

PubFi API keys are caller credentials for gateway, capability, and MCP execution. Billing-account
management and readback use the authenticated dashboard account session instead. Keys should be
loaded from a secret store or environment variable, not pasted into prompts, public docs, issue
comments, screenshots, or code examples.

Create keys from the PubFi dashboard under **Manage application keys**. Copy the key when it is
shown, because the full secret is displayed only once.

Supported public auth shapes:

```text
Authorization: Bearer <PubFi API key>
X-PubFi-Api-Key: <PubFi API key>
```

## Billing Account And Usage Model

PubFi groups API keys and product usage under billing accounts. Public docs should describe the
model at a high level:

- API keys authenticate the caller.
- Scopes determine what the caller can do.
- `invoke_provider` is required for provider-backed gateway or capability execution.
- A fresh active admission snapshot and sufficient meter-specific allocation are required before
  provider execution.
- The dashboard displays the allocated `request_count` allowance as request credits; that label is
  not money, pricing, or a PubFi-owned financial ledger.
- Usage facts record immutable raw-unit observations and execution outcomes.
- The billing-account `/billing` route is the authoritative billing read. PubFi usage rows are not
  billing truth.

## Execution Preflight

A route can execute only when these gates pass:

- valid PubFi API key;
- required scope;
- fresh active billing admission and sufficient raw-unit allocation;
- supported capability or route id;
- current provider readiness;
- server-side upstream credential configuration;
- source freshness evidence;
- request input validation.

## Public Docs Rule

Public docs may explain the auth, admission, allowance, usage, and billing-read model, but they must
not publish real keys, account ids, usage rows, billing-provider payloads, customer data, or
production financial records.
