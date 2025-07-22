import {
  LocationExtractor,
  RSSFeedResult,
} from "@/server/jobs/location-extractor";
import { urlUtils } from "@/server/utils/urls";
import { Hono } from "hono";
import Parser from "rss-parser";
import { NewsService } from "../services/news.service";
import { NewsSourceService } from "../services/rss.service";

const cronRoutes = new Hono();
const locationExtractor = new LocationExtractor();

const CONFIG = {
  MAX_ITEMS_PER_FEED: 10,
  REQUEST_TIMEOUT: 30_000,
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
} as const;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeUrl = (url: string): string => {
  if (!url.startsWith("http")) return `https://${url}`;
  return url;
};

async function fetchFeedWithRetry(
  parser: Parser,
  url: string,
  retries = CONFIG.MAX_RETRIES
): Promise<Parser.Output<any> | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const sanitizedUrl = sanitizeUrl(url);

      const feed = await Promise.race([
        parser.parseURL(sanitizedUrl),
        new Promise((_, r) => {
          setTimeout(() => {
            r(new Error("Request timeout"));
          }, CONFIG.REQUEST_TIMEOUT);
        }),
      ]);

      return feed as Parser.Output<any>;
    } catch (error: any) {
      if (attempt < retries) {
        await delay(CONFIG.RETRY_DELAY * (attempt + 1));
        continue;
      }

      return null;
    }
  }
  return null;
}

async function processRSSFeeds(): Promise<RSSFeedResult[] | void> {
  console.info("🔘 Starting RSS feed processing");

  const parser = new Parser({
    timeout: CONFIG.REQUEST_TIMEOUT,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RSS-Bot/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  const rssList = await NewsSourceService.getSourcesForFetching();
  console.info(`🔘 Found ${rssList.length} RSS sources`);

  if (!rssList) return console.warn("No RSS sources found");

  const results: RSSFeedResult[] = [];
  const errors: Array<{ source: string; error: string }> = [];

  // Process feeds with controlled concurrency
  const processPromises = rssList.map(async (source) => {
    const sourceUrl = source?.rssUrl?.trim();

    if (!sourceUrl || !urlUtils.isValidUrl(sanitizeUrl(sourceUrl))) {
      errors.push({
        source: source?.name || "Unknown",
        error: `Invalid URL: ${sourceUrl}`,
      });
      return null;
    }

    console.info(`🔘 Processing: ${source?.name || sourceUrl}`);

    const feed = await fetchFeedWithRetry(parser, sourceUrl);

    if (!feed) {
      errors.push({
        source: source?.name || sourceUrl,
        error: "Failed to fetch after retries",
      });
      return null;
    }

    try {
      const rssItems = feed.items
        .slice(0, CONFIG.MAX_ITEMS_PER_FEED)
        .filter((item) => item.title && (item.link || item.content))
        .map((item) => ({
          title: item.title || "",
          link: item.link || "",
          contentSnippet: item.contentSnippet || "",
          content: item.content || "",
        }));

      if (rssItems.length === 0) {
        console.warn(`No valid items found in feed: ${source?.name}`);
        return null;
      }

      const result = await locationExtractor.processFeed(
        rssItems,
        source?.name || sourceUrl,
        feed.title || "Unknown Feed"
      );

      console.info(
        `✅ Successfully processed: ${source?.name} (${rssItems.length} items)`
      );
      return result;
    } catch (error: any) {
      errors.push({ source: source?.name || sourceUrl, error: error.message });
      return null;
    }
  });

  const processedResults = await Promise.allSettled(processPromises);

  processedResults.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      results.push(result.value);
    }
  });

  // Log summary
  console.info(
    `☑️ Processing complete: ${results.length} successful, ${errors.length} failed`
  );
  if (errors.length > 0) {
    console.info(
      "❌ Failed sources:",
      errors.map((error) => error.source)
    );
  }

  return results;
}

export const runRSSJob = async () => {
  console.info("🔂 Starting RSS crawl job");

  try {
    const feeds = await processRSSFeeds();
    if (!feeds || feeds?.length === 0) return "No feeds found";

    console.info("🔂 Saving to database...");
    const result = await NewsService.saveArticle(feeds);

    console.info(`🎉 Job completed: ${result.length} article processed`);
    return result;
  } catch (error: any) {
    console.error("💥 Cron job failed:", error);
    return error;
  }
};
cronRoutes.get("/trigger", async (c) => c.apiJson(await runRSSJob()));

export { cronRoutes };
