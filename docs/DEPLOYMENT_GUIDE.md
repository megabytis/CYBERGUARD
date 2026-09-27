# CYBERGUARD — Deployment & Operations Guide

## 1. Environment Configurations

CYBERGUARD requires two primary configuration sets: Backend environment variables and Frontend build configuration.

### 1.1 Backend Environment Variables (`backend/.env`)

```ini
# Application Configuration
APP_NAME=CYBERGUARD
ENVIRONMENT=production
DEBUG=false
PORT=8000
HOST=0.0.0.0

# Security & Secrets
SECRET_KEY=generate_a_cryptographically_secure_random_hex_string_min_32_bytes
SESSION_EXPIRE_HOURS=24
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
CORS_ORIGINS=["https://cyberguard.internal","http://localhost:5173"]

# Controlled Demo Account (Server-Side Provisioned Only)
DEMO_ADMIN_EMAIL=analyst@cyberguard.internal
DEMO_ADMIN_PASSWORD=CyberGuard2026!SecOps
DEMO_ADMIN_NAME=Chief Security Analyst
DEMO_ADMIN_ORG=Cyber Defense Center

# Database Configuration
DATABASE_URL=sqlite:///./cyberguard.db
# For PostgreSQL / Supabase in production:
# DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres

# Groq AI Integration (Optional - Graceful Fallback Active)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Analysis Scoring Weights
HEURISTIC_WEIGHT=0.70
ML_WEIGHT=0.30
```

### 1.2 Frontend Environment Variables (`frontend/.env`)

```ini
VITE_API_BASE_URL=/api
```

---

## 2. Docker & Container Deployment

### 2.1 Multi-Stage Dockerfile (Backend)
```dockerfile
FROM python:3.11-slim as builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libzbar0 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libzbar0 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 2.2 Dockerfile (Frontend)
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2.3 `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/cyberguard.db
      - SECRET_KEY=change_me_to_a_random_value
      - GROQ_API_KEY=${GROQ_API_KEY:-}
    volumes:
      - cyberguard_data:/app/data

  frontend:
    build: ./frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  cyberguard_data:
```

---

## 3. Local Bare-Metal Execution Quickstart

### 3.1 Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed  # Provisions demo account if not exists
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3.2 Frontend
```bash
cd frontend
bun install  # or npm install
bun run dev  # or npm run dev
```

Visit `http://localhost:5173` to launch the CYBERGUARD landing page and security console.
