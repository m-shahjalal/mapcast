import z from "zod";

export const newsSourceFiltersSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  minCredibilityScore: z.coerce.number().optional(),
  baseUrl: z.string().optional(),
});

export type NewsSourceFilters = z.infer<typeof newsSourceFiltersSchema>;
