# Sheria Check — Deployment Guide

## Prerequisites

- Docker + Docker Compose installed
- A server (DigitalOcean Droplet, VPS, or local machine)
- Domain name (optional, for SSL)

---

## Option 1: Docker Compose (Single Server)

### 1. Clone and configure

```bash
git clone https://github.com/its-abelle/sheria-check.git
cd sheria_check
```

### 2. Set environment variables

Create a `.env` file in the project root:

```bash
DB_PASSWORD=your_secure_db_password
ADMIN_PASSWORD=your_admin_password
CLIENT_PORT=80
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### 3. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Seed the database

```bash
docker compose -f docker-compose.prod.yml exec server npm run seed
```

### 5. Verify

```bash
curl http://localhost:80/api/v1/health
# {"status":"healthy","uptime":...,"timestamp":"...","database":"connected"}

curl http://localhost:80/api/v1/status
# {"data":{"data_version":"2024.1","total_offenses":61,...}}
```

---

## Option 2: DigitalOcean App Platform

### 1. Create a PostgreSQL Managed Database

1. Go to DigitalOcean → Databases → Create Database
2. Choose PostgreSQL 16, smallest plan ($15/mo)
3. Name: `sheria-check-db`
4. Create a database called `sheria_check`
5. Copy the connection string

### 2. Create App from GitHub

1. Go to DigitalOcean → Apps → Create App
2. Choose GitHub → `its-abelle/sheria-check`
3. Select the `main` branch, autodeploy enabled

### 3. Add server component

- **Source directory**: `server`
- **Type**: Dockerfile
- **HTTP port**: 4000
- **Health check**: `GET /api/v1/health`
- **Environment variables**:

```
DATABASE_URL=${sheria-check-db.DATABASE_URL}
PORT=4000
NODE_ENV=production
ADMIN_PASSWORD=<your password>
CORS_ORIGIN=https://yourdomain.com
```

### 4. Add client component

- **Source directory**: `client`
- **Type**: Dockerfile
- **HTTP port**: 80
- **Health check**: `GET /`

### 5. Deploy

Click "Launch App". DO builds both Dockerfiles and wires them to the database.

### 6. Add domain + SSL

1. Go to App Settings → Domains
2. Add your domain
3. DO provisions SSL automatically via Let's Encrypt

### 7. Seed data

```bash
# SSH into the server component or use DO Console
npm run seed
```

---

## Option 3: Nginx Reverse Proxy (bare Droplet)

If you want full control on a Droplet:

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
```

### 2. Deploy Sheria Check

```bash
git clone https://github.com/its-abelle/sheria-check.git
cd sheria_check
echo "DB_PASSWORD=strongpassword" > .env
echo "ADMIN_PASSWORD=strongadmin" >> .env
echo "CLIENT_PORT=8080" >> .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec server npm run seed
```

### 3. Install Nginx + Certbot

```bash
apt install nginx certbot python3-certbot-nginx -y
```

### 4. Nginx config (`/etc/nginx/sites-available/sheria-check`)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Enable site + SSL

```bash
ln -s /etc/nginx/sites-available/sheria-check /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d yourdomain.com
```

---

## Post-Deployment Checklist

- [ ] `curl https://yourdomain.com/api/v1/health` → healthy
- [ ] `curl https://yourdomain.com/api/v1/offenses/search?q=speeding` → offenses returned
- [ ] Load `https://yourdomain.com` in browser → hero with animated brown scales
- [ ] Search "speeding" → results appear
- [ ] Browse categories → 6 categories with counts
- [ ] View offense detail → fine range, citation, course of action
- [ ] Submit a test report → toast notification "Report submitted anonymously"
- [ ] Go offline → notice banner, cached offenses searchable
- [ ] Open on mobile → PWA install prompt
- [ ] Lighthouse audit → target 90+ on all categories

---

## Updating

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

To re-seed after data updates:

```bash
docker compose -f docker-compose.prod.yml exec server npm run seed
```

---

## Backup

```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U sheria sheria_check > backup.sql
```

Restore:

```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U sheria sheria_check < backup.sql
```
