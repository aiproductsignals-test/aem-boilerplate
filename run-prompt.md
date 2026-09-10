# Stardust unified demo — run prompts

Three paste blocks for Claude Code, staged per the layout below.
Block 1 runs the trunk + Branch A (FAQ demo). Block 2 runs
Branch B (email demo) off the same trunk artifacts. Block 3
publishes, on approval. Both demos share one brand audit and one
mining pass — the narrative beat is that the same mined call
drivers answer members in two channels.

---

## Block 1 — Trunk + Branch A (self-service FAQ)

Run the Stardust trunk and Branch A for Birch Creek Health:

1. Audit inputs/birch-creek-homepage.html and generate
   brand-profile.json — design tokens, voice rules, and the
   canonical fact table. This is the locked layer; no later stage
   reads the homepage again.
2. Mine inputs/synthetic_call_center_cases.csv for Evaluator
   behavior using the markers in
   inputs/creative-brief-evaluator-faq.md, cluster the identified
   cases into themes (≥2 cases per theme), and write
   output/cluster-map.md. This is the single mining pass for both
   branches.
3. Execute the brief against the cluster map: write
   output/faq/faq-evaluator.md, grounded ONLY on
   brand-profile.json facts, with appendix content going to the
   shared output/generation-appendix.md.
4. Render output/faq/faq-evaluator-prototype.html — member-facing
   sections only, signed in as the sample member in the skill,
   every personalization slot filled and wrapped in a data-slot
   span. Run /impeccable polish on the prototype, then stop and
   show me the cluster map, the FAQ, and the prototype.

Do not start Branch B and do not publish anything to DA until I
approve.

---

## Block 2 — Branch B (outbound email), after Branch A review

Branch A approved. Run Branch B off the same trunk artifacts —
do not re-audit the brand or re-mine the CSV:

1. Fill the [Extract from site] column of the token mapping in
   inputs/email-pattern-inventory.xlsx with email-safe Birch
   Creek values from brand-profile.json; write
   output/email-token-map.md.
2. For each theme in output/cluster-map.md, generate two email
   scaffolds — an agent-assist reply and a proactive segment
   email — to the brief's answer standard, on the inventory's
   scaffolds, in the email-safe tokens, using only slots from the
   skill's shared inventory.
3. Write each email as a standalone fragment file in
   output/fragments/emails/, then assemble the Birch Creek Email
   Pattern Library in output/library/ matching the format of
   reference/index.html and reference/welcome-email.html —
   preview panes reference the fragment files via relative iframe
   src (the reference pages use srcdoc only to stay
   self-contained; do not copy that). Include a card on the
   library index linking the FAQ prototype. Append email gaps and
   token decisions to the shared generation-appendix.md.
4. Run /impeccable polish on the library chrome only — never on
   the fragments — then stop and show me what you built.

Do not publish anything to DA until I approve.

---

## Block 3 — Publish, after full review

Approved. Publish to aiproductsignals-test/aem-boilerplate:
fragments to /fragments/emails/, then the library pages to
/birch-creek-email-library/ with preview iframes swapped for
Fragment blocks pointing at the published fragment paths, then
the FAQ prototype to /member-answers/. Give me the da.live edit
links and aem.page preview links, including one fragment and the
prototype. Never publish generation-appendix.md, cluster-map.md,
or brand-profile.json.

---

# Expected project layout

demo-project/
├── .claude/skills/stardust/
│   └── SKILL.md                   ← unified skill (only copy —
│                                    remove the srcdoc-era version)
├── .mcp.json                      ← da-live server (done)
├── inputs/
│   ├── birch-creek-homepage.html
│   ├── creative-brief-evaluator-faq.md
│   ├── synthetic_call_center_cases.csv
│   ├── stardust-personas.pptx
│   └── email-pattern-inventory.xlsx        ← note: renamed (no
│                                             signal-cellular- prefix)
├── reference/
│   ├── index.html                 ← Signal Cellular library index
│   │                                (recreated 2026-09-09)
│   └── welcome-email.html         ← doc-page format reference
│                                    (recreated 2026-09-09)
└── output/                        ← generated; empty at start
    ├── faq/                       ← Branch A deliverables
    ├── fragments/emails/          ← email templates (canonical)
    ├── library/                   ← index + doc pages
    └── (cluster-map.md, email-token-map.md,
         generation-appendix.md — local only)

# Pre-record checklist

- [ ] node -v ≥ 22.12; npx impeccable install; /impeccable init
      (PRODUCT.md: Birch Creek — Evaluator members, Operate/Read
      modes, calm midwestern voice, anti-reference: marketing froth)
- [ ] Old SKILL.md (srcdoc version) removed from
      .claude/skills/ — only the unified skill present, so it
      can't be shadowed
- [ ] prompt.rtf retired; this file is the only run doc
- [ ] da-live authenticated (/mcp shows connected — IMS token
      expires ~daily); one throwaway write+delete to /drafts/
      succeeded; 403 = Adobe ID missing from the DA org
      permission sheet
- [ ] /fragments/ folder created in aiproductsignals-test/
      aem-boilerplate (the old ✅ was on aem-skunkworks — redo it
      here); push one test fragment + one page with a Fragment
      block referencing it, preview on aem.page to confirm the
      block renders the email inline. HIGH RISK on this repo: a
      stock aem-boilerplate does not ship the fragment block —
      it must be added to the site's block library first, or
      Block 3's architecture needs a fallback
- [ ] /member-answers/ path confirmed writable for the FAQ
      prototype publish
- [ ] Full dry run completed once off camera — both blocks
- [ ] Fresh session before recording; da.live canvas tab and
      aem.page tab pre-opened and signed in
- [ ] Demo beat check: cluster-map.md case numbers visibly
      identical in the FAQ appendix section and the library doc
      pages' meta bars — the "one mining pass, two channels" story
