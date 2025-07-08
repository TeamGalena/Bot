/* eslint-disable no-console */

import chalk from "chalk";

export type Logger = {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string, exception?: unknown): void;
};

const logger: Logger = {
  debug: (it) => console.log(chalk.blue(it)),
  info: (it) => console.log(it),
  warn: (it) => console.warn(chalk.yellow(it)),
  error: (it, ...exception) => console.error(chalk.red(it), ...exception),
};

export default logger;
