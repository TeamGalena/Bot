class ConfigurationError extends Error {}

export function requireEnv(key: string): string {
  const env =
    process.env.NODE_ENV === "development" ? import.meta.env : process.env;

  const value = env[key];

  if (value) return value;
  throw new ConfigurationError(`Missing environment variable '${key}'`);
}

export function optionalEnv(key: string): string | null {
  try {
    return requireEnv(key);
  } catch {
    return null;
  }
}
