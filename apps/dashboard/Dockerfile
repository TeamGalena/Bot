# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:slim AS base

FROM base AS builder
WORKDIR /app

RUN bun install turbo@2 --global
COPY . .
RUN turbo prune @teamgalena/dashboard --docker

# install dependencies into temp directory
# this will cache them and speed up future builds
# install with --production (exclude devDependencies)
FROM base AS install
WORKDIR /pruned

COPY --from=builder /app/out/json/ .
RUN bun install --frozen-lockfile --production

COPY --from=builder /app/out/full .
RUN bun run --filter @teamgalena/dashboard build

# copy production dependencies and source code into final image
FROM base AS release
WORKDIR /app

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

CMD ["bun", "run", "dist/server/entry.mjs"]