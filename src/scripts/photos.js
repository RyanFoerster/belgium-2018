import { $, $$, rng, el } from './core.js';
import { scissors, cutpx, tearBand } from './paper.js';
import { PHOTOS, photoSrc, photoPage } from '../data/photos';

// what the loader waits for: the first photographs of the page
export var LOAD = { total: 0, done: 0 };

export function setupPhotos() {
  /* ── photographs: prints, tape, pencil captions, credits — and each one pulled as a screen print ── */
  (function () {
    var used = {}, P = PHOTOS, keys = {}, order = [], qi = 0, active = 0, nfig = 0, off = $$('#ld [data-photo]').length;
    // [paper, spot colour]: black ink always; "a" leaves everything but the ink transparent
    var TONE = { k: [[245, 243, 238], null], y: [[245, 243, 238], [247, 212, 23]], r: [[245, 243, 238], [229, 43, 50]], yk: [[247, 212, 23], null], rk: [[229, 43, 50], null], g: [[226, 223, 216], [112, 109, 104]], a: [null, null] };
    function toneOf(fig, idx) {
      if (fig.dataset.ink) return fig.dataset.ink;
      if (/(^|\s)duo-/.test(fig.className)) return 'a';
      if (fig.closest('.stk')) return ['yk', 'k', 'y', 'yk', 'k', 'r'][Math.abs(idx) % 6];
      if (fig.classList.contains('print')) return ['yk', 'k', 'rk', 'y', 'yk', 'k', 'r'][Math.abs(idx) % 7];
      return 'g';
    }
    // the photograph is cut down to one black ink: where it thins out it breaks into stipple; the mid-tones take the flat colour, the lights are bare paper
    // which screen a figure is printed through: stipple (default), round halftone dots, or a line screen
    function screenOf(fig, idx) {
      if (fig.dataset.screen) return fig.dataset.screen;
      if (fig.closest('.stk,#wall,.fp,.np,.np2') || fig.classList.contains('wi')) return 's';
      if (fig.classList.contains('print') || fig.classList.contains('aw-ph')) return ['s', 'd', 's', 'l', 'd', 's', 'd'][Math.abs(idx) % 7];
      return 's';
    }
    // A print is inked at the size it is shown (one and a half times over, so the grain stays fine), never larger:
    // every photograph pulled at 820px weighed a quarter of a gigabyte once decoded, four times what the page shows.
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    function widthFor(f, im) {
      var cap = f.tone === 'g' ? 1100 : 820, ar = im.naturalWidth / Math.max(1, im.naturalHeight), shown = Math.max(f.fw || 0, (f.fh || 0) * ar);
      if (!shown) return Math.min(cap, 400);
      return Math.min(cap, Math.max(240, Math.ceil(shown * DPR * 1.5 / 80) * 80));
    }
    // cosine by table: the halftone screens ask for four of them per pixel
    var COS = new Float32Array(1024); for (var ci = 0; ci < 1024; ci++) COS[ci] = Math.cos(ci / 1024 * 6.283185307);
    function cs(u) { return COS[((u % 1) * 1024 + 1024) & 1023]; }
    function ink(img, tone, scr, wmax) {
      var T = TONE[tone] || TONE.k, w = Math.min(wmax, img.naturalWidth), h = Math.max(1, Math.round(w * img.naturalHeight / img.naturalWidth));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
      var im = x.getImageData(0, 0, w, h), d = im.data, n = w * h, L = new Uint8Array(n), hist = new Uint32Array(256), i, v, o, nz;
      for (i = 0; i < n; i++) { v = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8; L[i] = v; hist[v]++; }
      function pct(q) { var a = 0; for (var k = 0; k < 256; k++) { a += hist[k]; if (a >= n * q) return k; } return 255; }
      var t1 = pct(.41) * .62 + 104 * .38, t2 = pct(.75) * .62 + 176 * .38, s = (w * 40503 + h * 97 + tone.charCodeAt(0)) >>> 0, pa = T[0], sp = T[1], a1 = tone === 'g' ? 30 : 62, a2 = 34;
      // a halftone screen: the darker the photograph, the fatter the dot (or the line); the second ink has its own angle
      var cell = Math.max(4.2, w / 118), lo = pct(.03), hi = Math.max(lo + 40, pct(.97)), px, py, k1, k2;
      var ca = Math.cos(.785) / cell, sa = Math.sin(.785) / cell, cb = Math.cos(.26) / (cell * 1.12), sb = Math.sin(.26) / (cell * 1.12);
      for (i = 0; i < n; i++) {
        s = (s * 1664525 + 1013904223) >>> 0; nz = (s >>> 24) / 255 - .5; v = L[i]; o = i * 4;
        if (scr === 'd' || scr === 'l') {
          px = i % w; py = (i - px) / w; var lv = (v - lo) / (hi - lo) + nz * .06;
          k1 = scr === 'd' ? .5 + (cs(px * ca + py * sa) + cs(py * ca - px * sa)) / 4 : .5 + cs(py * ca - px * sa) / 2;
          k2 = sp ? .5 + (cs(px * cb + py * sb) + cs(py * cb - px * sb)) / 4 : 0;
          if (lv < k1 * .92 - .04) { d[o] = d[o + 1] = d[o + 2] = 9; d[o + 3] = 255; }
          else if (sp && lv < .34 + k2 * .62) { d[o] = sp[0]; d[o + 1] = sp[1]; d[o + 2] = sp[2]; d[o + 3] = 255; }
          else if (pa) { d[o] = pa[0]; d[o + 1] = pa[1]; d[o + 2] = pa[2]; d[o + 3] = 255; }
          else d[o + 3] = 0;
          continue;
        }
        if (v + nz * a1 < t1) { d[o] = d[o + 1] = d[o + 2] = 9; d[o + 3] = 255; }
        else if (sp && v + nz * a2 < t2) { d[o] = sp[0]; d[o + 1] = sp[1]; d[o + 2] = sp[2]; d[o + 3] = 255; }
        else if (pa) { d[o] = pa[0]; d[o + 1] = pa[1]; d[o + 2] = pa[2]; d[o + 3] = 255; }
        else d[o + 3] = 0;
      }
      x.putImageData(im, 0, 0); return c;
    }
    // one print at a time, and only in an idle moment once the first screens are served: a scroll in progress is never cut by a print being pulled
    var jobs = [], busy = false, served = 0;
    var later = function (fn) { if (served > 14 && window.requestIdleCallback) requestIdleCallback(fn, { timeout: 150 }); else setTimeout(fn, 0); };
    function work() {
      if (busy || !jobs.length) return; busy = true;
      var j = jobs.shift(), end = function (u) { busy = false; served++; j.cb(u); later(work); };
      try { ink(j.img, j.tone, j.scr, j.w).toBlob(function (b) { end(b ? URL.createObjectURL(b) : null); }, 'image/png'); } catch (e) { end(null); }
    }
    function loadKey(K) {
      active++;
      var im = new Image(), done = function () { active--; pump(); };
      if (K.cors) im.crossOrigin = 'anonymous';
      im.onload = function () {
        var urls = {};
        K.figs.forEach(function (f) {
          var fin = function (u) {
            f.img.onload = f.img.onerror = function () { f.img.onload = f.img.onerror = null; if (f.first) LOAD.done++; };
            f.img.src = u || K.src; if (u) f.fig.classList.add('inked', 'ink-' + f.tone); if (f.col) f.col.src = K.src;
          };
          if (!K.cors || f.tone === 'none') return fin(null);
          var wd = widthFor(f, im), key = f.tone + f.scr + wd;
          if (urls[key] === undefined) { urls[key] = []; (function (t, sc, k, wq) { jobs.push({ img: im, tone: t, scr: sc, w: wq, cb: function (u) { var w = urls[k]; urls[k] = u || ''; w.forEach(function (g) { g(u); }); } }); })(f.tone, f.scr, key, wd); }
          if (typeof urls[key] === 'string') fin(urls[key] || null); else urls[key].push(fin);
        });
        work(); done();
      };
      im.onerror = function () {
        // the plain link still works, without the ink
        if (K.cors) { K.cors = false; K.src = photoSrc(K.p); active--; loadKey(K); return; }
        K.figs.forEach(function (f) { f.fig.classList.add('missing'); f.img.remove(); if (f.first) LOAD.done++; }); done();
      };
      im.src = K.src;
    }
    function pump() { while (active < 5 && qi < order.length) loadKey(order[qi++]); }
    $$('[data-photo]').forEach(function (fig, idx) {
      idx -= off;
      var key = fig.dataset.photo, p = P[key], inner = el('span', 'ph-i');
      fig.appendChild(inner);
      if (fig.dataset.cutout != null) fig.style.setProperty('--cut', scissors(rng(idx * 77 + 9)));
      else if (fig.classList.contains('print') && !fig.classList.contains('wi')) fig.style.setProperty('--cut', cutpx(rng(idx * 41 + 5), 8));
      if (fig.dataset.cap != null && fig.dataset.cap !== '') fig.appendChild(el('span', 'print-cap pencil', fig.dataset.cap));
      if (fig.dataset.tape != null) { var t = el('i', 'tape ' + (fig.dataset.tape || 't')); fig.appendChild(t); if (fig.dataset.tape === 'x') fig.appendChild(el('i', 'tape tr')); }
      if (fig.dataset.pin != null) fig.appendChild(el('i', 'pinhead'));
      if (!p) { fig.classList.add('missing'); return; }
      var img = new Image();
      img.alt = fig.closest('[aria-hidden="true"]') ? '' : (p.alt || '');
      img.loading = 'eager'; img.decoding = 'async';
      inner.appendChild(img);
      inner.appendChild(el('span', 'cred', p.by + ' · ' + p.lic));
      var col = null;
      if (fig.dataset.color != null) {
        var yy = (fig.dataset.color || '14 52').split(' ').map(Number), tb = tearBand(rng(idx * 19 + 3), yy[0], yy[1] || yy[0] + 36), rim = el('span', 'ph-cr'), cw = el('span', 'ph-c');
        col = new Image(); col.alt = ''; cw.appendChild(col);
        rim.style.setProperty('--tear2', tb[1]); cw.style.setProperty('--tear', tb[0]);
        inner.appendChild(rim); inner.appendChild(cw);
      }
      var first = nfig++ < 12; if (first) LOAD.total++;
      var K = keys[key]; if (!K) { K = keys[key] = { p: p, figs: [], src: '', cors: false }; order.push(K); }
      K.figs.push({ fig: fig, img: img, tone: toneOf(fig, idx), scr: screenOf(fig, idx), col: col, first: first });
      used[key] = p;
    });
    // one question to Commons gives every photograph an address a canvas may read; with no answer the plain links are used, un-inked
    var started = false, nm = function (f) { return String(f).replace(/_/g, ' '); };
    function start(map) {
      if (started) return; started = true;
      // the size each print is shown at, read in one go (layout sizes: entrances that scale or throw a print do not change them)
      order.forEach(function (K) { K.figs.forEach(function (f) { f.fw = f.fig.offsetWidth; f.fh = f.fig.offsetHeight; }); });
      order.forEach(function (K) { var u = map && K.p.file && map[nm(K.p.file)]; if (u) { K.cors = true; K.src = u; } else K.src = photoSrc(K.p); });
      pump();
    }
    var files = order.filter(function (K) { return K.p.file && !K.p.src; }).map(function (K) { return nm(K.p.file); }), cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('bel18.thumbs') || 'null'); } catch (e) {}
    if (/[?&]ink=0/.test(location.search) || !window.fetch || !files.length) start(null);
    else if (cached && files.every(function (f) { return cached[f]; })) start(cached);
    else {
      setTimeout(function () { start(null); }, 3200);
      // Commons answers fifty titles per question: the list is asked in batches
      var asks = [];
      for (var b0 = 0; b0 < files.length; b0 += 50) asks.push(fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url&iiurlwidth=960&titles=' + encodeURIComponent(files.slice(b0, b0 + 50).map(function (f) { return 'File:' + f; }).join('|'))).then(function (r) { return r.json(); }));
      Promise.all(asks)
        .then(function (js) {
          var m = {};
          js.forEach(function (j) {
            var pg = (j.query && j.query.pages) || {};
            Object.keys(pg).forEach(function (id) { var q = pg[id]; if (q.imageinfo && q.imageinfo[0]) m[nm(q.title.replace(/^File:/, ''))] = q.imageinfo[0].thumburl || q.imageinfo[0].url; });
          });
          try { sessionStorage.setItem('bel18.thumbs', JSON.stringify(m)); } catch (e) {}
          start(m);
        })
        .catch(function () { start(null); });
    }
    var ul = $('#credits');
    if (ul) Object.keys(used).forEach(function (k) {
      var p = used[k], li = el('li'), a = el('a', '', p.alt);
      a.href = photoPage(p); a.target = '_blank'; a.rel = 'noopener';
      li.appendChild(a); li.appendChild(document.createTextNode(' — ' + p.by + ', ' + p.lic)); ul.appendChild(li);
    });
  })();
}
