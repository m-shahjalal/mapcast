import { urlUtils } from "@/lib/urls";
import { ApiPagination } from "@/types/api-response";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  isNull,
  lt,
  or,
  sql,
  SQLWrapper,
} from "drizzle-orm";
import db from "../database";
import { NewsSourceFilters } from "../routes/rss.route";
import { newsSource } from "../schemas";
import {
  NewsSourceSchemaType,
  NewsSourceType,
} from "../schemas/news-source.schema";

export const NewsSourceService = {
  getAll: async (
    filters?: NewsSourceFilters
  ): Promise<{ pagination: ApiPagination; data: NewsSourceType[] }> => {
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

    if (filters?.minCredibilityScore !== undefined) {
      conditions.push(
        eq(newsSource.credibilityScore, filters.minCredibilityScore.toString())
      );
    }

    if (filters?.domain) {
      conditions.push(ilike(newsSource.domain, `%${filters.domain}%`));
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsSource);

    const data = await db
      .select()
      .from(newsSource)
      .where(and(...conditions))
      .orderBy(desc(newsSource.credibilityScore), asc(newsSource.name))
      .limit(limit)
      .offset(offset);

    const pagination: ApiPagination = {
      currentPage: page,
      pageSize: limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };

    return { data, pagination };
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

    const result = await db
      .insert(newsSource)
      .values({
        ...data,
        rssUrl: urlValidation.normalized,
        credibilityScore: data.credibilityScore.toString(),
      })
      .returning();

    return result[0];
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
    console.log("🔘 Getting sources for fetching");

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

    const sources = await db
      .select()
      .from(newsSource)
      .where(
        and(
          eq(newsSource.isActive, true)
          // or(isNull(newsSource.lastFetch), lt(newsSource.lastFetch, cutoffTime))
        )
      )
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

    console.log(
      `🔘 Found ${validatedSources.length} valid sources (${
        sources.length - validatedSources.length
      } invalid)`
    );

    return validatedSources;
  },

  checkUniqueness: async (
    domain?: string,
    rssUrl?: string,
    excludeId?: string
  ) => {
    const conditions = [];

    if (domain) {
      conditions.push(eq(newsSource.domain, domain));
    }

    if (rssUrl) {
      conditions.push(eq(newsSource.rssUrl, rssUrl));
    }

    if (excludeId) {
      conditions.push(eq(newsSource.id, excludeId));
    }

    if (conditions.length === 0) return { exists: false };

    const query = db
      .select({
        id: newsSource.id,
        domain: newsSource.domain,
        rssUrl: newsSource.rssUrl,
      })
      .from(newsSource);

    if (domain && rssUrl) {
      query.where(
        or(eq(newsSource.domain, domain), eq(newsSource.rssUrl, rssUrl))
      );
    } else {
      query.where(and(...conditions.slice(0, -1)));
    }

    if (excludeId) {
      query.where(and(or(...conditions.slice(0, -1))));
    }

    const result = await query.limit(1);

    return {
      exists: result.length > 0,
      conflicting: result[0] || null,
    };
  },
};
