import { Hono } from "hono";
import rssRoutes from "./rss.route";
import newsRoutes from "./news.route";
import { cronRoutes } from "../jobs/run-rss";

const routes = new Hono();

routes.get("/", (c) => c.json({ message: "Welcome to the API!" }));
routes.get("/health", (c) => c.json({ status: "ok" }));

routes.route("/rss", rssRoutes);
routes.route("/news", newsRoutes);
routes.route("/cron", cronRoutes);

export { routes };
