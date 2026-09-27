# CYBERGUARD — Enterprise Design Language & Token Specification

**Author:** Principal Product Engineer & Cybersecurity Architect  
**Project:** CYBERGUARD ("Scan. Explain. Protect.")  
**Date:** September 2026  
**Document Purpose:** Master specification of visual tokens, color semantics, typography, glassmorphism tiers, and projector-optimized component standards.

---

## 1. Visual Identity & Product Character

CYBERGUARD is an enterprise-grade defensive cybersecurity protection SaaS. It balances two critical presentation goals:

1. **State-of-the-Art Aesthetic:** Premium dark glassmorphism, subtle 3D depth, and fluid motion that wows judges at first glance.
2. **High-Contrast Projector Legibility:** Guaranteed instant comprehension from 5–10 meters away in auditorium or conference environments ($1366 \times 768$ and $1920 \times 1080$).

### Design Anti-Patterns (Strictly Prohibited)
* **NO Hacker Clichés:** No green-on-black Matrix falling code, no terminal skull graphics, no fake cracking animations.
* **NO Cluttered SOC Gauges:** No unreadable telemetry graphs, no fake CPU/RAM dials, no decorative micro-charts.
* **NO Translucent Plastic Over-Blur:** Glassmorphism is restrained to dark optical glass with crisp inner highlights and high contrast text.

---

## 2. Color System & Semantic Contract

All visual colors in CYBERGUARD carry strict, unambiguous operational meaning:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        COLOR SEMANTIC CONTRACT                         │
├─────────────────┬───────────┬──────────────────────────────────────────┤
│ Semantic Role   │ Hex Code  │ Functional Meaning in CYBERGUARD         │
├─────────────────┼───────────┼──────────────────────────────────────────┤
│ Base Background │ #08090C   │ OLED deep black canvas, zero glare       │
│ Secondary Bg    │ #0D1117   │ Elevated page sections & sidebar         │
│ Elevated Card   │ #111820   │ Foreground containers & input wells      │
├─────────────────┼───────────┼──────────────────────────────────────────┤
│ SAFE / PROTECTED│ #00FF9D   │ Clean scan verdict, verified authentic   │
│ AI INTELLIGENCE │ #00D9FF   │ Groq AI reasoning, telemetry metadata    │
│ SUSPICIOUS / WARN│ #FFB020  │ Anomalous behavior, requires SOC review  │
│ HIGH RISK / CRIT│ #FF465A   │ Imminent threat, confirmed phishing / C2 │
├─────────────────┼───────────┼──────────────────────────────────────────┤
│ Text Primary    │ #F5F7FA   │ Main titles, risk scores, body copy      │
│ Text Secondary  │ #9AA4B2   │ Field labels, timestamps, metadata       │
│ Text Muted      │ #7A889B   │ Tertiary captions (4.8:1 projector safe) │
│ Border Subtle   │ rgba(255) │ 9% alpha subtle boundary                 │
│ Border Bright   │ rgba(255) │ 22% alpha highlighted boundary           │
└─────────────────┴───────────┴──────────────────────────────────────────┘
```

> **CRITICAL RULE:** Red (`#FF465A`) is reserved **exclusively** for high-risk findings, critical alerts, and destructive actions. It is never used as a decorative or layout accent.

---

## 3. Four-Tier Restrained Glassmorphism

Rather than arbitrary CSS blur values, CYBERGUARD defines four discrete optical glass tiers:

```css
/* Tier 1: Subtle Surface (Table rows, list items, background cards) */
.glass-tier-1 {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
}

/* Tier 2: Elevated Card (Standard KPI cards, evidence cards, toolbars) */
.glass-tier-2 {
  background: rgba(255, 255, 255, 0.065);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12),
              0 20px 40px -15px rgba(0, 0, 0, 0.7);
}

/* Tier 3: High-Priority Overlays (Modal dialogs, slide-over drawers, command palette) */
.glass-tier-3 {
  background: rgba(13, 18, 24, 0.85);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
              0 30px 60px -15px rgba(0, 0, 0, 0.85);
}

/* Tier 4: Hero Spotlight Feature (Risk score dial panel, hero preview console) */
.glass-tier-4 {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
              0 35px 70px -15px rgba(0, 0, 0, 0.9);
}
```

---

## 4. Projector-First Typography Hierarchy

Auditorium projectors frequently wash out thin fonts and shrink small labels. CYBERGUARD enforces strict minimum size constraints:

```text
Role                 Font Family       Desktop Size  Weight  Projector Readability
──────────────────────────────────────────────────────────────────────────────────
Main Hero Title      Space Grotesk     64px–80px     900     Dominates room from 15m
Section Heading      Space Grotesk     28px–36px     800     Instantly scans from 8m
Dominant Risk Score  JetBrains Mono    72px–88px     900     Unmissable verdict dial
Dashboard KPI Metric JetBrains Mono    44px–52px     900     Readable at a glance
Card Title           Space Grotesk     20px–22px     700     Crisp clear categorization
Primary Body Text    Inter             16px–18px     500     Minimum body size (no 12px)
Code / Telemetry     JetBrains Mono    14px–15px     500     Structured payload view
Form / Input Labels  Inter / Mono      15px–16px     600     Clear affordance
```

* **No font smaller than 14px anywhere in the application.**
* **All numeric metrics use JetBrains Mono tabular figures (`tnum`)** to prevent layout jitter during live rolling updates.

---

## 5. Layout & Spacing Tokens

* **8pt Spatial Grid:** All margins, paddings, and component dimensions are multiples of 8 (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
* **Container Max Width:** Fixed at `max-w-7xl` (`1280px`) to prevent ultra-wide distortion on auditorium screens while keeping cards clustered in the presenter's focus area.
* **Interactive Target Size:** Minimum clickable touch target is `44px \times 44px` across all buttons, tab items, and table action triggers.
