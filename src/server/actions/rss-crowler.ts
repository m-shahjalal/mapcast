"use server";

import { getResultFromAI } from "@/lib/openai";
import { RSSScraper } from "@/lib/scraper";
import { AINewsResponse, NewsArticle } from "@/types/ai-data-format";
import { NewsService } from "../services/news.service";
import { NewsSourceService } from "../services/rss.service";

const scraper = new RSSScraper();

export const processByAI = async () => {
  console.info("🔂 Processing RSS sources by AI has started");

  const processedArticles = [];
  let successCount = 0;
  let failedCount = 0;

  try {
    const urls = await NewsSourceService.getActiveUrls();
    console.log(`📡 Found ${urls.length} active RSS sources\n`);

    const articles = await scraper.scrapeArticles(urls);
    console.log(`📰 Scraped ${articles.length} articles to process`);

    if (articles.length === 0) {
      console.warn("⚠️  No articles found to process");
      return { success: true, data: [], processed: 0, failed: 0 };
    }

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(
        `\n🔄 Processing article ${i + 1}/${
          articles.length
        }: "${article.title.substring(0, 50)}..."`
      );

      try {
        // Step 1: AI Analysis
        const analyzedData = await getResultFromAI(article);
        if (!analyzedData) {
          console.log(`⏭️  Skipping - AI analysis failed \n`);
          failedCount++;
          continue;
        }

        // Step 2: Geocoding
        const finalData = await getFinalDataWithLatLong(analyzedData);
        if (!finalData) {
          console.log(`⏭️  Skipping - geocoding failed`);
          failedCount++;
          continue;
        }

        // Step 3: Save to database
        const saveData = await NewsService.saveArticle(finalData);
        if (!saveData) {
          console.log(`⏭️  Skipping - save failed (likely duplicate)`);
          continue;
        }

        // Success!
        processedArticles.push(saveData);
        successCount++;
        console.log(`✅ Successfully processed article ${i + 1}\n`);
      } catch (articleError) {
        console.error(
          `❌ Failed to process article "${article.title}":`,
          articleError
        );
        failedCount++;
        continue;
      }

      // Add delay between articles to be nice to APIs
      if (i < articles.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Summary
    console.log(`\n🎉 Processing complete!`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(
      `📊 Success rate: ${Math.round((successCount / articles.length) * 100)}%`
    );

    return {
      success: true,
      data: processedArticles,
      stats: {
        total: articles.length,
        processed: successCount,
        failed: failedCount,
        successRate: Math.round((successCount / articles.length) * 100),
      },
    };
  } catch (error) {
    console.error("🔂 Critical processing error:", error);

    return {
      success: false,
      error: "Failed to process by AI",
      stats: {
        total: 0,
        processed: successCount,
        failed: failedCount,
        successRate: 0,
      },
    };
  }
};

const getFinalDataWithLatLong = async (
  news: AINewsResponse
): Promise<NewsArticle | void> => {
  console.log(`🌍 Geocoding location: "${news.locationName}"`);

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      news.locationName
    )}&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "NewsApp/1.0 (contact@newsapp.com)" },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const [result] = await response.json();

    console.log(`❌ No data found with this ${news.locationName}`);
    if (!result) return;
    const address = result.address;

    const location = {
      name: result.display_name,
      city: address.city || address.town || address.village || "Unknown",
      state: address.state || "",
      country: address.country || "Unknown",
      code: address.country_code?.toUpperCase() || "",
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };

    console.log(`🎯 Success: ${location.city}, ${location.country}`);
    return { ...news, location };
  } catch (error) {
    console.error(`❌ Geocoding failed:`, error);
  }
};
