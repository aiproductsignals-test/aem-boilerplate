/**
 * qa — the "questions people actually call about" list.
 *
 * Deliberately NOT an accordion: the captured page shows every answer open by
 * default, which is consistent with the transparency thesis ("no disclosure
 * widget — everything is open by default"). Collapsing them would be a brand
 * argument change, not a conversion.
 *
 * Schema: stardust/eds-schema/index.json § answers (4 × DIV.qa)
 *
 * Authoring rows: one row per pair, two cells.
 *   | <h3>How do I confirm a provider is in network before I book?</h3> | <p>Check the …</p> |
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const has = (el, sel) => !!el && (el.matches(sel) || !!el.querySelector(sel));
const hasContent = (el) => !!el && !!el.textContent.trim();

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const list = document.createElement('div');
  list.className = 'qa-list';

  rows.forEach((row) => {
    const cells = [...row.children].filter(hasContent);
    if (!cells.length) return;

    const item = document.createElement('div');
    item.className = 'qa-item';

    // the cell carrying a heading is the question; the other is the answer
    const qCell = cells.find((c) => has(c, 'h1, h2, h3, h4, h5, h6')) || cells[0];
    const aCell = cells.find((c) => c !== qCell);

    [...qCell.children].forEach((el) => item.append(wrapNode(el, 'qa-question')));
    if (aCell) [...aCell.children].forEach((el) => item.append(wrapNode(el, 'qa-answer')));

    if (item.children.length) list.append(item);
  });

  block.replaceChildren(list);
}
