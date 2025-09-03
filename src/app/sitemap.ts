import { getSiteMapData } from "@/server/actions/news.action";
import { newsTopicList } from "@/shared/enum-list";
import { MetadataRoute } from "next";

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

  // Validate base URL exists
  if (!baseUrl) {
    console.error('NEXT_PUBLIC_SITE_URL is not defined');
    return defaultSitemap();
  }

  try {
    const newsList = await getSiteMapData();
    
    // Ensure we have a valid array
    if (!Array.isArray(newsList)) {
      console.log('getSiteMapData did not return an array, using default sitemap');
      return defaultSitemap();
    }

    // Process news URLs with proper validation and encoding
    const newsUrls = newsList
      .filter((news) => {
        return news && 
               news.slug && 
               typeof news.slug === 'string' &&
               news.slug.trim().length > 0 &&
               !news.deletedAt;
      })
      .map((news) => ({
        // Key fix: Next.js automatically handles XML encoding, just ensure clean URLs
        url: `${baseUrl}/${news.slug}`,
        lastModified: news.updatedAt || news.createdAt,
        changeFrequency: "daily" as const,
        priority: news.isFeatured ? 0.9 : news.isBreaking ? 0.95 : 0.7,
      }));

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

    // Topic URLs - Next.js handles URL encoding automatically
    newsTopicList.forEach((topic) => {
      if (topic && typeof topic === 'string') {
        searchParamUrls.push({
          url: `${baseUrl}?topic=${topic}`,
          lastModified: new Date(),
          changeFrequency: "hourly",
          priority: 0.8,
        });
      }
    });

    // Country URLs
    uniqueCountries.forEach((country) => {
      if (country && typeof country === 'string') {
        searchParamUrls.push({
          url: `${baseUrl}?country=${country}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    });

    // Topic + Country combinations (limited to prevent sitemap explosion)
    newsTopicList.slice(0, 10).forEach((topic) => {
      uniqueCountries.slice(0, 5).forEach((country) => {
        if (topic && country && typeof topic === 'string' && typeof country === 'string') {
          searchParamUrls.push({
            url: `${baseUrl}?topic=${topic}&country=${country}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.6,
          });
        }
      });
    });

    const now = new Date();
    const dateRanges = [
      {
        from: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        to: now,
        label: "today",
      },
      {
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        to: now,
        label: "week",
      },
      {
        from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: now,
        label: "month",
      },
    ];

    // Topic + Date range combinations
    newsTopicList.slice(0, 5).forEach((topic) => {
      dateRanges.forEach(({ from, to }) => {
        if (topic && typeof topic === 'string') {
          const fromStr = from.toISOString().split("T")[0];
          const toStr = to.toISOString().split("T")[0];
          searchParamUrls.push({
            url: `${baseUrl}?topic=${topic}&from=${fromStr}&to=${toStr}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.5,
          });
        }
      });
    });

    // Popular search terms
    const popularSearchTerms = [
      "breaking",
      "election",
      "crisis", 
      "update",
      "report",
    ];

    popularSearchTerms.forEach((searchTerm) => {
      searchParamUrls.push({
        url: `${baseUrl}?search=${searchTerm}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.4,
      });
    });

    // Combine all URLs (Google's limit is 50,000 URLs per sitemap)
    const allUrls = [rootPage, ...newsUrls, ...searchParamUrls];
    
    // Return limited sitemap (Next.js will handle XML encoding)
    return allUrls.slice(0, 45000); // Leave room for safety margin

  } catch (error) {
    console.error("Error generating sitemap:", error);
    return defaultSitemap();
  }
}
