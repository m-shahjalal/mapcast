"use server";

import { MapCastFilters, NewsFilters } from "@/types/query-filter";
import { NewsService } from "../services/news.service";

export const getNews = async (filter: NewsFilters) => {
  return await NewsService.findAll(filter);
};

export const getMapCastData = async (filters?: MapCastFilters) => {
  return await NewsService.getMapData(filters);
};

export const getNewsById = async (id: string) => {
  return await NewsService.findById(id);
};

export const getNewsBySlug = async (slug: string) => {
  return await NewsService.findBySlug(slug);
};
