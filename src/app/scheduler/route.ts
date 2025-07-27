import { startReadingFeeds } from "@/server/feed-reader/rss-processor";

const scheduler = async () => {
  try {
    await startReadingFeeds();
    console.info("✅ Feeds read successfully");
  } catch (error: any) {
    console.error("❌ Error reading feeds:", error.message);
  } finally {
    console.info("🔂 Reading feeds again tomorrow...");
  }
};

export const GET = scheduler;
