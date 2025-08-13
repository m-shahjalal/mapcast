import db from "@/server/database";
import { NewNewsType, news, rssSource } from "@/server/database/schemas";
import { NewsArticle } from "@/types/ai-data-format";
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
  or,
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

  async saveArticle(
    article: NewsArticle,
    shouldUpdateRSSLastUpdate = true
  ): Promise<NewNewsType | null> {
    console.log(`💾 Saving article: "${article.title.substring(0, 50)}..."`);
    if (article.location.latitude && article.location.longitude) {
      try {
        const slug = slugify(article.title, { lower: true, strict: true });
        console.log(`🔗 Generated slug: "${slug}"`);

        const existingArticle = await db
          .select({ id: news.id })
          .from(news)
          .where(
            or(
              eq(news.slug, slug),
              and(
                eq(news.latitude, article.location.latitude as any),
                eq(news.longitude, article.location.longitude as any)
              )
            )
          )
          .limit(1);

        if (existingArticle.length > 0) {
          console.log(`⏭️  Article already exists, skipping: "${slug}"`);
          return null;
        }

        const location = article.location;
        const articleData: NewNewsType = {
          title: article.title,
          slug,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          summary: article.summary,
          content: article.content,
          tags: article.tags.join(","),
          keywords: article.keywords.join(","),
          originalUrl: article.url,
          locationName: location?.name || null,
          locationCity: location?.city || null,
          locationState: location?.state || null,
          locationCountry: location?.country || null,
          locationCountryCode: location?.code || null,
          latitude: location?.latitude ? String(location.latitude) : null,
          longitude: location?.longitude ? String(location.longitude) : null,
          topic: article.topic,
          sourceDomain: article.source ?? null,
          publishedAt: article.publishedAt,
          crawledAt: new Date(),
        };

        console.log(
          `📊 Article data prepared - Topic: ${articleData.topic}, Location: ${
            articleData.locationCity || "Unknown"
          }`
        );

        // Insert article into database
        const [savedArticle] = await db
          .insert(news)
          .values(articleData)
          .onConflictDoNothing()
          .returning();

        await db
          .update(rssSource)
          .set({ lastFetch: new Date() })
          .where(eq(rssSource.rssUrl, article.url));

        if (savedArticle) {
          console.log(
            `✅ Successfully saved article with ID: ${savedArticle.id}`
          );
          console.log(
            `📍 Location: ${articleData.locationCity}, ${articleData.locationCountry}`
          );
          console.log(
            `🏷️  Tags: ${article.tags.length}, Keywords: ${article.keywords.length}`
          );
          return savedArticle as NewNewsType;
        } else {
          console.warn(
            `⚠️  Article not saved (likely duplicate): "${article.title}"`
          );
          return null;
        }
      } catch (error) {
        console.error(`❌ Failed to save article: "${article.title}"`);
        console.error(`🚨 Error details:`, error);

        // Re-throw with more context
        throw new Error(
          `Failed to save article "${article.title}": ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } else return null;
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
