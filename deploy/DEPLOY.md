# Deploy to server (`/var/www/dashboard/godaddy`)

Target server example: `root@content` → path `/var/www/dashboard/godaddy`

---

## Folders already exist (your case)

If `/var/www/dashboard/godaddy` is already created, **skip `mkdir` and `git clone`**. Use this flow:

```bash
cd /var/www/dashboard/godaddy

# First time only: pull code into this folder
if [ ! -d .git ]; then
  git clone https://github.com/akashzeen-art/GoDaddyDashboard.git .
else
  git pull origin main
fi
```

Then run backend → frontend → nginx steps below (sections 2–4).

**One-shot script (after `.env` exists):**

```bash
cd /var/www/dashboard/godaddy/backend && chmod +x mvnw && ./mvnw -DskipTests package
cd /var/www/dashboard/godaddy/frontend && npm ci && npm run build
systemctl restart godaddy-dashboard 2>/dev/null || true
nginx -t && systemctl reload nginx
```

---

## Server prerequisites

```bash
apt update
apt install -y git nginx openjdk-21-jdk

# Node.js 20+ (for building frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

## 1. Get the code on the server

**New server (no folder yet):**

```bash
mkdir -p /var/www/dashboard
cd /var/www/dashboard
git clone https://github.com/akashzeen-art/GoDaddyDashboard.git godaddy
cd godaddy
```

**Folder already exists** (`/var/www/dashboard/godaddy`):

```bash
cd /var/www/dashboard/godaddy
git clone https://github.com/akashzeen-art/GoDaddyDashboard.git .   # if empty, no .git yet
# OR
git pull origin main   # if already cloned before
```

## 2. Backend

```bash
cd /var/www/dashboard/godaddy/backend

cp .env.example .env
nano .env   # set MONGODB_URI, JWT_SECRET, ENCRYPTION_KEY, ADMIN_PASSWORD, CORS_ORIGINS
```

**MongoDB Atlas:** In Atlas → **Network Access**, add your server’s public IP (or the VPS IP).

Build and run once to verify:

```bash
chmod +x mvnw
./mvnw -q -DskipTests package
java -jar target/domain-dashboard-0.0.1-SNAPSHOT.jar
# Ctrl+C after you see "Started DomainDashboardApplication"
```

### Run backend as a service (recommended)

```bash
cp /var/www/dashboard/godaddy/deploy/godaddy-dashboard.service.example \
   /etc/systemd/system/godaddy-dashboard.service

systemctl daemon-reload
systemctl enable --now godaddy-dashboard
systemctl status godaddy-dashboard
```

## 3. Frontend

```bash
cd /var/www/dashboard/godaddy/frontend
npm ci
npm run build
```

Static files are in `frontend/dist/`.

## 4. Nginx (frontend + API proxy)

```bash
cp /var/www/dashboard/godaddy/deploy/nginx-godaddy-dashboard.conf.example \
   /etc/nginx/sites-available/godaddy-dashboard

nano /etc/nginx/sites-available/godaddy-dashboard
# Set server_name to your domain or IP

ln -sf /etc/nginx/sites-available/godaddy-dashboard /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

Open `http://YOUR_DOMAIN` in the browser.

## 5. Updates (after you push to GitHub)

```bash
cd /var/www/dashboard/godaddy
git pull origin main

cd backend && ./mvnw -q -DskipTests package && systemctl restart godaddy-dashboard
cd ../frontend && npm ci && npm run build
```

---

## Optional: deploy from your Mac (without git on server)

```bash
rsync -avz --exclude node_modules --exclude target --exclude backend/.env \
  /Users/akashsharma/Desktop/Dashboard/GODADDY/ \
  root@content:/var/www/dashboard/godaddy/
```

Then SSH in and create `backend/.env`, build backend + frontend as above.

---

## Checklist

| Item | Action |
|------|--------|
| `.env` on server | Copy from `.env.example`, never commit |
| Atlas network | Allow server IP |
| Java 21 | `java -version` |
| Backend | Port `8080` localhost only |
| Nginx | Serves `frontend/dist`, proxies `/api` |
| HTTPS | Use Certbot: `certbot --nginx -d YOUR_DOMAIN` |
