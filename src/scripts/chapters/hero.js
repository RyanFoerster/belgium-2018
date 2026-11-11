import { FINE, RM, $ } from '../core.js';

// 00 · the poster keeps moving once it is up: with a mouse its pieces shift by their own amount towards the pointer
// (--hx/--hy on the art, -1 to 1; the depths are in styles/v2.css). Only while the first screen is in view.
export function setupHero() {
  var art = $('#heroArt'); if (!art || RM || !FINE) return;
  var raf = 0, x = 0, y = 0;
  window.addEventListener('pointermove', function (e) {
    if (window.scrollY > window.innerHeight) return;
    x = (e.clientX / window.innerWidth * 2 - 1).toFixed(3); y = (e.clientY / window.innerHeight * 2 - 1).toFixed(3);
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; art.style.setProperty('--hx', x); art.style.setProperty('--hy', y); });
  }, { passive: true });
}
