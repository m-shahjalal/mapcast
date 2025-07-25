"use client";

import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Combobox } from "@/app/map/components/combobox";
import { TopicFilters } from "@/app/map/components/topic-filter";
import { useMapSearch } from "@/hooks/use-map-search";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { LocationData } from "@/lib/map-context";

export function MobileControlsSheet({
  className,
  open,
  setOpen,
}: {
  className?: string;
  open?: boolean;
  setOpen: (open: boolean) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    searchResults,
    setSelectedLocation,
    setSearchQuery,
    selectedLocation,
  } = useMapSearch();

  const handleSearchSelect = (location: LocationData | null) => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setSelectedLocation(location);
      setOpen(false);
    }, 500);
  };

  const handleClose = () => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setOpen(false);
    }, 1500);
  };

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
        <Combobox
          selectedLocation={selectedLocation}
          data={searchResults}
          setSearchQuery={setSearchQuery}
          setSelectedLocation={handleSearchSelect}
          showLeader={false}
        />
        <div className="flex-1">
          <TopicFilters onSelectionChange={handleClose} shouldExpand />
        </div>
      </div>
    </SheetContent>
  );
}
