import { Client, Events, GatewayIntentBits } from "discord.js";
import registerCommands, { executeCommand } from "./commands/register";
import { config } from "./config";
import { wrapCatching } from "./error";
import logger from "./logger";
import "./server";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (it) => {
  logger.info(`Logged in as ${it.user.tag}`);
});

client.on(Events.InteractionCreate, wrapCatching(executeCommand));

await client.login(config.botToken);

await registerCommands(client);
