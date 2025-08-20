"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Eye,
  Filter,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  XCircle,
  ArrowUpDown,
  Delete,
  Trash,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { DataTableView, TablePagination } from "@/components/table";
import type { ApiPagination } from "@/types/api-response";
import { deleteAllLogs } from "@/server/actions/log.action";

// Types
interface CrawlerLog {
  _id: string;
  timestamp: string;
  level: "success" | "error" | "warn" | "info" | "debug";
  message: string;
  service?: string;
  metadata?: {
    service?: string;
    source?: string;
    details?: string;
    articlesProcessed?: number;
    duration?: number;
  };
}

// Hooks
const useCrawlerStatus = () => {
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [lastCrawl, setLastCrawl] = useState("2024-01-17 09:30:00");

  const triggerCrawler = async () => {
    const url = process.env.NEXT_PUBLIC_JOB_URL;
    if (!url) return;

    try {
      setStatus("running");
      const result = await fetch(url, { method: "POST" });
      if (result.ok) {
        setLastCrawl(new Date().toLocaleString());
        setStatus("idle");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return { status, lastCrawl, triggerCrawler };
};

// Components
const StatusCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  bgColor: string;
}) => (
  <div className={`p-4 border rounded-lg ${bgColor}`}>
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium">{title}</h4>
      <Icon className="h-4 w-4" />
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs">{subtitle}</p>
  </div>
);

const StatusDashboard = () => {
  const { status, lastCrawl, triggerCrawler } = useCrawlerStatus();

  return (
    <Card className="bg-white/70 backdrop-blur-none border-0">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          News Crawler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
                  <span>Avg processing: 30s</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant={
                  status === "running"
                    ? "default"
                    : status === "error"
                    ? "destructive"
                    : "secondary"
                }
              >
                {status === "running" && (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                )}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Button onClick={triggerCrawler} disabled={status === "running"}>
                {status === "running" ? (
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
          <div className="grid grid-cols-3 gap-4">
            <StatusCard
              title="Success Rate"
              value="97.8%"
              subtitle="Last 24 hours"
              icon={CheckCircle}
              bgColor="bg-green-50"
            />
            <StatusCard
              title="Articles/Hour"
              value="~23"
              subtitle="Average rate"
              icon={TrendingUp}
              bgColor="bg-blue-50"
            />
            <StatusCard
              title="Queue Size"
              value="142"
              subtitle="Pending items"
              icon={Database}
              bgColor="bg-purple-50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TableFilters = ({
  globalFilter,
  setGlobalFilter,
  levelFilter,
  setLevelFilter,
}: {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  levelFilter: string;
  setLevelFilter: (value: string) => void;
}) => {
  const logTypes = ["all", "info", "success", "error", "warn", "debug"];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search logs..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 bg-white/50"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[140px] bg-white/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {logTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all"
                  ? "All Types"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setGlobalFilter("");
            setLevelFilter("all");
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

const LogsTable = ({
  logs,
  pagination,
}: {
  logs: CrawlerLog[];
  pagination?: ApiPagination;
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const columnHelper = createColumnHelper<CrawlerLog>();

  type LogLevel = "success" | "error" | "warn" | "info" | "debug";
  const getLogIcon = (level: string) => {
    const icons: Record<LogLevel, ReactNode> = {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
      error: <XCircle className="h-4 w-4 text-red-600" />,
      warn: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      info: <Eye className="h-4 w-4 text-blue-600" />,
      debug: <Eye className="h-4 w-4 text-gray-600" />,
    };
    return icons[level as LogLevel] || icons.debug;
  };

  const getBadgeClass = (level: string) => {
    const classes: Record<LogLevel, string> = {
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      warn: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800",
      debug: "bg-gray-100 text-gray-800",
    };
    return classes[level as LogLevel] || classes.debug;
  };

  const handleClear = () => {
    confirm("Are you sure to delete all logs?") && deleteAllLogs();
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("timestamp", {
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none flex items-center"
            onClick={column.getToggleSortingHandler()}
          >
            Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ getValue }) => (
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span className="text-xs font-mono">
              {new Date(getValue()).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("level", {
        header: "Level",
        cell: ({ getValue }) => (
          <div className="flex items-center space-x-2">
            {getLogIcon(getValue())}
            <Badge variant="outline" className={getBadgeClass(getValue())}>
              {getValue().charAt(0).toUpperCase() + getValue().slice(1)}
            </Badge>
          </div>
        ),
        filterFn: (row, columnId, value) => {
          if (value === "all") return true;
          return row.getValue(columnId) === value;
        },
      }),
      columnHelper.accessor((row) => row.metadata?.service || row.service, {
        id: "service",
        header: "Service",
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor("message", {
        header: "Message",
        cell: ({ getValue }) => (
          <p className="truncate max-w-[300px]" title={getValue()}>
            {getValue()}
          </p>
        ),
      }),
      columnHelper.accessor((row) => row.metadata?.source, {
        id: "source",
        header: "Source",
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor((row) => row.metadata?.articlesProcessed, {
        id: "articles",
        header: "Articles",
        cell: ({ getValue }) =>
          getValue() ? (
            <div className="flex items-center space-x-1">
              <Database className="h-3 w-3" />
              <span>{getValue()}</span>
            </div>
          ) : (
            "—"
          ),
      }),
      columnHelper.accessor((row) => row.metadata?.duration, {
        id: "duration",
        header: "Duration",
        cell: ({ getValue }) =>
          getValue() ? (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{getValue()}s</span>
            </div>
          ) : (
            "—"
          ),
      }),
      columnHelper.accessor((row) => row.metadata?.details, {
        id: "details",
        header: "Details",
        cell: ({ getValue }) =>
          getValue() ? (
            <p className="text-xs truncate max-w-[200px]" title={getValue()}>
              {getValue()}
            </p>
          ) : (
            "—"
          ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: {
      globalFilter,
      columnFilters: [{ id: "level", value: levelFilter }],
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: pagination?.pageSize } },
  });

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="flex justify-between">
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Crawler Activity Logs
        </CardTitle>
        <Button onClick={handleClear} variant="destructive">
          <Trash />
          Clear logs
        </Button>
      </CardHeader>
      <CardContent>
        <TableFilters
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
        />

        <DataTableView
          table={table}
          className="overflow-x-auto rounded-lg border"
        />

        {pagination ? (
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalItems} total
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  (window.location.href = `/dashboard/crawler?page=${Math.max(
                    1,
                    pagination.currentPage - 1
                  )}&limit=${pagination.pageSize}`)
                }
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  (window.location.href = `/dashboard/crawler?page=${Math.min(
                    pagination.totalPages,
                    pagination.currentPage + 1
                  )}&limit=${pagination.pageSize}`)
                }
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          table.getPageCount() > 1 && <TablePagination table={table} />
        )}

        {table.getFilteredRowModel().rows.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <h3 className="text-md font-medium mb-2">No activity logs</h3>
            <p className="text-gray-500 mb-4">
              Crawler logs will appear here once activities begin
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function CrawlManager({
  logs,
  pagination,
}: {
  logs: CrawlerLog[];
  pagination?: ApiPagination;
}) {
  console.log("size", logs.length);
  return (
    <div className="space-y-6">
      <StatusDashboard />
      <LogsTable logs={logs} pagination={pagination} />
    </div>
  );
}
