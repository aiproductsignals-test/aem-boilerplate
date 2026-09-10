/**
 * timeline — the 1963 → 2026 heritage list.
 *
 * Schema: stardust/eds-schema/index.json § heritage (4 × LI.)
 *
 * Authoring rows: one row per entry, two cells.
 *   | 1963 | Founded as the Chippewa Valley Health Cooperative, 412 charter families. |
 *
 * The year rides a mono gutter in gold-on-dark (5.83:1 on pine).
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const hasContent = (el) => !!el && !!el.textContent.trim();

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const list = document.createElement('div');
  list.className = 'timeline-list';

  rows.forEach((row) => {
    const cells = [...row.children].filter(hasContent);
    if (!cells.length) return;

    const entry = document.createElement('div');
    entry.className = 'timeline-entry';

    const [yearCell, bodyCell] = cells;
    if (yearCell) [...yearCell.children].forEach((el) => entry.append(wrapNode(el, 'timeline-year')));
    if (bodyCell) [...bodyCell.children].forEach((el) => entry.append(wrapNode(el, 'timeline-body')));

    if (entry.children.length) list.append(entry);
  });

  block.replaceChildren(list);
}
