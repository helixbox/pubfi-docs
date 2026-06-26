# Security And Public Data Boundary

Public docs should make PubFi easier to understand without leaking private runtime state.

## Public-Safe Data

Allowed in public docs:

- public product descriptions;
- public Discovery URLs;
- public OpenAPI and MCP manifest URLs;
- public-safe example requests;
- redacted response shapes;
- public-safe source freshness summaries;
- claim-safety language.
- public explanations of `llms.txt`, `llms-full.txt`, OpenAPI, MCP, and Discovery links.

## Private Data

Do not publish:

- PubFi API keys;
- upstream provider credentials;
- account ids and private usage data;
- billing records;
- wallet secrets or payment payloads;
- private procurement notes;
- raw production Postgres `seo_geo` rows;
- raw answer-engine outputs;
- unredacted crawler logs;
- local runner scratch.
- query-prioritization maps;
- content-operations workflows;
- readback methods;
- campaign plans;
- internal SEO/GEO operating playbooks.

## Examples

Examples should load secrets from environment variables or secret stores:

```sh
export PROD_PUBFI_API_KEY='<PubFi API key>'
```

The docs may show the variable name, but not a real value.

## Screenshots

Screenshots must be sanitized before publication. Prefer generated diagrams or cropped public
surfaces over dashboard screenshots.

## Agent Prompts

Agents should never receive upstream provider keys, wallet secrets, billing payloads, or private
account identifiers. The agent can receive a public route intent and use PubFi auth through the
runtime secret store.
