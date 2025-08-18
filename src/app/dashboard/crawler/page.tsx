import { getLogs } from "@/server/actions/log.action";
import { CrawlManager } from "./crawl-manager";

export default async function CrawlerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, any>>;
}) {
  const { data, pagination } = await getLogs(await searchParams);
  return (
    <div className="space-y-6">
      <CrawlManager logs={data as any} pagination={pagination} />
    </div>
  );
}
