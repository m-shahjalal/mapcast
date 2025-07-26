import { urlUtils } from "@/utils/urls";
import { ApiPagination } from "@/types/api-response";
import { and, asc, desc, eq, ilike, or, sql, SQLWrapper } from "drizzle-orm";
import db from "../database";
import {
  newsSource,
  NewsSourceSchemaType,
  NewsSourceType,
} from "@/database/schemas/news-source.schema";
import { AppError } from "../utils/exception";
import { NewsSourceFilters } from "@/utils/validator";

export const NewsSourceService = {
  async getAll(
    filters?: NewsSourceFilters
  ): Promise<{ pagination: ApiPagination; data: NewsSourceType[] }> {
    try {
      const conditions = NewsSourceService.buildWhereConditions(filters);
      const { page, limit, offset } = NewsSourceService.validatePagination(
        filters?.page,
        filters?.limit
      );

      // Get total count with error handling
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(newsSource)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      if (!countResult || countResult.length === 0) {
        throw new AppError("Failed to get count from database");
      }

      const totalItems = Number(countResult[0].count) || 0;

      // Get paginated data
      const data = await db
        .select()
        .from(newsSource)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(newsSource.credibilityScore), asc(newsSource.name))
        .limit(limit)
        .offset(offset);

      const pagination: ApiPagination = {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };

      return { data, pagination };
    } catch (error) {
      console.error("NewsSourceService.getAll error:", error);
      throw new AppError("Failed to retrieve news sources");
    }
  },

  getActive: async () => {
    return db
      .select()
      .from(newsSource)
      .where(eq(newsSource.isActive, true))
      .orderBy(desc(newsSource.credibilityScore), asc(newsSource.name));
  },

  getById: async (id: string) => {
    const result = await db
      .select()
      .from(newsSource)
      .where(eq(newsSource.id, id))
      .limit(1);

    return result[0] || null;
  },

  getByDomain: async (domain: string) => {
    const result = await db
      .select()
      .from(newsSource)
      .where(eq(newsSource.domain, domain))
      .limit(1);

    return result[0] || null;
  },

  create: async (data: NewsSourceSchemaType) => {
    const urlValidation = urlUtils.validateRssUrl(data.rssUrl || "");
    if (!urlValidation.valid) {
      throw new Error(`Invalid RSS URL: ${urlValidation.error}`);
    }

    const [result] = await db
      .insert(newsSource)
      .values({
        ...data,
        rssUrl: urlValidation.normalized,
        credibilityScore: data.credibilityScore?.toString(),
      })
      .onConflictDoNothing()
      .returning();

    return result;
  },

  updateLastFetch: async (id: string) => {
    const result = await db
      .update(newsSource)
      .set({
        lastFetch: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsSource.id, id))
      .returning();

    return result[0] || null;
  },

  updateStats: async (
    id: string,
    articlesCount: number,
    successRate: number
  ) => {
    const result = await db
      .update(newsSource)
      .set({
        articlesCount,
        successRate,
        updatedAt: new Date(),
      })
      .where(eq(newsSource.id, id))
      .returning();

    return result[0] || null;
  },

  updateCredibilityScore: async (id: string, score: number) => {
    const result = await db
      .update(newsSource)
      .set({
        credibilityScore: score.toString(),
        updatedAt: new Date(),
      })
      .where(eq(newsSource.id, id))
      .returning();

    return result[0] || null;
  },

  toggleActive: async (id: string) => {
    const current = await NewsSourceService.getById(id);
    if (!current) return null;

    const result = await db
      .update(newsSource)
      .set({
        isActive: !current.isActive,
        updatedAt: new Date(),
      })
      .where(eq(newsSource.id, id))
      .returning();

    return result[0] || null;
  },

  delete: async (id: string) => {
    try {
      const result = await db
        .update(newsSource)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(newsSource.id, id))
        .returning();

      return result[0] || null;
    } catch {
      const result = await db
        .delete(newsSource)
        .where(eq(newsSource.id, id))
        .returning();

      return result[0] || null;
    }
  },

  getSourcesForFetching: async (hoursAgo: number = 1) => {
    console.info("🔘 Getting sources for fetching");

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

    const sources = await db
      .select()
      .from(newsSource)
      .where(and(eq(newsSource.isActive, true)))
      .orderBy(asc(newsSource.lastFetch));

    // Validate and normalize URLs
    const validatedSources = sources
      .map((source) => {
        const { normalized, valid, error } = urlUtils.validateRssUrl(
          source.rssUrl || ""
        );

        if (!valid) {
          return console.error(
            `Invalid RSS URL for ${source.rssUrl} - ${error}`
          );
        }

        return { ...source, rssUrl: normalized };
      })
      .filter(Boolean);

    console.info(
      `🔘 Found ${validatedSources.length} valid sources (${
        sources.length - validatedSources.length
      } invalid)`
    );

    return validatedSources;
  },

  buildWhereConditions: (filters?: NewsSourceFilters): SQLWrapper[] => {
    const conditions: SQLWrapper[] = [];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(newsSource.name, `%${filters.search}%`),
          ilike(newsSource.domain, `%${filters.search}%`)
        ) as SQLWrapper
      );
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(newsSource.isActive, filters.isActive));
    }

    if (filters?.domain) {
      conditions.push(ilike(newsSource.domain, `%${filters.domain}%`));
    }

    return conditions;
  },

  validatePagination: (page?: number, limit?: number) => {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(100, Math.max(1, limit || 20)); // Cap at 100
    const offset = (validatedPage - 1) * validatedLimit;

    return { page: validatedPage, limit: validatedLimit, offset };
  },
};
