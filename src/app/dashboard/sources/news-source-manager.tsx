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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewsSourceType } from "@/server/schemas";
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
  sources: NewsSourceType[];
}

const ITEMS_PER_PAGE = 10;

export function NewsSourceManager({ sources }: NewsSourceManagerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const allStatuses = useMemo(
    () => ["All", "active", "error", "maintenance"],
    []
  );

  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      return (
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (source.rssUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false) ||
        source.domain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [sources, searchQuery, selectedCategory, selectedStatus]);

  const totalPages = Math.ceil(filteredSources.length / ITEMS_PER_PAGE);
  const paginatedSources = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSources.slice(startIndex, endIndex);
  }, [filteredSources, currentPage]);

  const handleDeleteSource = (id: string) => {
    if (confirm("Are you sure you want to delete this source?")) {
      alert(`Source ${id} deleted successfully! (Mock)`);
    }
  };

  const getStatusColorClass = (status: boolean) => {
    return status ? "text-green-500 dark:text-green-400" : "text-gray-500";
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4" />
    ) : (
      <Clock className="h-4 w-4" />
    );
  };

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setCurrentPage(1);
  }, []);

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
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Domain</TableHead>
                  <TableHead className="text-foreground">RSS URL</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Articles</TableHead>
                  <TableHead className="text-foreground">Credibility</TableHead>
                  <TableHead className="text-foreground">Active</TableHead>
                  <TableHead className="text-right text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSources.length > 0 ? (
                  paginatedSources.map((source) => (
                    <TableRow
                      key={source.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium text-foreground">
                        {source.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[150px]">
                        {source.domain}
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[200px]">
                        {source.rssUrl}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center space-x-1 ${getStatusColorClass(
                            source.isActive ?? false
                          )}`}
                        >
                          {getStatusIcon(source.isActive ?? false)}
                          <span className="text-sm font-medium capitalize">
                            {source.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {source.articlesCount != null
                          ? source.articlesCount.toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {source.credibilityScore != null &&
                        typeof source.credibilityScore === "number"
                          ? `${(source.credibilityScore * 100).toFixed(0)}%`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={source.isActive ? "default" : "destructive"}
                          className={
                            source.isActive
                              ? "bg-green-500 dark:bg-green-600"
                              : "bg-red-500 dark:bg-red-600"
                          }
                        >
                          {source.isActive ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/sources/${source.id}/edit`}>
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
                          onClick={() => handleDeleteSource(source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No sources found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="dark:bg-gray-800 dark:text-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="dark:bg-gray-800 dark:text-gray-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {paginatedSources.length === 0 && filteredSources.length === 0 && (
            <div className="text-center py-12">
              <Rss className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No sources found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Link href="/admin/sources/add">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Source
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Source Statistics (kept for context, no changes requested) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {sources.filter((s) => s.isActive).length}
            </p>
            <p className="text-sm opacity-90">Active Sources</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {sources.filter((s) => !s.isActive).length}
            </p>
            <p className="text-sm opacity-90">Error Sources</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {sources.length === 0
                ? "0.0"
                : (
                    sources.reduce(
                      (acc, s) =>
                        acc +
                        (typeof s.successRate === "number" ? s.successRate : 0),
                      0
                    ) / sources.length
                  ).toFixed(1)}
              %
            </p>
            <p className="text-sm opacity-90">Avg Success Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {sources.reduce((acc, s) => (s.articlesCount ?? 0) + acc, 0)}
            </p>
            <p className="text-sm opacity-90">Total article</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
