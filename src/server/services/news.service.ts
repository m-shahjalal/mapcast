import db from "@/server/database";
import { country, news } from "@/server/database/schemas";
import { ApiPagination } from "@/types/api-response";
import { NewsFilters, NewsMapFilters } from "@/types/query-filter";
import {
  and,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
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

    if (filters.sourceDomain) {
      conditions.push(eq(news.sourceDomain, filters.sourceDomain));
    }

    if (filters?.topic) {
      conditions.push(eq(news.topic, filters.topic));
    }

    if (filters.location) {
      conditions.push(
        sql`lower(${news.location}) like lower(${`%${filters.location}%`})`
      );
    }

    if (filters.search) {
      conditions.push(
        sql`to_tsvector('english', ${news.title} || ' ' || ${news.summary} || ' ' || ${news.location}) @@ plainto_tsquery('english', ${filters.search})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(news)
      .where(whereClause);

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

  async getMapData(filters?: NewsMapFilters) {
    const conditions: SQLWrapper[] = [isNotNull(news.location)];

    const fromDate = filters?.from
      ? new Date(filters.from)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const toDate = filters?.to ? new Date(filters.to) : new Date();

    conditions.push(
      and(
        gte(news.createdAt, fromDate),
        lte(news.createdAt, toDate)
      ) as SQLWrapper
    );

    if (filters?.topic) {
      conditions.push(eq(news.topic, filters.topic));
    }

    if (filters?.country) {
      conditions.push(eq(news.countryCode, filters.country));
    }

    if (filters?.search) {
      conditions.push(
        sql`to_tsvector('english', ${news.title} || ' ' || ${news.summary} || ' ' || ${news.location}) @@ plainto_tsquery('english', ${filters.search})`
      );
    }

    const result = await db
      .selectDistinctOn([news.latitude, news.longitude], {
        ...getTableColumns(news),
        geojson: country.geojson,
      })
      .from(news)
      .where(and(...conditions))
      .limit(1000)
      .orderBy(news.latitude, news.longitude, desc(news.createdAt))
      .leftJoin(country, eq(country.code, filters?.country ?? ""));

    if (result.length > 0) return result;

    if (filters?.country) {
      const location = await db.query.country.findFirst({
        where: eq(country.code, filters?.country),
      });

      if (!location) return result;

      const locationData = {
        latitude: location?.lat,
        longitude: location?.lon,
        name: location?.name,
        geojson: location?.geojson,
      };

      return locationData;
    }

    return result;
  },

  async findById(id: string) {
    return await db.select().from(news).where(eq(news.id, id));
  },

  async findBySlug(slug: string) {
    const [result] = await db
      .selectDistinctOn([news.latitude, news.longitude], {
        ...getTableColumns(news),
        geojson: country.geojson,
      })
      .from(news)
      .where(eq(news.slug, decodeURIComponent(slug)))
      .leftJoin(country, eq(country.code, news.countryCode));
    return result;
  },
};
