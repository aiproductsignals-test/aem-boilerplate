# EDS conversion log — Birch Creek Health

Source: `stardust/prototypes/birch-creek-homepage-html-B-proposed.html`
(the approved uplift **variant B** — "what if the rationed gold became a
surface you stand on?"). Converted 2026-09-09 by `stardust:deploy`.

## Runtime

`adobe/aem-boilerplate` @ main, cloned 2026-09-09, scaffolded at the repo root.
Probed rather than assumed — see `stardust/runtime-contract.json`. Two gaps in
THIS clone that the foundation had to close:

- **No global `box-sizing: border-box`** (#106). It sets it only on
  `a.button`/`button.button`. Added to the reset; without it any %-width +
  padding grid silently wraps.
- **No `main .section:empty` rule.** The metadata block leaves an empty padded
  section, so an empty band would sit under the header. Added.

Confirmed from source: `decorateBlock` adds `.block` + `data-block-name` +
`.<name>-wrapper` + `.<name>-container`; `wrapTextNodes` is present (#104);
buttonization is **formatted-only** (requires authored `<strong>`/`<em>`) and
emits `a.button(.primary|.secondary|.accent)` in `p.button-wrapper`.

One latent boilerplate bug fixed in `blocks/header/header.js`: the stock brand
handling calls `.closest('.button-container').className` — this clone emits
`p.button-wrapper`, so that line throws on null. Now guarded for both.

## Block inventory

Names were locked before any code was written. This is a single-page
conversion, so `block name = section intent` with no cross-page reuse
decisions to make.

| Block | Role | Notes |
|---|---|---|
| `ledger` | the signature cost/report table | **Used twice** (hero cost table, annual-report panel) — one block, not two. Handles both the 3-column and 2-column shapes; the column count comes from the first multi-cell row. |
| `measures` | audited operational measures | Variant B's substrate promotion: this band is the one section standing on gold. |
| `cards` (`.index`) | the tools index | The canonical D9/D11 repeating-unit block. `.index` is the ruled row + mono gutter variant. |
| `plans` | the 2026 comparison grid | Carries the gold recommended variant. |
| `qa` | the answers list | Deliberately **not** an accordion — see below. |
| `timeline` | the 1963→2026 heritage list | |
| `header` / `footer` | per-site chrome | Stock interaction machinery kept, restyled; 4 authored nav sections instead of 3. |

**Sections deliberately left as DEFAULT CONTENT (D1)** — no repeating units, no
bespoke structure, so no block: the hero prose (eyebrow / h1 / lede / CTAs),
the tools, plans, answers and heritage section heads, and the closing action
band. Their skin rides a small closed set of section-metadata `style` values
(`dark`, `tinted`, `support`, `action-band`).

## Decisions worth knowing

**The `qa` block is not an accordion.** The captured page shows every answer
open by default, which the extraction records as consistent with the
transparency thesis. Collapsing them would be a brand-argument change
disguised as a component choice.

**Recommended-plan detection is derived, not authored.** The `plans` block
marks a card recommended when its CTA decorates to `a.button.primary`. That is
the captured intent — the source page gave Chippewa the only solid button — so
no new authoring syntax was invented and no position is hard-coded. The #90
style fingerprint flagged this as a real per-instance variation
(`ARTICLE.plan ×3 → 2 clusters`, index 1 on `#c3922e`) before any block code
was written; flattening it would have erased variant B's whole argument.

**Ground fallbacks are belt-and-braces.** Section grounds are authored as
section-metadata `style` values (the D1-correct, authorable mechanism), AND
mirrored onto the `-container` classes the runtime always adds. Both resolve to
the same values so they never conflict. The mirror exists because section
metadata is rendered **server-side by the delivery pipeline** — the local
harness has no pipeline, so without it the whole page QA'd on the wrong
grounds. This must still be eyeballed on the deployed preview.

**Chrome is fixed-position, not sticky-with-scrolling-topbar.** The prototype
scrolls its utility bar away and sticks only the nav row. Reproducing that
exactly would require the nav row to escape the height-reserved `header` box,
which `position: sticky` cannot do from inside it. The whole chrome is fixed
instead, and `--nav-height` reserves its real height. **This is a deliberate
divergence, recorded rather than hidden.** The nav row is pinned at the
prototype's 78px via `min-height` so the reservation always matches the real
height (measured 115.8 vs 115 reserved).

**The ledger's mixed cell counts are the documented D3 exception.** The lint
raises 2 🟡 for rows of 1 and 3 (and 1 and 2) cells. The ledger IS a genuine
data table with head and footnote rows, which David's Model exempts. Not a
defect; not silenced.

**Icon tokens are a declared EW exemption.** The four tool icons are authored
as `:provider-directory:` tokens (the EDS-native, authorable convention) and
extracted to `icons/*.svg` from the prototype's inline SVGs. `cards.js` carries
an inlined fallback that converts a literal token if the pipeline does not, so
a raw `:token:` can never reach a reader. Declared `@ew-exempt` as
text-as-metadata. `decorateIcons` is inlined rather than imported because the
round-trip harness inlines block JS and cannot resolve module imports.

## Fonts

All three brand faces self-hosted from the capture — Fraunces (variable,
**wght + opsz**), Public Sans (variable wght), Spline Sans Mono. All OFL 1.1
Google Fonts, redistributable: **no licensing alert needed.**

Metric-matched fallbacks were **measured, not estimated** — rendered width
ratio plus canvas `fontBoundingBox`, after forcing each face to load and
verifying against a sentinel:

| Brand | Fallback | size-adjust | ascent | descent |
|---|---|---|---|---|
| Fraunces | Times New Roman | 95.601% | 102.51% | 27.2% |
| Public Sans | Arial | 105.115% | 90.38% | 21.88% |
| Spline Sans Mono | Courier New | 99.984% | 96% | 24% |

Spline and Courier have identical advance widths (both 0.6em monospaces), so a
width test alone reported the face as unloaded. Confirmed loaded by
`document.fonts` status + a glyph pixel diff before trusting the 100%.

The `opsz` axis the source site loaded but never exercised is now driven per
role (h1 144 / h2 96 / h3 36 / wordmark 24).

## Gate results

| Gate | Result |
|---|---|
| `davids-model-lint` | **0 🔴**, 2 🟡 (the D3 data-table exception above) |
| `block-roundtrip` (whole page) | **0 structural 🔴** — every block's round-trip closed |
| Experience Workspace editability | **109 / 109 authored texts editable**, 0 dead, 0 duplicated |
| Computed contrast (rendered DOM) | **0 failures** across main + chrome |
| Horizontal overflow | **none** at 1920 / 1600 / 1440 / 1280 / 900 / 768 / 640 / 375 / 360 |
| Page errors | 0 |
| Token completeness | every `var(--x)` in block CSS defined in `:root` |
| Absolute-origin assets in block code (#44) | none |

### Bugs the gates caught (all fixed)

1. **`plans` — 12 dead texts.** The first decode split each authored `<p>` into
   `<dt>`/`<dd>`, discarding the element the workspace editor indexes. Every
   spec line was uneditable. Now the whole paragraph moves and the term/value
   split is done in CSS.
2. **`plans` — dropped repeated CTA.** Improvements item 8 calls for the primary
   action after the plan grid; the first authoring pass omitted it.
3. **Both ledger titles invisible.** An unscoped `-container` heading rule
   painted every h2/h3 in the section white — including the ones inside the
   white ledger card. Scoped to `.default-content-wrapper`.
4. **Hero "Compare plans" invisible** (pine on pine, 1:1). The on-dark button
   override was scoped to `.section.dark`/`.hero`, neither of which matches the
   real section — the #41 trap. Now scoped to the container fallback too.
5. **Nav covering the whole page.** The stock desktop `aria-expanded` reset was
   dropped when lifting the chrome CSS, so `min-height: 100dvh` applied on
   desktop and the fixed nav grew to 901px.

## Still to do at deploy time

- **The brand mark.** `stardust/current/assets/logo.svg` (492 bytes, pure
  vector — well inside the ~40KB SVG limit and with no embedded raster, so it
  ingests cleanly) must be uploaded to DA media and authored into
  `content/nav.html` as
  `<img src="https://content.da.live/{org}/{repo}/media/brand/logo.svg" alt="Birch Creek Health">`.
  It is **not** authored yet because the org/repo is not known. The nav row is
  height-pinned so adding it will not move the reservation.
- **Favicon.** `favicon.ico` currently ships the boilerplate default. The source
  site has **no favicon** (extraction tension `T-favicon`), and the uplift work
  derived one from the mark — port that derived icon rather than shipping the
  Adobe default.
- **Verify on the deployed preview** what the harness structurally cannot show:
  section-metadata grounds (pipeline-rendered), per-page chrome overrides, and
  CLS (harness assets load instantly, so a local CLS number is meaningless).
