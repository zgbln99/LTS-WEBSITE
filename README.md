# LTS Logistik GmbH – Digitale Plattform

Premium-Webplattform für LTS Logistik GmbH (Berlin): mehrsprachige Unternehmenswebsite, Transportanfrage-System, Recruiting-Portal, Wissenszentrum und Admin-Panel.

## Status

Phase 1 bis 3 (Fundament, Design System, öffentliche Website) sind umgesetzt:

- Next.js 15 mit App Router, TypeScript strict, Tailwind CSS 4
- Mehrsprachigkeit (DE, EN, PL, TR, UK) mit lokalisierten URLs, hreflang und übersetzter Sitemap
- Startseite, Unternehmen, 8 Leistungsseiten, Fuhrpark, Karriere, Fahrer-Landingpage, Wissenszentrum, Kontakt, Transportanfrage, Impressum, Datenschutz
- Vollständiges Prisma-Schema (PostgreSQL) inkl. Übersetzungsarchitektur, Recruiting und Anfragen
- Schema.org (LocalBusiness, Service, FAQPage, BreadcrumbList), robots.txt, sitemap.xml
- Dockerfile (standalone) und GitHub Actions CI

Nächste Phasen: Formulare mit Datenbankanbindung (Transportanfrage, Bewerbungen mit S3-Upload), E-Mail-Versand (Resend), Mapbox-Europakarte, Admin-Panel, Wissenszentrum mit Artikeln.

## Entwicklung

```bash
npm install
cp .env.example .env
npm run dev
```

Siehe [docs/STRATEGIA-PRODUKTU.md](docs/STRATEGIA-PRODUKTU.md) (Strategie- und Architekturdokument, polnisch) für:

- Geschäftsanforderungen und Zielgruppen
- Wettbewerbsanalyse
- Technische Architektur (Next.js 15, PostgreSQL, Prisma, i18n)
- Sitemap (DE, EN, PL, TR, UK)
- Datenbankstruktur
- Design System
- UX-Flows und Admin-Panel
- Implementierungsphasen

## Geplanter Stack

Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, next-intl, PostgreSQL + Prisma, Auth.js, S3/MinIO, Resend, Mapbox, Docker + Coolify.
