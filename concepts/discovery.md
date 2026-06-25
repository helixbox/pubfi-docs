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
on gateway readiness, configured credentials, source freshness, PubFi API-key auth, credit checks,
and capability or route support.

## Agent-Readable Discovery

Discovery content is also exposed through:

- `/llms.txt`
- `/llms-full.txt`
- `/discovery/api/{source_slug}.md`
- `/discovery/topic/{slug}.md`
- `/discovery/agent-capabilities.json`

These exports are public-safe retrieval surfaces. They must not expose private accounts,
credentials, billing records, dashboard data, raw readbacks, or production `seo_geo` rows.

## Snapshot Counts

At snapshot commit `4a1a92a8d61d`, checked-in public-safe Discovery data includes:

- 167 data-source records;
- 167 source-freshness records;
- 178 capability cards;
- 5 routing-result examples;
- 7 topic-intent records.

These are content/source counts, not traffic, ranking, or citation metrics.
