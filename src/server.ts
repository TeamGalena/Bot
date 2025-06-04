import { server as createServer } from "@hapi/hapi";
import {
  getLinkByUuid,
  loadFlaggedUuids,
  loadSupporterUuids,
} from "./database";
import { extractFlags, isFlag } from "./flags";
import logger from "./logger";

const server = createServer({ port: 3000 });

server.route({
  method: "GET",
  path: "/api/supporters",
  handler: async (req, tools) => {
    const aboveRank = parseInt(req.query.rank ?? "0");
    if (isNaN(aboveRank) || aboveRank < 0) {
      return tools
        .response({
          message: "parameter rank must be an integer >0",
        })
        .code(400);
    }

    return await loadSupporterUuids(aboveRank);
  },
});

server.route({
  method: "GET",
  path: "/api/flagged/{flag}",
  handler: async (req, tools) => {
    const { flag } = req.params;
    if (!isFlag(flag)) {
      return tools
        .response({
          message: `unknown flag '${flag}'`,
        })
        .code(400);
    }

    return await loadFlaggedUuids(flag);
  },
});

server.route({
  method: "GET",
  path: `/api/{uuid}`,
  handler: async (req, tools) => {
    const uuid = req.params.uuid?.replaceAll(/[-_]/g, "");
    const link = await getLinkByUuid(uuid);
    if (!link) {
      return tools
        .response({
          message: `unknown uuid '${uuid}'`,
        })
        .code(404);
    }

    const flags = extractFlags(link.flags);
    const { rank } = link;
    return { flags, rank };
  },
});

await server.start();
logger.debug(`server accepting responses at ${server.info.uri}`);
