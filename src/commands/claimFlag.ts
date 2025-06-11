import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { addFlags } from "../database";
import { UserError } from "../error";
import { type Flag } from "../flags";

type DatePredicate = (date: Date) => boolean;

function inMonth(month: number): DatePredicate {
  if (month < 1 || month > 12) throw new Error("months are between 1-12");
  const utcMonth = month - 1;
  return (date) => {
    return date.getUTCMonth() === utcMonth;
  };
}

const timeRanges: Partial<Record<Flag, DatePredicate>> = {
  pride: inMonth(6),
};

export const command = new SlashCommandBuilder()
  .setName("claim")
  .setDescription("claim a special time-limited tophat");

function availableFlag(date: Date) {
  return Object.entries(timeRanges).find(([, test]) => test(date))?.[0] as
    | Flag
    | undefined;
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const now = new Date();
  const flag = availableFlag(now);

  if (!flag) {
    throw new UserError("there is no special tophat available right now");
  }

  await addFlags(interaction.user.id, flag);

  if (interaction.isRepliable()) {
    await interaction.editReply(`You claimed the ${flag} tophat!`);
  }
}
