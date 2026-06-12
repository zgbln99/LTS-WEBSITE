import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const languages = [
  { code: "de", name: "Deutsch", isDefault: true, order: 0 },
  { code: "en", name: "English", isDefault: false, order: 1 },
  { code: "pl", name: "Polski", isDefault: false, order: 2 },
  { code: "tr", name: "Türkçe", isDefault: false, order: 3 },
  { code: "uk", name: "Українська", isDefault: false, order: 4 }
];

const jobCategories = [
  { key: "drivers", order: 0 },
  { key: "dispatchers", order: 1 },
  { key: "office", order: 2 },
  { key: "logistics", order: 3 },
  { key: "warehouse", order: 4 }
];

const vehicleCategories = [
  { key: "transporter", order: 0 },
  { key: "lkw12t", order: 1 },
  { key: "sattelzug", order: 2 },
  { key: "kuehlfahrzeug", order: 3 },
  { key: "spezial", order: 4 }
];

async function main() {
  for (const language of languages) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: language,
      create: language
    });
  }

  for (const category of jobCategories) {
    await prisma.jobCategory.upsert({
      where: { key: category.key },
      update: { order: category.order },
      create: category
    });
  }

  for (const category of vehicleCategories) {
    await prisma.vehicleCategory.upsert({
      where: { key: category.key },
      update: { order: category.order },
      create: category
    });
  }

  console.log("Seed abgeschlossen: Sprachen, Job- und Fahrzeugkategorien.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
