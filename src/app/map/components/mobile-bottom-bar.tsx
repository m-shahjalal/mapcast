"use client";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapSearch } from "@/hooks/use-map-search";
import { MobileControlsSheet } from "./mobile-control-sheet";
import { useQueryParams } from "@/hooks/use-query";
import { newsTopicDropdown } from "@/shared/enum-list";
import { useEffect, useRef, useState } from "react";

interface ResponsiveTopicDisplayProps {
  activeFilters: string[];
}

function ResponsiveTopicDisplay({
  activeFilters,
}: ResponsiveTopicDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(activeFilters.length);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateVisibleTopics = () => {
      // Get the actual button element to measure available space
      const button = containerRef.current?.closest("button");
      if (!button) return;

      const buttonRect = button.getBoundingClientRect();
      const buttonPadding = 24; // px-3 = 12px each side
      const iconWidth = 20; // h-4 w-4 + some margin
      const gapWidth = 8; // gap-2

      // Available width = button width - padding - icon - gap
      const availableWidth =
        buttonRect.width - buttonPadding - iconWidth - gapWidth;
      const moreIndicatorWidth = 40; // Compact "+X" indicator
      const chipGap = 4; // gap-1 between chips

      let usedWidth = 0;
      let count = 0;

      for (let i = 0; i < activeFilters.length; i++) {
        const topic = newsTopicDropdown.find(
          (t) => t.topic === activeFilters[i]
        );
        // More accurate width calculation: character width + padding
        const topicWidth = Math.max((topic?.topic.length || 0) * 7 + 16, 40);
        const currentGap = i > 0 ? chipGap : 0;

        const remainingItems = activeFilters.length - i - 1;
        const needsMoreIndicator = remainingItems > 0;
        const requiredWidth =
          usedWidth +
          topicWidth +
          currentGap +
          (needsMoreIndicator ? moreIndicatorWidth : 0);

        if (requiredWidth <= availableWidth) {
          usedWidth += topicWidth + currentGap;
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(1, count));
    };

    const resizeObserver = new ResizeObserver(calculateVisibleTopics);
    const timeoutId = setTimeout(calculateVisibleTopics, 0);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

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
}

interface ContentDisplayProps {
  selectedLocation: any;
  activeFilters: string[] | undefined;
}

function ContentDisplay({
  selectedLocation,
  activeFilters,
}: ContentDisplayProps) {
  if (selectedLocation?.name) {
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Search className="h-4 w-4 text-muted-foreground dark:text-gray-400 flex-shrink-0" />
        <span className="text-sm text-muted-foreground dark:text-gray-400 truncate">
          {selectedLocation.name}
        </span>
      </div>
    );
  }

  if (activeFilters && activeFilters.length > 0) {
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
}

export function MobileBottomBar({ className }: { className?: string }) {
  const { selectedLocation } = useMapSearch();
  const { get } = useQueryParams();
  const activeFilters = get("topics")?.split(",").filter(Boolean);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[999] p-4 sm:hidden",
        className
      )}
    >
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-12 rounded-full shadow-lg bg-background dark:bg-gray-800 hover:dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center justify-between w-full px-3 min-w-0 gap-2">
              <div className="flex-1 min-w-0">
                <ContentDisplay
                  selectedLocation={selectedLocation}
                  activeFilters={activeFilters}
                />
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
