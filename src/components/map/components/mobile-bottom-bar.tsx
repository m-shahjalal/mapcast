"use client";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileControlsSheet } from "./mobile-control-sheet";
import { useQueryParams } from "@/hooks/use-query";
import { newsTopicDropdown } from "@/shared/enum-list";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { NewsMapFilters } from "@/types/query-filter";
import { useSwipeGesture } from "@/hooks/use-swiper";

const ResponsiveTopicDisplay = ({
  activeFilters,
}: {
  activeFilters: string[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(activeFilters.length);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateVisible = () => {
      const button = containerRef.current?.closest("button");
      if (!button) return;

      const { width } = button.getBoundingClientRect();
      const availableWidth = width - 52; // padding + icon + gap
      let usedWidth = 0;
      let count = 0;

      for (let i = 0; i < activeFilters.length; i++) {
        const topic = newsTopicDropdown.find(
          (t) => t.topic === activeFilters[i]
        );
        const topicWidth = Math.max((topic?.topic.length || 0) * 7 + 16, 40);
        const needsMore = activeFilters.length - i - 1 > 0;
        const requiredWidth =
          usedWidth + topicWidth + (i > 0 ? 4 : 0) + (needsMore ? 40 : 0);

        if (requiredWidth <= availableWidth) {
          usedWidth += topicWidth + (i > 0 ? 4 : 0);
          count++;
        } else break;
      }

      setVisibleCount(Math.max(1, count));
    };

    const resizeObserver = new ResizeObserver(calculateVisible);
    const timeoutId = setTimeout(calculateVisible, 0);

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [activeFilters]);

  const visibleTopics = activeFilters.slice(0, visibleCount);
  const remainingCount = activeFilters.length - visibleCount;

  return (
    <div ref={containerRef} className="flex items-center flex-1 min-w-0">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {visibleTopics.map((filter, index) => {
          const topic = newsTopicDropdown.find((t) => t.topic === filter);
          return (
            <span
              key={`${topic?.topic}-${index}`}
              style={{ backgroundColor: `${topic?.color}50` }}
              className="rounded text-xs px-2 py-1 whitespace-nowrap"
            >
              {topic?.topic}
            </span>
          );
        })}
        {remainingCount > 0 && (
          <span className="text-xs text-muted-foreground dark:text-gray-400 whitespace-nowrap ml-1 font-medium">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  );
};

const ContentDisplay = () => {
  const { getParams } = useQueryParams<NewsMapFilters>();
  const activeFilters = useMemo(
    () => getParams("topics")?.split(",").filter(Boolean),
    [getParams]
  );

  if (activeFilters?.length) {
    return <ResponsiveTopicDisplay activeFilters={activeFilters} />;
  }

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Search className="h-4 w-4 text-muted-foreground dark:text-gray-400 flex-shrink-0" />
      <span className="text-sm text-muted-foreground dark:text-gray-400 truncate">
        Search places or topics
      </span>
    </div>
  );
};

export function MobileBottomBar({ className }: { className?: string }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSwipeUp = useCallback(() => setIsSheetOpen(true), []);
  const handleSwipeDown = useCallback(() => setIsSheetOpen(false), []);

  const swipeRef = useSwipeGesture({
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown,
    threshold: 30,
    velocity: 0.2,
  });

  return (
    <div
      ref={swipeRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[999] p-0 sm:hidden",
        className
      )}
    >
      <div className="flex justify-center mb-2">
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-60" />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-12 rounded-t-2xl rounded-b-none shadow-lg bg-background dark:bg-gray-800 hover:dark:bg-gray-700 border-gray-200 dark:border-gray-600 transition-all duration-200 active:scale-95"
          >
            <div className="flex items-center justify-between w-full px-3 min-w-0 gap-2">
              <div className="flex-1 min-w-0">
                <ContentDisplay />
              </div>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground dark:text-gray-400 flex-shrink-0" />
            </div>
          </Button>
        </SheetTrigger>
        <MobileControlsSheet setOpen={setIsSheetOpen} />
      </Sheet>
    </div>
  );
}
