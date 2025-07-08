import type { ModEntry } from "@teamgalena/shared/database";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type MessageCreateOptions,
} from "discord.js";

export function createInfo({
  name,
  repository,
  curseforgeSlug,
  modrinthSlug,
  description,
  color,
  icon,
}: ModEntry): MessageCreateOptions {
  const iconURL = icon && `https://dev.galena.wiki/assets/${icon}/icon.png`;

  const embed = new EmbedBuilder()
    .setAuthor({ name, iconURL })
    .setDescription(description ?? null)
    .setColor(color);
  const buttons = new ActionRowBuilder<ButtonBuilder>();

  if (repository) {
    buttons.addComponents(
      new ButtonBuilder()
        .setLabel("Issues")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://github.com/${repository}/issues`)
    );
  }

  if (curseforgeSlug) {
    buttons.addComponents(
      new ButtonBuilder()
        .setLabel("CurseForge")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://curseforge.com/minecraft/mc-mods/${curseforgeSlug}`)
    );
  }

  if (modrinthSlug) {
    buttons.addComponents(
      new ButtonBuilder()
        .setLabel("Modrinth")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://modrinth.com/mod/${modrinthSlug}`)
    );
  }

  return {
    embeds: [embed],
    components: [buttons],
  };
}
