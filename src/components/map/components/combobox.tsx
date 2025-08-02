"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationData, useMapContext } from "@/config/map-context";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { getNews } from "@/server/actions/news.action";
import axios from "axios";

export function Combobox({ closeSheet }: { closeSheet?: () => void }) {
  const map = useMap();
  const [open, setOpen] = useState(false);
  const { setLocation, selectedLocation } = useMapContext();
  const [filteredList, setFilteredList] = useState<LocationData[]>([]);
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const timer = useRef<NodeJS.Timeout>(null);

  const handleSelect = (item: LocationData) => {
    setLocation(item);
    setOpen(false);

    // Stop any ongoing animations
    map.stop();

    if (item.boundingbox && item.boundingbox.length === 4) {
      try {
        const bounds = item.boundingbox.map((coord) => parseFloat(coord));

        // Create bounds as simple array for React Leaflet
        const boundsArray = [
          [bounds[0], bounds[2]], // [south, west]
          [bounds[1], bounds[3]], // [north, east]
        ] as [[number, number], [number, number]];

        // Use flyToBounds for smooth animation to bounded area
        map.flyToBounds(boundsArray, {
          padding: [20, 20],
          maxZoom: 15,
          duration: 1.5,
        });
      } catch (error) {
        console.error("flyToBounds failed:", error);
        // Fallback to flyTo center point
        map.flyTo([item.lat, item.lng], 12, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    } else {
      // Fallback for locations without bounding box
      map.flyTo([item.lat, item.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }

    closeSheet?.();
  };

  const searchLocation = async (searchValue: string) => {
    if (!searchValue.trim()) {
      setFilteredList([]);
      return;
    }

    setIsLoading(true);

    try {
      const [{ data: locations }, { result: newsList }] = await Promise.all([
        axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchValue
          )}&format=json&limit=5&polygon_geojson=1&extratags=1&addressdetails=1`
        ),
        getNews({ search: searchValue }),
      ]);

      const results: LocationData[] = [
        ...locations.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.name || item.display_name.split(",")[0],
          address: item.display_name,
          geojson: item.geojson,
          boundingbox: item.boundingbox,
          place_id: item.place_id,
          osm_type: item.osm_type,
          osm_id: item.osm_id,
        })),
        ...(newsList?.map((item: any) => ({
          lat: parseFloat(item.latitude ?? "0"),
          lng: parseFloat(item.longitude ?? "0"),
          name: item.title || "",
          address: "",
        })) || []),
      ];

      setFilteredList(results);
    } catch (error) {
      console.error("Search error:", error);
      setFilteredList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    setValue(newValue);

    if (timer.current) {
      clearTimeout(timer.current);
    }

    if (newValue.trim()) {
      timer.current = setTimeout(() => searchLocation(newValue), 500);
    } else {
      setFilteredList([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const renderIcon = (item: LocationData) =>
    item.address ? (
      <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    ) : (
      <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    );

  const renderSearchButton = () => (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className="flex items-center w-full sm:max-w-[200px] justify-start bg-white/70 dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 h-10 pr-2 min-w-3xs transition-colors border-none"
    >
      <Search className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
      <span className="truncate overflow-hidden whitespace-nowrap text-gray-900 dark:text-gray-100">
        {selectedLocation?.name || "Search ..."}
      </span>
    </Button>
  );

  const renderCommandItem = (item: LocationData) => (
    <CommandItem
      key={`${item.lat}-${item.lng}-${item.name}`}
      value={`${item.name}-${item.lat}-${item.lng}`}
      onSelect={() => handleSelect(item)}
      className="p-0"
    >
      <div
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors text-left"
        onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
        onClick={(e) => {
          e.stopPropagation(); // Stop event bubbling
          handleSelect(item);
        }}
      >
        {renderIcon(item)}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
            {item.name}
          </div>
          {item.address && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {item.address}
            </div>
          )}
        </div>
      </div>
    </CommandItem>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-6 text-gray-500 dark:text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      <span className="text-sm">Searching...</span>
    </div>
  );

  const renderEmptyState = () => {
    if (isLoading) return renderLoadingState();

    if (!value.trim()) {
      return (
        <div className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">
          Start typing to search for locations
        </div>
      );
    }

    return (
      <div className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">
        Not found
      </div>
    );
  };

  return (
    <div className="relative z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{renderSearchButton()}</PopoverTrigger>
        <PopoverContent
          className="min-w-[320px] max-h-[50vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 z-[1000]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command className="h-full">
            <CommandInput
              value={value}
              onValueChange={handleInputChange}
              placeholder="Search..."
              className="h-9 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <CommandList className="h-full max-h-[40vh] overflow-y-auto">
              <CommandEmpty className="hidden" />
              {filteredList.length === 0
                ? renderEmptyState()
                : filteredList.map(renderCommandItem)}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
