"use server";

import { NewsFilters, NewsMapFilters } from "@/types/query-filter";
import { NewsService } from "../services/news.service";

export const getNews = async (filter: NewsFilters) => {
  return await NewsService.findAll(filter);
};

export const getNewsMapData = async (filters?: NewsMapFilters) => {
  return await NewsService.getMapData(filters);
};

export const getNewsById = async (id: string) => {
  return await NewsService.findById(id);
};

export const getNewsBySlug = async (slug: string) => {
  return await NewsService.findBySlug(slug);
};
