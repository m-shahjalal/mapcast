import mdxComponents from "@/components/mdx-components";
import { getNewsBySlug } from "@/server/actions/news.action";
import { MDXRemote } from "next-mdx-remote/rsc";
import { NewsViewer } from "./news-viewer";
import { Clock, Eye, Share2, Heart, Calendar, MapPin, Tag } from "lucide-react";

export default async function DynamicNews({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getNewsBySlug(slug);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex flex-col lg:flex-row max-w-[1920px] mx-auto">
        {/* Article Content Panel */}
        <div className="flex-1 lg:max-w-4xl">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-r border-slate-200/50 dark:border-slate-700/50 min-h-screen">
            {/* Article Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="space-y-4">
                {/* Topic Badge */}
                {data.topic && data.topic !== "all" && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium capitalize">
                      {data.topic}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                  {data.title}
                </h1>

                {/* Meta Description */}
                {data.metaDescription && (
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    {data.metaDescription}
                  </p>
                )}

                {/* Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {data.summary}
                  </p>
                </div>

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(data.publishedAt)}</span>
                  </div>

                  {data.readTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{data.readTime} min read</span>
                    </div>
                  )}

                  {data.locationName && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{data.locationName}</span>
                    </div>
                  )}
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-6 pt-2">
                  {data.viewsCount && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {formatNumber(data.viewsCount)} views
                      </span>
                    </div>
                  )}

                  {data.sharesCount && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {formatNumber(data.sharesCount)} shares
                      </span>
                    </div>
                  )}

                  {data.likesCount && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {formatNumber(data.likesCount)} likes
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-2 pb-6">
                  {data.isBreaking && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-bold uppercase tracking-wider animate-pulse">
                      Breaking
                    </span>
                  )}
                  {data.isFeatured && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded text-xs font-semibold uppercase tracking-wider">
                      Featured
                    </span>
                  )}
                  {data.isPinned && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs font-semibold uppercase tracking-wider">
                      Pinned
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image Section */}
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
                {/* Placeholder for when no image is available */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10" />
                <div className="text-center z-10 p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-500 dark:text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Featured Image
                  </p>
                </div>
              </div>

              {/* Image Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white text-sm font-medium mb-1">
                  {data.title}
                </p>
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <span>Image courtesy of</span>
                  <a
                    href={data.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-white transition-colors underline"
                  >
                    {data.sourceDomain}
                  </a>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 lg:p-8">
              <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-pink-50 dark:prose-code:bg-pink-900/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:py-1 prose-img:rounded-xl prose-img:shadow-lg">
                <MDXRemote components={mdxComponents} source={data.content} />
              </div>

              {/* Tags */}
              {data.tags && (
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    {data.tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Originally published at{" "}
                  <a
                    href={data.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {data.sourceDomain}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* News Viewer Panel */}
        <div className="flex-1 lg:min-w-0">
          <div className="sticky top-0 h-screen">
            <NewsViewer
              className="w-full h-full bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm"
              news={data}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
