ARG NODE_VERSION=26-trixie

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=package-lock.json,target=/app/package-lock.json \
    npm i -g corepack &&\
    corepack enable  &&\
    npm ci --prefer-offline

FROM dependencies AS build

COPY --chown=node:node src /app/src

RUN --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=nest-cli.json,target=/app/nest-cli.json \
    --mount=type=bind,source=tsconfig.json,target=/app/tsconfig.json \
    --mount=type=bind,source=tsconfig.build.json,target=/app/tsconfig.build.json \
    npm run build

FROM dependencies AS pruner

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=package-lock.json,target=/app/package-lock.json \
    npm ci --omit=dev

ADD https://github.com/tj/node-prune/releases/download/v1.0.1/node-prune_1.0.1_linux_amd64.tar.gz /tmp/node-prune_1.0.1_linux_amd64.tar.gz
RUN tar -xzf /tmp/node-prune_1.0.1_linux_amd64.tar.gz -C /usr/local/bin node-prune && \
    node-prune

FROM gcr.io/distroless/nodejs26-debian13:nonroot AS app

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=nonroot:nonroot --from=pruner /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot --from=build /app/dist ./
COPY --chown=nonroot:nonroot LICENSE package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s CMD ["/nodejs/bin/node", "cli.js", "health-check"]

CMD ["main.js"]
