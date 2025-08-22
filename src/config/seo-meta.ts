import { getNewsMapData } from "@/server/actions/news.action";
import { NewsMapFilters } from "@/types/query-filter";
import { Metadata } from "next";

type Props = { searchParams: Promise<NewsMapFilters> };

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "PiNews - Real-Time Interactive News Visualization";
const BRAND_NAME = "PiNews";
const TWITTER_HANDLE = "@pinewsapp";

// GEO (Generative Engine Optimization) Keywords - What people ask AI tools
const AI_SEARCH_QUERIES = [
  "best news map website",
  "interactive news visualization tool",
  "real time news mapping",
  "live breaking news map",
  "news location tracker",
  "geographic news analysis",
  "world news visualizer",
  "news map alternative to Google News",
  "how to track news by location",
  "breaking news map tool",
  "news dashboard with maps",
  "global news monitoring platform",
  "PiNews review",
  "what is PiNews",
  "PiNews vs Google News",
  "PiNews features",
];

// Utility functions optimized for AI citation
const getUniqueValues = (arr: any[], field: string) => [
  ...new Set(arr?.map((item) => item[field]).filter(Boolean) || []),
];

const buildCanonicalUrl = (params: NewsMapFilters) => {
  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== "all") {
      if (Array.isArray(value)) {
        value.forEach((v) => v && url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  });
  return url.toString();
};

const createGEOOptimizedContent = (newsList: any[], params: NewsMapFilters) => {
  const newsCount = newsList?.length || 0;
  const countries = getUniqueValues(newsList, "locationCountry");
  const recentNews = newsList?.slice(0, 5);

  const locationSuffix =
    countries.length === 1
      ? ` in ${countries[0]}`
      : countries.length > 1
      ? ` in ${countries.length} Countries`
      : " Worldwide";
  const title = `PiNews: ${params.topic}News Map with ${newsCount} Live Stories${locationSuffix}`;

  // AI-Friendly Description (Structured, fact-dense)
  const description = `PiNews is an interactive news mapping platform that visualizes ${newsCount} breaking news stories in real-time with precise geographic coordinates. Features include: live ${
    params.topic
  }news tracking ${locationSuffix}, geographic news filtering, interactive world map visualization, and real-time updates from ${
    getUniqueValues(newsList, "sourceDomain").length
  } news sources. Updated every 15 minutes with location-based news discovery.`;

  const geoKeywords = [
    params.topic,
    `PiNews news map`,
    `PiNews review`,
    `PiNews features`,
    `what is PiNews`,
    `how to use PiNews`,
    `PiNews vs Google News`,

    "interactive news map tool",
    "real-time news visualization",
    "news by location",
    "breaking news tracker",
    "geographic news analysis",
    "world news dashboard",

    "best news map website 2025",
    "news mapping tools comparison",
    "alternative to Google News maps",
    "interactive news platforms",

    ...countries
      .slice(0, 3)
      .flatMap((c) => [
        `${c} news map`,
        `breaking news in ${c}`,
        `${c} news visualization`,
        `how to track ${c} news`,
        `real-time ${c} news updates`,
      ]),

    ...AI_SEARCH_QUERIES,
  ];

  const keywords = [...new Set(geoKeywords)].slice(0, 30).join(", ");

  return { title, description, keywords, recentNews };
};

// Enhanced Structured Data for AI Citation
const createAIOptimizedStructuredData = (
  newsList: any[],
  params: NewsMapFilters
) => {
  const newsCount = newsList?.length || 0;
  const countries = getUniqueValues(newsList, "locationCountry");
  const sources = getUniqueValues(newsList, "sourceDomain");

  // Main application schema
  const appSchema = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name: "PiNews",
    alternateName: ["PiNews", "Pi News", "Interactive News Map", "PiNews App"],
    description: `Real-time interactive news mapping platform with ${newsCount} stories from ${sources.length} sources across ${countries.length} countries`,
    url: BASE_URL,
    applicationCategory: [
      "NewsApplication",
      "BusinessApplication",
      "MapApplication",
    ],
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript",

    // Key features for AI to cite
    featureList: [
      "Real-time news visualization on interactive maps",
      "Geographic filtering by country and city",
      "Live updates every 15 minutes",
      `Covers ${countries.length} countries worldwide`,
      "Breaking news alerts with precise locations",
      "Multi-source news aggregation",
      "Topic-based filtering and search",
      "Mobile-responsive design",
    ],

    // Pricing info
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to use with premium features available",
    },

    // Creator info
    creator: {
      "@type": "Organization",
      name: "PiNews Team",
      url: BASE_URL,
      foundingDate: "2024",
      description:
        "Technology company focused on news visualization and real-time data mapping",
    },

    // Usage statistics (AI loves numbers)
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: newsCount,
        description: `${newsCount} news stories currently mapped`,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/UpdateAction",
        userInteractionCount: 96, // Updates per day (every 15 min)
        description: "Updated 96 times daily with fresh content",
      },
    ],

    // Geographic coverage
    spatialCoverage:
      countries.length > 0
        ? countries.map((country) => ({
            "@type": "Place",
            name: country,
            description: `News coverage and mapping for ${country}`,
          }))
        : [
            {
              "@type": "Place",
              name: "Worldwide",
              description: "Global news coverage and mapping",
            },
          ],
  };

  // FAQ Schema for common AI queries
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${BRAND_NAME}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${BRAND_NAME} is an interactive news mapping platform that visualizes breaking news stories on a world map with precise geographic locations. It tracks ${newsCount} stories from ${sources.length} news sources across ${countries.length} countries in real-time.`,
        },
      },
      {
        "@type": "Question",
        name: `How does ${BRAND_NAME} work?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${BRAND_NAME} aggregates news from multiple sources, extracts geographic coordinates, and plots stories on an interactive map. Users can filter by topic, location, and time period to discover location-specific news patterns.`,
        },
      },
      {
        "@type": "Question",
        name: "Is NewsMap free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, NewsMap offers free access to interactive news mapping with basic features. Premium features may be available for advanced analytics and historical data access.",
        },
      },
      {
        "@type": "Question",
        name: "How often is NewsMap updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NewsMap updates every 15 minutes with fresh news content from multiple sources, ensuring users have access to the latest breaking news with geographic context.",
        },
      },
      {
        "@type": "Question",
        name: "What makes NewsMap different from Google News?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Unlike Google News, NewsMap specializes in geographic visualization of news stories, showing precise locations on an interactive map. This helps users understand the geographic context and patterns of global news events.",
        },
      },
    ],
  };

  // Dataset schema for news data
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "PiNews Live News Database",
    description: `Real-time dataset containing ${newsCount} news articles with geographic coordinates and metadata`,
    creator: {
      "@type": "Organization",
      name: "PiNews Team",
    },
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${BASE_URL}/api/news-data`,
    },
    temporalCoverage: "2024/..",
    spatialCoverage: countries.length > 0 ? countries : ["Worldwide"],
    variableMeasured: [
      "News article title and content",
      "Geographic coordinates (latitude/longitude)",
      "Publication timestamp",
      "News source and domain",
      "Article category and topic",
      "Location names (country, city)",
    ],
  };

  return [appSchema, faqSchema, datasetSchema];
};

export async function generateSEOData({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const newsList = await getNewsMapData(params);
  if (!Array.isArray(newsList)) return {};

  const { title, description, keywords } = createGEOOptimizedContent(
    newsList,
    params
  );
  const canonicalUrl = buildCanonicalUrl(params);

  const geoRegion = newsList?.find((n) => n.countryCode);
  const geoPlacename = newsList?.find((n) => n.city)?.city;
  const coordinates = newsList?.find((n) => n.latitude && n.longitude);

  const ogImageUrl = new URL("/api/og-image", BASE_URL);
  ogImageUrl.searchParams.set(
    "title",
    `PiNews - ${newsList?.length || 0} Stories`
  );
  if (params.topic !== "all") {
    ogImageUrl.searchParams.set("topic", params.topic);
  }
  if (geoRegion)
    ogImageUrl.searchParams.set("region", geoRegion.location ?? "");

  return {
    title: {
      default: title,
      template: `%s | PiNews - Interactive News Maps`,
    },

    description,
    keywords,

    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: "PiNews",
      locale: "en_US",
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `PiNews interactive news map showing ${
            newsList?.length || 0
          } stories globally`,
          type: "image/jpeg",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description: `🗺️ ${description.slice(0, 155)}...`,
      images: [
        {
          url: ogImageUrl.toString(),
          alt: `${BRAND_NAME} - Live news mapping with ${
            newsList?.length || 0
          } stories`,
        },
      ],
    },

    alternates: {
      canonical: canonicalUrl,
      types: {
        "application/rss+xml": [
          { url: `${BASE_URL}/feed.xml`, title: `${BRAND_NAME} RSS Feed` },
          { url: `${BASE_URL}/feed/json`, title: `${BRAND_NAME} JSON Feed` },
        ],
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

    other: {
      ...(geoRegion && {
        "geo.region": geoRegion.location + ", " + geoRegion.city,
      }),
      ...(geoPlacename && { "geo.placename": geoPlacename }),
      ...(coordinates && {
        "geo.position": `${coordinates.latitude};${coordinates.longitude}`,
        ICBM: `${coordinates.latitude}, ${coordinates.longitude}`,
      }),

      "news.keywords": keywords,
      "application-name": BRAND_NAME,
      generator: `${BRAND_NAME} v2.0`,
      subject: "Interactive News Mapping and Visualization",
      abstract: description,
      topic: "News, Maps, Visualization, Real-time Data",
      summary: `${BRAND_NAME}: Real-time news mapping with ${
        newsList?.length || 0
      } stories`,
      category: "News and Media Tools",
      coverage: "Worldwide",
      distribution: "Global",
      rating: "General",
      "revisit-after": "15 minutes",
      expires: "never",

      brand: BRAND_NAME,
      company: SITE_NAME,
      product: `${BRAND_NAME} Interactive News Maps`,

      "dns-prefetch": "https://cdn.jsdelivr.net",
      preconnect: "https://api.newsapi.org",

      "structured-data": JSON.stringify(
        createAIOptimizedStructuredData(newsList, params)
      ),

      "citation-title": title,
      "citation-url": canonicalUrl,
      "citation-description": description,
      "citation-date": new Date().toISOString(),
      "citation-source": BRAND_NAME,
      "citation-type": "Interactive Web Application",

      "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION ?? "",
      "yandex-verification": process.env.YANDEX_VERIFICATION ?? "",

      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": BRAND_NAME,
      "mobile-web-app-capable": "yes",
      "msapplication-TileColor": "#0f0f23",
      "msapplication-TileImage": "/mstile-144x144.png",
    },

    manifest: "/manifest.json",

    icons: {
      icon: [{ url: "/favicon.ico", sizes: "32x32", type: "image/png" }],
      other: [{ rel: "shortcut icon", url: "/favicon.ico" }],
    },
  };
}
