import { migrateDatabase } from "@teamgalena/shared/database";
import { wrapCatching } from "@teamgalena/shared/error";
import logger from "@teamgalena/shared/logger";
import { Client, Events, GatewayIntentBits } from "discord.js";
import registerCommands, { executeCommand } from "./commands/register";
import { config } from "./config";
import "./server";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (it) => {
  logger.info(`Logged in as ${it.user.tag}`);
});

client.on(Events.InteractionCreate, wrapCatching(executeCommand));

await migrateDatabase();

await client.login(config.botToken);

await registerCommands(client);
