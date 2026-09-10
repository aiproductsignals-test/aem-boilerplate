# Email templates

**These files are the source of truth. Edit them here, in git.**

Fourteen Birch Creek member emails — seven call drivers × two registers:

| Register | Files | Audience |
|---|---|---|
| A — agent-assist reply | `*-reply.html` | a rep answering one member after a call |
| B — proactive segment | `*-segment.html` | one-to-many, the Evaluator segment |

They are served **raw and byte-for-byte** at
`https://main--aem-boilerplate--aiproductsignals-test.aem.page/email-templates/<name>.html`,
because a committed repo file bypasses the content pipeline entirely. Verified:
`cost-transparency-segment.html` serves 9,545 bytes, identical to this file, with
all eight tables and the pine CTA intact.

## Why they are not in Document Authoring

They were, briefly. DA stores content in its own model and rewrites an email
left in it — an 8,998-byte fragment came back as 211 bytes, the table shell
replaced by `<main><div>` and the wordmark reinterpreted as a block name
(`<div class="birch-creek-health">`). Three of fourteen were destroyed within an
hour, including one that had already been restored. Opening a fragment in the
da.live editor appears to be enough to trigger it.

So DA is not the store for these. `.github/workflows/sync-da-fragments.yaml`
exists and works, but is dormant for that reason — see its header.

If browser authoring matters more than keeping a sendable `.html` as the
artifact, the path is an EDS block that rebuilds the table shell from authored
cells, the way `blocks/member-banner` does. DA can hold *that* safely, because
the content is in its model by design.

## Editing rules

These are email-safe by construction. Breaking any of the following breaks a
client, usually Outlook, usually silently:

- **Tables for layout.** No flexbox, no grid, no `float`.
- **Inline styles for anything that matters.** Gmail strips `<style>`; the block
  in `<head>` only tightens padding under 480px and stacks the CTA.
- **`bgcolor` *and* `background-color`**, double-set on every coloured cell.
- **px units only.** No `rem`, no `em`. Line-height as a percentage, not unitless.
- **`font-weight: bold`** as a keyword, never `700`.
- **Keep the VML block** above each CTA. It is what gives Outlook the rounded
  corner it otherwise drops.
- **Figures stay in `'Courier New', Courier, monospace`.** Every checkable number
  is set in the ledger face — that is a brand rule, not decoration.
- **Gold text is `#8A6410`, never `#C3922E`.** The captured gold measures 2.81:1
  on white and fails AA. `#C3922E` is permitted as a non-text rule only.

Personalization slots come from one shared inventory and must not be invented:
`{{member.first_name}}`, `{{member.plan_name}}`, `{{member.deductible_status}}`,
`{{member.oop_status}}`, `{{member.pcp_network_status}}`,
`{{member.pending_prior_auths}}`, `{{member.member_since}}`,
`{{case.reference_number}}` (Register A only), and the ESP tags
`{{unsubscribe_url}}`, `{{preferences_url}}`, `{{view_in_browser_url}}`,
`{{current_year}}` (Register B footers only).

## Known gap before any real send

No physical mailing address exists for Birch Creek in the brand source, so the
Register B footers carry `Eau Claire, Wisconsin` and nothing more. **That is not
CAN-SPAM compliant.** Add a real postal address before sending commercially.
