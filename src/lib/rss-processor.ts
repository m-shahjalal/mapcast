// lib/rss-batch-processor.ts - Single unified processor
import { LocationExtractor, RSSFeedResult } from "@/lib/location-extractor";
import { NewsService } from "@/services/news.service";
import { NewsSourceService } from "@/services/rss.service";
import { urlUtils } from "@/utils/urls";
import Parser from "rss-parser";

const CONFIG = {
  BATCH_SIZE: 15, // 15 sources per batch (good for 100+ sources)
  REQUEST_TIMEOUT: 4000,
  MAX_EXECUTION_TIME: 25000, // 25s for Vercel
} as const;

export class RSSBatchProcessor {
  private static parser = new Parser({
    timeout: CONFIG.REQUEST_TIMEOUT,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  private static locationExtractor = new LocationExtractor();

  static async processBatch(
    batchIndex: number,
    triggeredBy: "api" | "cron" = "cron"
  ) {
    const startTime = Date.now();

    try {
      console.info(`🚀 Starting batch ${batchIndex} (${triggeredBy})`);

      // Get all sources and slice for this batch
      const allSources = await NewsSourceService.getSourcesForFetching();
      const start = batchIndex * CONFIG.BATCH_SIZE;
      const end = Math.min(start + CONFIG.BATCH_SIZE, allSources.length);
      const batchSources = allSources.slice(start, end);

      if (!batchSources.length) {
        return {
          success: false,
          message: `Batch ${batchIndex} is empty`,
          batchIndex,
          totalSources: allSources.length,
        };
      }

      console.info(
        `📊 Processing ${batchSources.length} sources in batch ${batchIndex}`
      );

      // Process sources concurrently
      const results = await this.processSourcesConcurrently(
        batchSources,
        startTime
      );

      // Save to database
      let saved: any[] = [];
      if (results.length > 0) {
        saved = await NewsService.saveArticle(results);
      }

      const executionTime = Date.now() - startTime;

      console.info(
        `✅ Batch ${batchIndex} completed: ${saved.length} articles saved in ${executionTime}ms`
      );

      return {
        success: true,
        batchIndex,
        processed: results.length,
        saved: saved.length,
        executionTime,
        totalSources: allSources.length,
        totalBatches: Math.ceil(allSources.length / CONFIG.BATCH_SIZE),
        triggeredBy,
      };
    } catch (error: any) {
      console.error(`💥 Batch ${batchIndex} failed:`, error.message);
      return {
        success: false,
        batchIndex,
        error: error.message,
        executionTime: Date.now() - startTime,
        triggeredBy,
      };
    }
  }

  private static async processSourcesConcurrently(
    sources: any[],
    startTime: number
  ) {
    const results: RSSFeedResult[] = [];
    const promises = sources.map(async (source) => {
      // Check time limit
      if (Date.now() - startTime > CONFIG.MAX_EXECUTION_TIME) {
        return null;
      }

      try {
        return await this.processSource(source);
      } catch {
        return null;
      }
    });

    const batchResults = await Promise.allSettled(promises);

    batchResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        results.push(result.value);
      }
    });

    return results;
  }

  private static async processSource(
    source: any
  ): Promise<RSSFeedResult | null> {
    const url = source?.rssUrl?.trim();
    if (
      !url ||
      !urlUtils.isValidUrl(url.startsWith("http") ? url : `https://${url}`)
    ) {
      return null;
    }

    try {
      const sanitizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const feed = await this.parser.parseURL(sanitizedUrl);

      if (!feed?.items?.length) return null;

      const items = feed.items
        .slice(0, 3)
        .filter((item) => item.title && item.link)
        .map((item) => ({
          title: item.title || "",
          link: item.link || "",
          contentSnippet: item.contentSnippet || "",
          content: item.content || "",
        }));

      if (!items.length) return null;

      return await this.locationExtractor.processFeed(
        items,
        source.name || url,
        feed.title || "Unknown"
      );
    } catch {
      return null;
    }
  }

  // Get total batches needed
  static async getTotalBatches(): Promise<number> {
    const sources = await NewsSourceService.getSourcesForFetching();
    return Math.ceil(sources.length / CONFIG.BATCH_SIZE);
  }

  // Process all batches (for API calls)
  static async processAllBatches() {
    const totalBatches = await this.getTotalBatches();
    const results = [];

    for (let i = 0; i < totalBatches; i++) {
      const result = await this.processBatch(i, "api");
      results.push(result);

      // Small delay between batches
      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return {
      totalBatches,
      results,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalProcessed: results.reduce((sum, r) => sum + (r.processed || 0), 0),
      totalSaved: results.reduce((sum, r) => sum + (r.saved || 0), 0),
    };
  }
}

// // vercel.json - Auto-generated cron config for 100+ sources (7 batches)
// {
//   "crons": [
//     { "path": "/api/cron/rss-batch/0", "schedule": "0 */6 * * *" },
//     { "path": "/api/cron/rss-batch/1", "schedule": "2 */6 * * *" },
//     { "path": "/api/cron/rss-batch/2", "schedule": "4 */6 * * *" },
//     { "path": "/api/cron/rss-batch/3", "schedule": "6 */6 * * *" },
//     { "path": "/api/cron/rss-batch/4", "schedule": "8 */6 * * *" },
//     { "path": "/api/cron/rss-batch/5", "schedule": "10 */6 * * *" },
//     { "path": "/api/cron/rss-batch/6", "schedule": "12 */6 * * *" }
//   ]
// }
