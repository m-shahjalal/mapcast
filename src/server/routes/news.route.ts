import { NewsFilters } from "@/types/query-filter";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { NewsService } from "../services/news.service";
import { querySchema } from "../utils/request-schema";

const newsRoutes = new Hono();

newsRoutes.get("/", zValidator("query", querySchema), async (c) => {
  try {
    const filters = c.req.valid("query") as NewsFilters;
    const { count, result: news } = await NewsService.findAll(filters);

    return c.json({
      success: true,
      data: news,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: count,
        pages: Math.ceil(count / (filters.limit || 20)),
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return c.json({ success: false, error: "Failed to fetch news" }, 500);
  }
});

export default newsRoutes;
