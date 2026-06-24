# Glossary

## Agent-Native Crypto Data Layer

PubFi's target product category: a data layer designed for AI agents and software systems that need
crypto data, source selection, route planning, and normalized responses.

## Capability

A stable PubFi data contract such as `wallet.account_balance` or `wallet.token_balances`.

## Discovery

PubFi's public source-selection layer for crypto data APIs.

## Gateway

Authenticated route execution through PubFi for configured provider routes.

## MCP

Model Context Protocol. PubFi exposes generic route and capability tools through a hosted MCP
endpoint.

## Provenance

Metadata describing which provider or resource backed a response.

## Readiness

A public or internal state describing whether a source, route, or capability is callable,
requestable, contract-ready, or blocked.

## Source Freshness

Evidence about whether provider docs, API status, or source references are current enough to use.

## `gateway_available`

A readiness state meaning PubFi can serve the route through a configured gateway adapter with the
required auth, credentials, usage accounting, and freshness evidence.

## `contract_ready`

A readiness state meaning the schema or fixture proves shape but not live production execution.

