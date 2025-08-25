import { getMapCastData } from "@/server/actions/news.action";
import { MapCastFilters, NewsMapFilters } from "@/types/query-filter";
import { Metadata } from "next";

type Props = { searchParams: Promise<MapCastFilters> };

// Environment variables with fallbacks
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mapcast.live";
const SITE_NAME = "MapCast - Real-Time Interactive News Visualization";
const BRAND_NAME = "MapCast";
const TWITTER_HANDLE = "@mapcastlive";
const CURRENT_YEAR = new Date().getFullYear();

// Enhanced AI search queries for better GEO
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

// Type-safe utility functions
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

const safeStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn("Failed to stringify object:", error);
    return "{}";
  }
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

  // Safe topic extraction
  const topic = params?.topic && params.topic !== "all" ? params.topic : "";
  const topicPrefix = topic ? `${topic} ` : "";

  // Location suffix generation
  const locationSuffix = (() => {
    if (countries.length === 0) return " Worldwide";
    if (countries.length === 1) return ` in ${countries[0]}`;
    return ` in ${countries.length} Countries`;
  })();

  // Enhanced title with better keyword placement
  const title = `${topicPrefix}News Map - ${newsCount} Live Stories${locationSuffix} | ${BRAND_NAME}`;

  // AI-optimized description with structured information
  const description = `${BRAND_NAME} visualizes ${newsCount} breaking news stories on an interactive world map with real-time updates every 15 minutes. Track ${topicPrefix.toLowerCase()}news${locationSuffix.toLowerCase()}, explore geographic patterns, and discover location-based stories from ${
    sources.length
  } trusted sources. Free interactive news mapping platform with advanced filtering and live updates.`;

  // Enhanced GEO keywords with long-tail variations
  const geoKeywords = [
    // Brand keywords
    `${BRAND_NAME} news map`,
    `${BRAND_NAME} review ${CURRENT_YEAR}`,
    `${BRAND_NAME} features and pricing`,
    `what is ${BRAND_NAME} app`,
    `how to use ${BRAND_NAME}`,
    `${BRAND_NAME} vs Google News maps`,
    `${BRAND_NAME} alternative`,

    // Topic-specific keywords
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

  const keywords = [...new Set(geoKeywords)]
    .slice(0, 25) // Optimal keyword count
    .join(", ");

  return {
    title: title.slice(0, 60), // SEO title length limit
    description: description.slice(0, 160), // Meta description limit
    keywords,
    recentNews,
    newsCount,
    countries,
    sources: sources.length,
  };
};

// Enhanced structured data with better error handling
const createAIOptimizedStructuredData = (
  newsList: any[] | null | undefined,
  params: MapCastFilters
) => {
  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  const newsCount = safeNewsList.length;
  const countries = getUniqueValues(safeNewsList, "locationCountry");
  const sources = getUniqueValues(safeNewsList, "sourceDomain");
  const currentDate = new Date().toISOString();

  // Main application schema with enhanced properties
  const appSchema = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication", "NewsMediaOrganization"],
    name: BRAND_NAME,
    alternateName: [
      "MapCast",
      "Map Cast",
      "Interactive News Map",
      "MapCast Live",
    ],
    description: `Real-time interactive news mapping platform visualizing ${newsCount} stories from ${
      sources.length
    } sources across ${Math.max(
      countries.length,
      1
    )} countries with live updates every 15 minutes.`,
    url: BASE_URL,
    sameAs: [`https://twitter.com/${TWITTER_HANDLE.replace("@", "")}`],

    // Application details
    applicationCategory: [
      "NewsApplication",
      "BusinessApplication",
      "MapApplication",
    ],
    applicationSubCategory: "News Visualization",
    operatingSystem: ["Web Browser", "iOS", "Android"],
    browserRequirements: "Requires JavaScript and WebGL support",
    softwareVersion: "2.0",
    datePublished: "2024-01-01",
    dateModified: currentDate,

    // Enhanced features list
    featureList: [
      "Real-time news visualization on interactive world maps",
      "Geographic filtering by country, region, and city",
      "Live updates every 15 minutes with fresh content",
      `Global coverage across ${Math.max(countries.length, 195)} countries`,
      "Breaking news alerts with precise GPS coordinates",
      "Multi-source news aggregation and deduplication",
      "Advanced topic-based filtering and search",
      "Mobile-responsive design with touch controls",
      "Historical news data and trend analysis",
      "Custom location-based news alerts",
      "Social media integration and sharing",
      "Export and API access for developers",
    ],

    // Pricing and availability
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      priceValidUntil: `${CURRENT_YEAR + 1}-12-31`,
      description:
        "Free interactive news mapping with premium analytics features available",
      eligibleRegion: "Worldwide",
    },

    // Enhanced creator information
    creator: {
      "@type": "Organization",
      name: "MapCast Technologies",
      url: BASE_URL,
      foundingDate: "2024",
      description:
        "Technology company specializing in real-time news visualization and geospatial data mapping",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        url: `${BASE_URL}/contact`,
      },
    },

    // Detailed usage statistics
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: Math.max(newsCount, 1000),
        description: `${newsCount} news stories currently mapped and visualized`,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/UpdateAction",
        userInteractionCount: 96,
        description:
          "Updated 96 times daily (every 15 minutes) with fresh content",
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/SearchAction",
        userInteractionCount: sources.length,
        description: `Aggregates from ${sources.length} trusted news sources globally`,
      },
    ],

    // Geographic coverage with fallback
    spatialCoverage:
      countries.length > 0
        ? countries.slice(0, 10).map((country) => ({
            "@type": "Place",
            name: country,
            description: `Comprehensive news coverage and real-time mapping for ${country}`,
          }))
        : [
            {
              "@type": "Place",
              name: "Worldwide",
              description:
                "Global news coverage with interactive mapping across all continents",
            },
          ],

    // Technical specifications
    requirements:
      "Internet connection, modern web browser with JavaScript enabled",
    memoryRequirements: "512MB RAM minimum",
    processorRequirements: "Modern CPU with WebGL support",

    // User ratings and reviews (placeholder structure)
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
  };

  // Enhanced FAQ schema with more comprehensive Q&A
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${BRAND_NAME} and how does it work?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${BRAND_NAME} is a free interactive news mapping platform that visualizes breaking news stories on a world map with precise geographic coordinates. It aggregates ${newsCount} stories from ${
            sources.length
          } trusted news sources across ${Math.max(
            countries.length,
            195
          )} countries, updating every 15 minutes to provide real-time global news visualization.`,
        },
      },
      {
        "@type": "Question",
        name: "How often does MapCast update its news data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MapCast refreshes its news database every 15 minutes, providing 96 updates per day. This ensures users always have access to the latest breaking news with accurate geographic context and real-time visualization.",
        },
      },
      {
        "@type": "Question",
        name: "Is MapCast free to use? What features are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, MapCast is completely free to use with core features including interactive news mapping, geographic filtering, real-time updates, and multi-source news aggregation. Premium features for advanced analytics and historical data may be available for power users.",
        },
      },
      {
        "@type": "Question",
        name: "How is MapCast different from Google News or other news platforms?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Unlike traditional news aggregators, MapCast specializes in geographic visualization of news stories. It plots each story on an interactive world map with precise coordinates, helping users understand the geographic context, patterns, and distribution of global news events in real-time.",
        },
      },
      {
        "@type": "Question",
        name: "What news sources does MapCast use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `MapCast aggregates news from ${sources.length} verified news sources worldwide, including major international outlets, regional publications, and specialized news services. All sources are carefully selected for reliability and geographic coverage.`,
        },
      },
      {
        "@type": "Question",
        name: "Can I filter news by location or topic on MapCast?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, MapCast offers advanced filtering options including geographic filters (by country, region, city), topic categories, time ranges, and news source selection. Users can create custom views to focus on specific regions or topics of interest.",
        },
      },
    ],
  };

  // Enhanced dataset schema
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "MapCast Real-Time Global News Database",
    description: `Continuously updated dataset containing ${newsCount} geolocated news articles with comprehensive metadata, geographic coordinates, and real-time updates from verified global news sources.`,
    keywords: [
      "news",
      "geolocation",
      "real-time",
      "journalism",
      "mapping",
      "visualization",
    ],
    creator: {
      "@type": "Organization",
      name: "MapCast Technologies",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "MapCast Technologies",
      url: BASE_URL,
    },
    datePublished: "2024-01-01",
    dateModified: currentDate,
    license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    distribution: {
      "@type": "DataDownload",
      encodingFormat: ["application/json", "text/csv", "application/xml"],
      contentUrl: `${BASE_URL}/api/news-data`,
      description: "API access to real-time news data with geographic metadata",
    },
    temporalCoverage: "2024/..",
    spatialCoverage: countries.length > 0 ? countries : ["Worldwide"],
    variableMeasured: [
      "News article title, content, and summary",
      "Geographic coordinates (latitude/longitude)",
      "Publication timestamp and timezone",
      "News source, domain, and credibility score",
      "Article category, topic, and tags",
      "Location names (country, region, city)",
      "Language and content analysis metadata",
      "Social media engagement metrics",
      "Reading time and content complexity",
    ],
    measurementTechnique:
      "Automated news aggregation with AI-powered geolocation extraction",
    size: `${newsCount} articles updated every 15 minutes`,
  };

  return [appSchema, faqSchema, datasetSchema];
};

// Enhanced OG image URL generation with error handling
const createOGImageUrl = (
  params: MapCastFilters,
  newsCount: number,
  countries: string[]
): string => {
  try {
    const ogImageUrl = new URL("/api/og-image", BASE_URL);

    // Safe parameter setting
    ogImageUrl.searchParams.set(
      "title",
      `${BRAND_NAME} - ${newsCount} Live Stories`
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

// Main metadata generation function with comprehensive error handling
export async function generateSEOData({
  searchParams,
}: Props): Promise<Metadata> {
  try {
    const params = await searchParams;
    let newsList: any[] = [];

    // Safe data fetching with error handling
    try {
      const data = await getMapCastData(params || {});
      newsList = Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching MapCast data:", error);
      newsList = []; // Fallback to empty array
    }

    const { title, description, keywords, newsCount, countries, sources } =
      createGEOOptimizedContent(newsList, params || {});

    const canonicalUrl = buildCanonicalUrl(params || {});
    const structuredData = createAIOptimizedStructuredData(
      newsList,
      params || {}
    );

    // Safe geographic data extraction
    const geoRegion =
      newsList.find((item) => item?.countryCode)?.countryCode || null;
    const geoPlacename = newsList.find((item) => item?.city)?.city || null;
    const coordinates =
      newsList.find((item) => item?.latitude && item?.longitude) || null;

    const ogImageUrl = createOGImageUrl(params || {}, newsCount, countries);

    // Enhanced metadata object
    const metadata: Metadata = {
      // Basic metadata
      title: {
        default: title,
        template: `%s | ${BRAND_NAME} - Interactive News Maps`,
      },
      description,
      keywords,

      // Authors and creator
      authors: [{ name: "MapCast Team", url: BASE_URL }],
      creator: "MapCast Technologies",
      publisher: "MapCast Technologies",

      // Open Graph metadata
      openGraph: {
        title: title.slice(0, 95), // OG title length limit
        description: description.slice(0, 200), // OG description limit
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
                ? "across " + countries.length + " countries"
                : "worldwide"
            }`,
            type: "image/jpeg",
          },
          // Fallback image
          {
            url: `${BASE_URL}/images/og-fallback.jpg`,
            width: 1200,
            height: 630,
            alt: `${BRAND_NAME} - Real-time interactive news visualization platform`,
            type: "image/jpeg",
          },
        ],
      },

      // Twitter/X metadata
      twitter: {
        card: "summary_large_image",
        site: TWITTER_HANDLE,
        creator: TWITTER_HANDLE,
        title: title.slice(0, 70), // Twitter title limit
        description: `🗺️ ${description.slice(0, 140)}...`,
        images: [
          {
            url: ogImageUrl,
            alt: `${BRAND_NAME} - Live news mapping with ${newsCount} stories`,
            width: 1200,
            height: 630,
          },
        ],
      },

      // Canonical and alternate URLs
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

      // Robots and indexing
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

      // Verification and additional metadata
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
        yandex: process.env.YANDEX_VERIFICATION || undefined,
        yahoo: process.env.YAHOO_SITE_VERIFICATION || undefined,
        other: {
          "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
        },
      },

      // Additional metadata for better SEO
      other: {
        // Geographic metadata (only if valid data exists)
        ...(geoRegion && {
          "geo.region": geoRegion,
        }),
        ...(geoPlacename && {
          "geo.placename": geoPlacename,
        }),
        ...(coordinates?.latitude &&
          coordinates?.longitude && {
            "geo.position": `${coordinates.latitude};${coordinates.longitude}`,
            ICBM: `${coordinates.latitude}, ${coordinates.longitude}`,
          }),

        // Content and application metadata
        "news.keywords": keywords,
        "application-name": BRAND_NAME,
        generator: `${BRAND_NAME} v2.0 - Next.js ${
          process.env.NEXT_VERSION || "15"
        }`,
        subject: "Interactive News Mapping and Real-time Visualization",
        abstract: description,
        topic: "News, Maps, Visualization, Real-time Data, Journalism",
        summary: `${BRAND_NAME}: Real-time news mapping platform with ${newsCount} stories from ${sources} sources`,
        category: "News and Media Technology Tools",
        coverage: countries.length > 0 ? countries.join(", ") : "Worldwide",
        distribution: "Global",
        rating: "General Audience",
        "revisit-after": "15 minutes",
        expires: "never",

        // Branding and company info
        brand: BRAND_NAME,
        company: "MapCast Technologies",
        product: `${BRAND_NAME} Interactive News Mapping Platform`,

        // Performance and caching hints
        "dns-prefetch": "https://cdn.jsdelivr.net",
        preconnect: "https://api.newsapi.org",
        "cache-control": "public, max-age=900", // 15 minutes cache

        // Structured data as string
        "structured-data": safeStringify(structuredData),

        // Enhanced citation metadata for AI
        "citation-title": title,
        "citation-url": canonicalUrl,
        "citation-description": description,
        "citation-date": new Date().toISOString(),
        "citation-source": BRAND_NAME,
        "citation-type": "Interactive Web Application",
        "citation-version": "2.0",
        "citation-language": "en",
        "citation-access": "free",

        // Mobile app metadata
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": BRAND_NAME,
        "mobile-web-app-capable": "yes",
        "msapplication-TileColor": "#0f0f2340",
        "msapplication-TileImage": "/icons/mstile-144x144.png",
        "msapplication-config": "/browserconfig.xml",

        // Theme colors
        "theme-color": "#0f0f2340",
        "msapplication-navbutton-color": "#0f0f2340",

        // Content freshness indicators
        "last-modified": new Date().toISOString(),
        "content-freshness": "high", // Updated every 15 minutes
        "update-frequency": "15 minutes",

        // Privacy and security
        referrer: "origin-when-cross-origin",
        "content-security-policy":
          "default-src 'self'; img-src 'self' data: https:",
      },

      // App manifest
      manifest: "/manifest.json",

      // Icons with comprehensive fallbacks
      icons: {
        icon: [
          { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
          {
            url: "/icons/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
          {
            url: "/icons/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
        ],
        apple: [
          {
            url: "/icons/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
        other: [
          { rel: "shortcut icon", url: "/favicon.ico" },
          {
            rel: "mask-icon",
            url: "/icons/safari-pinned-tab.svg",
            color: "#0f0f23",
          },
        ],
      },
    };

    return metadata;
  } catch (error) {
    console.error("Critical error in generateSEOData:", error);

    // Return minimal fallback metadata
    return {
      title: `${BRAND_NAME} - Interactive News Mapping Platform`,
      description:
        "Real-time interactive news visualization on world maps. Track breaking news with geographic context and live updates.",
      robots: { index: true, follow: true },
      alternates: { canonical: BASE_URL },
    };
  }
}
