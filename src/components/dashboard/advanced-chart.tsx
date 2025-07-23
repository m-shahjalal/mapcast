"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";

interface AdvancedChartProps {
  title: string;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export function AdvancedChart({
  title,
  timeRange,
  onTimeRangeChange,
}: AdvancedChartProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            {title}
          </span>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="text-sm border rounded-md px-2 py-1 bg-white/50"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-32 h-32 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-400 rounded-full animate-pulse delay-500"></div>
          </div>

          <div className="text-center z-10">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-semibold text-gray-700">
              Interactive Chart Visualization
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Real-time article processing data
            </p>
            <div className="flex items-center justify-center mt-4 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">
                  Articles Processed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Success Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Processing Time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart metrics */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Peak Hour</p>
            <p className="text-lg font-bold text-blue-600">2:00 PM</p>
            <div className="flex items-center justify-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+15%</span>
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg Response</p>
            <p className="text-lg font-bold text-green-600">1.2s</p>
            <div className="flex items-center justify-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">-8%</span>
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Today</p>
            <p className="text-lg font-bold text-purple-600">2,847</p>
            <div className="flex items-center justify-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+23%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
