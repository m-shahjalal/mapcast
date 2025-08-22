import { getNewsMapData } from "@/server/actions/news.action";
import { newsTopicList } from "@/shared/enum-list";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  try {
    const newsList = await getNewsMapData();

    if (!Array.isArray(newsList))
      return [
        {
          url: baseUrl,
          lastModified: new Date(),
          changeFrequency: "hourly" as const,
          priority: 1,
        },
      ];

    const newsUrls = newsList
      .filter((news) => !news.deletedAt)
      .map((news) => ({
        url: `${baseUrl}/${news.slug}`,
        lastModified: news.updatedAt || news.createdAt,
        changeFrequency: "hourly" as const,
        priority: news.isFeatured ? 0.9 : news.isBreaking ? 0.95 : 0.7,
      }));

    const staticPages = newsTopicList.map((topic) => ({
      url: `${baseUrl}/${topic}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.7,
    }));

    const rootPage = {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    };

    return [...staticPages, ...newsUrls, rootPage];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 1,
      },
    ];
  }
}
