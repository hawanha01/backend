import { PaginatedResponse } from '../interfaces/paginated-response.interface';

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    message: 'Success',
    status: 200,
  };
}
