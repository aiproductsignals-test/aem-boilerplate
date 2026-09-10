/**
 * ledger — the brand's signature component: data presented as an accounting
 * document. Used twice on the home page (the hero cost table and the annual
 * report panel), which is why it is one block rather than two.
 *
 * Schema: stardust/eds-schema/index.json § hero, § heritage
 *
 * Authoring rows (classified by shape, never by index):
 *   1-cell rows BEFORE the first multi-cell row  → head (title, then subtitle)
 *   the first multi-cell row                     → column headings (optional;
 *                                                  omit it for a label/value panel)
 *   subsequent multi-cell rows                   → data rows. A row whose FIRST
 *                                                  cell leads with <strong> is the
 *                                                  total/emphasis row.
 *   trailing 1-cell row                          → footnote (may carry a link)
 *
 * A genuine data table is the documented exception to David's Model D3.
 * Both the 3-column (setting | rate | you pay) and 2-column (label | value)
 * shapes are supported; the column count comes from the first multi-cell row.
 */

/** Move an authored element into a generated wrapper that carries the class. */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const cellsOf = (row) => [...row.children];
const hasContent = (el) => !!el && (el.textContent.trim() || el.querySelector('a, picture, img'));

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Classify rows by their cell count — the head/foot are single-cell.
  const multi = rows.filter((r) => cellsOf(r).filter(hasContent).length > 1);
  const firstMultiIdx = multi.length ? rows.indexOf(multi[0]) : rows.length;
  const lastMultiIdx = multi.length ? rows.indexOf(multi[multi.length - 1]) : -1;

  const headRows = rows.slice(0, firstMultiIdx);
  const dataRows = rows.slice(firstMultiIdx, lastMultiIdx + 1);
  const footRows = lastMultiIdx >= 0 ? rows.slice(lastMultiIdx + 1) : [];

  const card = document.createElement('div');
  card.className = 'ledger-card';

  // ── Head: move the authored elements, never rebuild them (EW1) ──
  if (headRows.length) {
    const head = document.createElement('div');
    head.className = 'ledger-head';
    headRows.forEach((row, i) => {
      const cell = row.firstElementChild;
      if (!hasContent(cell)) return;
      // the first head line is the title, the rest is supporting detail
      const cls = i === 0 ? 'ledger-title' : 'ledger-sub';
      [...cell.children].forEach((el) => head.append(wrapNode(el, cls)));
    });
    if (head.children.length) card.append(head);
  }

  // ── Data: a real <table>, because it is real tabular data ──
  if (dataRows.length) {
    const table = document.createElement('table');
    const cols = cellsOf(dataRows[0]).length;

    // A first multi-cell row with no figures reads as column headings.
    const firstCells = cellsOf(dataRows[0]);
    const looksLikeHeadings = firstCells.every((c) => !/\d/.test(c.textContent));
    let bodyRows = dataRows;

    if (looksLikeHeadings && dataRows.length > 1) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      firstCells.forEach((cell, i) => {
        const th = document.createElement('th');
        if (i > 0) th.className = 'num';
        // move the cell's own children so the authored text keeps its identity
        th.append(...cell.childNodes);
        tr.append(th);
      });
      thead.append(tr);
      table.append(thead);
      bodyRows = dataRows.slice(1);
    }

    const tbody = document.createElement('tbody');
    bodyRows.forEach((row) => {
      const cells = cellsOf(row);
      const tr = document.createElement('tr');
      // the emphasis row is marked by a leading <strong> in its first cell
      if (cells[0] && cells[0].querySelector('strong')) tr.className = 'total';
      cells.forEach((cell, i) => {
        const td = document.createElement('td');
        if (i > 0) td.className = 'num';
        td.append(...cell.childNodes);
        tr.append(td);
      });
      // pad short rows so the columns stay aligned
      for (let i = cells.length; i < cols; i += 1) {
        const td = document.createElement('td');
        td.className = 'num';
        tr.append(td);
      }
      tbody.append(tr);
    });
    table.append(tbody);
    card.append(table);
  }

  // ── Footnote ──
  if (footRows.length) {
    const foot = document.createElement('div');
    foot.className = 'ledger-foot';
    footRows.forEach((row) => {
      const cell = row.firstElementChild;
      if (!hasContent(cell)) return;
      [...cell.children].forEach((el) => foot.append(el));
    });
    if (foot.children.length) card.append(foot);
  }

  block.replaceChildren(card);
}
