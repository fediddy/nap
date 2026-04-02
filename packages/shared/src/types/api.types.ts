export interface ApiResponse<T> {
  data: T;
  meta: { count?: number };
}

export interface ApiError {
  error: true;
  code: string;
  message: string;
  details?: Array<{ field: string; issue: string }>;
}
