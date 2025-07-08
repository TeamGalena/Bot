import { UserError } from "../error";
import { db } from "./connection";

export type ModEntry = {
  name: string;
  icon?: string;
  color: `#${string}`;
  description?: string;
  repository: string;
  curseforgeSlug?: string;
  modrinthSlug?: string;
};

export async function getModBySearch(search: string) {
  const pattern = `%${search}%`;
  const mod = await db.get<ModEntry>(
    "SELECT * FROM ModInfo WHERE id LIKE ? OR name LIKE ? COLLATE NOCASE",
    [pattern, pattern]
  );
  if (mod) return mod;
  throw new UserError(`Cannot find any mod named '${search}'`);
}

export async function getMods() {
  return await db.all<ModEntry[]>(
    "SELECT * FROM ModInfo ORDER BY name LIMIT 20"
  );
}
