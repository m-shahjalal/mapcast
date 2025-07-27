"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { BookOpen, X, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { parseArticle } from "./action";
import Link from "next/link";
import { DialogTitle } from "@/components/ui/dialog";
import { parseRootDomain } from "@/utils/urls";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
        <ActionButton color={color} />
      </SheetTrigger>

      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`
          border-l-0 bg-gradient-to-br from-gray-50 to-white 
          dark:from-gray-900 dark:to-gray-800 shadow-2xl
          ${
            isMobile
              ? "h-[90vh] max-h-[90vh] rounded-t-2xl border-t"
              : "rounded-l-2xl h-full min-w-5xl max-w-full"
          }
          [&>button:first-of-type]:hidden
        `}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <SheetHeader
            color={color}
            title={title}
            domain={domain}
            openInNewTab={openInNewTab}
            setIsSheetOpen={setIsSheetOpen}
            isMobile={isMobile}
          />

          <SheetBody
            isLoading={isLoading}
            err={err}
            url={url}
            article={article}
            color={color}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const ActionButton = ({ color }: { color: string }) => (
  <div
    className="group relative overflow-hidden action-button mb-6 w-full px-6 py-3.5 
               text-white dark:text-gray-100 text-sm font-semibold rounded-xl 
               transition-all duration-300 flex items-center justify-center gap-3 
               hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-3 
               focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 
               dark:focus:ring-gray-600 active:scale-[0.98]"
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
    <div
      className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                    transition-transform duration-700 bg-gradient-to-r from-transparent 
                    via-white/20 to-transparent"
    />
  </div>
);

const SheetHeader = ({
  color,
  title,
  domain,
  openInNewTab,
  setIsSheetOpen,
  isMobile,
}: {
  color: string;
  title: string;
  domain: string;
  openInNewTab: () => void;
  setIsSheetOpen: (open: boolean) => void;
  isMobile: boolean;
}) => (
  <div
    className={`
    flex items-center justify-between border-b bg-white/80 dark:bg-gray-800/80 
    dark:border-gray-700 backdrop-blur-sm flex-shrink-0
    ${isMobile ? "p-4 rounded-t-2xl" : "p-6 rounded-tl-2xl"}
  `}
  >
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div
        className="w-3 h-3 rounded-full animate-pulse flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <DialogTitle
          className={`
          font-semibold text-gray-800 dark:text-gray-100 truncate
          ${isMobile ? "text-base underline" : "text-lg"}
        `}
          onClick={() => isMobile && openInNewTab()}
        >
          {title}
        </DialogTitle>
        <p
          className={`
          text-gray-500 dark:text-gray-400 truncate
          ${isMobile ? "text-xs" : "text-sm"}
        `}
        >
          {domain}
        </p>
      </div>
    </div>

    <div className="flex gap-1 flex-shrink-0 ml-2">
      {!isMobile && (
        <HeaderButton
          onClick={openInNewTab}
          icon={ExternalLink}
          label="Open in new tab"
          isMobile={isMobile}
        />
      )}
      <HeaderButton
        onClick={() => setIsSheetOpen(false)}
        icon={X}
        label="Close news reader"
        isMobile={isMobile}
      />
    </div>
  </div>
);

const HeaderButton = ({
  onClick,
  icon: Icon,
  label,
  isMobile,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isMobile: boolean;
}) => (
  <button
    onClick={onClick}
    className={`
      hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors
      ${isMobile ? "p-1.5" : "p-2 px-3"}
    `}
    aria-label={label}
  >
    <Icon
      className={`text-gray-600 dark:text-gray-300 ${
        isMobile ? "h-4 w-4" : "h-4 w-4"
      }`}
    />
  </button>
);

const SheetBody = ({
  isLoading,
  err,
  url,
  article,
  color,
}: {
  isLoading: boolean;
  err: string | null;
  url: string;
  article: any;
  color: string;
}) => (
  <div className="flex-1 overflow-y-auto overscroll-contain">
    {isLoading && <LoadingState color={color} />}
    {err && <ErrorState err={err} url={url} />}
    {article && !isLoading && <ArticleContent article={article} />}
  </div>
);

const LoadingState = ({ color }: { color: string }) => (
  <div className="flex h-full items-center justify-center">
    <Spinner
      size={64}
      variant="ring-3"
      style={{ color }}
      className="dark:[&>*]:border-gray-600"
    />
  </div>
);

const ErrorState = ({ err, url }: { err: string; url: string }) => (
  <div className="p-4 sm:p-6">
    <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
      Error: {err}
    </p>
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-all">
      URL: {url}
    </p>
    <Link
      target="_blank"
      href={url}
      className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline transition-colors text-sm inline-block mt-2"
    >
      Try to read from the original source
    </Link>
  </div>
);

const ArticleContent = ({ article }: { article: any }) => (
  <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
    <SheetTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100 leading-tight">
      {article.title}
    </SheetTitle>

    {article.author && (
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
        By {article.author}
      </p>
    )}

    {article.date_published && (
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
        {new Date(article.date_published).toLocaleDateString()}
      </p>
    )}

    {article.lead_image_url && (
      <img
        src={article.lead_image_url || "/placeholder.svg"}
        alt={article.title || "Article lead image"}
        className="w-full mb-4 sm:mb-6 rounded-lg max-h-64 sm:max-h-80 object-cover"
        loading="lazy"
      />
    )}

    <div
      className="prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none [&>*]:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
    />
  </div>
);
