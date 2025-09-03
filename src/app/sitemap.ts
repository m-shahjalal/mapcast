import { getSiteMapData } from "@/server/actions/news.action";
import { newsTopicList } from "@/shared/enum-list";
import { MetadataRoute } from "next";

// Helper to clean XML-breaking characters from data
const cleanXMLString = (str: string | null | undefined): string => {
  if (!str) return '';
  
  return str
    .replace(/&/g, '&amp;')     // Must be first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
};

// Helper to validate and clean URLs
const createSafeUrl = (baseUrl: string, path: string): string => {
  try {
    // Clean the path of XML-breaking characters
    const cleanPath = cleanXMLString(path);
    const url = `${baseUrl}/${cleanPath}`;
    
    // Validate URL format
    new URL(url);
    return url;
  } catch (error) {
    console.error(`Invalid URL created: ${baseUrl}/${path}`, error);
    return baseUrl; // Fallback to base URL
  }
};

const defaultSitemap = (): MetadataRoute.Sitemap => {
  return [
    {
      url: process.env.NEXT_PUBLIC_SITE_URL!,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
  ];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_SITE_URL is not defined');
    return defaultSitemap();
  }

  try {
    console.log('Starting sitemap generation...');
    const newsList = await getSiteMapData();
    
    if (!Array.isArray(newsList)) {
      console.log('getSiteMapData did not return an array');
      return defaultSitemap();
    }

    console.log(`Processing ${newsList.length} news items`);

    // Debug: Check for problematic characters in the data
    const problematicItems: any[] = [];
    
    newsList.forEach((news, index) => {
      if (news && news.slug) {
        const hasAmpersand = news.slug.includes('&');
        const hasOtherXMLChars = /[<>"']/.test(news.slug);
        const hasTitle = news.title && (/[&<>"']/.test(news.title));
        
        if (hasAmpersand || hasOtherXMLChars || hasTitle) {
          problematicItems.push({
            index,
            id: news.id,
            slug: news.slug,
            title: news.title?.substring(0, 100),
            hasAmpersand,
            hasOtherXMLChars,
            hasTitle
          });
        }
      }
    });

    if (problematicItems.length > 0) {
      console.log('Found problematic items with XML-breaking characters:');
      console.log(JSON.stringify(problematicItems.slice(0, 10), null, 2));
    }

    // Process news URLs with XML cleaning
    const newsUrls = newsList
      .filter((news) => {
        return news && 
               news.slug && 
               typeof news.slug === 'string' &&
               news.slug.trim().length > 0 &&
               !news.deletedAt;
      })
      .map((news, index) => {
        try {
          return {
            url: createSafeUrl(baseUrl, news.slug),
            lastModified: news.updatedAt || news.createdAt,
            changeFrequency: "daily" as const,
            priority: news.isFeatured ? 0.9 : news.isBreaking ? 0.95 : 0.7,
          };
        } catch (error) {
          console.error(`Error processing news item at index ${index}:`, error);
          console.error('News item:', { id: news.id, slug: news.slug, title: news.title?.substring(0, 50) });
          return null;
        }
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

    const rootPage = {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1.0,
    };

    const uniqueCountries = [
      ...new Set(
        newsList
          .filter((news) => news && news.countryCode && typeof news.countryCode === 'string')
          .map((news) => news.countryCode)
      ),
    ];

    const searchParamUrls: MetadataRoute.Sitemap = [];

    // Clean topic names and create URLs
    newsTopicList.forEach((topic) => {
      if (topic && typeof topic === 'string') {
        const cleanTopic = cleanXMLString(topic);
        searchParamUrls.push({
          url: `${baseUrl}?topic=${encodeURIComponent(cleanTopic)}`,
          lastModified: new Date(),
          changeFrequency: "hourly",
          priority: 0.8,
        });
      }
    });

    // Clean country codes and create URLs
    uniqueCountries.forEach((country) => {
      if (country && typeof country === 'string') {
        const cleanCountry = cleanXMLString(country);
        searchParamUrls.push({
          url: `${baseUrl}?country=${encodeURIComponent(cleanCountry)}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    });

    // Topic + Country combinations (limited)
    newsTopicList.slice(0, 5).forEach((topic) => {
      uniqueCountries.slice(0, 3).forEach((country) => {
        if (topic && country) {
          const cleanTopic = cleanXMLString(topic);
          const cleanCountry = cleanXMLString(country);
          searchParamUrls.push({
            url: `${baseUrl}?topic=${encodeURIComponent(cleanTopic)}&country=${encodeURIComponent(cleanCountry)}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.6,
          });
        }
      });
    });

    // Simple date ranges
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dateRanges = [
      { from: yesterday, to: now, label: "today" },
      { from: weekAgo, to: now, label: "week" },
    ];

    // Add some date range URLs
    newsTopicList.slice(0, 3).forEach((topic) => {
      dateRanges.forEach(({ from, to }) => {
        if (topic) {
          const cleanTopic = cleanXMLString(topic);
          const fromStr = from.toISOString().split("T")[0];
          const toStr = to.toISOString().split("T")[0];
          searchParamUrls.push({
            url: `${baseUrl}?topic=${encodeURIComponent(cleanTopic)}&from=${fromStr}&to=${toStr}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.5,
          });
        }
      });
    });

    const allUrls = [rootPage, ...newsUrls, ...searchParamUrls.slice(0, 200)];
    
    console.log(`Generated sitemap with ${allUrls.length} URLs`);
    
    // Final validation
    const validUrls = allUrls.filter((item, index) => {
      try {
        new URL(item.url);
        return true;
      } catch (error) {
        console.error(`Invalid URL at index ${index}: ${item.url}`);
        return false;
      }
    });

    console.log(`Final sitemap has ${validUrls.length} valid URLs`);
    return validUrls.length > 0 ? validUrls : defaultSitemap();

  } catch (error) {
    console.error("Error generating sitemap:", error);
    return defaultSitemap();
  }
}
