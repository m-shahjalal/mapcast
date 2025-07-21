import { confirm } from "@inquirer/prompts";

const seeder = async () => {
  const isDummy = await confirm({
    message: "Do you want to seed the dummy data?",
    default: false,
  });

  const isCountry = await confirm({
    message: "Do you want to seed the country data?",
    default: false,
  });

  if (!isDummy && !isCountry) {
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
