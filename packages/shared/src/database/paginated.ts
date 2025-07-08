import type { Page, Paginated } from "../paginated";

export function createPage<T>(
  items: Paginated<T>[],
  size: number,
  total: number
): Page<T> {
  if (items.length > size) {
    return {
      items: items.slice(1),
      pageInfo: {
        size,
        total,
        next: items[items.length - 1].cursor,
      },
    };
  } else {
    return {
      items,
      pageInfo: {
        total,
        size: items.length,
      },
    };
  }
}
