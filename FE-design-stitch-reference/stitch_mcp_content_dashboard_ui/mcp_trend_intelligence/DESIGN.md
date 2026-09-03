---
name: MCP Trend Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#3e3fcc'
  on-tertiary: '#ffffff'
  tertiary-container: '#585be6'
  on-tertiary-container: '#f1eeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-headline:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 2.5rem
  space-3xl: 3rem
  grid-gutter: 1.5rem
  grid-margin: 2rem
---

## Brand & Style

This design system delivers a high-precision, executive-level analytics environment tailored for content strategists, brand directors, and social media analysts. The interface balances high-density data visualization with an airy, calming visual rhythm, inspired by contemporary SaaS leaders.

The visual style blends **Modern Corporate** reliability with refined **Tonal Modernism**:
- **Clarity and Precision**: Dense numerical metrics and trend charts are framed within structured cards to prevent cognitive overload.
- **Airy Tactility**: Elevated pure-white cards hover lightly over a cool slate canvas, providing clear physical separation without heavy structural dividers.
- **Vibrant Intentionality**: Color is deployed strictly as functional data markers—electric blues for focal actions and data trajectories, emeralds for upward momentum, and soft indigos for metadata classification.

## Colors

The palette establishes an authoritative, high-trust dashboard aesthetic rooted in a crisp, light-mode-first environment.

### Core Roles
- **Canvas / Root Background**: `#F8FAFC` (Slate 50) transitions to `#F1F5F9` (Slate 100) for inset containers and secondary module rails.
- **Card Surface**: `#FFFFFF` (Pure White) serves as the primary canvas for all analytical widgets, forms, and tables.
- **Structural Outlines**: `#E2E8F0` (Slate 200) creates hairline separations with crisp clarity.
- **Primary Action & Focus**: `#2563EB` (Cobalt Blue) drives navigation anchors, primary buttons, active trend lines, and critical path states. `#3B82F6` acts as the hover companion.
- **Positive Metric / Success**: `#10B981` (Emerald Green) highlights growth vectors, upward audience shifts, and healthy ingestion statuses.
- **Insight / Taxonomy**: `#6366F1` (Indigo/Violet) anchors topic clusters, algorithm alerts, and tag classification badges.
- **Text Tiers**:
  - Primary Text: `#0F172A` (Slate 900) for high-contrast, fatigue-free legibility.
  - Secondary Text: `#475569` (Slate 600) for structural labels and body copy.
  - Muted Text: `#64748B` (Slate 500) for timestamps, metadata, and empty states.
  - Border Inactive: `#CBD5E1` (Slate 300) for unfocused input rings.

## Typography

The typography architecture uses a dual-font structure:

1. **Plus Jakarta Sans (Headings, Stats, Metrics)**: Provides geometric polish, subtle personality, and modern tech authority to page headers, module titles, and dashboard KPI values.
2. **Inter (Body, UI Controls, Data Tables)**: Guarantees legibility across data grids, dense analytical tables, subtext, and form fields.

### Application Guidelines
- **KPI Metrics**: Always render high-level social stats using `metric-headline` with tabular numerals enabled (`font-variant-numeric: tabular-nums`) to prevent jitter across real-time polling updates.
- **Section Kickers**: Pair `label-sm` in uppercase with letter spacing of `0.04em` in muted slate (`#64748B`) above card titles for category taxonomy.

## Layout & Spacing

The platform is designed around a strictly aligned 8pt system, using a fluid 12-column grid layout inside an application shell.

### Grid & Breakpoints
- **Desktop (>= 1280px)**: 12-column grid with `1.5rem` (24px) gutters and a fixed left-rail navigation (260px width). Max content width capped at 1600px.
- **Tablet (768px - 1279px)**: 8-column layout with `1rem` (16px) gutters; sidebar collapses to an icon-only rail (72px width).
- **Mobile (< 768px)**: 4-column layout with `1rem` margins and `0.75rem` gutters. Cards stack vertically into a single-column sequence; navigation collapses to a top bar and bottom action sheet.

### Rhythmic Rules
- **Component Interiors**: Standard analytics cards use `1.5rem` (24px) internal padding, scaling down to `1rem` (16px) on mobile viewports.
- **Stacking Spacing**: Metric badges and contextual deltas sit strictly `0.25rem` or `0.5rem` from their associated metric headers to maintain atomic association.

## Elevation & Depth

Visual depth is achieved through an interplay of **subtle borders, layered surfaces, and ambient shadows**. High contrast drops are strictly avoided to preserve a clean, clinical aesthetic.

### Elevation Hierarchy
- **Level 0 (Canvas)**: Background `#F8FAFC`, flat, 0px offset.
- **Level 1 (Card & Module Resting)**:
  - Background: `#FFFFFF`
  - Border: 1px solid `#E2E8F0`
  - Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`
- **Level 2 (Hovered Card & Interactive Elements)**:
  - Background: `#FFFFFF`
  - Border: 1px solid `#CBD5E1`
  - Shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.04)`
- **Level 3 (Dropdowns, Popovers, Trend Filter Sheets)**:
  - Background: `#FFFFFF`
  - Border: 1px solid `#E2E8F0`
  - Shadow: `0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)`
- **Level 4 (Modals & Command Palettes)**:
  - Background: `#FFFFFF`
  - Backdrop: `rgba(15, 23, 42, 0.4)` with 4px backdrop blur.
  - Shadow: `0 20px 32px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)`

## Shapes

The design system employs a refined geometric corner scale that balances friendly modernism with analytical utility.

### Corner Radii Guidelines
- **Outer Card Shells (`rounded-2xl` / 16px)**: Applied to all primary trend charts, insight containers, and dashboard metric grids.
- **Inner Modules & Interactive Inputs (`rounded-lg` / 8px to 10px)**: Applied to text input fields, dropdown select triggers, and action buttons.
- **Status Tags & Pill Badges (`rounded-full` / 9999px)**: Applied to growth delta tags (+12.4%), channel platform chips (e.g., TikTok, LinkedIn), and lifecycle indicators.

## Components

### Buttons
- **Primary**: Background `#2563EB`, text `#FFFFFF`, font `label-lg`, radius 10px. Hover: `#1D4ED8`. Active state scales to 0.99 with soft box-shadow `0 0 0 3px rgba(37, 99, 235, 0.2)`.
- **Secondary**: Background `#FFFFFF`, border 1px solid `#E2E8F0`, text `#0F172A`. Hover: `#F8FAFC` with border `#CBD5E1`.
- **Ghost**: Background transparent, text `#475569`. Hover: `#F1F5F9`, text `#0F172A`.

### Badges & Trend Chips
- **Positive Trend Chip**: Background `#ECFDF5` (Emerald 50), text `#059669` (Emerald 700), border 1px solid `#A7F3D0`. Includes a 12px directional arrow icon.
- **Neutral/Category Badge**: Background `#EEF2FF` (Indigo 50), text `#4F46E5` (Indigo 600), border 1px solid `#C7D2FE`. Rounded-full, padding `2px 8px`.

### Input Fields & Search Bars
- Background `#FFFFFF`, border 1px solid `#E2E8F0`, text `#0F172A`, placeholder `#94A3B8`.
- Height: 40px for filters, 44px for primary global inputs.
- Focus: Border color `#2563EB`, outer ring `3px solid rgba(37, 99, 235, 0.15)`.

### Cards & Analytical Widgets
- Pure white `#FFFFFF` surface, 1px solid `#E2E8F0` border, `rounded-2xl` (16px).
- Internal layout features a dedicated card header bar (title in `headline-sm`, action icon or date range selector), followed by a 1px border divider (`#F1F5F9`) or seamless whitespace transition to the chart canvas.

### Checkboxes & Radio Controls
- Size: 18px x 18px. Border 1.5px solid `#CBD5E1`.
- Checked state: Background `#2563EB`, border `#2563EB`, crisp white checkmark icon.

### Data Tables
- Header row uses background `#F8FAFC`, text `#64748B` in `label-sm`, uppercase, height 40px.
- Table body rows: Height 52px, border-bottom 1px solid `#F1F5F9`. Hover state shifts row background to `#F8FAFC`.