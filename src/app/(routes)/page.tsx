import { getMapCastData } from "@/server/actions/news.action";
import { NewsType } from "@/server/database/schemas";
import { NewsMapFilters } from "@/types/query-filter";
import { Viewport } from "next";
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

export const viewport: Viewport = {
  viewportFit: "auto",
  initialScale: 1,
  maximumScale: 1.5,
  width: "device-width",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
  ],
};

export default async function MapPinsPage(props: Props) {
  const params = await props.searchParams;
  const newsList = await getMapCastData(params);

  return (
    <main role="main" aria-label="Interactive news map">
      {Array.isArray(newsList) && <SROnlyH1 {...props} newsList={newsList!} />}
      <LazyMap news={newsList!} />
    </main>
  );
}
