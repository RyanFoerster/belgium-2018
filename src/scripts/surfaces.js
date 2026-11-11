import { doc, rng } from './core.js';

/* Paper and ink, drawn once on small canvases and handed to the CSS as custom properties.
   The papers are those of a freshly printed risograph: off-white, matte, powdery, a few fine fibres — never yellowed, never creased.
   --tx-paper  fine flour grain            --tx-fib   the same sheet with visible fibres
   --tx-riso   uneven ink on a flat colour --tx-dust  specks for the black pages
   --ink-mask  a rubber stamp's ink        --worn     pinholes in the big type, as a drum leaves them
   --tx-dry    the streaks of a dry brush (a mask) */
export function drawSurfaces() {
  function tile(n, fn) { var c = document.createElement('canvas'); c.width = c.height = n; fn(c.getContext('2d'), n); return 'url(' + c.toDataURL() + ')'; }
  function fibres(x, n, r, count, a0, a1, light) {
    x.lineCap = 'round';
    for (var i = 0; i < count; i++) {
      var a = r() * n, b = r() * n, l = 4 + r() * 13, g = r() * 6.3;
      x.strokeStyle = (light ? 'rgba(255,255,255,' : 'rgba(30,28,24,') + (a0 + r() * (a1 - a0)).toFixed(3) + ')'; x.lineWidth = .5;
      x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + Math.cos(g) * l * .5 + (r() - .5) * 5, b + Math.sin(g) * l * .5 + (r() - .5) * 5, a + Math.cos(g) * l, b + Math.sin(g) * l); x.stroke();
    }
  }
  // tileable value noise, 0…1
  function noise(r, G) { var g = [], i; for (i = 0; i < G * G; i++) g.push(r()); return function (u, v) { var a = Math.floor(u), b = Math.floor(v), fu = u - a, fv = v - b, w = function (p, q) { return g[(q % G) * G + (p % G)]; }; fu = fu * fu * (3 - 2 * fu); fv = fv * fv * (3 - 2 * fv); return (w(a, b) * (1 - fu) + w(a + 1, b) * fu) * (1 - fv) + (w(a, b + 1) * (1 - fu) + w(a + 1, b + 1) * fu) * fv; }; }
  try {
    doc.style.setProperty('--grain', tile(220, function (x, n) {
      var im = x.createImageData(n, n), d = im.data;
      for (var i = 0; i < d.length; i += 4) { var v = Math.random() < .5 ? 0 : 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.random() * 22; }
      x.putImageData(im, 0, 0);
    }));
    // flour: every pixel a touch lighter or darker, a few specks, almost no fibre
    var flour = function (x, n, seed, k) {
      var r = rng(seed), im = x.createImageData(n, n), d = im.data, i;
      for (i = 0; i < d.length; i += 4) { var dark = r() < .56; d[i] = d[i + 1] = d[i + 2] = dark ? 24 : 255; d[i + 3] = r() * r() * (dark ? 30 : 46) * k; }
      x.putImageData(im, 0, 0);
      for (i = 0; i < 70 * k; i++) { x.fillStyle = 'rgba(30,28,24,' + (.06 + r() * .1).toFixed(3) + ')'; x.fillRect(r() * n, r() * n, 1, 1); }
      return r;
    };
    doc.style.setProperty('--tx-paper', tile(420, function (x, n) { var r = flour(x, n, 11, 1); fibres(x, n, r, 26, .03, .06); }));
    doc.style.setProperty('--tx-fib', tile(420, function (x, n) { var r = flour(x, n, 19, .8); fibres(x, n, r, 170, .035, .085); fibres(x, n, r, 110, .25, .5, true); }));
    // riso ink on a flat colour: never quite even — lighter where the drum ran dry, pinholes, a soft banding
    doc.style.setProperty('--tx-riso', tile(340, function (x, n) {
      var r = rng(53), im = x.createImageData(n, n), d = im.data, f = noise(r, 6), i, j;
      for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
        var v = f(i / n * 6, j / n * 6), o = (j * n + i) * 4, pin = r() < .012;
        d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = pin ? 70 + r() * 60 : Math.max(0, v - .45) * 46 + r() * 16;
      }
      x.putImageData(im, 0, 0);
    }));
    doc.style.setProperty('--tx-dust', tile(420, function (x, n) {
      var r = rng(29), i;
      for (i = 0; i < 1500; i++) { x.fillStyle = 'rgba(245,243,238,' + (.03 + r() * .13).toFixed(3) + ')'; x.fillRect(r() * n, r() * n, 1, 1); }
      for (i = 0; i < 26; i++) { x.fillStyle = 'rgba(245,243,238,' + (.08 + r() * .16).toFixed(3) + ')'; x.beginPath(); x.arc(r() * n, r() * n, .5 + r() * 1.1, 0, 6.3); x.fill(); }
    }));
    // uneven ink for rubber stamps: mostly there, eaten away in patches
    doc.style.setProperty('--ink-mask', tile(240, function (x, n) {
      var r = rng(47), im = x.createImageData(n, n), d = im.data, f = noise(r, 12), i, j;
      for (j = 0; j < n; j++) for (i = 0; i < n; i++) { var val = f(i / n * 12, j / n * 12) + (r() - .5) * .5; d[(j * n + i) * 4 + 3] = val > .3 ? (val > .42 ? 255 : 150) : 0; }
      x.putImageData(im, 0, 0);
    }));
    // a brush running out of paint: streaks where the bristles left the paper, a few pinholes (used as a mask on the brush strokes)
    doc.style.setProperty('--tx-dry', tile(360, function (x, n) {
      var r = rng(91), im = x.createImageData(n, n), d = im.data, f = noise(r, 24), g = noise(r, 5), i, j;
      for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
        var v = f(i / n * 4, j / n * 24) * .7 + g(i / n * 5, j / n * 5) * .3 + (r() - .5) * .2;
        d[(j * n + i) * 4 + 3] = v > .6 ? Math.max(0, 255 - (v - .6) * 1500) : 255;
      }
      x.putImageData(im, 0, 0);
    }));
    // the big type: solid, with the pinholes and the faint dry patches of a riso drum — no scuffs, no scratches
    doc.style.setProperty('--worn', tile(520, function (x, n) {
      var r = rng(73), im = x.createImageData(n, n), d = im.data, f = noise(r, 9), i, j;
      for (j = 0; j < n; j++) for (i = 0; i < n; i++) { var v = f(i / n * 9, j / n * 9), dry = v > .7 ? (v - .7) * 2.2 : 0; d[(j * n + i) * 4 + 3] = r() < .006 + dry * .22 ? 40 + r() * 120 : 255; }
      x.putImageData(im, 0, 0);
    }));
  } catch (e) {}
}
