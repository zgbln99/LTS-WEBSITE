# Wdrożenie na VPS (port 2015)

Instrukcja wdrożenia platformy LTS Logistik na VPS (np. Hostinger VPS) z Dockerem.
Aplikacja działa w kontenerze i jest wystawiona na porcie **2015**.

## Wymagania

- VPS z Ubuntu 22.04+ (lub innym Linuksem)
- Docker + Docker Compose (na Hostinger VPS dostępny szablon "Docker", albo: `curl -fsSL https://get.docker.com | sh`)
- Baza MySQL na Hostingu (hPanel: Bazy danych MySQL) z włączonym **Remote MySQL** dla adresu IP VPS
- Konto SMTP (hPanel: E-maile) do powiadomień
- Otwarty port 2015 w firewallu (`ufw allow 2015/tcp`, ewentualnie panel Hostinger: Firewall)

## Krok 1: Pobranie kodu

```bash
ssh root@TWOJ-VPS
git clone https://github.com/zgbln99/lts-website.git /opt/lts-website
cd /opt/lts-website
git checkout claude/stoic-galileo-252xeg   # lub main po zmergowaniu
```

## Krok 2: Konfiguracja

```bash
cp .env.example .env
nano .env
```

Wartości obowiązkowe:

| Zmienna | Skąd wziąć |
|---|---|
| `DATABASE_URL` | hPanel, Bazy danych MySQL: `mysql://UZYTKOWNIK:HASLO@srvXXXX.hstgr.io:3306/NAZWA_BAZY` |
| `AUTH_SECRET` | wygeneruj: `openssl rand -base64 32` |
| `AUTH_URL` | publiczny adres, np. `http://IP-VPS:2015` (po podpięciu domeny: `https://ltslogistik.de`) |
| `NEXT_PUBLIC_SITE_URL` | jak wyżej |
| `SMTP_HOST/PORT/USER/PASSWORD` | hPanel, E-maile (Hostinger: `smtp.hostinger.com`, port 465) |
| `EMAIL_INTERNAL_INQUIRIES` / `EMAIL_INTERNAL_HR` | adresy dyspozycji i HR |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | konto administratora panelu (hasło min. 8 znaków) |

Opcjonalne: `S3_*` (MEGA S4 na pliki aplikacji), `NEXT_PUBLIC_MAPBOX_TOKEN` (mapa), `NEXT_PUBLIC_GA_MEASUREMENT_ID` itd.

WAŻNE: w hPanelu przy bazie MySQL dodaj IP VPS-a w sekcji **Remote MySQL**, inaczej połączenie zostanie odrzucone.

## Krok 3: Wdrożenie

```bash
chmod +x deploy.sh
./deploy.sh
```

Skrypt wykonuje kolejno: `git pull`, utworzenie tabel w bazie (`prisma db push`),
seed (języki, kategorie, konto administratora), budowę obrazu i start kontenera na porcie 2015.

## Krok 4: Weryfikacja

```bash
docker compose ps                       # kontener "lts-website" w stanie healthy
curl -I http://localhost:2015/de        # HTTP 200
```

W przeglądarce:

- `http://IP-VPS:2015/de` strona główna
- `http://IP-VPS:2015/admin` logowanie do panelu (dane z `ADMIN_EMAIL`/`ADMIN_PASSWORD`)

Test funkcjonalny: wyślij zapytanie przez `http://IP-VPS:2015/de/transportanfrage`,
sprawdź wpis w panelu (Transportanfragen) i e-mail na skrzynce dyspozycji.

## Aktualizacje

Po każdej zmianie w repozytorium wystarczy:

```bash
cd /opt/lts-website && ./deploy.sh
```

## Domena i HTTPS (nginx jako reverse proxy)

Na tym VPS-ie portami 80/443 zarządza już **host nginx** (przed innym projektem).
Domena `ltslogistik.de` po wskazaniu na IP trafia do nginx, który **rozróżnia
aplikacje po `server_name` (nagłówku Host)**. Dlatego trzeba dodać blok nginx
kierujący domenę do kontenera lts-website na porcie 2015.

1. Sprawdź, że aplikacja działa lokalnie i zobacz istniejące bloki nginx:

```bash
docker ps | grep lts-website
curl -I http://127.0.0.1:2015/de         # oczekiwane HTTP 200
sudo nginx -T | grep -E "server_name|listen .*default|proxy_pass"
```

2. Utwórz blok serwera dla domeny (kieruje na 127.0.0.1:2015):

```bash
sudo tee /etc/nginx/conf.d/ltslogistik.conf >/dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ltslogistik.de www.ltslogistik.de;

    client_max_body_size 64m;

    location / {
        proxy_pass http://127.0.0.1:2015;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
sudo nginx -t && sudo systemctl reload nginx
```

Teraz `http://ltslogistik.de` powinno pokazywać stronę lts-website (nie inną
aplikację), bo żądanie z tym hostem trafia do nowego bloku, a nie do
`default_server` innego projektu.

3. HTTPS przez Let's Encrypt (certbot dopisze blok 443 automatycznie):

```bash
sudo certbot --nginx -d ltslogistik.de -d www.ltslogistik.de
```

4. Zaktualizuj `.env` i przebuduj:

```
NEXT_PUBLIC_SITE_URL="https://ltslogistik.de"
AUTH_URL="https://ltslogistik.de"
```
```bash
cd /opt/lts-website && ./deploy.sh
```

> Uwaga: jeśli blok innego projektu ma `listen 443 ssl default_server` i
> przejmuje też `ltslogistik.de`, certbot i nowy `server_name` rozwiążą konflikt,
> bo nginx dopasuje dokładny `server_name` przed `default_server`.

## Rozwiązywanie problemów

| Objaw | Przyczyna i rozwiązanie |
|---|---|
| domena pokazuje inną aplikację | brak bloku nginx z `server_name ltslogistik.de` -> dodaj plik `/etc/nginx/conf.d/ltslogistik.conf` (patrz wyżej), `nginx -t && systemctl reload nginx` |
| `P1001: Can't reach database server` | brak IP VPS-a w Remote MySQL lub zły host w `DATABASE_URL` |
| formularz zwraca błąd ogólny | sprawdź `docker compose logs web`: zwykle baza lub SMTP |
| brak e-maili | zły port/SSL SMTP (Hostinger: 465 + `SMTP_SECURE=true`), sprawdź też spam |
| panel: "Datenbank nicht erreichbar" | jak wyżej, problem z `DATABASE_URL` |
| port zajęty | zmień mapowanie w `docker-compose.yml` (`"2015:3000"`) |
