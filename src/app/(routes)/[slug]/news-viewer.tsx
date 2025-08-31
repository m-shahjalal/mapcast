import mdxComponents from "@/components/layout/mdx-components";
import { Button } from "@/components/ui/button";
import { NewsType } from "@/server/database/schemas";
import { newsTopicDropdown } from "@/shared/enum-list";
import { X } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Image from "next/image";

import Link from "next/link";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

const formatCount = (num: number | null) => {
  if (!num) return "0";
  return num >= 1_000_000
    ? `${(num / 1_000_000).toFixed(1)}M`
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

export const NewsViewer = async ({ news }: { news: NewsType }) => {
  const topicConfig = getTopicConfig(news?.topic || "other");

  if (!news) return;

  return (
    <article className="max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-screen">
      {news.topic && news.topic !== "all" && (
        <div className="sticky top-32 md:top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md md:backdrop-blur-none border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm md:shadow-none">
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            {news.title}
          </h1>

          {news.summary && (
            <div
              className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4"
              style={{ borderColor: topicConfig?.color }}
            >
              {news.summary}
            </div>
          )}

          <ArticleMeta news={news} />
          <StatusIndicators news={news} />
        </div>
      </header>

      <LeadImage news={news} />

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <MDXRemote
            source={news.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>

        <TagsSection news={news} />
        <SourceFooter news={news} />
      </main>
    </article>
  );
};

// Lead Image Component with fallback and credits - Client Component
const LeadImage = ({ news }: { news: NewsType }) => {
  if (!news.imageUrl) return null;

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <Image
          src={news.imageUrl}
          alt={news.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
          priority
        />

        {/* Image overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Image credits */}
      <div className="mt-2 flex justify-end">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Image: {news.sourceDomain}
        </span>
      </div>
    </div>
  );
};

// Sub-components for better modularity
const ArticleMeta = ({ news }: { news: NewsType }) => (
  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
    <time dateTime={new Date(news.publishedAt).toISOString()}>
      <svg
        className="w-4 h-4 mr-1 inline"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
          clipRule="evenodd"
        />
      </svg>
      Published {formatDate(news.publishedAt)}
    </time>

    {news.readTime && (
      <span>
        <svg
          className="w-4 h-4 mr-1 inline"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        {news.readTime} min read
      </span>
    )}

    {news.viewsCount && (
      <span>
        <svg
          className="w-4 h-4 mr-1 inline"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
        {formatCount(news.viewsCount)} views
      </span>
    )}
  </div>
);

const StatusIndicators = ({ news }: { news: NewsType }) => {
  if (!news.isBreaking && !news.isFeatured) return null;

  return (
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
  );
};

const TagsSection = ({ news }: { news: NewsType }) => {
  if (!news.tags) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Related Topics
      </h2>
      <div className="flex flex-wrap gap-2">
        {news.tags.map((tag, index) => {
          const tagColor = getTagColor(index);
          const tagTopic = newsTopicDropdown.find(
            (item) => item.topic === tag.trim().toLowerCase()
          );
          const finalColor = tagTopic?.color || tagColor;

          return (
            <a
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-full hover:opacity-80 transition-opacity shadow-sm"
              style={{ backgroundColor: finalColor }}
            >
              {tagTopic?.emoji && <span>{tagTopic.emoji}</span>}#{tag.trim()}
            </a>
          );
        })}
      </div>
    </section>
  );
};

const SourceFooter = ({ news }: { news: NewsType }) => (
  <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Source
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        This article was originally published by {news.sourceDomain}
      </p>
      <a
        href={news.originalUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
      >
        Read Original Article
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </div>
  </footer>
);
