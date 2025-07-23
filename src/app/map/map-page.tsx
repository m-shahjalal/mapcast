"use client";

import { Spinner } from "@/components/ui/spinner";
import { MapProvider } from "@/lib/map-context";
import { NewsSelect } from "@/server/schemas";
import dynamic from "next/dynamic";

const Spin = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Spinner variant="infinite" size="36" />
  </div>
);

const MapView = dynamic(
  () => import("./map-view").then((mod) => ({ default: mod.MapView })),
  { ssr: false, loading: () => <Spin /> }
);

export function PinPointMap({ news }: { news: NewsSelect[] | null }) {
  console.log(news);
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
