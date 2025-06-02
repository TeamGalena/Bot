import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { UserError } from "./error";
import logger from "./logger";

const db = await open({
  filename: "database.db",
  driver: sqlite3.Database,
});

await db.migrate();
logger.info("migrated database");

export type LinkEntry = {
  discordId: string;
  uuid: string;
  rank: number;
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

async function updateLink(existing: LinkEntry, values: LinkEntry) {
  if (values.rank === existing.rank && values.uuid === existing.uuid) {
    logger.debug("skipped linking, all values are the same");
    return;
  }

  await db.run("UPDATE Link SET uuid = ?, rank = ? WHERE discordId = ?", [
    values.uuid,
    values.rank,
    values.discordId,
  ]);

  logger.debug(
    `updated ${values.discordId} <-> ${values.uuid} (${values.rank})`
  );
}

export async function persistLink(link: LinkEntry) {
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

export async function updateRank(discordId: string, rank: number) {
  const link = await getLinkByDiscordId(discordId);
  if (!link)
    throw new UserError("you have not linked your minecraft account yet");

  await updateLink(link, { ...link, rank });
}

export async function loadSupporterUuids(aboveRank: number) {
  const entries = await db.all<LinkEntry[]>(
    "SELECT uuid FROM Link WHERE rank >= ? LIMIT 100",
    [aboveRank]
  );
  return entries.map((it) => it.uuid);
}

export async function loadSupporterRoles() {
  return await db.all<RoleEntry[]>("SELECT * FROM Role ORDER BY rank DESC");
}
