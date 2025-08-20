import { getNews } from "@/server/actions/news.action";
import { NewsManager } from "./news-manager";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{}>;
}) {
  const paramsData = await searchParams;
  const { data, pagination } = await getNews(paramsData);
  return (
    <div className="space-y-6">
      <NewsManager news={data ?? []} pagination={pagination} />
    </div>
  );
}
