export function requireEnv(key: string) {
  const value = import.meta.env[key];
  if (value) return value;
  throw new Error(`Missing environment variable '${key}'`);
}

export function optionalEnv(key: string) {
  try {
    return requireEnv(key);
  } catch {
    return null;
  }
}
