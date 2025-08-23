import "server-only";

import { ApiPagination } from "@/types/api-response";
import { urlUtils } from "@/utils/urls";
import { NewsSourceFilters } from "@/utils/validator";
import { and, asc, eq, ilike, or, sql, SQLWrapper } from "drizzle-orm";
import db from "../database";
import {
  NewRssSourceType,
  rssSource,
  RssSourceType,
} from "../database/schemas";

export const NewsSourceService = {
  getAll: async (
    filters?: NewsSourceFilters
  ): Promise<{ pagination: ApiPagination; data: RssSourceType[] }> => {
    try {
      const conditions = NewsSourceService.buildWhereConditions(filters);
      const { page, limit, offset } = NewsSourceService.validatePagination(
        filters?.page,
        filters?.limit
      );

      // Get total count with error handling
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(rssSource)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      if (!countResult || countResult.length === 0) {
        throw new Error("Failed to get count from database");
      }

      const totalItems = Number(countResult[0].count) || 0;

      // Get paginated data
      const data = await db
        .select()
        .from(rssSource)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(rssSource.name))
        .limit(limit)
        .offset(offset);

      const pagination: ApiPagination = {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };

      return { data, pagination };
    } catch (error) {
      console.error("NewsSourceService.getAll error:", error);
      throw new Error("Failed to retrieve news sources");
    }
  },

  getActiveUrls: async () => {
    const sources = await db
      .select()
      .from(rssSource)
      .where(and(eq(rssSource.isActive, true)));
    return sources.map((s) => ({
      url: s.rssUrl,
      name: s.name,
      source: s.baseUrl,
      language: s.language ?? "english",
    }));
  },

  create: async (data: NewRssSourceType) => {
    const urlValidation = urlUtils.validateRssUrl(data.rssUrl || "");
    if (!urlValidation.valid) {
      throw new Error(`Invalid RSS URL: ${urlValidation.error}`);
    }

    const [result] = await db
      .insert(rssSource)
      .values({
        ...data,
        rssUrl: urlValidation.normalized,
      })
      .onConflictDoNothing()
      .returning();

    return result;
  },

  buildWhereConditions: (filters?: NewsSourceFilters): SQLWrapper[] => {
    const conditions: SQLWrapper[] = [];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(rssSource.name, `%${filters.search}%`),
          ilike(rssSource.baseUrl, `%${filters.search}%`)
        ) as SQLWrapper
      );
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(rssSource.isActive, filters.isActive));
    }

    if (filters?.baseUrl) {
      conditions.push(ilike(rssSource.baseUrl, `%${filters.baseUrl}%`));
    }

    return conditions;
  },

  validatePagination: (page?: number, limit?: number) => {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(100, Math.max(1, limit || 20)); // Cap at 100
    const offset = (validatedPage - 1) * validatedLimit;

    return { page: validatedPage, limit: validatedLimit, offset };
  },

  getSourcesForFetching: async (hoursAgo: number = 1) => {
    console.info("🔘 Getting sources for fetching");

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

    const sources = await db
      .select()
      .from(rssSource)
      .where(and(eq(rssSource.isActive, true)))
      .orderBy(asc(rssSource.lastFetch));

    // Validate and normalize URLs
    const validatedSources = sources
      .map((source) => {
        const { normalized, valid, error } = urlUtils.validateRssUrl(
          source.rssUrl || ""
        );

        if (!valid) {
          return console.error(
            `Invalid RSS URL for ${source.rssUrl} - ${error}`
          );
        }

        return { ...source, rssUrl: normalized };
      })
      .filter(Boolean);

    console.info(
      `🔘 Found ${validatedSources.length} valid sources (${
        sources.length - validatedSources.length
      } invalid)`
    );

    return validatedSources;
  },
};
