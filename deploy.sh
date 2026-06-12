#!/usr/bin/env bash
# Deployment-Skript für den VPS (Docker + Docker Compose erforderlich).
# Verwendung: ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "FEHLER: .env fehlt. Kopieren Sie .env.example nach .env und füllen Sie die Werte aus."
  exit 1
fi

echo "==> Code aktualisieren"
git pull --ff-only

# Firmenlogo einmalig von der alten Website laden
if [ ! -s public/logo.png ]; then
  echo "==> Logo herunterladen"
  curl -fsSL -A "Mozilla/5.0" -o public/logo.png \
    "https://ltslogistik.de/wp-content/uploads/2025/03/lts-duze.png" \
    || echo "WARNUNG: Logo konnte nicht geladen werden, bitte public/logo.png manuell ablegen."
fi

echo "==> Datenbankschema anwenden und Seed ausführen"
# .env wird in der Shell des Containers geladen (entfernt Anführungszeichen korrekt,
# im Gegensatz zu docker --env-file)
docker run --rm \
  -v "$(pwd)":/app -w /app \
  node:22-alpine \
  sh -c "set -a && . ./.env && set +a && npm ci --no-audit --no-fund && npx prisma db push && npm run db:seed"

echo "==> Image bauen und Container starten (Port 2015)"
docker compose build
docker compose up -d

echo "==> Fertig. Status:"
docker compose ps
echo "Website: http://$(hostname -I 2>/dev/null | awk '{print $1}'):2015/de"
