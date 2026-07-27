---
title: Security And Public Data Boundary
description: Public-safe rules for PubFi API, Registry, account, purchase, and x402 documentation.
---

Public docs must explain PubFi without exposing caller credentials, payment evidence, private
account data, or operator state.

## Public-Safe Data

Public docs can include:

- public product and Discovery descriptions;
- `/v1/capabilities` field definitions and sanitized catalog shapes;
- Runtime OpenAPI, API reference, and MCP manifest URLs;
- public MCP tool names and input schemas;
- placeholder HTTP and MCP requests;
- Registry v2 readiness and provider-neutral failure classes;
- the x402 protocol version, supported test network, standard header names, and safety rules;
- registered purchase route shapes and role requirements;
- redacted response shapes; and
- claim-safety language.

The current `PAYMENT-REQUIRED` challenge is public payment-term authority. Clients must read and
validate it at request time. Docs must not hard-code a transient price, payee, timeout, or route as
permanent authority.

## Secrets And Private Data

Do not publish:

- PubFi API keys;
- upstream provider credentials;
- wallet private keys or signing material;
- a `PAYMENT-SIGNATURE` value or its decoded payment payload;
- a `PAYMENT-RESPONSE` value;
- unredacted wallet or payment identities;
- account, membership, API-key, purchase, checkout, receipt, usage, allocation, or billing records;
- private provider responses or production runtime readbacks;
- private procurement notes;
- raw production database rows;
- raw answer-engine outputs;
- unredacted crawler or application logs;
- local runner scratch data;
- query-prioritization maps or campaign plans; or
- internal content, search, readback, repair, or operator workflows.

An x402 caller must send signed payment evidence through the HTTP gateway header or the MCP
payment-metadata field. The caller must not place
that evidence in a prompt, source file, issue, screenshot, analytics event, or general application
log.

`PUBFI_X402_OFFER_RECEIPT_VERIFYING_KEYS_JSON` is nonsecret operator configuration. It can contain
up to eight retained Ed25519 public verification keys for the service `did:web` document. It must
not contain private keys. Only the separately configured active private signer creates new signed
offers and receipts. Retained public keys keep supported historical receipts verifiable.

## Secret Injection

Examples can load a PubFi API key from a secret store or environment variable:

```sh
export PUBFI_API_KEY='<PubFi API key>'
```

The docs can show the variable name and a placeholder. They must not show a real value.

An agent runtime can inject the API key into the HTTP or MCP transport. The model prompt must not
contain the key. An x402 wallet or payment client must keep its signing key outside the model
context and inject only the required signed header into the exact HTTP request.

## Response And Cache Handling

Honor `Cache-Control: private, no-store` on x402 and purchase responses.

Do not persist or replay sensitive headers through a shared cache. Redact at least:

- `Authorization`;
- `X-PubFi-Api-Key`;
- `PAYMENT-SIGNATURE`;
- `PAYMENT-RESPONSE`; and
- account-bound checkout or purchase links.

Use the same exact signed x402 request only for the documented recovery and replay flow. Do not
create a new payment authorization only because the first network response was lost.

## Examples And Screenshots

Examples must use placeholders and public schemas. They must not use real account identifiers,
wallet addresses, purchase identifiers, payment payloads, provider keys, or private response data.

Sanitize screenshots before publication. Prefer generated diagrams or cropped public pages over
dashboard, wallet, checkout, billing, or operator screenshots.

## Claims

A public route, OpenAPI operation, health result, or source listing does not prove:

- current provider success;
- current x402 eligibility or settlement;
- current registered purchase-offer availability;
- account allocation or Credits balance;
- uptime; or
- ranking, traffic, or citation outcomes.

Use the installed Registry catalog and Runtime OpenAPI for route authority. Use the current x402
challenge for payment terms. Use authenticated offer and account responses only inside the caller's
private application context.

Apply these rules through [API Key And Runtime](/getting-started/api-key-runtime), [MCP Client
Setup](/getting-started/mcp-client), and [Accountless x402](/getting-started/x402).
