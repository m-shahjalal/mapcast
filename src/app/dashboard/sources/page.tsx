import api from "@/lib/api-client";
import { NewsSourceManager } from "./news-source-manager";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ topics?: string }>;
}) {
  const paramsData = await params;
  const queryString = paramsData.topics
    ? `topics=${encodeURIComponent(paramsData.topics)}`
    : "";
  const sources = await api.rss.list(queryString);

  return <NewsSourceManager sources={sources.data ?? []} />;
}
