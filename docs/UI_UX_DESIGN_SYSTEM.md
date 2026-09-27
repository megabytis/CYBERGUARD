# CYBERGUARD — UI/UX Design System Specification

## 1. Design Direction: Projector-Friendly Enterprise Glassmorphism

CYBERGUARD is engineered for real-world Security Operations Centers (SOCs), boardroom briefings, and conference presentations where the UI is projected on large screens. 

### Core Principles
1. **High-Contrast Legibility:** High ambient light in meeting rooms diminishes low-contrast interfaces. Text and metrics must pop against dark, velvety surfaces.
2. **Restrained Glassmorphism:** Glass effects use subtle blurs (`backdrop-filter: blur(20px)`), translucent fills (`rgba(255,255,255,0.055)`), and ultra-fine borders (`rgba(255,255,255,0.12)`) without neon glare or illegible text backgrounds.
3. **Semantic Hierarchy:** Color strictly signals threat and security status:
   - **Protected / Safe:** Emerald Green (`#00FF9D`)
   - **Information / Telemetry / AI:** Cyber Cyan (`#00D9FF`)
   - **Suspicious / Warning:** Amber Gold (`#FFBF3F`)
   - **Critical / High Risk:** Crimson Coral (`#FF4D6D`)
4. **Cinematic Hero Visuals:** A sleek 3D shield with ambient orbital rings on the public landing page, immediately giving a sense of cutting-edge defense.
5. **No Layout Shifts:** Stable sizing, skeleton loaders, and zero jitter during rolling number animations.

---

## 2. Color Palette & Design Tokens

```css
:root {
  /* Backgrounds */
  --background: #08090C;
  --background-elevated: #0D1217;
  --surface: #111820;
  --surface-glass: rgba(255, 255, 255, 0.055);
  --surface-glass-hover: rgba(255, 255, 255, 0.085);
  
  /* Text & Foreground */
  --text-primary: #F5F7FA;
  --text-secondary: #9AA6B2;
  --text-muted: #687580;
  
  /* Borders */
  --border: rgba(255, 255, 255, 0.12);
  --border-bright: rgba(255, 255, 255, 0.22);
  --border-glass: rgba(255, 255, 255, 0.08);

  /* Semantic Security States */
  --protected: #00FF9D;
  --protected-glow: rgba(0, 255, 157, 0.25);
  --protected-subtle: rgba(0, 255, 157, 0.12);

  --information: #00D9FF;
  --information-glow: rgba(0, 217, 255, 0.25);
  --information-subtle: rgba(0, 217, 255, 0.12);

  --suspicious: #FFBF3F;
  --suspicious-glow: rgba(255, 191, 63, 0.25);
  --suspicious-subtle: rgba(255, 191, 63, 0.12);

  --critical: #FF4D6D;
  --critical-glow: rgba(255, 77, 109, 0.25);
  --critical-subtle: rgba(255, 77, 109, 0.12);
}
```

---

## 3. Typography Scale & Projector Standards

- **Interface Text:** Inter (`font-sans`)
- **Hero & Section Headings:** Space Grotesk (`font-display`)
- **Technical Telemetry / IDs / Hashes / Code:** JetBrains Mono (`font-mono`)

### Target Projector Sizes
- **Body Text:** Minimum `16px` (`text-base`), comfortable reading from across a conference room.
- **Form / Input Labels:** Minimum `18px` (`text-lg font-medium`).
- **Dashboard KPI Figures:** `40px` to `48px` (`text-4xl` / `text-5xl font-bold font-mono`).
- **Primary Risk Score Hero:** `72px` to `84px` (`text-6xl` to `text-7xl font-black font-mono`).
- **Action Buttons:** Minimum `44px` height (`h-11` or `h-12`) with `px-6` padding.
- **Chart Axis & Legends:** Minimum `14px` with high contrast against the chart background.

---

## 4. Reusable Glass Component Specifications

### 4.1 `GlassPanel` & `GlassCard`
- **Background:** `rgba(255, 255, 255, 0.04)` to `rgba(255, 255, 255, 0.065)`
- **Backdrop Filter:** `blur(20px)`
- **Border:** `1px solid rgba(255, 255, 255, 0.12)`
- **Top Inner Glow:** Inset box-shadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`
- **Outer Shadow:** `0 20px 40px -15px rgba(0, 0, 0, 0.7)`
- **Radius:** `rounded-2xl` (`16px`)

### 4.2 `GlassButton` (Liquid Glass Variants)
- **Primary:** Background tinted with brand cyan or protected green gradient, subtle translucent sheen, white text, hover lift (`translate-y-[-1px]`), active scale (`0.98`).
- **Secondary:** Neutral glass (`rgba(255,255,255,0.06)`), border `rgba(255,255,255,0.15)`, text primary.
- **Ghost:** Transparent background, visible border on hover, text secondary transitioning to primary.
- **Icon:** Square or circle 44px container with centered Lucide icon and tooltip.
- **Destructive:** Subtle crimson glass tint (`rgba(255, 77, 109, 0.15)`), border `rgba(255, 77, 109, 0.3)`.

### 4.3 `GlassTabs`
- Segmented control pills resting on a dark elevated tray (`#0D1217`).
- Active tab features smooth layout animation (`layoutId="activeTabPill"` via Motion), highlighted border, and crisp typography.

### 4.4 `GlassModal` & `GlassDrawer`
- Full backdrop blur (`backdrop-blur-md bg-black/60`).
- Slide-over drawer with spring physics (`damping: 25, stiffness: 200`).
- Dismissible via Escape key, backdrop click, or close button.

### 4.5 `AnimatedRiskGauge`
- Semi-circular SVG gauge displaying 0 to 100 with smooth stroke animation.
- Dynamic color interpolation:
  - 0–30: Emerald Green
  - 31–70: Amber Gold
  - 71–100: Crimson Coral
- Center display features `@kitlangton/rolling-number` for numerical score transitions.

---

## 5. Motion and Accessibility Standards

- **Hardware Acceleration:** All animations use `transform` and `opacity` to avoid repaints.
- **Accessibility:** 
  - Standard focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400`).
  - Screen reader friendly labels (`aria-label`, `role="status"`, `aria-live="polite"` on rolling scores).
  - Explicit check for `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active, animated transforms resolve instantly.
- **Three.js / WebGL Fallback:**
  - If WebGL context creation fails or throws an exception, an animated SVG Shield with glowing CSS rings renders seamlessly in place.
