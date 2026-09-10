import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — Birch Creek chrome.
 *
 * Authored at content/footer.html as four link columns plus a legal band.
 * The Transparency column (machine-readable price files, quality reports,
 * network adequacy filings) is a LOCKED IA priority — it is never merged or
 * abbreviated (DESIGN.json § extensions.iaPriorities).
 *
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-root';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // the authored sections in order: the four link columns, then the legal band
  const sections = [...footer.children];
  const legal = sections[sections.length - 1];
  const columns = sections.slice(0, -1);

  if (columns.length) {
    const grid = document.createElement('div');
    grid.className = 'foot-grid';
    columns.forEach((col) => {
      col.classList.add('foot-col');
      grid.append(col);
    });
    footer.prepend(grid);
  }
  if (legal) legal.classList.add('foot-legal');

  block.append(footer);
}
