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

echo "==> Datenbankschema anwenden und Seed ausführen"
docker run --rm \
  -v "$(pwd)":/app -w /app \
  --env-file .env \
  node:22-alpine \
  sh -c "npm ci --no-audit --no-fund && npx prisma db push && npm run db:seed"

echo "==> Image bauen und Container starten (Port 2015)"
docker compose build
docker compose up -d

echo "==> Fertig. Status:"
docker compose ps
echo "Website: http://$(hostname -I 2>/dev/null | awk '{print $1}'):2015/de"
