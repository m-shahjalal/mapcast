"use client";

import { AdvancedChart } from "@/components/dashboard/advanced-chart";
import { RealTimeMap } from "@/components/dashboard/realtime-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowDown,
  ArrowUp,
  Database,
  Eye,
  Filter,
  Globe,
  MapPin,
  Minus,
  PieChart,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const stats = {
  totalArticles: 15247,
  todayArticles: 342,
  activeSources: 18,
  countries: 67,
  avgProcessingTime: "1.8s",
  systemHealth: 98.5,
  activeUsers: 1247,
  pageViews: 23456,
  apiCalls: 45678,
  errorRate: 0.12,
  uptime: "99.97%",
  storageUsed: 67.3,
  memoryUsage: 45.2,
  cpuUsage: 23.8,
};

const getTrendIcon = (value: number) => {
  if (value > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
  if (value < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-gray-500" />;
};

export default function Page() {
  const [timeRange, setTimeRange] = useState("24h");
  const [client, isClient] = useState(false)

  const handleSearchClick = () => {
    console.log("Search clicked");
  };

  const handleFilterClick = () => {
    console.log("Filter clicked");
  };

  useEffect(() => isClient(true), [])

  if(!client) return

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Articles
                </p>
                <p className="text-3xl font-bold">
                  {stats.totalArticles.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(12.5)}
                  <span className="text-xs text-blue-100 ml-1">
                    +12.5% vs last month
                  </span>
                </div>
              </div>
              <Database className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Today's Articles
                </p>
                <p className="text-3xl font-bold">{stats.todayArticles}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(8.2)}
                  <span className="text-xs text-green-100 ml-1">
                    +8.2% vs yesterday
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  Page Views
                </p>
                <p className="text-3xl font-bold">
                  {stats.pageViews.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(23.7)}
                  <span className="text-xs text-orange-100 ml-1">
                    +23.7% vs last week
                  </span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Countries</p>
                <p className="text-3xl font-bold">{stats.countries}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(2.1)}
                  <span className="text-xs text-teal-100 ml-1">
                    +2.1% vs last month
                  </span>
                </div>
              </div>
              <MapPin className="h-8 w-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RealTimeMap />
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Geographic Distribution
              </span>
              <Button variant="ghost" size="sm" onClick={handleSearchClick}>
                <Search className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { country: "United States", count: 2341, flag: "🇺🇸" },
                { country: "United Kingdom", count: 1876, flag: "🇬🇧" },
                { country: "Germany", count: 1234, flag: "🇩🇪" },
                { country: "France", count: 987, flag: "🇫🇷" },
                { country: "Japan", count: 876, flag: "🇯🇵" },
                { country: "Canada", count: 654, flag: "🇨🇦" },
                { country: "Australia", count: 543, flag: "🇦🇺" },
                { country: "Other", count: 1432, flag: "🌍" },
              ].map((item, index) => (
                <div
                  key={item.country}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.flag}</span>
                    <span className="font-medium">{item.country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {item.count} articles
                    </span>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Top News Categories
              </span>
              <Button variant="ghost" size="sm" onClick={handleFilterClick}>
                <Filter className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  category: "Politics",
                  count: 1247,
                  percentage: 32.1,
                  color: "bg-blue-500",
                },
                {
                  category: "Technology",
                  count: 892,
                  percentage: 23.0,
                  color: "bg-green-500",
                },
                {
                  category: "Sports",
                  count: 654,
                  percentage: 16.8,
                  color: "bg-orange-500",
                },
                {
                  category: "Business",
                  count: 543,
                  percentage: 14.0,
                  color: "bg-purple-500",
                },
                {
                  category: "Health",
                  count: 432,
                  percentage: 11.1,
                  color: "bg-teal-500",
                },
                {
                  category: "Other",
                  count: 123,
                  percentage: 3.0,
                  color: "bg-gray-500",
                },
              ].map((item) => (
                <div
                  key={item.category}
                  className="flex items-center space-x-3"
                >
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.count}
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <AdvancedChart
          title="Article Processing Timeline"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </div>
    </div>
  );
}