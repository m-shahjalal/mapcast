import { getNewsMapData } from "@/server/actions/news.action";
import { NewsMapFilters } from "@/types/query-filter";
import dynamic from "next/dynamic";
import { Metadata } from "next";

type Props = {
  searchParams: Promise<NewsMapFilters>;
  params?: any;
};

const LazyMap = dynamic(() =>
  import("@/components/map/map-view").then((i) => i.PinPointMap)
);

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const newsList = await getNewsMapData(params);

  // Build dynamic title and description based on filters
  const buildTitle = () => {
    let title = "Interactive News Map";

    if (params.topics && params.topics.length > 0) {
      const topicName = params.topics[0];
      if (topicName !== "all") {
        title = `${
          topicName.charAt(0).toUpperCase() + topicName.slice(1)
        } News Map`;
      }
    }

    // Add location info if available in the news data
    const hasLocationData = newsList?.some(
      (news) => news.locationCountry || news.locationCity
    );
    if (hasLocationData) {
      const firstLocation = newsList?.find((news) => news.locationCountry);
      if (firstLocation?.locationCountry) {
        title += ` - ${firstLocation.locationCountry}`;
      }
    }

    return `${title} | Real-time News Locations`;
  };

  const buildDescription = () => {
    let description = "Explore breaking news stories on an interactive map. ";

    if (params.topics && params.topics.length > 0) {
      const topicName = params.topics[0];
      if (topicName !== "all") {
        description += `Discover ${topicName} news `;
      } else {
        description += "Discover news ";
      }
    } else {
      description += "Discover news ";
    }

    // Check if we have location data in the news results
    const locationCountries = [
      ...new Set(newsList?.map((news) => news.locationCountry).filter(Boolean)),
    ];
    if (locationCountries.length > 0) {
      if (locationCountries.length === 1) {
        description += `from ${locationCountries[0]} `;
      } else {
        description += "from multiple countries ";
      }
    } else {
      description += "from around the world ";
    }

    description += `with precise geographic locations. ${
      newsList?.length || 0
    } stories currently mapped.`;

    return description;
  };

  const buildKeywords = () => {
    const baseKeywords = [
      "news map",
      "interactive news",
      "breaking news",
      "news locations",
      "geographic news",
    ];

    if (params.topics && params.topics.length > 0) {
      params.topics.forEach((topic) => {
        if (topic !== "all") {
          baseKeywords.push(`${topic} news`, `${topic} map`);
        }
      });
    }

    // Add location-based keywords from actual news data
    const locationCountries = [
      ...new Set(newsList?.map((news) => news.locationCountry).filter(Boolean)),
    ];
    const locationCities = [
      ...new Set(newsList?.map((news) => news.locationCity).filter(Boolean)),
    ];

    locationCountries.slice(0, 3).forEach((country) => {
      baseKeywords.push(`${country} news`, `news in ${country}`);
    });

    locationCities.slice(0, 2).forEach((city) => {
      baseKeywords.push(`${city} news`, `${city} headlines`);
    });

    return baseKeywords.join(", ");
  };

  const buildCanonicalUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    let url = `${baseUrl}/`;

    const queryParams = new URLSearchParams();

    if (params.topics && params.topics.length > 0) {
      params.topics.forEach((topic) => {
        if (topic !== "all") {
          queryParams.append("topics", topic);
        }
      });
    }

    Object.entries(params).forEach(([key, value]) => {
      if (key !== "topics" && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v !== undefined && v !== null) {
              queryParams.append(key, String(v));
            }
          });
        } else {
          queryParams.set(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  };

  return {
    title: buildTitle(),
    description: buildDescription(),
    keywords: buildKeywords(),

    openGraph: {
      title: buildTitle(),
      description: buildDescription(),
      type: "website",
      url: buildCanonicalUrl(),
      siteName: "Your News Site",
      images: [
        {
          url: "/images/news-map-og.jpg",
          width: 1200,
          height: 630,
          alt: "Interactive News Map showing global news locations",
        },
      ],
      locale: "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title: buildTitle(),
      description: buildDescription(),
      images: ["/images/news-map-twitter.jpg"],
      creator: "@yournewssite",
    },

    alternates: { canonical: buildCanonicalUrl() },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": 160,
      },
    },

    other: {
      "geo.region": params.country || "",
      "geo.placename": params.country || "",
      "news.keywords": buildKeywords(),
    },
  };
}

export default async function MapPinsPage({ searchParams }: Props) {
  const params = await searchParams;
  const newsList = await getNewsMapData(params);

  const generateStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Interactive News Map${
        params.topics && params.topics.length > 0 && params.topics[0] !== "all"
          ? ` - ${params.topics[0]}`
          : ""
      }`,
      description: `Explore ${
        newsList?.length || 0
      } news stories on an interactive map`,
      url: `${baseUrl}/map`,
      mainEntity: {
        "@type": "Map",
        name: "Interactive News Map",
        description:
          "Real-time news stories plotted on an interactive world map",
        ...(newsList &&
          newsList.length > 0 && {
            hasMap: newsList.map((news) => ({
              "@type": "NewsArticle",
              headline: news.title,
              description: news.summary,
              url: news.originalUrl,
              datePublished: news.publishedAt.toISOString(),
              dateModified: (news.updatedAt || news.publishedAt).toISOString(),
              author: {
                "@type": "Organization",
                name: news.sourceDomain,
              },
              publisher: {
                "@type": "Organization",
                name: news.sourceDomain,
              },
              ...(news.imageUrl && {
                image: {
                  "@type": "ImageObject",
                  url: news.imageUrl,
                },
              }),
              ...(news.latitude &&
                news.longitude && {
                  contentLocation: {
                    "@type": "Place",
                    name:
                      news.locationName ||
                      (news.locationCity && news.locationCountry
                        ? `${news.locationCity}, ${news.locationCountry}`
                        : news.locationCountry ||
                          news.locationCity ||
                          "Unknown Location"),
                    geo: {
                      "@type": "GeoCoordinates",
                      latitude: parseFloat(news.latitude),
                      longitude: parseFloat(news.longitude),
                    },
                  },
                }),
            })),
          }),
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "News Map",
            item: `${baseUrl}/map`,
          },
        ],
      },
    };
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />

      {/* Additional Meta Tags for Enhanced SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />

      {/* Geo-specific meta tags if location data exists in news */}
      {newsList?.some((news) => news.locationCountryCode) && (
        <meta
          name="geo.region"
          content={
            newsList.find((news) => news.locationCountryCode)
              ?.locationCountryCode ||
            newsList.find((news) => news.locationCountry)?.locationCountry ||
            ""
          }
        />
      )}
      {newsList?.some((news) => news.locationCity) && (
        <meta
          name="geo.placename"
          content={
            newsList.find((news) => news.locationCity)?.locationCity || ""
          }
        />
      )}

      {/* News-specific meta tags */}
      <meta
        name="news.keywords"
        content={[
          ...(params.topics || []).filter((topic) => topic !== "all"),
          ...([
            ...new Set(
              newsList?.map((news) => news.locationCountry).filter(Boolean)
            ),
          ].slice(0, 2) || []),
          "breaking news",
          "news map",
        ]
          .filter(Boolean)
          .join(", ")}
      />

      {/* Main Content */}
      <main role="main" aria-label="Interactive news map">
        <h1 className="sr-only">
          Interactive News Map
          {params.topics &&
            params.topics.length > 0 &&
            params.topics[0] !== "all" &&
            ` - ${
              params.topics[0].charAt(0).toUpperCase() +
              params.topics[0].slice(1)
            } News`}
          {newsList?.find((news) => news.locationCountry) &&
            ` in ${
              newsList.find((news) => news.locationCountry)?.locationCountry
            }`}
          {newsList?.find((news) => news.locationCity) &&
            `, ${newsList.find((news) => news.locationCity)?.locationCity}`}
        </h1>

        <LazyMap news={newsList!} />
      </main>
    </>
  );
}
