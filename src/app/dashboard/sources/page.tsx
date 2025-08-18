import { getRssSourceList } from "@/server/actions/rss-feed.action";
import { NewsSourceFilters } from "@/utils/validator";
import { NewsSourceManager } from "./news-source-manager";

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<NewsSourceFilters>;
}) {
  const paramsData = await searchParams;

  const { data, pagination } = await getRssSourceList(paramsData);
  return <NewsSourceManager sources={data ?? []} pagination={pagination} />;
}
