import { CATEGORY_KEYWORDS, LOCATION_VALIDATOR } from "@/lib/map-constraint";
import { newsTopicList } from "@/shared/enum-list";

export interface LocationPin {
  latitude: string;
  longitude: string;
  location: string;
  city: string;
  state: string;
  country: string;
}

export interface ProcessedArticle {
  title: string;
  url: string;
  summary: string;
  locationPin: LocationPin;
  topic: (typeof newsTopicList)[number];
}

export interface RSSFeedResult {
  source: string;
  title: string;
  itemCount: number;
  processedItems: number;
  articles: ProcessedArticle[];
}

interface RSSItem {
  title?: string;
  link: string;
  contentSnippet?: string;
  content?: string;
}

interface LocationMatch {
  location: string;
  confidence: number;
}

interface CategoryMatch {
  category: (typeof newsTopicList)[number];
  confidence: number;
}

// location-extractor.ts
export class LocationExtractor {
  private readonly USER_AGENT = "Mozilla/5.0 (compatible; NewsBot/1.0)";
  private readonly TIMEOUT = 8000;

  async processFeed(
    items: RSSItem[],
    sourceName: string,
    feedTitle: string
  ): Promise<RSSFeedResult> {
    const articles: ProcessedArticle[] = [];

    for (const item of items) {
      if (!item.link) continue;

      try {
        const article = await this.processArticle(item);
        if (article) articles.push(article);
      } catch (error) {
        console.warn(`Failed to process article ${item.link}:`, error);
      }
    }

    return {
      source: sourceName,
      title: feedTitle,
      itemCount: items.length,
      processedItems: articles.length,
      articles,
    };
  }

  private async processArticle(
    item: RSSItem
  ): Promise<ProcessedArticle | null> {
    const content = await this.fetchContent(item.link);
    const fullText = this.combineText(item, content);

    const location = this.extractBestLocation(fullText);
    const category = this.extractBestCategory(fullText);

    const locationPin = await this.geocodeLocation(location?.location || "");
    if (!locationPin) return null;

    return {
      locationPin,
      url: item.link,
      title: item.title || "Untitled",
      topic: category?.category || "other",
      summary: item.contentSnippet || item.content || "",
    };
  }

  private async fetchContent(url: string): Promise<string> {
    try {
      const axios = require("axios");
      const cheerio = require("cheerio");

      const { data } = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: { "User-Agent": this.USER_AGENT },
      });

      const $ = cheerio.load(data);
      const removable = `script, style, nav, header, footer, aside, noscript, iframe, object, embed, form, input, button, select, textarea, canvas, svg, video, audio`;
      const addable = `article, .article-content, .entry-content, .post-content, .content-body, main, .content, .text-content, body`;

      $(removable).remove();
      return $(addable)
        .first()
        .text()
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();
    } catch {
      return "";
    }
  }

  private combineText(item: RSSItem, content: string): string {
    return [item.title || "", item.contentSnippet || "", content]
      .join(" ")
      .trim();
  }

  private extractBestLocation(text: string): LocationMatch | null {
    const patterns = [
      {
        regex: /\b([A-Z][a-z]+),\s+([A-Z]{2,}),\s+([A-Z][a-z]+)\b/g,
        confidence: 0.9,
      },
      { regex: /\b([A-Z][a-z]+),\s+([A-Z]{2,})\b/g, confidence: 0.8 },
      {
        regex: /(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
        confidence: 0.6,
      },
    ];

    let bestMatch: LocationMatch | null = null;

    for (const { regex, confidence } of patterns) {
      const match = regex.exec(text);
      if (match && (!bestMatch || confidence > bestMatch.confidence)) {
        const location = match[0].replace(/^(?:in|at|from)\s+/i, "").trim();
        if (this.isValidLocation(location)) {
          bestMatch = { location, confidence };
        }
      }
    }

    return bestMatch;
  }

  private extractBestCategory(text: string): CategoryMatch | null {
    const textLower = text.toLowerCase();
    let bestMatch: CategoryMatch | null = null;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = keywords.filter((keyword) =>
        textLower.includes(keyword)
      ).length;

      if (matches > 0) {
        const confidence = Math.min(0.95, (matches / keywords.length) * 0.9);

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            category: category as (typeof newsTopicList)[number],
            confidence,
          };
        }
      }
    }

    return bestMatch;
  }

  private isValidLocation(location: string): boolean {
    return (
      location.length > 2 &&
      location.length < 50 &&
      /^[A-Z]/.test(location) &&
      !LOCATION_VALIDATOR.invalidTerms.includes(location) &&
      !LOCATION_VALIDATOR.dayNames.some((day) => location.startsWith(day)) &&
      !LOCATION_VALIDATOR.months.some((month) => location.startsWith(month))
    );
  }

  private async geocodeLocation(location: string): Promise<LocationPin | null> {
    if (!location) return null;
    try {
      const axios = require("axios");

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}&limit=1&addressdetails=1`;

      const response = await axios.get(url, {
        headers: { "User-Agent": this.USER_AGENT },
      });

      if (response.data?.[0]) {
        const result = response.data[0];
        const address = result.address || {};

        return {
          latitude: result.lat,
          longitude: result.lon,
          location,
          city: address.city || address.town || address.village || "",
          state: address.state || "",
          country: address.country || "",
        };
      }
    } catch (error) {
      console.warn(`Geocoding failed for ${location}:`, error);
    }

    return null;
  }
}
