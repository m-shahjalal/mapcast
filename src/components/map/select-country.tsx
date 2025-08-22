"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMapContext } from "@/config/map-context";
import { useQueryParams } from "@/hooks/use-query";
import { NewsMapFilters } from "@/types/query-filter";
import { countries } from "@/utils/dropdown-list";
import { Globe, MapPin, X } from "lucide-react";
import { useMap } from "react-leaflet";

interface CountrySelectProps {
  onChange?: (key: keyof NewsMapFilters, value: string | null) => void;
  value?: string;
  placeholder?: string;
}

const styles = {
  trigger:
    "group w-full h-10 rounded-full bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-0 focus:ring-transparent focus:border-gray-200/50 dark:focus:border-gray-700/50",
  content:
    "w-[var(--radix-select-trigger-width)] min-w-[230px] sm:max-w-[300px] rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-800/95 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10",
  item: "rounded-lg hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 focus:bg-gradient-to-r focus:from-blue-50/80 focus:to-indigo-50/80 dark:focus:from-blue-900/30 dark:focus:to-indigo-900/30 transition-all duration-200",
  clearButton:
    "absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100",
  clearIcon:
    "w-3 h-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200",
  loadingItem:
    "rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 animate-pulse",
};

export function CountrySelect({ onChange, value }: CountrySelectProps) {
  const map = useMap();
  const { setParams, getParams } = useQueryParams<NewsMapFilters>();
  const { setLocation, isPending, selectedLocation, setZoom } = useMapContext();
  const country = value !== undefined ? value : getParams("country");

  const handleCountryChange = async (value: string) => {
    if (onChange) return onChange("country", value);
    setParams("country", value);
  };

  const handleClear = (e: React.MouseEvent) => {
    map.flyTo([0, 0], 3);
    setZoom(map.getZoom());

    if (onChange) onChange("country", null);
    else setParams("country", null);

    e.preventDefault();
    e.stopPropagation();
    setLocation(null);
    setZoom(map.getZoom());
  };

  const currentCountry = countries.find(
    (c) => c.code.toLowerCase() === selectedLocation?.countryCode?.toLowerCase()
  );

  return (
    <div className="relative flex items-center gap-2 min-w-0 w-full sm:max-w-[220px] flex-1 group">
      <Select
        value={value ? value : country}
        onValueChange={handleCountryChange}
      >
        <SelectTrigger className={styles.trigger}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0 relative">
              <SelectValue placeholder="country" />
              {!country && (
                <>
                  <Globe className=" h-4 w-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <span>Country</span>
                </>
              )}
            </div>
          </div>
        </SelectTrigger>

        {country && (
          <button onClick={handleClear} className={styles.clearButton}>
            <X className={styles.clearIcon} />
          </button>
        )}

        <SelectContent className={styles.content}>
          {countries.map((item) => (
            <SelectItem
              key={item.code}
              value={item.code}
              className={`${styles.item} ${
                isPending && currentCountry?.name === item.name
                  ? styles.loadingItem
                  : ""
              }`}
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <span className="text-lg flex-shrink-0">{item.flag}</span>
                {item.name && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate flex-1 min-w-0">
                    {item.name}
                  </span>
                )}
                {currentCountry?.name === item.name && (
                  <MapPin className="ml-auto h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
