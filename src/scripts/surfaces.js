import { doc, rng } from './core.js';

// Film grain, paper fibre, dust, stamp ink, worn ink: small tiles drawn once on a canvas and handed to the CSS as custom properties.
export function drawSurfaces() {
  /* ── surfaces: film grain, paper fibre, dust — small tiles drawn once ── */
  (function () {
    function tile(n, fn) { var c = document.createElement('canvas'); c.width = c.height = n; fn(c.getContext('2d'), n); return 'url(' + c.toDataURL() + ')'; }
    try {
      doc.style.setProperty('--grain', tile(220, function (x, n) {
        var im = x.createImageData(n, n), d = im.data;
        for (var i = 0; i < d.length; i += 4) { var v = Math.random() < .5 ? 0 : 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.random() * 38; }
        x.putImageData(im, 0, 0);
      }));
      // newsprint: specks, short fibres, a few toner blotches
      doc.style.setProperty('--tx-paper', tile(420, function (x, n) {
        var r = rng(11), i;
        for (i = 0; i < 5200; i++) { x.fillStyle = 'rgba(8,8,8,' + (.03 + r() * .12).toFixed(3) + ')'; x.fillRect(r() * n, r() * n, 1 + (r() < .08 ? 1 : 0), 1); }
        x.lineCap = 'round';
        for (i = 0; i < 150; i++) {
          var a = r() * n, b = r() * n, l = 5 + r() * 16, g = r() * 6.3;
          x.strokeStyle = 'rgba(8,8,8,' + (.05 + r() * .09).toFixed(3) + ')'; x.lineWidth = .6;
          x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + Math.cos(g) * l * .5 + (r() - .5) * 6, b + Math.sin(g) * l * .5 + (r() - .5) * 6, a + Math.cos(g) * l, b + Math.sin(g) * l); x.stroke();
        }
        for (i = 0; i < 9; i++) { x.fillStyle = 'rgba(8,8,8,' + (.008 + r() * .014).toFixed(3) + ')'; x.beginPath(); x.ellipse(r() * n, r() * n, 6 + r() * 26, 3 + r() * 9, r() * 3, 0, 6.3); x.fill(); }
      }));
      // dust + scratches for the black pages
      doc.style.setProperty('--tx-dust', tile(420, function (x, n) {
        var r = rng(29), i;
        for (i = 0; i < 900; i++) { x.fillStyle = 'rgba(245,243,238,' + (.05 + r() * .22).toFixed(3) + ')'; x.fillRect(r() * n, r() * n, 1, 1); }
        for (i = 0; i < 14; i++) { x.strokeStyle = 'rgba(245,243,238,' + (.05 + r() * .1).toFixed(3) + ')'; x.lineWidth = .5; var a = r() * n, b = r() * n; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (r() - .5) * 26, b + 30 + r() * 110); x.stroke(); }
        for (i = 0; i < 40; i++) { x.fillStyle = 'rgba(245,243,238,' + (.08 + r() * .2).toFixed(3) + ')'; x.beginPath(); x.arc(r() * n, r() * n, .6 + r() * 1.4, 0, 6.3); x.fill(); }
      }));
      // uneven ink for rubber stamps: mostly there, eaten away in patches (tileable value noise, thresholded)
      doc.style.setProperty('--ink-mask', tile(240, function (x, n) {
        var r = rng(47), im = x.createImageData(n, n), d = im.data, g = [], G = 12, i, j;
        for (i = 0; i < G * G; i++) g.push(r());
        var w = function (p, q) { return g[(q % G) * G + (p % G)]; };
        for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
          var u = i / n * G, v = j / n * G, a = Math.floor(u), b = Math.floor(v), fu = u - a, fv = v - b;
          var val = (w(a, b) * (1 - fu) + w(a + 1, b) * fu) * (1 - fv) + (w(a, b + 1) * (1 - fu) + w(a + 1, b + 1) * fu) * fv + (r() - .5) * .5;
          d[(j * n + i) * 4 + 3] = val > .3 ? (val > .42 ? 255 : 150) : 0;
        }
        x.putImageData(im, 0, 0);
      }));
      // worn ink for the big type: almost all there, specks and a few scuffs missing
      doc.style.setProperty('--worn', tile(520, function (x, n) {
        var r = rng(73), i; x.fillStyle = '#000'; x.fillRect(0, 0, n, n); x.globalCompositeOperation = 'destination-out';
        for (i = 0; i < 2600; i++) { x.globalAlpha = .5 + r() * .5; x.fillRect(r() * n, r() * n, 1 + (r() < .25 ? 1 : 0), 1 + (r() < .12 ? 1 : 0)); }
        for (i = 0; i < 46; i++) { x.globalAlpha = .35 + r() * .5; x.beginPath(); x.ellipse(r() * n, r() * n, 2 + r() * 9, 1 + r() * 3, r() * 3, 0, 6.3); x.fill(); }
        x.lineWidth = 1; for (i = 0; i < 26; i++) { x.globalAlpha = .4 + r() * .4; var a = r() * n, b = r() * n; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (r() - .5) * 90, b + (r() - .5) * 26); x.stroke(); }
      }));
    } catch (e) {}
  })();
}
