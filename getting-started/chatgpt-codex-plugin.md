---
title: Use PubFi In ChatGPT And Codex
description: Use the public PubFi Plugin with current catalog discovery and Account/OAuth execution.
---

The PubFi Plugin adds one workflow skill to the existing PubFi Account/OAuth MCP root. It helps
ChatGPT and Codex discover current crypto-data capabilities, inspect one exact contract, and run
an authorized data query.

## Install And Connect

When the Plugin is available in the Universal Plugins Directory:

1. Open the Plugins Directory in ChatGPT or Codex and search for PubFi.
2. Confirm that the publisher is HelixboxLabs, then install PubFi.
3. Ask PubFi to find a capability or inspect a capability before execution.
4. When a request needs account execution, follow the OAuth linking prompt and approve the PubFi
   account connection.

The public Plugin uses the universal Account/OAuth MCP root at
https://mcp.pubfi.ai/. Catalog discovery is public. Route execution requires the connected
account. The repository marketplace is an authoring surface and remains unavailable until the
Production publication path is complete.

For OpenAI's current connection and submission workflow, see the official
[connect and test guide](https://developers.openai.com/plugins/deploy/connect-chatgpt) and
[submission guide](https://developers.openai.com/plugins/deploy/submission).

## Use The PubFi Workflow

Ask for a data task in plain language, for example:

- Find the current PubFi capability for a DeGov data-status query.
- Inspect the selected PubFi capability before running it.
- Run this exact PubFi crypto-data query through my connected account.

The skill follows this order:

1. Call pubfi.capabilities.list to discover the current catalog. Follow opaque cursors only when
   needed.
2. Call pubfi.capabilities.get for the exact capability selected from the current catalog.
3. Call pubfi.route.execute only with the exact current path and method from that capability
   detail.
4. Show the selected capability, Registry-generation shape, upstream status, bounded result, and
   source or readiness caveats.

The current catalog and tool schema are always authoritative. Do not reuse an old capability
identifier, infer a route from a provider name, or add a free suffix that the catalog does not
publish.

## Account And Credit Boundary

Before a paid account call, PubFi states the published credit_cost. The account must already have
the required entitlement. The Plugin does not buy Credits, open checkout or subscriptions, request
a wallet, move funds, trade assets, or make investment decisions. It does not use or fall back to
the independent accountless payment lane.

The Plugin does not provide investment advice. Provider readiness, source caveats, and bounded
results remain part of the response and can change with the current catalog.

## Privacy And Support

Review the [Privacy Policy](https://pubfi.ai/privacy-policy) and
[Terms of Service](https://pubfi.ai/terms-of-service). For connection, OAuth, capability,
execution, entitlement, or privacy questions, use the [PubFi FAQ](/faq).
