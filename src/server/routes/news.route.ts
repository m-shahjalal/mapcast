import { NewsFilters } from "@/types/query-filter";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { NewsService } from "../services/news.service";
import { BadRequestError, NotFoundError } from "../utils/exception";
import { dateRangeSchema, querySchema } from "../utils/request-schema";
import { createNewNewsSchema, updateNewsSchema } from "../schemas";

const newsRoutes = new Hono();

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required"),
});

newsRoutes.get("/", zValidator("query", querySchema), async (c) => {
  try {
    const filters = c.req.valid("query") as NewsFilters;
    const news = await NewsService.findAll(filters);
    const total = await NewsService.count(filters);

    return c.json({
      success: true,
      data: news,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20)),
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return c.json({ success: false, error: "Failed to fetch news" }, 500);
  }
});

newsRoutes.get("/stats", async (c) => {
  const stats = await NewsService.getStats();
  return c.apiJson(stats);
});

newsRoutes.get("/source-stats", async (c) => {
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 10;
  const stats = await NewsService.getSourceStats(limit);
  return c.apiJson(stats);
});

newsRoutes.get(
  "/date-range",
  zValidator("query", dateRangeSchema),
  async (c) => {
    const { startDate, endDate } = c.req.valid("query");
    const news = await NewsService.getByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
    return c.apiJson(news);
  }
);

// GET /news/source/:sourceId - Get news by source
newsRoutes.get("/source/:sourceId", async (c) => {
  const sourceId = c.req.param("sourceId");
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 10;

  if (!sourceId) throw new BadRequestError("Source ID is required");

  const news = await NewsService.findBySource(sourceId, limit);
  return c.apiJson(news);
});

newsRoutes.get("/location/:locationId", async (c) => {
  const locationId = c.req.param("locationId");
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 10;

  if (!locationId) throw new BadRequestError("Location ID is required");

  const news = await NewsService.findByLocation(locationId, limit);
  return c.apiJson(news);
});

newsRoutes.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug");
  if (!slug) throw new BadRequestError("Slug is required");

  const news = await NewsService.findBySlug(slug);
  if (!news) throw new NotFoundError("News not found");

  return c.apiJson(news);
});

newsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) throw new BadRequestError("ID is required");

  const news = await NewsService.findOne(id);
  if (!news) throw new NotFoundError("News not found");

  return c.apiJson(news);
});

newsRoutes.get("/:id/details", async (c) => {
  const id = c.req.param("id");
  if (!id) throw new BadRequestError("ID is required");

  const news = await NewsService.getWithDetails(id);
  if (!news) throw new NotFoundError("News not found");

  return c.apiJson(news);
});

// POST /news - Create new news
newsRoutes.post("/", zValidator("json", createNewNewsSchema), async (c) => {
  const data = c.req.valid("json");

  const news = await NewsService.create(data);
  return c.apiCreated(news, "News created successfully");
});

newsRoutes.put("/:id", zValidator("json", updateNewsSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  if (!id) throw new BadRequestError("ID is required");

  const existingNews = await NewsService.findOne(id);
  if (!existingNews) throw new NotFoundError("News not found");

  if (data.slug && data.slug !== existingNews.slug) {
    const existingSlug = await NewsService.findBySlug(data.slug);
    if (existingSlug) throw new BadRequestError("Slug already exists");
  }

  const news = await NewsService.update(id, data);
  return c.apiJson(news);
});

newsRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) throw new BadRequestError("ID is required");

  const existingNews = await NewsService.findOne(id);
  if (!existingNews) throw new NotFoundError("News not found");

  const news = await NewsService.delete(id);
  return c.apiJson(news);
});

newsRoutes.delete("/bulk", zValidator("json", bulkDeleteSchema), async (c) => {
  const { ids } = c.req.valid("json");

  const deletedNews = await NewsService.bulkDelete(ids);
  return c.apiJson(deletedNews, {
    message: `Successfully deleted ${deletedNews.length} news items`,
  });
});

export default newsRoutes;
