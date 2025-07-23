import api from "@/lib/api-client";
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

  const newsList = await api.news.map(queryString);

  return <PinPointMap news={newsList.data!} />;
}
