import { createMiddleware } from "hono/factory";
import type { Context, Next } from "hono";
import {
  ApiResponse,
  ApiError,
  HttpStatusCode,
  ApiPagination,
} from "@/types/api-response";
import { JsonOptions } from "../../types/extend";
import { AppError } from "../utils/exception";

const getStatusCodeFromError = (error: any): HttpStatusCode => {
  if (error.statusCode) return error.statusCode;
  if (error.status) return error.status;

  switch (error.code) {
    case "VALIDATION_ERROR":
    case "INVALID_INPUT":
      return 422;
    case "NOT_FOUND":
    case "RESOURCE_NOT_FOUND":
      return 404;
    case "UNAUTHORIZED":
    case "INVALID_TOKEN":
      return 401;
    case "FORBIDDEN":
    case "INSUFFICIENT_PERMISSIONS":
      return 403;
    case "CONFLICT":
    case "DUPLICATE_RESOURCE":
      return 409;
    case "RATE_LIMIT_EXCEEDED":
      return 429;
    case "SERVICE_UNAVAILABLE":
      return 503;
    default:
      return 500;
  }
};

const formatSuccessResponse = <T>(
  data: T,
  statusCode: HttpStatusCode,
  message?: string,
  pagination?: ApiPagination
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  if (pagination) response.pagination = pagination;

  return response;
};

const formatErrorResponse = (err: AppError): ApiResponse<null> => {
  const timestamp = new Date().toISOString();
  const statusCode = getStatusCodeFromError(err);
  const message = err.message || "An unexpected error occurred";

  const error: ApiError = {
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "An unexpected error occurred",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp,
  };

  return {
    success: false,
    data: null,
    error,
    message,
    statusCode,
    timestamp,
  };
};

export const apiFormatMiddleware = createMiddleware(
  async (c: Context, next: Next) => {
    c.apiJson = async <T>(data: T, options?: JsonOptions) => {
      const statusCode = options?.statusCode || 200;
      const formattedResponse = formatSuccessResponse(
        data,
        statusCode,
        options?.message,
        options?.pagination
      );

      if (statusCode === 204) return new Response(null, { status: 204 });
      return c.json(formattedResponse, statusCode as any);
    };

    c.apiError = async (error: AppError) => {
      const errorResponse = formatErrorResponse(error);
      return c.json(errorResponse, errorResponse.statusCode as any);
    };

    c.apiSuccess = async <T>(data: T, message?: string) => {
      return c.apiJson(data, { statusCode: 200, message });
    };

    c.apiCreated = async <T>(data: T, message?: string) => {
      return c.apiJson(data, { statusCode: 201, message });
    };

    c.apiNoContent = async () => {
      return c.apiJson(null, { statusCode: 204 });
    };

    try {
      await next();
    } catch (error: any) {
      console.error("👹 API Error:", {
        error: error.message,
        stack: error.stack,
        path: c.req.path,
        method: c.req.method,
        timestamp: new Date().toISOString(),
      });

      const errorResponse = formatErrorResponse(error);
      return c.json(errorResponse, errorResponse.statusCode as any);
    }
  }
);
