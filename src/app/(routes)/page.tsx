import { getMapCastData } from "@/server/actions/news.action";
import { NewsType } from "@/server/database/schemas";
import { NewsMapFilters } from "@/types/query-filter";
import dynamic from "next/dynamic";

type Props = {
  searchParams: Promise<NewsMapFilters>;
  params?: any;
};

const LazyMap = dynamic(() =>
  import("@/components/map").then((i) => i.PinPointMap)
);

const SROnlyH1 = ({ params, newsList }: Props & { newsList: NewsType[] }) => (
  <h1 className="sr-only">
    Interactive News Map -MapCast
    {params.topics &&
      params.topics.length > 0 &&
      params.topics[0] !== "all" &&
      ` - ${
        params.topics[0].charAt(0).toUpperCase() + params.topics[0].slice(1)
      } News`}
    {newsList?.find((news) => news.country) &&
      ` in ${newsList.find((news) => news.country)?.country}`}
  </h1>
);

export default async function MapPinsPage(props: Props) {
  const params = await props.searchParams;
  const newsList = await getMapCastData(params);

  return (
    <main role="main" aria-label="Interactive news map">
      {Array.isArray(newsList) && <SROnlyH1 {...props} newsList={newsList!} />}
      <LazyMap news={newsList.data as any} location={newsList.country } />
    </main>
  );
}
