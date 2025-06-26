import { server as createServer } from "@hapi/hapi";
import { getLinkByUuid } from "@teamgalena/shared/database";
import { extractFlags } from "@teamgalena/shared/flags";
import logger from "@teamgalena/shared/logger";

const server = createServer({ port: 3000 });

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
