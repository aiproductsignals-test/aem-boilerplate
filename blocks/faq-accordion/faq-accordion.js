/**
 * faq-accordion — collapsible answers for the member answer library.
 *
 * Distinct from the `qa` block on purpose. `qa` is the homepage's open list:
 * everything visible at once, because the openness is the brand's transparency
 * argument. This block is the signed-in library, where a member scans seven
 * call drivers to find their one question — collapsing is navigation, not
 * concealment. The first item opens by default so the pattern is never a
 * closed wall.
 *
 * Authoring rows:
 *   optional first row, ONE cell   | #1 most asked |          → block meta line
 *   every other row, two or three  | <h3>Question</h3> | <p>Answer</p> |
 *                                  | <p>Check it yourself: …</p> |
 *
 * The third cell is the *Check it yourself* pathway — the brand's verification
 * promise, ruled off with the lenticel mark. Omit it and no rule renders.
 *
 * Numerals: the brand sets every checkable figure in the ledger face. Authored
 * prose cannot carry a wrapper (inline spans do not survive the editor
 * round-trip), so figures are wrapped here — see wrapFigures.
 */

// $1,384 · 96.4% · 3.2-day · 2026-06-14 · 1-800-555-0163 · 412 · 73721
const FIGURE = /(\$\d[\d,.]*|\d[\d,.]*%|\d[\d,.]*(?:-\d[\d,.]*)*(?:-[a-z]+)?)/gi;

const SLOT = /\{\{\s*([a-z0-9_.]+)\s*\}\}/gi;

const isFilled = (el) => !!el && !!el.textContent.trim();
const hasHeading = (el) => !!el && (el.matches('h1,h2,h3,h4,h5,h6') || !!el.querySelector('h1,h2,h3,h4,h5,h6'));

function wrapFigures(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest('.fig') && FIGURE.test(node.nodeValue)) targets.push(node);
    FIGURE.lastIndex = 0;
  }
  targets.forEach((node) => {
    const frag = document.createDocumentFragment();
    let last = 0;
    node.nodeValue.replace(FIGURE, (match, _g, offset) => {
      if (offset > last) frag.append(node.nodeValue.slice(last, offset));
      const span = document.createElement('span');
      span.className = 'fig';
      span.textContent = match;
      frag.append(span);
      last = offset + match.length;
      return match;
    });
    if (last < node.nodeValue.length) frag.append(node.nodeValue.slice(last));
    node.parentNode.replaceChild(frag, node);
  });
}

/** See member-banner.js — an authored `{{slot}}` marker and a literal
 *  `data-slot` span are two spellings of the same contract. */
function restoreSlots(root) {
  if (!root || !SLOT.test(root.innerHTML)) return;
  SLOT.lastIndex = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets = [];
  while (walker.nextNode()) {
    if (SLOT.test(walker.currentNode.nodeValue)) targets.push(walker.currentNode);
    SLOT.lastIndex = 0;
  }
  targets.forEach((node) => {
    const frag = document.createDocumentFragment();
    let last = 0;
    node.nodeValue.replace(SLOT, (match, name, offset) => {
      if (offset > last) frag.append(node.nodeValue.slice(last, offset));
      const span = document.createElement('span');
      span.dataset.slot = `{{${name}}}`;
      const rest = node.nodeValue.slice(offset + match.length);
      const stop = rest.search(SLOT);
      SLOT.lastIndex = 0;
      span.textContent = (stop === -1 ? rest : rest.slice(0, stop)).trim();
      frag.append(span);
      last = offset + match.length + (stop === -1 ? rest.length : stop);
      return match;
    });
    if (last < node.nodeValue.length) frag.append(node.nodeValue.slice(last));
    node.parentNode.replaceChild(frag, node);
  });
}

function chevron() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'faq-accordion-chev');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M7 4l6 6-6 6');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2.1');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  return svg;
}

function buildItem(row, open) {
  const cells = [...row.children].filter(isFilled);
  if (!cells.length) return null;

  const qCell = cells.find(hasHeading) || cells[0];
  const rest = cells.filter((c) => c !== qCell);
  const aCell = rest[0];
  const cCell = rest[1];

  const item = document.createElement('details');
  item.className = 'faq-accordion-item';
  if (open) item.open = true;

  const summary = document.createElement('summary');
  summary.className = 'faq-accordion-question';
  summary.append(chevron());
  const label = document.createElement('span');
  // the heading's text becomes the summary label; a real <summary> is the
  // accessible control, so the authored h3 must not survive inside it
  label.textContent = qCell.textContent.trim();
  summary.append(label);
  item.append(summary);

  const body = document.createElement('div');
  body.className = 'faq-accordion-body';
  if (aCell) [...aCell.childNodes].forEach((n) => body.append(n.cloneNode(true)));

  if (cCell) {
    const check = document.createElement('div');
    check.className = 'faq-accordion-check';
    const key = document.createElement('span');
    key.className = 'faq-accordion-check-key';
    key.textContent = 'Check it yourself';
    check.append(key);
    const path = document.createElement('span');
    path.className = 'faq-accordion-check-path';
    [...cCell.childNodes].forEach((n) => path.append(n.cloneNode(true)));
    check.append(path);
    body.append(check);
  }

  item.append(body);
  return item;
}

export default function decorate(block) {
  const rows = [...block.children].filter(isFilled);
  if (!rows.length) return;

  let meta = null;
  let items = rows;

  // a lone single-cell first row is the block's meta line, not a question
  const firstCells = [...rows[0].children].filter(isFilled);
  if (firstCells.length === 1 && !hasHeading(firstCells[0])) {
    meta = document.createElement('p');
    meta.className = 'faq-accordion-meta';
    meta.textContent = firstCells[0].textContent.trim();
    items = rows.slice(1);
  }

  const list = document.createElement('div');
  list.className = 'faq-accordion-list';
  items.forEach((row, i) => {
    const item = buildItem(row, i === 0);
    if (item) list.append(item);
  });

  block.replaceChildren(list);
  if (meta) block.prepend(meta);

  restoreSlots(block);
  wrapFigures(block);
}
