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
 * Personalization slots are authored as `{{member.plan_name|Chippewa}}` and
 * become `<span data-slot="{{member.plan_name}}">Chippewa</span>` here. The
 * marker form is the one that survives: the pipeline drops inline spans from
 * authored cells, verified against this page.
 *
 * Numerals take the brand's ledger face the same way — see /scripts/personalization.js.
 */

import {
  restoreSlots, wrapFigures, plainText, cloneInline,
} from '../../scripts/personalization.js';

const text = (el) => (el ? el.textContent.trim() : '');
const isFilled = (el) => !!el && !!el.textContent.trim();

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
    cloneInline(cells[1], label);
  } else {
    cloneInline(cells[0], label);
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
  cloneInline(source, copy);
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
  cloneInline(cells[1], value);
  el.append(value);

  const pct = parseFloat(text(cells[2]));
  if (!Number.isNaN(pct)) {
    const meter = document.createElement('div');
    meter.className = 'member-banner-meter';
    meter.setAttribute('role', 'img');
    // an aria-label cannot hold markup, so the marker is reduced to its value
    meter.setAttribute('aria-label', `${plainText(text(cells[1]))} — ${Math.round(pct)}%`);
    const fill = document.createElement('i');
    fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    meter.append(fill);
    el.append(meter);
  }

  if (isFilled(cells[3])) {
    const note = document.createElement('span');
    note.className = 'member-banner-note-small';
    cloneInline(cells[3], note);
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
