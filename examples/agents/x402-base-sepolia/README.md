# x402 Base Sepolia HTTP And MCP

This example can inspect PubFi's accountless x402 challenge or run one bounded paid request through
the official HTTP or MCP client. Paid commands use Base Sepolia test USDC, not real-value USDC.

## Inspect Without A Wallet

```sh
sh examples/agents/x402-base-sepolia/show_challenge.sh
```

The default resource is:

```text
https://api.pubfi.ai/v1/gateway/quantro/health
```

An eligible unpaid request returns HTTP `402`, a `PAYMENT-REQUIRED` header, a JSON payment
requirement, and `Cache-Control: private, no-store`.

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
export X402_RESOURCE_URL='https://api.pubfi.ai/v1/gateway/quantro/health'
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
offer and receipt, then verifies exact structured-content and payment-response replay.

Each paid command rejects an offer above 0.01 test USDC or an authorization lifetime above 300
seconds. Running both commands can spend up to 0.02 test USDC.

## Safety Rules

- This is Base Sepolia testnet, not Base mainnet.
- Do not add a PubFi API key to an x402 request.
- Do not place a buyer private key, `PAYMENT-SIGNATURE`, or `PAYMENT-RESPONSE` in source, logs, or
  prompts.
- Use the live challenge for current terms, but compare its network, asset, payee, amount, and
  lifetime with an independently approved wallet policy before signing.
- Use a dedicated test wallet with only the test USDC needed for the run.
