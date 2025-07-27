import { getNews } from "@/server/actions/news.action";
import { PinPointMap } from "./map/map-page";

export default async function PinPointPage({
  searchParams,
}: {
  searchParams: Promise<{ topics?: string }>;
}) {
  const params = await searchParams;
  const queryString = params.topics
    ? `topics=${encodeURIComponent(params.topics)}`
    : "";

  const newsList = await getNews({
    topics: params.topics
      ? (params.topics.split(",") as "politics"[])
      : undefined,
  });

  return <PinPointMap news={newsList.result!} />;
}
