FROM node:18-bullseye-slim AS build

WORKDIR /var/cache/backend

RUN chown node:node /var/cache/backend

USER node

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

RUN npm run build

FROM build AS dependencies

RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs:18 AS app

ARG NODE_ENV="production" PORT=3000

ENV NODE_ENV=${NODE_ENV} PORT=${PORT}

WORKDIR /srv/app

COPY --from=dependencies /var/cache/backend/node_modules ./node_modules
COPY --from=build /var/cache/backend/dist ./

EXPOSE ${PORT}

CMD ["/srv/app/main.js"]
