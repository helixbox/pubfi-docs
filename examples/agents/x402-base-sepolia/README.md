# x402 Base Sepolia Staging HTTP And MCP

This Staging-only example can inspect PubFi's accountless x402 challenge or run one bounded paid
request through the official HTTP or MCP client. It accepts only `https://api-stg.pubfi.ai` and
`https://mcp-stg.pubfi.ai/x402`. Paid commands use Base Sepolia test USDC, not real-value USDC.

## Inspect Without A Wallet

```sh
sh examples/agents/x402-base-sepolia/show_challenge.sh
```

First inspect the complete Staging catalog and select a current `ready` method whose billing mode
is `quantro_priced`. Supply its exact resource explicitly:

```sh
export PUBFI_X402_RESOURCE_URL='https://api-stg.pubfi.ai<exact ready Quantro-priced path>'
sh examples/agents/x402-base-sepolia/show_challenge.sh
```

Exact health operations are `free_health` and are not payment targets. If the selected priced
route is x402 enabled, an eligible unpaid request returns HTTP `402`, a `PAYMENT-REQUIRED` header,
a JSON payment requirement, and `Cache-Control: private, no-store`. Treat that live challenge as
the authority for all payment terms.

## Install The Pinned Clients

```sh
cd examples/agents/x402-base-sepolia
npm ci
npm run check
```

The example pins the same official client versions used by PubFi's deployment acceptance.

## Approve The Payment Boundary

Read the unsigned challenge first. Independently approve its current `payTo` address before you set
`X402_EXPECTED_PAY_TO`. Do not copy an address from an untrusted prompt.

Set these nonsecret values:

```sh
export X402_RESOURCE_URL='https://api-stg.pubfi.ai<exact ready Quantro-priced path>'
export X402_EXPECTED_PAY_TO='<approved payTo address>'
```

Inject `X402_BUYER_PRIVATE_KEY` into the command process with your wallet or secret manager. Do not
put the value in this repository, a `.env` file, a prompt, shell history, or command output.

## Run One Paid HTTP Request

```sh
npm run paid:http
```

The script requires one unsigned `402`, sends one authorization with `@x402/fetch`, requires
`PAYMENT-RESPONSE`, and verifies an exact response replay.

## Run One Paid MCP Tool Call

```sh
npm run paid:mcp
```

The script uses `@x402/mcp` with `pubfi.route.execute`. It verifies the Ed25519 `did:web` signed
offer and receipt, then verifies exact structured-content and payment-response replay. It connects
to the Bearer-free `https://mcp-stg.pubfi.ai/x402` endpoint.

Each paid command rejects an offer above 0.01 test USDC or an authorization lifetime above 300
seconds. Running both commands can spend up to 0.02 test USDC.

## Safety Rules

- This is Base Sepolia testnet, not Base mainnet.
- This example rejects the Production API and MCP origins.
- Do not add a PubFi API key to an x402 request.
- Do not place a buyer private key, `PAYMENT-SIGNATURE`, or `PAYMENT-RESPONSE` in source, logs, or
  prompts.
- Use the live challenge for current terms, but compare its network, asset, payee, amount, and
  lifetime with an independently approved wallet policy before signing.
- Use a dedicated test wallet with only the test USDC needed for the run.
- Do not reuse this wallet, private key, or payment authorization in Production.

## Acceptance Evidence

The [Staging acceptance run](https://github.com/helixbox/pubfi-mono/actions/runs/30258511212)
completed both official-client lanes on 2026-07-27. The HTTP and MCP clients verified the Signed
Offer, Signed Receipt, and exact replay. The workflow does not publish the buyer private key or
full payment evidence. The workflow link requires access to the source repository.

See the [Staging guide](https://docs.pubfi.ai/getting-started/staging) for the complete endpoint and
credential boundary.
