import type { User } from "../user";
import { now } from "../util";
import { db } from "./connection";

export type InputAuditEntry = {
  user: User;
  action: string;
  subject: string;
};

export type AuditEntry = InputAuditEntry & {
  date: string;
};

export async function addAudit({ action, user, subject }: InputAuditEntry) {
  await db.run(
    `INSERT INTO AuditLog (user, action, subject, date) VALUES (?, ?, ?, ?)`,
    [user.username, action, subject, now()]
  );
}

export async function getAuditLog() {
  return await db.all<AuditEntry[]>(
    "SELECT * FROM AuditLog ORDER BY date DESC LIMIT 100"
  );
}
