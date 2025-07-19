import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiFormatMiddleware } from "./response";
import { prettyJSON } from "hono/pretty-json";

export const middlewares = [
  compress(),
  cors(),
  logger(),
  apiFormatMiddleware,
  prettyJSON({ space: 4, query: "pretty" }),
];
