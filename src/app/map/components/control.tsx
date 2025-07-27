"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useMapControls } from "@/hooks/use-map-controls";
import { MAP_LAYERS } from "@/config/map-constraint";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
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
import { useMapContext } from "@/config/map-context";

type LayerKey = keyof typeof MAP_LAYERS;

const LAYER_ICONS: Record<LayerKey, React.ReactNode> = {
  satellite: <Satellite className="h-4 w-4" />,
  openstreetmap: <Map className="h-4 w-4" />,
  terrain: <Mountain className="h-4 w-4" />,
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
};

const LAYER_COLORS: Record<LayerKey, string> = {
  satellite:
    "bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400",
  terrain:
    "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400",
  dark: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  light:
    "bg-yellow-100 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-400",
  openstreetmap:
    "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-400",
};

function LayerSelector({
  currentLayer,
  setCurrentLayer,
}: {
  currentLayer: LayerKey;
  setCurrentLayer: (layer: LayerKey) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const controlButtonClass =
    "h-10 w-10 shadow-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600";

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="outline"
        className={`${controlButtonClass} ${LAYER_COLORS[currentLayer]}`}
        aria-label="Select map layer"
      >
        <Layers className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden min-w-[220px] animate-in slide-in-from-top-2 duration-200">
            <div className="p-2">
              {Object.entries(MAP_LAYERS).map(([key, layer]) => {
                const isSelected = currentLayer === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentLayer(key as LayerKey);
                      setIsOpen(false);
                    }}
                    className={`group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left hover:bg-gray-50/80 dark:hover:bg-gray-800/80 ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 ring-1 ring-blue-200/50 dark:ring-blue-700/50"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? LAYER_COLORS[key as LayerKey]
                          : "bg-gray-100/60 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200/80 dark:group-hover:bg-gray-700/80"
                      }`}
                    >
                      {LAYER_ICONS[key as LayerKey] || (
                        <Navigation className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{layer.name}</div>
                    </div>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-blue-600 dark:bg-blue-500">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
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
        <ThemeToggle
          onThemeChange={(theme) => {
            setCurrentLayer(theme as LayerKey);
            setIsExpanded(false);
          }}
          className={controlButtonClass}
        />
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
