// types.ts
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
  locationPin: LocationPin | null;
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
    console.log("🔘 processing article");
    const fullText = this.combineText(item, content);

    const locations = this.extractLocations(fullText);
    const locationPin =
      locations.length > 0
        ? await this.geocodeLocation(locations[0].location)
        : null;

    return {
      title: item.title || "Untitled",
      url: item.link,
      summary: item.contentSnippet || item.content || "",
      locationPin,
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
      $(
        [
          "script",
          "style",
          "nav",
          "header",
          "footer",
          "aside",
          "noscript",
          "iframe",
          "object",
          "embed",
          "form",
          "input",
          "button",
          "select",
          "textarea",
          "canvas",
          "svg",
          "video",
          "audio",
        ].join(", ")
      ).remove();

      return $(
        [
          "article",
          ".article-content",
          ".entry-content",
          ".post-content",
          ".content-body",
          "main",
          ".content",
          ".text-content",
          "body",
        ].join(", ")
      )
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

  private extractLocations(text: string): LocationMatch[] {
    const locations = new Map<string, LocationMatch>();

    const patterns = [
      {
        regex:
          /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z]{2,}),\s+([A-Z][a-z]+)\b/g,
        confidence: 0.9,
      },
      {
        regex: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z]{2,})\b/g,
        confidence: 0.8,
      },
      {
        regex: /\b(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g,
        confidence: 0.6,
      },
    ];

    patterns.forEach(({ regex, confidence }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        const location = match[0].replace(/^(?:in|at|from)\s+/i, "").trim();

        if (this.isValidLocation(location)) {
          const key = location.toLowerCase();
          if (
            !locations.has(key) ||
            locations.get(key)!.confidence < confidence
          ) {
            locations.set(key, { location, confidence });
          }
        }
      }
    });

    return Array.from(locations.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  private isValidLocation(location: string): boolean {
    const invalidTerms = [
      "News",
      "Reuters",
      "AP",
      "CNN",
      "BBC",
      "Today",
      "Police",
    ];
    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (
      location.length > 2 &&
      location.length < 50 &&
      /^[A-Z]/.test(location) &&
      !invalidTerms.includes(location) &&
      !dayNames.some((day) => location.startsWith(day)) &&
      !months.some((month) => location.startsWith(month))
    );
  }

  private async geocodeLocation(location: string): Promise<LocationPin | null> {
    try {
      const axios = require("axios");

      // Using free Nominatim API
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
          location: location,
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
