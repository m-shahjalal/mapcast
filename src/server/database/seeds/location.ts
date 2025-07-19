import db from "..";
import {
  cities,
  countries,
  regions,
  states,
  subregions,
} from "../../schemas/location.schema";

const API_BASE =
  "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/";

const fetchData = async (endpoint: string) =>
  fetch(`${API_BASE}${endpoint}.json`).then((res) => res.json());

const insertInChunks = async (table: any, data: any[], chunkSize = 1000) => {
  for (let i = 0; i < data.length; i += chunkSize) {
    await db
      .insert(table)
      .values(data.slice(i, i + chunkSize))
      .onConflictDoNothing();
  }
};

const createMap = (items: any[], keyField: string, valueField = "id") =>
  new Map(items.map((item) => [item[keyField], item[valueField]]));

export async function seedLocation() {
  console.log("📍 Location Seeding started...");

  try {
    const regionData = await fetchData("regions");
    await db
      .insert(regions)
      .values(
        regionData.map(({ name, translations, wikiDataId }: any) => ({
          name,
          translations,
          wikiDataId,
        }))
      )
      .onConflictDoNothing();

    const regionMap = createMap(await db.select().from(regions), "name");

    const subregionData = await fetchData("subregions");
    const subregionInsertData = subregionData
      .map(({ name, translations, wikiDataId, region }: any) => {
        const regionId = regionMap.get(region);
        return regionId ? { name, translations, wikiDataId, regionId } : null;
      })
      .filter(Boolean);

    if (subregionInsertData.length) {
      await db
        .insert(subregions)
        .values(subregionInsertData)
        .onConflictDoNothing();
    }

    const subregionMap = createMap(await db.select().from(subregions), "name");

    const countryData = await fetchData("countries");
    const countryInsertData = countryData.map((c: any) => ({
      name: c.name,
      iso3: c.iso3,
      iso2: c.iso2,
      numericCode: c.numeric_code,
      phoneCode: c.phone_code,
      capital: c.capital,
      currency: c.currency,
      currencyName: c.currency_name,
      currencySymbol: c.currency_symbol,
      tld: c.tld,
      native: c.native,
      region: c.region,
      subregion: c.subregion,
      latitude: c.latitude,
      longitude: c.longitude,
      emoji: c.emoji,
      emojiU: c.emojiU,
      timezones: c.timezones,
      translations: c.translations,
      wikiDataId: c.wikiDataId,
      regionId: regionMap.get(c.region) || null,
      subregionId: subregionMap.get(c.subregion) || null,
    }));

    await db.insert(countries).values(countryInsertData).onConflictDoNothing();

    const countryMap = createMap(await db.select().from(countries), "iso2");

    // States
    const stateData = await fetchData("states");
    const stateInsertData = stateData
      .map(
        ({
          name,
          country_code,
          fips_code,
          iso2,
          type,
          latitude,
          longitude,
          wikiDataId,
        }: any) => {
          const countryId = countryMap.get(country_code);
          return countryId
            ? {
                name,
                countryCode: country_code,
                fipsCode: fips_code,
                iso2,
                type,
                latitude,
                longitude,
                wikiDataId,
                countryId,
              }
            : null;
        }
      )
      .filter(Boolean);

    if (stateInsertData.length) {
      await insertInChunks(states, stateInsertData);
    }

    const stateMap = createMap(await db.select().from(states), "name", "id");

    // Cities
    const cityData = await fetchData("cities");
    const cityInsertData = cityData
      .map(
        ({
          name,
          state_name,
          country_code,
          state_code,
          latitude,
          longitude,
          wikiDataId,
        }: any) => {
          const countryId = countryMap.get(country_code);
          const stateId = stateMap.get(state_name);
          return stateId && countryId
            ? {
                name,
                stateCode: state_code,
                countryCode: country_code,
                latitude,
                longitude,
                wikiDataId,
                stateId,
                countryId,
              }
            : null;
        }
      )
      .filter(Boolean);

    if (cityInsertData.length) {
      await insertInChunks(cities, cityInsertData);
    }

    console.log("📍Location Seeding completed!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}
