/**
 * measures — the audited operational measures band.
 *
 * Variant B's substrate promotion: this band is the one section that stands on
 * gold (#c3922e), the colour the captured brand rationed to three text-only
 * elements. Ink over gold measures 4.77:1 (AA). See DESIGN-B.md.
 *
 * Schema: stardust/eds-schema/index.json § measures-band (4 × DIV.stat)
 *
 * Authoring rows: one row per measure, two cells.
 *   | 96.4% | of claims processed within 14 days (2025 audited) |
 *
 * The qualifier ("2025 audited", "standard requests") stays inside its captured
 * caption rather than being split into a separate stamp element — the caption is
 * authored prose and must reach the reader whole.
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
  list.className = 'measures-list';

  rows.forEach((row) => {
    const cells = [...row.children].filter(hasContent);
    if (!cells.length) return;

    const stat = document.createElement('div');
    stat.className = 'measure';

    // cell 0 = the figure, cell 1 = its caption. Move the authored elements
    // into the wrappers; never rebuild them from text (EW1).
    const [valueCell, captionCell] = cells;
    if (valueCell) {
      [...valueCell.children].forEach((el) => stat.append(wrapNode(el, 'measure-value')));
    }
    if (captionCell) {
      [...captionCell.children].forEach((el) => stat.append(wrapNode(el, 'measure-caption')));
    }

    if (stat.children.length) list.append(stat);
  });

  block.replaceChildren(list);
}
