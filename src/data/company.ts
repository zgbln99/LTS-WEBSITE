export interface CompanyLocation {
  city: string;
  region: string;
  /** [Längengrad, Breitengrad] für die Kartenmarkierung */
  lngLat: [number, number];
  isHeadquarters?: boolean;
}

// Zentrale Standortliste: speist die Standort-Listen auf der Website UND die
// Kartenmarkierungen. Neue Standorte nur hier ergänzen.
const locations: CompanyLocation[] = [
  { city: "Berlin", region: "Berlin/Brandenburg", lngLat: [13.405, 52.52], isHeadquarters: true },
  { city: "Stavenhagen", region: "Mecklenburg-Vorpommern", lngLat: [12.911, 53.703] },
  { city: "Neustrelitz", region: "Mecklenburg-Vorpommern", lngLat: [13.072, 53.361] },
  { city: "Magdeburg", region: "Sachsen-Anhalt", lngLat: [11.627, 52.131] },
  { city: "Hof", region: "Bayern", lngLat: [11.918, 50.313] },
  { city: "Dresden", region: "Sachsen", lngLat: [13.738, 51.05] },
  { city: "Erfurt", region: "Thüringen", lngLat: [11.029, 50.978] },
  { city: "Prenzlau", region: "Brandenburg", lngLat: [13.862, 53.316] },
  { city: "Landsberg", region: "Sachsen-Anhalt", lngLat: [12.16, 51.527] },
  { city: "München", region: "Bayern", lngLat: [11.582, 48.135] }
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
