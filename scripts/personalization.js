/**
 * Shared decoration helpers for authenticated member surfaces.
 *
 * Two jobs, both of which exist because authored content cannot carry inline
 * markup: the DA pipeline delivers a block's cells as plain text plus the
 * handful of inline elements it recognises, and drops `<span>` entirely.
 * Verified against /member-answers: an authored
 * `<span data-slot="{{member.plan_name}}">Chippewa</span>` arrives as the bare
 * word `Chippewa`.
 *
 * So both wrappers are rebuilt at decorate time, from markers that survive as
 * text. Per AGENTS.md these live in /scripts/ rather than being imported
 * block-to-block.
 */

/*
 * A checkable figure. Ordered so the longest form wins: a spelled date first,
 * then currency, percentage, and finally plain or hyphenated runs (3.2-day,
 * 2026-06-14, 1-800-555-0163). Every alternative ends on a digit or a unit, so
 * sentence punctuation is never swallowed into the mono run.
 */
const FIGURE = new RegExp([
  '[A-Z][a-z]{2,8} \\d{1,2}, \\d{4}', // July 1, 2026
  '\\$\\d(?:[\\d,]*\\d)?(?:\\.\\d+)?', // $1,384
  '\\d(?:[\\d,]*\\d)?(?:\\.\\d+)?%', // 96.4%
  '\\d(?:[\\d,]*\\d)?(?:\\.\\d+)?(?:-[A-Za-z\\d]+(?:\\.\\d+)?)*', // 412 · 3.2-day · 2026-06-14
].join('|'), 'g');

/* {{member.plan_name|Chippewa}} — slot name, pipe, the value to render */
const SLOT = /\{\{\s*([a-z0-9_.]+)\s*\|\s*([^}]*?)\s*\}\}/gi;

/**
 * Replace matches of `re` inside every text node under `root`, using `make` to
 * build the replacement element. Text nodes only, so existing markup is never
 * disturbed and an already-wrapped value is never wrapped twice.
 *
 * @param {Element} root subtree to walk
 * @param {RegExp} re global regex to match
 * @param {(match: string[]) => Element} make builds the replacement node
 * @param {string} skipSelector do not descend into text already inside this
 */
function replaceInText(root, re, make, skipSelector) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    re.lastIndex = 0;
    if (re.test(node.nodeValue) && !node.parentElement.closest(skipSelector)) targets.push(node);
  }
  re.lastIndex = 0;

  targets.forEach((node) => {
    const frag = document.createDocumentFragment();
    const value = node.nodeValue;
    let last = 0;
    re.lastIndex = 0;
    let m = re.exec(value);
    while (m) {
      if (m.index > last) frag.append(value.slice(last, m.index));
      frag.append(make(m));
      last = m.index + m[0].length;
      m = re.exec(value);
    }
    if (last < value.length) frag.append(value.slice(last));
    node.parentNode.replaceChild(frag, node);
  });
}

/**
 * The text a marker renders as, with every `{{name|value}}` reduced to its
 * value. Use it for anything that cannot hold markup — an aria-label, a title —
 * so assistive tech never reads the raw marker aloud.
 * @param {string} value raw authored text
 * @returns {string} the text a sighted reader sees
 */
export function plainText(value) {
  return String(value || '').replace(SLOT, (m, name, val) => val).trim();
}

/**
 * Rewrite `{{slot.name|value}}` markers into the inspectable span the member
 * surfaces contract on: `<span data-slot="{{slot.name}}">value</span>`.
 * @param {Element} root subtree to decorate
 */
export function restoreSlots(root) {
  replaceInText(root, SLOT, ([, name, value]) => {
    const span = document.createElement('span');
    span.dataset.slot = `{{${name}}}`;
    span.textContent = value;
    return span;
  }, '[data-slot]');
}

/**
 * Copy a cell's content into an inline container, unwrapping a lone `<p>`.
 * The pipeline wraps cell text in a paragraph; nesting that inside a `<span>`
 * is invalid and inherits the boilerplate's paragraph margin.
 * @param {Element} cell source cell
 * @param {Element} target inline container to fill
 */
export function cloneInline(cell, target) {
  if (!cell || !target) return;
  const kids = [...cell.childNodes];
  const only = kids.filter((n) => n.nodeType !== Node.TEXT_NODE || n.nodeValue.trim());
  const source = (only.length === 1 && only[0].tagName === 'P') ? only[0] : cell;
  [...source.childNodes].forEach((n) => target.append(n.cloneNode(true)));
}

/**
 * Wrap bare figures in `.fig` so every checkable number takes the brand's
 * ledger face. This is the numeral rule made durable: authors type `$1,384`
 * and the mono treatment follows without them marking it up.
 * @param {Element} root subtree to decorate
 */
export function wrapFigures(root) {
  replaceInText(root, FIGURE, ([match]) => {
    const span = document.createElement('span');
    span.className = 'fig';
    span.textContent = match;
    return span;
  }, '.fig');
}
