import logger from "@teamgalena/shared/logger";

const CACHE: Record<string, unknown> = {};

async function set(key: string, value: unknown) {
  CACHE[key] = value;
}

async function get<T>(key: string) {
  if (key in CACHE) return CACHE[key] as T;
  return null;
}

async function computeIfAbsent<T>(
  key: string,
  supplier: () => T | null | Promise<T | null>
) {
  const cached = await get<T>(key);
  if (cached) {
    logger.debug(`cache hit for ${key}`);
    return cached;
  }

  try {
    const computed = await supplier();
    if (computed) set(key, computed);
    return computed;
  } catch (e) {
    logger.error(`encountered error when computing cache`, e);
    return null;
  }
}

const cache = {
  set,
  get,
  computeIfAbsent,
} as const;

export default cache;
