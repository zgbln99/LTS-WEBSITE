export interface CompanyLocation {
  city: string;
  region: string;
  isHeadquarters?: boolean;
}

const locations: CompanyLocation[] = [
  { city: "Berlin", region: "Berlin/Brandenburg", isHeadquarters: true },
  { city: "Stavenhagen", region: "Mecklenburg-Vorpommern" },
  { city: "Neustrelitz", region: "Mecklenburg-Vorpommern" },
  { city: "Magdeburg", region: "Sachsen-Anhalt" },
  { city: "Hof", region: "Bayern" },
  { city: "Dresden", region: "Sachsen" },
  { city: "Erfurt", region: "Thüringen" },
  { city: "Prenzlau", region: "Brandenburg" },
  { city: "Landsberg", region: "Sachsen-Anhalt" },
  { city: "München", region: "Bayern" }
];

export const company = {
  legalName: "LTS Logistik GmbH",
  foundedYear: 2015,
  address: {
    street: "Attilastraße 26",
    zip: "12105",
    city: "Berlin",
    country: "DE"
  },
  phone: "+49 30 81 72 20 10",
  phoneHref: "tel:+493081722010",
  email: "info@ltslogistik.de",
  openingHours: "Mo bis Fr 08:00 bis 16:00 Uhr",
  stats: {
    vehicles: 260,
    employees: 200,
    locations: 10,
    foundedYear: 2015
  },
  locations,
  social: {
    facebook: "https://www.facebook.com/p/LTS-Logistik-GmbH-61556344550204/",
    linkedin: "https://de.linkedin.com/in/lts-logistik-gmbh-74063a25b"
  }
} as const;
