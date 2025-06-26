# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:slim AS base

FROM base AS builder
WORKDIR /app

RUN bun install turbo@2 --global
COPY . .
RUN turbo prune @teamgalena/bot --docker

# install dependencies into temp directory
# this will cache them and speed up future builds
# install with --production (exclude devDependencies)
FROM base AS install

WORKDIR pruned

COPY --from=builder /app/out/json/ .
RUN bun install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM base AS release
WORKDIR /app

COPY --from=install /pruned/node_modules node_modules
COPY --from=builder /app/out/full ./
COPY migrations /migrations

# run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "apps/bot/src/app.ts" ]