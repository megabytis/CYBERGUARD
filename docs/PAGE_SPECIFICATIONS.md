# CYBERGUARD — Page Specifications & Information Architecture

**Author:** Principal Product Engineer & Cybersecurity Architect  
**Project:** CYBERGUARD ("Scan. Explain. Protect.")  
**Date:** September 2026  
**Document Purpose:** Architectural blueprints, layout specifications, and interaction flows for all 10 platform views.

---

## 1. Complete Product Architecture

```text
PUBLIC CONSOLE
  ├── Landing Page (/) ────────► Product Showcase, 3D Shield, Capability Grid
  └── Login (/login) ──────────► Split-Screen Authorized Entry

ENTERPRISE ANALYST CONSOLE (/app)
  ├── Overview (/app) ─────────► Live Protection Center, 4 Rolling KPIs, Radar State
  ├── Analyze (/app/scanner) ──► 7 Vector Workspaces (Email, URL, SMS, Logs, Net, QR, Headers)
  │    └── Result View ────────► 7-Step Dominant Hierarchy (Score, Why, Evidence, AI, Playbook)
  ├── Activity (/app/history) ─► Chronological Audit Log & Slide-Out Investigation Drawer
  ├── Intelligence (/app/intelligence) ► Deterministic Rule Ledger & ML Inference Architecture
  ├── Reports (/app/reports) ──► Vector Incident PDF Deliverables & SIEM Exports
  ├── AI Copilot (Slide-Over) ─► Evidence-Grounded SOC Incident Interrogation
  ├── Profile (/app/profile) ──► Security Operator Credentials & Verification
  └── Settings (/app/settings) ─► Scoring Weights, AI Model, Reduced Motion Preferences
```

---

## 2. Detailed Page Specifications

### Page 1: Landing Page (`/`)
* **Hero Section:**
  * Space Grotesk Title: `CYBERGUARD — AI-POWERED THREAT PROTECTION`
  * Subtitle: `"Scan. Explain. Protect. Detect phishing, impersonation, and suspicious behavior before they become incidents."`
  * Primary CTA: `Analyze a Threat` (routes to `/app/scanner`).
  * Secondary CTA: `Explore Protection` (smooth-scrolls to workflow).
  * Centerpiece: Interactive Three.js procedural shield with wireframe perimeter and glowing core. Automatically throttled to 30 FPS when inactive, paused when offscreen.
* **Feature Grid:**
  * 7 Threat Vectors: Email Phishing, URL Threats, SMS Smishing, Auth Log Anomaly, Network Flow C2, QR Quishing, RFC 5322 Headers.
* **Workflow Story:**
  * 5 Steps: `Analyze → Detect → Explain → Respond → Protect`.
* **Zero-SSRF Security Architecture:**
  * Transparent technical diagram proving that target URLs are never resolved or fetched by CYBERGUARD servers.

---

### Page 2: Split-Screen Login (`/login`)
* **Layout:** Full-height split screen ($50\% / 50\%$ on desktop).
* **Left Column (Product Showcase):**
  * Deep black background with cyan ambient illumination.
  * CYBERGUARD brand mark, defensive ethos statement, and real-time operational status badge.
  * Bullet points highlighting air-gapped inspection, explainable scoring, and automated incident reports.
* **Right Column (Analyst Access Portal):**
  * Centered glass panel with email and password inputs.
  * Clear error messaging if authentication fails.
  * Explicitly **NO public self-registration**, **NO social login**, and **NO hardcoded passwords displayed**.

---

### Page 3: Overview / Dashboard (`/app`)
* **Protection Status Banner:**
  * Real-time status badge ("ACTIVE • ALL SYSTEMS OPERATIONAL").
  * Button: `Start New Analysis` (`/app/scanner`).
* **KPI Metric Grid (4 Cards with `@kitlangton/rolling-number`):**
  * Card 1: `Total Analyses` (Cyan `#00D9FF`).
  * Card 2: `Critical / High Risk` (Red `#FF465A`).
  * Card 3: `Suspicious / Elevated` (Amber `#FFB020`).
  * Card 4: `Verified Safe / Low` (Green `#00FF9D`).
* **Visual States:**
  * **State A (0 Records):** High-tech tactical radar empty state explaining that the database is fresh, with a prominent button to run the first live scan.
  * **State B ($\ge 1$ Record):** Live Recharts bar and distribution charts, plus Recent Incidents ledger.

---

### Page 4 & 5: Analysis Workspace & Result Screen (`/app/scanner`)
* **Input Workspace:**
  * 7 Vector Tabs: Email, URL, Message, QR, Auth Logs, Network, Headers.
  * Presets: One-click buttons to load realistic threat samples (e.g. `BEC + DOMAIN MISMATCH`, `LOOKALIKE + HTTP`).
  * Large, comfortable monospaced input well.
  * Server-side Groq AI toggle with automatic deterministic local fallback.
* **Scanning State:**
  * Interactive progress pipeline displaying the real 7 backend stages lighting up with checkmarks.
* **Analysis Result Screen (The Visual Centerpiece):**
  Strictly enforces the required 7-step presentation hierarchy:
  1. `[STEP 1] USER INPUT`: Raw submitted payload with copy button.
  2. `[STEP 2] CYBERGUARD ANALYSIS`: Pipeline telemetry, latency, and air-gap verification.
  3. `[STEP 3] RISK SCORE & VERDICT`: Dominant 72px score, calibrated semi-circle gauge, and 70% Rules / 30% ML split.
  4. `[STEP 4] WHY WAS THIS FLAGGED?`: Plain English executive threat rationale.
  5. `[STEP 5] DETECTED EVIDENCE`: Itemized cards with category, finding, severity badge, and confidence meter.
  6. `[STEP 6] AI THREAT EXPLANATION`: Technical attack mechanics narrative.
  7. `[STEP 7] RECOMMENDED RESPONSE`: Numbered protective containment playbook.
  * Primary Actions: `Download PDF Report`, `Ask AI Copilot`, `Export SIEM JSON`, `New Scan`.

---

### Page 6: Activity & Scan History (`/app/history`)
* Search input and multi-criteria filter pills (All, High Risk, Suspicious, Safe, Vector).
* Paginated table with 15 records per page.
* Clicking any row opens the **Investigation Slide-Over Drawer**, showing full finding evidence, raw payload, and one-click PDF generation without leaving the page.

---

### Page 7: Threat Intelligence (`/app/intelligence`)
* Architectural explanation of the 70/30 hybrid scoring model.
* Searchable ledger of all deterministic detection rules (`RULE_URL_BRAND_*`, `RULE_EMAIL_SENDER_REPLY_MISMATCH`, `RULE_NET_BEACONING_ACTIVITY`, etc.) with weights and categories.

---

### Page 8: Incident Assessment Reports (`/app/reports`)
* List of compiled assessment reports.
* Instant ReportLab vector PDF download buttons.
* SIEM RFC CSV and JSON export buttons.

---

### Page 9: AI Defensive Copilot (`AIChatDrawer.tsx`)
* Slide-over conversational assistant available globally across all screens via `Cmd+K` or sidebar button.
* Automatically inherits context of the currently active scan record.
* Responds with specific evidence citations, severity breakdowns, and containment recommendations.

---

### Page 10 & 11: Analyst Profile & Security Settings
* **Profile (`/app/profile`):** Current analyst identity, role assignment, active session IP, and audit trail.
* **Settings (`/app/settings`):** Configurable scoring weights (Heuristic vs ML), Groq model selector, and `reduced_motion` accessibility toggle.
