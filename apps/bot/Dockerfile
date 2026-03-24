# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:slim AS base
WORKDIR /usr/src

FROM base AS builder

RUN bun install turbo@2 --global
COPY . .
RUN turbo prune @teamgalena/bot --docker

# install dependencies into temp directory
# this will cache them and speed up future builds
# install with --production (exclude devDependencies)
FROM base AS install

WORKDIR /pruned

COPY --from=builder /usr/src/out/json/ .
RUN bun install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM base AS release

COPY --from=install /pruned/node_modules node_modules
COPY --from=builder /usr/src/out/full ./
COPY migrations /migrations

HEALTHCHECK --timeout=5s \
   CMD bun run /usr/src/apps/bot/scripts/healthcheck.ts

# run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "apps/bot/src/app.ts" ]