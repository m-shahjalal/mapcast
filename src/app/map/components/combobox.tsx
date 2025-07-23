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

export function Combobox({
  data,
  setSearchQuery,
  setSelectedLocation,
  selectedLocation,
}: {
  data: LocationData[];
  showLeader?: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedLocation: (location: LocationData | null) => void;
  selectedLocation: LocationData | null;
}) {
  const map = useMap();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedLocation?.name || "");

  useEffect(() => {
    setValue(selectedLocation?.name || "");
  }, [selectedLocation]);

  const onInputChange = (e: string) => {
    setValue(e);
    setSearchQuery(e);
  };

  const handleSelect = (item: LocationData) => {
    setValue(item.name);
    setSelectedLocation(item);
    setOpen(false);
    map.flyTo([item.lat, item.lng], 15, { duration: 1.5, easeLinearity: 0.25 });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex items-center max-w-[200px] justify-start bg-white rounded-full shadow-md h-12 pr-2 min-w-xs mb-4"
        >
          <Search className="h-5 w-5 text-muted-foreground mr-2" />
          <span className="truncate overflow-hidden whitespace-nowrap">
            {value ? value : "Search for places, events or topics"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[320px] h-full min-h-[calc(100vh/2)]">
        <Command className="h-full">
          <CommandInput
            value={value} // Make CommandInput controlled by the 'value' state
            onValueChange={onInputChange}
            placeholder="Search..."
            className="h-9"
          />
          <CommandList className="h-full">
            <CommandEmpty />
            {data?.map((i) => (
              <CommandItem
                key={i.lat}
                value={`${i.name}-${i.lat}-${i.lng}`} // Use a unique value for cmdk's internal logic
                onSelect={() => handleSelect(i)} // Pass the item directly to the handler
              >
                <div className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors text-left h-fit">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{i.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.address}
                    </div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
