import { api } from "@/lib/api-client";
import { NewsSourceManager } from "./news-source-manager";

interface NewsSource {
  id: string;
  name: string;
  url: string;
  status: "active" | "error" | "maintenance";
  lastFetch: string;
  articlesCount: number;
  successRate: number;
  avgResponseTime: number;
  category: string;
}

export default async function SourcesPage() {
  const sources = await api.rss.list();

  return <NewsSourceManager sources={sources.data ?? []} />;
}
