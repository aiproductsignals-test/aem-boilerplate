/**
 * member-banner — the signed-in state for an authenticated member page.
 *
 * Three parts, in authoring order:
 *   row 1  identity strip  | Signed in as | Dana K. |
 *   row 2  plan banner     | Banner       | Answers below reflect your … plan … |
 *   row 3+ position cells  | Deductible   | $1,112 of $1,750 | 63.5 | $638 remaining |
 *
 * A position row is `label | value | [meter percent] | [note]`. The meter cell is
 * a bare number (percent, no sign); omit it and no meter renders. Authors omit
 * and add cells, so every part is optional and every read is guarded.
 *
 * Personalization slots: the authored value may carry
 * `<span data-slot="{{member.plan_name}}">Chippewa</span>`. Those spans are kept
 * verbatim when the pipeline delivers them. Because DA's editor round-trip can
 * drop inline spans, an authored `{{slot}}` marker in a value cell is an
 * equivalent, span-free way to say the same thing: it is rewritten here into the
 * same `data-slot` span so the rendered contract is identical either way.
 *
 * Numerals: the brand sets every checkable figure in the ledger face. Authored
 * prose cannot carry a wrapper (spans do not survive the editor), so figures are
 * wrapped here — see wrapFigures.
 */

// $1,112 · 96.4% · 3.2-day · 2026-06-14 · 1-800-555-0163 · 412 · CPT 73721
const FIGURE = /(\$\d[\d,.]*|\d[\d,.]*%|\d[\d,.]*(?:-\d[\d,.]*)*(?:-[a-z]+)?)/gi;

const SLOT = /\{\{\s*([a-z0-9_.]+)\s*\}\}/gi;

const text = (el) => (el ? el.textContent.trim() : '');
const isFilled = (el) => !!el && !!el.textContent.trim();

/**
 * Wrap bare figures in `.fig` so they take the mono ledger treatment.
 * Walks text nodes only, so existing markup and slot spans are untouched.
 */
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

/**
 * Rewrite an authored `{{slot}}` marker into the data-slot span the page
 * contract expects. `{{member.plan_name}}Chippewa` and a literal
 * `<span data-slot="{{member.plan_name}}">Chippewa</span>` render identically.
 */
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
      // the value is the run of text up to the next marker or the end
      const rest = node.nodeValue.slice(offset + match.length);
      const stop = rest.search(SLOT);
      SLOT.lastIndex = 0;
      const value = (stop === -1 ? rest : rest.slice(0, stop)).trim();
      span.textContent = value;
      frag.append(span);
      last = offset + match.length + (stop === -1 ? rest.length : stop);
      return match;
    });
    if (last < node.nodeValue.length) frag.append(node.nodeValue.slice(last));
    node.parentNode.replaceChild(frag, node);
  });
}

function buildIdentity(row) {
  const cells = [...row.children];
  const el = document.createElement('div');
  el.className = 'member-banner-identity';

  const name = text(cells[1]) || text(cells[0]);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  if (initials) {
    const avatar = document.createElement('span');
    avatar.className = 'member-banner-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = initials;
    el.append(avatar);
  }

  const label = document.createElement('span');
  label.className = 'member-banner-who';
  if (isFilled(cells[1])) {
    label.append(`${text(cells[0])} `);
    [...cells[1].childNodes].forEach((n) => label.append(n.cloneNode(true)));
  } else {
    [...cells[0].childNodes].forEach((n) => label.append(n.cloneNode(true)));
  }
  el.append(label);
  return el;
}

function buildBanner(row) {
  const cells = [...row.children];
  const source = isFilled(cells[1]) ? cells[1] : cells[0];
  const el = document.createElement('p');
  el.className = 'member-banner-note';
  el.innerHTML = '<svg class="member-banner-tick" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
    + '<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.7"/>'
    + '<path d="M4.8 8.2l2.2 2.2 4.2-4.6" stroke="currentColor" stroke-width="1.7" '
    + 'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const copy = document.createElement('span');
  [...source.childNodes].forEach((n) => copy.append(n.cloneNode(true)));
  el.append(copy);
  return el;
}

function buildCell(row) {
  const cells = [...row.children];
  const el = document.createElement('div');
  el.className = 'member-banner-cell';

  const label = document.createElement('span');
  label.className = 'member-banner-label';
  label.textContent = text(cells[0]);
  el.append(label);

  const value = document.createElement('span');
  value.className = 'member-banner-value';
  if (cells[1]) [...cells[1].childNodes].forEach((n) => value.append(n.cloneNode(true)));
  el.append(value);

  const pct = parseFloat(text(cells[2]));
  if (!Number.isNaN(pct)) {
    const meter = document.createElement('div');
    meter.className = 'member-banner-meter';
    meter.setAttribute('role', 'img');
    meter.setAttribute('aria-label', `${text(cells[1])} — ${Math.round(pct)}%`);
    const fill = document.createElement('i');
    fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    meter.append(fill);
    el.append(meter);
  }

  if (isFilled(cells[3])) {
    const note = document.createElement('span');
    note.className = 'member-banner-note-small';
    [...cells[3].childNodes].forEach((n) => note.append(n.cloneNode(true)));
    el.append(note);
  }

  return el;
}

export default function decorate(block) {
  const rows = [...block.children].filter((r) => isFilled(r));
  if (!rows.length) return;

  const head = document.createElement('div');
  head.className = 'member-banner-head';
  const grid = document.createElement('div');
  grid.className = 'member-banner-grid';

  rows.forEach((row, i) => {
    if (i === 0) head.append(buildIdentity(row));
    else if (i === 1) head.append(buildBanner(row));
    else grid.append(buildCell(row));
  });

  block.replaceChildren(head);
  if (grid.children.length) block.append(grid);

  restoreSlots(block);
  wrapFigures(block);
}
