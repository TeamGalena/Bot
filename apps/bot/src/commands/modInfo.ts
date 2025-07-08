import { getModBySearch } from "@teamgalena/shared/database";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createInfo } from "../templates/modInfo";

export const command = new SlashCommandBuilder()
  .setName("mod")
  .setDescription("helpful links regarding a mod")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("name of the mod")
      .setMaxLength(64)
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const search = interaction.options.getString("name", true);

  const mod = await getModBySearch(search);

  const info = createInfo(mod);

  if (interaction.isRepliable()) {
    await interaction.editReply(info);
  }
}
