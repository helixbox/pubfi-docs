---
title: Glossary
description: Definitions for PubFi Discovery, Registry, payment, readiness, and integration terms.
---

## Agent-Native Crypto Data Layer

PubFi's target product category: a data layer designed for AI agents and software systems that need
crypto data, source selection, route planning, and validated provider responses.

## Capability

A route or operation that PubFi can describe, plan, or execute. The live Registry v2 catalog is
the authority for currently executable operations.

## Credits

PubFi's product name for eligible, purchase-origin `request_count` units. Credits are service
units. They are not money, a stored-value wallet, or the free starter allocation.

## Discovery

PubFi's public source-selection layer for crypto data APIs.

## Gateway

Exact route execution through PubFi for configured provider operations. A route can use an API-key
lane, or it can explicitly enable the accountless x402 lane over HTTP or MCP.

## MCP

Model Context Protocol. PubFi exposes generic route and capability tools through a hosted MCP
endpoint.

## `PAYMENT-REQUIRED`

The x402 V2 response header that describes the exact payment requirement for an unpaid eligible
request.

## `PAYMENT-RESPONSE`

The response header that carries the settled x402 payment result. Treat its full value as sensitive
payment evidence.

## `PAYMENT-SIGNATURE`

The request header that carries an x402 payment authorization. It is sensitive payment evidence.

## Provenance

Metadata describing which provider or resource backed a response.

## Purchase Offer

An immutable, server-owned commercial offer available to a registered billing account. The caller
submits its advertised key, exact catalog and terms identities, and an allowed amount. Verified
settlement can create a purchase-origin allocation.

## Readiness

A runtime Registry route state. Public Registry routes are `ready` or `blocked`. Discovery can use
separate editorial terms such as requestable or under review.

## Registry v2

The current gateway catalog and execution authority. `GET /v1/capabilities` exposes its public
view, and an exact path and method select a route.

## Source Freshness

Evidence about whether provider docs, API status, or source references are current enough to use.

## Starter Allocation

The 1,000 free requests given to an eligible new billing account. It is not Credits.

## x402

An accountless, request-bound payment protocol. On an eligible PubFi HTTP or MCP route, one valid
wallet authorization buys one response without creating an account, API key, Credits balance, or
invoice.
