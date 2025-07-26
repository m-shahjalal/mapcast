import { HttpStatusCode } from "@/types/api-response";

export const ERROR_CODE_MAP: Record<string, HttpStatusCode> = {
  VALIDATION_ERROR: 422,
  INVALID_INPUT: 422,
  NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  INVALID_TOKEN: 401,
  FORBIDDEN: 403,
  INSUFFICIENT_PERMISSIONS: 403,
  CONFLICT: 409,
  DUPLICATE_RESOURCE: 409,
  RATE_LIMIT_EXCEEDED: 429,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGE_MAP: Record<string, string> = {
  422: "Validation error",
  404: "Resource not found",
  401: "Unauthorized",
  403: "Forbidden",
  409: "Conflict",
  429: "Rate limit exceeded",
  500: "Internal server error",
  502: "Bad gateway",
  503: "Service unavailable",
  504: "Gateway timeout",
} as const;
