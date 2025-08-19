import {
  Globe,
  Heart,
  Map,
  Moon,
  Mountain,
  Satellite,
  Sun,
} from "lucide-react";
import { createElement } from "react";

export const MAP_LAYERS = {
  street: {
    name: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    colors: "text-blue-600 bg-blue-50 border-blue-200",
    icon: createElement(Map, { className: "h-4 w-4" }),
  },

  light: {
    name: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    colors: "text-amber-600 bg-amber-50 border-amber-200",
    icon: createElement(Sun, { className: "h-4 w-4" }),
  },

  dark: {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    colors: "text-slate-600 bg-slate-50 border-slate-200",
    icon: createElement(Moon, { className: "h-4 w-4" }),
  },

  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    colors: "text-green-600 bg-green-50 border-green-200",
    icon: createElement(Satellite, { className: "h-4 w-4" }),
  },

  terrain: {
    name: "Terrain",
    url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
    colors: "text-orange-600 bg-orange-50 border-orange-200",
    icon: createElement(Mountain, { className: "h-4 w-4" }),
  },

  humanitarian: {
    name: "Crisis",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    colors: "text-red-600 bg-red-50 border-red-200",
    icon: createElement(Heart, { className: "h-4 w-4" }),
  },

  colorful: {
    name: "Vibrant",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    colors: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: createElement(Globe, { className: "h-4 w-4" }),
  },
} as const;

export type LayerKey = keyof typeof MAP_LAYERS;
