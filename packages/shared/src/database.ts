import { join } from "path";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { optionalEnv } from "./config";
import { UserError } from "./error";
import { createFlags, flagQuery, withFlags, type Flag } from "./flags";
import logger from "./logger";
import type { Page, Paginated, Pagination } from "./paginated";
import type { User } from "./user";
import { repeat } from "./util";

const migrationsPath = optionalEnv("MIGRATIONS_PATH") ?? "/migrations";
const dataPath = optionalEnv("DATA_PATH") ?? "/data";

export async function migrateDatabase() {
  logger.debug(`searching for migrations in ${migrationsPath}`);
  await db.migrate({ migrationsPath });
  logger.info("migrated database");
}

logger.debug(`Loading database in ${dataPath}`);

const db = await open({
  filename: join(dataPath, "database.db"),
  driver: sqlite3.Database,
});

export type InputLinkEntry = {
  discordId: string;
  uuid: string;
  rank: number;
  flags?: number | Flag[];
};

export type LinkEntry = InputLinkEntry & {
  id: number;
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
    return new UserError(
      "this minecraft uuid is already linked to another account"
    );

  return ex;
}

function wrapError<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await func(...args);
    } catch (ex) {
      throw resolveError(ex);
    }
  };
}

export async function getLinkByDiscordId(discordId: string) {
  return await db.get<LinkEntry>("SELECT * FROM Link WHERE discordId = ?", [
    discordId,
  ]);
}

function encodeCursor(entry: LinkEntry) {
  return btoa(`link-${entry.id.toString()}`);
}

function decodeCursor(cursor?: string) {
  if (!cursor) return 0;
  const decoded = atob(cursor).substring("link-".length);
  const parsed = Number.parseInt(decoded);
  if (isNaN(parsed)) return 0;
  return parsed;
}

function createPage<T>(
  items: Paginated<T>[],
  size: number,
  total: number
): Page<T> {
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

export type LinkFilter = {
  search?: string;
  flag?: Flag;
};

export async function getLinks(
  pagination: Pagination,
  filter: LinkFilter = {}
): Promise<Page<LinkEntry>> {
  const afterId = decodeCursor(pagination.after);

  const terms: string[] = ["TRUE"];
  const params: string[] = [];

  if (filter.search) {
    terms.push(`(uuid LIKE ?) OR (uuid LIKE ?)`);
    const pattern = `%${filter.search}%`;
    params.push(pattern);
    params.push(pattern);
  }
  if (filter.flag) terms.push(flagQuery(filter.flag));

  const query = terms.map((it) => `(${it})`).join(" AND ");
  logger.debug(query);

  const { total } = await db.get(
    `SELECT COUNT(*) total FROM Link WHERE ${query}`
  );

  const entries = await db.all<LinkEntry[]>(
    `SELECT * FROM Link WHERE id >= ? AND ${query} ORDER BY id ASC LIMIT ?`,
    afterId,
    ...params,
    pagination.size + 1
  );

  const items = entries.map((value) => ({
    value,
    cursor: encodeCursor(value),
  }));

  return createPage(items, pagination.size, total);
}

export async function getLinkByUuid(uuid: string) {
  return await db.get<LinkEntry>("SELECT * FROM Link WHERE uuid = ? LIMIT 1", [
    uuid,
  ]);
}

export const updateLink = wrapError(
  async (existing: LinkEntry, values: InputLinkEntry, user: User) => {
    const next = { ...existing, ...values };
    next.flags = resolveFlags(next.flags);
    if (
      next.rank === existing.rank &&
      next.uuid === existing.uuid &&
      next.flags === existing.flags
    ) {
      logger.debug("skipped linking, all values are the same");
      return;
    }

    await db.run(
      "UPDATE Link SET uuid = ?, rank = ?, flags = ?, updatedAt = datetime('now') WHERE discordId = ?",
      [next.uuid, next.rank, next.flags, next.discordId]
    );

    await addAudit({
      user,
      action: "update_link",
      subject: existing.discordId,
    });

    const prettyFlags = next.flags.toString(2).padStart(8, "0");
    logger.debug(
      `updated ${next.discordId} <-> ${next.uuid} (${next.rank}/${prettyFlags})`
    );
  }
);

function resolveFlags(flags: InputLinkEntry["flags"]): number {
  return typeof flags === "number" ? flags : createFlags(...(flags ?? []));
}

export const insertLink = wrapError(
  async (link: InputLinkEntry, user: User) => {
    await db.run(
      "INSERT INTO Link (discordId, uuid, rank, flags) VALUES (?, ?, ?, ?)",
      [link.discordId, link.uuid, link.rank, resolveFlags(link.flags)]
    );

    await addAudit({ user, action: "create_link", subject: link.discordId });
  }
);

export async function persistLink(link: InputLinkEntry, user: User) {
  const existing = await getLinkByDiscordId(link.discordId);

  if (existing) {
    await updateLink(existing, link, user);
  } else {
    await insertLink(link, user);

    logger.debug(`linked ${link.discordId} <-> ${link.uuid} (${link.rank})`);
  }
}

async function requireLink(discordId: string) {
  const link = await getLinkByDiscordId(discordId);
  if (link) return link;
  throw new UserError("you have not linked your minecraft account yet");
}

export async function addFlags(discordId: string, flags: Flag[], user: User) {
  const link = await requireLink(discordId);
  await updateLink(link, withFlags(link, ...flags), user);
}

export async function updateRank(discordId: string, rank: number, user: User) {
  const link = await requireLink(discordId);
  await updateLink(link, { ...link, rank }, user);
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

export async function deleteLinkByDiscordId(discordId: string, user: User) {
  await db.run(`DELETE FROM Link WHERE discordId = ?`, [discordId]);
  await addAudit({ user, action: "delete_link", subject: discordId });
}

export async function truncateLinks() {
  await db.run(`DELETE FROM Link WHERE 1`);
}

type InputAuditEntry = {
  user: User;
  action: string;
  subject: string;
};

type AuditEntry = InputAuditEntry & {
  date: string;
};

async function addAudit({ action, user, subject }: InputAuditEntry) {
  await db.run(
    `INSERT INTO AuditLog (user, action, subject) VALUES (?, ?, ?)`,
    [user.username, action, subject]
  );
}

export async function getAuditLog() {
  return await db.all<AuditEntry[]>(
    "SELECT * FROM AuditLog ORDER BY date DESC LIMIT 100"
  );
}
