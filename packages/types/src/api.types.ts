export interface PaginatedMeta {
  nextCursor: string | null;
  hasMore: boolean;
  total?: number | null;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginatedMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}
