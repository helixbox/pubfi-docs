<div align="center">

# PubFi Docs

Public documentation and examples for PubFi's agent-native crypto data layer.

[![Docs](https://img.shields.io/badge/docs-docs.pubfi.ai-0F766E)](https://docs.pubfi.ai)
[![API Reference](https://img.shields.io/badge/API-reference-0F172A)](https://api.pubfi.ai/reference)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-14B8A6)](https://api.pubfi.ai/openapi.json)
[![Docs License](https://img.shields.io/badge/docs%20license-CC--BY--4.0-blue)](LICENSE-DOCS.md)
[![Code License](https://img.shields.io/badge/code%20license-MIT-blue)](LICENSE-CODE.md)
[![GitHub last commit](https://img.shields.io/github/last-commit/helixbox/pubfi-docs?color=red&style=plastic)](https://github.com/helixbox/pubfi-docs)

</div>

## About

This repository is the public source of truth for PubFi's long-form docs. It is separate from the
private `pubfi-mono` repository so public docs, examples, issue templates, and agent-readable
materials can be indexed by GitHub, search engines, and answer engines.

The v0 docs framework is Mintlify. The intended production shape is:

```text
github.com/helixbox/pubfi-docs
  -> Mintlify GitHub integration
  -> docs.pubfi.ai
  -> root docs routes such as /getting-started/quickstart and /reference/api-reference
  -> linked from pubfi.ai product surfaces and legacy docs redirects
  -> canonical cross-links from README, llms.txt, Discovery, API Reference, MCP, and examples
```

Snapshot sources:

- `pubfi-mono` source snapshot at `d0ee242963fc4a6477e79b2ece98ec3aece643ce`;
- `quantro-mono` origin/main through `f5a4dec934f4a2a6e072149d694df7984391b74b`; and
- public Runtime OpenAPI, Registry v2 catalog, MCP `tools/list`, Staging and Production x402
  challenges, and the repository-access acceptance workflows observed on 2026-07-27.

## Start Here

- [Docs home](index.md)
- [Project overview](project-overview.md)
- [Quickstart](getting-started/quickstart.md)
- [Staging guide](getting-started/staging.md)
- [API key and runtime](getting-started/api-key-runtime.md)
- [Registry gateway examples](reference/provider-gateway-examples.md)
- [MCP client setup](getting-started/mcp-client.md)
- [MCP client guides](getting-started/mcp-clients.md)
- [ChatGPT and Codex Plugin](getting-started/chatgpt-codex-plugin.md)
- [Accountless x402](getting-started/x402.md)
- [Payment and execution modes](concepts/payment-and-execution-modes.md)
- [API Reference](reference/api-reference.md)
- [Agent-readable surfaces](agent-readable/surfaces.md)
- [Security and public data](reference/security-and-public-data.md)

## Published Surfaces

- Docs site: `https://docs.pubfi.ai`
- Product site: `https://pubfi.ai`
- Staging product site: `https://stg.pubfi.ai`
- Staging API: `https://api-stg.pubfi.ai`
- Staging MCP: `https://mcp-stg.pubfi.ai`
- Staging MCP x402: `https://mcp-stg.pubfi.ai/x402`
- Pricing: `https://pubfi.ai/pricing`
- Blog: `https://pubfi.ai/blog`
- Product pages: `https://pubfi.ai/products/{product_slug}`
- Discovery: `https://pubfi.ai/discovery`
- Discovery directory Markdown: `https://pubfi.ai/discovery.md`
- Provider Profile index: `https://pubfi.ai/discovery/sources`
- Sitemap: `https://pubfi.ai/sitemap.xml`
- Robots policy: `https://pubfi.ai/robots.txt`
- IndexNow verification key: `https://pubfi.ai/50e4aa84-257b-4ff4-a822-5da3d567384c.txt`
- Login: `https://pubfi.ai/login`
- Privacy policy: `https://pubfi.ai/privacy-policy`
- Terms of service: `https://pubfi.ai/terms-of-service`
- Agents guide: `https://pubfi.ai/agents.md`
- Product LLM index: `https://pubfi.ai/llms.txt`
- Product LLM full export: `https://pubfi.ai/llms-full.txt`
- Discovery capability-card JSON: `https://pubfi.ai/discovery/agent-capabilities.json`
- Interactive API reference: `https://api.pubfi.ai/reference`
- OpenAPI schema: `https://api.pubfi.ai/openapi.json`
- API-host MCP manifest: `https://api.pubfi.ai/.well-known/mcp.json`
- MCP manifest: `https://mcp.pubfi.ai/.well-known/mcp.json`
- MCP OAuth protected resource: `https://mcp.pubfi.ai/.well-known/oauth-protected-resource`
- MCP x402 endpoint: `https://mcp.pubfi.ai/x402`
- MCP discovery pointer: `https://pubfi.ai/.well-known/mcp.json`
- MCP server card: `https://pubfi.ai/.well-known/mcp/server-card.json`
- Optional MCP registry auth proof route: `https://pubfi.ai/.well-known/mcp-registry-auth`

## Repository Contents

```text
pubfi-docs/
├── AGENTS.md
├── README.md
├── docs.json
├── CONTRIBUTING.md
├── LICENSE.md
├── LICENSE-DOCS.md
├── LICENSE-CODE.md
├── CHANGELOG.md
├── llms.txt
├── llms-full.txt
├── favicon.svg
├── index.md
├── project-overview.md
├── getting-started/
├── concepts/
├── agent-readable/
├── reference/
├── use-cases/
├── faq.md
├── glossary.md
├── maintenance/
│   └── public-docs-maintenance.md
├── assets/
│   └── README.md
└── examples/
    ├── README.md
    └── agents/
        ├── capability-curl/
        ├── pubfi-route-tools-mcp/
        ├── x402-base-mainnet/
        └── x402-base-sepolia/
```

Runnable public-safe examples live under [examples/](examples/README.md):

- `examples/agents/pubfi-route-tools-mcp/`: dependency-free stdio bridge and smoke for the hosted
  MCP endpoint;
- `examples/agents/capability-curl/`: no-auth Registry v2 catalog inspection;
- `examples/agents/x402-base-sepolia/`: no-secret inspection of the current x402 challenge.
- `examples/agents/x402-base-mainnet/`: Production HTTP and MCP clients pinned to the historical
  2026-07-27 Base mainnet route, asset, amount, and payee. Current catalog and challenge checks are
  required before use.

## Shared Favicon

The root `favicon.svg` is copied from `pubfi-mono/apps/web/app/icon.svg` at
`7a1b8e13943d454db5f76d03a29e1ce8f65ee616`. This source keeps the docs icon aligned with the
PubFi product site.

## Local Development Preview

```sh
npx mint@latest dev --no-open
```

The local preview serves the docs site at `http://localhost:3000`.

## Checks

```sh
npm ci
npm run check
npx mint@latest validate
```

The portable check validates Mintlify navigation targets, Markdown links, docs-site route links,
trailing whitespace, secret patterns, unsafe SEO/GEO success phrases, and example syntax.
For docs output, navigation, or generated static asset changes, also run the Mint export and static
assertions documented in `maintenance/public-docs-maintenance.md`. These checks run locally before
the current GitHub pull request merge. Main-branch release workflows deploy the canonical site.

Authenticated examples require a PubFi API key and must load it from a secret store. Paid x402
clients require a buyer wallet key that must also stay in a secret store. Do not commit
credentials, wallet addresses, payment signatures, payment responses, raw account responses, or
production readbacks.

## Publishing

Deploy this repository with Mintlify export to Vercel and set `docs.pubfi.ai` as the canonical docs
domain. Production builds emit `sitemap.xml`, `robots.txt`, and clean canonical metadata for root
docs routes. GitHub Pages is a fallback only; do not run a second canonical docs site unless
canonical and noindex rules are explicit.

## Public Boundary

Safe claims:

- PubFi is building an agent-native crypto data layer.
- Discovery is an open index, demand engine, and source-selection surface for crypto data APIs.
- PubFi exposes generic route/capability tooling for agents and MCP clients. The authenticated MCP
  root accepts API keys or OAuth access tokens; accountless payment uses the separate `/x402`
  endpoint.
- PubFi Staging uses separate web, API, and MCP roots and a Base Sepolia x402 test boundary.
- Public Discovery and LLM exports are generated from checked-in public-safe curated data.

Unsafe claims:

- every Discovery source is callable through PubFi;
- local SEO/GEO artifacts prove ranking, traffic, or AI citation success;
- GitHub exposure alone proves search success;
- PubFi performs supplier procurement, supplier payment, wallet custody, or live model-ranked
  routing by default.
- Every gateway route supports x402, or an old challenge or acceptance run proves current
  Production availability without a current catalog and unsigned challenge.
- A Base Sepolia Staging challenge proves that Production x402 is available.

## Appreciation

We would like to extend our heartfelt gratitude to the following projects and contributors:

- Mintlify for the docs framework used by this repository.
- OpenAPI and Scalar for API-reference conventions and tooling patterns.
- Model Context Protocol contributors for the agent-tool interface standard.
- Public crypto data API providers whose documentation makes source discovery and comparison
  possible.

## Additional Acknowledgements

- PubFi contributors and maintainers.
- The broader open-source documentation community for docs-as-code practices.

<div align="right">

### License

<sup>Documentation is licensed under [CC-BY-4.0](LICENSE-DOCS.md); examples, scripts, config, and
automation are licensed under [MIT](LICENSE-CODE.md). See [LICENSE.md](LICENSE.md).</sup>

</div>
