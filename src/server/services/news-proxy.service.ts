import * as cheerio from "cheerio";
import { createHash } from "crypto";

interface NewsContent {
  title: string;
  body: string;
  url: string;
  extractedAt: string;
  hash: string;
}

interface CacheEntry {
  content: NewsContent;
  expiresAt: number;
}

export class NewsProxyService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async fetchAndExtract(url: string): Promise<NewsContent> {
    const hash = this.createHash(url);

    // Check cache first
    const cached = this.getCached(hash);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the URL");
      }

      const html = await response.text();
      const content = this.extractContent(html, url, hash);

      // Cache the result
      this.setCached(hash, content);

      return content;
    } catch (error) {
      console.error("Error fetching or extracting content:", error);
      throw new Error("Error fetching or extracting content");
    }
  }

  getCached(hash: string): NewsContent | null {
    const entry = this.cache.get(hash);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hash);
      return null;
    }

    return entry.content;
  }

  private setCached(hash: string, content: NewsContent): void {
    this.cache.set(hash, {
      content,
      expiresAt: Date.now() + this.CACHE_DURATION,
    });
  }

  private extractContent(html: string, url: string, hash: string): NewsContent {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    this.removeUnwantedElements($);

    const title = this.extractTitle($);
    const body = this.extractBody($);

    return {
      title,
      body,
      url,
      extractedAt: new Date().toISOString(),
      hash,
    };
  }

  private removeUnwantedElements($: cheerio.CheerioAPI): void {
    const unwantedSelectors = [
      "script",
      "style",
      "nav",
      "header",
      "footer",
      "aside",
      ".ad",
      ".advertisement",
      ".social-share",
      ".comments",
      '[class*="ad-"]',
      '[id*="ad-"]',
      '[class*="social"]',
      ".sidebar",
      ".related-articles",
      ".newsletter-signup",
    ];

    unwantedSelectors.forEach((selector) => {
      $(selector).remove();
    });
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    const selectors = [
      "h1",
      "title",
      '[class*="title"]',
      '[class*="headline"]',
      '[class*="header"]',
    ];

    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 10) {
        return text.substring(0, 200);
      }
    }

    return "Article";
  }

  private extractBody($: cheerio.CheerioAPI): string {
    const contentSelectors = [
      "article",
      '[class*="content"]',
      '[class*="article"]',
      '[class*="body"]',
      '[class*="text"]',
      ".post-content",
      ".entry-content",
      "main",
      '[role="main"]',
    ];

    // Try structured content first
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim();
        if (text.length > 300) {
          // Clean up and return HTML
          element.find("script, style, .ad, .advertisement").remove();
          const html = element.html();
          if (html) {
            return this.cleanHtml(html);
          }
        }
      }
    }

    // Fallback: collect paragraphs
    const paragraphs: string[] = [];
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 50) {
        paragraphs.push(text);
      }
    });

    if (paragraphs.length > 0) {
      return paragraphs.join("\n\n").substring(0, 10000);
    }

    return "Content could not be extracted from this article.";
  }

  private cleanHtml(html: string): string {
    // Remove dangerous attributes and clean up HTML
    const $ = cheerio.load(`<div>${html}</div>`);

    // Remove dangerous attributes
    $("*").each((_, el) => {
      const element = $(el);
      ["onclick", "onload", "onerror", "javascript:", "vbscript:"].forEach(
        (attr) => {
          element.removeAttr(attr);
        }
      );
    });

    // Remove empty elements
    $("*").each((_, el) => {
      const element = $(el);
      if (!element.text().trim() && !element.find("img").length) {
        element.remove();
      }
    });

    return $.html().substring(0, 10000);
  }

  private getHeaders(): Record<string, string> {
    return {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Cache-Control": "max-age=0",
    };
  }

  private createHash(url: string): string {
    return createHash("md5").update(url).digest("hex");
  }

  // Cleanup method for expired cache entries
  cleanupCache(): void {
    const now = Date.now();
    for (const [hash, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(hash);
      }
    }
  }
}
