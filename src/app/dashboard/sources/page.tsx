import { getRssSourceList } from "@/server/actions/rss-feed.action";
import { NewsSourceFilters } from "@/utils/validator";
import { NewsSourceManager } from "./news-source-manager";

export default async function SourcesPage({
  params,
}: {
  params: Promise<NewsSourceFilters>;
}) {
  const paramsData = await params;

  const list = await getRssSourceList(paramsData);
  return <NewsSourceManager sources={list.data ?? []} />;
}
