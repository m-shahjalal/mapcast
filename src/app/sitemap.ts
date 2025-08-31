import { getSiteMapData } from "@/server/actions/news.action";
import { newsTopicList } from "@/shared/enum-list";
import { MetadataRoute } from "next";

const defaultSitemap = () => {
  return [
    {
      url: process.env.NEXT_PUBLIC_SITE_URL!,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1.0,
    },
  ];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  try {
    const newsList = await getSiteMapData();
    if (!Array.isArray(newsList)) return defaultSitemap();

    const newsUrls = newsList
      .filter((news) => !news.deletedAt && news.slug)
      .map((news) => ({
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
          .filter((news) => !news.deletedAt && news.countryCode)
          .map((news) => news.countryCode)
      ),
    ];

    const searchParamUrls: MetadataRoute.Sitemap = [];

    newsTopicList.forEach((topic) => {
      searchParamUrls.push({
        url: `${baseUrl}?topic=${topic}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      });
    });

    uniqueCountries.forEach((country) => {
      searchParamUrls.push({
        url: `${baseUrl}?country=${country}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      });
    });

    newsTopicList.forEach((topic) => {
      uniqueCountries.slice(0, 10).forEach((country) => {
        searchParamUrls.push({
          url: `${baseUrl}?topic=${topic}&country=${country}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.6,
        });
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
    newsTopicList.forEach((topic) => {
      dateRanges.forEach(({ from, to }) => {
        const fromStr = from.toISOString().split("T")[0];
        const toStr = to.toISOString().split("T")[0];
        searchParamUrls.push({
          url: `${baseUrl}?topic=${topic}&from=${fromStr}&to=${toStr}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.5,
        });
      });
    });

    // 5. Popular search terms (if you have common search queries)
    const popularSearchTerms = [
      "breaking",
      "election",
      "crisis",
      "update",
      "report",
    ];

    popularSearchTerms.forEach((searchTerm) => {
      searchParamUrls.push({
        url: `${baseUrl}?search=${encodeURIComponent(searchTerm)}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.4,
      });
    });

    return [rootPage, ...newsUrls, ...searchParamUrls.slice(0, 300)];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return defaultSitemap();
  }
}
