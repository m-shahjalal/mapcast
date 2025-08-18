import db from "@/server/database";
import { news } from "@/server/database/schemas";
import { ApiPagination } from "@/types/api-response";
import { NewsFilters, NewsMapFilters } from "@/types/query-filter";
import {
  and,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
  sql,
  SQLWrapper,
} from "drizzle-orm";

export const NewsService = {
  async findAll(filters: NewsFilters) {
    const { page = 1, limit = 10 } = filters;
    const conditions: SQLWrapper[] = [];

    // Build conditions array
    if (filters.sourceDomain) {
      conditions.push(eq(news.sourceDomain, filters.sourceDomain));
    }

    if (filters.topics) {
      const topics = ((filters as any).topics ?? "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
      if (topics.length > 0) {
        conditions.push(inArray(news.topic, topics as any));
      }
    }

    if (filters.location) {
      conditions.push(
        sql`lower(${news.locationName}) like lower(${`%${filters.location}%`})`
      );
    }

    if (filters.search) {
      conditions.push(
        sql`to_tsvector('english', ${news.title} || ' ' || ${news.summary} || ' ' || ${news.locationName}) @@ plainto_tsquery('english', ${filters.search})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get filtered count (this was the bug - count wasn't using whereClause)
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(news)
      .where(whereClause);

    // Get paginated data
    const data = await db
      .select()
      .from(news)
      .where(whereClause)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(desc(news.createdAt));

    const pagination: ApiPagination = {
      totalItems: count,
      pageSize: limit,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };

    return { data, pagination };
  },

  async getMapData(filters: NewsMapFilters) {
    const conditions: SQLWrapper[] = [isNotNull(news.locationName)];

    const fromDate = filters.from
      ? new Date(filters.from)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const toDate = filters.to ? new Date(filters.to) : new Date();

    conditions.push(
      and(
        gte(news.createdAt, fromDate),
        lte(news.createdAt, toDate)
      ) as SQLWrapper
    );

    if (filters.topics) {
      const topics = ((filters as any).topics ?? "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      if (topics.length > 0) {
        conditions.push(inArray(news.topic, topics as any));
      }
    }

    if (filters.search) {
      conditions.push(
        sql`to_tsvector('english', ${news.title} || ' ' || ${news.summary} || ' ' || ${news.locationName}) @@ plainto_tsquery('english', ${filters.search})`
      );
    }

    return await db
      .selectDistinctOn([news.latitude, news.longitude])
      .from(news)
      .where(and(...conditions))
      .limit(1000)
      .orderBy(news.latitude, news.longitude, desc(news.createdAt));
  },

  async findById(id: string) {
    return await db.select().from(news).where(eq(news.id, id));
  },

  async findBySlug(slug: string) {
    return await db.select().from(news).where(eq(news.slug, slug));
  },
};
