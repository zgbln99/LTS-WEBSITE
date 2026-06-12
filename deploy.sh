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

# Firmenlogo einmalig von der alten Website laden (mit Browser-Headern,
# da der alte Server einfache Clients blockiert)
if [ ! -s public/logo.png ]; then
  echo "==> Logo herunterladen"
  curl -fsSL --compressed -o public/logo.png \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36" \
    -H "Accept: image/avif,image/webp,image/png,image/*;q=0.8" \
    -H "Referer: https://ltslogistik.de/" \
    "https://ltslogistik.de/wp-content/uploads/2025/03/lts-duze.png" || true
  # Prüfen, ob wirklich ein Bild angekommen ist
  if ! file public/logo.png 2>/dev/null | grep -qiE "image|PNG"; then
    rm -f public/logo.png
    echo "WARNUNG: Logo konnte nicht geladen werden. Die Website zeigt das Text-Logo."
    echo "         Manuell beheben: Logo im Browser herunterladen und per scp nach"
    echo "         /opt/lts-website/public/logo.png kopieren, dann ./deploy.sh erneut."
  fi
fi

echo "==> Datenbankschema anwenden und Seed ausführen"
# .env wird in der Shell des Containers geladen (entfernt Anführungszeichen korrekt,
# im Gegensatz zu docker --env-file)
docker run --rm \
  -v "$(pwd)":/app -w /app \
  node:22-alpine \
  sh -c "set -a && . ./.env && set +a && npm ci --no-audit --no-fund && npx prisma db push && npm run db:seed"

# Upload-Verzeichnis für die Mediathek (Container läuft als User 1001)
mkdir -p public/uploads
chown -R 1001:1001 public/uploads 2>/dev/null || true

echo "==> Image bauen und Container starten (Port 2015)"
# .env in die Shell exportieren, damit NEXT_PUBLIC_* sicher als Build-Args
# ankommen (Karte, Analytics werden zur Buildzeit eingebettet)
set -a; . ./.env; set +a
docker compose build
docker compose up -d

echo "==> Fertig. Status:"
docker compose ps
echo "Website: http://$(hostname -I 2>/dev/null | awk '{print $1}'):2015/de"
