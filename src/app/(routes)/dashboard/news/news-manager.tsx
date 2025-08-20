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
import { NewsType } from "@/server/database/schemas";
import type { ApiPagination } from "@/types/api-response";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Globe,
  Heart,
  MapPin,
  Newspaper,
  Plus,
  RefreshCcw,
  Search,
  Share2,
  Star,
  Trash2,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface NewsManagerProps {
  news: NewsType[] | null | undefined;
  pagination?: ApiPagination;
}

const ITEMS_PER_PAGE = 10;

const NEWS_TOPICS = [
  "All",
  "politics",
  "technology",
  "business",
  "sports",
  "entertainment",
  "health",
  "science",
  "world",
  "local",
];

const NEWS_STATUSES = ["All", "published", "draft", "archived"];

export function NewsManager({ news, pagination }: NewsManagerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Ensure news is always an array
  const newsArray = useMemo(() => {
    return Array.isArray(news) ? news : [];
  }, [news]);

  // Get unique countries from news data
  const uniqueCountries = useMemo(() => {
    const countries = newsArray
      .map((article) => article.locationCountry)
      .filter(Boolean)
      .filter((country, index, self) => self.indexOf(country) === index)
      .sort();
    return ["All", ...countries];
  }, [newsArray]);

  const filteredNews = useMemo(() => {
    if (!newsArray.length) return [];

    return newsArray.filter((article) => {
      const matchesSearch =
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.sourceDomain
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        article.tags?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTopic =
        selectedTopic === "All" || article.topic === selectedTopic;

      const matchesStatus =
        selectedStatus === "All" || article.status === selectedStatus;

      const matchesCountry =
        selectedCountry === "All" ||
        article.locationCountry === selectedCountry;

      return matchesSearch && matchesTopic && matchesStatus && matchesCountry;
    });
  }, [newsArray, searchQuery, selectedTopic, selectedStatus, selectedCountry]);

  const totalPages =
    pagination?.totalPages ?? Math.ceil(filteredNews.length / ITEMS_PER_PAGE);

  const pageSize = pagination?.pageSize ?? ITEMS_PER_PAGE;
  const paginatedNews = useMemo(() => {
    if (pagination) return newsArray;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredNews.slice(startIndex, endIndex);
  }, [filteredNews, currentPage, pagination, newsArray]);

  const stats = useMemo(() => {
    if (!newsArray.length)
      return { published: 0, draft: 0, totalViews: 0, totalShares: 0 };

    const published = newsArray.filter((a) => a.status === "published").length;
    const draft = newsArray.filter((a) => a.status === "draft").length;
    const totalViews = newsArray.reduce(
      (acc, a) => acc + (a.viewsCount || 0),
      0
    );
    const totalShares = newsArray.reduce(
      (acc, a) => acc + (a.sharesCount || 0),
      0
    );

    return { published, draft, totalViews, totalShares };
  }, [newsArray]);

  const handleDeleteNews = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      alert(`Article ${id} deleted successfully! (Mock)`);
    }
  }, []);

  const getStatusBadgeVariant = useCallback((status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "secondary";
    }
  }, []);

  const getStatusBadgeClass = useCallback((status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500 dark:bg-green-600 text-white";
      case "draft":
        return "bg-yellow-500 dark:bg-yellow-600 text-white";
      case "archived":
        return "bg-gray-500 dark:bg-gray-600 text-white";
      default:
        return "bg-gray-500 dark:bg-gray-600 text-white";
    }
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }, []);

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTopic("All");
    setSelectedStatus("All");
    setSelectedCountry("All");
    setCurrentPage(1);
  }, []);

  const columns = useMemo<ColumnDef<NewsType>[]>(
    () => [
      {
        id: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="max-w-[300px]">
            <p className="font-medium text-foreground truncate">
              {row.original.title}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {row.original.summary}
            </p>
          </div>
        ),
      },
      {
        id: "topic",
        header: "Topic",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          >
            {row.original.topic?.charAt(0).toUpperCase() +
              row.original.topic?.slice(1)}
          </Badge>
        ),
      },
      {
        id: "source",
        header: "Source",
        cell: ({ row }) => (
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span className="truncate max-w-[100px]">
              {row.original.sourceDomain}
            </span>
          </div>
        ),
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) =>
          row.original.locationCountry ? (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">
                {row.original.locationCity || row.original.locationCountry}
              </span>
            </div>
          ) : (
            "—"
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.status ? (
            <Badge
              variant={getStatusBadgeVariant(row.original.status)}
              className={getStatusBadgeClass(row.original.status)}
            >
              {row.original.status.charAt(0).toUpperCase() +
                row.original.status.slice(1)}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800">
              —
            </Badge>
          ),
      },
      {
        id: "published",
        header: "Published",
        cell: ({ row }) => (
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">
              {formatDate(row.original.publishedAt as any)}
            </span>
          </div>
        ),
      },
      {
        id: "engagement",
        header: "Engagement",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{formatNumber(row.original.viewsCount || 0)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="h-3 w-3" />
              <span>{formatNumber(row.original.sharesCount || 0)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(row.original.likesCount || 0)}</span>
            </div>
          </div>
        ),
      },
      {
        id: "flags",
        header: "Flags",
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            {row.original.isFeatured && (
              <Star className="h-3 w-3 text-yellow-500" />
            )}
            {row.original.isBreaking && (
              <Zap className="h-3 w-3 text-red-500" />
            )}
            {row.original.isPinned && (
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right text-foreground">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-1">
            <Link href={`/dashboard/news/${row.original.id}/edit`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDeleteNews(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [
      formatDate,
      formatNumber,
      getStatusBadgeClass,
      getStatusBadgeVariant,
      handleDeleteNews,
    ]
  );

  if (news === null || news === undefined) {
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

  if (!Array.isArray(news)) {
    return (
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="text-center py-12">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Data Loading Error
          </h3>
          <p className="text-red-500 mb-2">Invalid data format received</p>
          <p className="text-sm text-gray-500">
            Expected array, got: {typeof news}
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
              <Newspaper className="h-5 w-5 mr-2" />
              News Articles
            </CardTitle>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, summary, domain, or tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-white/50 dark:bg-gray-800/50 text-foreground"
              />
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Select
                value={selectedTopic}
                onValueChange={(value) => {
                  setSelectedTopic(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] bg-white/50 dark:bg-gray-800/50 dark:text-gray-200">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-gray-800 text-foreground">
                  {NEWS_TOPICS.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic === "All"
                        ? "All Topics"
                        : topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] bg-white/50 dark:bg-gray-800/50 dark:text-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-gray-800 text-foreground">
                  {NEWS_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All"
                        ? "All Statuses"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedCountry}
                onValueChange={(value) => {
                  setSelectedCountry(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] bg-white/50 dark:bg-gray-800/50 dark:text-gray-200">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-gray-800 text-foreground">
                  {uniqueCountries.map((country) => (
                    <SelectItem key={country} value={country ?? "All"}>
                      {country === "All" ? "All Countries" : country}
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

          {/* News Table */}
          <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
            <DataTable<NewsType>
              columns={columns}
              data={paginatedNews}
              emptyState={"No articles found matching your criteria."}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              {pagination
                ? `Page ${pagination.currentPage} of ${pagination.totalPages} • ${pagination.totalItems} total`
                : `Showing ${Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    filteredNews.length
                  )} to ${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredNews.length
                  )} of ${filteredNews.length} articles`}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination
                    ? (window.location.href = `/dashboard/news?page=${Math.max(
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
                    ? (window.location.href = `/dashboard/news?page=${Math.min(
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

          {/* Empty States */}
          {paginatedNews.length === 0 &&
            filteredNews.length === 0 &&
            newsArray.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Get started by adding your first news article
                </p>
                <Link href="/dashboard/news/create">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Article
                  </Button>
                </Link>
              </div>
            )}

          {/* Filtered Empty State */}
          {paginatedNews.length === 0 &&
            filteredNews.length === 0 &&
            newsArray.length > 0 && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No matching articles
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Newspaper className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.published}</p>
            <p className="text-sm opacity-90">Published</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Edit className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.draft}</p>
            <p className="text-sm opacity-90">Drafts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {formatNumber(stats.totalViews)}
            </p>
            <p className="text-sm opacity-90">Total Views</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {formatNumber(stats.totalShares)}
            </p>
            <p className="text-sm opacity-90">Total Shares</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
