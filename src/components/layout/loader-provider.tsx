"use client";

import { useMapContext } from "@/config/map-context";
import { Spinner } from "../ui/spinner";

export const SpinnerProvider = () => {
  const { isPending } = useMapContext();
  if (!isPending) return <></>;

  return (
    <div className="fixed overflow-hidden top-0 right-0 left-0 bottom-0 z-[999999999999] flex justify-center items-center bg-transparent">
      <Spinner
        variant="default"
        className="w-10 h-10 bg-transparent dar:text-white"
      />
    </div>
  );
};
