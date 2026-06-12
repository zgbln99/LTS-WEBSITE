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
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | konto administratora panelu (hasło min. 12 znaków) |

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

## Domena i HTTPS (zalecane po testach)

Port 2015 jest wygodny do testów. Docelowo warto postawić przed aplikacją reverse proxy
z certyfikatem TLS, np. Caddy:

```bash
apt install -y caddy
cat > /etc/caddy/Caddyfile <<'EOF'
ltslogistik.de {
    reverse_proxy 127.0.0.1:2015
}
EOF
systemctl reload caddy
```

Następnie ustaw rekord A domeny na IP VPS-a oraz zaktualizuj `AUTH_URL` i
`NEXT_PUBLIC_SITE_URL` na `https://ltslogistik.de` i uruchom ponownie `./deploy.sh`.

## Rozwiązywanie problemów

| Objaw | Przyczyna i rozwiązanie |
|---|---|
| `P1001: Can't reach database server` | brak IP VPS-a w Remote MySQL lub zły host w `DATABASE_URL` |
| formularz zwraca błąd ogólny | sprawdź `docker compose logs web`: zwykle baza lub SMTP |
| brak e-maili | zły port/SSL SMTP (Hostinger: 465 + `SMTP_SECURE=true`), sprawdź też spam |
| panel: "Datenbank nicht erreichbar" | jak wyżej, problem z `DATABASE_URL` |
| port zajęty | zmień mapowanie w `docker-compose.yml` (`"2015:3000"`) |
