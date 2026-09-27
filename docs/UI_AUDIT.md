# CYBERGUARD — Frontend UI/UX Comprehensive Audit

**Author:** Principal Product Engineer & Cybersecurity Architect  
**Project:** CYBERGUARD ("Scan. Explain. Protect.")  
**Date:** September 2026  
**Document Purpose:** Architectural audit of the existing frontend codebase prior to visual and structural refinement.

---

## 1. Executive Summary

CYBERGUARD is a defensive cybersecurity protection SaaS designed to inspect untrusted digital artifacts (URLs, emails, SMS messages, authentication logs, network telemetry, QR codes, and RFC 822 headers) without initiating outbound connections (Strict Zero-SSRF).

The application currently has a working React 18 + Vite + TypeScript frontend, backed by a FastAPI engine with SQLite persistence, Scikit-Learn threat classification, and ReportLab PDF compilation.

This audit evaluates the current visual system, component hierarchy, readability constraints, and performance bottlenecks to prepare for a **projector-first, enterprise-grade redesign** that satisfies hackathon criteria while avoiding generic hacker clichés.

---

## 2. Existing Page Inventory

| Route | Page Component | Primary Function | Current Visual State | Audit Finding |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `LandingPage.tsx` | Product showcase & value proposition | High-tech dark aesthetic, video/3D hero, capability grid | Strong visual appeal, but 3D canvas requires frame throttling and hero copy hierarchy needs clearer defensive framing. |
| `/login` | `LoginPage.tsx` | Restricted analyst entry point | Centered glass card with shield icon and input fields | Functional, but lacks enterprise presence. Needs **split-screen layout** with brand narrative on left and secure authentication on right. |
| `/app` | `DashboardPage.tsx` | High-level protection center & live KPIs | 4 KPI cards, rolling numbers, radar empty state, recent scans table | High projector readability. Empty state is excellent. Table row typography should be bumped from 13px to 15px minimum. |
| `/app/scanner` | `ScannerPage.tsx` | Primary threat analysis console | 7 vector tabs, quick preset pills, live pipeline progress bar | Highly responsive, but input area could be larger and stage transitions could have richer progressive disclosure. |
| *(embedded)* | `AnalysisResultScreen.tsx` | Visual centerpiece of detection & explanation | 7-step presentation hierarchy (`Input → Analysis → Score → Why → Evidence → AI → Response`) | Excellent hierarchy. The animated gauge coordinates are now stable. Needs larger badge contrast and dedicated print styling. |
| `/app/history` | `HistoryPage.tsx` | Chronological audit log & investigation drawer | Search, filters, pagination, slide-out drawer, PDF action | Functional and clear. Filter pills need higher contrast against dark surface. |
| `/app/intelligence` | `IntelligencePage.tsx` | Heuristics rule catalog & scoring engine specs | Card grid of rules, weights, and ML parameters | Informative, but lacks high-contrast visual category grouping and searchable filter bar. |
| `/app/reports` | `ReportsPage.tsx` | Downloadable incident assessment PDF library | List of compiled reports with PDF and JSON exports | Clean and functional. Needs report preview thumbnail modal. |
| `/app/analytics` | `AnalyticsPage.tsx` | Telemetry distributions and score trends | Pie charts, bar charts, KPI counters | Recharts components render well; chart line thicknesses need 2.5px+ for projector visibility. |
| `/app/profile` | `ProfilePage.tsx` | Security analyst identity & assigned role | Glass card with analyst metadata and credentials | Functional, minimal, and clean. |
| `/app/settings` | `SettingsPage.tsx` | Engine weights, AI toggle, motion toggle | Sliders for heuristic/ML weights, toggle switches | Functional. Setting sliders need clearer tooltips explaining scoring impact. |

---

## 3. Existing Component Inventory

### 3.1 Design System Primitives (`src/components/ui/`)
* **`GlassPanel.tsx`**: Standard glass container with `elevated` prop and optional `borderGlow` (`critical`, `suspicious`, `protected`, `information`).
* **`GlassButton.tsx`**: Button with variants (`primary`, `secondary`, `ghost`, `destructive`), loading spinners, and icon slots.
* **`GlassBadge.tsx`**: Pill badge supporting severity colors with optional pulsing dot.
* **`GlassInput.tsx` / `GlassTabs.tsx`**: Form inputs and segmented tab controls.
* **`GlassModal.tsx` / `GlassDrawer.tsx`**: Accessible dialogs and slide-over drawers with backdrop blur.
* **`GlassCommandPalette.tsx`**: Global keyboard command palette (`Cmd+K` / `Ctrl+K`) powered by `cmdk`.
* **`AnimatedRiskGauge.tsx`**: SVG semi-circle gauge (0–100) with calibrated needle and glow filter.
* **`RollingNumber.tsx` / `RollingKPI.tsx`**: Number animation powered by `@kitlangton/rolling-number`.

### 3.2 Advanced Motion & Visual Utilities (`src/components/magicui/`)
* **`BorderBeam.tsx`**: SVG stroke animation traveling along panel perimeter.
* **`SpotlightCard.tsx`**: Radial cursor-following spotlight effect.
* **`DecryptedText.tsx`**: Cryptographic scramble-to-plaintext character reveal.

### 3.3 3D & Landing Components (`src/components/canvas/`, `src/components/landing/`)
* **`ShieldCanvas.tsx`**: Three.js WebGL canvas displaying interactive rotating shield with wireframe rings.
* **`CinematicHero.tsx`**: Landing page hero section with terminal card and CTA triggers.
* **`CapabilityGrid.tsx` / `ProtectionWorkflow.tsx` / `SecurityArchitecture.tsx`**: Structural landing content.

### 3.4 Operational Components (`src/components/layout/`, `src/components/copilot/`)
* **`AppLayout.tsx`**: Persistent shell with top navbar, collapsible sidebar, and slide-over Copilot drawer.
* **`AIChatDrawer.tsx`**: Multi-turn AI Copilot chat drawer connecting to `/api/copilot/chat`.

---

## 4. Current Visual Language Evaluation

### 4.1 Strengths
1. **Curated Color Tokens**: Strict semantic mapping prevents confusion (`#00FF9D` Safe, `#00D9FF` AI/Info, `#FFBF3F` Suspicious, `#FF4D6D` Critical).
2. **Restrained Glassmorphism**: Avoids over-blurred frosted plastic; uses `rgba(255, 255, 255, 0.055)` with subtle `1px` borders.
3. **Typography Foundations**: System imports Inter (UI), Space Grotesk (Headings), and JetBrains Mono (Telemetry/Scores).
4. **Authentic Defensiveness**: The interface emphasizes detection, explanation, and protection rather than juvenile attack simulation.

### 4.2 Weaknesses & Deficiencies
1. **Projector Contrast on Muted Text**: The current `--text-muted` (`#687580`) has a contrast ratio of ~3.6:1 against `#08090C`, which degrades on low-lumens classroom or auditorium projectors. Needs adjustment to at least `#9AA4B2` (5.8:1) for secondary text and `#7A889B` for true muted text.
2. **Login Page Visual Impact**: The login page is a standard centered card rather than an immersive split-screen experience showcasing CYBERGUARD's defensive capabilities.
3. **Scanner Progressive Revelation**: The scanner progress bar is linear; hackathon judges should see real backend stages lighting up with progressive checkmarks and indicator badges.
4. **Three.js Performance & Fallback**: The 3D canvas runs continuously via `useFrame`. On battery-powered laptops or budget projectors, it should pause when offscreen and provide a pure SVG/CSS fallback under `prefers-reduced-motion`.
5. **Chart Readability**: Recharts SVG strokes and labels default to standard sizes (`12px`). For projector viewing, stroke widths must be at least `2.5px` and axis tick labels must be `14px–15px`.

---

## 5. Components Worth Preserving vs Components Requiring Redesign

| Component | Status | Action Required |
| :--- | :--- | :--- |
| `AnimatedRiskGauge.tsx` | **Preserve & Polish** | Retain exact coordinate math; enhance needle drop shadow and tick contrast. |
| `RollingKPI.tsx` | **Preserve** | Retain rolling number integration; expand font size to `44px–52px` for main KPIs. |
| `SpotlightCard.tsx` | **Preserve** | Retain subtle radial highlight; ensure fallback border on mobile/touch. |
| `BorderBeam.tsx` | **Preserve** | Retain smooth SVG offset animation; ensure color variables map to risk levels. |
| `GlassCommandPalette.tsx` | **Preserve & Expand** | Retain `cmdk` base; add direct quick-action links to all 7 scanner presets. |
| `AIChatDrawer.tsx` | **Preserve & Expand** | Retain slide-over panel; add evidence citation chips and markdown code formatting. |
| `LoginPage.tsx` | **Redesign** | Transform into split-screen layout with defensive product story on left and clean auth on right. |
| `CinematicHero.tsx` | **Redesign** | Simplify terminal mockup, eliminate text collisions, expand CTA button touch targets. |
| `ScannerPage.tsx` | **Polish & Deepen** | Expand input textarea dimensions; enrich stage transition state with micro-animations. |
| `IntelligencePage.tsx` | **Polish** | Add searchable rule catalog and category filter pills. |

---

## 6. Accessibility & Projector Compliance Checklist

* [x] **Zero SSRF Safety:** Inspection strictly offline/lexical.
* [x] **Semantic Colors:** Green = Safe, Amber = Warning, Red = High Risk, Cyan = AI.
* [ ] **Minimum Font Sizes:** Bump all table and caption fonts to >= 14px (body >= 16px).
* [ ] **Projector Contrast Threshold:** Ensure all foreground text meets WCAG AA (4.5:1) against `#08090C`.
* [ ] **Focus Rings:** Ensure visible 2px cyan focus rings on all keyboard-navigable controls (`:focus-visible`).
* [ ] **Reduced Motion Support:** Respect `prefers-reduced-motion` across all Framer Motion and Three.js elements.
