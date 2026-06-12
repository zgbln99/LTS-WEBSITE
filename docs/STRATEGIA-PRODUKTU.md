# LTS Logistik GmbH – Strategia produktu i architektura platformy cyfrowej 2025/2026

Status: do akceptacji
Wersja: 1.0
Zakres: pełna strategia przed rozpoczęciem implementacji

---

## 1. Analiza wymagań biznesowych

### 1.1 Profil firmy (stan faktyczny, źródło: ltslogistik.de i rejestry)

| Fakt | Wartość |
|---|---|
| Nazwa | LTS Logistik GmbH |
| Siedziba | Attilastraße 26, 12105 Berlin |
| Założenie | styczeń 2015 (start w branży KEP: kurier, ekspres, paczka) |
| Flota | ponad 260 pojazdów: Transporter, 12-Tonner, Sattelzüge, Spezialfahrzeuge |
| Zatrudnienie | ponad 200 pracowników |
| Kompetencja kluczowa | europejski transport chłodniczy świeżej żywności |
| Usługi dodatkowe | usuwanie odpadów w Berlinie (Müllwagen, Absetzkipper, Abrollkipper) |
| Oddziały | Berlin/Brandenburg, Stavenhagen, Magdeburg, Neustrelitz, Hof |
| Ekspansja | Dresden, Landsberg, Erfurt, Prenzlau, München |
| Kontakt | +49 30 81 72 20 10, info@ltslogistik.de, pon–pt 08:00–16:00 |

### 1.2 Grupy docelowe i ich cele

1. **Klienci B2B (dysponenci, kierownicy logistyki, zakupy)**
   Cel: szybka weryfikacja wiarygodności, wysłanie zapytania transportowego, kontakt z konkretnym działem.
   Kluczowe strony: usługi, flota, referencje, zapytanie transportowe.
2. **Kandydaci do pracy, przede wszystkim kierowcy CE/C1**
   Cel: zobaczyć warunki, widełki płacowe, złożyć aplikację z telefonu w mniej niż 3 minuty.
   Kluczowe strony: landing dla kierowców, oferty pracy, formularz aplikacyjny z uploadem CV i prawa jazdy.
3. **Partnerzy i podwykonawcy**
   Cel: poznać zasięg, standardy i osoby kontaktowe.
4. **Administratorzy wewnętrzni (HR, marketing, dyspozycja)**
   Cel: zarządzać treścią, rekrutacją i zapytaniami bez udziału programisty.

### 1.3 Cele biznesowe platformy i KPI

| Cel | KPI | Wartość docelowa (12 mies.) |
|---|---|---|
| Pozyskiwanie zapytań transportowych | liczba zapytań/mies. | wzrost o 100% |
| Rekrutacja kierowców | aplikacje/mies., koszt aplikacji | 50+ aplikacji/mies. |
| Widoczność SEO w Niemczech | top 10 dla fraz usługowych regionalnych | 20+ fraz |
| Wydajność | Lighthouse mobile | powyżej 95 |
| Skalowalność | gotowość API pod portal klienta i aplikację mobilną | architektura API-first |

### 1.4 Pozycjonowanie marki

Komunikat nadrzędny: nowoczesna, technologiczna firma logistyczna z Berlina, która w 10 lat zbudowała flotę ponad 260 pojazdów i obsługuje całą Europę, ze szczególną siłą w transporcie chłodniczym.

Ton komunikacji: profesjonalny, konkretny, pewny siebie, bez korporacyjnej biurokracji i bez startupowego przechwalania. Liczby zamiast przymiotników.

Przykład nagłówka hero (DE):
"Über 260 Fahrzeuge. Ganz Europa. Ein Ansprechpartner."
Podtytuł: "LTS Logistik bewegt seit 2015 Waren zuverlässig durch Deutschland und Europa. Vom Expresskurier bis zum temperaturgeführten Sattelzug."

---

## 2. Analiza konkurencji

### 2.1 Konkurenci bezpośredni (średnie spedycje DE)

Typowy obraz rynku: strony oparte o WordPress z motywami z lat 2015–2019, brak wersji językowych poza DE/EN, brak systemu zapytań online, rekrutacja przez PDF lub e-mail, słaba wydajność mobilna. To realna przewaga do zdobycia.

### 2.2 Wzorce klasy premium (benchmark jakości, nie kopiowania)

| Firma | Co robią dobrze | Co przejmujemy jako standard |
|---|---|---|
| sennder.com | ciemne sekcje premium, duża typografia, klarowne CTA | hierarchia typograficzna, sekcje dark/light |
| uberfreight.com | architektura informacji per persona (shipper/carrier) | rozdzielenie ścieżek klient vs kierowca |
| dachser.com, dbschenker.com | wielojęzyczność enterprise, struktury SEO usług | landing pages usługowe, hreflang |
| girteka.eu | rekrutacja kierowców jako produkt | dedykowany funnel kierowcy z widełkami |
| stripe.com, linear.app, vercel.com | design system, animacje, performance | tokeny, motion design, Lighthouse 95+ |

### 2.3 Wnioski

1. Nikt w segmencie średnich spedycji DE nie ma rekrutacji kierowców na poziomie e-commerce. To największa szansa konwersyjna.
2. Formularz zapytania transportowego online z natychmiastowym potwierdzeniem to wyróżnik wobec "zadzwoń do nas".
3. Pięć języków (DE, EN, PL, TR, UK) odpowiada realnej strukturze rynku pracy kierowców w Niemczech i daje przewagę rekrutacyjną.

---

## 3. Architektura techniczna

### 3.1 Stack (potwierdzenie rekomendacji z briefu)

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| Framework | Next.js 15 (App Router, RSC, Server Actions) | full-stack, SEO, performance, jeden deployment |
| Język | TypeScript (strict) | bezpieczeństwo typów end-to-end |
| Stylowanie | Tailwind CSS 4 + shadcn/ui | design system na tokenach, pełna kontrola |
| Animacje | Framer Motion (motion) | scroll reveal, page transitions, micro-interactions |
| i18n | next-intl | localized routes, metadata, middleware detekcji języka |
| Baza danych | PostgreSQL 16 + Prisma | relacyjna struktura tłumaczeń, migracje |
| Auth | Auth.js v5 (credentials + opcjonalnie passkeys) | RBAC dla panelu admina |
| Pliki | S3 API (AWS S3 lub MinIO), presigned URLs | CV, dokumenty, media library |
| E-mail | Resend + react-email | potwierdzenia, notyfikacje, szablony brandowe |
| Mapy | Mapbox GL JS | interaktywna mapa Europy, custom styling |
| Walidacja | Zod (współdzielone schematy klient/serwer) | spójna walidacja formularzy i API |
| Rate limiting | middleware + sliding window w Postgres/Redis | ochrona formularzy i API |
| Deployment | Docker (multi-stage) + Coolify na Hetzner | koszt/wydajność, EU data residency (RODO) |
| CI | GitHub Actions: lint, typecheck, test, build | jakość każdego PR |

### 3.2 Zasada API-first

Cała logika domenowa w warstwie serwisów (`src/server/services`), wystawiona równolegle przez:

1. Server Actions (formularze webowe),
2. REST API `/api/v1/*` (przyszła aplikacja mobilna, portal klienta),
3. wspólne schematy Zod jako kontrakt.

Endpointy wersjonowane, odpowiedzi w standardzie `{ data, error, meta }`. W przyszłości generowany OpenAPI.

### 3.3 Struktura projektu

```
src/
  app/
    [locale]/                 # strony publiczne (de, en, pl, tr, uk)
      (marketing)/            # home, unternehmen, leistungen, fuhrpark, wissen, kontakt
      karriere/
      transportanfrage/
    admin/                    # panel administracyjny (bez prefiksu językowego, UI: DE)
    api/v1/                   # publiczne API
  components/
    ui/                       # shadcn/ui + rozszerzenia (design system)
    sections/                 # hero, stats, services, map, testimonials...
    forms/
    admin/
  server/
    services/                 # logika domenowa (inquiry, application, content...)
    auth/
    db.ts
  i18n/                       # konfiguracja next-intl, słowniki, pathnames
  lib/                        # utils, seo, schema.org, s3, email
  emails/                     # szablony react-email
prisma/
  schema.prisma
  seed.ts
```

### 3.4 Internacjonalizacja (architektura)

1. URL: `/de`, `/en`, `/pl`, `/tr`, `/uk`; niemiecki jako domyślny.
2. Zlokalizowane slugi tras przez `pathnames` next-intl, np. `/de/leistungen/kuehltransporte` = `/en/services/refrigerated-transport` = `/pl/uslugi/transport-chlodniczy`.
3. Treści statyczne UI: słowniki JSON per język. Treści dynamiczne (usługi, oferty pracy, artykuły, FAQ, testimoniale, SEO): tabele `*Translation` w bazie z kluczem `(entityId, locale)`.
4. Tabela `Language` w bazie umożliwia dodanie kolejnych języków bez migracji.
5. hreflang + `x-default`, sitemap per język, structured data per język.
6. Detekcja języka: nagłówek Accept-Language przy pierwszym wejściu, potem cookie; przełącznik języka zachowuje aktualną podstronę.
7. Czcionki z pełnym pokryciem Latin Extended (PL, TR) i cyrylicy (UK).

---

## 4. Sitemapa (struktura DE, slugi lokalizowane per język)

```
/de                                        Startseite
/de/unternehmen                            Über uns (Geschichte, Timeline, Werte,
                                           Management, Zertifizierungen, Standorte)
/de/leistungen                             Übersicht aller Leistungen
/de/leistungen/nationale-transporte
/de/leistungen/internationale-transporte
/de/leistungen/expresstransporte
/de/leistungen/kuehltransporte             (strona flagowa, kompetencja kluczowa)
/de/leistungen/spedition
/de/leistungen/dedizierte-transporte
/de/leistungen/kontraktlogistik
/de/leistungen/entsorgung                  (opcjonalnie, do decyzji klienta)
/de/fuhrpark                               Flota: kategorie, specyfikacje, galerie, filtry
/de/karriere                               Portal rekrutacyjny: lista ofert + filtry
/de/karriere/[slug]                        Pojedyncza oferta + formularz aplikacyjny
/de/karriere/lkw-fahrer                    Landing rekrutacyjny dla kierowców (funnel)
/de/wissen                                 Wissenszentrum: kategorie, tagi, szukajka
/de/wissen/[kategorie]/[slug]              Artykuł
/de/transportanfrage                       System zapytań transportowych (multi-step)
/de/kontakt                                Formularze, lokalizacje, mapa, działy, osoby
/de/impressum  /de/datenschutz  /de/agb    Strony prawne
```

Każda strona usługowa zawiera: hero, korzyści, proces krok po kroku, sekcję floty, FAQ, CTA oraz formularz zapytania z pre-wypełnionym typem usługi.

---

## 5. Struktura bazy danych (Prisma, skrót modeli)

Wzorzec tłumaczeń: encja bazowa przechowuje dane niezależne od języka, tabela `*Translation` przechowuje pola językowe wraz z metadanymi SEO, z unikalnym kluczem `(entityId, locale)`.

```prisma
// Użytkownicy i uprawnienia
model User           { id, email, passwordHash, name, role Role, isActive, lastLoginAt, ... }
enum  Role           { SUPER_ADMIN, HR, MARKETING, EDITOR }
model AuditLog       { id, userId, action, entityType, entityId, payload Json, createdAt }

// Języki i treści
model Language       { code @id, name, isDefault, isActive }
model Page           { id, key @unique, status, translations PageTranslation[] }
model PageTranslation{ id, pageId, locale, title, slug, content Json, seo... @@unique([pageId, locale]) }
model Service        { id, key, icon, order, heroImageId, translations ServiceTranslation[], faqs FAQ[] }
model ServiceTranslation { serviceId, locale, name, slug, excerpt, benefits Json, processSteps Json, seo... }

// Flota
model VehicleCategory{ id, key, order, translations VehicleCategoryTranslation[] }
model Vehicle        { id, categoryId, model, payloadKg, volumeM3, lengthM, features Json,
                       temperatureControlled, images MediaAsset[] }

// Rekrutacja
model JobCategory    { id, key, translations JobCategoryTranslation[] }
model JobPosting     { id, categoryId, locationCity, employmentType, salaryMin, salaryMax,
                       salaryCurrency, status, publishedAt, validThrough,
                       translations JobPostingTranslation[] }
model Application    { id, jobPostingId, firstName, lastName, email, phone, message,
                       status ApplicationStatus, gdprConsentAt, source, files ApplicationFile[],
                       notes ApplicationNote[], activities ApplicationActivity[] }
enum  ApplicationStatus { NEW, REVIEWED, INTERVIEW, REJECTED, HIRED }
model ApplicationFile{ id, applicationId, type (CV|LICENSE|CERTIFICATE), s3Key, fileName,
                       mimeType, sizeBytes, virusScanStatus }

// Wissenszentrum
model BlogPost       { id, authorId, categoryId, heroImageId, status, publishedAt,
                       translations BlogPostTranslation[], tags Tag[] }
model BlogCategory   { id, key, translations ... }
model Tag            { id, key, translations ... }
model Author         { id, name, role, avatarId, bio }

// Treści zarządzane
model Testimonial    { id, authorName, authorCompany, authorRole, rating, order, isPublished,
                       translations TestimonialTranslation[] }
model FAQ            { id, serviceId?, category, order, isPublished, translations FAQTranslation[] }

// Formularze przychodzące
model ContactRequest { id, name, email, phone, department, message, locale, status,
                       consentAt, ipHash, createdAt }
model TransportRequest { id, company, contactName, email, phone,
                       pickupAddress, pickupCountry, deliveryAddress, deliveryCountry,
                       cargoType, palletCount, weightKg, lengthM, widthM, heightM,
                       temperatureMin, temperatureMax, requestedDate, message,
                       status, locale, consentAt, createdAt }
model NewsletterSubscriber { id, email, locale, confirmedAt, unsubscribedAt, token }

// Media i SEO
model MediaAsset     { id, s3Key, fileName, mimeType, sizeBytes, width, height, alt Json,
                       folder, uploadedById, createdAt }
model SeoDefault     { id, locale, siteTitle, titleTemplate, description, ogImageId }
model Redirect       { id, fromPath, toPath, statusCode }
```

Pełny schemat (ok. 30 modeli z relacjami, indeksami i kaskadami) powstanie w fazie 1 implementacji. Wszystkie pola tekstowe widoczne dla użytkownika są tłumaczalne; struktura wspiera nieograniczoną liczbę języków.

---

## 6. Design system

### 6.1 Kierunek wizualny

Inspiracja jakościowa: załączony layout (duże zaokrąglone kontenery, ciemne sekcje premium, karty warstwowe) oraz Stripe, Linear, Vercel, sennder. Projekt oryginalny dla LTS, nie kopia.

Charakter: cinematic dark + czyste jasne sekcje, duża fotografia floty i tras, subtelny glassmorphism w nawigacji i kartach statystyk, wyraźny akcent kolorystyczny na CTA.

### 6.2 Tokeny (propozycja, do potwierdzenia z CI firmy)

| Token | Wartość | Zastosowanie |
|---|---|---|
| `--background-dark` | #0B0F1A (głęboki granat-antracyt) | sekcje premium, stopka, hero |
| `--background-light` | #F7F8FA | sekcje jasne |
| `--surface` | #FFFFFF / #111827 | karty |
| `--accent` | #FF4D1C (sygnałowy pomarańcz logistyczny) | CTA, akcenty, hover |
| `--accent-secondary` | #2EE6A8 (zieleń statystyk) | liczby, wskaźniki wzrostu |
| `--text-primary` | #0B0F1A / #F7F8FA | tekst |
| Radius | 12 / 20 / 28 / 36 px | inputy / karty / sekcje / hero |
| Cienie | 3 poziomy, miękkie, niskokontrastowe | karty, modale |
| Spacing | skala 4 px, sekcje 96–160 px desktop, 64–96 px mobile | rytm pionowy |

### 6.3 Typografia

* Nagłówki: **Manrope** (variable, Latin Extended + cyrylica, geometryczny charakter premium)
* Tekst: **Inter** (variable, pełne pokrycie znaków DE/EN/PL/TR/UK)
* Skala: clamp() fluid, h1 40–72 px, body 16–18 px, tracking nagłówków -0.02em

### 6.4 Motion design

* Wejścia sekcji: fade + translateY 24 px, stagger 80 ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`
* Liczniki statystyk animowane przy wejściu w viewport
* Hover kart: scale 1.02 + przesunięcie cienia, 200 ms
* Hero: wolny zoom wideo (Ken Burns), parallax delikatny
* `prefers-reduced-motion` respektowane globalnie

### 6.5 Biblioteka komponentów

Warstwa 1 (shadcn/ui, ostylowane tokenami): Button, Input, Select, Textarea, Checkbox, RadioGroup, Form, Card, Table, Dialog, Drawer, Sheet, Tabs, Accordion, Badge, Toast, Skeleton, Pagination, Command (szukajka).

Warstwa 2 (domenowe): HeroSection, VideoHero, StatBar, StatCard, ServiceCard, ServiceGrid, FleetCard, FleetFilter, JobCard, JobFilter, ApplicationForm, FileDropzone, TransportInquiryWizard, EuropeMap, TestimonialCarousel, PartnerLogoMarquee, FAQAccordion (z szukajką), ArticleCard, AuthorBadge, LanguageSwitcher, CookieConsent, SectionHeading, CTABanner, LocationCard, TimelineItem, BreadcrumbNav.

Warstwa 3 (admin): DataTable z filtrami i eksportem, KanbanBoard (rekrutacja), TranslationTabs, MediaPicker, SeoFieldset, RichTextEditor (Tiptap), StatusBadge, ActivityFeed, NotesPanel, FilePreview, DashboardStatGrid.

---

## 7. Kluczowe przepływy UX

### 7.1 Zapytanie transportowe (multi-step wizard, mobile-first)

```
Krok 1: Trasa        odbiór (adres + kraj), dostawa (adres + kraj), data
Krok 2: Ładunek      typ ładunku, palety, waga, wymiary, wymagania temperaturowe
Krok 3: Kontakt      firma, osoba, e-mail, telefon, wiadomość, zgoda RODO
Potwierdzenie:       numer zapytania, czas reakcji "w ciągu 2 godzin roboczych",
                     e-mail potwierdzający do klienta, notyfikacja do dyspozycji,
                     rekord w panelu admina ze statusem NEW
```

Pasek postępu, walidacja per krok, zapis stanu w sessionStorage, honeypot + rate limiting.

### 7.2 Aplikacja o pracę (cel: poniżej 3 minut na telefonie)

```
Oferta pracy -> "Jetzt bewerben" -> formularz jednostronicowy:
dane osobowe, upload CV / prawa jazdy / certyfikatów (drag&drop, do 10 MB/plik,
PDF/JPG/PNG, presigned upload do S3), zgoda RODO ->
potwierdzenie e-mail do kandydata -> notyfikacja HR -> kandydat w pipeline NEW
```

Landing `/karriere/lkw-fahrer`: hero z wideo, widełki płacowe, benefity, opinie kierowców, FAQ, skrócony formularz "Bewerbung in 60 Sekunden" (imię, telefon, kategoria prawa jazdy) jako wariant niskiego progu.

### 7.3 Rekrutacja w panelu admina (HR)

```
Dashboard -> Bewerbungen -> Kanban: New / Reviewed / Interview / Rejected / Hired
drag&drop między statusami -> karta kandydata: podgląd plików (PDF viewer),
notatki zespołu, historia komunikacji, log aktywności, wysyłka e-maila z szablonu
```

### 7.4 Zarządzanie treścią wielojęzyczną

```
Edycja usługi -> zakładki językowe DE | EN | PL | TR | UK ->
wskaźnik kompletności tłumaczenia per język -> SEO fieldset per język ->
podgląd na żywo -> publikacja per język
```

---

## 8. Panel administracyjny

### 8.1 Role i uprawnienia (RBAC)

| Moduł | Super Admin | HR | Marketing | Editor |
|---|---|---|---|---|
| Dashboard | pełny | rekrutacja | treści + statystyki | treści |
| Zapytania transportowe | tak | nie | odczyt | nie |
| Aplikacje / rekrutacja | tak | tak | nie | nie |
| Strony, usługi, flota | tak | nie | tak | tak |
| Wissenszentrum, FAQ, testimoniale | tak | nie | tak | tak |
| Media Library | tak | odczyt | tak | tak |
| SEO / przekierowania | tak | nie | tak | nie |
| Użytkownicy i role | tak | nie | nie | nie |
| Audit Log | tak | nie | nie | nie |

### 8.2 Struktura nawigacji panelu

```
Dashboard            zapytania (nowe/tydzień), aplikacje per status, ostatnia aktywność,
                     skróty, statystyki ruchu (integracja Matomo/GA)
Anfragen             zapytania transportowe + kontaktowe, statusy, filtry, eksport CSV
Bewerbungen          kanban + lista, karta kandydata, notatki, pliki, historia
Stellenanzeigen      CRUD ofert pracy, tłumaczenia, JobPosting schema, ważność
Inhalte              Seiten / Leistungen / Fuhrpark / Wissenszentrum / FAQ / Testimonials
Medien               biblioteka S3, foldery, alt-teksty per język, podgląd
Newsletter           subskrybenci, eksport
SEO                  metadane domyślne, przekierowania, podgląd sitemap
Einstellungen        języki, użytkownicy, role, dane firmy, audit log
```

---

## 9. SEO i dane strukturalne

1. **Technika**: SSR/SSG per strona, canonical, hreflang z x-default, sitemap index z sitemapami per język, robots.txt, obrazy AVIF/WebP z `next/image`, Core Web Vitals jako budżet CI.
2. **Schema.org**: `LocalBusiness` + `MovingCompany`/`Organization` z oddziałami, `Service` per strona usługowa, `JobPosting` per oferta (Google for Jobs), `FAQPage`, `BreadcrumbList`, `Article` w Wissenszentrum.
3. **Strategia treści DE**: frazy typu "Kühltransporte Berlin", "Spedition Berlin Brandenburg", "Expresstransport Deutschland", "LKW Fahrer Jobs Berlin" + artykuły poradnikowe w Wissenszentrum.
4. **Open Graph / Twitter Cards**: generowane obrazy OG per strona (dynamiczne, brandowane).
5. **Analityka**: warstwa zgód (cookie consent, RODO) sterująca ładowaniem GA4, Matomo, Meta Pixel; Search Console od dnia premiery.

---

## 10. Bezpieczeństwo i RODO

* RBAC w middleware + weryfikacja uprawnień w warstwie serwisów (nie tylko UI)
* Rate limiting na formularzach i API (sliding window, klucz: IP hash + endpoint)
* Upload: presigned URLs, walidacja MIME i rozmiaru po stronie serwera, skan plików, prywatny bucket, dostęp tylko przez podpisane linki
* CSRF: Server Actions z origin check, SameSite cookies
* Walidacja wejścia: Zod na każdej granicy (formularz, API, webhook)
* RODO: zgody z timestampem, polityka retencji aplikacji (np. 6 miesięcy, potem anonimizacja), prawo do usunięcia, IP przechowywane wyłącznie jako hash, hosting w UE (Hetzner), DPA z Resend/Mapbox
* Audit log wszystkich operacji zapisu w panelu
* Nagłówki bezpieczeństwa: CSP, HSTS, X-Frame-Options, Referrer-Policy

---

## 11. Plan implementacji (fazy)

| Faza | Zakres | Efekt |
|---|---|---|
| 1. Fundament | scaffold Next.js 15, Tailwind, shadcn, next-intl, Prisma schema + migracje + seed, Auth.js, Docker, CI | działający szkielet z i18n i bazą |
| 2. Design system | tokeny, typografia, komponenty warstwy 1 i 2, motion | biblioteka UI |
| 3. Strony publiczne | home, unternehmen, leistungen (7 stron), fuhrpark, kontakt, strony prawne, treści DE + 4 języki | kompletny serwis publiczny |
| 4. Formularze i integracje | zapytanie transportowe, formularz kontaktowy, Resend, Mapbox, newsletter | generowanie leadów |
| 5. Rekrutacja | portal karriere, landing kierowcy, aplikacje z uploadem S3, e-maile | funnel rekrutacyjny |
| 6. Panel admina | dashboard, moduły treści, rekrutacja kanban, media, SEO, role | samodzielne zarządzanie |
| 7. Wissenszentrum + SEO finalne | artykuły, kategorie, szukajka, structured data, sitemapy, OG images | pełne SEO |
| 8. QA i launch | Lighthouse 95+, testy E2E krytycznych ścieżek, a11y, RODO checklist | gotowość produkcyjna |

### Roadmapa po starcie (architektura już przygotowana)

Portal klienta z trackingiem przesyłek, portal kierowcy, aplikacja mobilna (to samo API v1), portal partnerski, wymiana dokumentów, faktury.

---

## 12. Pytania otwarte do klienta

1. **Corporate Identity**: czy istnieje logo/księga znaku LTS z kolorami firmowymi? Zaproponowany akcent pomarańczowy dostosujemy do CI.
2. **Usługa Entsorgung** (wywóz odpadów w Berlinie): czy ma być pełnoprawną stroną usługową, czy zostaje poza nowym serwisem?
3. **Materiały**: czy są dostępne zdjęcia/wideo floty? Do czasu dostarczenia użyjemy wysokiej klasy materiałów stockowych jako placeholderów z jasnym oznaczeniem do wymiany.
4. **Hosting**: potwierdzenie Hetzner + Coolify (rekomendacja: koszt, RODO, wydajność) czy AWS?
5. **Widełki płacowe** w ofertach pracy: publikujemy realne zakresy (rekomendowane dla konwersji) czy "nach Vereinbarung"?
6. **Treści referencji**: czy są zgody klientów na publikację nazw firm w testimonialach?
