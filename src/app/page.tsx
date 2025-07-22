import { api } from "@/lib/api-client";
import { PinPointMap } from "./map/map-page";

export default async function PinPointPage() {
  const newsList = await api.news.list();

  return <PinPointMap news={newsList.data!} />;
}
