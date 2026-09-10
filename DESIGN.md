---
colors:
  paper: "#FBFBF8"
  card: "#FFFFFF"
  birch: "#F3F1E8"
  pine: "#1C4D42"
  pine-deep: "#143B33"
  ink: "#24322C"
  ink-soft: "#55645D"
  gold: "#C3922E"
  gold-deep: "#8A6410"
  gold-on-dark: "#E4C77E"
  line: "#DDE1D8"
  line-on-dark: "rgba(255,255,255,0.16)"
  ink-on-dark: "#F4F7F3"
  ink-on-dark-soft: "#D7E2DA"
  ink-on-dark-mute: "#B9CCC2"
  ink-on-deep: "#DCE6E0"
  ink-on-deep-soft: "#E8EFE9"
  ink-on-pine-soft: "#EAF1EB"
typography:
  display: "Fraunces, serif (600) — 52 / 34 / 24 / 21px"
  body: "Public Sans, system-ui, sans-serif (400/500/600/700) — 18 / 16.5 / 14 / 12.5px"
  mono: "Spline Sans Mono, monospace (400/500) — 24 / 14px"
  base: "16.5px / 1.6"
rounded: "10px containers, 6px controls"
spacing: "64px argument sections / 44px supporting bands; 1120px container, 24px gutter; 20px card gap, 56px split gap"
components: [button-primary, button-secondary, card, link, badge, ledger]
---

# Birch Creek Health — target design system

> Site-level system authored by `stardust:direct` under Mode A (brand-faithful).
> Palette and typography are **pinned** to the captured surface; what moves is
> execution — scale, rhythm, contrast, and the mobile gap. Per-variant deltas
> live in `DESIGN-A/B/C.md`; page composition lives in
> `stardust/prototypes/<slug>-<id>-shape.md`.

## Colour

The captured four-ground warm system, inherited whole. Nothing is neutral grey:
ink is green-black, paper is warm off-white, the one shadow is green-tinted.

| Role | Value | Where |
|---|---|---|
| pine | `#1C4D42` | hero and heritage grounds, solid buttons, link colour |
| pine-deep | `#143B33` | topbar, audited-measures band, button hover |
| paper | `#FBFBF8` | body, header, footer |
| card | `#FFFFFF` | ledger, tool and plan surfaces |
| birch | `#F3F1E8` | supporting section ground, ghost-button hover |
| ink | `#24322C` | body copy |
| ink-soft | `#55645D` | secondary copy, table labels |
| gold | `#C3922E` | dark-ground accents, the logo leaf |
| gold-deep | `#8A6410` | **light-ground** eyebrows and focus ring |
| gold-on-dark | `#E4C77E` | eyebrows and year gutters on pine |
| line | `#DDE1D8` | card borders, table rules, section rules |
| line-on-dark | `rgba(255,255,255,0.16)` | rules on pine and pine-deep |
| ink-on-dark | `#F4F7F3` | headings and primary copy on pine |
| ink-on-dark-soft | `#D7E2DA` | ledes and secondary copy on pine (7.21:1) |
| ink-on-dark-mute | `#B9CCC2` | measure captions on pine-deep (7.33:1) |
| ink-on-deep | `#DCE6E0` | topbar copy on pine-deep (9.65:1) |
| ink-on-deep-soft | `#E8EFE9` | measures-band base colour |
| ink-on-pine-soft | `#EAF1EB` | heritage base colour |

**The on-dark tints are captured, not invented.** All six come from
`_brand-extraction.json § palette` (`text-on-dark`, `text-on-dark-muted`,
`text-on-dark-muted-2` and the section `color` values). They are listed here
because a token used in a render but absent from this table is undocumented by
definition — the earlier omission was a documentation gap, not a palette
extension. Every one is a green-tinted light drawn from its own ground's hue;
none is neutral grey.

**One token split, no new colour.** `gold-deep` is the captured gold darkened
until it clears AA on paper, card and birch — the captured hue is retained, the
failure (2.48–2.81:1) is not. Gold on dark grounds is unchanged. Focus ring
becomes `3px solid gold-deep` with a 2px offset, which clears the 3:1 non-text
minimum on every ground.

**Gold stays rationed at site level.** It sets no button and no body copy. The
rationing is a variant-level decision: A and C preserve it; B re-weights it (see
`DESIGN-B.md`) — which is a change of *proportion*, not of palette.

Section separation stays colour-field: pine → pine-deep → paper → birch →
paper → pine → paper.

## Typography

Three families, one job each, pinned. Fraunces displays, Public Sans speaks,
Spline Sans Mono counts.

**Scale: formalised to seven steps.** The captured 17 ad-hoc sizes (several
half a pixel apart, `T-scale`) collapse to sizes already load-bearing on the
page — every half-pixel neighbour is dropped, no new size is introduced:

| Step | Size | Role |
|---|---|---|
| display-1 | 52px / 56.16px / -0.52px, Fraunces 600 | page headline |
| display-2 | 34px / 44px / -0.34px, Fraunces 600 | section headings |
| display-3 | 24px / 34px, Fraunces 600 | plan names, wordmark at 21px |
| stat | 24px / 34px, Spline Sans Mono 500 | measures band numerals |
| lede | 18px / 28.8px, Public Sans 400 | hero and section ledes |
| body | 16.5px / 26.4px, Public Sans 400 | body copy, Q&A questions at 600 |
| figure | 14px / 22.4px, Spline Sans Mono 400 | ledger figures, plan pricing |
| eyebrow | 12.5px / 20px / 0.14em uppercase, Public Sans 700 | section eyebrows |

Display ratio 52 → 34 → 24 holds at ≥ 1.4, well clear of the 1.25 brand-register
floor. Numerals stay mono and stay right-aligned into columns; that is the
brand, not a detail. All three faces are OFL Google Fonts, captured to
`stardust/current/assets/fonts/`.

## Shape and elevation

- **Radius:** two steps, inherited — `10px` containers, `6px` controls. No
  pills, no circles.
- **Shadow:** exactly one in the captured system, inherited —
  `--shadow-on-dark: 0 18px 40px rgba(10,30,25,.35)`, applied only to cards
  sitting on a dark ground. Cards on light grounds take a `1px solid line`
  border. Elevation means "this floats on the dark ground".
- **`--shadow-soft: 0 14px 24px rgba(10,30,25,.10)`** — one addition, and only
  one use: the mobile disclosure-nav panel, which overlays page content and
  needs to read as a layer. It is not available to cards; the captured
  one-shadow rule above still governs everything else.
- **Rules:** `1px solid line` on light, `rgba(255,255,255,0.16)` on pine.

## Motif

**The birch lenticel becomes the system's one repeated mark.** The captured
motif exists at `.hero::before` at 7% opacity, masked out by 55%, once on a
4,184px page — the same dash pattern that constructs the logo. In the target it
is raised to a perceptible weight in the hero and reused as the section rule, so
the brand's only gesture reads at least twice and costs no new vocabulary. It
stays `aria-hidden` and stays decorative.

Iconography stays inline stroke-only SVG, 1.8 stroke-width, stroked in pine. No
icon font. **Zero raster images** — binding.

A favicon is derived from the mark (trunk + gold leaf; lenticels dropped below
32px where they close up) and inlined as a `data:` URI in every variant's head.

## Layout and rhythm

- Container `1120px`, gutter `24px`, card gap `20px`, split gap `56px` —
  inherited.
- **Two-tier section rhythm** replaces the captured flat 84px:
  `64 / 48 / 32px` (desktop / tablet / mobile) on argument sections,
  `44 / 36 / 28px` on supporting bands. The desktop value is capped at 64px by
  the multi-audience density floor — 9 sections on a brand-register page — which
  the captured 84px breached.
- Splits stay **asymmetric and alternating**; never a true 50/50. The hero split
  inverts so the ledger takes the wider column.
- Breakpoints inherited: `1000px`, `900px`, `560px` — with navigation now
  surviving the 900px boundary as a disclosure control.

## Components

| Component | Default treatment |
|---|---|
| button-primary | pine fill, paper text, 6px radius, 11px/20px padding, 15px/600; hover pine-deep |
| button-secondary | pine 1px outline on transparent, pine text; hover birch fill |
| card | white, 10px radius, `1px solid line` on light grounds; the one shadow only on dark grounds |
| ledger | white card, mono right-aligned figures, 12.5px uppercase column heads, footnote with inline arrow link — the signature component |
| link | 600 weight, no underline until hover, terminal "→" as a literal character |
| badge | eyebrow treatment: 12.5px/700/0.14em uppercase, gold-deep on light, gold-on-dark on pine |

## Motion and access

Motion is a **per-variant** decision and is declared in `DESIGN-<id>.json`
only — A and B render static, C declares a register. Site-level default: no
motion beyond `scroll-behavior: smooth`, cancelled under reduced motion.

Access: `lang="en"`; skip link as the first focusable element; disclosure
navigation below 900px carrying the four primary links plus the language links;
`3px solid gold-deep` focus ring with 2px offset, passing 3:1 on all four
grounds; every eyebrow passing AA; `aria-label` on unlabelled sections and on
the ledger; `aria-hidden` on decorative SVG and on the lenticel motif; TTY 711
retained in the legal band; `prefers-reduced-motion: reduce` neutralizes all
motion via `!important`.
