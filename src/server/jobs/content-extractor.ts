import axios, { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";

interface ContentResult {
  title: string;
  content: string;
  url: string;
  extractedAt: string;
}

interface ExtractorConfig {
  timeout?: number;
  userAgent?: string;
  unwantedTags?: string[];
  contentSelectors?: string[];
}

class ContentExtractor {
  private readonly timeout: number;
  private readonly userAgent: string;
  private readonly unwantedTags: string[];
  private readonly contentSelectors: string[];

  constructor(config: ExtractorConfig = {}) {
    this.timeout = config.timeout || 10000;
    this.userAgent =
      config.userAgent || "Mozilla/5.0 (compatible; ContentBot/1.0)";
    this.unwantedTags = config.unwantedTags || this.getDefaultUnwantedTags();
    this.contentSelectors =
      config.contentSelectors || this.getDefaultContentSelectors();
  }

  private getDefaultUnwantedTags(): string[] {
    return [
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
    ];
  }

  private getDefaultContentSelectors(): string[] {
    return [
      "article",
      ".article-content",
      ".entry-content",
      ".post-content",
      ".content-body",
      "main",
      ".content",
      ".text-content",
      "body",
    ];
  }

  async fetchCleanContent(url: string): Promise<string> {
    try {
      const requestConfig: AxiosRequestConfig = {
        timeout: this.timeout,
        headers: { "User-Agent": this.userAgent },
      };

      const { data } = await axios.get<string>(url, requestConfig);
      return this.extractTextContent(data);
    } catch (error) {
      throw new Error(
        `Failed to fetch content from ${url}: ${this.getErrorMessage(error)}`
      );
    }
  }

  extractTextContent(html: string): string {
    const $ = cheerio.load(html);

    this.removeUnwantedTags($);
    const content = this.findBestContent($);

    return this.cleanText(content);
  }

  private removeUnwantedTags($: cheerio.CheerioAPI): void {
    this.unwantedTags.forEach((tag) => $(tag).remove());
  }

  private findBestContent($: cheerio.CheerioAPI): string {
    for (const selector of this.contentSelectors) {
      const element = $(selector).first();
      const text = element.text().trim();

      if (element.length && text.length > 100) {
        return text;
      }
    }

    return $("body").text() || "";
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();
  }

  async fetchContentWithMeta(url: string): Promise<ContentResult> {
    try {
      const requestConfig: AxiosRequestConfig = {
        timeout: this.timeout,
        headers: { "User-Agent": this.userAgent },
      };

      const { data } = await axios.get<string>(url, requestConfig);
      const $ = cheerio.load(data);

      return {
        title: this.extractTitle($),
        content: this.extractTextContent(data),
        url,
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch content with meta from ${url}: ${this.getErrorMessage(
          error
        )}`
      );
    }
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    return (
      $("title").text().trim() ||
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      "Untitled"
    );
  }

  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.status
        ? `HTTP ${error.response.status}: ${error.message}`
        : error.message;
    }
    return error instanceof Error ? error.message : "Unknown error";
  }

  // Utility method to validate URL
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Usage examples with proper typing
async function basicUsage(): Promise<void> {
  const extractor = new ContentExtractor();

  try {
    const url = "https://example.com/article";

    if (!ContentExtractor.isValidUrl(url)) {
      throw new Error("Invalid URL provided");
    }

    const content: string = await extractor.fetchCleanContent(url);
    console.log("Clean content:", content);
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

async function metaUsage(): Promise<void> {
  const extractor = new ContentExtractor({
    timeout: 15000,
    userAgent: "MyBot/1.0",
  });

  try {
    const result: ContentResult = await extractor.fetchContentWithMeta(
      "https://example.com/article"
    );
    console.log(`Title: ${result.title}`);
    console.log(`Content length: ${result.content.length}`);
    console.log(`Extracted at: ${result.extractedAt}`);
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export default ContentExtractor;
