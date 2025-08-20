import { generateSEOData } from "@/components/layout/seo-layout";
import { getNewsMapData } from "@/server/actions/news.action";
import { NewsMapFilters } from "@/types/query-filter";
import dynamic from "next/dynamic";

type Props = {
  searchParams: Promise<NewsMapFilters>;
  params?: any;
};

const LazyMap = dynamic(() =>
  import("@/components/map").then((i) => i.PinPointMap)
);

export async function generateMetadata(props: Props) {
  return await generateSEOData(props);
}

export default async function MapPinsPage(props: Props) {
  const params = await props.searchParams;
  const newsList = await getNewsMapData(params);

  return (
    <main role="main" aria-label="Interactive news map">
      <h1 className="sr-only">
        Interactive News Map -Pinews
        {params.topics &&
          params.topics.length > 0 &&
          params.topics[0] !== "all" &&
          ` - ${
            params.topics[0].charAt(0).toUpperCase() + params.topics[0].slice(1)
          } News`}
        {newsList?.find((news) => news.locationCountry) &&
          ` in ${
            newsList.find((news) => news.locationCountry)?.locationCountry
          }`}
        {newsList?.find((news) => news.locationCity) &&
          `, ${newsList.find((news) => news.locationCity)?.locationCity}`}
      </h1>

      <LazyMap news={newsList!} />
    </main>
  );
}
