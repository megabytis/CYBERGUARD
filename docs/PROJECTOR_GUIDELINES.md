# CYBERGUARD — Projector-First Design & Hackathon Presentation Guidelines

**Author:** Principal Product Engineer & Cybersecurity Architect  
**Project:** CYBERGUARD ("Scan. Explain. Protect.")  
**Date:** September 2026  
**Document Purpose:** Presentation ergonomics, distance legibility rules, contrast ratios, and auditorium projector optimization.

---

## 1. The Hackathon Presentation Reality

College hackathons and investor pitch events present unique visual challenges:

1. **Low-Lumens Projection:** Auditorium and classroom projectors often suffer from washed-out blacks, low contrast ratios, and color desaturation.
2. **Long Viewing Distances:** Judges, evaluators, and audience members typically sit 5 to 15 meters away from the screen.
3. **Ambient Room Lighting:** Fluorescent ceiling lights are rarely fully dimmed during daytime hackathon judging rounds.
4. **Resolution Constraints:** While developer laptops run at $2560 \times 1600$ (Retina), projectors commonly downscale signals to $1920 \times 1080$ or $1366 \times 768$.

> **THE DISTANCE TEST:**  
> *"If a judge is sitting at the back of the auditorium, can they instantly see the risk score, know why it was flagged, and read the recommended response?"*

If a judge has to squint to read a 12px table row or decipher a low-contrast grey badge, the presentation fails.

---

## 2. Mandatory Projector Sizing Rules

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     PROJECTOR TYPOGRAPHY MINIMUMS                      │
├───────────────────────┬──────────────┬─────────────┬───────────────────┤
│ Element Role          │ Minimum Size │ Target Size │ Weight            │
├───────────────────────┼──────────────┼─────────────┼───────────────────┤
│ Main Threat Score     │ 72px         │ 80px–88px   │ 900 (Black Mono)  │
│ Hero Title            │ 60px         │ 72px–80px   │ 900 (Space Grotesk│
│ Section Headings      │ 28px         │ 32px–36px   │ 800 (Bold)        │
│ Dashboard KPI Metrics │ 40px         │ 48px–52px   │ 900 (JetBrains)   │
│ Card Headings         │ 20px         │ 22px–24px   │ 700 (Bold)        │
│ Primary Body Copy     │ 16px         │ 17px–18px   │ 500 (Medium Inter)│
│ Field Labels & Badges │ 15px         │ 16px        │ 600 (SemiBold)    │
│ Table Cells & Logs    │ 14px         │ 15px–16px   │ 500 (Mono/Inter)  │
└───────────────────────┴──────────────┴─────────────┴───────────────────┘
```

* **Absolute Floor:** No font size anywhere in the user interface may drop below `14px`.
* **Line Heights:** Generous line heights ($1.5$ to $1.6$) are enforced on all body text to prevent characters from merging into blurred lines on low-resolution displays.

---

## 3. Contrast & Ambient Light Penetration

1. **OLED Background Contrast:** The deep black `#08090C` background absorbs ambient light and maximizes the perceived luminescence of foreground elements.
2. **High-Contrast Text Hierarchy:**
   * Primary Text (`#F5F7FA`): 18.2:1 contrast ratio against `#08090C` (Far exceeds WCAG AAA 7:1).
   * Secondary Text (`#9AA4B2`): 6.8:1 contrast ratio (Exceeds WCAG AA 4.5:1).
   * Muted Text (`#7A889B`): 4.8:1 contrast ratio (Safely meets WCAG AA).
3. **Vibrant Semantic Neon Accents:**
   * Protected / Safe: `#00FF9D` (Luminous electric mint green — punctures room glare).
   * AI / Intelligence: `#00D9FF` (High-intensity neon cyan — signals analytical insight).
   * Warning / Suspicious: `#FFB020` (High-contrast amber gold — distinct from yellow).
   * Critical / High Risk: `#FF465A` (Intense coral red — immediate danger trigger).

---

## 4. Data Visualization & Chart Standards

Standard charting libraries often generate thin 1px lines and tiny 11px tick labels that become invisible on projectors. CYBERGUARD enforces:

1. **Stroke Width:** All Recharts lines and bar borders are set to a minimum of `2.5px–3px`.
2. **Axis Tick Labels:** Set to `14px` JetBrains Mono in `#9AA4B2`.
3. **Tooltip Formatting:** High-opacity dark glass backgrounds (`#0D1217`, 95% alpha) with `14px` high-contrast white text and 1px white border.
4. **No 3D Charts:** 3D charts create optical illusion distortion when viewed from off-axis projector angles. 2D flat geometric bars and arcs are strictly utilized.

---

## 5. Presentation Screen Checklist for Presenter

Before opening the demo to hackathon judges:

1. **Browser Zoom:** Set browser zoom to `100%` or `110%` if projector resolution is $1080p$.
2. **Full Screen:** Press `F11` (or `Cmd+Ctrl+F` on macOS) to hide browser tab clutter and present CYBERGUARD as a native desktop application.
3. **Dark Mode Verification:** Verify class `dark` is active on `<html>`.
4. **Resolution Lock:** Confirm display output is set to $1920 \times 1080$ at $60\text{Hz}$.
