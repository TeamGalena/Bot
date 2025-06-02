import dotenv from "dotenv";

dotenv.config();

class ConfigurationError extends Error {}

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (value) return value;
  throw new ConfigurationError(`environment variable '${key} missing'`);
};

export const config = {
  applicationId: requireEnv("APPLICATION_ID"),
  publicKey: requireEnv("PUBLIC_KEY"),
  botToken: requireEnv("BOT_TOKEN"),
};
