import { NewsFilters } from "@/types/query-filter";
import { eq, inArray, sql } from "drizzle-orm";
import slugify from "slugify";
import db from "../database";
import { RSSFeedResult } from "../jobs/location-extractor";
import { NewNews, news, NewsSelect, newsSource } from "../schemas";

export const NewsService = {
  async findAll(filters: NewsFilters) {
    const { page = 1, limit = 20 } = filters;
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(news);

    const result = await db
      .select()
      .from(news)
      .limit(limit)
      .offset((page - 1) * limit);

    return { result, count };
  },

  async saveArticle(newsData: RSSFeedResult[]): Promise<NewNews[]> {
    const articlesToInsert: Array<typeof news.$inferInsert> = [];
    const processedSlugs = new Set<string>();

    // Process all feeds and prepare articles for bulk insert
    for (const feed of newsData) {
      try {
        const sourceId = await this.ensureNewsSource(feed.source, feed.title);

        for (const article of feed.articles) {
          const slug = slugify(article.title, { lower: true, strict: true });

          // Skip duplicates within the batch
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

  async ensureNewsSource(sourceUrl: string, title: string): Promise<string> {
    const existing = await db
      .select({ id: newsSource.id })
      .from(newsSource)
      .where(eq(newsSource.rssUrl, sourceUrl))
      .limit(1);

    if (existing.length > 0) return existing[0].id;

    const [newSource] = await db
      .insert(newsSource)
      .values({
        name: title,
        domain: this.extractDomain(sourceUrl),
        rssUrl: sourceUrl,
      })
      .returning({ id: newsSource.id });

    return newSource.id;
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
