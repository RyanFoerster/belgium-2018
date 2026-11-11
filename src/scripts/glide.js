import Lenis from 'lenis';
import { RM, FINE } from './core.js';

// The wheel does not jump: the page glides to where it was sent (Lenis, on fine pointers only; touch keeps its native scroll).
// Held still while the loader is up; the function returned releases it.
export function setupGlide() {
  if (RM || !FINE || /[?&]glide=0/.test(location.search)) return function () {};
  var lenis = new Lenis({ lerp: .1, smoothWheel: true });
  lenis.stop();
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  return function () { lenis.start(); };
}
