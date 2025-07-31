import { getNewsMapData } from "@/server/actions/news.action";
import { NewsMapFilters } from "@/types/query-filter";
import { PinPointMap } from "./map/map-page";

export default async function PinPointPage({
  searchParams,
}: {
  searchParams: Promise<NewsMapFilters>;
}) {
  const params = await searchParams;

  const newsList = await getNewsMapData(params);

  return <PinPointMap news={newsList!} />;
}
