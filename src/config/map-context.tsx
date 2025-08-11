"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
} from "react";
import { MAP_LAYERS } from "../config/map-constraint";
import { newsTopicList } from "@/shared/enum-list";

export interface LocationData {
  headline: string;
  source: string;
  date: Date;
  summary: string;
  link: string;
  lat: number;
  lng: number;
  name: string;
  address: string;
  geojson?: any;
  boundingbox?: [string, string, string, string];
  topic: (typeof newsTopicList)[number];
}

export interface TopicItem {
  topic: string;
  emoji: string;
  color: string;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedLocation: LocationData | null;
  mapList: LocationData[];
  currentLayer: keyof typeof MAP_LAYERS;
  isPending: boolean;
  error: string | null;
}

export interface MapActions {
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setMapList: (results: LocationData[]) => void;
  setLocation: (location: LocationData | null) => void;
  setCurrentLayer: (layer: keyof typeof MAP_LAYERS) => void;
  setPending: (pending: boolean) => void;
  setError: (error: string | null) => void;
}

type MapContextType = MapState & MapActions;

const MapContext = createContext<MapContextType | undefined>(undefined);

type MapAction =
  | { type: "SET_CENTER"; payload: [number, number] }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "SET_LOCATION"; payload: LocationData | null }
  | { type: "SET_MAP_LIST"; payload: LocationData[] }
  | { type: "SET_CURRENT_LAYER"; payload: keyof typeof MAP_LAYERS }
  | { type: "SET_PENDING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: MapState = {
  center: [0, 0],
  zoom: 3,
  selectedLocation: null,
  mapList: [],
  currentLayer: "satellite",
  isPending: false,
  error: null,
};

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "SET_CENTER":
      return { ...state, center: action.payload };

    case "SET_ZOOM":
      return { ...state, zoom: action.payload };

    case "SET_MAP_LIST":
      return {
        ...state,
        mapList: action.payload,
        isPending: false,
        error: null,
      };

    case "SET_LOCATION":
      return {
        ...state,
        selectedLocation: action.payload,
        center: [action.payload?.lat || 0, action.payload?.lng || 0],
        zoom: 15,
      };

    case "SET_CURRENT_LAYER":
      return { ...state, currentLayer: action.payload };

    case "SET_PENDING":
      return { ...state, isPending: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isPending: false };

    default:
      return state;
  }
}

interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  const actions = useMemo<MapActions>(
    () => ({
      setCenter: (center: [number, number]) =>
        dispatch({ type: "SET_CENTER", payload: center }),

      setZoom: (zoom: number) => dispatch({ type: "SET_ZOOM", payload: zoom }),

      setLocation: (location: LocationData | null) =>
        dispatch({ type: "SET_LOCATION", payload: location }),

      setMapList: (results: LocationData[]) =>
        dispatch({ type: "SET_MAP_LIST", payload: results }),

      setCurrentLayer: (layer: keyof typeof MAP_LAYERS) =>
        dispatch({ type: "SET_CURRENT_LAYER", payload: layer }),

      setPending: (pending: boolean) =>
        dispatch({ type: "SET_PENDING", payload: pending }),

      setError: (error: string | null) =>
        dispatch({ type: "SET_ERROR", payload: error }),
    }),
    []
  );

  const contextValue = useMemo(
    () => ({ ...state, ...actions }),
    [state, actions]
  );

  return (
    <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
}
