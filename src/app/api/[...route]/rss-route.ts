import { newsSourceSchema } from "@/database/schemas";
import { runRSSJob } from "@/lib/rss-feed-runner";
import { NewsSourceService } from "@/services/rss.service";
import { newsSourceFiltersSchema } from "@/utils/validator";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { BlankEnv, BlankSchema } from "hono/types";

export const rssRoutes = (app: Hono<BlankEnv, BlankSchema, "/">) => {
  app.get("/rss", zValidator("query", newsSourceFiltersSchema), async (c) => {
    const result = await NewsSourceService.getAll(c.req.valid("query"));
    return c.apiJson(result.data, { pagination: result.pagination });
  });

  app.post("/rss", zValidator("json", newsSourceSchema), async (c) => {
    const source = await NewsSourceService.create(c.req.valid("json"));
    return c.apiCreated({ source });
  });

  app.get("/rss/trigger", async (c) => await runRSSJob());

  return app;
};
