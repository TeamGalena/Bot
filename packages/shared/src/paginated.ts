type Cursor = string;

export type Paginated<T> = {
  value: T;
  cursor: Cursor;
};

export type Page<T> = {
  items: Paginated<T>[];
  pageInfo: PageInfo;
};

export type PageInfo = {
  next?: Cursor;
  size: number;
  total: number;
};

export type Pagination = {
  after?: Cursor;
  size: number;
};
