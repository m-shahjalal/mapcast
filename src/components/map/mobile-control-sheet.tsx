"use client";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useQueryParams } from "@/hooks/use-query";
import { NewsMapFilters } from "@/types/query-filter";
import { cn } from "@/utils/cn";
import { Eraser, Filter } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CountrySelect } from "./select-country";
import { DateSelect } from "./select-date";
import { TopicFilters } from "./select-topic";

interface MobileControlsSheetProps {
  className?: string;
  setOpen: (open: boolean) => void;
}

export function MobileControlsSheet({
  className,
  setOpen,
}: MobileControlsSheetProps) {
  const { setMultipleParams, clearParams, getParams } = useQueryParams();
  const [params, setParams] = useState<NewsMapFilters>(getParams());

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const handleClear = useCallback(() => {
    clearParams("all");
    handleClose();
  }, [clearParams, handleClose]);

  const onChangeHandler = (key: keyof NewsMapFilters, value: string | null) => {
    setParams({ ...params, [key]: value });
  };

  const handleApplyFilter = () => {
    setMultipleParams(params as Record<string, any>);
    setOpen(false);
  };

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
      const velocity = Math.abs(distance) / 100;

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
          <div className="w-full h-10 flex items-center justify-center rounded bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl gap-0.5">
            <Image
              src="/logo.png"
              className="-translate-x-1"
              alt="MapCast Logo"
              width={32}
              height={32}
            />
            <span className="capitalize text-lg font-bold text-gray-800 dark:text-gray-100 -translate-x-1">
              MapCast
            </span>
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-2 px-4">
        <CountrySelect onChange={onChangeHandler} value={params?.country} />
        <DateSelect
          onChange={onChangeHandler}
          from={params?.from}
          to={params?.to}
        />
        <TopicFilters onChange={onChangeHandler} value={params?.topic} />
        <div className="flex gap-2 mt-8">
          <Button
            onClick={handleClear}
            variant="destructive"
            className="w-fit max-w-fit flex-1 h-10 rounded backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-0 focus:ring-transparent"
          >
            <Eraser className="h-3 w-3" />
            Clear
          </Button>

          <Button
            onClick={handleApplyFilter}
            variant="default"
            className="w-full flex-1 h-10 rounded backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-0 focus:ring-transparent focus:border-gray-200/50 "
          >
            <Filter className="h-3 w-3 mr-1" />
            Apply Filters
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
