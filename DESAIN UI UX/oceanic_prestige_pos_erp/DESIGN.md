---
name: Oceanic Prestige POS & ERP
colors:
  surface: '#faf9f8'
  surface-dim: '#dadad9'
  surface-bright: '#faf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f2'
  surface-container: '#eeeeed'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e1'
  on-surface: '#1a1c1c'
  on-surface-variant: '#40484c'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f0f0'
  outline: '#70787c'
  outline-variant: '#c0c8cc'
  surface-tint: '#26657b'
  primary: '#003b4b'
  on-primary: '#ffffff'
  primary-container: '#095368'
  on-primary-container: '#8bc5de'
  inverse-primary: '#94cfe8'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#19384c'
  on-tertiary: '#ffffff'
  tertiary-container: '#314f64'
  on-tertiary-container: '#a2c0d8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeaff'
  primary-fixed-dim: '#94cfe8'
  on-primary-fixed: '#001f29'
  on-primary-fixed-variant: '#004d62'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#c8e6ff'
  tertiary-fixed-dim: '#accae3'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#2c4a5e'
  background: '#faf9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e3e2e1'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  title-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1.25rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes an opulent, commanding, and ultra-refined operational experience tailored for multi-vertical enterprise POS and ERP workflows. Moving away from muted, earthly forest teals, the aesthetic embraces an oceanic majesty: deep abyssal navy undertones layered with luminous emerald-cyan tides and accented by warm, gilded champagne gold. 

The personality is authoritative, bespoke, and seamless—evoking the quiet confidence of high-end private banking terminals and flagship retail concierge desks. The design movement marries **Modern Precision Minimalism** with **Atmospheric Layering**: dense, mission-critical operational grids meet pristine pearl-and-ivory canvases, subtle metallic lusters, and razor-sharp typographic execution.

## Colors
The palette balances oceanic depth against warm, metallic luxury and pristine porcelain surfaces:

- **Primary (`#095368` - Deep Oceanic Emerald / Cerulean Emerald):** Represents central action items, active POS registers, selected states, and core system navigation. It merges deep maritime blue with brilliant emerald-cyan radiance.
- **Secondary (`#d4af37` - Champagne Gold / Imperial Foil):** Reserved for high-value transactional highlights, executive approvals, VIP tags, total balance summaries, and premium status chips. Must be paired with high-contrast inks to maintain compliance.
- **Tertiary (`#04283b` - Abyssal Navy):** Serves as the structural anchor for sidebars, persistent ERP navigation chrome, header summaries, and primary high-density typographic elements.
- **Neutral (`#fcfbfa` - Crisp Pearl / Ivory):** The structural base canvas, providing soft luminescence without the sterility of pure digital white. Paired with surface tiers of bleached parchment (`#f4f1ea`) and refined border slates (`#e2ded4`).

## Typography
The system uses a tri-font engine structured for heavy commercial throughput:

- **Headlines (Hanken Grotesk):** Crisp, geometric, and authoritative. Used for module headings, merchant store switchers, and drawer titles.
- **Interface & Body (Manrope):** Balanced, modern, and open-countered. Keeps dense ERP data tables, customer profiles, and ledger logs legible under rapid scanning.
- **Data & Financial Ledgers (JetBrains Mono):** Reserved for SKU barcodes, serial IDs, currency tallies, tax calculations, and POS cash registers. Ensures tabular numbers never shift or misalign.

## Layout & Spacing
A fluid 12-column adaptive system with strict mathematical spacing multipliers ensures responsive flexibility across mobile checkout terminals, tablets, and wide dual-display desktop cash desks:

- **Desktop (1200px+):** 12 columns, 24px (`gutter-lg`) gutters, 40px (`margin-desktop`) outer canvas margin. Dual-pane view pairs catalog grids with persistent ticket tape sidebars.
- **Tablet (768px - 1199px):** 8 columns, 16px (`gutter`) gutters, 20px (`margin`) margins. Catalog tiles adopt dynamic flex wrapping with bottom drawer order sheets.
- **Mobile Handheld (320px - 767px):** 4 columns, 12px gutters, 16px outer margin. POS flow switches to tab-swapped register views and sticky bottom payment action sheets.

## Elevation & Depth
Depth relies on structural layering, tonal boundaries, and whisper-quiet oceanic ambient shadows rather than stark elevation:

- **Layer 0 (Canvas Base):** Crisp Pearl (`#fcfbfa`) unshadowed canvas.
- **Layer 1 (Card & Module Shells):** Elevated using a 1px boundary of `#e8e4dc` backed by an ambient shadow of `0 4px 20px -2px rgba(4, 40, 59, 0.04)`.
- **Layer 2 (Dropdowns, Popovers, & Quick-Drawers):** Framed with a 1px boundary of `#dcd6ca` and an oceanic soft diffusion: `0 12px 32px -4px rgba(9, 83, 104, 0.08), 0 4px 12px -2px rgba(4, 40, 59, 0.04)`.
- **Layer 3 (Modal Dialogs & Keypad Overlays):** Abyssal Navy drop shadow `0 24px 48px -8px rgba(4, 40, 59, 0.18)` over a 24% opacity `#04283b` backdrop blur filter.
- **Champagne Accent Elevation:** Interactive floating action buttons and total balance badges carry a delicate gilded glow: `0 4px 14px 0 rgba(212, 175, 55, 0.25)`.

## Shapes
To preserve the sharp, tailored feel of an elite business management engine, shapes remain crisp and compact:
- Basic buttons, inputs, and list rows use an exact `0.25rem` (4px) corner radius.
- Cards, ERP panels, and POS register tiles utilize `rounded-lg` (`0.5rem` / 8px).
- Modals, large operational drawers, and primary POS item cards use `rounded-xl` (`0.75rem` / 12px).
- Fully circular radii (`rounded-full`) are strictly reserved for avatar counter badges, item quantity tags, and payment verification icon rings.

## Components

### Buttons
- **Primary Transactional:** Deep Oceanic Emerald (`#095368`) background with crisp white text. Active hover shifts to a richer maritime cyan (`#064051`) with an inner 1px translucent gold top-highlight.
- **VIP & High-Value Action:** Champagne Gold (`#d4af37`) background with Abyssal Navy (`#04283b`) text and subtle gilded glow.
- **Secondary / Tertiary:** Clear background with a 1px `#dcd6ca` border, Pearl hover tint, and Primary ink.

### Input Fields & Search Bars
- Resting state: Crisp pearl background (`#ffffff`), 1px structural border (`#ded9ce`), label in uppercase Manrope (`label-caps`).
- Focused state: Border transitions to Deep Oceanic Emerald (`#095368`) with a 2px outer aura tint (`rgba(9, 83, 104, 0.12)`). Numeric currency fields default to JetBrains Mono.

### POS & ERP Data Cards
- Container built from `#ffffff` with a top 2px decorative accent line (Oceanic Emerald for active inventory, Champagne Gold for VIP/Wholesale accounts).
- Zero clutter: generous internal padding (`space-md`), crisp 1px borders, and monospaced right-aligned totals.

### Chips & Status Badges
- **Paid / Settled:** Subdued oceanic emerald wash (`rgba(9, 83, 104, 0.08)`) with `#095368` text.
- **Pending / Premium Approval:** Soft champagne tint (`rgba(212, 175, 55, 0.14)`) with `#876a16` text.
- **Critical / Overdue:** Rose tint with deep crimson ink.

### Quick Tender & Numeric Keypad
- Oversized numeric touch tiles rendered in ivory with monospaced typography, giving instant visual feedback via a 100ms ink-fill animation in deep cerulean emerald.