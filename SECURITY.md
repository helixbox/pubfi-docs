# Security

Do not open public issues or pull requests that include secrets, credentials, account identifiers,
private wallet data, raw production payloads, billing records, or private customer information.

## Public Docs Security Boundary

This repository is for public documentation, examples, and public-safe materials only. It must not
contain:

- PubFi API keys;
- upstream provider API keys;
- account ids or private usage data;
- wallet secrets or payment payloads;
- private procurement notes;
- production `seo_geo` rows or raw readbacks;
- raw answer-engine outputs or unredacted crawler logs.

## Reporting

If you find a security issue in public docs or examples, report it through PubFi's private security
contact path rather than posting secret material in public. Until a dedicated public security
address exists, use the private product contact path already approved by the team.

## Example Redaction

Use placeholder values:

```text
PROD_PUBFI_API_KEY=<redacted PubFi API key>
wallet_address=<example or test-only address>
request_id=req_example_...
```

Never paste real keys into prompts, docs, examples, issue comments, or screenshots.

