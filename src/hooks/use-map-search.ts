import api, { fetcher } from "@/lib/api-client";
import { useMapContext } from "@/lib/map-context";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect } from "react";

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
        return setSearchResults([]);
      }

      try {
        const [{ data: locations }, { data: newsList }] = await Promise.all([
          fetcher.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              debouncedSearchTerm
            )}&format=json&limit=5`
          ),
          api.news.list(`?search=${debouncedSearchTerm}`),
        ]);

        const results = [
          ...locations.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            name: item.name || item.display_name.split(",")[0],
            address: item.display_name,
          })),
          ...(newsList?.map((item: any) => ({
            lat: parseFloat(item.latitude ?? "0"),
            lng: parseFloat(item.longitude ?? "0"),
            name: item.title || "",
            address: "",
          })) || []),
        ];

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
