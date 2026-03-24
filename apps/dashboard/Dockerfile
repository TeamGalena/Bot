# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:slim AS base
WORKDIR /usr/src

FROM base AS builder

RUN bun install turbo@2 --global
COPY . .
RUN turbo prune @teamgalena/dashboard --docker

# install dependencies into temp directory
# this will cache them and speed up future builds
# install with --production (exclude devDependencies)
FROM base AS install
WORKDIR /pruned

COPY --from=builder /usr/src/out/json/ .
RUN bun install --frozen-lockfile --production

COPY --from=builder /usr/src/out/full .
RUN bun run --filter @teamgalena/dashboard build

# copy production dependencies and source code into final image
FROM base AS release

COPY --from=install /pruned/node_modules node_modules
COPY --from=install /pruned/apps/dashboard/dist dist
COPY --from=install /pruned/apps/dashboard/public public

ARG $gitHash
ENV GIT_HASH=$gitHash

ARG $gitRepo
ENV GIT_REPO=$gitRepo

# run the app
ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80/tcp

HEALTHCHECK --timeout=5s \
   CMD bun run /usr/src/apps/bot/scripts/healthcheck.ts

CMD ["bun", "run", "dist/server/entry.mjs"]