# CYBERGUARD — No-Code Design Decision Gate Document

**Product:** CYBERGUARD ("Scan. Explain. Protect.")  
**Discipline:** Enterprise Defensive Cybersecurity SaaS  
**Audience:** Hackathon Judges, Security Evaluators, SOC Analysts  
**Presentation Context:** Large Auditorium Projectors ($1366 \times 768$ and $1920 \times 1080$, 5–10m viewing distance)

---

## 1. Final Visual Direction

CYBERGUARD is designed as a **mission-critical defensive cybersecurity console** that balances premium presentation aesthetic with immediate auditorium-distance comprehension.

### Core Character:
* **Enterprise Security Console:** Clean, authoritative, and data-grounded. Zero toy/hacker gimmicks.
* **Optical Dark Glassmorphism:** Restrained translucent layers with crisp inner highlights (`rgba(255,255,255,0.065)` over `#08090C`).
* **High-Contrast Presentation UI:** Every verdict, score, and recommendation is readable without squinting.
* **Strict Semantic Integrity:** Colors have fixed operational meanings. Green means verified safe, amber means review required, red means critical threat, and cyan means AI reasoning.
* **Elimination of Tropes:** Strictly prohibited: Matrix falling text, skull emblems, fake terminal cracking animations, and decorative hardware dials (CPU/RAM).

---

## 2. Component Sources Researched

We evaluated seven modern React design systems and animation ecosystems:
1. **shadcn/ui:** Headless accessible primitives (Radix UI, `cmdk` command palette, dialogs, drawers).
2. **Aceternity UI:** Spotlight cards, border beam animations, bento layouts, tracing beams.
3. **Magic UI:** Decrypted text character reveal, dot/grid pattern backgrounds, number tickers.
4. **21st.dev:** High-tech HUD layouts, interactive terminal previews, slide-out investigation panels.
5. **React Bits:** Magnetic buttons, interactive canvas elements, scroll animations.
6. **Motion / Framer Motion:** Fluid state-driven layout choreography, `AnimatePresence` stage transitions.
7. **Three.js / React Three Fiber:** WebGL procedural 3D shields and wireframe defensive geometries.

---

## 3. Components Selected (Adapted & Owned in Repository)

| Component Pattern | Source Origin | Implementation in CYBERGUARD | Purpose |
| :--- | :--- | :--- | :--- |
| **Command Palette** | shadcn (`cmdk`) | `GlassCommandPalette.tsx` | Global keyboard access (`Cmd+K` / `Ctrl+K`) for rapid vector jumps during live demos |
| **Spotlight Card** | Aceternity | `SpotlightCard.tsx` | Cursor-following radial luminescence that gently reveals card boundaries on hover |
| **Border Beam** | Aceternity / Magic UI | `BorderBeam.tsx` | Perimeter glowing beam highlighting completed verdicts and critical threat cards |
| **Decrypted Text** | Magic UI | `DecryptedText.tsx` | High-speed cryptographic character scramble revealing final verified text |
| **Accessible Drawer** | shadcn (Radix Sheet) | `GlassModal.tsx` (`GlassDrawer`) | Slide-over investigation inspector and multi-turn AI Copilot chat drawer |
| **Segmented Tabs** | shadcn (Radix Tabs) | `GlassTabs.tsx` | High-contrast vector switching (URL, Email, SMS, QR, Auth, Network, Headers) |
| **Rolling Numbers** | Kit Langton | `RollingNumber.tsx` / `RollingKPI.tsx` | Physical mechanical-rolling odometer animation for KPIs and risk scores |
| **Procedural 3D Shield** | Three.js / R3F | `ShieldCanvas.tsx` | Interactive rotating wireframe shield on landing page hero |

---

## 4. Components Rejected

| Pattern Evaluated | Source Origin | Verdict | Rejection Rationale |
| :--- | :--- | :--- | :--- |
| **Sparkles / Cosmic Meteors** | Aceternity | **REJECTED** | Inappropriate for an enterprise defensive security tool; damages credibility. |
| **Typewriter Letter-by-Letter** | Magic UI | **REJECTED** | Distracting and slow; replaced with cryptographic `DecryptedText`. |
| **Marquee Scrolling Bands** | Magic UI | **REJECTED** | Creates constant unneeded motion that strains eyes on low refresh rate projectors. |
| **SplitText Staggered Scramble** | React Bits | **REJECTED** | Visual disorientation on auditorium projectors; reduces initial legibility. |
| **Gooey / Liquid Morphing Tabs** | React Bits | **REJECTED** | Liquid fluid shapes contradict the sharp, precise defensive identity of CYBERGUARD. |
| **Full-Screen 3D Particle Canvas**| Three.js | **REJECTED** | Severe GPU battery drain and thermal throttling on presenter laptops. |
| **3D Data Charts** | Three.js / D3 3D | **REJECTED** | 3D bar/pie charts are unreadable on projectors; 2D Recharts with thick strokes are 100x clearer. |

---

## 5. Final Color System

```text
┌──────────────────┬──────────────┬──────────────────────────────────────────────┐
│ Semantic Role    │ Hex Code     │ Operational Rule                             │
├──────────────────┼──────────────┼──────────────────────────────────────────────┤
│ Base Background  │ #08090C      │ Pure dark OLED canvas, eliminates glare      │
│ Secondary Bg     │ #0D1117      │ Sidebar, secondary wells, split panels       │
│ Elevated Card    │ #111820      │ Foreground glass containers, input wells     │
├──────────────────┼──────────────┼──────────────────────────────────────────────┤
│ SAFE / PROTECTED │ #00FF9D      │ Electric mint green: clean scans & verified  │
│ AI INTELLIGENCE  │ #00D9FF      │ Luminous cyan: Groq AI, explanations, info   │
│ WARNING / SUSP   │ #FFB020      │ Amber gold: anomalies, SOC review required   │
│ CRITICAL / HIGH  │ #FF465A      │ Electric crimson: confirmed high-risk threat │
├──────────────────┼──────────────┼──────────────────────────────────────────────┤
│ Text Primary     │ #F5F7FA      │ 18.2:1 contrast ratio against #08090C        │
│ Text Secondary   │ #9AA4B2      │ 6.8:1 contrast ratio (exceeds WCAG AA)       │
│ Text Muted       │ #7A889B      │ 4.8:1 contrast ratio (projector safe floor)  │
│ Borders Subtle   │ rgba(255) 9% │ Restrained structural delineation            │
│ Borders Bright   │ rgba(255)22% │ High-priority highlights and hover targets   │
└──────────────────┴──────────────┴──────────────────────────────────────────────┘
```

> **STRICT CONTRACT:** Red (`#FF465A`) is used **only** for high risk, critical findings, and destructive confirmations. It is never used decoratively.

---

## 6. Typography Scale & Standards

* **Inter (`font-sans`):** Primary UI, body copy, descriptions, input text.
* **Space Grotesk (`font-display`):** Section titles, hero headlines, modal headings.
* **JetBrains Mono (`font-mono`):** Risk scores, technical identifiers, logs, timestamps, rules.

### Projector Sizing Scale:
* **Main Risk Score:** `72px–88px` (Black Mono)
* **Hero Heading:** `64px–80px` (Space Grotesk)
* **Dashboard KPIs:** `44px–52px` (JetBrains Mono)
* **Section Titles:** `28px–36px`
* **Card Headings:** `20px–24px`
* **Primary Body Copy:** `16px–18px`
* **Table Cells & Badges:** `14px–16px`
* **Absolute Minimum Font:** `14px` (Zero text under 14px anywhere in the app)

---

## 7. Four-Tier Restrained Glassmorphism

```css
/* Tier 1: Subtle Surface */
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);

/* Tier 2: Elevated Card */
background: rgba(255, 255, 255, 0.065);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.12);
box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 20px 40px -15px rgba(0, 0, 0, 0.7);

/* Tier 3: Modals, Drawers & Command Palette */
background: rgba(13, 17, 23, 0.88);
backdrop-filter: blur(28px);
border: 1px solid rgba(255, 255, 255, 0.18);

/* Tier 4: Hero Centerpieces */
background: linear-gradient(135deg, rgba(0, 217, 255, 0.08) 0%, rgba(0, 255, 157, 0.04) 100%);
backdrop-filter: blur(32px);
border: 1px solid rgba(0, 217, 255, 0.35);
```

---

## 8. Motion System Standards

* **Purpose-Driven Only:** Motion signals operational state, pipeline execution, or threat level.
* **Durations:** Micro: `120ms` | Fast: `180ms` | Base: `280ms` | Slow: `450ms` | Hero Gauge: `800ms`.
* **Physics:** Needle bounce uses damped spring (`stiffness: 120, damping: 14`).
* **Accessibility:** `prefers-reduced-motion` unconditionally disables transforms and frame animations.

---

## 9. 3D Strategy

* **Isolated Landing Hero:** Three.js procedural shield with wireframe rings rendered only on the landing page hero.
* **GPU Preservation:** Automatically throttled to 30 FPS when inactive, paused when scrolled offscreen.
* **No Dashboard 3D:** Dashboard, Scanner, Result, History, Intelligence, and Reports use pure GPU-accelerated CSS and 2D SVG canvas for instant 60 FPS rendering.

---

## 10. Page Hierarchy & Flow

```text
USER INPUT
    ↓
CYBERGUARD ANALYSIS
    ↓
RISK SCORE
    ↓
WHY?
    ↓
EVIDENCE
    ↓
AI EXPLANATION
    ↓
RECOMMENDED RESPONSE
```

### Complete Console Map:
* `/` — Landing Page (Launch hero, capability matrix, explainable security showcase, zero-SSRF architecture)
* `/login` — Split-Screen Authentication (Product identity on left, secure login on right, zero signup/demo creds)
* `/app` — Protection Center (4 rolling KPIs, risk activity, detection sources, live AI security insight)
* `/app/scanner` — Analysis Workspace (7 vectors, quick presets, real progressive pipeline, 7-step dominant result view)
* `/app/history` — Activity & Audit Ledger (Investigation drawer, high-contrast filters, SIEM CSV/JSON exports)
* `/app/intelligence` — Threat Intelligence & Trends (Risk trends, detection distributions, anomaly patterns, rule catalog)
* `/app/reports` — Executive Assessment Library (PDF/JSON deliverables, assessment preview modal)
* `/app/copilot` — AI Defensive Assistant (Evidence-grounded conversational interrogation)
* `/app/profile` — Operator Credentials & Role Verification
* `/app/settings` — Heuristic/ML Weights, AI Toggle, Reduced Motion Controls

---

## 11. Projector Presentation Strategy

* **5-to-10 Meter Legibility:** All key takeaways (Risk Score, Verdict, Findings Count, Recommended Actions) are oversized and visible from the back of an auditorium.
* **Thick Chart Strokes:** Recharts lines $\ge 2.5\text{px}$, bar radii $6\text{px}$, axis labels $\ge 13\text{px}$.
* **No Overlapping Text:** Generous spacing, flex wrapping, and strict container bounds prevent clipping or collision on low-resolution displays.
* **Live Dynamic Telemetry:** Zero fake numbers. Scans executed in the workspace immediately illuminate the dashboard KPIs, charts, and history.
