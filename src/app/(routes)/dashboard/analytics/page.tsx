"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  BarChart3,
  Clock,
  Eye,
  Globe,
  LineChart,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("24h");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Traffic Analytics
              </span>
              <div className="flex items-center space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border rounded-md px-2 py-1"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <p className="text-gray-600">Interactive chart visualization</p>
                <p className="text-sm text-gray-500">Real-time traffic data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Average Session Duration</p>
                  <p className="text-2xl font-bold text-blue-600">4m 32s</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Bounce Rate</p>
                  <p className="text-2xl font-bold text-green-600">23.4%</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Pages per Session</p>
                  <p className="text-2xl font-bold text-purple-600">3.7</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Real-time Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[
              {
                time: "2 min ago",
                event: "New article crawled",
                source: "BBC World",
                location: "London, UK",
                type: "success",
              },
              {
                time: "3 min ago",
                event: "User searched for",
                query: "climate change",
                location: "New York, US",
                type: "info",
              },
              {
                time: "5 min ago",
                event: "RSS feed updated",
                source: "Reuters",
                articles: 12,
                type: "success",
              },
              {
                time: "7 min ago",
                event: "High traffic detected",
                location: "Global",
                users: 1247,
                type: "warning",
              },
              {
                time: "10 min ago",
                event: "Article bookmarked",
                title: "Tech Innovation Summit",
                type: "info",
              },
              {
                time: "12 min ago",
                event: "New user registered",
                location: "Tokyo, JP",
                type: "success",
              },
              {
                time: "15 min ago",
                event: "API rate limit reached",
                endpoint: "/api/news",
                type: "error",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "success"
                      ? "bg-green-500"
                      : activity.type === "warning"
                      ? "bg-yellow-500"
                      : activity.type === "error"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.event}</p>
                  <p className="text-xs text-gray-500">
                    {activity.source && `Source: ${activity.source} • `}
                    {activity.location && `Location: ${activity.location} • `}
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
