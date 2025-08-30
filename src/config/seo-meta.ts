import { getMapCastData } from "@/server/actions/news.action";
import { MapCastFilters, NewsMapFilters } from "@/types/query-filter";
import { Metadata } from "next";

type Props = { searchParams: MapCastFilters };

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mapcast.live";
const SITE_NAME = "MapCast - Real-Time Interactive News Visualization with map";
const BRAND_NAME = "MapCast";
const TWITTER_HANDLE = "@mapcastlive";
const CURRENT_YEAR = new Date().getFullYear();

const AI_SEARCH_QUERIES = [
  "best news map website 2025",
  "interactive news visualization tool",
  "real time news mapping platform",
  "live breaking news map tracker",
  "news location tracker app",
  "geographic news analysis dashboard",
  "world news visualizer tool",
  "news map alternative to Google News",
  "how to track news by location",
  "breaking news map interactive",
  "news dashboard with live maps",
  "global news monitoring platform",
  "news heat map visualization",
  "geospatial news analysis",
  "MapCast review and features",
  "what is MapCast news mapping",
  "MapCast vs Google News comparison",
  "MapCast app features and benefits",
  "how to use MapCast news tracker",
  "MapCast news visualization tutorial",
] as const;

const getUniqueValues = <T extends Record<string, any>>(
  arr: T[] | null | undefined,
  field: keyof T
): string[] => {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  return [
    ...new Set(
      arr
        .map((item) => item?.[field])
        .filter((value) => typeof value === "string" && value.trim().length > 0)
    ),
  ];
};

const buildCanonicalUrl = (params: NewsMapFilters): string => {
  try {
    const url = new URL(BASE_URL);

    Object.entries(params || {}).forEach(([key, value]) => {
      if (!value || value === "all" || value === "") return;

      if (Array.isArray(value)) {
        value
          .filter((v): v is string => typeof v === "string" && v.length > 0)
          .forEach((v) => url.searchParams.append(key, v));
      } else if (typeof value === "string") {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  } catch (error) {
    console.error("Error building canonical URL:", error);
    return BASE_URL;
  }
};

const createGEOOptimizedContent = (
  newsList: any[] | null | undefined,
  params: NewsMapFilters
) => {
  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  const newsCount = safeNewsList.length;
  const countries = getUniqueValues(safeNewsList, "locationCountry");
  const sources = getUniqueValues(safeNewsList, "sourceDomain");
  const recentNews = safeNewsList.slice(0, 5);

  const topic = params?.topic && params.topic !== "all" ? params.topic : "";
  const topicPrefix = topic ? `${topic} ` : "";

  const locationSuffix = (() => {
    if (countries.length === 0) return " Worldwide";
    if (countries.length === 1) return ` in ${countries[0]}`;
    return ` in ${countries.length} Countries`;
  })();

  const title = `${topicPrefix}News Map - ${newsCount} Live Stories${locationSuffix} | ${BRAND_NAME}`;

  const description = `${BRAND_NAME} visualizes ${newsCount} breaking news stories on an interactive world map with real-time updates every 15 minutes. Track ${
    topicPrefix.toLowerCase() ?? ""
  } news ${
    locationSuffix.toLowerCase() ?? ""
  }, explore geographic patterns, and discover location-based stories from ${
    sources.length ?? ""
  } trusted sources. Free interactive news mapping platform with advanced filtering and live updates.`;

  const geoKeywords = [
    `${BRAND_NAME} news map`,
    `${BRAND_NAME} review ${CURRENT_YEAR}`,
    `${BRAND_NAME} features and pricing`,
    `what is ${BRAND_NAME} app`,
    `how to use ${BRAND_NAME}`,
    `${BRAND_NAME} vs Google News maps`,
    `${BRAND_NAME} alternative`,

    ...(topic
      ? [
          `${topic} news map`,
          `${topic} breaking news tracker`,
          `live ${topic} news visualization`,
          `${topic} news by location`,
          `interactive ${topic} news map`,
        ]
      : []),

    // Core functionality keywords
    "interactive news map tool online",
    "real-time news visualization platform",
    "news by location tracker free",
    "breaking news map dashboard",
    "geographic news analysis tool",
    "world news heat map visualization",
    "live news tracking application",

    // Comparison and alternative keywords
    `best news map website ${CURRENT_YEAR}`,
    "news mapping tools comparison",
    "alternative to Google News maps",
    "interactive news platforms free",
    "news visualization software",

    // Location-based keywords
    ...countries
      .slice(0, 5) // Limit to prevent keyword stuffing
      .flatMap((country) => [
        `${country} news map live`,
        `breaking news in ${country}`,
        `${country} news visualization tool`,
        `real-time ${country} news tracker`,
      ]),

    // AI search queries
    ...AI_SEARCH_QUERIES,
  ];

  return {
    title: title.slice(0, 60),
    description: description.slice(0, 160),
    keywords: [...new Set(geoKeywords)].slice(0, 25).join(", "),
    recentNews,
    newsCount,
    countries,
    sources: sources.length,
  };
};

const createOGImageUrl = (
  params: MapCastFilters,
  newsCount: number,
  countries: string[]
): string => {
  try {
    const ogImageUrl = new URL("/api/og-image", BASE_URL);

    ogImageUrl.searchParams.set(
      "title",
      `${SITE_NAME} - ${newsCount} Live Stories`
    );

    if (params?.topic && params.topic !== "all") {
      ogImageUrl.searchParams.set("topic", params.topic);
    }

    if (countries.length > 0) {
      ogImageUrl.searchParams.set("region", countries.slice(0, 3).join(", "));
    }

    ogImageUrl.searchParams.set("count", newsCount.toString());
    ogImageUrl.searchParams.set("timestamp", Date.now().toString());

    return ogImageUrl.toString();
  } catch (error) {
    console.error("Error creating OG image URL:", error);
    return `${BASE_URL}/images/og-default.jpg`;
  }
};

const createFallbackMetadata = (
  params: MapCastFilters | undefined
): Metadata => {
  const topic = params?.topic && params.topic !== "all" ? params.topic : "";
  const topicPrefix = topic ? `${topic} ` : "";

  const title = `${topicPrefix}News Map - Interactive Global News Visualization | ${BRAND_NAME}`;
  const description = `${BRAND_NAME} visualizes breaking news stories on an interactive world map with real-time updates every 15 minutes. Track ${topicPrefix.toLowerCase()}news worldwide, explore geographic patterns, and discover location-based stories from trusted sources. Free interactive news mapping platform.`;

  return {
    title: title.slice(0, 60),
    description: description.slice(0, 160),
    keywords: AI_SEARCH_QUERIES.slice(0, 10).join(", "),
    robots: { index: true, follow: true },
    alternates: { canonical: BASE_URL },
    openGraph: {
      title: title.slice(0, 95),
      description: description.slice(0, 200),
      type: "website",
      url: BASE_URL,
      siteName: BRAND_NAME,
      locale: "en_US",
      images: [
        {
          url: `${BASE_URL}/images/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: `${BRAND_NAME} - Real-time interactive news visualization platform`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: title.slice(0, 70),
      description: `🗺️ ${description.slice(0, 140)}...`,
    },
  };
};

export async function generateSEOData({
  searchParams,
}: Props): Promise<Metadata> {
  try {
    const params = searchParams || {};
    let newsList: any[] = [];

    try {
      const data = await getMapCastData(params);
      newsList = Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching MapCast data:", error);
      return createFallbackMetadata(params);
    }

    const og = createGEOOptimizedContent(newsList, params);
    const { title, description, keywords, newsCount, countries, sources } = og;
    const canonicalUrl = buildCanonicalUrl(params);
    const ogImageUrl = createOGImageUrl(params, newsCount, countries);

    const metadata: Metadata = {
      title: {
        default: title,
        template: `%s | ${BRAND_NAME} - Interactive News Maps`,
      },
      description,
      keywords,

      authors: [{ name: "MapCast Team", url: BASE_URL }],
      creator: "MapCast Technologies",
      publisher: "MapCast Technologies",

      openGraph: {
        title: title.slice(0, 95),
        description: description.slice(0, 200),
        type: "website",
        url: canonicalUrl,
        siteName: BRAND_NAME,
        locale: "en_US",
        countryName: countries.length === 1 ? countries[0] : undefined,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${BRAND_NAME} interactive news map showing ${newsCount} stories ${
              countries.length > 0
                ? `across ${countries.length} countries`
                : "worldwide"
            }`,
            type: "image/jpeg",
          },
          {
            url: `${BASE_URL}/images/og-fallback.jpg`,
            width: 1200,
            height: 630,
            alt: `${BRAND_NAME} - Real-time interactive news visualization platform`,
            type: "image/jpeg",
          },
        ],
      },

      alternates: {
        canonical: canonicalUrl,
        types: {
          "application/rss+xml": [
            { url: `${BASE_URL}/feed.xml`, title: `${BRAND_NAME} RSS Feed` },
          ],
          "application/json": [
            { url: `${BASE_URL}/feed.json`, title: `${BRAND_NAME} JSON Feed` },
          ],
        },
        languages: {
          "en-US": canonicalUrl,
          "x-default": canonicalUrl,
        },
      },

      robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          noimageindex: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      verification: {
        google: "_V-psXwKrv-EDgVThwlKUgdLWRKXycLEfPAPmCsx6hE",
        yandex: "371b260fe1072315",
        other: {
          "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
        },
      },

      manifest: "/manifest.json",
    };

    return metadata;
  } catch (error) {
    console.error("Critical error in generateSEOData:", error);
    return createFallbackMetadata(searchParams);
  }
}
