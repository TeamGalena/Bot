import logger from "./logger";

export class UserError extends Error {}

export function wrapCatching<T extends unknown[]>(
  func: (...args: T) => void | Promise<void>
) {
  return async (...args: T) => {
    try {
      await func(...args);
    } catch (ex) {
      logger.error(`Encountered an error executing ${func.name}`, ex);
    }
  };
}
