import db from "@/server/database";
import { NewNewsType, news, rssSource } from "@/server/database/schemas";
import { RSSFeedResult } from "@/server/feed-reader/location-extractor";
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
import slugify from "slugify";

export const NewsService = {
  async findAll(filters: NewsFilters) {
    const { page = 1, limit = 20 } = filters;
    const conditions: SQLWrapper[] = [];

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

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(news);

    const result = await db
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

    return { result, pagination };
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

  async saveArticle(newsData: RSSFeedResult[]): Promise<NewNewsType[]> {
    const articlesToInsert: Array<NewNewsType> = [];
    const processedSlugs = new Set<string>();

    for (const feed of newsData) {
      try {
        for (const article of feed.articles) {
          const slug = slugify(article.title, { lower: true, strict: true });

          if (processedSlugs.has(slug)) continue;
          processedSlugs.add(slug);

          const locationPin = article.locationPin;
          articlesToInsert.push({
            title: article.title,
            slug,
            summary: article.summary,
            originalUrl: article.url,
            locationName: locationPin?.location || null,
            locationCity: locationPin?.city || null,
            locationState: locationPin?.state || null,
            locationCountry: locationPin?.country || null,
            latitude: locationPin?.latitude || null,
            longitude: locationPin?.longitude || null,
            topic: article.topic,
            content: article.content ?? "",
            sourceDomain: article.sourceDomain,
            publishedAt: article.publishedAt,
            crawledAt: article.crawledAt,
          });
        }
      } catch (error) {
        console.error(`Failed to process feed ${feed.source}:`, error);
      }
    }

    if (articlesToInsert.length === 0) {
      console.info("🔘 No new articles to save");
      return [];
    }

    try {
      // Bulk insert new articles
      const results = await db
        .insert(news)
        .values(articlesToInsert)
        .onConflictDoNothing()
        .returning();

      console.info(`🔘 Saved ${results.length} new articles`);
      return results as NewNewsType[];
    } catch (error) {
      console.error("Failed to save articles:", error);
      throw new Error("Bulk article save operation failed");
    }
  },

  async ensureNewsSource(sourceUrl: string): Promise<string | null> {
    const existing = await db
      .select({ id: rssSource.id })
      .from(rssSource)
      .where(eq(rssSource.rssUrl, sourceUrl))
      .limit(1);

    if (existing.length > 0) return existing[0].id;

    return null;
  },

  async getExistingSlugs(slugs: string[]): Promise<Set<string>> {
    const existing = await db
      .select({ slug: news.slug })
      .from(news)
      .where(inArray(news.slug, slugs));

    return new Set(existing.map((row) => row.slug));
  },
};
