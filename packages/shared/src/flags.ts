import type { LinkEntry } from "./database";

const Flags = {
  pride: 0,
  anniversary: 1,
  gilded: 3,
  mehvahdjukaar: 2,
  tuccut: 3,
};

export type Flag = keyof typeof Flags;

export const SUPPORTER_FLAGS: Flag[] = ["pride"];

export const FLAGS = Object.keys(Flags) as Flag[];

export function createFlags(...values: Flag[]) {
  if (values.length === 0) return 0;
  const masks = values.map((it) => 1 << Flags[it]);
  return masks.reduce((a, b) => a | b);
}

export function withFlags(link: LinkEntry, ...added: Flag[]): LinkEntry {
  if (added.length === 0) return link;
  const flags = link.flags | createFlags(...added);
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
