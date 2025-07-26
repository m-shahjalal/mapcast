import { Hono } from "hono";
import { handle } from "hono/vercel";
import { rssRoutes } from "./rss-route";
import { newsRoutes } from "./news-route";
import { middlewares } from "@/utils/middlewares";
import { errorHandler, notFoundHandler } from "@/utils/exception";

const app = new Hono().basePath("/api");
app.get("/health", (c) => c.json({ status: "ok" }));

middlewares(app);
rssRoutes(app);
newsRoutes(app);

notFoundHandler(app);
errorHandler(app);

const h = handle(app);
export { h as DELETE, h as GET, h as PATCH, h as POST, h as PUT, h as OPTIONS };
