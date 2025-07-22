"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
} from "react";

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export interface TopicItem {
  icon: React.ReactNode;
  label: string;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedLocation: LocationData | null;
  searchQuery: string;
  searchResults: LocationData[];
  isLoading: boolean;
}

export interface MapActions {
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setSelectedLocation: (location: LocationData | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: LocationData[]) => void;
  clearSearch: () => void;
  selectLocation: (location: LocationData) => void;
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
  | { type: "SELECT_LOCATION"; payload: LocationData };

const initialState: MapState = {
  center: [34.052235, -118.243683],
  zoom: 13,
  selectedLocation: null,
  searchQuery: "",
  searchResults: [],
  isLoading: false,
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
    default:
      return state;
  }
}

interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  const actions: MapActions = useMemo(
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
