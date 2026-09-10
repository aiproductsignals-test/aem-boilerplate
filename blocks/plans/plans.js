/**
 * plans — the 2026 plan comparison grid.
 *
 * Variant B re-composes this section around the recommended plan: it takes the
 * gold surface and the wider column (1fr 1.35fr 1fr) instead of three equal
 * cards. The #90 style fingerprint recorded exactly this as a real per-instance
 * variation (ARTICLE.plan ×3 → 2 clusters, index 1 on #c3922e) — flattening it
 * would erase B's whole argument.
 *
 * Schema: stardust/eds-schema/index.json § plans (3 × ARTICLE.plan)
 *
 * Authoring rows: one row per plan, three cells.
 *   | <em>eyebrow</em> + <h3>Name</h3> + <p>who it's for</p>
 *   | <p><strong>Deductible (ind.)</strong> $3,300</p> × 4
 *   | <strong><a>See full … details</a></strong>   ← primary = recommended
 *
 * RECOMMENDED DETECTION: the plan whose CTA decorates to a.button.primary is
 * the recommended one. That is the captured intent — the source page gave
 * Chippewa the only solid button — so no new authoring syntax is invented and
 * no position is hard-coded. decorateButtons() runs before this block, so the
 * class is already on the anchor.
 *
 * KEY/VALUE ROWS: each spec line leads with a preserved <strong> term
 * (the ENCODE contract's leading-tag rule), so no delimiter is invented.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const has = (el, sel) => !!el && (el.matches(sel) || !!el.querySelector(sel));
const hasContent = (el) => !!el && (el.textContent.trim() || el.querySelector('a, picture, img'));

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const grid = document.createElement('div');
  grid.className = 'plans-grid';

  rows.forEach((row) => {
    const cells = [...row.children].filter(hasContent);
    if (!cells.length) return;

    const plan = document.createElement('article');
    plan.className = 'plan';

    // classify by content: the heading cell, the CTA cell, the specs cell
    const headCell = cells.find((c) => has(c, 'h1, h2, h3, h4, h5, h6'));
    const ctaCell = cells.find((c) => c !== headCell && has(c, 'a'));
    const specCell = cells.find((c) => c !== headCell && c !== ctaCell);

    if (headCell) {
      [...headCell.children].forEach((el) => {
        if (el.matches('h1, h2, h3, h4, h5, h6')) {
          plan.append(wrapNode(el, 'plan-name'));
        } else if (has(el, 'em') && el.textContent.trim().length < 60) {
          plan.append(wrapNode(el, 'plan-eyebrow'));
        } else {
          plan.append(wrapNode(el, 'plan-for'));
        }
      });
    }

    // Specs: each authored <p> leads with a preserved <strong> term.
    // MOVE the whole paragraph (EW1) — splitting it into <dt>/<dd> discards the
    // element the workspace editor indexes and every spec line goes dead.
    // The term/value split is done in CSS: the <p> is a flex row, the <strong>
    // is the label and the trailing text node is the value.
    if (specCell) {
      const specs = document.createElement('div');
      specs.className = 'plan-specs';
      // no class on the authored element — it dies in edit mode (EW2);
      // the CSS targets `.plan-specs p` by element instead
      [...specCell.children].forEach((el) => specs.append(el));
      if (specs.children.length) plan.append(specs);
    }

    if (ctaCell) {
      const actions = document.createElement('div');
      actions.className = 'plan-actions';
      // MOVE the CTA's paragraph — the workspace editor index is on the <p> (EW3)
      [...ctaCell.querySelectorAll('a')].forEach((a) => actions.append(a.closest('p') || a));
      plan.append(actions);
      // the captured intent: the recommended plan is the one with the solid button
      if (ctaCell.querySelector('a.button.primary')) plan.classList.add('recommended');
    }

    if (plan.children.length) grid.append(plan);
  });

  block.replaceChildren(grid);
}
