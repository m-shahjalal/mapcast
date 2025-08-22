"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useQueryParams } from "@/hooks/use-query";
import { useSwipeGesture } from "@/hooks/use-swiper";
import { NewsMapFilters } from "@/types/query-filter";
import { cn } from "@/utils/cn";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { MobileControlsSheet } from "./mobile-control-sheet";

const ResponsiveTopicDisplay = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getParams } = useQueryParams<NewsMapFilters>();
  const country = getParams("country");
  const topic = getParams("topic");

  return (
    <div ref={containerRef} className="flex items-center flex-1 min-w-0">
      <div className="flex items-center gap-1 flex-1 min-w-0"></div>
    </div>
  );
};

const ContentDisplay = () => {
  const { getParams } = useQueryParams<NewsMapFilters>();
  const fitlers = getParams();

  if (fitlers?.length) {
    return <ResponsiveTopicDisplay />;
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

  const swipeRef = useSwipeGesture({
    onSwipeUp: () => setIsSheetOpen(true),
    onSwipeDown: () => setIsSheetOpen(false),
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
        <MobileControlsSheet className="sm:hidden" setOpen={setIsSheetOpen} />
      </Sheet>
    </div>
  );
}
