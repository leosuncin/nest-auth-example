FROM node:26 AS dependencies

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

RUN --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=package-lock.json,target=/app/package-lock.json \
    curl -sf https://gobinaries.com/tj/node-prune | sh &&\
    npm ci --omit=dev &&\
    node-prune node_modules

FROM gcr.io/distroless/nodejs26-debian13:nonroot AS app

ENV NODE_ENV="production"

WORKDIR /srv/app

COPY --chown=nonroot:nonroot --from=pruner /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot --from=build /app/dist ./
COPY --chown=nonroot:nonroot package.json ./

EXPOSE 3000

CMD ["/srv/app/main.js"]
