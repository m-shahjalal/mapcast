"use client";

import { PinIcon } from "lucide-react";
import { MapControls } from "./control";
import { ClearSelection } from "./select-clear";
import { CountrySelect } from "./select-country";
import { DateSelect } from "./select-date";
import { TopicFilters } from "./select-topic";
import Image from "next/image";

export function TopBar() {
  return (
    <div className="absolute top-4 left-4 right-4 z-[999]">
      <div className="flex items-start gap-4 sm:justify-between justify-end">
        <div className="hidden lg:flex w-[132px] h-10 items-center justify-center rounded bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl gap-0.5">
          <Image
            src="/logo.png"
            className="-translate-x-1"
            alt="MapCast Logo"
            width={32}
            height={32}
          />
          <span className="capitalize text-lg font-bold text-gray-800 dark:text-gray-100 -translate-x-1">
            MapCast
          </span>
        </div>
        <div className="gap-2 flex-1 min-w-0 hidden sm:flex justify-start">
          <CountrySelect />
          <DateSelect />
          <TopicFilters />
          <ClearSelection />
        </div>
        <MapControls />
      </div>
    </div>
  );
}
