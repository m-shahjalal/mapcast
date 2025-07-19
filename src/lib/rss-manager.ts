import axios from "axios";
import * as cheerio from "cheerio";
// @ts-ignore
import { NlpManager } from "node-nlp";

interface LocationResult {
  location: string;
  confidence: number;
}

interface ArticleLocation {
  title: string;
  url: string;
  locations: LocationResult[];
  primary: string | null;
  content: string;
  summary: string;
}

export class LocationExtractor {
  private nlp: NlpManager;

  constructor() {
    this.nlp = new NlpManager({ languages: ["en"], forceNER: true });
  }

  async extractFromArticles(items: any[]): Promise<ArticleLocation[]> {
    const results: ArticleLocation[] = [];

    for (const item of items) {
      if (!item.link) continue;

      try {
        const content = await this.fetchArticle(item.link);
        const text = `${item.title || ""} ${
          item.contentSnippet || ""
        } ${content}`;
        const locations = await this.extractLocations(text);

        results.push({
          title: item.title || "Untitled",
          url: item.link,
          locations,
          primary: this.getPrimaryLocation(locations, text),
          content: item.contentSnippet || item.content || "",
          summary: item.contentSnippet || "",
        });
      } catch (error) {
        console.warn(`Failed to process ${item.link}:`, error);
      }
    }

    return results;
  }

  private async fetchArticle(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
      });

      const $ = cheerio.load(data);
      $("script, style, nav, header, footer").remove();

      return $("article, .article-content, .entry-content, main, p")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000);
    } catch {
      return "";
    }
  }

  private async extractLocations(text: string): Promise<LocationResult[]> {
    const locations = new Set<string>();

    // Pattern-based extraction
    const patterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z]{2,})\b/g, // City, State
      /\b(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, // in Location
      /^([A-Z\s]+)\s*\([^)]+\)\s*[-–—]/m, // Dateline
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && this.isValidLocation(match[1])) {
          locations.add(match[1].trim());
        }
        if (match[2] && this.isValidLocation(match[2])) {
          locations.add(match[2].trim());
        }
      }
    });

    // NLP-based extraction
    try {
      const nlpResult = await this.nlp.process("en", text);
      nlpResult.entities
        ?.filter((e: any) => ["location", "city", "country"].includes(e.entity))
        .forEach((e: any) => {
          if (this.isValidLocation(e.sourceText)) {
            locations.add(e.sourceText);
          }
        });
    } catch (error) {
      console.warn("NLP extraction failed:", error);
    }

    return Array.from(locations)
      .map((loc) => ({
        location: loc,
        confidence: this.calculateConfidence(loc, text),
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private isValidLocation(loc: string): boolean {
    return (
      loc.length > 2 &&
      loc.length < 50 &&
      /^[A-Z]/.test(loc) &&
      !/^\d+$/.test(loc) &&
      !["News", "Reuters", "AP", "CNN", "BBC", "Police", "Today"].includes(loc)
    );
  }

  private calculateConfidence(location: string, text: string): number {
    const frequency = (text.match(new RegExp(location, "gi")) || []).length;
    const firstIndex = text.toLowerCase().indexOf(location.toLowerCase());
    const positionScore = Math.max(0, 1 - firstIndex / text.length);

    return Math.min(0.3 + frequency * 0.2 + positionScore * 0.5, 1.0);
  }

  private getPrimaryLocation(
    locations: LocationResult[],
    text: string
  ): string | null {
    if (locations.length === 0) return null;

    return locations.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    ).location;
  }
}
