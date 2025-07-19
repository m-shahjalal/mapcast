"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin, Activity, Maximize2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

export function RealTimeMap() {
  const [activeRegions, setActiveRegions] = useState([
    { region: "North America", count: 1247, color: "bg-blue-500", pulse: true },
    { region: "Europe", count: 892, color: "bg-green-500", pulse: false },
    { region: "Asia", count: 1456, color: "bg-purple-500", pulse: true },
    { region: "South America", count: 234, color: "bg-orange-500", pulse: false },
    { region: "Africa", count: 345, color: "bg-teal-500", pulse: false },
    { region: "Oceania", count: 123, color: "bg-pink-500", pulse: false },
  ])

  const [recentActivity, setRecentActivity] = useState([
    { location: "New York, US", event: "Breaking news", time: "1m ago", type: "urgent" },
    { location: "London, UK", event: "Political update", time: "2m ago", type: "normal" },
    { location: "Tokyo, JP", event: "Tech announcement", time: "3m ago", type: "normal" },
    { location: "Sydney, AU", event: "Sports news", time: "5m ago", type: "normal" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRegions((prev) =>
        prev.map((region) => ({
          ...region,
          count: region.count + Math.floor(Math.random() * 3),
          pulse: Math.random() > 0.7,
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Real-time Global Activity
          </span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden">
          {/* World map background effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-8 left-12 w-16 h-12 bg-blue-400 rounded-full blur-sm"></div>
            <div className="absolute top-12 left-32 w-20 h-16 bg-green-400 rounded-full blur-sm"></div>
            <div className="absolute top-6 right-20 w-24 h-18 bg-purple-400 rounded-full blur-sm"></div>
            <div className="absolute bottom-16 left-16 w-12 h-8 bg-orange-400 rounded-full blur-sm"></div>
            <div className="absolute bottom-12 left-40 w-14 h-10 bg-teal-400 rounded-full blur-sm"></div>
            <div className="absolute bottom-8 right-12 w-10 h-8 bg-pink-400 rounded-full blur-sm"></div>
          </div>

          {/* Activity pulses */}
          <div className="absolute inset-0">
            {activeRegions.map((region, index) => (
              <div
                key={region.region}
                className={`absolute w-4 h-4 ${region.color} rounded-full ${region.pulse ? "animate-ping" : ""}`}
                style={{
                  top: `${20 + index * 15}%`,
                  left: `${15 + index * 12}%`,
                }}
              ></div>
            ))}
          </div>

          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Globe className="h-12 w-12 mx-auto mb-3 animate-spin-slow" />
              <p className="text-lg font-semibold">Global News Network</p>
              <p className="text-sm opacity-80">Real-time monitoring active</p>
            </div>
          </div>
        </div>

        {/* Regional stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {activeRegions.map((region) => (
            <div key={region.region} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 ${region.color} rounded-full ${region.pulse ? "animate-pulse" : ""}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{region.region}</p>
                <p className="text-sm font-bold">{region.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div
                className={`w-2 h-2 rounded-full ${activity.type === "urgent" ? "bg-red-500 animate-pulse" : "bg-blue-500"}`}
              ></div>
              <MapPin className="h-3 w-3 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{activity.location}</p>
                <p className="text-xs text-gray-500">{activity.event}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
