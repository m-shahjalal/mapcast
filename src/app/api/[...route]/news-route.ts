import { Hono } from "hono";
import { BlankEnv, BlankSchema } from "hono/types";
import { NewsService } from "../../../services/news.service";

export const newsRoutes = (app: Hono<BlankEnv, BlankSchema, "/">) => {
  app.get("/news", async (c) => {
    const { pagination, result } = await NewsService.findAll(c.req.queries());
    return c.apiJson(result, { pagination });
  });

  app.get("/news/map", async (c) => {
    const mapData = await NewsService.getMapData(c.req.queries() as any);
    return c.apiJson(mapData);
  });

  return app;
};
