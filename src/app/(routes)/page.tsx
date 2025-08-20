import { generateSEOData } from "@/config/seo-meta";
import { getNewsMapData } from "@/server/actions/news.action";
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
    Interactive News Map -Pinews
    {params.topics &&
      params.topics.length > 0 &&
      params.topics[0] !== "all" &&
      ` - ${
        params.topics[0].charAt(0).toUpperCase() + params.topics[0].slice(1)
      } News`}
    {newsList?.find((news) => news.locationCountry) &&
      ` in ${newsList.find((news) => news.locationCountry)?.locationCountry}`}
    {newsList?.find((news) => news.locationCity) &&
      `, ${newsList.find((news) => news.locationCity)?.locationCity}`}
  </h1>
);

export async function generateMetadata(props: Props) {
  return await generateSEOData(props);
}

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
  const newsList = await getNewsMapData(params);

  return (
    <main role="main" aria-label="Interactive news map">
      <SROnlyH1 {...props} newsList={newsList} />
      <LazyMap news={newsList!} />
    </main>
  );
}
