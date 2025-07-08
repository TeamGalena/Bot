import { migrateDatabase } from "@teamgalena/shared/database";
import { wrapCatching } from "@teamgalena/shared/error";
import logger from "@teamgalena/shared/logger";
import { Client, Events, GatewayIntentBits } from "discord.js";
import registerCommands, { executeCommand } from "./commands/register";
import { config } from "./config";
import { sendModInfo } from "./info";
import "./server";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (it) => {
  logger.info(`logged in as ${it.user.tag}`);

  const guilds = await it.guilds.fetch({ limit: 10 });
  for (const [, guild] of guilds) {
    await sendModInfo(await guild.fetch());
  }
});

client.on(Events.InteractionCreate, wrapCatching(executeCommand));

await migrateDatabase();

await client.login(config.botToken);

await registerCommands(client);
