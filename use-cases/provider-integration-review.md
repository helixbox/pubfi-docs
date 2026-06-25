# Use Case: Provider Integration Review

A team wants to decide whether a provider should become callable through PubFi.

## Review Inputs

- public provider docs;
- source freshness;
- operation inventory;
- auth and pricing posture;
- target chain/category/capability;
- demand evidence;
- adapter certification requirements;
- credential and policy requirements.

## PubFi Decision Path

1. Add or review public-safe source evidence.
2. Map the provider to Discovery categories, chains, and capabilities.
3. Decide whether the source is requestable, contract-ready, or certification-ready.
4. Run adapter certification only when public-safe evidence is sufficient.
5. Keep procurement, payment, credential, and commercial approval separate.
6. Promote `gateway_available` only when runtime readiness evidence supports it.

## Public Docs Boundary

Public docs may describe the review path and public evidence requirements. They must not publish
credentials, private vendor terms, procurement notes, or claim runtime availability before the
readiness gate passes.

