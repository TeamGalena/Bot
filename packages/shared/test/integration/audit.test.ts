import { afterEach, beforeAll, expect, setSystemTime, test } from "bun:test";
import {
  deleteLinkByDiscordId,
  getAuditLog,
  getLinkByDiscordId,
  insertLink,
  LinkEntry,
  migrateDatabase,
  truncateDatabase,
  updateLink,
} from "../../src/database";
import { User } from "../../src/user";
import { createTestLinkInput } from "../helper/link";

const user: User = {
  username: "test-user",
};

beforeAll(async () => {
  await migrateDatabase();
});

afterEach(async () => {
  await truncateDatabase();
  setSystemTime();
});

test("creates audit log when creating an entry", async () => {
  setSystemTime(new Date("2025-02-12 14:33:47"));

  const link = createTestLinkInput();
  await insertLink(link, user);

  const log = await getAuditLog();

  expect(log).toHaveLength(1);
  expect(log[0]).toMatchSnapshot("insert-audit-log");
});

test("creates audit log when updating an entry", async () => {
  setSystemTime(new Date("2025-02-12 14:33:47"));

  const link = createTestLinkInput();
  const update = createTestLinkInput({
    uuid: "updated-test-uuid",
    flags: ["anniversary", "gilded"],
  });

  // This should be some form of fixture, might be possible when using an ORM
  await insertLink(link, user);
  const created = await getLinkByDiscordId(link.discordId);

  setSystemTime(new Date("2025-02-16 14:33:47"));
  await updateLink(created as LinkEntry, update, user);

  const log = await getAuditLog();

  expect(log).toHaveLength(2);
  expect(log[0]).toMatchSnapshot("update-audit-log");
});

test("creates audit log when deleting an entry", async () => {
  setSystemTime(new Date("2025-02-12 14:33:47"));

  const link = createTestLinkInput();

  // This should be some form of fixture, might be possible when using an ORM
  await insertLink(link, user);

  setSystemTime(new Date("2025-02-16 14:33:47"));
  await deleteLinkByDiscordId(link.discordId, user);

  const log = await getAuditLog();

  expect(log).toHaveLength(2);
  expect(log[0]).toMatchSnapshot("delete-audit-log");
});
