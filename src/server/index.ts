// server/index.ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { connectDatabase } from "./database";
import { middlewares } from "./middlewares";
import { routes } from "./routes";
import { errorHandler, notFoundHandler } from "./utils/exception";

const app = new Hono({ strict: false });

app.use(...middlewares);
const api = app.route("/", routes);

app.notFound(notFoundHandler);
app.onError(errorHandler);

connectDatabase(() =>
  serve({ fetch: app.fetch, port: 4000 }, (i) => {
    console.info(`🚀 Server is running on http://localhost:${i.port}`);
  })
);

// Make sure this export is correct
export { app };
export type AppType = typeof api;
