import { ApiResponse } from '../interfaces/paginated-response.interface';

export function createResponse<T>(
  data: T,
  message = 'Success',
  status = 200,
): ApiResponse<T> {
  return {
    data,
    message,
    status,
  };
}
