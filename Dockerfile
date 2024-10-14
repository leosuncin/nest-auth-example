FROM node:20-slim AS dependencies

WORKDIR /app

RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=package-lock.json,target=/app/package-lock.json \
    npm ci

FROM dependencies AS build

COPY . .

RUN npm run build &&\
  rm -rf dist/migrations dist/**/factories dist/**/seeders &&\
  npm prune --omit=dev

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS app

ARG PORT=3000
ENV NODE_ENV=production PORT=${PORT}

WORKDIR /backend

COPY --from=build --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /app/dist .
COPY --chown=nonroot:nonroot ./package.json .

EXPOSE ${PORT}

CMD ["main.js"]
