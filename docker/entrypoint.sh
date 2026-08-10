#!/bin/sh
set -e

CONF_DIR="${NGINX_CONF_DIR:-/etc/nginx/conf.d}"
STREAM_DIR="${NGINX_STREAM_DIR:-/etc/nginx/stream.d}"
mkdir -p "$CONF_DIR" "$STREAM_DIR"

if [ -z "$(find "$CONF_DIR" -maxdepth 1 -name '*.conf' -print -quit)" ]; then
  echo "[better-nginx] no existing config found in $CONF_DIR, writing default"
  cp /app/docker/default.conf.template "$CONF_DIR/default.conf"
else
  echo "[better-nginx] existing config found in $CONF_DIR, keeping as-is"
fi

nginx

exec bun run src/index.ts
