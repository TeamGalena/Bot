class ConfigurationError extends Error {}

export function requireEnv(key: string) {
  const value = process.env[key];
  if (value) return value;
  throw new ConfigurationError(`Missing environment variable '${key}'`);
}

export function optionalEnv(key: string) {
  try {
    return requireEnv(key);
  } catch {
    return null;
  }
}
