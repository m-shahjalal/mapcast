import { useMapContext } from "@/config/map-context";
import { getNews } from "@/server/actions/news.action";
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
        const [{ data: locations }, { result: newsList }] = await Promise.all([
          fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              debouncedSearchTerm
            )}&format=json&limit=5`
          ).then((res) => res.json()),
          getNews({ search: debouncedSearchTerm }),
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
