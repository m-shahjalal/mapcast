import { ApiPagination, HttpStatusCode } from "@/types/api-response";
import { AppError } from "../server/utils/exception";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../server/schemas";
import { Database } from "@/server/database";

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
