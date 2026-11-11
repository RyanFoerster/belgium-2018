import { $$, rng, seeded } from '../core.js';
import { badge } from '../../lib/badges';

// Stickers written in the page are already drawn at build time; those the wall creates are drawn here.
// Each one then gets its own tilt and drift (seeded by its place in the page).
export function hydrateStickers() {
  seeded('[data-il]').forEach(function (n, k) {
    var r = rng(k * 131 + 7);
    if (!n.firstElementChild) { var g = badge(n.dataset.il, n.dataset.a || '', n.dataset.b || ''); n.innerHTML = g.svg; n.style.aspectRatio = g.w + '/' + g.h; }
    if (!n.style.getPropertyValue('--rot')) n.style.setProperty('--rot', ((r() - .5) * 24).toFixed(1) + 'deg');
    n.style.setProperty('--md', Math.round((r() - .5) * 40)); n.style.setProperty('--fd', (5 + r() * 6).toFixed(1) + 's');
    n.setAttribute('aria-hidden', 'true');
  });
}

// once the fonts are in, any word wider than its shape is squeezed to fit
export function fitStickers() {
  $$('.il text[data-max]').forEach(function (t) {
    t.removeAttribute('textLength'); t.removeAttribute('lengthAdjust');
    var m = +t.getAttribute('data-max'), len = 0; try { len = t.getComputedTextLength(); } catch (e) {}
    if (len > m) { t.setAttribute('textLength', m); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
  });
}
