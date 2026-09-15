---
title: Quickstart
description: Create a PubFi API key and make your first free HTTP request.
---

Use a PubFi API key to call an advertised free API variant. Free variants charge zero Credits
and have account-level limits. You do not need an upstream provider key.

## 1. Create An API Key

[Sign in to PubFi](https://pubfi.ai/login), open **Manage application keys**, and create a key.
Copy it when shown. Store it in your local secret manager or environment as `PUBFI_API_KEY`.
Do not put the key in source code, chat messages, or logs.

This guide uses Production at `https://api.pubfi.ai`. For Staging, use a separate key created at
`https://stg.pubfi.ai` and the API root `https://api-stg.pubfi.ai`. See the
[Staging guide](/getting-started/staging).

## 2. Confirm The Free Example Is Available

The example API is Subscan current time. It needs no address or request body; other providers
use the same PubFi authentication and access-selection rules.
Before running it, open the [API Reference](https://api.pubfi.ai/reference) and find
`GET /v1/gateway/subscan/api/now`. Confirm that the operation advertises
`x-pubfi-free-variant` with suffix `:free`. If it is absent, do not run this example or remove
its suffix to try a paid request. See [Gateway Examples](/reference/provider-gateway-examples)
to select another advertised free operation.

The API Reference describes the installed routes. This example does not guarantee that the
route is available in every environment or future release.

## 3. Make The Request

With `PUBFI_API_KEY` loaded in your environment, run:

```sh
curl --fail-with-body --silent --show-error --include \
  'https://api.pubfi.ai/v1/gateway/subscan/api/now:free' \
  --header "Authorization: Bearer ${PUBFI_API_KEY}"
```

A successful request returns HTTP `200`, a JSON provider response, and `x-pubfi-request-id`.
The timestamp changes between calls. PubFi returns the provider body without adding a success
wrapper. Check the provider's business result as well as the HTTP status.

The `:free` suffix selects free execution. It still requires your PubFi API key. The advertised
rate and quota limits are shared by the account as specified by the selected route. A paid
operation's `pricing_unavailable` value does not disable a separately advertised free variant.

## 4. Call The API You Need

Search the [API Reference](https://api.pubfi.ai/reference) for your operation. Use its exact method,
path parameters, query parameters, and JSON body. For a free call, confirm the advertisement and
append `:free` to the final path segment. Use `Authorization: Bearer` with your PubFi key.

If the path includes `{network}`, select its documented alias before calling it. See
[network selection](/reference/provider-gateway-examples#select-a-network) for the shared rule
and the relevant provider page for provider-specific choices.

If a request schema is empty or only says `string / binary`, it does not describe the provider's
JSON fields. Consult the exact upstream operation documentation or report the missing schema.
Do not invent parameters. See [API Reference](/reference/api-reference) for schema limits.

## If The Request Fails

| Result | Next step |
| --- | --- |
| `401` | Check the Bearer header and use a key from the same environment as the API root. |
| `404` | Check the exact path and the current route advertisement. |
| `429` | Follow `Retry-After` when present. A hard free-quota limit has no `Retry-After`. |
| `402` | Check the free advertisement and suffix. Keep the error body; do not assume a purchase is required. |
| Provider error in JSON | Check the provider's parameters and business error, even if HTTP status is `200`. |

When requesting help, include the method, path, redacted request body, status, error code, and
`x-pubfi-request-id`. Omit the key and private account data.

## Next Steps

- [Subscan](/providers/subscan): network selection, rewards, and transfers.
- [Gateway Examples](/reference/provider-gateway-examples): discovery, POST bodies, and free or paid requests.
- [API Key And Runtime](/getting-started/api-key-runtime): account access and quotas.
- [MCP Client Setup](/getting-started/mcp-client): connect an agent.
- [Accountless x402](/getting-started/x402): use a separately eligible payment flow.
