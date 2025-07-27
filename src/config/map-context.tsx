"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
} from "react";
import { MAP_LAYERS } from "../config/map-constraint";

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
  address?: string;
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
  searchQuery: string;
  searchResults: LocationData[];
  isLoading: boolean;
  topics: TopicItem[];
  currentLayer: keyof typeof MAP_LAYERS;
}

export interface MapActions {
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setSelectedLocation: (location: LocationData | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: LocationData[]) => void;
  clearSearch: () => void;
  selectLocation: (location: LocationData) => void;
  setTopics: (topics: TopicItem[]) => void;
  setCurrentLayer: (layer: keyof typeof MAP_LAYERS) => void;
}

type MapContextType = MapState & MapActions;
const MapContext = createContext<MapContextType | undefined>(undefined);

type MapAction =
  | { type: "SET_CENTER"; payload: [number, number] }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "SET_SELECTED_LOCATION"; payload: LocationData | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SEARCH_RESULTS"; payload: LocationData[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_SEARCH" }
  | { type: "SELECT_LOCATION"; payload: LocationData }
  | { type: "SET_TOPICS"; payload: TopicItem[] }
  | { type: "SET_CURRENT_LAYER"; payload: keyof typeof MAP_LAYERS };

const initialState: MapState = {
  center: [34.052235, -118.243683],
  zoom: 3,
  selectedLocation: null,
  searchQuery: "",
  searchResults: [],
  isLoading: false,
  topics: [],
  currentLayer: "satellite",
};

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "SET_CENTER":
      return { ...state, center: action.payload };
    case "SET_ZOOM":
      return { ...state, zoom: action.payload };
    case "SET_SELECTED_LOCATION":
      return { ...state, selectedLocation: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "CLEAR_SEARCH":
      return {
        ...state,
        searchQuery: "",
        searchResults: [],
        selectedLocation: null,
      };
    case "SELECT_LOCATION":
      return {
        ...state,
        selectedLocation: action.payload,
        center: [action.payload.lat, action.payload.lng],
        zoom: 15,
      };
    case "SET_TOPICS":
      return { ...state, topics: action.payload };
    case "SET_CURRENT_LAYER":
      return { ...state, currentLayer: action.payload };
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
      setSelectedLocation: (location: LocationData | null) =>
        dispatch({ type: "SET_SELECTED_LOCATION", payload: location }),
      setSearchQuery: (query: string) =>
        dispatch({ type: "SET_SEARCH_QUERY", payload: query }),
      setSearchResults: (results: LocationData[]) =>
        dispatch({ type: "SET_SEARCH_RESULTS", payload: results }),
      clearSearch: () => dispatch({ type: "CLEAR_SEARCH" }),
      selectLocation: (location: LocationData) =>
        dispatch({ type: "SELECT_LOCATION", payload: location }),
      setTopics: (topics: TopicItem[]) =>
        dispatch({ type: "SET_TOPICS", payload: topics }),
      setCurrentLayer: (layer: keyof typeof MAP_LAYERS) =>
        dispatch({ type: "SET_CURRENT_LAYER", payload: layer }),
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
