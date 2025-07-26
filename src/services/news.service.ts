// server/services/NewsService.ts
// Copy your existing NewsService.ts content here exactly as it is
// This is just a placeholder to show where it should go

import { NewsFilters, NewsMapFilters } from "@/types/query-filter";
import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  sql,
  SQLWrapper,
} from "drizzle-orm";
import slugify from "slugify";
import db from "../database";
import { RSSFeedResult } from "../lib/location-extractor";
import { NewNews, news, newsSource } from "@/database/schemas";
import { ApiPagination } from "@/types/api-response";

export const NewsService = {
  async findAll(filters: NewsFilters) {
    const { page = 1, limit = 20 } = filters;
    const conditions: SQLWrapper[] = [];

    if (filters.sourceId) {
      conditions.push(eq(news.sourceId, filters.sourceId));
    }

    if (filters.topics) {
      const topics = filters.topics[0]
        .split(",")
        .map((t) => t.trim())
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

    if (filters.topics) {
      const topics = filters.topics[0]
        .split(",")
        .map((t) => t.trim())
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
      .select()
      .from(news)
      .where(and(...conditions))
      .limit(1000)
      .orderBy(desc(news.createdAt));
  },

  async saveArticle(newsData: RSSFeedResult[]): Promise<NewNews[]> {
    const articlesToInsert: Array<typeof news.$inferInsert> = [];
    const processedSlugs = new Set<string>();

    for (const feed of newsData) {
      try {
        const sourceId = await this.ensureNewsSource(feed.source);

        for (const article of feed.articles) {
          const slug = slugify(article.title, { lower: true, strict: true });

          if (processedSlugs.has(slug)) continue;
          processedSlugs.add(slug);

          const locationPin = article.locationPin;
          articlesToInsert.push({
            title: article.title,
            slug,
            summary: article.summary,
            sourceId,
            newsUrl: article.url,
            locationName: locationPin?.location || null,
            locationCity: locationPin?.city || null,
            locationState: locationPin?.state || null,
            locationCountry: locationPin?.country || null,
            latitude: locationPin?.latitude || null,
            longitude: locationPin?.longitude || null,
            topic: article.topic,
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
      return results;
    } catch (error) {
      console.error("Failed to save articles:", error);
      throw new Error("Bulk article save operation failed");
    }
  },

  async ensureNewsSource(sourceUrl: string): Promise<string | null> {
    const existing = await db
      .select({ id: newsSource.id })
      .from(newsSource)
      .where(eq(newsSource.rssUrl, sourceUrl))
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

  extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  },
};
