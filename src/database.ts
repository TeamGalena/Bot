import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { UserError } from "./error";
import { flagQuery, withFlag, type Flag } from "./flags";
import logger from "./logger";

const db = await open({
  filename: "data/database.db",
  driver: sqlite3.Database,
});

await db.migrate();
logger.info("migrated database");

export type LinkEntry = {
  discordId: string;
  uuid: string;
  rank: number;
  flags: number;
};

type InputLinkEntry = Omit<LinkEntry, "flags"> & Partial<LinkEntry>;

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

export async function getLinkByUuid(uuid: string) {
  return await db.get<LinkEntry>("SELECT * FROM Link WHERE uuid = ?", [uuid]);
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

export async function addFlag(discordId: string, flag: Flag) {
  const link = await requireLink(discordId);
  await updateLink(link, withFlag(link, flag));
}

export async function updateRank(discordId: string, rank: number) {
  const link = await requireLink(discordId);
  await updateLink(link, { ...link, rank });
}

export async function loadSupporterUuids(aboveRank: number) {
  const entries = await db.all<LinkEntry[]>(
    "SELECT uuid FROM Link WHERE rank >= ? LIMIT 100",
    [aboveRank]
  );
  return entries.map((it) => it.uuid);
}

export async function loadFlaggedUuids(flag: Flag) {
  const entries = await db.all<LinkEntry[]>(
    `SELECT uuid FROM Link WHERE ${flagQuery(flag)}`
  );
  return entries.map((it) => it.uuid);
}

export async function loadSupporterRoles() {
  return await db.all<RoleEntry[]>("SELECT * FROM Role ORDER BY rank DESC");
}
