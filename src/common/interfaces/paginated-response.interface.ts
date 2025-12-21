export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
  message: string
  status: number
}

export interface ApiResponse<T> {
  data: T
  message: string
  status: number
  errors?: string[]
}

