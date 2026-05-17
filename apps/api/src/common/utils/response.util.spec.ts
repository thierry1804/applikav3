import { sliceForPagination, toPaginatedMeta } from './response.util';

describe('toPaginatedMeta', () => {
  it('returns hasMore true and nextCursor when result has more items', () => {
    const result = { data: [{ id: '1' }, { id: '2' }], nextCursor: '2' };
    const meta = toPaginatedMeta(result, 1);
    expect(meta).toEqual({ nextCursor: '2', hasMore: true, total: null });
  });

  it('returns hasMore false when result fits within limit', () => {
    const result = { data: [{ id: '1' }], nextCursor: null };
    const meta = toPaginatedMeta(result, 10);
    expect(meta).toEqual({ nextCursor: null, hasMore: false, total: null });
  });
});

describe('sliceForPagination', () => {
  const items = [{ id: '1' }, { id: '2' }, { id: '3' }];

  it('slices items and sets nextCursor when more items exist', () => {
    const result = sliceForPagination(items, 2);
    expect(result.data).toEqual([{ id: '1' }, { id: '2' }]);
    expect(result.nextCursor).toBe('2');
  });

  it('returns all items and null nextCursor when within limit', () => {
    const result = sliceForPagination(items, 5);
    expect(result.data).toEqual(items);
    expect(result.nextCursor).toBeNull();
  });

  it('returns null nextCursor for empty array', () => {
    const result = sliceForPagination([], 10);
    expect(result.data).toEqual([]);
    expect(result.nextCursor).toBeNull();
  });
});
