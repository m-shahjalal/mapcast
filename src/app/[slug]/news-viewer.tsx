import { NewsType } from "@/server/database/schemas";
import { MDXRemote } from "next-mdx-remote/rsc";
import mdxComponents from "@/components/mdx-components";
import { newsTopicDropdown } from "@/shared/enum-list";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

const formatISODate = (date: Date) => new Date(date).toISOString();

const formatCount = (num: number | null) => {
  if (!num) return "0";
  return num >= 1000000
    ? `${(num / 1000000).toFixed(1)}M`
    : num >= 1000
    ? `${(num / 1000).toFixed(1)}K`
    : num.toString();
};

const getTopicConfig = (topic: string) => {
  return (
    newsTopicDropdown.find((item) => item.topic === topic) ||
    newsTopicDropdown.find((item) => item.topic === "other")
  );
};

const getTagColor = (index: number) => {
  const colors = newsTopicDropdown.map((item) => item.color);
  return colors[index % colors.length];
};

const getStructureData = (news: NewsType) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: news.title,
  description: news.summary || news.metaDescription,
  datePublished: formatISODate(news.publishedAt),
  dateModified: formatISODate(news.updatedAt || news.publishedAt),
  author: {
    "@type": "Organization",
    name: news.sourceDomain,
  },
  publisher: {
    "@type": "Organization",
    name: news.sourceDomain,
  },
  url: news.originalUrl,
  mainEntityOfPage: news.originalUrl,
  articleSection: news.topic,
  keywords: news.tags
    ?.split(",")
    .map((tag) => tag.trim())
    .join(", "),
  wordCount: news.content?.length || 0,
  timeRequired: news.readTime ? `PT${news.readTime}M` : undefined,
  interactionStatistic: [
    {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ReadAction",
      userInteractionCount: news.viewsCount || 0,
    },
  ],
});

export const NewsViewer = ({ news }: { news: NewsType }) => {
  const topicConfig = getTopicConfig(news.topic || "other");
  const structuredData = getStructureData(news);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article
        className="max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-screen"
        itemScope
        itemType="https://schema.org/NewsArticle"
      >
        {news.topic && news.topic !== "all" && (
          <div className="sticky top-48 md:top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-full shadow-sm"
                style={{ backgroundColor: topicConfig?.color }}
              >
                <span>{topicConfig?.emoji}</span>
                {news.topic}
              </span>
              <h3 className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate flex-1">
                {news.title}
              </h3>
              <Button className="cursor-pointer" variant="outline" size="icon">
                <Link href="/">
                  <X />
                </Link>
              </Button>
            </div>
          </div>
        )}

        <header className="bg-white dark:bg-gray-900">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4"
              itemProp="headline"
            >
              {news.title}
            </h1>

            {news.summary && (
              <div
                className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4"
                style={{ borderColor: topicConfig?.color }}
                itemProp="description"
              >
                {news.summary}
              </div>
            )}

            {/* Article Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <time
                dateTime={formatISODate(news.publishedAt)}
                itemProp="datePublished"
                className="flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Published {formatDate(news.publishedAt)}</span>
              </time>

              {news.readTime && (
                <span
                  className="flex items-center"
                  itemProp="timeRequired"
                  content={`PT${news.readTime}M`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{news.readTime} min read</span>
                </span>
              )}

              {news.viewsCount && (
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{formatCount(news.viewsCount)} views</span>
                </span>
              )}
            </div>

            {/* Status Indicators */}
            {(news.isBreaking || news.isFeatured) && (
              <div className="flex items-center gap-2 mb-4">
                {news.isBreaking && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded uppercase tracking-wide">
                    Breaking News
                  </span>
                )}
                {news.isFeatured && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 dark:text-amber-200 dark:bg-amber-900/30 rounded uppercase tracking-wide">
                    Featured
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div itemProp="articleBody">
            <MDXRemote components={mdxComponents} source={news.content} />
          </div>

          {news.tags && (
            <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Related Topics
              </h2>
              <div className="flex flex-wrap gap-2" itemProp="keywords">
                {news.tags.split(",").map((tag, index) => {
                  const tagColor = getTagColor(index);
                  const tagTopic = newsTopicDropdown.find(
                    (item) => item.topic === tag.trim().toLowerCase()
                  );
                  const finalColor = tagTopic?.color || tagColor;

                  return (
                    <a
                      key={index}
                      href={`/tags/${tag.trim().toLowerCase()}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-80 transition-opacity shadow-sm"
                      style={{ backgroundColor: finalColor }}
                    >
                      {tagTopic?.emoji && <span>{tagTopic.emoji}</span>}#
                      {tag.trim()}
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Source
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                This article was originally published by{" "}
                <span
                  itemProp="publisher"
                  itemScope
                  itemType="https://schema.org/Organization"
                >
                  <span itemProp="name">{news.sourceDomain}</span>
                </span>
              </p>
              <a
                href={news.originalUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                itemProp="url"
              >
                Read Original Article
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </footer>
        </main>
      </article>
    </>
  );
};
