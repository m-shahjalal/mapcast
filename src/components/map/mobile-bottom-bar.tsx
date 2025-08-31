"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useQueryParams } from "@/hooks/use-query";
import { NewsMapFilters } from "@/types/query-filter";
import { cn } from "@/utils/cn";
import { Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useRef, useState, memo, useMemo, useEffect } from "react";
import { MobileControlsSheet } from "./mobile-control-sheet";

const ContentDisplay = memo(() => {
  const { getParams } = useQueryParams<NewsMapFilters>();
  const hasFilters = useMemo(() => Boolean(getParams()?.length), [getParams]);

  return hasFilters ? (
    <div className="flex items-center flex-1 min-w-0">
      <div className="flex items-center gap-1 flex-1 min-w-0" />
    </div>
  ) : (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-muted-foreground truncate">
        Search places or topics
      </span>
    </div>
  );
});

// Ultra-fast swipe with expanded 200px detection area
const useExpandedSwipe = (
  onSwipeUp: () => void,
  onSwipeDown: () => void,
  containerRef: any
) => {
  const startY = useRef(0);
  const startX = useRef(0);
  const isValidSwipe = useRef(false);
  const threshold = 25;

  return useMemo(
    () => ({
      onTouchStart: (e: TouchEvent) => {
        const touch = e.touches[0];
        startY.current = touch.clientY;
        startX.current = touch.clientX;

        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const expandedTop = rect.top - 100;
        const isInArea =
          touch.clientY >= expandedTop &&
          touch.clientY <= rect.bottom &&
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right;

        isValidSwipe.current = isInArea;
      },

      onTouchMove: (e: TouchEvent) => {
        if (!isValidSwipe.current) return;

        const touch = e.touches[0];
        const deltaY = touch.clientY - startY.current;
        const deltaX = Math.abs(touch.clientX - startX.current);

        if (deltaX > Math.abs(deltaY) * 2) return;

        if (deltaY < -threshold) {
          isValidSwipe.current = false;
          onSwipeUp();
        } else if (deltaY > threshold) {
          isValidSwipe.current = false;
          onSwipeDown();
        }
      },

      onTouchEnd: () => {
        isValidSwipe.current = false;
      },
    }),
    [onSwipeUp, onSwipeDown, containerRef]
  );
};

export const MobileBottomBar = memo(({ className }: { className?: string }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Ultra-fast state updates
  const handleOpen = useCallback(() => {
    setIsSheetOpen(true);
    if (!shouldRender) setShouldRender(true); // Fallback
  }, [shouldRender]);

  const handleClose = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const swipeHandlers = useExpandedSwipe(handleOpen, handleClose, containerRef);

  useEffect(() => {
    document.addEventListener("touchstart", swipeHandlers.onTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", swipeHandlers.onTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", swipeHandlers.onTouchEnd, {
      passive: true,
    });

    return () => {
      document.removeEventListener("touchstart", swipeHandlers.onTouchStart);
      document.removeEventListener("touchmove", swipeHandlers.onTouchMove);
      document.removeEventListener("touchend", swipeHandlers.onTouchEnd);
    };
  }, [swipeHandlers]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          setIsSheetOpen((prev) => !prev);
          break;
        case "Escape":
          if (isSheetOpen) {
            e.preventDefault();
            handleClose();
          }
          break;
      }
    },
    [isSheetOpen, handleClose]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[999] p-0 sm:hidden",
        className
      )}
      style={{ touchAction: "pan-y" }}
    >
      <div className="flex justify-center mb-2">
        <div className="w-10 h-1 bg-gray-300/60 rounded-full" />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            onKeyDown={handleKeyDown}
            className="w-full h-12 rounded-t-2xl rounded-b-none shadow-lg bg-background hover:bg-accent border transition-none"
            style={{ transform: "translateZ(0)" }}
          >
            <div className="flex items-center justify-between w-full px-3 min-w-0 gap-2">
              <div className="flex-1 min-w-0">
                <ContentDisplay />
              </div>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Button>
        </SheetTrigger>

        <div style={{ display: shouldRender ? "block" : "none" }}>
          <MobileControlsSheet className="sm:hidden" setOpen={setIsSheetOpen} />
        </div>
      </Sheet>
    </div>
  );
});

MobileBottomBar.displayName = "MobileBottomBar";
