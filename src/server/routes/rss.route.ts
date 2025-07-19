import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { newsSourceSchema } from "../schemas/news-source.schema";
import { NewsSourceService } from "../services/rss.service";
import { BadRequestError, NotFoundError } from "../utils/exception";
import { bulkDeleteSchema } from "../utils/request-schema";

const rssRoutes = new Hono();

// Query filters schema for news sources
const newsSourceFiltersSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  minCredibilityScore: z.coerce.number().optional(),
  domain: z.string().optional(),
});

export type NewsSourceFilters = z.infer<typeof newsSourceFiltersSchema>;

const bulkToggleActiveSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required"),
  isActive: z.boolean(),
});

const updateCredibilitySchema = z.object({
  credibilityScore: z.coerce.number().min(0).max(10),
});

const updateStatsSchema = z.object({
  articlesCount: z.number().min(0),
  successRate: z.number().min(0).max(100),
});

// GET /news-sources - Get all news sources with filtering
rssRoutes.get("/", zValidator("query", newsSourceFiltersSchema), async (c) => {
  const queries = c.req.valid("query");
  const { pagination, data } = await NewsSourceService.getAll(queries);

  return c.apiJson(data, { pagination });
});

// POST /news-sources - Create new news source
rssRoutes.post("/", zValidator("json", newsSourceSchema), async (c) => {
  const data = c.req.valid("json");

  const uniqueCheck = await NewsSourceService.checkUniqueness(
    data.domain,
    data.rssUrl
  );

  if (uniqueCheck.exists) {
    throw new BadRequestError("Domain or RSS URL already exists");
  }

  const source = await NewsSourceService.create(data);
  return c.apiCreated({
    message: "News source created successfully",
    source,
  });
});

// GET /news-sources/active - Get only active news sources
rssRoutes.get("/active", async (c) => {
  const sources = await NewsSourceService.getActive();
  return c.apiJson(sources);
});

// GET /news-sources/stats - Get news sources statistics
rssRoutes.get("/stats", async (c) => {
  const allSources = await NewsSourceService.getAll({});
  const activeSources = await NewsSourceService.getActive();

  return c.apiJson({
    allSources: allSources.data.length,
    activeSources: activeSources.length,
  });
});

// GET /news-sources/fetch-queue - Get sources that need fetching
rssRoutes.get("/fetch-queue", async (c) => {
  const hours = c.req.query("hours") ? parseInt(c.req.query("hours")!) : 1;
  const sources = await NewsSourceService.getSourcesForFetching(hours);
  return c.apiJson(sources);
});

// GET /news-sources/domain/:domain - Get news source by domain
rssRoutes.get("/domain/:domain", async (c) => {
  const domain = c.req.param("domain");
  if (!domain) throw new BadRequestError("Domain is required");

  const source = await NewsSourceService.getByDomain(domain);
  if (!source) throw new NotFoundError("News source not found");

  return c.apiJson(source);
});

// GET /news-sources/:id - Get news source by ID
rssRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) throw new BadRequestError("ID is required");

  const source = await NewsSourceService.getById(id);
  if (!source) throw new NotFoundError("News source not found");

  return c.apiJson(source);
});

// PUT /news-sources/:id - Update news source
rssRoutes.put(
  "/:id",
  zValidator("json", newsSourceSchema.partial()),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    if (!id) throw new BadRequestError("ID is required");

    const existingSource = await NewsSourceService.getById(id);
    if (!existingSource) throw new NotFoundError("News source not found");

    // Check uniqueness if domain or rssUrl is being updated
    if (data.domain || data.rssUrl) {
      const uniqueCheck = await NewsSourceService.checkUniqueness(
        data.domain,
        data.rssUrl,
        id
      );
      if (uniqueCheck.exists) {
        throw new BadRequestError("Domain or RSS URL already exists");
      }
    }

    const source = await NewsSourceService.update(id, data);
    return c.apiJson(source, { message: "News source updated successfully" });
  }
);
// PATCH /news-sources/:id/toggle - Toggle active status
rssRoutes.patch("/:id/toggle", async (c) => {
  const id = c.req.param("id");
  if (!id) throw new BadRequestError("ID is required");

  const existingSource = await NewsSourceService.getById(id);
  if (!existingSource) throw new NotFoundError("News source not found");

  const source = await NewsSourceService.toggleActive(id);
  return c.apiJson(source, {
    message: `News source ${
      source?.isActive ? "activated" : "deactivated"
    } successfully`,
  });
});

// PATCH /news-sources/:id/credibility - Update credibility score
rssRoutes.patch(
  "/:id/credibility",
  zValidator("json", updateCredibilitySchema),
  async (c) => {
    const id = c.req.param("id");
    const { credibilityScore } = c.req.valid("json");

    if (!id) throw new BadRequestError("ID is required");

    const existingSource = await NewsSourceService.getById(id);
    if (!existingSource) throw new NotFoundError("News source not found");

    const source = await NewsSourceService.updateCredibilityScore(
      id,
      credibilityScore
    );
    return c.apiJson(source, {
      message: "Credibility score updated successfully",
    });
  }
);

// PATCH /news-sources/:id/stats - Update stats (articles count, success rate)
rssRoutes.patch(
  "/:id/stats",
  zValidator("json", updateStatsSchema),
  async (c) => {
    const id = c.req.param("id");
    const { articlesCount, successRate } = c.req.valid("json");

    if (!id) throw new BadRequestError("ID is required");

    const existingSource = await NewsSourceService.getById(id);
    if (!existingSource) throw new NotFoundError("News source not found");

    const source = await NewsSourceService.updateStats(
      id,
      articlesCount,
      successRate
    );
    return c.apiJson(source, {
      message: "Stats updated successfully",
    });
  }
);

// PATCH /news-sources/:id/last-fetch - Update last fetch time
rssRoutes.patch("/:id/last-fetch", async (c) => {
  const id = c.req.param("id");
  if (!id) throw new BadRequestError("ID is required");

  const existingSource = await NewsSourceService.getById(id);
  if (!existingSource) throw new NotFoundError("News source not found");

  const source = await NewsSourceService.updateLastFetch(id);
  return c.apiJson(source, {
    message: "Last fetch time updated successfully",
  });
});

// POST /news-sources/bulk/toggle - Bulk toggle active status
rssRoutes.post(
  "/bulk/toggle",
  zValidator("json", bulkToggleActiveSchema),
  async (c) => {
    const { ids, isActive } = c.req.valid("json");

    const results = [];
    for (const id of ids) {
      const source = await NewsSourceService.update(id, { isActive });
      if (source) results.push(source);
    }

    return c.apiJson(results, {
      message: `Successfully ${isActive ? "activated" : "deactivated"} ${
        results.length
      } news sources`,
    });
  }
);

// DELETE /news-sources/:id - Delete news source
rssRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) throw new BadRequestError("ID is required");

  const existingSource = await NewsSourceService.getById(id);
  if (!existingSource) throw new NotFoundError("News source not found");

  const source = await NewsSourceService.delete(id);
  return c.apiJson(source, {
    message: "News source deleted successfully",
  });
});

// DELETE /news-sources/bulk - Bulk delete news sources
rssRoutes.delete("/bulk", zValidator("json", bulkDeleteSchema), async (c) => {
  const { ids } = c.req.valid("json");

  const results = [];
  for (const id of ids) {
    const source = await NewsSourceService.delete(id);
    if (source) results.push(source);
  }

  return c.apiJson(results, {
    message: `Successfully deleted ${results.length} news sources`,
  });
});

export default rssRoutes;
