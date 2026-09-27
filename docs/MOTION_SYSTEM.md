# CYBERGUARD — Motion System & Animation Physics Specification

**Author:** Principal Product Engineer & Cybersecurity Architect  
**Project:** CYBERGUARD ("Scan. Explain. Protect.")  
**Date:** September 2026  
**Document Purpose:** Mathematical physics, transition curves, state-driven choreography, and reduced-motion standards.

---

## 1. Motion Philosophy

In CYBERGUARD, motion is treated as an operational state indicator rather than decorative ornamentation. Motion exists to:

1. **Direct Focus:** Draw the analyst's eye to high-priority threat indicators.
2. **Signal Progress:** Communicate background multi-stage analysis without blocking UI interaction.
3. **Reinforce Physical Mechanics:** Provide satisfying tactile feedback through rolling numbers and magnetic triggers.

---

## 2. Timing Tokens & Easing Curves

```css
:root {
  /* Durations */
  --duration-micro: 120ms;   /* Toggle switches, checkbox checks */
  --duration-fast:  180ms;   /* Button hover, dropdown open */
  --duration-base:  280ms;   /* Card entrances, drawer slides */
  --duration-slow:  450ms;   /* Page crossfades, modal reveals */
  --duration-hero:  800ms;   /* Risk gauge sweep, hero entrance */

  /* Easing Curves */
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);    /* High-speed snap entrance */
  --ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);   /* Smooth continuous moves */
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1); /* Needle deflection & bounce */
}
```

---

## 3. The 15 Core Motion Categories

| Category | Component / Trigger | Transition / Physics | Purpose |
| :--- | :--- | :--- | :--- |
| **1. Page Transitions** | Route change via React Router | Opacity crossfade `0 → 1` (250ms, ease-out-expo) | Seamless navigation without white flashes |
| **2. Section Reveals** | Viewport scroll entrance | Opacity `0 → 1`, Y `+16px → 0` | Staggered reading flow on landing page |
| **3. Card Entrances** | Component mount | Scale `0.97 → 1.0`, opacity `0 → 1` (200ms) | Natural materialization of telemetry cards |
| **4. Hover Elevation** | Cursor over GlassCard | Y `-2px`, border opacity `0.12 → 0.22`, shadow expansion | Clear affordance for clickable items |
| **5. Risk Score Dial** | Analysis result mount | Spring needle sweep from $-90^\circ$ to verdict angle | Visually communicates analytical convergence |
| **6. Number Rolling** | KPI count change | Physical cylinder rolling via `@kitlangton/rolling-number` | Dynamic numerical appreciation |
| **7. Gauge Needle** | Score recalculation | Damped spring (`stiffness: 120, damping: 14`) | Realistic physical meter deflection |
| **8. Evidence Reveal** | Scan completion | Staggered item entrance (60ms delay per row) | Progressive analytical breakdown |
| **9. AI Scramble/Type** | DecryptedText trigger | High-speed character scramble (35ms per cycle, 8 passes) | Authentic cryptographic decoding feel |
| **10. Timeline Progression**| Real scanner stages | Active pill pulse `opacity 0.7 ↔ 1.0`, checkmark pop | Transparent pipeline execution |
| **11. Command Palette** | `Cmd+K` press | Scale `0.95 → 1.0`, backdrop blur fade in | Instant, responsive operational HUD |
| **12. Sidebar Collapse** | Responsive toggle | Width `260px → 0px` (220ms, ease-out-expo) | Clean adaptive screen space reclamation |
| **13. Drawer Slide** | History row click | Slide from right `X: 100% → 0%` (280ms) | Contextual drill-down without page hop |
| **14. Hero Visual** | Mouse movement | Subtle mouse parallax (max $\pm 8\text{px}$) | Three-dimensional immersion |
| **15. 3D Shield Depth** | Hover over hero canvas | Continuous slow spin $\omega = 0.4\text{ rad/s}$, tilts on hover | Tactile security centerpiece |

---

## 4. Reduced-Motion Implementation Contract

Users who activate `prefers-reduced-motion: reduce` in their operating system or through CYBERGUARD Settings (`/app/settings`) must experience a completely stable, non-disorienting interface:

1. **All scale and position transforms are neutralized:** `transform: none !important`.
2. **Durations drop to zero or instant opacity crossfades:** Transitions replace motion with instantaneous display or 100ms alpha changes.
3. **Three.js Canvas halts continuous rotation:** Renders a static centered defensive shield posture.
4. **Number rolling replaced by static numeral display:** Immediate text update without scrolling digits.
