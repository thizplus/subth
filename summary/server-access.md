# Server Access - SUBTH Production

## Server Info

| Item | Value |
|------|-------|
| IP | `5.223.46.50` |
| Provider | DigitalOcean (SGP1) |
| OS | Ubuntu 24.04.3 LTS |
| Hostname | `ubuntu-8gb-sin-1` |
| CPU | 2 vCPU |
| RAM | 3.7 GB |
| Disk | 75 GB (used 58 GB / 81%) |
| Docker | 29.2.1 + Compose v5.0.2 |
| Reverse Proxy | Nginx |
| SSL | Cloudflare (proxy mode) |

## SSH Access

```bash
ssh -i ~/.ssh/id_ed25519_suekk root@5.223.46.50
```

Key: `~/.ssh/id_ed25519_suekk`
User: `root`

## Project Location

```
/opt/subth/
├── docker-compose.yml
├── .env                    # Production secrets (NOT in git)
├── .env.example
├── .gitignore
├── gofiber_subth/          # API (Go Fiber)
├── nextjs_subth/           # Frontend (Next.js)
├── vite_subth/             # Admin (Vite + React)
├── init-db/                # DB init scripts
├── python_scraper_th/      # Scraper
├── nginx-subth.txt         # Nginx config reference
└── backup_subth_20260210_054648.sql
```

Git remote: `https://github.com/thizplus/subth.git`

## Docker Services (SUBTH)

| Container | Image | Port | Status |
|-----------|-------|------|--------|
| subth-api | subth-api (built) | 8080 | Healthy |
| subth-frontend | subth-frontend (built) | 3000 | Up |
| subth-admin | subth-admin (built) | 3001:80 | Healthy |
| subth-postgres | pgvector/pgvector:pg16 | 127.0.0.1:5433 | Healthy |
| subth-pgbouncer | bitnamilegacy/pgbouncer | 6432 | Healthy |
| subth-redis | redis:7-alpine | internal only | Healthy |

## Other Services on Same Server

| Container | Port | Description |
|-----------|------|-------------|
| pos-backend | 9005 | POS system API |
| pos-frontend | 3080 | POS frontend |
| puekk_postgres | 127.0.0.1:5432 | POS database |
| puekk_redis | 127.0.0.1:6379 | POS cache |
| puekk_valhalla | 8002 | Routing engine |
| puekk_osrm | 5000 | OSRM routing |

## Domains (via Cloudflare)

| Domain | Service | Port |
|--------|---------|------|
| subth.com | Next.js frontend | 3000 |
| player.subth.com | Next.js frontend | 3000 |
| api.subth.com | Go Fiber API | 8080 |
| admin.subth.com | Vite admin | 3001 |
| files.subth.com | Cloudflare R2 CDN | - |
| clip.subth.com | CLIP AI service | - |
| rag.subth.com | RAG AI service | - |

## Nginx Config

Location: `/etc/nginx/sites-enabled/subth-stream`

- CORS handled by Go Fiber (NOT nginx)
- WebSocket support enabled for API
- SSL terminated at Cloudflare

## Deploy Workflow

```bash
# SSH into server
ssh -i ~/.ssh/id_ed25519_suekk root@5.223.46.50

# Go to project
cd /opt/subth

# Pull latest code
git pull origin main

# Rebuild & restart
docker compose up -d --build

# View logs
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f admin
```

## Important Notes

- Server git is at commit `f1c8327` (behind local `296ec92`)
- `.env` on server contains production secrets - never commit
- Redis has no external port (internal network only)
- PostgreSQL bound to 127.0.0.1 only (security)
- Disk is at 81% - consider cleanup with `docker system prune`
