"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useQueryParams } from "@/hooks/use-query";
import { NewsMapFilters } from "@/types/query-filter";
import { cn } from "@/utils/cn";
import { Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useRef, useState, memo } from "react";
import { MobileControlsSheet } from "@/components/map/mobile-control-sheet";

// Memoized components to prevent unnecessary re-renders
const ResponsiveTopicDisplay = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} className="flex items-center flex-1 min-w-0">
      <div className="flex items-center gap-1 flex-1 min-w-0" />
    </div>
  );
});

const ContentDisplay = memo(() => {
  const { getParams } = useQueryParams<NewsMapFilters>();
  const filters = getParams();
  
  if (filters?.length) {
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
});

// Ultra-sensitive swipe hook with precise area control
const useOptimizedSwipe = (callbacks: {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  threshold?: number;
  maxDetectionHeight?: number;
}) => {
  const touchStart = useRef<{ y: number; x: number; time: number; isValidStart: boolean } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(null);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    
    // Calculate detection area - 150px above the bar
    const maxHeight = callbacks.maxDetectionHeight || 150;
    const detectionStartY = rect.top - maxHeight;
    const detectionEndY = rect.bottom;
    
    // Check if touch starts in valid area (within bar width and height range)
    const isValidStart = touchY >= detectionStartY && 
                        touchY <= detectionEndY &&
                        touchX >= rect.left && 
                        touchX <= rect.right;
    
    touchStart.current = {
      y: touchY,
      x: touchX,
      time: Date.now(),
      isValidStart
    };
  }, [callbacks.maxDetectionHeight]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current || !touchStart.current.isValidStart) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStart.current.y;
    const threshold = callbacks.threshold || 20;
    
    // Immediate response on threshold breach
    if (Math.abs(deltaY) > threshold) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      
      rafId.current = requestAnimationFrame(() => {
        if (deltaY < -threshold) { // Swipe up (negative delta)
          callbacks.onSwipeUp();
        } else if (deltaY > threshold) { // Swipe down (positive delta)
          callbacks.onSwipeDown();
        }
      });
      
      touchStart.current = null; // Prevent multiple triggers
    }
  }, [callbacks]);
  
  const handleTouchEnd = useCallback(() => {
    touchStart.current = null;
  }, []);
  
  // Attach listeners to document for broader detection area
  const attachListeners = useCallback((element: HTMLDivElement) => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return elementRef;
};

export const MobileBottomBar = memo(({ className }: { className?: string }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Immediate state updates with flushSync for instant response
  const handleSwipeUp = useCallback(() => {
    setIsSheetOpen(true);
  }, []);
  
  const handleSwipeDown = useCallback(() => {
    setIsSheetOpen(false);
  }, []);
  
  const handleSheetChange = useCallback((open: boolean) => {
    setIsSheetOpen(open);
  }, []);
  
  // Handle keydown events with immediate response
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ': // Space key
        e.preventDefault();
        setIsSheetOpen(prev => !prev);
        break;
      case 'Escape':
        if (isSheetOpen) {
          e.preventDefault();
          setIsSheetOpen(false);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsSheetOpen(true);
        break;
      case 'ArrowDown':
        if (isSheetOpen) {
          e.preventDefault();
          setIsSheetOpen(false);
        }
        break;
    }
  }, [isSheetOpen]);
  
  const swipeRef = useOptimizedSwipe({
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown,
    threshold: 20, // Reduced threshold for faster response
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
      
      <Sheet open={isSheetOpen} onOpenChange={handleSheetChange}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            onKeyDown={handleKeyDown}
            className="w-full h-12 rounded-t-2xl rounded-b-none shadow-lg bg-background dark:bg-gray-800 hover:dark:bg-gray-700 border-gray-200 dark:border-gray-600 transition-transform duration-150 active:scale-95 will-change-transform"
          >
            <div className="flex items-center justify-between w-full px-3 min-w-0 gap-2">
              <div className="flex-1 min-w-0">
                <ContentDisplay />
              </div>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground dark:text-gray-400 flex-shrink-0" />
            </div>
          </Button>
        </SheetTrigger>
        
        {/* Lazy load sheet content for instant open */}
        {isSheetOpen && (
          <MobileControlsSheet 
            className="sm:hidden" 
            setOpen={setIsSheetOpen}
          />
        )}
      </Sheet>
    </div>
  );
});

MobileBottomBar.displayName = "MobileBottomBar";