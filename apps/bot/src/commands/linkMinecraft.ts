import {
  addFlags,
  loadSupporterRoles,
  persistLink,
  updateRank,
} from "@teamgalena/shared/database";
import { UserError } from "@teamgalena/shared/error";
import { createFlags, SUPPORTER_FLAGS } from "@teamgalena/shared/flags";
import type { User } from "@teamgalena/shared/models";
import { queryUsername, queryUUID } from "@teamgalena/shared/mojang";
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

async function validateUUID(input: string) {
  if (input.length !== 32)
    throw new UserError("Invalid UUID, did you enter your username instead?");

  await queryUsername(input);

  return input;
}

async function getUUID(interaction: ChatInputCommandInteraction) {
  const by = interaction.options.getSubcommand(true);

  switch (by) {
    case linkTypes.UUID:
      return validateUUID(interaction.options.getString("uuid", true));
    case linkTypes.USER_NAME:
      return queryUUID(interaction.options.getString("username", true));
    default:
      throw new Error(`invalid subcommand '${by}'`);
  }
}

async function getRoles(interaction: ChatInputCommandInteraction) {
  const roles = interaction.member?.roles;
  if (roles instanceof GuildMemberRoleManager) {
    return roles.cache.keys().toArray();
  }
}

export async function execute(
  interaction: ChatInputCommandInteraction,
  user: User
) {
  await interaction.deferReply({ ephemeral: true });

  const supporterRoles = await loadSupporterRoles();
  const roles = await getRoles(interaction);

  const rank = supporterRoles.find((it) => roles?.includes(it.id))?.rank ?? -1;

  if (interaction.options.getSubcommand(true) === "refresh") {
    await updateRank(interaction.user.id, rank, user);
    if (rank > 0) await addFlags(interaction.user.id, SUPPORTER_FLAGS, user);

    if (interaction.isRepliable()) {
      await interaction.editReply("Your supporter status was refreshed!");
    }
  } else {
    const uuid = await getUUID(interaction).then((it) =>
      it.replaceAll("-", "")
    );

    const flags = rank > 0 ? createFlags(...SUPPORTER_FLAGS) : undefined;
    await persistLink(
      { discordId: interaction.user.id, uuid, rank, flags },
      user
    );

    if (interaction.isRepliable()) {
      await interaction.editReply(
        "You have sucessfully linked your minecraft account!"
      );
    }
  }
}
