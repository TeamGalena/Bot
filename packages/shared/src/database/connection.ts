import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { optionalEnv } from "../config";
import logger from "../logger";

const migrationsPath = optionalEnv("MIGRATIONS_PATH") ?? "/migrations";
const dataPath = optionalEnv("DATA_PATH") ?? "/data/database.db";

export async function migrateDatabase() {
  logger.debug(`searching for migrations in ${migrationsPath}`);
  await db.migrate({ migrationsPath });
  logger.info("migrated database");
}

logger.debug(`Loading database in ${dataPath}`);

export const db = await open({
  filename: dataPath,
  driver: sqlite3.Database,
});

export async function truncateDatabase() {
  await db.run(`DELETE FROM Link WHERE 1`);
  await db.run(`DELETE FROM AuditLog WHERE 1`);
}
