# CYBERGUARD — Complete Component Inventory & API Contract

**Author:** Principal Product Engineer & Cybersecurity Architect  
**Project:** CYBERGUARD ("Scan. Explain. Protect.")  
**Date:** September 2026  
**Document Purpose:** Detailed specification of all reusable frontend components, prop contracts, styling tokens, and behavioral rules.

---

## 1. Glass Core Components (`src/components/ui/`)

### 1.1 `GlassPanel`
The primary structural container for grouping related content and telemetry.
```typescript
interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean; // Selects Tier 2 vs Tier 1 glass
  borderGlow?: 'critical' | 'suspicious' | 'protected' | 'information' | 'none';
  children: React.ReactNode;
}
```
* **Styling:** Uses backdrop blur (`20px–24px`), 1px translucent border, subtle inner highlight `inset 0 1px 0 0 rgba(255,255,255,0.12)`.
* **Glow Variants:** Sets colored border highlight and drop shadow corresponding to risk verdict.

### 1.2 `GlassButton`
High-contrast action triggers with integrated loading spinners and icon slots.
```typescript
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}
```
* **Primary:** `#00D9FF` cyan with `#08090C` text and cyan glow shadow (`shadow-info-glow`).
* **Secondary:** Dark glass with border highlight and white text.
* **Destructive:** `#FF465A` tinted glass with red border.
* **Touch Target:** Minimum height `44px` (size `md`), `52px` (size `lg`).

### 1.3 `GlassBadge`
Status and classification pills displaying verdict and severity.
```typescript
interface GlassBadgeProps {
  variant: 'critical' | 'suspicious' | 'protected' | 'information' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}
```
* **Critical:** `#FF465A` background alpha 15%, border 35%, text `#FF465A`.
* **Suspicious:** `#FFB020` background alpha 15%, border 35%, text `#FFB020`.
* **Protected:** `#00FF9D` background alpha 15%, border 35%, text `#00FF9D`.
* **Information:** `#00D9FF` background alpha 15%, border 35%, text `#00D9FF`.

### 1.4 `GlassTabs`
Accessible segmented controls for switching between the 7 inspection vectors.
```typescript
interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface GlassTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: 'md' | 'lg';
}
```
* Uses Framer Motion `layoutId="activeTabPill"` for fluid sliding indicator pill.

### 1.5 `GlassModal` & `GlassDrawer`
Headless Radix-backed overlays for dialogs and deep inspection panels.
```typescript
interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
```
* Features blur backdrop (`blur-md`), keyboard `Esc` listener, and focus trapping.

---

## 2. Security & Detection Components

### 2.1 `AnimatedRiskGauge`
Calibrated SVG semi-circle gauge (0–100) communicating risk score.
* **ViewBox:** Fixed coordinate system `0 0 320 180` to prevent layout collapse.
* **Arc:** Colored SVG gradient from `#00FF9D` (Safe, 0–30) through `#FFBF3F` (31–70) to `#FF465A` (71–100).
* **Needle:** Smoothly animates angle from $-90^\circ$ (Score 0) to $+90^\circ$ (Score 100) via Framer Motion spring physics.
* **Score Text:** Centered 72px bold JetBrains Mono digits with drop shadow.

### 2.2 `RollingKPI`
High-visibility KPI card utilizing `@kitlangton/rolling-number`.
```typescript
interface RollingKPIProps {
  title: string;
  value: number;
  suffix?: string;
  icon?: React.ReactNode;
  status?: 'protected' | 'information' | 'suspicious' | 'critical';
  subtitle?: string;
}
```
* Numbers mechanically roll to the new target value on update.
* Digits sized at 44px–52px for distance legibility.

### 2.3 `EvidenceStrengthBar`
Confidence and weight meter for each deterministic finding.
* Displays confidence percentage (e.g., `94% Confidence`) and visual fill bar with color corresponding to severity.

### 2.4 `SpotlightCard`
Cursor-following radial highlight card.
* Reveals soft illumination on mouse movement (`rgba(0, 217, 255, 0.15)` or severity tint).
* Touch screens fallback to clean static glass border.

### 2.5 `BorderBeam`
Animated traveling gradient beam along card perimeter.
* Applied to the Analysis Result header, high-risk detection cards, and tactical radar.

### 2.6 `DecryptedText`
Tactical text scrambler that rapidly cycles through cryptographic characters before resolving into plaintext.
* Used for verdict resolved notices, status headers, and tactical badges.

---

## 3. Layout & Navigation Shell

### 3.1 `GlassSidebar`
Desktop left navigation panel:
* System operational status indicator with pulsing dot.
* Primary navigation links (`Overview`, `Analyze`, `Activity`, `Intelligence`, `Reports`).
* AI Copilot launch trigger.
* Profile & Settings shortcuts.
* Bottom defense status pill ("DEFENSE ENGINE ONLINE").

### 3.2 `GlassNavbar`
Global top header:
* CYBERGUARD shield logo and typography.
* Global Search / Command Palette shortcut (`Cmd+K`).
* Security level indicator ("AIR GAP ACTIVE • ZERO-SSRF").
* Analyst profile badge with sign-out trigger.

### 3.3 `GlassCommandPalette`
Global keyboard command modal:
* Quick search across pages, scanner vectors, and incident presets.
* Keyboard navigable via arrow keys and Enter.
