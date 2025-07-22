import { useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { LocationData, useMapContext } from "@/lib/map-context";

export function useMapSearch() {
  const {
    searchQuery,
    setSearchResults,
    searchResults,
    setSelectedLocation,
    setSearchQuery,
    selectedLocation,
  } = useMapContext();
  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  useEffect(() => {
    const searchLocation = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            debouncedSearchTerm
          )}&format=json&limit=5`
        );
        const data = await response.json();

        const results: LocationData[] = data.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.name || item.display_name.split(",")[0],
          address: item.display_name,
        }));

        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    };

    searchLocation();
  }, [debouncedSearchTerm, setSearchResults]);
  return {
    setSelectedLocation,
    searchResults,
    setSearchQuery,
    selectedLocation,
  };
}
