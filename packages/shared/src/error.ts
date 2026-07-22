import logger from "./logger";

export class UserError extends Error {}

export function wrapCatching<T extends unknown[]>(
  func: (...args: T) => void | Promise<void>,
) {
  return async (...args: T) => {
    try {
      await func(...args);
    } catch (ex) {
      logger.error(`Encountered an error executing ${func.name}`, ex);
    }
  };
}

function wrapError<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => Promise<TReturn>,
  resolver: (ex: Error) => Error,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await func(...args);
    } catch (cause) {
      if (cause instanceof Error) throw resolver(cause);
      else throw new Error(cause?.toString(), { cause });
    }
  };
}

export function createErrorWrapper(resolver: (ex: Error) => Error) {
  return <TArgs extends unknown[], TReturn>(
    func: (...args: TArgs) => Promise<TReturn>,
  ) => wrapError(func, resolver);
}
