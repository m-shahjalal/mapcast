"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Server,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Zap,
  RefreshCw,
} from "lucide-react"

export function SystemMetrics() {
  const systemServices = [
    { name: "API Gateway", status: "healthy", uptime: "99.98%", responseTime: "45ms", icon: Server },
    { name: "Database", status: "healthy", uptime: "99.95%", responseTime: "12ms", icon: Database },
    { name: "Redis Cache", status: "healthy", uptime: "99.99%", responseTime: "2ms", icon: Zap },
    { name: "News Crawler", status: "healthy", uptime: "98.76%", responseTime: "1.2s", icon: RefreshCw },
    { name: "CDN", status: "warning", uptime: "99.12%", responseTime: "89ms", icon: Network },
    { name: "Authentication", status: "healthy", uptime: "99.97%", responseTime: "23ms", icon: Shield },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            System Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemServices.map((service) => {
              const IconComponent = service.icon
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Uptime: {service.uptime}</span>
                        <span>Response: {service.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        service.status === "healthy"
                          ? "default"
                          : service.status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                      className="flex items-center space-x-1"
                    >
                      <span className={getStatusColor(service.status)}>{getStatusIcon(service.status)}</span>
                      <span className="capitalize">{service.status}</span>
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Performance Metrics
            </span>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <span className="text-sm font-bold">23.8%</span>
              </div>
              <Progress value={23.8} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>8 cores available</span>
                <span className="text-green-600">Optimal</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <span className="text-sm font-bold">45.2%</span>
              </div>
              <Progress value={45.2} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>32GB total</span>
                <span className="text-green-600">Normal</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <span className="text-sm font-bold">67.3%</span>
              </div>
              <Progress value={67.3} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1TB SSD</span>
                <span className="text-yellow-600">Monitor</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Network className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Network I/O</span>
                </div>
                <span className="text-sm font-bold">12.4 MB/s</span>
              </div>
              <Progress value={31} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1Gbps connection</span>
                <span className="text-green-600">Normal</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
