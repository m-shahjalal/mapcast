"use client";

import { useState } from "react";
import { X, Globe, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/utils/dropdown-list";
import { useMapContext } from "@/config/map-context";

interface CountrySelectProps {
  onCountryChange?: (country: string | null) => void;
  placeholder?: string;
}

// OpenStreetMap Nominatim API interface
interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  geojson?: any;
}

const styles = {
  trigger:
    "group min-w-[230px] w-full h-10 rounded-full bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-0 focus:ring-transparent focus:border-gray-200/50 dark:focus:border-gray-700/50",
  content:
    "w-[var(--radix-select-trigger-width)] min-w-[230px] max-w-[300px] rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-800/95 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10",
  item: "rounded-lg hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 focus:bg-gradient-to-r focus:from-blue-50/80 focus:to-indigo-50/80 dark:focus:from-blue-900/30 dark:focus:to-indigo-900/30 transition-all duration-200",
  clearButton:
    "absolute top-2 right-7 flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 z-10",
  clearIcon:
    "w-3 h-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400",
  loadingItem:
    "rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 animate-pulse",
};

export function CountrySelect({
  onCountryChange,
  placeholder = "Select country...",
}: CountrySelectProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { setLocation } = useMapContext();

  // Fetch country boundary data from OpenStreetMap
  const fetchCountryBoundary = async (countryName: string) => {
    setIsLoading(true);
    try {
      // First, get the country data with polygon details
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(countryName)}` +
          `&format=json` +
          `&polygon_geojson=1` +
          `&addressdetails=1` +
          `&limit=1` +
          `&countrycodes=` + // You can restrict to specific country codes if needed
          `&featureType=country`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NominatimResult[] = await response.json();

      if (data.length > 0) {
        const countryData = data[0];

        const locationData = {
          latitude: countryData.lat,
          longitude: countryData.lon,
          name: countryData.display_name,
          geojson: countryData.geojson,
          boundingbox: countryData.boundingbox,
          osm_id: countryData.osm_id,
          osm_type: countryData.osm_type,
        };

        setLocation(locationData as any);
        console.log("Country boundary data loaded:", locationData);
      } else {
        console.warn("No boundary data found for:", countryName);
        // Fallback: set location without boundary data
        setLocation({
          latitude: "0",
          longitude: "0",
          name: countryName,
        } as any);
      }
    } catch (error) {
      console.error("Error fetching country boundary:", error);
      setLocation({
        latitude: "0",
        longitude: "0",
        name: countryName,
      } as any);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryChange = async (value: string) => {
    if (!value || value === "") {
      setSelectedCountry("");
      setLocation(null);
      onCountryChange?.(null);
      return;
    }

    setSelectedCountry(value);
    onCountryChange?.(value);

    // Fetch and set OpenStreetMap boundary data
    await fetchCountryBoundary(value);
  };

  const handleClear = () => {
    setSelectedCountry("");
    setLocation(null);
    onCountryChange?.(null);
  };

  const currentCountry = countries.find((c) => c.value === selectedCountry);

  return (
    <div className="relative z-50">
      <Select value={selectedCountry} onValueChange={handleCountryChange}>
        <SelectTrigger className={styles.trigger}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Loading map data...
                  </span>
                </>
              ) : currentCountry ? (
                <>
                  <span className="text-lg flex-shrink-0">
                    {currentCountry.flag}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {currentCountry.name}
                  </span>
                  <MapPin className="ml-1 h-3 w-3 text-green-600 dark:text-green-400" />
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
                  <SelectValue placeholder={placeholder} />
                </>
              )}
            </div>
          </div>
        </SelectTrigger>

        {currentCountry && !isLoading && (
          <button onClick={handleClear} className={styles.clearButton}>
            <X className={styles.clearIcon} />
          </button>
        )}

        <SelectContent className={styles.content}>
          {countries.map((item) => (
            <SelectItem
              key={item.value}
              value={item.name}
              className={`${styles.item} ${
                isLoading && selectedCountry === item.name
                  ? styles.loadingItem
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{item.flag}</span>
                {item.name && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {item.name}
                  </span>
                )}
                {selectedCountry === item.name && (
                  <MapPin className="ml-auto h-3 w-3 text-green-600 dark:text-green-400" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
