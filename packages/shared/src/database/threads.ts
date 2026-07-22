import { db } from "./connection";

export type AuthThreadingOptions = {
  id: string;
  requiresLink: boolean;
};

export async function getAutoThreadingOptions(channelId: string) {
  return await db.get<AuthThreadingOptions>(
    "SELECT * FROM AutoThreading WHERE id = ?",
    [channelId],
  );
}
