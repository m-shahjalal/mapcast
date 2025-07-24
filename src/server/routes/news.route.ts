import { NewsFilters, NewsMapFilters } from "@/types/query-filter";
import { Hono } from "hono";
import { NewsService } from "../services/news.service";
import { NewsProxyService } from "../services/news-proxy.service";

const newsRoutes = new Hono();

newsRoutes.get("/", async (c) => {
  try {
    const filters = c.req.queries() as NewsFilters;
    const { count, result: news } = await NewsService.findAll(filters);

    return c.apiJson(news, {
      pagination: {
        currentPage: filters.page || 1,
        totalPages: Math.ceil(count / (filters.limit || 20)),
        totalItems: count,
        pageSize: filters.limit || 20,
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return c.json({ success: false, error: "Failed to fetch news" }, 500);
  }
});

newsRoutes.get("/map", async (c) => {
  const filters = c.req.queries();
  const mapData = await NewsService.getMapData(filters as any);
  return c.apiJson(mapData);
});

newsRoutes.get("/proxy/:url", async (c) => {
  const url = c.req.param("url");
  const newsProxyService = new NewsProxyService();

  const content = await newsProxyService.fetchAndExtract(url);

  return c.json(content);
});

export default newsRoutes;
