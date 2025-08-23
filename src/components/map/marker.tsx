"use client";

import { useMapContext } from "@/config/map-context";
import type { NewsType } from "@/server/database/schemas";
import { newsTopicDropdown } from "@/shared/enum-list";
import { truncateText } from "@/utils/cn";
import { getPositon } from "@/utils/urls";
import L, { type LatLngExpression } from "leaflet";
import { memo, useMemo, useCallback, useRef, useEffect } from "react";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

const topicConfigMap = new Map();
const precomputedColors = new Map<
  string,
  { lighter: string; shadow: string }
>();

export const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

// Initialize topic config and precompute colors
newsTopicDropdown.forEach((config) => {
  const topic = config.topic.toLowerCase();
  topicConfigMap.set(topic, config);

  // Precompute color variants
  if (config.color && !precomputedColors.has(config.color)) {
    precomputedColors.set(config.color, {
      lighter: adjustColor(config.color, 30),
      shadow: adjustColor(config.color, -30),
    });
  }
});

// Optimized cache with WeakMap for automatic cleanup
const MAX_ICON_CACHE_SIZE = 200;
const iconCache = new Map<string, L.DivIcon>();
const clusterIconCache = new Map<string, L.DivIcon>();

// More efficient cache key generation
const generateIconCacheKey = (
  color: string,
  emoji: string,
  titleHash: string
): string => {
  return `${color.slice(-6)}_${emoji}_${titleHash}`;
};

// Simple string hash function for titles
const hashString = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return "0";
  for (let i = 0; i < Math.min(str.length, 30); i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

const createOptimizedIcon = (
  color: string,
  emoji: string,
  text: string
): L.DivIcon => {
  const titleHash = hashString(text);
  const cacheKey = generateIconCacheKey(color, emoji, titleHash);

  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  // Use precomputed colors
  const colorVariants = precomputedColors.get(color) || {
    lighter: adjustColor(color, 30),
    shadow: adjustColor(color, -30),
  };

  // Efficient cache eviction
  if (iconCache.size >= MAX_ICON_CACHE_SIZE) {
    const keysToDelete = Array.from(iconCache.keys()).slice(
      0,
      Math.floor(MAX_ICON_CACHE_SIZE * 0.2)
    );
    keysToDelete.forEach((key) => iconCache.delete(key));
  }

  const truncatedText = truncateText(text, 30);
  const icon = L.divIcon({
    className: "enhanced-marker-base",
    html: `
      <div class="enhanced-marker-container" style="--arrow-color: ${color};">
        <div class="enhanced-marker-text" style="background: ${color}; box-shadow: 0 1px 4px ${colorVariants.shadow}60;">${truncatedText}</div>
        <div class="enhanced-marker-icon" style="background: linear-gradient(135deg, ${colorVariants.lighter} 0%, ${color} 100%); box-shadow: 0 2px 8px ${colorVariants.shadow}40;">${emoji}</div>
      </div>
    `,
    iconSize: [100, 50],
    iconAnchor: [50, 25],
    popupAnchor: [0, -25],
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

// Optimized cluster icon creation with better caching strategy
const createOptimizedClusterIcon = (cluster: any): L.DivIcon => {
  const markers = cluster.getAllChildMarkers();
  const count = markers.length;

  if (count === 0) return L.divIcon({ html: "" });

  // Use first marker's data for cluster appearance
  const firstNews = markers[0]?.options?.newsData;
  if (!firstNews) return L.divIcon({ html: "" });

  const topic = firstNews.topic?.toLowerCase() || "other";
  const config = topicConfigMap.get(topic) || newsTopicDropdown[0];
  const { color = "#6b7280", emoji = "📍" } = config;

  const cacheKey = `cluster_${color.slice(-6)}_${emoji}_${count}`;

  if (clusterIconCache.has(cacheKey)) {
    return clusterIconCache.get(cacheKey)!;
  }

  // Limit cluster cache size
  if (clusterIconCache.size >= 50) {
    const keysToDelete = Array.from(clusterIconCache.keys()).slice(0, 10);
    keysToDelete.forEach((key) => clusterIconCache.delete(key));
  }

  const colorVariants = precomputedColors.get(color) || {
    lighter: adjustColor(color, 30),
    shadow: adjustColor(color, -30),
  };

  const truncatedTitle = truncateText(firstNews.title, 25);
  const icon = L.divIcon({
    className: "enhanced-marker-base",
    html: `
      <div class="enhanced-marker-container" style="--arrow-color: ${color};">
        <div class="enhanced-marker-text" style="background: ${color}; box-shadow: 0 1px 4px ${colorVariants.shadow}60;">${truncatedTitle}</div>
        <div class="enhanced-marker-icon" style="background: linear-gradient(135deg, ${colorVariants.lighter} 0%, ${color} 100%); box-shadow: 0 2px 8px ${colorVariants.shadow}40;">${count}</div>
      </div>
    `,
    iconSize: [100, 50],
    iconAnchor: [50, 25],
    popupAnchor: [0, -25],
  });

  clusterIconCache.set(cacheKey, icon);
  return icon;
};

// Memoized single marker component with optimized dependencies
const OptimizedSingleMarker = memo<{
  news: NewsType;
  topicConfig: any;
  position: LatLngExpression;
}>(({ news, topicConfig, position }) => {
  const { setPopup } = useMapContext();

  const icon = useMemo(() => {
    return createOptimizedIcon(
      topicConfig.color || "#6b7280",
      topicConfig.emoji || "📍",
      news.title
    );
  }, [topicConfig.color, topicConfig.emoji, news.title]);

  const handleClick = useCallback(
    (e: any) => {
      setPopup(topicConfig, news, position);
    },
    [setPopup, topicConfig, news, position]
  );

  return (
    <Marker
      position={position}
      icon={icon}
      // @ts-ignore
      newsData={news}
      eventHandlers={{ click: handleClick }}
    />
  );
});

OptimizedSingleMarker.displayName = "OptimizedSingleMarker";

// Main component with better memoization strategy
export const NewsMarkers = memo(() => {
  const { mapList: news } = useMapContext();
  const processedNewsRef = useRef<
    Map<
      string,
      {
        news: NewsType;
        topicConfig: any;
        position: LatLngExpression;
      }
    >
  >(new Map());

  // Process news items and cache results
  const processedNews = useMemo(() => {
    const currentProcessed = new Map();
    const validNews: Array<{
      news: NewsType;
      topicConfig: any;
      position: LatLngExpression;
    }> = [];

    news.forEach((item) => {
      const cacheKey = `${item.slug}_${item.latitude}_${item.longitude}`;

      // Check if we already processed this item
      if (processedNewsRef.current.has(cacheKey)) {
        const cached = processedNewsRef.current.get(cacheKey)!;
        currentProcessed.set(cacheKey, cached);
        validNews.push(cached);
        return;
      }

      const position = getPositon(item.latitude, item.longitude);
      if (!position) return;

      const topicConfig =
        newsTopicDropdown.find(
          (t) => t.topic.toLowerCase() === item.topic?.toLowerCase()
        ) ?? newsTopicDropdown[0];

      const processed = {
        news: item,
        topicConfig,
        position: position as LatLngExpression,
      };

      currentProcessed.set(cacheKey, processed);
      validNews.push(processed);
    });

    processedNewsRef.current = currentProcessed;
    return validNews;
  }, [news]);

  // Optimized cluster options - memoize once
  const clusterOptions = useMemo(
    () => ({
      chunkedLoading: true,
      iconCreateFunction: createOptimizedClusterIcon,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyDistanceMultiplier: 1.2,
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: false,
    }),
    []
  );

  // Cleanup caches on unmount
  useEffect(() => {
    return () => {
      if (iconCache.size > MAX_ICON_CACHE_SIZE * 2) {
        iconCache.clear();
      }
      if (clusterIconCache.size > 100) {
        clusterIconCache.clear();
      }
    };
  }, []);

  return (
    <MarkerClusterGroup {...clusterOptions}>
      {processedNews.map(({ news, topicConfig, position }) => (
        <OptimizedSingleMarker
          key={news.slug}
          news={news}
          topicConfig={topicConfig}
          position={position}
        />
      ))}
    </MarkerClusterGroup>
  );
});

NewsMarkers.displayName = "NewsMarkers";
