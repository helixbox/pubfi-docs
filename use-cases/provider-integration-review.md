---
title: "Use Case: Provider Integration Review"
description: Review whether a provider has enough public evidence and runtime readiness for PubFi integration.
---

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
6. Publish an exact Registry v2 operation only after runtime readiness evidence supports `ready`.

## Public Docs Boundary

Public docs may describe the review path and public evidence requirements. They must not publish
credentials, private vendor terms, procurement notes, or claim runtime availability before the
Registry readiness gate passes.

Use [Provider Readiness](/concepts/provider-readiness) for the evidence and runtime-gate model.
