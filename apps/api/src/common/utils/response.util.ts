import type { PaginatedMeta } from '@dogapp/types';

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
}

export function toPaginatedMeta(result: PaginatedResult<unknown>, limit: number): PaginatedMeta {
  const hasMore = result.data.length > limit;
  return {
    nextCursor: result.nextCursor,
    hasMore,
    total: null,
  };
}

export function sliceForPagination<T extends { id: string }>(
  items: T[],
  limit: number,
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const last = data.at(-1);
  return {
    data,
    nextCursor: hasMore && last ? last.id : null,
  };
}
