"use client";

import { Button } from "@/components/ui/button";
import { useMapControls } from "@/hooks/use-map-controls";
import { MAP_LAYERS } from "@/lib/map-constraint";
import { useMapContext } from "@/lib/map-context";
import {
  Check,
  Locate,
  Map,
  Minus,
  Moon,
  Mountain,
  Navigation,
  Plus,
  Satellite,
  Sun,
} from "lucide-react";
import { useState } from "react";

type LayerKey = keyof typeof MAP_LAYERS;

function LayerSelector() {
  const { currentLayer, setCurrentLayer } = useMapContext();
  const [isOpen, setIsOpen] = useState(false);

  const getLayerIcon = (layerKey: LayerKey) => {
    const iconProps = { className: "h-4 w-4" };
    switch (layerKey) {
      case "satellite":
        return <Satellite {...iconProps} />;
      case "openstreetmap":
        return <Map {...iconProps} />;
      case "terrain":
        return <Mountain {...iconProps} />;
      case "light":
        return <Sun {...iconProps} />;
      case "dark":
        return <Moon {...iconProps} />;
      default:
        return <Navigation {...iconProps} />;
    }
  };

  return (
    <div className="relative">
      {/* Main Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="outline"
        className={`h-10 w-10 shadow-md bg-white hover:bg-gray-50
          ${isOpen ? "shadow-xl border-blue-300/60 bg-white" : ""} ${
          currentLayer === "satellite"
            ? "bg-green-100 text-green-700"
            : currentLayer === "terrain"
            ? "bg-amber-100 text-amber-700"
            : currentLayer === "dark"
            ? "bg-gray-100 text-gray-700"
            : currentLayer === "light"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-blue-100 text-blue-700"
        }
        `}
        aria-label="Select map layer"
      >
        <div className="flex items-center gap-3">
          <div
            className={`
            p-2 rounded-xl transition-all duration-300
            
          `}
          >
            {getLayerIcon(currentLayer)}
          </div>
        </div>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Content */}
          <div
            className={`
            absolute top-full right-0 mt-2 z-20
            bg-white/95 backdrop-blur-md border border-gray-200/50
            rounded-2xl shadow-2xl overflow-hidden
            min-w-[220px] transform origin-top-right
            animate-in slide-in-from-top-2 duration-200
          `}
          >
            <div className="p-2">
              {Object.entries(MAP_LAYERS).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentLayer(key as LayerKey);
                    setIsOpen(false);
                  }}
                  className={`
                    group w-full flex items-center gap-3 p-3 rounded-xl
                    transition-all duration-200 text-left
                    hover:bg-gray-50/80 active:bg-gray-100/80
                    ${
                      currentLayer === key
                        ? "bg-blue-50/80 text-blue-900 ring-1 ring-blue-200/50"
                        : "text-gray-700 hover:text-gray-900"
                    }
                  `}
                >
                  <div
                    className={`
                    p-2 rounded-lg transition-all duration-200
                    ${
                      currentLayer === key
                        ? key === "satellite"
                          ? "bg-green-100 text-green-700"
                          : key === "terrain"
                          ? "bg-amber-100 text-amber-700"
                          : key === "dark"
                          ? "bg-gray-100 text-gray-700"
                          : key === "light"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                        : "bg-gray-100/60 text-gray-500 group-hover:bg-gray-200/80 group-hover:text-gray-700"
                    }
                  `}
                  >
                    {getLayerIcon(key as LayerKey)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{layer.name}</div>
                  </div>

                  {currentLayer === key && (
                    <div className="flex-shrink-0">
                      <div className="p-1 rounded-full bg-blue-600">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Choose your preferred map style
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function MapControls() {
  const { zoomIn, zoomOut, locateUser } = useMapControls();

  return (
    <div className="flex items-center flex-col-reverse gap-2">
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

      <LayerSelector />
    </div>
  );
}

export default MapControls;
