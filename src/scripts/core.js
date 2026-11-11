/* Shared by every module of the scroll engine: the environment, small DOM helpers, easings,
   and the seeded generator that makes every "random" cut, tear and tilt the same on each visit. */
var doc = document.documentElement;
var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]rm=1/.test(location.search);
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
var seg = function (p, a, b) { return clamp((p - a) / (b - a)); };
var E = {
  io: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  o: function (t) { return 1 - Math.pow(1 - t, 3); },
  i: function (t) { return t * t * t; },
  // overshoots, then settles — things that land
  back: function (t) { var c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  // stop-motion: the same move on 8 or 12 drawings
  s8: function (t) { return Math.round(E.o(t) * 8) / 8; },
  s12: function (t) { return Math.round(t * 12) / 12; }
};
// small deterministic generator: every "random" cut, tear and tilt is the same on each visit
function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
// nodes inside the loader are listed last, so the seeded cuts and tilts of the page are the same with or without it
function seeded(sel) { var a = $$(sel), l = a.filter(function (n) { return n.closest('#ld'); }); return a.filter(function (n) { return !n.closest('#ld'); }).concat(l); }
function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
var FINE = window.matchMedia('(pointer:fine)').matches;

export { doc, RM, FINE, $, $$, clamp, seg, E, rng, seeded, el };
