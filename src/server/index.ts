import { Hono } from "hono";
import { connectDatabase } from "./database";
import { middlewares } from "./middlewares";
import { routes } from "./routes";
import { serve } from "@hono/node-server";
import { errorHandler, notFoundHandler } from "./utils/exception";

const app = new Hono({ strict: false });

app.use(...middlewares);
app.route("/", routes);

app.notFound(notFoundHandler);
app.onError(errorHandler);

serve({ fetch: app.fetch, port: 4000 }, () =>
  connectDatabase(() => console.log("🚀 Server running on port 4000"))
);
