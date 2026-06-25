<div align="center">

# PubFi Docs

Public documentation and examples for PubFi's agent-native crypto data layer.

[![Docs](https://img.shields.io/badge/docs-docs.pubfi.ai-0F766E)](https://docs.pubfi.ai)
[![API Reference](https://img.shields.io/badge/API-reference-0F172A)](https://api.pubfi.ai/reference)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-14B8A6)](https://api.pubfi.ai/openapi.json)
[![Docs Check](https://github.com/helixbox/pubfi-docs/actions/workflows/docs.yml/badge.svg?branch=main)](https://github.com/helixbox/pubfi-docs/actions/workflows/docs.yml)
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
  -> pinned build-time consumption by pubfi.ai/docs
  -> canonical cross-links from README, llms.txt, Discovery, API Reference, MCP, and examples
```

Snapshot source: `pubfi-mono` commit `1658e1b298c5`.

## Start Here

- [Docs home](docs/index.md)
- [Project overview](docs/project-overview.md)
- [Quickstart](docs/getting-started/quickstart.md)
- [API Reference](docs/reference/api-reference.md)
- [MCP client setup](docs/getting-started/mcp-client.md)
- [Agent-readable surfaces](docs/agent-readable/surfaces.md)
- [Security and public data](docs/reference/security-and-public-data.md)

## Published Surfaces

- Docs site: `https://docs.pubfi.ai`
- Product site: `https://pubfi.ai`
- Discovery: `https://pubfi.ai/discovery`
- Interactive API reference: `https://api.pubfi.ai/reference`
- OpenAPI schema: `https://api.pubfi.ai/openapi.json`
- MCP manifest: `https://mcp.pubfi.ai/.well-known/mcp.json`

## Repository Contents

```text
pubfi-docs/
├── README.md
├── docs.json
├── CONTRIBUTING.md
├── LICENSE.md
├── LICENSE-DOCS.md
├── LICENSE-CODE.md
├── CHANGELOG.md
├── llms.txt
├── llms-full.txt
├── docs/
│   ├── index.md
│   ├── project-overview.md
│   ├── getting-started/
│   ├── concepts/
│   ├── agent-readable/
│   ├── reference/
│   ├── use-cases/
│   ├── faq.md
│   └── glossary.md
├── assets/
│   └── README.md
└── examples/
    ├── README.md
    └── agents/
        ├── capability-curl/
        ├── pubfi-route-tools-mcp/
        └── subscan-gateway/
```

Runnable public-safe examples live under [examples/](examples/README.md):

- `examples/agents/pubfi-route-tools-mcp/`: dependency-free stdio bridge and smoke for the hosted
  MCP endpoint;
- `examples/agents/capability-curl/`: minimal HTTPS call to the capability runtime;
- `examples/agents/subscan-gateway/`: lower-level provider gateway inspection path using Subscan as
  one concrete provider example.

## Local Preview

```sh
npx mint@latest dev --no-open
```

The local preview serves the docs site at `http://localhost:3000/docs`.

## Checks

```sh
npm run check
npx mint@latest validate
```

The portable check validates Mintlify navigation targets, Markdown links, docs-site route links,
trailing whitespace, secret patterns, unsafe SEO/GEO success phrases, and example syntax.

Live examples require a PubFi API key and must load it from local environment variables or a secret
store. Do not commit credentials, wallet addresses, raw account responses, or production readbacks.

## Publishing

Deploy this repository with Mintlify GitHub sync and set `docs.pubfi.ai` as the canonical docs
domain. GitHub Pages is a fallback only; do not run a second canonical docs site unless canonical
and noindex rules are explicit.

## Public Boundary

Safe claims:

- PubFi is building an agent-native crypto data layer.
- Discovery is an open index, demand engine, and source-selection surface for crypto data APIs.
- PubFi exposes generic route/capability tooling for agents and MCP clients.
- Public Discovery and LLM exports are generated from checked-in public-safe curated data.

Unsafe claims:

- every Discovery source is callable through PubFi;
- local SEO/GEO artifacts prove ranking, traffic, or AI citation success;
- GitHub exposure alone proves search success;
- PubFi executes supplier procurement, wallet payments, x402 settlement, or live model-ranked
  routing by default.

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
