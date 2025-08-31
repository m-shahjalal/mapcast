import { MapCountry } from "@/config/map-context";
import db from "@/server/database";
import { country, news } from "@/server/database/schemas";
import { ApiPagination } from "@/types/api-response";
import { NewsFilters, NewsMapFilters } from "@/types/query-filter";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  isNotNull,
  lt,
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
    const fromDate = filters?.from
      ? new Date(filters.from)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const conditions: SQLWrapper[] = [
      isNotNull(news.location),
      gte(news.createdAt, fromDate),
      lte(news.createdAt, filters?.to ? new Date(filters.to) : new Date()),
    ];

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

    const hasFilters =
      filters?.topic ||
      filters?.country ||
      filters?.search ||
      filters?.from ||
      filters?.to;

    const latestPerSource = db.$with("latest_per_source").as(
      db
        .select({
          ...getTableColumns(news),
          rn: sql`row_number() over (partition by ${news.sourceDomain} order by ${news.createdAt} desc)`.as(
            "rn"
          ),
        })
        .from(news)
        .where(and(...conditions))
    );

    const whereCondition = hasFilters ? undefined : lte(latestPerSource.rn, 8);

    const result = await db
      .with(latestPerSource)
      .selectDistinctOn([latestPerSource.latitude, latestPerSource.longitude], {
        ...getTableColumns(news),
      })
      .from(latestPerSource)
      .leftJoin(news, eq(news.id, latestPerSource.id))
      .where(whereCondition)
      .orderBy(
        latestPerSource.latitude,
        latestPerSource.longitude,
        desc(latestPerSource.createdAt)
      )
      .limit(500);

    if (filters?.country) {
      const location = await db.query.country.findFirst({
        where: eq(country.code, filters?.country),
      });

      if (!location) {
        return { data: result, country: null };
      }

      const countryData: MapCountry = {
        name: location.name,
        geojson: location.geojson,
        latitude: Number(location.lat),
        longitude: Number(location.lon),
        countryCode: location.code,
      };

      return { data: result, country: countryData };
    }

    return { data: result, country: null };
  },

  async getSiteMapData(filters?: NewsMapFilters) {
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

    // Option 1: Simple approach - remove the problematic subquery logic
    const result = await db
      .selectDistinctOn([news.latitude, news.longitude], {
        ...getTableColumns(news),
      })
      .from(news)
      .where(and(...conditions))
      .orderBy(news.latitude, news.longitude, desc(news.createdAt))
      .limit(500);

    if (result.length > 0) return result;

    // Fallback for country-specific queries
    if (filters?.country) {
      const location = await db.query.country.findFirst({
        where: eq(country.code, filters?.country),
      });

      if (!location) return result;

      return {
        latitude: location?.lat,
        longitude: location?.lon,
        name: location?.name,
        geojson: location?.geojson,
      };
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
