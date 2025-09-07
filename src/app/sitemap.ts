import { getSiteMapData } from "@/server/actions/news.action";
import { newsTopicList } from "@/shared/enum-list";
import { MapCastFilters } from "@/types/query-filter";
import { MetadataRoute } from "next";

const createXMLSafeUrl = (
  baseUrl: string,
  path?: string,
  params?: MapCastFilters
): string => {
  let url = baseUrl;

  if (path) {
    const cleanPath = path
      .replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=]/g, "")
      .replace(/^\/+/, "");
    url += `/${cleanPath}`;
  }

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    const queryString = searchParams.toString();
    url += `?${queryString}`;
  }

  return url;
};

const createEntry = (
  link: string,
  lastModified: Date = new Date(),
  changeFrequency: "always" | "hourly" | "daily" | "never" = "daily",
  priority: number = 0.5
) => {
  const url = link.replace(/&/g, "&amp;");
  return { url, lastModified, changeFrequency, priority };
};

const getDefaultSitemap = (baseUrl: string): MetadataRoute.Sitemap => [
  createEntry(baseUrl, new Date(), "daily", 1.0),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) return [];

  try {
    const newsList = await getSiteMapData();

    if (!Array.isArray(newsList)) {
      return getDefaultSitemap(baseUrl);
    }

    const sitemapEntries: MetadataRoute.Sitemap = [];
    sitemapEntries.push(createEntry(baseUrl, new Date(), "hourly", 1.0));

    newsList
      .filter((news) => news?.slug && !news?.deletedAt)
      .forEach((news) => {
        const url = createXMLSafeUrl(baseUrl, news.slug);
        const priority = news.isFeatured ? 0.9 : news.isBreaking ? 0.95 : 0.7;
        const lastModified = new Date(news.updatedAt || news.createdAt);

        sitemapEntries.push(createEntry(url, lastModified, "daily", priority));
      });

    newsTopicList.slice(0, 10).forEach((topic) => {
      if (!topic) return;
      const url = createXMLSafeUrl(baseUrl, undefined, { topic });
      sitemapEntries.push(createEntry(url, new Date(), "daily", 0.8));
    });

    const c = newsList.filter((n) => n?.countryCode).map((n) => n.countryCode);
    const uniqueCountries = [...new Set(c)].slice(0, 15);

    uniqueCountries.forEach((country) => {
      if (!country) return;
      const url = createXMLSafeUrl(baseUrl, undefined, { country } as any);
      sitemapEntries.push(createEntry(url, new Date(), "daily", 0.7));
    });

    const popularTopics = newsTopicList.slice(0, 5);
    const popularCountries = uniqueCountries.slice(0, 5);

    popularTopics.forEach((topic) => {
      popularCountries.forEach((country) => {
        if (topic && country) {
          const url = createXMLSafeUrl(baseUrl, undefined, { topic, country });
          sitemapEntries.push(createEntry(url, new Date(), "daily", 0.6));
        }
      });
    });

    console.info(`Generated sitemap with ${sitemapEntries.length} URLs`);
    return sitemapEntries;
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return getDefaultSitemap(baseUrl);
  }
}
