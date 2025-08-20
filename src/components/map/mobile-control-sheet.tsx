"use client";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useQueryParams } from "@/hooks/use-query";
import { cn } from "@/utils/cn";
import { Eraser } from "lucide-react";
import { TopicFilters } from "./topic-filter";
import { Combobox } from "./combobox";
import { useCallback, useEffect } from "react";

interface MobileControlsSheetProps {
  className?: string;
  setOpen: (open: boolean) => void;
}

export function MobileControlsSheet({
  className,
  setOpen,
}: MobileControlsSheetProps) {
  const { setMultipleParams, clearParams } = useQueryParams();

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const handleClear = useCallback(() => {
    clearParams("all");
    handleClose();
  }, [clearParams, handleClose]);

  const handleDateUpdate = useCallback(
    ({ range }: any) => {
      setMultipleParams({
        from: range.from.toISOString(),
        to: range.to?.toISOString() ?? new Date().toISOString(),
      });
      handleClose();
    },
    [setMultipleParams, handleClose]
  );

  useEffect(() => {
    let startY = 0;
    let isTracking = false;

    const handleStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, input, select")) return;

      startY = e.touches[0].clientY;
      isTracking = true;
    };

    const handleMove = (e: TouchEvent) => {
      if (!isTracking) return;

      const deltaY = e.touches[0].clientY - startY;
      if (deltaY > 20) {
        const scrollEl = (e.target as HTMLElement).closest(".overflow-y-auto");
        if (scrollEl && scrollEl.scrollTop <= 5) e.preventDefault();
      }
    };

    const handleEnd = (e: TouchEvent) => {
      if (!isTracking) return;

      const distance = e.changedTouches[0].clientY - startY;
      const velocity = Math.abs(distance) / 100; // Simplified velocity

      isTracking = false;

      if (distance > 80 || (distance > 40 && velocity > 0.6)) {
        handleClose();
      }
    };

    document.addEventListener("touchstart", handleStart, { passive: true });
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleStart);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [handleClose]);

  return (
    <SheetContent
      side="bottom"
      className={cn(
        "h-[90vh] max-w-full rounded-t-2xl flex flex-col bg-white dark:bg-neutral-900 dark:border-neutral-700",
        className
      )}
    >
      <SheetHeader className="p-4 pb-0 flex-shrink-0">
        <div className="flex justify-center mb-3 p-2 -m-2">
          <div className="w-16 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
        </div>
        <SheetTitle className="text-center text-lg font-semibold dark:text-gray-200">
          Explore Map
        </SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
        <Combobox closeSheet={handleClose} />
        <DateRangePicker onUpdate={handleDateUpdate} />
        <div className="flex-1 flex gap-2">
          <div className="flex-1 max-w-full">
            <TopicFilters handleCloseSheet={handleClose} />
          </div>
          <Button
            onClick={handleClear}
            size="sm"
            className="rounded-md px-8 py-2 h-9 shadow-sm flex-shrink-0 bg-red-400 hover:bg-red-500 border-red-300 text-red-100"
          >
            <Eraser className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
