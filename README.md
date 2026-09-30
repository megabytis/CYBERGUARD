# CYBERGUARD — Defensive Cybersecurity Protection SaaS

> **Tagline:** Scan. Explain. Protect.  
> **Product Story:** PROTECT &rarr; ANALYSE &rarr; DETECT &rarr; EXPLAIN &rarr; RESPOND  
> **Positioning:** An AI-powered defensive cybersecurity threat protection platform that helps analysts and users analyse suspicious content, understand technical evidence, and take safer protective action.

---

## 1. Architectural Highlights

- **Strict Zero-SSRF Guarantee:** CYBERGUARD never connects to or executes user-submitted target URLs or remote hosts. Static lexical tokenization and RFC parsing eliminate internal network probing vectors.
- **Hybrid Scoring Core:** 70% deterministic security heuristics combined with 30% local Scikit-Learn TF-IDF machine learning inference.
- **Explainable Threat Evidence:** Explains *why* content was flagged with itemized evidence cards, confidence percentages, and clear severity ratings.
- **Server-Side Groq AI Reasoning:** Grounded LLM narrative generation with graceful local fallback if offline or unconfigured.
- **Executive Incident Reporting:** Server-compiled ReportLab PDF reports and SIEM-ready CSV/JSON exports.
- **Controlled Demo Access:** No self-service registration. Accounts are provisioned solely server-side using bcrypt salted hashes.
- **Projector-Ready Console:** High contrast, 16px minimum body text, 72px+ hero risk score display, 40px+ KPI numbers, restrained dark glassmorphism, and selective Three.js 3D visuals.

---

## 2. Seven Specialized Inspection Vectors

1. **URL Threat Inspection:** IP host checks, punycode/IDN spoofing, lookalike domains, credential paths, high-risk TLDs, and HTTP protocol downgrades.
2. **Email Phishing Analyzer:** Envelope sender/reply-to mismatches, urgency and coercion cues, credential extortion, and suspicious links.
3. **SMS / Message Smishing:** SMS shortlinks (bit.ly, t.co), multi-factor OTP interception lures, and fake parcel delivery fees.
4. **QR Code (Quishing) Safety:** Memory-only image decoding via Pillow and pyzbar without auto-opening destination links.
5. **Authentication Logs Triage:** Brute force burst recognition, impossible travel markers, and root/sudo privilege escalation events.
6. **Network Activity Telemetry:** Command-and-control (C2) beaconing patterns, abnormal port traffic (Metasploit 4444, IRC 6667), and DNS anomalies.
7. **Raw RFC Email Headers:** Traces Received hop paths, Return-Path forgery, and explicit SPF/DKIM/DMARC authentication failure records.

---

## 3. Technology Stack

### Frontend
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS with enterprise dark glassmorphism tokens
- **Icons & Motion:** Lucide React, `motion/react`
- **Visuals & 3D:** Three.js, React Three Fiber (`@react-three/fiber`, `@react-three/drei`) with automatic SVG fallback
- **Charts:** Recharts
- **Rolling Numbers:** `@kitlangton/rolling-number`
- **Command Menu:** `cmdk`

### Backend
- **Framework:** Python 3.11+ / FastAPI
- **ORM & Database:** SQLAlchemy 2.0, SQLite (development) / PostgreSQL (production)
- **Machine Learning:** Scikit-Learn (TF-IDF Vectorizer + Logistic Regression)
- **PDF Generation:** ReportLab Vector Engine
- **Password Security:** Bcrypt salted hashing
- **AI Integration:** Server-side Groq Cloud LLM adapter with strict evidence constraints

---

## 4. Documentation Suite

Full technical specifications are documented in `/docs`:
- [docs/PRD.md](docs/PRD.md) — Product Requirements Document
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System Architecture
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — Relational Schema & Models
- [docs/UI_UX_DESIGN_SYSTEM.md](docs/UI_UX_DESIGN_SYSTEM.md) — Design Tokens & Projector Standards
- [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) — RESTful API Contracts
- [docs/SECURITY_THREAT_MODEL.md](docs/SECURITY_THREAT_MODEL.md) — STRIDE Threat Analysis
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) — 15-Phase Execution Plan
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) — Deployment & Docker Operations

---

## 5. Quickstart & Local Execution

### 5.1 Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 5.2 Frontend Setup
```bash
cd frontend
bun install  # or npm install
bun run dev  # or npm run dev
```

Visit `http://localhost:5173` to launch the platform.

### 5.3 Automated Testing
```bash
cd backend
venv/bin/pytest
```

### 5.4 Docker Deployment (Recommended Full Stack)

To run the complete production-grade application (FastAPI backend + Nginx reverse proxy + React frontend) in isolated Docker containers:

```bash
# Build and start all services in detached mode
docker compose up -d --build

# View real-time container logs
docker compose logs -f

# Check container health status
docker compose ps

# Stop all services
docker compose down
```

- **Frontend Application:** [http://localhost](http://localhost) (Port 80)
- **Direct Backend API:** [http://localhost:8000](http://localhost:8000)
- **API Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
