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

Phase 4 (Formulare und Benachrichtigungen) ist umgesetzt:

- Transportanfrage als dreistufiger Formular-Assistent mit Referenznummer
- Kontaktformular mit Abteilungsauswahl
- Bewerbungsformular mit Datei-Upload (CV, Führerschein, Zertifikate) auf der Karriereseite und der Fahrer-Landingpage
- Speicherung in MySQL (Prisma), SMTP-Benachrichtigungen an Disposition/HR mit Anhängen, Bestätigungs-E-Mails an Absender in deren Sprache
- Spam-Schutz: Honeypot, Rate Limiting, Zod-Validierung, Dateityp- und Größenprüfung

Phase 6 (Admin-Panel unter `/admin`) ist umgesetzt:

- Anmeldung mit Auth.js (Credentials, bcrypt, JWT-Session, 8 h)
- Rollenbasierte Zugriffe: Super Admin, HR (Bewerbungen), Marketing (Anfragen), Redaktion
- Dashboard mit Kennzahlen und neuesten Eingängen
- Transportanfragen: Tabelle, Detailansicht, Statusverwaltung (Neu bis Gewonnen/Verloren)
- Kontaktanfragen mit Abteilungs- und Statusverwaltung
- Bewerbungen: Statusboard (Neu/Geprüft/Interview/Abgesagt/Eingestellt), Kandidatenakte
  mit Unterlagen-Downloads (S3 presigned URLs), internen Notizen und Aktivitätsverlauf
- Audit-Log für alle Statusänderungen und Notizen

Admin-Benutzer anlegen: `ADMIN_EMAIL` und `ADMIN_PASSWORD` (mind. 12 Zeichen) in `.env` setzen, dann `npm run db:seed`.

Nächste Phasen: Mapbox-Europakarte, Content-Module im Admin (Leistungen, FAQ, Testimonials, Wissenszentrum), Cookie-Consent und Analytics.

### Konfiguration

Die Formulare funktionieren erst mit gesetzten Umgebungsvariablen (siehe `.env.example`):

- `DATABASE_URL`: MySQL-Verbindung (Hostinger Remote MySQL), danach einmalig `npx prisma db push` und `npm run db:seed`
- `SMTP_*` und `EMAIL_*`: SMTP-Zugang (z. B. Hostinger Mail) für Benachrichtigungen
- `S3_*`: optionaler S3-kompatibler Storage für Bewerbungsunterlagen (Anhänge gehen zusätzlich per E-Mail an HR)

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

Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, next-intl, MySQL (Hostinger) + Prisma, Auth.js, S3-kompatibler Storage (MEGA S4), SMTP (nodemailer), Mapbox, Docker.
