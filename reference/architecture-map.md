---
title: Architecture Map
description: Public-safe map of PubFi Registry v2, API, MCP, account, purchase, and web ownership.
---

## Product Boundary

PubFi is an agent-facing execution and discovery layer for crypto data:

- Discovery provides public source-selection context.
- Registry v2 owns executable path, method, request, response, meter, and readiness contracts.
- The account service owns API keys, fixed product access, environment binding, admission,
  allocation, and usage facts.
- The HTTP gateway executes exact current Registry operations.
- MCP exposes generic Registry catalog list and detail tools plus exact route execution.
- Registered purchases can create purchase-origin service units after verified settlement.
- Eligible HTTP and MCP routes can use an accountless x402 payment lane.

Discovery content does not make a route executable. The installed Registry snapshot is the runtime
authority.

## Runtime Surfaces

| Surface | Role |
| --- | --- |
| `pubfi.ai` | Public site, Discovery, dashboard presentation, and agent-readable exports. |
| `api.pubfi.ai` | Rust API for Registry catalog and execution, Runtime OpenAPI, accounts, API keys, usage, billing readback, and purchases. |
| `mcp.pubfi.ai` | Streamable HTTP MCP root for public reads and API-key or OAuth account execution. |
| `mcp.pubfi.ai/x402` | Separate Bearer-free MCP endpoint for eligible accountless x402 execution. |
| `docs.pubfi.ai` | Long-form public product, integration, security, and reference documentation. |
| `pubfi.ai/.well-known/mcp.json` | Product-site discovery pointer to the hosted MCP endpoint. |
| `pubfi.ai/.well-known/mcp/server-card.json` | Hosted MCP metadata card. |
| `pubfi.ai/.well-known/mcp-registry-auth` | Optional MCP Registry domain-ownership proof. |

## Registry v2 Execution Flow

1. The Registry control plane produces an immutable generation and manifest.
2. The API Data Plane installs one valid serving snapshot and fails closed when no valid snapshot
   is available.
3. `/v1/capabilities`, Runtime OpenAPI, MCP discovery, and MCP route tools derive from that same
   snapshot.
4. An HTTP or MCP request supplies an exact path and method.
5. The Data Plane performs the same matcher lookup and typed request validation for both entry
   surfaces.
6. The gateway selects either the API-key lane or an eligible accountless x402 lane.
7. The typed executor calls the selected upstream and validates the response policy.
8. The caller receives the canonical provider JSON. API-key responses identify the Registry
   generation. Settled x402 responses include the payment result.

MCP `pubfi.route.execute` uses API-key or OAuth account admission on the authenticated root. The
separate `/x402` endpoint rejects Bearer credentials and owns accountless payment metadata. Both
endpoints use the same typed Registry and provider executor.

## Registered Commerce Flow

Registered purchases are separate from route execution:

1. An authenticated human account member reads current provider-neutral offers.
2. An Owner or Admin creates a purchase with an advertised offer key, its exact catalog and terms
   identities, a valid amount, and `Idempotency-Key`.
3. The checkout provider completes the external payment flow.
4. Verified settlement can create a purchase-origin `request_count` allocation that PubFi shows as
   Credits.
5. Later API-key execution can consume that allocation.

A route or UI control does not prove that an offer is currently available. Accountless x402 buys
one eligible response and does not create or consume Credits.

## Repository Layout

| Path | Public explanation |
| --- | --- |
| `apps/pubfi-api-server/` | Rust HTTP API, Runtime OpenAPI, Registry Data Plane binding, gateway, account routes, purchases, and API-host MCP entrypoint. |
| `apps/pubfi-registry-control-plane/` | Registry generation and rollout authority. |
| `apps/pubfi-registry-data-plane-bootstrap/` | Data Plane bootstrap and serving-snapshot installation. |
| `apps/pubfi-registry-credential-evaluator/` | Credential-readiness evaluation for Registry plans. |
| `apps/pubfi-registry-health-evaluator/` | Route-health evaluation for Registry plans. |
| `apps/pubfi-registry-reconciler/` | Registry desired-state reconciliation. |
| `apps/web/` | Next.js public site, Discovery, dashboard presentation, text exports, and discovery manifests. |
| `apps/web/src/data/discovery-static/` | Checked-in public-safe Discovery data. |
| `packages/rust/account-service/` | API-key auth, fixed product access, environment binding, admission, meter allocation, usage facts, and account contracts. |
| `packages/rust/gateway-contracts/` | Typed Registry, matcher, request, response, auth, meter, and failure contracts. |
| `packages/rust/gateway-registry-control/` | Registry control-plane domain and rollout contracts. |
| `packages/rust/gateway-registry-runtime/` | Immutable serving snapshot, public catalog, readiness, and path lookup. |
| `packages/rust/gateway-service/` | Provider-neutral typed execution, replay, response validation, and x402 route-policy binding. |
| `packages/rust/mcp-service/` | MCP JSON-RPC tools over the live Registry catalog and execution delegate. |
| `packages/rust/registry-worker-runtime/` | Shared runtime for Registry workers. |
| `packages/rust/storage/` | SQLx/Postgres persistence for account, allocation, usage, integration, and x402 execution state. |
| `packages/rust/discovery-contracts/` | Discovery source-selection and editorial route-planning models. |
| `vendor/quantro-integration/` | Pinned provider-neutral purchase and x402 integration contract. |
| `examples/agents/` | Public-safe agent and HTTP examples. |

## Ownership Rules

- Rust owns runtime route authority, matching, execution, auth, allocation, purchases, MCP, storage,
  and operational fail-closed behavior.
- Next.js owns public presentation, Discovery, dashboard presentation, and public text or manifest
  exports.
- Registry v2 route data is provider-neutral. Provider identity is data, not an execution branch or
  a permanent URL convention.
- The Runtime OpenAPI includes current ready routes. It does not use checked-in provider schemas.
- Provider credentials, payment evidence, account data, and commercial records stay outside public
  docs and examples.

Use [Runtime Endpoints](/reference/runtime-endpoints) for the concrete route families and the
[Agent Interface Reference](/reference/agent-interface) for MCP tools.
