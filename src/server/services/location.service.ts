import { eq, or, sql } from "drizzle-orm";
import db from "../database";
import { country } from "../database/schemas/country.schema";
import { NewCountry } from "../database/seeder/country.seeder";

export const LocationService = {
  create: async (inputs: NewCountry[]) => {
    const results = await db.insert(country).values(inputs);
    return results.rows;
  },

  findMany: async () => {
    return await db.select().from(country);
  },

  findByName: async (name: string) => {
    return await db
      .select({
        country: {
          name: country.name,
          code: country.code,
        },
        news: sql`(
            SELECT json_agg(row_to_json(n)) 
            FROM news n 
            WHERE n.country_code = ${country.code}
          )`,
      })
      .from(country)
      .where(or(eq(country.name, name), eq(country.code, name)))
      .then((result) => result[0] || null);
  },
};
