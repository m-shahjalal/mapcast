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
        // Convert decimal to number for comparison
        eq(newsSource.credibilityScore, filters.minCredibilityScore.toString())
      );
    }

    if (filters?.domain) {
      conditions.push(ilike(newsSource.domain, `%${filters.domain}%`));
    }

    // Add pagination
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
  // Get active news sources only
  getActive: async () => {
    return db
      .select()
      .from(newsSource)
      .where(eq(newsSource.isActive, true))
      .orderBy(desc(newsSource.credibilityScore), asc(newsSource.name));
  },

  // Get news source by ID
  getById: async (id: string) => {
    const result = await db
      .select()
      .from(newsSource)
      .where(eq(newsSource.id, id))
      .limit(1);

    return result[0] || null;
  },

  // Get news source by domain
  getByDomain: async (domain: string) => {
    const result = await db
      .select()
      .from(newsSource)
      .where(eq(newsSource.domain, domain))
      .limit(1);

    return result[0] || null;
  },

  // Create new news source
  create: async (data: NewsSourceSchemaType) => {
    const result = await db
      .insert(newsSource)
      .values({
        ...data,
        credibilityScore: data.credibilityScore.toString(),
      })
      .returning();

    return result[0];
  },

  // Update news source
  update: async (id: string, data: Partial<NewsSourceSchemaType>) => {
    const result = await db
      .update(newsSource)
      .set({
        ...{
          ...data,
          credibilityScore: data.credibilityScore?.toString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(newsSource.id, id))
      .returning();

    return result[0] || null;
  },

  // Update last fetch time
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

  // Update article count and success rate
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

  // Update credibility score
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

  // Toggle active status
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

  // Delete news source (soft delete if deletedAt exists, otherwise hard delete)
  delete: async (id: string) => {
    // Check if deletedAt field exists in timestamps
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
      // If soft delete fails (no deletedAt field), do hard delete
      const result = await db
        .delete(newsSource)
        .where(eq(newsSource.id, id))
        .returning();

      return result[0] || null;
    }
  },

  // Get sources that need fetching (haven't been fetched recently)
  getSourcesForFetching: async (hoursAgo: number = 1) => {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

    return db
      .select()
      .from(newsSource)
      .where(
        and(
          eq(newsSource.isActive, true),
          or(isNull(newsSource.lastFetch), lt(newsSource.lastFetch, cutoffTime))
        )
      )
      .orderBy(asc(newsSource.lastFetch));
  },

  // Get sources by credibility score range
  getByCredibilityRange: async (minScore: number, maxScore: number) => {
    return db
      .select()
      .from(newsSource)
      .where(
        and(
          eq(newsSource.isActive, true)
          // Note: decimal comparison might need adjustment based on your setup
        )
      )
      .orderBy(desc(newsSource.credibilityScore));
  },

  // Check if domain or RSS URL already exists
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

    let query = db
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
