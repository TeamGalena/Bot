import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { withFlags, type Flag } from "../../bot/src/flags";
import { UserError } from "./error";
import logger from "./logger";
import type { Page, Paginated, Pagination } from "./paginated";
import { repeat } from "./util";

export async function migrateDatabase() {
  await db.migrate({
    migrationsPath: "../migrations",
  });
  logger.info("migrated database");
}

const db = await open({
  filename: "../data/database.db",
  driver: sqlite3.Database,
});

type InputLinkEntry = {
  discordId: string;
  uuid: string;
  rank: number;
  flags?: number;
};

export type LinkEntry = InputLinkEntry & {
  id: string;
  createdAt: string;
  updatedAt: string;
  flags: number;
};

export type RoleEntry = {
  id: string;
  rank: number;
};

function resolveError(ex: unknown) {
  if (!(ex instanceof Error)) return ex;
  if (!("code" in ex)) return ex;
  if (ex.code === "SQLITE_CONSTRAINT")
    throw new UserError(
      "this minecraft uuid is already linked to another account"
    );
}

async function getLinkByDiscordId(discordId: string) {
  return await db.get<LinkEntry>("SELECT * FROM Link WHERE discordId = ?", [
    discordId,
  ]);
}

function encodeCursor(entry: LinkEntry) {
  return entry.id.toString();
}

function createPage<T>(items: Paginated<T>[], size: number): Page<T> {
  // TODO
  const total = size;

  if (items.length > size) {
    return {
      items: items.slice(1),
      pageInfo: {
        size,
        total,
        next: items[items.length - 1].cursor,
      },
    };
  } else {
    return {
      items,
      pageInfo: {
        total,
        size: items.length,
      },
    };
  }
}

export async function getLinks(
  pagination: Pagination
): Promise<Page<LinkEntry>> {
  const afterId = Number.parseInt(pagination.after ?? "-1");

  const entries = await db.all<LinkEntry[]>(
    `SELECT * FROM Link WHERE id > ? ORDER BY id ASC LIMIT ?`,
    afterId,
    pagination.size + 1
  );

  const items = entries.map((value) => ({
    value,
    cursor: encodeCursor(value),
  }));

  return createPage(items, pagination.size);
}

export async function getLinkByUuid(uuid: string) {
  return await db.get<LinkEntry>("SELECT * FROM Link WHERE uuid = ? LIMIT 1", [
    uuid,
  ]);
}

async function updateLink(existing: LinkEntry, values: InputLinkEntry) {
  const next = { ...existing, ...values };
  if (
    next.rank === existing.rank &&
    next.uuid === existing.uuid &&
    next.flags === existing.flags
  ) {
    logger.debug("skipped linking, all values are the same");
    return;
  }

  await db.run(
    "UPDATE Link SET uuid = ?, rank = ?, flags = ? WHERE discordId = ?",
    [next.uuid, next.rank, next.flags, next.discordId]
  );

  const prettyFlags = next.flags.toString(2).padStart(8, "0");
  logger.debug(
    `updated ${next.discordId} <-> ${next.uuid} (${next.rank}/${prettyFlags})`
  );
}

export async function persistLink(link: InputLinkEntry) {
  const existing = await getLinkByDiscordId(link.discordId);

  if (existing) {
    await updateLink(existing, link);
  } else {
    try {
      await db.run(
        "INSERT INTO Link (discordId, uuid, rank) VALUES (?, ?, ?)",
        [link.discordId, link.uuid, link.rank]
      );
    } catch (ex) {
      throw resolveError(ex);
    }

    logger.debug(`linked ${link.discordId} <-> ${link.uuid} (${link.rank})`);
  }
}

async function requireLink(discordId: string) {
  const link = await getLinkByDiscordId(discordId);
  if (link) return link;
  throw new UserError("you have not linked your minecraft account yet");
}

export async function addFlags(discordId: string, ...flags: Flag[]) {
  const link = await requireLink(discordId);
  await updateLink(link, withFlags(link, ...flags));
}

export async function updateRank(discordId: string, rank: number) {
  const link = await requireLink(discordId);
  await updateLink(link, { ...link, rank });
}

export async function loadSupporterRoles() {
  return await db.all<RoleEntry[]>("SELECT * FROM Role ORDER BY rank DESC");
}

export async function containsAdminRole(roles: string[]) {
  const { count } = await db.get(
    `SELECT COUNT(*) count FROM Role WHERE isAdmin = TRUE AND id IN (${repeat(
      "?",
      roles.length
    )})`,
    ...roles
  );

  return count > 0;
}

export async function truncateLinks() {
  await db.run(`DELETE FROM Link WHERE 1`);
}
