import { PinPointMap } from "@/components/map/map-page";
import { MapProvider } from "@/config/map-context";
import { getNewsMapData } from "@/server/actions/news.action";
import { NewsMapFilters } from "@/types/query-filter";

export default async function PinPointPage({
  searchParams,
}: {
  searchParams: Promise<NewsMapFilters>;
}) {
  const params = await searchParams;

  const newsList = await getNewsMapData(params);

  return (
    <MapProvider>
      <PinPointMap news={newsList!} />
    </MapProvider>
  );
}
