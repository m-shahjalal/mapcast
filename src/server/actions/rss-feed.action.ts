"use server";

import { NewsSourceFilters } from "@/utils/validator";
import { NewsSourceService } from "../services/rss.service";
import { NewsSourceSchemaType } from "../database/schemas";

export const creteRssFeed = async (data: NewsSourceSchemaType) => {
  return await NewsSourceService.create(data);
};

export const getRssFeedList = async (filters?: NewsSourceFilters) => {
  return await NewsSourceService.getAll(filters);
};
