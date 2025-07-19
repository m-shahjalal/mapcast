import { HttpStatusCode } from "@/types/api-response";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export const errorHandler = (err: Error | HTTPException, c: Context) => {
  console.error("Error handler triggered:", {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString(),
  });

  // Helper function to use apiJson if available, otherwise fallback to regular json
  const respondWithError = (data: {
    message?: string;
    name?: string;
    statusCode?: HttpStatusCode;
    error?: string;
    code?: string;
    errors?: any[];
    details?: any;
  }) => {
    return c.apiError({
      message: data.message || data.error || data.name || "An error occurred",
      statusCode: data.statusCode || 500,
      name: data.code || data.name || "API_ERROR",
      details: data.details,
    });
  };

  // Handle non-HTTP exceptions (generic errors)
  if (!(err instanceof HTTPException)) {
    const errorMessage = err.message || err.toString();
    console.error("Generic error:", errorMessage);

    // Check if it's a custom error with statusCode
    const statusCode = (err as any).statusCode || (err as any).status || 500;
    const errorCode = (err as any).code || "INTERNAL_ERROR";

    return respondWithError({
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      statusCode,
      message: errorMessage,
      name: errorCode,
    });
  }

  // Handle Zod validation errors
  if (err.cause instanceof ZodError) {
    const validationErrors = err.cause.issues.map((issue) => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
      code: issue.code,
    }));

    return respondWithError({
      error: "Validation failed",
      message: "Request body validation failed",
      code: "VALIDATION_ERROR",
      errors: validationErrors,
      details:
        "Check that you're sending all required fields with correct types",
      statusCode: 400,
    });
  }

  // Handle generic validation errors with issues property
  if (err.cause && typeof err.cause === "object" && "issues" in err.cause) {
    const validationErrors = (err.cause as any).issues.map((issue: any) => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
      code: issue.code,
      received: issue.received,
    }));

    return respondWithError({
      error: "Validation failed",
      message: "Request body validation failed",
      code: "VALIDATION_ERROR",
      errors: validationErrors,
      details: err.res,
      statusCode: 400,
    });
  }

  // Handle specific HTTP status codes
  switch (err.status) {
    case 400:
      return respondWithError({
        error: "Bad Request",
        message:
          "Invalid request. Please check your request body and ensure all required fields are provided.",
        code: "BAD_REQUEST",
        details: err.message || "Request validation failed",
        statusCode: 400,
      });

    case 401:
      return respondWithError({
        error: "Unauthorized",
        message: "Authentication required or invalid credentials provided.",
        code: "UNAUTHORIZED",
        details:
          err.message || "Please provide valid authentication credentials",
        statusCode: 401,
      });

    case 403:
      return respondWithError({
        error: "Forbidden",
        message: "You don't have permission to access this resource.",
        code: "FORBIDDEN",
        details: err.message || "Insufficient permissions",
        statusCode: 403,
      });

    case 404:
      return respondWithError({
        error: "Not Found",
        message: "The requested resource was not found.",
        code: "NOT_FOUND",
        details: err.message || "Resource does not exist",
        statusCode: 404,
      });

    case 409:
      return respondWithError({
        error: "Conflict",
        message: "Request conflicts with current state of the resource.",
        code: "CONFLICT",
        details: err.message || "Resource already exists or state conflict",
        statusCode: 409,
      });

    case 422:
      return respondWithError({
        error: "Unprocessable Entity",
        message: "Request body contains invalid data.",
        code: "UNPROCESSABLE_ENTITY",
        details: err.message || "Data validation failed",
        statusCode: 422,
      });

    case 429:
      return respondWithError({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        details: err.message || "Too many requests in a short period",
        statusCode: 429,
      });

    case 500:
      return respondWithError({
        error: "Internal Server Error",
        message: "An unexpected error occurred on the server.",
        code: "INTERNAL_SERVER_ERROR",
        details:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Please try again later",
        statusCode: 500,
      });

    case 502:
      return respondWithError({
        error: "Bad Gateway",
        message: "Invalid response from upstream server.",
        code: "BAD_GATEWAY",
        details: err.message || "Service temporarily unavailable",
        statusCode: 502,
      });

    case 503:
      return respondWithError({
        error: "Service Unavailable",
        message: "Service is temporarily unavailable.",
        code: "SERVICE_UNAVAILABLE",
        details: err.message || "Please try again later",
        statusCode: 503,
      });

    default:
      // Map any unhandled status code to 500 to ensure type safety
      const errorStatus: HttpStatusCode = 500;
      return respondWithError({
        error: err.message || `HTTP ${err.status} Error`,
        code: `HTTP_${err.status}`,
        details: "An HTTP error occurred",
        statusCode: errorStatus,
      });
  }
};

export const notFoundHandler = (c: Context) => {
  const path = c.req.path;
  const method = c.req.method;

  return c.apiError({
    message: `Route ${method} ${path} not found`,
    statusCode: 404,
    code: "NOT_FOUND",
    name: "NOT_FOUND",
  });
};

export class AppError extends Error {
  public statusCode: HttpStatusCode;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: HttpStatusCode = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || `HTTP_${statusCode}`;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, "BAD_REQUEST");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
  }
}
