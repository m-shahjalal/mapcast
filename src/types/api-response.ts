import { newsTopicEnum } from "@/server/database/schemas";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T | null;
  message?: string;
  error?: ApiError | null;
  timestamp?: string;
  statusCode?: HttpStatusCode;
  pagination?: ApiPagination;
}

export interface ApiPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  timestamp?: string;
}

export type HttpStatusCode =
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503 // Service Unavailable
  | 504; // Gateway Timeout

export type SourceStatus =
  | "all"
  | "active"
  | "inactive"
  | "error"
  | "maintenance";
export type NewsTopic = (typeof newsTopicEnum.enumValues)[number];

export interface SourceFilters {
  search?: string;
  topic?: NewsTopic | "all";
  status?: SourceStatus;
  country?: string;
  language?: string;
  isActive?: boolean;
}
