# Readiness And Claim Safety

PubFi docs should make readiness explicit. This prevents public source-selection pages from
overclaiming runtime execution.

## Readiness Vocabulary

| Term | Meaning |
| --- | --- |
| `gateway_available` | PubFi can serve the route through a configured gateway adapter with PubFi API-key auth, server-side upstream credentials, usage accounting, and acceptable freshness evidence. |
| `requestable` | PubFi can capture demand or integration interest, but the route is not callable yet. |
| `needs_procurement` | A high-fit supplier or capability exists, but credential, vendor, payment, policy, or commercial review is needed. |
| `ready_for_adapter_certification` | Public-safe evidence is strong enough to review adapter certification. Certification itself remains downstream work. |
| `contract_ready` | A contract, fixture, or local demo proves schema shape, but there is no production runtime promise. |
| `research_spike` | Research or sandbox evidence exists, but it is not production capability. |
| `not_supported` | The request is outside current product boundary or evidence is insufficient. |

## Safe Public Claims

- A source is listed in Discovery.
- A capability schema exists.
- A route can be requested or planned.
- A route is callable only when readiness gates pass.
- PubFi keeps provenance and freshness visible.

## Unsafe Public Claims

- Every listed source is callable.
- A schema means live execution.
- A local smoke test proves production readiness.
- SEO/GEO artifacts prove rankings, traffic, or AI citations.
- PubFi performs automatic procurement, supplier payment, wallet custody, or x402 settlement by
  default.

## Evidence Rule

Every strong claim should point to one of:

- a public docs page;
- a public Discovery page;
- a public OpenAPI schema;
- an MCP manifest;
- a checked-in source map;
- a public-safe release note.

Private runtime data can inform internal decisions, but it should not be copied into public docs.

