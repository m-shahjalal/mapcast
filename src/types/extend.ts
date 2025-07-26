import { Database } from "@/database";
import { ApiPagination, HttpStatusCode } from "@/types/api-response";
import { AppError } from "../utils/exception";

export type JsonOptions = {
  statusCode?: HttpStatusCode;
  message?: string;
  pagination?: ApiPagination;
};

declare module "hono" {
  interface Context {
    db: Database;

    apiJson<T>(data: T, options?: JsonOptions): Promise<Response>;

    apiError(error: AppError): Promise<Response>;
    apiSuccess<T>(data: T, message?: string): Promise<Response>;
    apiCreated<T>(data: T, message?: string): Promise<Response>;
    apiNoContent(): Promise<Response>;
  }
}
