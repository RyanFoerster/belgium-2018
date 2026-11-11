import { $, $$, rng, seeded, el } from './core.js';

/* ── type: letters that arrive one by one, handwriting that is written, headlines cut from papers ── */
function split(node, mode, seed) {
  var r = rng(seed), i = 0;
  (function walk(n) {
    [].slice.call(n.childNodes).forEach(function (c) {
      if (c.nodeType === 3) {
        var frag = document.createDocumentFragment();
        c.nodeValue.split(/([ \n\t]+)/).forEach(function (tok) {
          if (!tok) return;
          if (/^[ \n\t]+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = el('span', 'wd');
          Array.from(tok).forEach(function (chr) {
            var s = el('span', 'ch', chr);
            s.style.setProperty('--i', i++);
            if (mode === 'sp') s.style.setProperty('--rz', ((r() - .5) * 38).toFixed(1) + 'deg');
            else s.style.setProperty('--j', Math.round(r() * 55) + 'ms');
            w.appendChild(s);
          });
          frag.appendChild(w);
        });
        n.replaceChild(frag, c);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
    });
  })(node);
  node.style.setProperty('--n', i);
}

// hand-written marks that are tied to no trigger: they are written once the loader has left
export var statics = [];
var LW = [];

export function setupType() {
  $$('[data-split]').forEach(function (n, k) { if (/^H\d$/.test(n.tagName)) n.setAttribute('aria-label', n.textContent.replace(/\s+/g, ' ').trim()); split(n, 'sp', k * 97 + 13); });
  seeded('.hand,.pencil').forEach(function (n, k) {
    // pencil captions are written letter by letter; script notes in one stroke (CSS), so their joins stay whole
    if (n.classList.contains('hand')) n.classList.add('hw');
    else { split(n, 'hw', k * 61 + 5); n.classList.add('hw', n.dataset.t ? 'hw-s' : 'hw-a'); }
    if (!n.dataset.t && !n.closest('[data-in],[data-at],[data-from],[data-s]')) statics.push(n);
  });
  $$('[data-cut]').forEach(function (n, k) {
    var dark = n.dataset.cut === 'k', r = rng(k * 53 + 17), txt = n.textContent.replace(/\s+/g, ' ').trim(), last = '';
    var V = dark ? ['v2', 'v3', 'v2', 'v6', 'v3', 'v5'] : ['v1', 'v2', 'v3', 'v1', 'v5', 'v2'];
    n.textContent = ''; n.appendChild(el('span', 'vh', txt));
    txt.split(' ').forEach(function (w, i) {
      var v = w.length <= 3 ? 'v4' : V[Math.floor(r() * V.length)];
      if (v === last && v !== 'v4') v = V[(V.indexOf(v) + 1) % V.length];
      last = v;
      var o = el('span', 'cw ' + v), inner = el('span', 'cw-i', w);
      o.setAttribute('aria-hidden', 'true');
      o.style.cssText = '--i:' + i + ';--rot:' + ((r() - .5) * 8).toFixed(1) + 'deg;--dy:' + Math.round((r() - .5) * 12) + 'px;--j:' + Math.round(r() * 70) + 'ms;--fs:' + (.86 + r() * .32).toFixed(2) + 'em';
      var q = function (a, b) { return (a + r() * b).toFixed(1) + '%'; };
      // cut with scissors, not a ruler: four corners, none of them square
      inner.style.clipPath = 'polygon(' + q(0, 4) + ' ' + q(0, 10) + ',' + q(96, 4) + ' ' + q(0, 10) + ',' + q(96, 4) + ' ' + q(90, 10) + ',' + q(0, 4) + ' ' + q(90, 10) + ')';
      o.appendChild(inner); n.appendChild(o);
    });
  });
  /* ── headlines: fitted to the full width, each line with its own way of arriving ── */
  $$('.ttl-l').forEach(function (n) {
    var t = n.textContent.replace(/\s+/g, ' ').trim(), tile = n.dataset.tile != null ? +n.dataset.tile : -1;
    n.setAttribute('aria-hidden', 'true'); n.textContent = '';
    if (!n.dataset.fx) n.dataset.fx = 'rise';
    Array.from(t).forEach(function (c, i) { var q = el('span', 'tc' + (i === tile ? ' tl' : ''), c); q.style.setProperty('--i', i); n.appendChild(q); });
  });
  /* ── running text arrives line by line: every word is its own small mask, and words on the same line share a delay ── */
  $$('main p').forEach(function (p) {
    if (!p.closest('[data-in],[data-at],[data-from],[data-s]') || p.closest('#wall,.tkt,.cutting,.fp,.np,.np2,[data-cut],[data-split],.hand,.pencil,.lab,.ttl') || p.querySelector('.hand,.pencil,[data-count],svg,img,figure,.il,.stamp')) return;
    var ws = [];
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.nodeValue.split(/([ \n\t]+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^[ \n\t]+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = el('span', 'lw'); o.appendChild(el('span', 'lw-i', tok)); frag.appendChild(o); ws.push(o);
          });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(p);
    if (ws.length) { p.classList.add('lns'); LW.push(ws); }
  });
}

function lineUp() {
  LW.forEach(function (ws) { var top = null, li = -1; ws.forEach(function (o) { var t = o.offsetTop; if (top === null || Math.abs(t - top) > 3) { li++; top = t; } o.style.setProperty('--li', li); }); });
}

function fitAll() {
  var H = window.innerHeight;
  $$('[data-fit]').forEach(function (n) {
    var box = n.closest('.ttl') || n.parentNode, W = box.clientWidth; if (!W) return;
    n.style.setProperty('--fz', '100px'); var w = n.offsetWidth; if (!w) return;
    n.style.setProperty('--fz', Math.min(100 * W / w, (+n.dataset.fit || 46) * H / 79).toFixed(1) + 'px');
  });
  $$('.ttl').forEach(function (t) { var l = $('.ttl-l', t); if (l) t.style.setProperty('--nz', (parseFloat(l.style.getPropertyValue('--fz')) * .36).toFixed(1) + 'px'); });
}

export { lineUp, fitAll };
