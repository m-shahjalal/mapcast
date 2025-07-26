import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiFormatMiddleware } from "./response";
import { prettyJSON } from "hono/pretty-json";
import { contextStorage } from "hono/context-storage";

const list = [
  compress(),
  cors(),
  logger(),
  apiFormatMiddleware,
  prettyJSON({ space: 4, query: "pretty" }),
  contextStorage(),
];

export const middlewares = (hono: any) => {
  list.forEach((middleware) => hono.use(middleware));
};
