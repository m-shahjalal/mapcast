import { NewsType } from "@/server/database/schemas";
import { Metadata } from "next";

const formatDate = (date: Date) => new Date(date).toISOString();

export const generateNewsMetadata = (news: NewsType): Metadata => {
  const publishedTime = formatDate(news.publishedAt);
  const modifiedTime = formatDate(news.updatedAt || news.publishedAt);
  const tags = news.tags?.split(",").map((tag) => tag.trim()) || [];

  return {
    title: news.title,
    description: news.summary || news.metaDescription,
    keywords: tags,
    authors: [{ name: news.sourceDomain }],
    publisher: news.sourceDomain,
    category: news.topic,

    openGraph: {
      type: "article",
      title: news.title,
      description: news.summary || news.metaDescription || undefined,
      url: news.originalUrl,
      siteName: "Your Site Name", // Replace with your site name
      publishedTime,
      modifiedTime,
      authors: [news.sourceDomain],
      section: news.topic,
      tags,
      images: news.imageUrl
        ? [
            {
              url: news.imageUrl,
              width: 1200,
              height: 630,
              alt: news.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: news.summary || news.metaDescription || undefined,
      images: news.imageUrl ? [news.imageUrl] : undefined,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    alternates: {
      canonical: news.originalUrl,
    },

    other: {
      "article:published_time": publishedTime,
      "article:modified_time": modifiedTime,
      "article:author": news.sourceDomain,
      "article:section": news.topic,
      "article:tag": tags.join(","),
      ...(news.readTime && { "article:read_time": `${news.readTime}` }),
    },
  };
};
