import { newsTopicList } from "@/shared/enum-list";

export type NewsTopic = (typeof newsTopicList)[number];

export interface NewsArticle {
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  content: string;
  tags: string[];
  keywords: string[];
  topic: NewsTopic;
  url: string;
  source: string;
  publishedAt: Date;

  location: {
    name: string;
    city?: string;
    state?: string;
    country?: string;
    code?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface ScrapedArticle {
  title: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  language: string;
}

export interface AINewsResponse {
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  content: string;
  tags: string[];
  keywords: string[];
  topic: NewsTopic;
  locationName: string;
  url: string;
  source: string;
  publishedAt: Date;
}

export interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
  };
}

export interface RSSSource {
  url: string;
  name: string;
  source: string;
  language: string;
}

export interface ArticleScalation {
  title: string;
  content: string;
  url: string;
  source: string;
  sourceName: string;
  publishedAt: Date;
  language: string;
}
