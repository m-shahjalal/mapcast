import { getNewsBySlug } from "@/server/actions/news.action";
import dynamic from "next/dynamic";
import { NewsViewer } from "./news-viewer";
import { generateNewsMetadata } from "./metadata";

type Props = { params: Promise<{ slug: string }> };
const LazyMap = dynamic(() => import("./map-viewer").then((i) => i.MapViewer));

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return {};

  return generateNewsMetadata(news);
}

export default async function DynamicNews({ params }: Props) {
  const { slug } = await params;
  const data = await getNewsBySlug(slug);

  return (
    <div className="w-full min-h-screen">
      <div className="md:hidden">
        <div className="sticky top-0 h-32 md:h-64 z-10 bg-white">
          <LazyMap news={data} />
        </div>
        <div>
          <NewsViewer news={data} />
        </div>
      </div>

      <div className="hidden md:grid grid-cols-4 h-screen">
        <div className="col-span-3 overflow-y-auto">
          <NewsViewer news={data} />
        </div>
        <div className="col-span-1 h-screen overflow-hidden">
          <div className="sticky top-0 h-full">
            <LazyMap news={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
