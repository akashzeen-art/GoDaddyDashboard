#!/bin/bash
# Run on the server as root from an existing /var/www/dashboard/godaddy directory.
set -euo pipefail

ROOT="/var/www/dashboard/godaddy"
REPO="https://github.com/akashzeen-art/GoDaddyDashboard.git"

cd "$ROOT"

if [ ! -d .git ]; then
  echo "Cloning into $ROOT ..."
  git clone "$REPO" .
else
  echo "Pulling latest ..."
  git pull origin main
fi

if [ ! -f backend/.env ]; then
  echo "Creating backend/.env from example — edit it before going to production:"
  cp backend/.env.example backend/.env
  echo "  nano $ROOT/backend/.env"
  exit 1
fi

echo "Building backend ..."
cd backend
chmod +x mvnw
./mvnw -DskipTests package
cd ..

echo "Building frontend ..."
cd frontend
npm ci
npm run build
cd ..

if [ ! -f /etc/systemd/system/godaddy-dashboard.service ]; then
  cp deploy/godaddy-dashboard.service.example /etc/systemd/system/godaddy-dashboard.service
  systemctl daemon-reload
  systemctl enable godaddy-dashboard
fi

systemctl restart godaddy-dashboard
systemctl status godaddy-dashboard --no-pager

if [ ! -f /etc/nginx/sites-available/godaddy-dashboard ]; then
  echo "Install Nginx site config:"
  echo "  cp $ROOT/deploy/nginx-godaddy-dashboard.conf.example /etc/nginx/sites-available/godaddy-dashboard"
  echo "  nano /etc/nginx/sites-available/godaddy-dashboard"
  echo "  ln -sf /etc/nginx/sites-available/godaddy-dashboard /etc/nginx/sites-enabled/"
  echo "  nginx -t && systemctl reload nginx"
else
  nginx -t && systemctl reload nginx
fi

echo "Done. Frontend: $ROOT/frontend/dist"
