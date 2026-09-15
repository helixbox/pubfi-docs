---
title: Subscan
description: Select a Subscan network and query Polkadot rewards and transfers through PubFi.
---

Use provider key `subscan` in the [capability catalog](https://api.pubfi.ai/v1/capabilities?provider_key=subscan&limit=1000).
This page covers Subscan-specific choices. Use the [PubFi gateway guide](/reference/provider-gateway-examples)
for authentication, free variants, quotas, and errors, and the [API Reference](https://api.pubfi.ai/reference)
for complete request and response schemas.

## Select A Network

For Subscan, `polkadot` selects `polkadot.api.subscan.io`. Replace `{network}` in
`/v1/gateway/subscan/{network}/api/v2/scan/account/reward_slash` with `polkadot`, but keep
`https://api.pubfi.ai` as the request origin. Do not send your PubFi key to the upstream host.

A path without `{network}` uses a fixed upstream target. Read that operation's target description;
do not assume that every networkless path selects Polkadot. Prefer an explicit network-qualified
route for a portfolio integration.

## Rewards And Transfers

Match the requested data and response schema, not only a similar operation name. For Subscan:

| Data | Upstream operation to find in the PubFi reference |
| --- | --- |
| Account reward and slash records | `POST /api/v2/scan/account/reward_slash` |
| Account transfer records | `POST /api/v2/scan/transfers` |
| Summed staking rewards | `POST /api/scan/staking/total_reward` |

The current contract does not advertise `/api/v2/scan/rewards`. Do not treat it as an alias for
reward history or reward totals. These operations return different data. If your existing client
uses `/rewards`, compare its original response requirements before replacing it. See the upstream
[account reward records](https://support.subscan.io/api-36910971) and
[staking reward totals](https://support.subscan.io/api-36910963) contracts.

For Polkadot reward history, set `PUBFI_ADDRESS` to the public account address you want to query.
After confirming the ready route and its free advertisement, run this example with `curl` and `jq`:

```sh
curl --fail-with-body --silent --show-error \
  'https://api.pubfi.ai/v1/gateway/subscan/polkadot/api/v2/scan/account/reward_slash:free' \
  --header "Authorization: Bearer ${PUBFI_API_KEY}" \
  --header 'Content-Type: application/json' \
  --data "$(jq -n --arg address "$PUBFI_ADDRESS" \
    '{address: $address, category: "Reward", page: 0, row: 10}')"
```

For transfers, use `/v1/gateway/subscan/polkadot/api/v2/scan/transfers:free` with the JSON body
`{"address":"YOUR_ADDRESS","page":0,"row":10}` and the same headers. Use your PubFi key;
Subscan's upstream `X-API-Key` instructions do not apply to the PubFi gateway.

`category: "Reward"` selects rewards; `Slash` selects slashes. Do not infer claimed/unclaimed defaults from that
category. Inspect the operation schema if you need `claimed_filter` or other filters.
Check the provider's business result as well as HTTP status: Subscan success uses `code: 0`.
An empty reward list can be a successful query for an account with no matching records.

## Free Access

Confirm `x-pubfi-free-variant` on the exact operation before using the examples. The advertised
Subscan free policy shares its rate and quota limits across eligible routes for one billing
account; it is not a separate allowance for each endpoint. Read the current values from the
contract. An advertisement in Production does not establish free access in Staging.
