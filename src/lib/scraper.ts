import { ArticleScalation, RSSSource } from "@/types/ai-data-format";
import * as cheerio from "cheerio";

export class RSSScraper {
  private readonly processedUrls = new Set<string>();
  private readonly requestDelay = 1000;
  private readonly minContentLength = 100;

  async scrapeArticles(sources: RSSSource[]): Promise<ArticleScalation[]> {
    console.log(`🚀 Starting scrape for ${sources.length} RSS sources`);

    const allArticles: ArticleScalation[] = [];

    for (const source of sources) {
      try {
        const articles = await this.scrapeFromSource(source);
        allArticles.push(...articles);
        console.log(`✅ ${source.name}: ${articles.length} articles`);
      } catch (error) {
        console.error(`❌ Failed to scrape ${source.name}:`, error);
      }
    }

    console.log(`🎉 Total articles scraped: ${allArticles.length}`);
    return allArticles;
  }

  private async scrapeFromSource(
    source: RSSSource
  ): Promise<ArticleScalation[]> {
    const rssContent = await this.fetchContent(source.url);
    const articleData = this.extractArticleData(rssContent);
    const articles: ArticleScalation[] = [];

    console.log(`📄 Found ${articleData.length} articles in RSS feed`);

    for (const { url, rssDate } of articleData) {
      if (this.isAlreadyProcessed(url)) continue;

      const article = await this.scrapeArticle(url, source, rssDate);
      if (article) {
        articles.push(article);
        this.markAsProcessed(url);
      }

      await this.delay();
    }

    return articles;
  }

  private async scrapeArticle(
    url: string,
    source: RSSSource,
    rssDate?: string
  ): Promise<ArticleScalation | null> {
    try {
      console.log(`🔍 Scraping: ${url}`);

      const html = await this.fetchContent(url);
      const $ = cheerio.load(html);

      const title = this.extractTitle($);
      const content = this.extractContent($);
      const publishedAt = this.extractPublishDate($, html, rssDate);

      if (!this.isValidArticle(title, content)) {
        return null;
      }

      console.log(`📅 Publish date: ${publishedAt.toISOString()}`);

      return {
        title,
        content,
        url,
        source: source.source,
        sourceName: source.name,
        publishedAt,
        language: source.language,
      };
    } catch (error) {
      console.error(`❌ Failed to scrape article ${url}:`, error);
      return null;
    }
  }

  private extractArticleData(
    rssContent: string
  ): Array<{ url: string; rssDate?: string }> {
    const $ = cheerio.load(rssContent, { xmlMode: true });
    const articles: Array<{ url: string; rssDate?: string }> = [];

    // RSS 2.0 format
    $("item").each((_, item) => {
      const url = $(item).find("link").text().trim();
      const pubDate = $(item).find("pubDate").text().trim();

      if (url) {
        articles.push({ url, rssDate: pubDate || undefined });
      }
    });

    // Atom format
    $("entry").each((_, entry) => {
      const url = $(entry).find("link").attr("href");
      const published = $(entry).find("published").text().trim();
      const updated = $(entry).find("updated").text().trim();

      if (url) {
        articles.push({ url, rssDate: published || updated || undefined });
      }
    });

    return articles;
  }

  private extractPublishDate(
    $: cheerio.CheerioAPI,
    html: string,
    rssDate?: string
  ): Date {
    console.log(`📅 Extracting publish date...`);

    try {
      // Try RSS date first (most reliable)
      if (rssDate) {
        const rssDateParsed = this.parseDate(rssDate);
        if (rssDateParsed) {
          console.log(`🎯 Found RSS date: ${rssDateParsed.toISOString()}`);
          return rssDateParsed;
        }
      }

      // Try JSON-LD structured data
      const jsonLdDate = this.extractFromJsonLd($);
      if (jsonLdDate) {
        console.log(`🎯 Found JSON-LD date: ${jsonLdDate.toISOString()}`);
        return jsonLdDate;
      }

      // Try meta tags
      const metaDate = this.extractFromMetaTags($);
      if (metaDate) {
        console.log(`🎯 Found meta tag date: ${metaDate.toISOString()}`);
        return metaDate;
      }

      // Try time elements
      const timeDate = this.extractFromTimeElements($);
      if (timeDate) {
        console.log(`🎯 Found time element date: ${timeDate.toISOString()}`);
        return timeDate;
      }

      // Try common selectors
      const selectorDate = this.extractFromSelectors($);
      if (selectorDate) {
        console.log(`🎯 Found selector date: ${selectorDate.toISOString()}`);
        return selectorDate;
      }

      console.warn(`⚠️  No publish date found, using current date`);
      return new Date();
    } catch (error) {
      console.error(`❌ Error extracting publish date:`, error);
      return new Date();
    }
  }

  private extractFromJsonLd($: cheerio.CheerioAPI): Date | null {
    const scripts = $('script[type="application/ld+json"]');

    for (let i = 0; i < scripts.length; i++) {
      try {
        const jsonText = $(scripts[i]).html();
        if (!jsonText) continue;

        const data = JSON.parse(jsonText);
        const dateFields = ["datePublished", "dateCreated", "publishedDate"];

        for (const field of dateFields) {
          if (data[field]) {
            return this.parseDate(data[field]);
          }
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  private extractFromMetaTags($: cheerio.CheerioAPI): Date | null {
    const metaSelectors = [
      'meta[property="article:published_time"]',
      'meta[property="og:published_time"]',
      'meta[name="publish_date"]',
      'meta[name="publication_date"]',
      'meta[name="date"]',
      'meta[itemprop="datePublished"]',
    ];

    for (const selector of metaSelectors) {
      const content = $(selector).attr("content");
      if (content) {
        const date = this.parseDate(content);
        if (date) return date;
      }
    }

    return null;
  }

  private extractFromTimeElements($: cheerio.CheerioAPI): Date | null {
    const timeSelectors = [
      "time[datetime]",
      '[itemprop="datePublished"]',
      '[itemprop="dateCreated"]',
    ];

    for (const selector of timeSelectors) {
      const element = $(selector).first();
      const datetime =
        element.attr("datetime") || element.attr("content") || element.text();

      if (datetime) {
        const date = this.parseDate(datetime);
        if (date) return date;
      }
    }

    return null;
  }

  private extractFromSelectors($: cheerio.CheerioAPI): Date | null {
    const commonSelectors = [
      ".publish-date",
      ".publication-date",
      ".post-date",
      ".article-date",
      ".date-published",
      ".entry-date",
      ".byline-date",
      ".timestamp",
    ];

    for (const selector of commonSelectors) {
      const element = $(selector).first();
      const text = element.text().trim();

      if (text) {
        const date = this.parseDate(text);
        if (date) return date;
      }
    }

    return null;
  }

  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    try {
      const cleaned = dateString.trim();
      const isoDate = new Date(cleaned);

      if (!isNaN(isoDate.getTime()) && isoDate.getFullYear() > 2000) {
        return isoDate;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    const selectors = ["h1", "title", '[property="og:title"]'];

    for (const selector of selectors) {
      const title =
        $(selector).first().text().trim() ||
        $(selector).first().attr("content");
      if (title) return title;
    }

    return "";
  }

  private extractContent($: cheerio.CheerioAPI): string {
    $("script, style, nav, header, footer, aside, .ads").remove();

    const contentSelectors = [
      "article",
      ".article-content",
      ".post-content",
      ".entry-content",
      ".content",
      "main",
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const text = this.cleanText(element.text());
        if (text.length > 200) return text;
      }
    }

    return this.cleanText($("body").text());
  }

  private async fetchContent(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
  }

  private isValidArticle(title: string, content: string): boolean {
    if (!title || !content) {
      console.log("⚠️  Missing title or content");
      return false;
    }

    if (content.length < this.minContentLength) {
      console.log(`⚠️  Content too short: ${content.length} chars`);
      return false;
    }

    return true;
  }

  private isAlreadyProcessed(url: string): boolean {
    const processed = this.processedUrls.has(url);
    if (processed) {
      console.log(`⏭️  Skipping already processed: ${url}`);
    }
    return processed;
  }

  private markAsProcessed(url: string): void {
    this.processedUrls.add(url);
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.requestDelay));
  }
}
