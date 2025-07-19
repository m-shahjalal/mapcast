import z from "zod";

export const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  page: z.coerce.number().min(1).optional(),
  orderBy: z.enum(["title", "createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  sourceId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required"),
});
