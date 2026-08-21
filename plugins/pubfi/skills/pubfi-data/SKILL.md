---
name: pubfi-data
description: Discover, inspect, and run exact crypto-data capabilities through the PubFi MCP plugin. Use when a user asks for current crypto data from PubFi or wants to inspect a PubFi capability. Do not use for trades, transfers, wallet or payment operations, Credit purchases, or x402.
---

# PubFi Data

Use the connected PubFi Account/OAuth MCP surface. Treat its current capability catalog and tool
schemas as authority; do not invent provider routes, fields, methods, readiness, billing, or availability.

- Discover with pubfi.capabilities.list; follow opaque pagination only as needed and preserve exact provider or method filters supplied by the user. PubFi does not rank or select a capability.
- Inspect with pubfi.capabilities.get using the exact current catalog identifier; read its path, method, request shape, readiness, source caveats, and billing metadata before execution.
- Execute with pubfi.route.execute only after the user requests data and the current detail supplies the exact raw path and method. Preserve its query, body, idempotency, and request contract.
- Catalog reads are public; execution requires the connected Account/OAuth boundary. Before a paid call, disclose the published credit_cost and stop if cost, readiness, or entitlement is unavailable.
- Use a :free variant only when the current catalog publishes that exact account-scoped variant. Never infer :free, x402, checkout, payment, wallet, transfer, trade, or investment behavior.
- Never switch or fall back to the independent x402 lane or send payment metadata. Return the selected capability, Registry-generation shape, upstream status, bounded result, and readiness or source caveats.

Do not reconstruct a route from a provider name or older Registry generation, and do not hard-code a Registry generation identifier in this skill.
