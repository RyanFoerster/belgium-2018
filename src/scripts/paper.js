import { $$, rng, seeded, el } from './core.js';

/* ── shapes: pure functions of a seeded generator ── */
// cut with scissors: five snips a side, corners lopped off
function scissors(r) {
  var p = [], n = 5, i, q = function (v) { return v.toFixed(1) + '%'; };
  for (i = 0; i < n; i++) p.push(q(4 + i / n * 92 + r() * 8) + ' ' + q(r() * 7));
  for (i = 0; i < n; i++) p.push(q(100 - r() * 7) + ' ' + q(4 + i / n * 92 + r() * 8));
  for (i = 0; i < n; i++) p.push(q(96 - i / n * 92 - r() * 8) + ' ' + q(100 - r() * 7));
  for (i = 0; i < n; i++) p.push(q(r() * 7) + ' ' + q(96 - i / n * 92 - r() * 8));
  return 'polygon(' + p.join(',') + ')';
}

// the white margin of a print: cut by hand, a few pixels out everywhere, never a rectangle
function cutpx(r, d) {
  var p = [], n = 4, i, px = function () { return (r() * d).toFixed(1) + 'px'; }, at = function (i) { return (i / n * 100 + (i && i < n ? (r() - .5) * 14 : 0)).toFixed(1) + '%'; };
  for (i = 0; i <= n; i++) p.push(at(i) + ' ' + px());
  for (i = 1; i < n; i++) p.push('calc(100% - ' + px() + ') ' + at(i));
  for (i = n; i >= 0; i--) p.push(at(i) + ' calc(100% - ' + px() + ')');
  for (i = n - 1; i > 0; i--) p.push(px() + ' ' + at(i));
  return 'polygon(' + p.join(',') + ')';
}
// a band torn across a photograph (y0→y1, in %): the inner shape keeps its colour, the outer one is the white fibre around it
function tearBand(r, y0, y1) {
  var a = [], b = [], n = 11, i, x;
  for (i = 0; i <= n; i++) { x = -4 + i / n * 108; a.push([x, y0 + (r() - .5) * 7 + (i % 3 === 1 ? 3 : 0)]); b.push([x, y1 + (r() - .5) * 7 - (i % 4 === 2 ? 3 : 0)]); }
  var poly = function (g) { return 'polygon(' + a.map(function (q) { return q[0].toFixed(1) + '% ' + (q[1] - g).toFixed(1) + '%'; }).concat(b.slice().reverse().map(function (q) { return q[0].toFixed(1) + '% ' + (q[1] + g).toFixed(1) + '%'; })).join(',') + ')'; };
  return [poly(0), poly(1.5)];
}

/* ── edges in the page ── */
export function addRipCores() {
  // every torn chapter edge gets a paper core that slides out from under it
  $$('.rip').forEach(function (n) { var w = el('i', 'rip rip-w'); w.dataset.torn = 'b'; w.dataset.tornD = '30'; w.dataset.par = '-.05'; n.dataset.tornD = '26'; n.parentNode.insertBefore(w, n); });
}

/* ── paper: torn edges, and one sheet ripped in two ── */
function tornAll() {
  seeded('[data-torn]').forEach(function (n, k) {
    var sides = n.dataset.torn, d = +(n.dataset.tornD || 5), r = rng(k * 131 + 7), w = n.offsetWidth || 300, h = n.offsetHeight || 80, pts = [], tmp;
    function run(len, has, fn) { if (!has) return; var c = Math.max(4, Math.round(len / 13)); for (var i = 1; i < c; i++) fn((i / c * 100 + (r() - .5) * (60 / c)).toFixed(2), (r() * d).toFixed(1)); }
    pts.push('0 0'); run(w, sides.indexOf('t') > -1, function (a, o) { pts.push(a + '% ' + o + 'px'); });
    pts.push('100% 0'); run(h, sides.indexOf('r') > -1, function (a, o) { pts.push('calc(100% - ' + o + 'px) ' + a + '%'); });
    pts.push('100% 100%'); tmp = []; run(w, sides.indexOf('b') > -1, function (a, o) { tmp.push(a + '% calc(100% - ' + o + 'px)'); }); pts = pts.concat(tmp.reverse());
    pts.push('0 100%'); tmp = []; run(h, sides.indexOf('l') > -1, function (a, o) { tmp.push(o + 'px ' + a + '%'); }); pts = pts.concat(tmp.reverse());
    n.style.setProperty('--torn', 'polygon(' + pts.join(',') + ')');
  });
}

// one sheet ripped in two
export function ripSheets() {
  $$('[data-rip]').forEach(function (n, k) {
    var r = rng(k * 7 + 3), pts = [], c = 18;
    for (var i = 0; i <= c; i++) pts.push((56 - i / c * 12 + (r() - .5) * 6).toFixed(1) + '% ' + (i / c * 100).toFixed(1) + '%');
    var clone = n.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true'); clone.removeAttribute('data-rip');
    n.classList.add('rip-a'); clone.classList.add('rip-b');
    n.style.clipPath = 'polygon(0 0,' + pts.join(',') + ',0 100%)';
    clone.style.clipPath = 'polygon(100% 0,' + pts.join(',') + ',100% 100%)';
    n.parentNode.appendChild(clone);
  });
}

export { scissors, cutpx, tearBand, tornAll };
