import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { newsSourceSchema } from "../schemas/news-source.schema";
import { NewsSourceService } from "../services/rss.service";
import { BadRequestError, NotFoundError } from "../utils/exception";

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

export default rssRoutes;
