import { addFlags } from "@teamgalena/shared/database";
import { UserError } from "@teamgalena/shared/error";
import { type Flag } from "@teamgalena/shared/flags";
import type { User } from "@teamgalena/shared/models";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

type DatePredicate = (date: Date) => boolean;

function inMonth(...months: number[]): DatePredicate {
  const utcMonths = months.map((month) => {
    if (month < 1 || month > 12) throw new Error("months are between 1-12");
    return month - 1;
  });
  return (date) => utcMonths.some((it) => date.getUTCMonth() === it);
}

const timeRanges: Partial<Record<Flag, DatePredicate>> = {
  pride: inMonth(6, 7),
};

export const command = new SlashCommandBuilder()
  .setName("claim")
  .setDescription("claim a special time-limited tophat");

function availableFlag(date: Date) {
  return Object.entries(timeRanges).find(([, test]) => test(date))?.[0] as
    | Flag
    | undefined;
}

export async function execute(
  interaction: ChatInputCommandInteraction,
  user: User
) {
  await interaction.deferReply({ ephemeral: true });

  const now = new Date();
  const flag = availableFlag(now);

  if (!flag) {
    throw new UserError("there is no special tophat available right now");
  }

  await addFlags(interaction.user.id, [flag], user);

  if (interaction.isRepliable()) {
    await interaction.editReply(`You claimed the ${flag} tophat!`);
  }
}
