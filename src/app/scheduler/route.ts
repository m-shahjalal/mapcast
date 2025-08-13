import { processByAI } from "@/server/actions/rss-crowler";

const scheduler = async () => {
  try {
    const result = await processByAI();
    console.info("✅ Feeds read successfully");
  } catch (error: any) {
    console.error("❌ Error reading feeds:", error.message);
  } finally {
    console.info("🔂 Reading feeds again tomorrow...");
  }
};

export const GET = scheduler;
