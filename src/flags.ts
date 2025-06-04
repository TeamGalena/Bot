import type { LinkEntry } from "./database";

const Flags = {
  pride: 0,
  anniversary: 1,
};

export type Flag = keyof typeof Flags;

export function withFlag(link: LinkEntry, flag: Flag): LinkEntry {
  const mask = 1 << Flags[flag];
  const flags = link.flags | mask;
  return { ...link, flags };
}

export function isFlag(flag: string): flag is Flag {
  return flag in Flags;
}

export function flagQuery(flag: Flag) {
  if (!isFlag(flag)) throw new Error(`unknown flag ${flag}`);
  const mask = 1 << Flags[flag];
  return `(flags & ${mask} != 0)`;
}

export function extractFlags(mask: number): Flag[] {
  return Object.keys(Flags)
    .map((it) => it as Flag)
    .filter((flag) => {
      const flagMask = 1 << Flags[flag];
      return (flagMask & mask) !== 0;
    });
}
