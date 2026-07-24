# Discovery

Discovery is PubFi's public source-selection layer for crypto data APIs.

## What Discovery Does

Discovery helps humans and agents:

- find crypto data providers;
- compare provider fit by chain, category, capability, auth, pricing posture, and source evidence;
- understand claim-safe readiness;
- discover demand-led topic pages;
- request or route future integrations without treating every source as callable today.

## Route Families

Canonical public routes include:

- `/discovery`
- `/discovery/api/{source_slug}`
- `/discovery/category/{slug}`
- `/discovery/chain/{slug}`
- `/discovery/compare/{slug-a}-vs-{slug-b}`
- `/discovery/topic/{slug}`

## Discovery Is Not Execution

Discovery inclusion does not mean the source is callable through PubFi. Runtime callability depends
on an exact `ready` operation in the current Registry v2 generation and its request-time gates.
Those gates can include configured provider credentials and source freshness. Execution then needs
either valid PubFi API-key admission or an explicitly enabled x402 payment lane over HTTP or MCP.

## Agent-Readable Discovery

Discovery content is also exposed through:

- `/llms.txt`
- `/llms-full.txt`
- `/discovery/api/{source_slug}.md`
- `/discovery/topic/{slug}.md`
- `/discovery/agent-capabilities.json`

These exports are public-safe retrieval surfaces. They must not expose private accounts,
credentials, billing records, dashboard data, or raw operational readbacks.

## Content And Runtime Authority

Discovery records are reviewed content snapshots. Their count and status can change as sources are
updated. They are not traffic, ranking, citation, or live execution metrics. Use
`GET https://api.pubfi.ai/v1/capabilities` for the current executable route catalog.
