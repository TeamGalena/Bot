export function repeat(char: string, count: number, seperator = ",") {
  return new Array(count).fill(char).join(seperator);
}

export function now() {
  return new Date().toISOString();
}

export function unique<T>(array: T[]) {
  return array.filter(
    (v1, i1) => !array.some((v2, i2) => i1 < i2 && v1 === v2)
  );
}

export function hasDuplicates<T>(array: T[]) {
  return unique(array).length !== array.length;
}
