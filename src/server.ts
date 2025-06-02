import { server as createServer } from "@hapi/hapi";
import { loadSupporterUuids } from "./database";
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

await server.start();
logger.debug(`server accepting responses at ${server.info.uri}`);
