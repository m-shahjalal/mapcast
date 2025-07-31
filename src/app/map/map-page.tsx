"use client";

import { InfinitePageLoader } from "@/components/page-loader";
import { MapProvider } from "@/config/map-context";
import { NewsSelect } from "@/server/database/schemas";
import dynamic from "next/dynamic";

const MapView = dynamic(
  () => import("./map-view").then((mod) => ({ default: mod.MapView })),
  { ssr: false, loading: () => <InfinitePageLoader /> }
);

export function PinPointMap({ news }: { news: NewsSelect[] | null }) {
  return (
    <MapProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <div className="relative flex-1 min-h-0">
          <MapView news={news} />
        </div>
      </div>
    </MapProvider>
  );
}
