import Lenis from 'lenis';
import { RM, FINE } from './core.js';

// The wheel does not jump: the page glides to where it was sent (Lenis, on fine pointers only; touch keeps its native scroll).
// Held still while the loader is up; the function returned releases it.
var lenis = null;
export function setupGlide() {
  if (RM || !FINE || /[?&]glide=0/.test(location.search)) return function () {};
  lenis = new Lenis({ lerp: .1, smoothWheel: true });
  lenis.stop();
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  return function () { lenis.start(); };
}

/* ── being sent somewhere: the chapter index, the rail, the ticket stubs, the steps of a replay ── */
// at once (behind a curtain) or as a glide of `seconds`
export function goTo(y, at) {
  stopPlay();
  y = Math.max(0, Math.round(y));
  if (lenis) lenis.scrollTo(y, at === true ? { immediate: true, force: true } : { duration: at || 1.1, force: true });
  else window.scrollTo({ top: y, behavior: at === true || RM ? 'auto' : 'smooth' });
}

// a replay played for you: the page is scrolled at a steady pace until `y`; any wheel, key or touch gives the page back
var play = null;
export function stopPlay() {
  if (!play) return;
  var p = play; play = null; cancelAnimationFrame(p.raf);
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (e) { window.removeEventListener(e, stopPlay); });
  if (p.done) p.done();
}
export function playTo(y, seconds, done) {
  stopPlay();
  var y0 = window.scrollY, t0 = performance.now(), ms = Math.max(300, seconds * 1000);
  play = { done: done, raf: 0 };
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (e) { window.addEventListener(e, stopPlay, { passive: true }); });
  (function tick(now) {
    if (!play) return;
    var u = Math.min(1, (now - t0) / ms);
    window.scrollTo(0, y0 + (y - y0) * u);
    if (u < 1) play.raf = requestAnimationFrame(tick); else stopPlay();
  })(t0);
}
export function playing() { return !!play; }
