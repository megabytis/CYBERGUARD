# CYBERGUARD — System Architecture Document

## 1. Architectural Overview

CYBERGUARD is structured as a modern, decoupled client-server architecture with an emphasis on defensive security, explainability, deterministic heuristics, and low-latency response times.

```
+-------------------------------------------------------------------------------+
|                                CLIENT LAYER                                   |
|                                                                               |
|  +--------------------+   +-----------------------+   +--------------------+  |
|  |  React 19 / Vite   |   |   Tailwind + Glass    |   | Motion / Three.js  |  |
|  |  TypeScript Core   |   |   Design System       |   | 3D Shield & Canvas |  |
|  +--------------------+   +-----------------------+   +--------------------+  |
|            |                          |                          |            |
|            +--------------------------+--------------------------+            |
|                                       |                                       |
|                            Secure Cookie Transport                            |
+---------------------------------------|---------------------------------------+
                                        | (HTTPS / REST)
+---------------------------------------v---------------------------------------+
|                                BACKEND LAYER                                  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                           FastAPI Gateway                               |  |
|  |   - CORS & Security Headers Middleware                                  |  |
|  |   - Rate Limiting & Payload Size Caps (10MB)                            |  |
|  |   - HttpOnly Cookie Session Authentication                              |  |
|  +-------------------------------------------------------------------------+  |
|                                       |                                       |
|  +-------------------------------------------------------------------------+  |
|  |                      CYBERGUARD Core Detection Core                     |  |
|  |                                                                         |  |
|  |  +-------------------+  +--------------------+  +--------------------+  |  |
|  |  |   normalizer.py   |  |     rules.py       |  |      ml.py         |  |  |
|  |  | Ingest & Cleanse  |  | Deterministic (70%)|  | TF-IDF + LogReg(30%)  |  |
|  |  +-------------------+  +--------------------+  +--------------------+  |  |
|  |            |                      |                      |              |  |
|  |            +----------------------+----------------------+              |  |
|  |                                   |                                     |  |
|  |                    +------------------------------+                     |  |
|  |                    |          scorer.py           |                     |  |
|  |                    | Risk Score 0-100 Aggregator  |                     |  |
|  |                    +------------------------------+                     |  |
|  |                                   |                                     |  |
|  |                    +------------------------------+                     |  |
|  |                    |      explanations.py         |                     |  |
|  |                    |  Local Rule-Based Narrative  |                     |  |
|  |                    +------------------------------+                     |  |
|  |                                   |                                     |  |
|  |                    +------------------------------+                     |  |
|  |                    |            ai.py             |                     |  |
|  |                    | Server-Side Groq LLM Adapter |                     |  |
|  |                    +------------------------------+                     |  |
|  +-------------------------------------------------------------------------+  |
|                                       |                                       |
|  +-------------------------------------------------------------------------+  |
|  |                   Storage & Reporting Subsystems                        |  |
|  |                                                                         |  |
|  |  +-------------------+  +--------------------+  +--------------------+  |  |
|  |  |  SQLAlchemy 2.0   |  |     Alembic        |  |  ReportLab Engine  |  |  |
|  |  | ORM Models & Repo |  | Migrations Manager |  | Vector PDF Reports |  |  |
|  |  +-------------------+  +--------------------+  +--------------------+  |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------------|---------------------------------------+
                                        |
+---------------------------------------v---------------------------------------+
|                                DATA LAYER                                     |
|                                                                               |
|  +-------------------------------------+   +-------------------------------+  |
|  |  SQLite (Local Development Engine)  |   | PostgreSQL / Supabase (Prod)  |  |
|  |  Zero-dependency embedded storage   |   | Highly scalable relational db |  |
|  +-------------------------------------+   +-------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 2. Component Breakdown

### 2.1 Frontend Subsystem (`/frontend` or root app)
- **Framework:** React 19 + TypeScript + Vite.
- **Styling Architecture:** Tailwind CSS with explicit CSS variables for enterprise dark glassmorphism.
- **UI Components:** Built on Radix UI / shadcn design patterns (`GlassPanel`, `GlassCard`, `GlassButton`, `GlassTabs`, `GlassModal`, `GlassDrawer`, `GlassBadge`, etc.).
- **Motion & Visuals:**
  - `motion/react`: Hardware-accelerated transitions, tab transitions, slide-over drawers, staggered reveals.
  - `@kitlangton/rolling-number`: Smooth odometer animations for dashboard statistics, counts, and risk gauges.
  - Three.js / React Three Fiber (`@react-three/fiber`, `@react-three/drei`): Cinematic 3D shield with ambient cybersecurity scan ring, with automatic SVG/CSS fallback if WebGL is unavailable.
- **Routing & State Management:** `react-router-dom` with route guards checking session status via `/api/auth/me`.

### 2.2 Backend Subsystem (`/backend`)
- **Web Framework:** FastAPI (Asynchronous Python 3.11+).
- **Core Detection Modules:**
  - `app/core/normalizer.py`: Sanitizes and extracts metadata from raw inputs (URLs, emails, SMS, QR images, syslogs, PCAP/NetFlow logs, headers).
  - `app/core/rules.py`: Deterministic heuristic evaluators for every input type. Evaluates structural anomalies, known threat keywords, protocol downgrades, and mismatch signatures.
  - `app/core/ml.py`: TF-IDF vectorizer + Scikit-Learn Logistic Regression model pre-trained and serialized for phishing/threat classification. Runs 100% locally with zero external network dependency.
  - `app/core/scorer.py`: Aggregates the 70% heuristic weight and 30% ML score into an explainable 0–100 risk score and categorizes into Low (0–30), Medium (31–70), or High (71–100).
  - `app/core/explanations.py`: Deterministic fallback generator creating human-readable analysis narratives directly from rule triggers.
  - `app/core/ai.py`: Groq Cloud client wrapper. Uses `groq-python` with strict system instructions to generate executive summaries, threat breakdowns, and mitigation actions without hallucinations. Falls back to `explanations.py` automatically if offline or API key is absent.
  - `app/core/analyzer.py`: Orchestrator that executes the pipeline stages sequentially with fine-grained telemetry tracking.
- **Security & Session Handling:**
  - Session tokens stored in backend SQLite/PostgreSQL `sessions` table.
  - Signed cookies with `HttpOnly`, `SameSite=Lax`, `Secure` flags.
  - Passwords hashed using bcrypt / Argon2id with cryptographically random salts.

### 2.3 Data Layer
- **ORM:** SQLAlchemy 2.0 declarative models with typing support.
- **Schema Management:** Alembic database migrations.
- **Local Database:** SQLite with WAL (Write-Ahead Logging) mode enabled for high-concurrency read operations.
- **Production Compatibility:** Full parity with PostgreSQL 15+ / Supabase.

---

## 3. Data Processing Flow: The 8-Stage Scanner Pipeline

When a user initiates an analysis:
1. **Input Validation:** Input size is verified (< 500KB text, < 5MB QR image), format checked with Pydantic/Zod.
2. **Normalisation:** Input is cleansed, URLs parsed without fetching remote resources, email headers extracted into RFC compliant dictionaries.
3. **Structural Analysis:** Syntax, character encodings (punycode, URL escape codes), and token frequency are evaluated.
4. **Heuristic Evaluation (70%):** Weighted rule engine runs deterministic checks specific to the input category.
5. **ML Inference (30%):** Local TF-IDF + Logistic Regression infers probability of maliciousness based on linguistic and token signatures.
6. **Evidence Aggregation:** Scores are synthesized into a 0–100 composite risk rating; individual finding tokens are compiled with severity and confidence metrics.
7. **AI Explanation & Copilot Context:** If Groq is enabled, the structured evidence is passed to the LLM to compose a tailored executive summary and mitigation advice; otherwise, deterministic explanation templates are generated.
8. **Persistence & Presentation:** Scan record and findings are committed to the database; the frontend receives the full analysis payload to render the high-contrast presentation screen.

---

## 4. Resilience and Offline-First Strategy
CYBERGUARD operates independently of external SaaS availability:
- **No Third-Party Cloud Requirement:** Core detection (heuristics + ML) executes locally in Python.
- **Zero Remote URL Visits:** Eliminates SSRF vectors, preserves analyst privacy, and functions on isolated air-gapped networks.
- **Groq Graceful Degradation:** The UI explicitly denotes whether an explanation was AI-synthesized or generated by the local deterministic rule engine.
