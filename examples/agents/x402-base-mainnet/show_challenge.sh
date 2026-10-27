#!/usr/bin/env sh
set -eu

: "${X402_RESOURCE_URL:?Set X402_RESOURCE_URL to an exact ready Production gateway URL.}"

case "${X402_RESOURCE_URL}" in
  https://api.pubfi.ai/v1/gateway/*)
    ;;
  *)
    echo "X402_RESOURCE_URL must use the exact PubFi Production gateway HTTPS origin." >&2
    exit 2
    ;;
esac

curl --silent --show-error --include "${X402_RESOURCE_URL}"
