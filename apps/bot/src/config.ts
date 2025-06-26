import dotenv from "@dotenvx/dotenvx";
import { requireEnv } from "@teamgalena/shared/config";

dotenv.config({ convention: "flow" });

export const config = {
  applicationId: requireEnv("APPLICATION_ID"),
  publicKey: requireEnv("PUBLIC_KEY"),
  botToken: requireEnv("BOT_TOKEN"),
};
