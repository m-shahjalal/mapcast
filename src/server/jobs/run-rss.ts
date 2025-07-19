import { Hono } from "hono";
import { NewsSourceService } from "../services/rss.service";
import Parser from "rss-parser";
import { LocationExtractor } from "@/lib/rss-manager";

const cronRoutes = new Hono();
const locationExtractor = new LocationExtractor();

async function fetchRssFeeds() {
  const parser = new Parser();
  try {
    const rssList = await NewsSourceService.getSourcesForFetching();
    if (!rssList) return;

    const result = [];

    for (const source of rssList) {
      const feed = await parser.parseURL(source.rssUrl);

      // Extract locations from feed items
      const articlesWithLocations = await locationExtractor.extractFromArticles(
        feed.items.slice(0, 10) // Process first 10 items per feed
      );

      result.push({
        source: source.rssUrl,
        title: feed.title,
        itemCount: feed.items.length,
        processedItems: articlesWithLocations.length,
        articles: articlesWithLocations,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching RSS:", error);
    throw error;
  }
}

// Uncomment for actual cron usage
// cron.schedule("0 */6 * * *", async () => {
//   console.log("Running RSS location extraction...");
//   const result = await fetchRssFeeds();
//   console.log(`Processed ${result?.length || 0} feeds`);
// });

cronRoutes.get("/trigger", async (c) => {
  try {
    const result = await fetchRssFeeds();
    return c.json({
      success: true,
      timestamp: new Date().toISOString(),
      feeds: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
});

cronRoutes.get("/test-single", async (c) => {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL("https://rss.cnn.com/rss/edition.rss");

    const result = await locationExtractor.extractFromArticles(
      feed.items.slice(0, 3) // Test with 3 articles
    );

    return c.json({
      success: true,
      feedTitle: feed.title,
      articles: result,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export { cronRoutes };
