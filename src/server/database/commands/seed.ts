import { LocationService } from "@/server/services/location.service";
import { countries } from "@/utils/dropdown-list";
import { confirm } from "@inquirer/prompts";
import geoJsonData from "../seeder/countries-with-boundaries.json";
import { CountryConverter } from "../seeder/country.seeder";

const seeder = async () => {
  const isCountry = await confirm({
    message: "Do you want to seed the country data?",
    default: false,
  });

  const converter = new CountryConverter(countries);

  const validation = converter.validateGeoJsonData(geoJsonData);
  if (!validation.isValid || !validation.data) {
    console.error("GeoJSON validation failed:", validation.errors);
    process.exit(1);
  }

  const convertedCountries = converter.convert(validation.data, {
    filterByFlags: true,
    debug: true,
    includeInvalidGeometries: false,
  });
  console.info(`Successfully converted ${convertedCountries.length} countries`);

  await LocationService.create(convertedCountries).catch(console.error);

  if (!isCountry) {
    console.info("🌱 No data to seed.");
    return;
  }

  console.info("🌱 Starting database seeding...");
  if (isCountry) {
    console.info("🌱 Seeding country data...");
  }
};

seeder()
  .then(() => {
    console.info("🌱 Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
