import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

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

  // Admin-Benutzer aus Umgebungsvariablen anlegen
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminPassword.length >= 8) {
    const passwordHash = await hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash,
        name: process.env.ADMIN_NAME ?? "Administrator",
        role: "SUPER_ADMIN"
      }
    });
    console.log(`Admin-Benutzer ${adminEmail} angelegt bzw. vorhanden.`);
  } else {
    console.log(
      "Hinweis: ADMIN_EMAIL und ADMIN_PASSWORD (mind. 8 Zeichen) setzen, um den Admin-Benutzer anzulegen."
    );
  }

  console.log("Seed abgeschlossen: Sprachen, Job- und Fahrzeugkategorien.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
