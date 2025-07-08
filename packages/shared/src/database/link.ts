import { createErrorWrapper, UserError } from "../error";
import { createFlags, flagQuery, withFlags, type Flag } from "../flags";
import logger from "../logger";
import type { Page, Pagination } from "../paginated";
import type { User } from "../user";
import { now } from "../util";
import { addAudit } from "./audit";
import { db } from "./connection";
import { createPage } from "./paginated";

const wrapError = createErrorWrapper((ex) => {
  if (!("code" in ex)) return ex;
  if (ex.code === "SQLITE_CONSTRAINT")
    return new UserError(
      "this minecraft uuid is already linked to another account"
    );

  return ex;
});

export type InputLinkEntry = {
  discordId: string;
  uuid: string;
  rank: number;
  flags?: number | Flag[] | Flag;
};

export type LinkEntry = InputLinkEntry & {
  id: number;
  createdAt: string;
  updatedAt: string;
  flags: number;
};

export type LinkFilter = {
  search?: string;
  flag?: Flag;
};

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
      "UPDATE Link SET uuid = ?, rank = ?, flags = ?, updatedAt = ? WHERE discordId = ?",
      [next.uuid, next.rank, next.flags, now(), next.discordId]
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
  if (typeof flags === "number") return flags;
  if (Array.isArray(flags)) return createFlags(...flags);
  if (!flags) return createFlags();
  return createFlags(flags);
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

export async function deleteLinkByDiscordId(discordId: string, user: User) {
  await db.run(`DELETE FROM Link WHERE discordId = ?`, [discordId]);
  await addAudit({ user, action: "delete_link", subject: discordId });
}
