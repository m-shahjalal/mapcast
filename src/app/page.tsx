import { PinPointMap } from "@/components/map/map-view";
import { getNewsMapData } from "@/server/actions/news.action";
import { NewsMapFilters } from "@/types/query-filter";

type Props = { searchParams: Promise<NewsMapFilters> };

export default async function PinPointPage({ searchParams }: Props) {
  const params = await searchParams;
  const newsList = await getNewsMapData(params);

  return <PinPointMap news={newsList!} />;
}
