"use client";

import { useState } from "react";

interface NewsContent {
  title: string;
  body: string;
  url: string;
  extractedAt: string;
  hash: string;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  newsUrl: string;
  sourceId: string;
  locationName?: string;
  topic: string;
  createdAt: string;
}

interface UseNewsProxyReturn {
  content: NewsContent | null;
  loading: boolean;
  error: string | null;
  fetchNews: (url: string) => Promise<void>;
  fetchFromDatabase: (articleId: string) => Promise<void>;
  reset: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useNewsProxy(): UseNewsProxyReturn {
  const [content, setContent] = useState<NewsContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (url: string) => {
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/news/proxy/${url}`, {
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setContent(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch news content"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFromDatabase = async (articleId: string) => {
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      // First, get the article from your database
      const articleResponse = await fetch(
        `${API_BASE_URL}/api/news/${articleId}`
      );

      if (!articleResponse.ok) {
        throw new Error("Article not found");
      }

      const article: NewsArticle = await articleResponse.json();

      // Then proxy the content from the article URL
      await fetchNews(article.newsUrl);
    } catch (err) {
      console.error("Database fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch article");
    }
  };

  const reset = () => {
    setContent(null);
    setError(null);
    setLoading(false);
  };

  return {
    content,
    loading,
    error,
    fetchNews,
    fetchFromDatabase,
    reset,
  };
}

// Hook for fetching news list from your database
export function useNewsList() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const fetchNews = async (
    filters: {
      page?: number;
      limit?: number;
      sourceId?: string;
      topics?: string;
      location?: string;
      search?: string;
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE_URL}/api/news?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch news");
      }

      setNews(data.result);
      setCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  return {
    news,
    loading,
    error,
    count,
    fetchNews,
  };
}
