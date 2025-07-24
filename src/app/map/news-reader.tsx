"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { parseRootDomain } from "@/lib/parse-domain";
import { BookOpen, ExternalLink, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { parseArticle } from "./action";
import Link from "next/link";
import { DialogTitle } from "@/components/ui/dialog";

export const NewsReader = ({
  url,
  color = "#3b82f6",
  title = "News Article",
}: {
  url: string;
  color?: string;
  title?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [article, setArticle] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const domain = parseRootDomain(url) ?? "Unknown Source";

  useEffect(() => {
    setIsLoading(true);
    setErr(null);
    setArticle(null);

    parseArticle(url)
      .then((response) => {
        if (!response.success || response.error) {
          setErr(
            response.error || "Something went wrong while parsing the article."
          );
          setArticle(null);
        } else {
          setArticle(response.data);
          setErr(null);
        }
      })
      .catch((error) => {
        setErr(error.message || "An unexpected error occurred.");
        setArticle(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      setIsLoading(true);
      setErr(null);
      setArticle(null);
    };
  }, [url]);

  const openInNewTab = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger className="w-full">
        <div
          className="group relative overflow-hidden overflow-y-auto action-button mb-6 w-full px-6 py-3.5 text-white text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-3 focus:ring-offset-2 active:scale-[0.98]"
          style={{
            backgroundColor: color,
            boxShadow: `0 4px 14px 0 ${color}33`,
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(45deg, ${color}, ${color}dd)`,
            }}
          />
          <BookOpen className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
          <span className="relative z-10 font-medium">Read Full Story</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </SheetTrigger>
      <SheetContent className="min-w-[80vw] border-l-0 rounded-l-2xl bg-gradient-to-br from-gray-50 to-white shadow-2xl [&>button:first-of-type]:hidden">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b bg-white/80 backdrop-blur-sm rounded-tl-2xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: color }}
              />
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-800">
                  {title}
                </DialogTitle>
                <p className="text-sm text-gray-500">{domain}</p>
              </div>
            </div>
            <div>
              <button
                onClick={openInNewTab}
                className="p-2 px-3 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="p-2 px-3 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close news reader"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex h-full items-center justify-center">
                <Spinner size={64} variant="ring-3" style={{ color }} />
              </div>
            )}
            {err && (
              <div className="p-6 text-red-600">
                <p>Error: {err}</p>
                <p className="text-sm text-gray-600 mt-2">URL: {url}</p>
                <Link
                  target="_blank"
                  href={url}
                  className="text-blue-500 underline"
                >
                  Try to read from the original source
                </Link>
              </div>
            )}
            {article && !isLoading && (
              <div className="max-w-4xl mx-auto p-8">
                <SheetTitle className="text-3xl font-bold mb-4">
                  {article.title}
                </SheetTitle>
                {article.author && (
                  <p className="text-gray-600 mb-2">By {article.author}</p>
                )}
                {article.date_published && (
                  <p className="text-gray-500 mb-6">
                    {new Date(article.date_published).toLocaleDateString()}
                  </p>
                )}
                {article.lead_image_url && (
                  <img
                    src={article.lead_image_url || "/placeholder.svg"}
                    alt={article.title || "Article lead image"}
                    className="w-full mb-6 rounded"
                  />
                )}
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
                />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
