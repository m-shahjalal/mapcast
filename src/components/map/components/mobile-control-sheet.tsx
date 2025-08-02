"use client";

import { DateRangePicker } from "@/components/date-picker/date-range-picker";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useQueryParams } from "@/hooks/use-query";
import { cn } from "@/lib/utils";
import { Eraser } from "lucide-react";
import { TopicFilters } from "./topic-filter";
import { Combobox } from "./combobox";

export function MobileControlsSheet({
  className,
  setOpen,
}: {
  className?: string;
  setOpen: (open: boolean) => void;
}) {
  const { setMultipleParams, clearParams } = useQueryParams();

  return (
    <SheetContent
      side="bottom"
      className={cn(
        "h-[90vh] rounded-t-2xl flex flex-col bg-white dark:bg-neutral-900 dark:border-neutral-700",
        className
      )}
    >
      <SheetHeader className="p-4 pb-0">
        <SheetTitle className="text-center text-lg font-semibold dark:text-gray-200">
          Explore Map
        </SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-4 p-4 overflow-y-auto">
        <Combobox closeSheet={() => setOpen(false)} />
        <DateRangePicker
          onUpdate={({ range }) =>
            setMultipleParams({
              from: range.from.toISOString(),
              to: range.to?.toISOString() ?? new Date().toISOString(),
            })
          }
        />
        <div className="flex-1 flex">
          <TopicFilters />
          <Button
            onClick={() => clearParams("all")}
            size="sm"
            className="rounded-md px-8 py-2 h-9 shadow-sm flex-shrink-0 bg-red-400 hover:bg-red-500 border-red-300 text-red-100"
          >
            <Eraser className="h-3 w-3 mr-1" />
            <span className=""> Clear</span>
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
