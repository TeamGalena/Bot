import { optionalEnv } from "@teamgalena/shared/config";
import { getMods } from "@teamgalena/shared/database";
import logger from "@teamgalena/shared/logger";
import type { Guild } from "discord.js";
import { createInfo } from "./templates/modInfo";

const MODS_CHANNEL = optionalEnv("MOD_CHANNEL_ID");

export async function sendModInfo(guild: Guild) {
  if (!MODS_CHANNEL) return false;

  const channel = guild.channels.resolve(MODS_CHANNEL);

  if (channel?.isSendable()) {
    const mods = await getMods();
    logger.debug(
      `sending mod info to #${channel.name} for ${mods.length} mods`
    );

    const previousMessages = await channel.messages.fetch({
      limit: mods.length,
    });

    await Promise.all(
      previousMessages
        .filter((it) => it.author.bot)
        .map((it) => channel.messages.delete(it))
    );

    for (const mod of mods) {
      await channel.send(createInfo(mod));
    }

    return true;
  } else {
    logger.error(`mod info channel not sendable in ${guild.name}`);
    return false;
  }
}
