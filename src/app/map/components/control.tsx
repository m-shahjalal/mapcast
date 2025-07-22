"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Minus, Locate } from "lucide-react";
import { useMapControls } from "@/hooks/use-map-controls";

export function MapControls() {
  const { zoomIn, zoomOut, locateUser } = useMapControls();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        className="h-10 w-10 shadow-md bg-white hover:bg-gray-50"
        onClick={zoomIn}
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="outline"
        className="h-10 w-10 shadow-md bg-white hover:bg-gray-50"
        onClick={zoomOut}
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="outline"
        className="h-10 w-10 shadow-md bg-white hover:bg-gray-50"
        onClick={locateUser}
        aria-label="Find my location"
      >
        <Locate className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full shadow-md bg-white h-10 w-10 overflow-hidden p-0"
        aria-label="User profile"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/m-shahjalal.png" alt="Profile" />
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      </Button>
    </div>
  );
}
