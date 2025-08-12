"use server";

import { NewsSourceFilters } from "@/utils/validator";
import { NewsSourceService } from "../services/rss.service";
import { NewRssSourceType } from "../database/schemas";

export const creteRssSource = async (data: NewRssSourceType) => {
  return await NewsSourceService.create(data);
};

export const getRssSourceList = async (filters?: NewsSourceFilters) => {
  return await NewsSourceService.getAll(filters);
};
