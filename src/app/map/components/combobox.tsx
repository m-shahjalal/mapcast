"use client";

import { MapPin, Search } from "lucide-react";
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
import type { LocationData } from "@/lib/map-context";
import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";

interface ComboboxProps {
  data: LocationData[];
  showLeader?: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedLocation: (location: LocationData | null) => void;
  selectedLocation: LocationData | null;
}

export function Combobox({
  data,
  setSearchQuery,
  setSelectedLocation,
  selectedLocation,
}: ComboboxProps) {
  const map = useMap();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedLocation?.name || "");

  useEffect(() => {
    setValue(selectedLocation?.name || "");
  }, [selectedLocation]);

  const handleInputChange = (query: string) => {
    setValue(query);
    setSearchQuery(query);
  };

  const handleSelect = (item: LocationData) => {
    setValue(item.name);
    setSelectedLocation(item);
    setOpen(false);
    map.flyTo([item.lat, item.lng], 15, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  };

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
      className="flex items-center w-full sm:max-w-[200px] justify-start bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 h-12 pr-2 min-w-xs mb-4 transition-colors"
    >
      <Search className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
      <span className="truncate overflow-hidden whitespace-nowrap text-gray-900 dark:text-gray-100">
        {value || "Search for places, events or topics"}
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
      <div className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors text-left">
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{renderSearchButton()}</PopoverTrigger>
      <PopoverContent className="min-w-[320px] max-h-[50vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <Command className="h-full">
          <CommandInput
            value={value}
            onValueChange={handleInputChange}
            placeholder="Search..."
            className="h-9 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          <CommandList className="h-full max-h-[40vh] overflow-y-auto">
            <CommandEmpty className="text-gray-500 dark:text-gray-400 text-center py-6">
              No results found
            </CommandEmpty>
            {data?.map(renderCommandItem)}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
