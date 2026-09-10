/**
 * cards — the canonical repeating-unit block (David's Model D9/D11).
 *
 * Variants:
 *   .cards.index — the tools index. A ruled row per tool: icon + title +
 *                  description + arrow link, with the verification interval
 *                  pulled into a right-hand mono gutter so the intervals align
 *                  into a column. (Improvements item 3 replaced the captured
 *                  four-up stroke-icon card grid with this.)
 *
 * Schema: stardust/eds-schema/index.json § tools-index (4 × DIV.tool-row)
 *
 * Authoring rows: one row per unit, up to three cells.
 *   | :directory: + <h3>Title</h3> | description + arrow link | interval |
 *
 * Cells are classified by CONTENT, never by index: the cell holding a heading
 * is the title cell, the cell holding a link is the body, a remaining text cell
 * is the meta gutter. A unit may omit any of them.
 *
 * @ew-exempt <p> icon token (e.g. ":provider-directory:") — text-as-metadata,
 *   never displayed as prose. The delivery pipeline normally converts the token
 *   into <span class="icon icon-*">; iconFromToken() below is the fallback for
 *   any path that does not, so a literal token can never reach a reader.
 */

/**
 * Turn a literal ":name:" paragraph into a rendered icon.
 * decorateIcons() is NOT imported: the round-trip harness inlines block JS and
 * cannot resolve module-scope imports, so the two-line equivalent is inlined.
 */
function iconFromToken(el) {
  const m = el.textContent.trim().match(/^:([a-z0-9-]+):$/i);
  if (!m) return null;
  const name = m[1].toLowerCase();
  const span = document.createElement('span');
  span.className = `icon icon-${name}`;
  const img = document.createElement('img');
  img.dataset.iconName = name;
  img.src = `${(window.hlx && window.hlx.codeBasePath) || ''}/icons/${name}.svg`;
  img.alt = '';
  img.loading = 'lazy';
  img.width = 30;
  img.height = 30;
  span.append(img);
  el.replaceChildren(span);
  return el;
}

/** Fill any icon span the pipeline already produced. */
function fillIconSpans(scope) {
  scope.querySelectorAll('span.icon').forEach((span) => {
    if (span.hasChildNodes()) return;
    const cls = [...span.classList].find((c) => c.startsWith('icon-'));
    if (!cls) return;
    const name = cls.substring(5);
    const img = document.createElement('img');
    img.dataset.iconName = name;
    img.src = `${(window.hlx && window.hlx.codeBasePath) || ''}/icons/${name}.svg`;
    img.alt = '';
    img.loading = 'lazy';
    img.width = 30;
    img.height = 30;
    span.append(img);
  });
}

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const has = (el, sel) => !!el && (el.matches(sel) || !!el.querySelector(sel));
const hasContent = (el) => !!el && (el.textContent.trim() || el.querySelector('a, picture, img, span.icon'));

/**
 * Expand the runtime's wrapTextNodes folding (#104): a media-led or
 * unlisted-first-child cell arrives as ONE wrapper <p> holding everything.
 */
function childrenOf(cell) {
  const kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
    && (kids[0].querySelector('picture, img') || kids[0].querySelector('span.icon'))) {
    return [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      if (n.textContent.trim()) {
        // harness-only: DA always delivers a <p> here. Move the text node
        // rather than copying its content, so the gate sees the same node.
        const p = document.createElement('p');
        p.append(n);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  return kids;
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const list = document.createElement('div');
  list.className = 'cards-list';

  rows.forEach((row) => {
    const cells = [...row.children].filter(hasContent);
    if (!cells.length) return;

    const card = document.createElement('div');
    card.className = 'card';

    // classify by content, not position
    const titleCell = cells.find((c) => has(c, 'h1, h2, h3, h4, h5, h6'));
    const bodyCell = cells.find((c) => c !== titleCell && has(c, 'a'));
    const metaCell = cells.find((c) => c !== titleCell && c !== bodyCell);

    if (titleCell) {
      const kids = childrenOf(titleCell);
      kids.forEach((el) => { if (!has(el, 'span.icon')) iconFromToken(el); });
      const icon = kids.find((el) => has(el, 'span.icon'));
      const heading = kids.find((el) => el.matches('h1, h2, h3, h4, h5, h6'));
      if (icon) card.append(wrapNode(icon, 'card-icon'));
      if (heading) card.append(wrapNode(heading, 'card-title'));
      // anything else in the title cell rides along as body text
      kids.filter((el) => el !== icon && el !== heading)
        .forEach((el) => card.append(wrapNode(el, 'card-body')));
    }

    if (bodyCell) {
      const body = document.createElement('div');
      body.className = 'card-body';
      childrenOf(bodyCell).forEach((el) => {
        // an arrow link paragraph keeps its own wrapper so it can baseline-align
        if (has(el, 'a') && !el.matches('h1, h2, h3, h4, h5, h6')) {
          el.classList.add('arrow-wrap');
        }
        body.append(el);
      });
      card.append(body);
    }

    if (metaCell) {
      const meta = document.createElement('div');
      meta.className = 'card-meta';
      childrenOf(metaCell).forEach((el) => meta.append(el));
      card.append(meta);
    }

    if (card.children.length) list.append(card);
  });

  block.replaceChildren(list);
  fillIconSpans(block);
}
