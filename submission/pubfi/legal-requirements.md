# PubFi Plugin Legal And Support Requirements

This file is development-only review material. The canonical public references are the existing
PubFi website privacy policy, terms of service, and documentation FAQ.

## Canonical public references

- Privacy: https://pubfi.ai/privacy-policy
- Terms: https://pubfi.ai/terms-of-service
- Support: https://docs.pubfi.ai/faq

The pages identify HelixboxLabs and cover the website, PubFi account, OAuth, API, MCP, and Plugin
service boundaries. The Plugin uses the existing Account/OAuth MCP root and does not add a
separate commerce or payment contract.

## Data and purpose review

- Data categories can include account and OAuth identity, request and idempotency identifiers,
  route and method, status and latency, bounded provider responses needed for paid idempotent
  replay, and security or operational records.
- PubFi uses this data to authenticate the user, enforce the current catalog and account
  entitlement, execute the requested route, prevent abuse, support replay or disputes, and
  operate the service.
- Recipients can include PubFi infrastructure and service providers, Supabase authentication,
  and the selected upstream data provider when a route executes.
- Paid request identity is bound by a hash and canonical route identity; the account execution
  path does not retain full paid request bodies as request-body records.
- Current retention is tied to the applicable billing-account or service-record lifetime unless a
  separate deletion, legal, or security obligation applies. Do not replace this criterion with an
  invented duration.
- User controls include revoking the OAuth connection in ChatGPT or Codex, revoking PubFi
  sessions, exercising applicable account or deletion rights, and contacting support through the
  FAQ.

## Product limits

The Plugin is a crypto-data discovery and query workflow. It must not be presented as investment
advice or used for trades, transfers, wallet custody, or payment operations. Reviewer credentials
are portal-only protected material and must never be committed here.
