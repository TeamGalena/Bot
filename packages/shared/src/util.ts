export function repeat(char: string, count: number, seperator = ",") {
  return new Array(count).fill(char).join(seperator);
}

export function now() {
  return new Date().toISOString();
}
