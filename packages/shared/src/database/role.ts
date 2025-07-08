import { repeat } from "../util";
import { db } from "./connection";

export type RoleEntry = {
  id: string;
  rank: number;
};

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
