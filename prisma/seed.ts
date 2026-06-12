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

  // Einsatzorte (Städte, in denen LTS täglich fährt)
  const serviceCities: {
    name: string;
    region: string;
    lng: number;
    lat: number;
    order: number;
  }[] = [
    { name: "Berlin", region: "Berlin/Brandenburg", lng: 13.405, lat: 52.52, order: 0 },
    { name: "Stavenhagen", region: "Mecklenburg-Vorpommern", lng: 12.911, lat: 53.703, order: 1 },
    { name: "Neustrelitz", region: "Mecklenburg-Vorpommern", lng: 13.072, lat: 53.361, order: 2 },
    { name: "Magdeburg", region: "Sachsen-Anhalt", lng: 11.627, lat: 52.131, order: 3 },
    { name: "Hof", region: "Bayern", lng: 11.918, lat: 50.313, order: 4 },
    { name: "Dresden", region: "Sachsen", lng: 13.738, lat: 51.05, order: 5 },
    { name: "Erfurt", region: "Thüringen", lng: 11.029, lat: 50.978, order: 6 },
    { name: "Prenzlau", region: "Brandenburg", lng: 13.862, lat: 53.316, order: 7 },
    { name: "Landsberg", region: "Sachsen-Anhalt", lng: 12.16, lat: 51.527, order: 8 },
    { name: "München", region: "Bayern", lng: 11.582, lat: 48.135, order: 9 }
  ];
  for (const city of serviceCities) {
    await prisma.serviceCity.upsert({
      where: { name: city.name },
      update: {},
      create: city
    });
  }

  // Beispiel-Stellenanzeigen nur beim allerersten Seed anlegen
  const jobCount = await prisma.jobPosting.count();
  if (jobCount === 0) {
    const driversCategory = await prisma.jobCategory.findUnique({
      where: { key: "drivers" }
    });
    const slugify = (value: string) =>
      value
        .toLowerCase()
        .replace(/[ąàäâ]/g, "a")
        .replace(/[ćç]/g, "c")
        .replace(/[ęéè]/g, "e")
        .replace(/ł/g, "l")
        .replace(/[ńñ]/g, "n")
        .replace(/[óöô]/g, "o")
        .replace(/[śş]/g, "s")
        .replace(/[żźž]/g, "z")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

    const offers = [
      {
        title: "Kierowca C+E | Dachser Schönefeld | 2600€ Netto | 1-4 punkty",
        location: "Schönefeld (Berlin)",
        system: "Pełny etat",
        salaryMin: 2600,
        salaryMax: 2600
      },
      {
        title:
          "Kierowca C+E | Dachser Schönefeld (Berlin) | Codzienne Powroty | 2600€ Netto | 7-10 punktów",
        location: "Schönefeld (Berlin)",
        system: "Bez systemu - tylko pełen etat",
        salaryMin: 2600,
        salaryMax: 2600
      },
      {
        title:
          "Kierowca C+E Chłodnia DE | Lokalna Dystrybucja Netto | Codzienne Powroty | 2/1 lub bez systemu",
        location: "Thiendorf (okolice Drezna)",
        system: "2/1 lub bez systemu",
        salaryMin: 1900,
        salaryMax: 3215
      },
      {
        title:
          "Kierowca C+E | Raben Ragow | Dniówki | Codzienne Powroty | 2500€ Netto",
        location: "Ragow/Mittenwalde (Brandenburgia)",
        system: "Bez systemu - tylko pełen etat",
        salaryMin: 2500,
        salaryMax: 2500
      },
      {
        title: "Kierowca C+E ADR | Linia Nocna | Prosta Praca | 2600€ Netto",
        location: "Berlin/Mittenwalde",
        system: "Pełny etat",
        salaryMin: 2600,
        salaryMax: 2600
      }
    ];

    for (const offer of offers) {
      await prisma.jobPosting.create({
        data: {
          categoryId: driversCategory!.id,
          locationCity: offer.location,
          country: "Niemcy",
          licenseCategory: "C+E",
          workSystem: offer.system,
          salaryMin: offer.salaryMin,
          salaryMax: offer.salaryMax,
          salaryNote: "Netto",
          status: "PUBLISHED",
          publishedAt: new Date(),
          translations: {
            create: {
              locale: "de",
              title: offer.title,
              slug: slugify(offer.title),
              description:
                "Stabilna praca u niemieckiego przewoźnika LTS Logistik. Jeździmy jako stały podwykonawca dużych sieci logistycznych. Szczegóły trasy, systemu pracy i wynagrodzenia omówimy podczas krótkiej rozmowy telefonicznej.",
              requirements: [
                "Prawo jazdy kat. C+E z kodem 95",
                "Karta kierowcy",
                "Podstawowa komunikacja po niemiecku, angielsku, polsku, turecku lub ukraińsku"
              ],
              benefits: [
                "Terminowa wypłata na konto",
                "Nowoczesne, serwisowane ciągniki",
                "Stałe trasy i przewidywalny grafik"
              ]
            }
          }
        }
      });
    }
    console.log(`${offers.length} Beispiel-Stellenanzeigen angelegt.`);
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
