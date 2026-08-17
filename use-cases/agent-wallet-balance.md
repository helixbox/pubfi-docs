---
title: "Use Case: Agent Wallet Balance"
description: Plan a wallet-balance workflow without inventing unsupported PubFi routes.
---

An agent needs a wallet balance for a supported chain. This page describes route selection. It does
not claim that a wallet-balance operation is present in the current Registry.

## User Need

"Read a wallet/account balance without embedding provider-specific endpoint logic or upstream keys
in my agent."

## Current Status

At publication time, the public Registry does not advertise a wallet-balance route. Do not invent
a route identifier or call an old provider-specific example. Use
[Discovery](https://pubfi.ai/discovery) to research providers or request an integration until a
suitable route becomes `ready`.

## Recommended PubFi Flow

1. Read `GET https://api.pubfi.ai/v1/capabilities`.
2. Find a `ready` operation whose description and schema match the required chain and balance
   request.
3. Use the exact path and method from that Registry generation.
4. Inspect the operation in `GET https://api.pubfi.ai/openapi.json`.
5. Execute it through the HTTP gateway or the authenticated MCP route tools.
6. Validate the provider JSON against the advertised response schema.

## Why Not Call Provider Directly?

Direct provider calls make the agent own provider auth, endpoint shape, response validation,
freshness evidence, and usage accounting. A ready PubFi Registry operation keeps those concerns
behind a reviewed execution plan while returning the exact bounded provider response.

## Claim Boundary

This use case is executable only when the current Registry lists the exact path and method as
`ready`. A Discovery listing or integration request is not execution evidence.

Use [Route Planning](/concepts/route-planning) for selection rules and [Registry Gateway
Examples](/reference/provider-gateway-examples) for request construction.
