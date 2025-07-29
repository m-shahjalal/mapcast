"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MAP_LAYERS } from "@/config/map-constraint";
import { useMapControls } from "@/hooks/use-map-controls";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Locate,
  Minus,
  Navigation,
  Plus,
} from "lucide-react";

import { useMapContext } from "@/config/map-context";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useState } from "react";

export type LayerKey = keyof typeof MAP_LAYERS;

export function LayerSelector({
  currentLayer,
  setCurrentLayer,
}: {
  currentLayer: LayerKey;
  setCurrentLayer: (layer: LayerKey) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme } = useTheme();

  const layerEntries = useMemo(() => Object.entries(MAP_LAYERS), []);

  const handleLayerSelect = useCallback(
    (key: string) => {
      setCurrentLayer(key as LayerKey);
      setIsOpen(false);
      if (key === "dark" || key === "light") {
        setTheme(key);
      }
    },
    [setCurrentLayer]
  );

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        size="icon"
        variant="outline"
        className={`h-10 w-10 shadow-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 transition-colors ${MAP_LAYERS[currentLayer]}`}
        aria-label="Select map layer"
        aria-expanded={isOpen}
      >
        <Layers className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute top-full right-0 mt-2 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden w-80 animate-in slide-in-from-top-2 duration-200">
            {/* Grid Container */}
            <div className="p-4">
              <div className="grid grid-cols-3 grid-rows-2 gap-3">
                {layerEntries.map(([key, layer]) => {
                  const isSelected = currentLayer === key;

                  return (
                    <button
                      key={key}
                      onClick={() => handleLayerSelect(key)}
                      className={`group relative aspect-square p-3 rounded-xl transition-all duration-200 text-center hover:scale-105 hover:shadow-lg ${cn(
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-900/30 ring-2 ring-blue-300/50 dark:ring-blue-600/50 shadow-md"
                          : "bg-gray-50/60 dark:bg-gray-800/60 hover:bg-gray-100/80 dark:hover:bg-gray-700/80"
                      )}`}
                      aria-pressed={isSelected}
                    >
                      {/* Icon Container */}
                      <div
                        className={`mb-2 mx-auto w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${cn(
                          isSelected
                            ? layer.colors
                            : "bg-gray-200/60 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400"
                        )}`}
                      >
                        {layer.icon || <Navigation className="h-4 w-4" />}
                      </div>

                      {/* Text Overlay */}
                      <div
                        className={`text-xs font-medium leading-tight truncate transition-colors duration-200 ${cn(
                          isSelected
                            ? "text-blue-900 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        )}`}
                      >
                        {layer.name}
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
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
  const { currentLayer, setCurrentLayer } = useMapContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const controlButtonClass =
    "h-10 w-10 shadow-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600";

  const controls = [
    { icon: Plus, onClick: zoomIn, label: "Zoom in" },
    { icon: Minus, onClick: zoomOut, label: "Zoom out" },
    { icon: Locate, onClick: locateUser, label: "Find my location" },
  ];

  const toggleControls = () => setIsExpanded(!isExpanded);

  return (
    <div className="flex items-center flex-col gap-2">
      {/* Toggle Arrow Button - Fixed at top */}
      <Button
        size="icon"
        variant="outline"
        className={controlButtonClass}
        onClick={toggleControls}
        aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
      >
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Collapsible Controls */}
      <div
        className={`flex items-center flex-col gap-2 transition-all duration-500 ease-in-out ${
          isExpanded
            ? "max-h-96 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-4"
        }`}
      >
        <LayerSelector
          currentLayer={currentLayer}
          setCurrentLayer={(layer) => {
            setCurrentLayer(layer);
            setIsExpanded(false);
          }}
        />
        {controls.map(({ icon: Icon, onClick, label }) => (
          <Button
            key={label}
            size="icon"
            variant="outline"
            className={controlButtonClass}
            onClick={onClick}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}

export default MapControls;
