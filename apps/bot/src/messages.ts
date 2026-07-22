import { getAutoThreadingOptions } from "@teamgalena/shared/database";
import logger from "@teamgalena/shared/logger";
import {
  ChannelType,
  ThreadAutoArchiveDuration,
  type Message,
} from "discord.js";

function containsLink(content: string) {
  return /https?:\/\//.test(content);
}

async function fetchTitle(message: Message) {
  const embed = message.embeds.find((it) => !!it.title);

  if (embed) {
    return embed.title as string;
  }

  return message.content;
}

export async function handleMessage(message: Message) {
  if (message.channel.type !== ChannelType.GuildText) return;

  const autoThreadingOptions = await getAutoThreadingOptions(
    message.channel.id,
  );

  if (!autoThreadingOptions) return;

  logger.debug(`converting message to thread in ${message.channel.name}`);

  if (autoThreadingOptions.requiresLink) {
    if (!containsLink(message.content)) {
      await message.delete();
      await message.author.send(
        `the channel \`#${message.channel.name}\` requires every message to contain a link. If you just wanted to respond to someone, please do so in the respective thread of their message`,
      );
    }
  }

  await message.startThread({
    name: await fetchTitle(message),
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
  });
}
