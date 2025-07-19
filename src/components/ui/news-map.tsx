"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin } from "lucide-react"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  latitude: number
  longitude: number
  country: string
  city?: string
  category: string
}

interface NewsMapProps {
  articles: NewsArticle[]
  userLocation?: { lat: number; lng: number } | null
  onArticleSelect: (article: NewsArticle) => void
}

export default function NewsMap({ articles, userLocation, onArticleSelect }: NewsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
    })

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map)

    // Create markers layer group
    const markersGroup = L.layerGroup().addTo(map)

    mapInstanceRef.current = map
    markersRef.current = markersGroup

    // Handle map resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(mapRef.current)

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return

    // Clear existing markers
    markersRef.current.clearLayers()

    // Group articles by location to create clusters
    const locationGroups = new Map<string, NewsArticle[]>()

    articles.forEach((article) => {
      const key = `${article.latitude.toFixed(2)},${article.longitude.toFixed(2)}`
      if (!locationGroups.has(key)) {
        locationGroups.set(key, [])
      }
      locationGroups.get(key)!.push(article)
    })

    // Create markers for each location group
    locationGroups.forEach((groupArticles, locationKey) => {
      const article = groupArticles[0]
      const count = groupArticles.length

      // Create custom icon based on article count
      const iconHtml =
        count > 1
          ? `<div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-white shadow-lg">${count}</div>`
          : `<div class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg></div>`

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-marker",
        iconSize: count > 1 ? [32, 32] : [24, 24],
        iconAnchor: count > 1 ? [16, 16] : [12, 12],
      })

      const marker = L.marker([article.latitude, article.longitude], {
        icon: customIcon,
      })

      // Create popup content
      const popupContent =
        count > 1
          ? `<div class="p-2"><h3 class="font-bold mb-2">${count} articles in ${article.city || article.country}</h3></div>`
          : `<div class="p-2 max-w-xs">
             <h3 class="font-bold text-sm mb-1 line-clamp-2">${article.title}</h3>
             <p class="text-xs text-gray-600 mb-2 line-clamp-2">${article.description}</p>
             <div class="flex items-center justify-between text-xs">
               <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${article.source}</span>
               <span class="text-gray-500">${new Date(article.publishedAt).toLocaleDateString()}</span>
             </div>
           </div>`

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      })

      marker.on("click", () => {
        if (count === 1) {
          setSelectedArticle(article)
          onArticleSelect(article)
        } else {
          // Zoom to show all articles in this location
          mapInstanceRef.current?.setView([article.latitude, article.longitude], 8)
        }
      })

      markersRef.current?.addLayer(marker)
    })

    // Fit map to show all markers if there are any
    if (articles.length > 0 && markersRef.current) {
      const group = new L.featureGroup(markersRef.current.getLayers())
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [articles, onArticleSelect])

  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return

    // Remove existing user location marker
    const existingMarker = mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer.options?.isUserLocation) {
        mapInstanceRef.current?.removeLayer(layer)
      }
    })

    // Add user location marker
    const userIcon = L.divIcon({
      html: `<div class="bg-blue-600 text-white rounded-full w-4 h-4 border-2 border-white shadow-lg animate-pulse"></div>`,
      className: "user-location-marker",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      isUserLocation: true,
    } as any)

    userMarker.bindPopup("Your Location", {
      className: "user-location-popup",
    })

    userMarker.addTo(mapInstanceRef.current)

    // Center map on user location
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 10)
  }, [userLocation])

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[60vh] rounded-lg overflow-hidden touch-pan-x touch-pan-y"
        style={{ minHeight: "400px" }}
      />

      {/* Selected Article Panel */}
      {selectedArticle && (
        <Card className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto md:relative md:mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-sm line-clamp-2 flex-1">{selectedArticle.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)} className="ml-2 h-6 w-6 p-0">
                ×
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{selectedArticle.description}</p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{selectedArticle.source}</Badge>
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                {selectedArticle.city || selectedArticle.country}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(selectedArticle.publishedAt).toLocaleDateString()}
              </span>
            </div>

            <Button size="sm" className="w-full" onClick={() => window.open(selectedArticle.url, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Read Full Article
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
