import { confirm } from "@inquirer/prompts";
import { insertCountriesToDB } from "../seeder/country.seeder";
import { insertRssSource } from "../seeder/rss-data.seeder";

const seeder = async () => {
  const isCountry = await confirm({
    message: "Do you want to seed the country data? (ℹ️  by default seed)",
    default: true,
  });

  const isSource = await confirm({
    message: "Do you want to seed rss sources? (ℹ️  by default seed)",
    default: true,
  });

  if (!isCountry && !isSource) {
    return console.info("🌱 No data to seed.");
  }

  if (isCountry) await insertCountriesToDB();
  if (isSource) await insertRssSource();

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
