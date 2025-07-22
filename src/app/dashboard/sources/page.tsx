import { api } from "@/lib/api-client";
import { NewsSourceManager } from "./news-source-manager";

export default async function SourcesPage() {
  const sources = await api.rss.list();

  console.log("sources", sources);
  return <NewsSourceManager sources={sources.data ?? []} />;
}
