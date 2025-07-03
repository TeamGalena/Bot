import { InputLinkEntry } from "../../src/database";

export function createTestLinkInput(
  values: Partial<InputLinkEntry> = {}
): InputLinkEntry {
  return {
    discordId: "test-discord-id",
    uuid: "test-uuid",
    rank: 42,
    ...values,
  };
}
