import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  REST,
  Routes,
  SharedSlashCommand,
  type Interaction,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { config } from "../config";
import { UserError } from "../error";
import logger from "../logger";
import * as makeAnnouncement from "./linkMinecraft";

type CommandHandler = (
  interaction: ChatInputCommandInteraction
) => void | Promise<void>;

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const handlers = new Collection<string, CommandHandler>();

function addCommand({
  command,
  execute,
}: {
  command: SharedSlashCommand;
  execute: CommandHandler;
}) {
  commands.push(command.toJSON());
  handlers.set(command.name, execute);
}

addCommand(makeAnnouncement);

const rest = new REST().setToken(config.botToken);

export async function executeCommand(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const handler = handlers.get(interaction.commandName);
  if (!handler) {
    logger.warn(`Unkown command encountered: '${interaction.commandName}'`);
    return;
  }

  try {
    await handler(interaction);
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);

    const response =
      error instanceof UserError
        ? error.message
        : "There was an error while executing this command!";

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: response,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: response,
        ephemeral: true,
      });
    }
  }
}

export default async function registerCommands(client: Client) {
  logger.info(`adding ${commands.length} commands`);
  await Promise.all(
    client.guilds.cache.map(async (guild) => {
      await rest.put(
        Routes.applicationGuildCommands(config.applicationId, guild.id),
        { body: commands }
      );
    })
  );
}
