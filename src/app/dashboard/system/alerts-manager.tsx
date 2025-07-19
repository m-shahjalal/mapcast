"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Plus,
  Mail,
  Smartphone,
  Slack,
  Clock,
  TrendingUp,
  Database,
  Server,
  Zap,
} from "lucide-react"

export function AlertsManager() {
  const [alerts, setAlerts] = useState([
    {
      id: "1",
      title: "High CPU Usage",
      description: "CPU usage exceeded 80% for more than 5 minutes",
      severity: "warning",
      status: "active",
      timestamp: "2024-01-17 14:23:00",
      source: "System Monitor",
      acknowledged: false,
    },
    {
      id: "2",
      title: "RSS Feed Error",
      description: "TechCrunch RSS feed returning 404 errors",
      severity: "error",
      status: "active",
      timestamp: "2024-01-17 14:15:00",
      source: "News Crawler",
      acknowledged: false,
    },
    {
      id: "3",
      title: "Database Connection Pool",
      description: "Connection pool utilization at 95%",
      severity: "warning",
      status: "resolved",
      timestamp: "2024-01-17 13:45:00",
      source: "Database Monitor",
      acknowledged: true,
    },
    {
      id: "4",
      title: "API Rate Limit",
      description: "Approaching rate limit for geocoding service",
      severity: "info",
      status: "active",
      timestamp: "2024-01-17 13:30:00",
      source: "API Gateway",
      acknowledged: true,
    },
  ])

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    slack: true,
    push: true,
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-500 bg-red-50 border-red-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "info":
        return "text-blue-500 bg-blue-50 border-blue-200"
      default:
        return "text-gray-500 bg-gray-50 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: "resolved" } : alert)))
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const unresolvedAlerts = alerts.filter((alert) => !alert.acknowledged && alert.status === "active")

  return (
    <div className="space-y-6">
      {/* Alert Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{activeAlerts.length}</p>
            <p className="text-sm opacity-90">Active Alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{unresolvedAlerts.length}</p>
            <p className="text-sm opacity-90">Unacknowledged</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{alerts.filter((a) => a.status === "resolved").length}</p>
            <p className="text-sm opacity-90">Resolved Today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">98.5%</p>
            <p className="text-sm opacity-90">System Uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Active Alerts
              </span>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${alert.status === "resolved" ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {getSeverityIcon(alert.severity)}
                        <span className="ml-1 capitalize">{alert.severity}</span>
                      </Badge>
                      <h3 className="font-medium">{alert.title}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      {alert.status === "resolved" && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Resolved
                        </Badge>
                      )}
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.source}
                      </Badge>
                    </div>

                    {alert.status === "active" && (
                      <div className="flex items-center space-x-2">
                        {!alert.acknowledged && (
                          <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                            Acknowledge
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Email Alerts</span>
                </div>
                <Switch
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, email: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">SMS Alerts</span>
                </div>
                <Switch
                  checked={notificationSettings.sms}
                  onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, sms: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Slack className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Slack Integration</span>
                </div>
                <Switch
                  checked={notificationSettings.slack}
                  onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, slack: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Push Notifications</span>
                </div>
                <Switch
                  checked={notificationSettings.push}
                  onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, push: checked }))}
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Alert Thresholds</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">CPU Usage</span>
                  </div>
                  <span className="text-sm font-medium">80%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Memory Usage</span>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Error Rate</span>
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
