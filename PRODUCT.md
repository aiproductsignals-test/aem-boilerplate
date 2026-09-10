# Birch Creek Health — target product surface

> Target strategy resolved by `stardust:direct` (invoked by `stardust:uplift`)
> on 2026-09-09 against `http://localhost:8080/birch-creek-homepage.html`.
> Mode A — brand-faithful. Shared across variants A, B and C; strategy does not
> fork per variant.
> Sources: `stardust/current/PRODUCT.md`, `stardust/current/_brand-extraction.json`,
> `stardust/current/brand-review.html`, `stardust/uplift-improvements.md`,
> `stardust/uplift-questions.md`.

## Register

**brand** — marketing/landing. Inherited unchanged from the captured surface;
the only product-register affordance is "Member sign in", which points at an
application outside this page.

<!-- _provenance: captured -->

## Users

Three audiences, in the captured priority order. The hierarchy is a brand asset
and does not invert (see `DESIGN.json § extensions.iaPriorities`).

- **Prospective members in western Wisconsin choosing a 2026 plan** — served by
  the plan grid (Driftless / Chippewa / Superior), "Compare plans", and the
  deductible / out-of-pocket / copay rows.
- **Existing members mid-care** asking what something costs or whether a
  provider is covered — served by the four tools, the cost ledger, and the
  "questions people actually call about" rows.
- **Skeptical readers auditing the insurer** — unusually well served, and the
  audience that makes this brand distinct: the audited-measures band, the
  Transparency footer column (machine-readable price files, network adequacy
  filings, quality reports), the public medical policy library, the annual-report
  card.

<!-- _provenance: inferred — basis: audience read from section targeting and CTA
verbs in the captured page; no analytics or persona artifact exists. -->

## Product purpose

A member-governed (mutual) health plan in Eau Claire, Wisconsin, serving 21
western Wisconsin counties and 184,000 members. The page's job is to convert the
claim "we are more honest than a commercial insurer" into checkable artifacts:
published contracted rates, published prior-authorization criteria, published
turnaround times, a verified provider directory, a public policy library.

Scope of this redesign: the homepage only, on the existing content. No new
claims, no new figures, no new destinations — the 28 placeholder links are a
scope fact of the source, not something the redesign invents past.

<!-- _provenance: captured -->

## Brand personality

- **Plain-spoken, never folksy.** Direct, unhedged sentences. No exclamation
  marks, no second-person cheerleading.
- **Numerate — `operationally-transparent`, `data-led`.** Every claim carries a
  figure and usually a date or an audit reference (96.4% 2025-audited, 3.2 days,
  90 days, 412 active policies, 88.1¢, $0). The monospace face exists to carry
  these. This is the trait that selects variant C's motion register.
- **Locally rooted.** Place names do the work of trust: Chippewa Valley, Eau
  Claire, 128 River Prairie Way — "not a P.O. box". Even the plan names are
  places, not metal tiers.
- **Willing to be checked, and to be wrong.** "If your math and ours disagree,
  we'll reconcile it line by line."
- **Visually restrained.** One decorative motif, one shadow, two radii, zero
  photographs. Restraint is the trust signal, not an absence of design.

<!-- _provenance: captured — tone markers and proof points enumerated in
_brand-extraction.json § voice. -->

## Anti-references

Inherited from the captured surface's consistent negative choices, plus the
anti-toolbox guardrails this direction activates:

- **The stock-photo insurer.** Zero raster images. The hero slot where a smiling
  family would sit holds a working MRI cost table. Binding on all variants.
- **Metal-tier plan naming.** Driftless / Chippewa / Superior, never
  Bronze/Silver/Gold.
- **Urgency marketing.** No countdowns, no "Get started", no "Learn more". CTA
  verbs stay investigative: see, compare, run, look up, read, browse.
- **The gated document.** Transparency artifacts stay ungated and stay in the
  footer column.
- **Shareholder framing.** "No outside shareholders", "$0 executive bonuses tied
  to denial rates" are product facts, not slogans.
- **Generic-2026-SaaS silhouette** (anti-toolbox guardrail activated by this
  refresh): centered hero + dual CTA, four-up stroke-icon feature grid, gradient
  mesh, glass cards. Improvement 3 removes the one instance the captured page
  already had.
- **Fabricated liveness** (anti-toolbox guardrail activated by variant C's
  register): pulse dots, refresh sweeps and operational tickers imply a
  real-time feed this brand does not have. Cut from C's register application.

<!-- _provenance: inferred — each item is the systematic absence of a convention
this page's category otherwise follows, plus the two guardrails this direction
activates. -->

## Design principles

1. **Evidence outranks assertion.** The most prominent element in the first
   viewport is a table of real numbers, not a claim about the numbers — and in
   the target it is the *largest* thing there (improvement 4).
2. **Numerals are a brand surface.** Spline Sans Mono carries every figure, and
   figures right-align into ledger columns. The page reads as an accounting
   document that happens to be a website.
3. **Restraint is the trust signal.** One shadow, one gradient, two radii, no
   photography. Decoration is rationed so the data reads as unstyled fact — but
   what is rationed must still be perceptible (improvement 5).
4. **Ground does the separating, rhythm does the ranking.** Section separation
   stays colour-field, but vertical hierarchy stops being carried by colour
   alone: two padding tiers rank argument sections above supporting bands
   (improvement 6).
5. **Access is structural, at every width.** Language assistance above the logo,
   focus rings that pass 3:1 on all four grounds, reduced-motion honoured,
   decorative SVG `aria-hidden` — and navigation that survives below 900px
   (improvements 1 and 2).

<!-- _provenance: principles 1–3 captured from repeated choices in the captured
DOM; 4 and 5 extend captured principles to close tensions T-scale, T-contrast
and T-mobile-nav. -->

## Accessibility & inclusion

- Every text/ground pair meets WCAG AA; the gold token splits into a
  light-ground value at ≥ 4.5:1 and the captured `#E4C77E` on pine (5.83:1).
- The focus indicator meets the 3:1 non-text minimum on all four grounds.
- Primary navigation is reachable at every width, and a skip link is the first
  focusable element.
- Language assistance (Español / Hmoob / Language assistance, TTY 711) stays in
  the first viewport, above the logo.
- `prefers-reduced-motion: reduce` neutralizes every animated element in
  variant C; the page is fully legible and complete with zero motion.
