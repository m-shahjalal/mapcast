import { newsSourceSchema } from "@/database/schemas";
import { RSSBatchProcessor } from "@/lib/rss-processor";
import { NewsSourceService } from "@/services/rss.service";
import { newsSourceFiltersSchema } from "@/utils/validator";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { BlankEnv, BlankSchema } from "hono/types";
import { NextResponse } from "next/server";

export const rssRoutes = (app: Hono<BlankEnv, BlankSchema, "/">) => {
  app.get("/rss", zValidator("query", newsSourceFiltersSchema), async (c) => {
    const result = await NewsSourceService.getAll(c.req.valid("query"));
    return c.apiJson(result.data, { pagination: result.pagination });
  });

  app.post("/rss", zValidator("json", newsSourceSchema), async (c) => {
    const source = await NewsSourceService.create(c.req.valid("json"));
    return c.apiCreated({ source });
  });

  app.get("/rss/trigger", async (c) => {
    const params = c.req.query();
    const batchIndex = parseInt(params.batch);
    const result = await RSSBatchProcessor.processBatch(batchIndex, "api");

    return NextResponse.json(result);
  });

  return app;
};
