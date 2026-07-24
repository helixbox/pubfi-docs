# x402 Base Sepolia Challenge

This example displays PubFi's current accountless x402 challenge. It does not load a private key,
create a payment authorization, call a provider successfully, or spend test USDC.

## Run

```sh
sh examples/agents/x402-base-sepolia/show_challenge.sh
```

The default resource is:

```text
https://api.pubfi.ai/v1/gateway/quantro/health
```

An eligible unpaid request returns HTTP `402`, a `PAYMENT-REQUIRED` header, a JSON payment
requirement, and `Cache-Control: private, no-store`.

## Safety

- This is Base Sepolia testnet, not Base mainnet.
- Do not add a PubFi API key to an x402 request.
- Do not place a buyer private key, `PAYMENT-SIGNATURE`, or `PAYMENT-RESPONSE` in this repository.
- Use the live challenge as the current term authority. Do not copy a price or payee from an old
  response.
