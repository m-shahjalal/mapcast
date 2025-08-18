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
import { DataTable } from "@/components/table";
import type { ColumnDef } from "@tanstack/react-table";
import { RssSourceType } from "@/server/database/schemas";
import type { ApiPagination } from "@/types/api-response";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Filter,
  Plus,
  Rss,
  Search,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface NewsSourceManagerProps {
  sources: RssSourceType[] | null | undefined;
  pagination?: ApiPagination;
}

const ITEMS_PER_PAGE = 10;

export function NewsSourceManager({
  sources,
  pagination,
}: NewsSourceManagerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Ensure sources is always an array
  const sourcesArray = useMemo(() => {
    return Array.isArray(sources) ? sources : [];
  }, [sources]);

  const allStatuses = useMemo(
    () => ["All", "active", "error", "maintenance"],
    []
  );

  const filteredSources = useMemo(() => {
    if (!sourcesArray.length) return [];

    return sourcesArray.filter((source) => {
      const matchesSearch =
        source.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.rssUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.domain?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        (source as any).category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "active" && source.isActive) ||
        (selectedStatus === "error" && !source.isActive) ||
        (selectedStatus === "maintenance" && source.isActive === null);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [sourcesArray, searchQuery, selectedCategory, selectedStatus]);

  const totalPages =
    pagination?.totalPages ??
    Math.ceil(filteredSources.length / ITEMS_PER_PAGE);
  const pageSize = pagination?.pageSize ?? ITEMS_PER_PAGE;

  const paginatedSources = useMemo(() => {
    if (pagination) return sourcesArray;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSources.slice(startIndex, endIndex);
  }, [filteredSources, currentPage, pagination, sourcesArray]);

  // Statistics calculations with safety checks
  const stats = useMemo(() => {
    if (!sourcesArray.length)
      return { active: 0, inactive: 0, avgSuccess: 0, totalArticles: 0 };

    const active = sourcesArray.filter((s) => s.isActive).length;
    const inactive = sourcesArray.filter((s) => !s.isActive).length;

    const avgSuccess =
      sourcesArray.reduce(
        (acc, s) =>
          acc + (typeof s.successRate === "number" ? s.successRate : 0),
        0
      ) / sourcesArray.length;

    return { active, inactive, avgSuccess };
  }, [sourcesArray]);

  const handleDeleteSource = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this source?")) {
      // TODO: Implement actual delete logic
      alert(`Source ${id} deleted successfully! (Mock)`);
    }
  }, []);

  const getStatusColorClass = useCallback((status: boolean | null) => {
    if (status === true) return "text-green-500 dark:text-green-400";
    if (status === false) return "text-red-500 dark:text-red-400";
    return "text-gray-500";
  }, []);

  const getStatusIcon = useCallback((status: boolean | null) => {
    if (status === true) return <CheckCircle className="h-4 w-4" />;
    if (status === false) return <XCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  }, []);

  const getStatusText = useCallback((status: boolean | null) => {
    if (status === true) return "Active";
    if (status === false) return "Error";
    return "Maintenance";
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setCurrentPage(1);
  }, []);

  const columns = useMemo<ColumnDef<RssSourceType>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name || "Untitled"}
          </span>
        ),
      },
      {
        id: "domain",
        header: "Domain",
        cell: ({ row }) => (
          <span className="text-muted-foreground truncate max-w-[150px] inline-block">
            {row.original.domain || "—"}
          </span>
        ),
      },
      {
        id: "rssUrl",
        header: "RSS URL",
        cell: ({ row }) => (
          <span className="text-muted-foreground truncate max-w-[200px] inline-block">
            {row.original.rssUrl || "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div
            className={`flex items-center space-x-1 ${getStatusColorClass(
              row.original.isActive ?? null
            )}`}
          >
            {getStatusIcon(row.original.isActive ?? null)}
            <span className="text-sm font-medium capitalize">
              {getStatusText(row.original.isActive ?? null)}
            </span>
          </div>
        ),
      },
      {
        id: "active",
        header: "Active",
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? "default" : "destructive"}
            className={
              row.original.isActive
                ? "bg-green-500 dark:bg-green-600"
                : row.original.isActive === false
                ? "bg-red-500 dark:bg-red-600"
                : "bg-gray-500 dark:bg-gray-600"
            }
          >
            {row.original.isActive === true
              ? "Yes"
              : row.original.isActive === false
              ? "No"
              : "—"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right text-foreground">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Link href={`/dashboard/sources/${row.original.id}/edit`}>
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 text-muted-foreground hover:text-foreground"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDeleteSource(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [getStatusColorClass, getStatusIcon, getStatusText, handleDeleteSource]
  );

  // Loading state
  if (sources === null || sources === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state - when sources is not an array but not null/undefined
  if (!Array.isArray(sources)) {
    return (
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="text-center py-12">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Data Loading Error
          </h3>
          <p className="text-red-500 mb-2">Invalid data format received</p>
          <p className="text-sm text-gray-500">
            Expected array, got: {typeof sources}
          </p>
          <Button
            onClick={() => router.refresh()}
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-foreground">
              <Rss className="h-5 w-5 mr-2" />
              RSS News Sources
            </CardTitle>
            <Link href="/dashboard/sources/create">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sources by name, URL, or domain..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-white/50 dark:bg-gray-800/50 text-foreground"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-800/50 dark:text-gray-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-gray-800 text-foreground">
                  <SelectItem value="All">All Categories</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] bg-white/50 dark:bg-gray-800/50 dark:text-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-gray-800 text-foreground">
                  {allStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All"
                        ? "All Statuses"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="bg-white/50 dark:bg-gray-800/50"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
            <DataTable<RssSourceType>
              columns={columns}
              data={paginatedSources}
              emptyState={"No sources found matching your criteria."}
              caption={"RSS News Sources"}
            />
          </div>

          {/* Pagination Controls (always visible) */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              {pagination
                ? `Page ${pagination.currentPage} of ${pagination.totalPages} • ${pagination.totalItems} total`
                : `Showing ${Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    filteredSources.length
                  )} to ${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredSources.length
                  )} of ${filteredSources.length} sources`}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination
                    ? (window.location.href = `/dashboard/sources?page=${Math.max(
                        1,
                        (pagination?.currentPage ?? 1) - 1
                      )}&limit=${pageSize}`)
                    : setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                disabled={
                  pagination ? pagination.currentPage <= 1 : currentPage === 1
                }
                className="dark:bg-gray-800 dark:text-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground dark:text-gray-400">
                Page {pagination ? pagination.currentPage : currentPage} of{" "}
                {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination
                    ? (window.location.href = `/dashboard/sources?page=${Math.min(
                        totalPages,
                        (pagination?.currentPage ?? 1) + 1
                      )}&limit=${pageSize}`)
                    : setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={
                  pagination
                    ? pagination.currentPage >= totalPages
                    : currentPage === totalPages
                }
                className="dark:bg-gray-800 dark:text-gray-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {paginatedSources.length === 0 &&
            filteredSources.length === 0 &&
            sourcesArray.length === 0 && (
              <div className="text-center py-12">
                <Rss className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No sources found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Get started by adding your first RSS news source
                </p>
                <Link href="/dashboard/sources/create">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Source
                  </Button>
                </Link>
              </div>
            )}

          {/* Filtered Empty State */}
          {paginatedSources.length === 0 &&
            filteredSources.length === 0 &&
            sourcesArray.length > 0 && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No matching sources
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="bg-white/50 dark:bg-gray-800/50"
                >
                  Clear Filters
                </Button>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Source Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm opacity-90">Active Sources</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.inactive}</p>
            <p className="text-sm opacity-90">Error Sources</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.avgSuccess.toFixed(1)}%</p>
            <p className="text-sm opacity-90">Avg Success Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2" />

            <p className="text-sm opacity-90">Total Articles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
