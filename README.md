# SUBTH - Video Platform

Video Platform with Customer Frontend, Admin Panel, and API Backend.

## Services

| Service | Port | Description |
|---------|------|-------------|
| `api` | 8080 | Go Fiber API Server |
| `frontend` | 3000 | Next.js Customer Site |
| `admin` | 3001 | Vite Admin Panel |
| `postgres` | 5433 | PostgreSQL + pgvector |
| `pgbouncer` | 6432 | Connection Pooler |
| `redis` | 6379 | Cache |

## Quick Start

### 1. Setup Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 2. Start Services

```bash
# Start all services
docker-compose up -d --build

# Start DB only (for local development)
docker-compose up -d postgres redis pgbouncer
```

### 3. Access

- **API**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3001

## Development

### Run API locally
```bash
cd gofiber_subth
go run cmd/api/main.go
```

### Run Frontend locally
```bash
cd nextjs_subth
npm install
npm run dev
```

### Run Admin locally
```bash
cd vite_subth
npm install
npm run dev
```

## Project Structure

```
subth/
├── gofiber_subth/     # Backend API (Go Fiber)
├── nextjs_subth/      # Customer Frontend (Next.js)
├── vite_subth/        # Admin Panel (Vite + React)
├── init-db/           # Database init scripts
├── docker-compose.yml
└── .env.example
```
