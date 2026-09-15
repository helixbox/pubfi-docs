---
title: DeGov
description: Identify the DeGov execution service used by the PubFi gateway.
---

Use provider key `degov` in the [capability catalog](https://api.pubfi.ai/v1/capabilities?provider_key=degov&limit=1000).
PubFi's DeGov routes use the DeGov Partner Agent API at `agent-api.degov.ai`.
`atlas.degov.ai` is a UI and reference surface, not a second execution contract.

Call the exact PubFi gateway path advertised by the catalog. Upstream hosts and credentials are
not PubFi caller instructions. Follow the [PubFi gateway guide](/reference/provider-gateway-examples)
for authentication and access selection, and the [API Reference](https://api.pubfi.ai/reference)
for operation parameters.
