import {
  addFlags,
  loadSupporterRoles,
  persistLink,
  updateRank,
} from "@teamgalena/shared/database";
import { SUPPORTER_FLAGS } from "@teamgalena/shared/flags";
import queryUUID from "@teamgalena/shared/mojang";
import {
  ChatInputCommandInteraction,
  GuildMemberRoleManager,
  SlashCommandBuilder,
} from "discord.js";

const linkTypes = {
  UUID: "uuid",
  USER_NAME: "username",
};

export const command = new SlashCommandBuilder()
  .setName("link")
  .setDescription("link my account to")
  .addSubcommand((command) =>
    command
      .setName(linkTypes.USER_NAME)
      .setDescription("using your username")
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("your minecraft username")
          .setMaxLength(128)
          .setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command
      .setName(linkTypes.UUID)
      .setDescription("using your UUID")
      .addStringOption((option) =>
        option
          .setName("uuid")
          .setDescription("your minecraft uuid")
          .setMaxLength(128)
          .setRequired(true)
      )
  )
  .addSubcommand((command) =>
    command.setName("refresh").setDescription("refresh your supporter status")
  );

async function getUUID(interaction: ChatInputCommandInteraction) {
  const by = interaction.options.getSubcommand(true);

  switch (by) {
    case linkTypes.UUID:
      return interaction.options.getString("uuid", true);
    case linkTypes.USER_NAME:
      return queryUUID(interaction.options.getString("username", true));
    default:
      throw new Error(`invalid subcommand '${by}'`);
  }
}

const supporterRoles = await loadSupporterRoles();

async function getRoles(interaction: ChatInputCommandInteraction) {
  const roles = interaction.member?.roles;
  if (roles instanceof GuildMemberRoleManager) {
    return roles.cache.keys().toArray();
  }
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const roles = await getRoles(interaction);

  const rank = supporterRoles.find((it) => roles?.includes(it.id))?.rank ?? -1;

  if (interaction.options.getSubcommand(true) === "refresh") {
    await updateRank(interaction.user.id, rank);
    if (rank > 0) await addFlags(interaction.user.id, ...SUPPORTER_FLAGS);

    if (interaction.isRepliable()) {
      await interaction.editReply("Your supporter status was refreshed!");
    }
  } else {
    const uuid = await getUUID(interaction).then((it) =>
      it.replaceAll("-", "")
    );

    await persistLink({ discordId: interaction.user.id, uuid, rank });
    if (rank > 0) await addFlags(interaction.user.id, ...SUPPORTER_FLAGS);

    if (interaction.isRepliable()) {
      await interaction.editReply(
        "You have sucessfully linked your minecraft account!"
      );
    }
  }
}
