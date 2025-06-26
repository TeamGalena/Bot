import type { LinkEntry } from "@teamgalena/shared/database";
import { expect, test } from "bun:test";
import { flagQuery, withFlags } from "../src/flags";

function createLinkEntry(values: Partial<LinkEntry> = {}): LinkEntry {
  return {
    id: -1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    discordId: "test-id",
    flags: 0b00000000,
    rank: 99,
    uuid: "test-uuid",
    ...values,
  };
}

test("adds flag to mask", () => {
  const initial = createLinkEntry();

  const modified = withFlags(initial, "pride");
  expect(modified.flags).toBe(0b00000001);
});

test("adds multiple flags to mask", () => {
  const initial = createLinkEntry();

  const modified = withFlags(initial, "pride", "anniversary");
  expect(modified.flags).toBe(0b00000011);
});

test("adds flag to mask with existing flag", () => {
  const initial = createLinkEntry({ flags: 0x00000001 });

  const modified = withFlags(initial, "anniversary");
  expect(modified.flags).toBe(0b00000011);
});

test("resolves SQL query with flag", () => {
  const modified = flagQuery("anniversary");
  expect(modified).toBe("(flags & 2 != 0)");
});
