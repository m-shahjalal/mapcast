"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { startReadingFeeds } from "@/server/feed-reader/rss-processor";
import {
  Activity,
  CheckCircle,
  Clock,
  Database,
  Download,
  Pause,
  Play,
  RefreshCw,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export default function CrawlerPage() {
  const [crawlerStatus, setCrawlerStatus] = useState<
    "idle" | "running" | "error"
  >("idle");
  const [lastCrawl, setLastCrawl] = useState<string>("2024-01-17 09:30:00");

  const triggerCrawler = async () => {
    setCrawlerStatus("running");
    try {
      const result = await startReadingFeeds();

      if (result) {
        setLastCrawl(new Date().toLocaleString());
        setCrawlerStatus("idle");
      } else {
        setCrawlerStatus("error");
      }
    } catch (error) {
      console.error("Crawler trigger failed:", error);
      setCrawlerStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw
                className={`h-5 w-5 ${
                  crawlerStatus === "running"
                    ? "animate-spin text-blue-600"
                    : ""
                }`}
              />
              <span>News Crawler Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Crawler Status</h3>
                <p className="text-sm text-gray-600">
                  Last successful run: {lastCrawl}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      Next run:{" "}
                      {new Date(Date.now() + 30 * 60000).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <span>Avg processing: {"30s"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  variant={
                    crawlerStatus === "running"
                      ? "default"
                      : crawlerStatus === "error"
                      ? "destructive"
                      : "secondary"
                  }
                  className="px-3 py-1"
                >
                  {crawlerStatus === "running" && (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  )}
                  {crawlerStatus.charAt(0).toUpperCase() +
                    crawlerStatus.slice(1)}
                </Badge>
                <Button
                  onClick={triggerCrawler}
                  disabled={crawlerStatus === "running"}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {crawlerStatus === "running" ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Crawl
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Success Rate</h4>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">97.8%</p>
                <p className="text-xs text-green-600">Last 24 hours</p>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Articles/Hour</h4>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">~23</p>
                <p className="text-xs text-blue-600">Average rate</p>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Queue Size</h4>
                  <Database className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">142</p>
                <p className="text-xs text-purple-600">Pending items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Crawler Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Crawl</label>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Interval (minutes)
                </label>
                <select
                  defaultValue={30}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="15">15 minutes</option>
                  <option value="30" selected>
                    30 minutes
                  </option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Parallel Processing
                </label>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Workers</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option value="2">2 workers</option>
                  <option value="4" selected>
                    4 workers
                  </option>
                  <option value="8">8 workers</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
