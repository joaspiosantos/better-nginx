FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine AS web-build
WORKDIR /app/web
COPY web/package.json web/bun.lock ./
RUN bun install --frozen-lockfile
COPY web/ ./
RUN bun run build

FROM oven/bun:1-alpine AS runtime
RUN sed -i 's/https:/http:/' /etc/apk/repositories \
	&& apk add --no-cache nginx nginx-mod-stream \
	&& rm -f /etc/nginx/conf.d/stream.conf
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY --from=web-build /app/web/dist ./web/dist
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf.template /app/docker/default.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NGINX_CONF_DIR=/etc/nginx/conf.d
ENV PORT=3000
EXPOSE 80 443 3000

ENTRYPOINT ["/entrypoint.sh"]
