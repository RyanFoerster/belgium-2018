import { $, $$, rng, seeded, el } from './core.js';

/* ── type: letters that arrive one by one, handwriting that is written, headlines fitted to the page ── */
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
  /* ── headlines: fitted to the full width, each line with its own way of arriving ── */
  $$('.ttl-l').forEach(function (n) {
    var t = n.textContent.replace(/\s+/g, ' ').trim(), tile = n.dataset.tile != null ? +n.dataset.tile : -1;
    n.setAttribute('aria-hidden', 'true'); n.textContent = '';
    if (!n.dataset.fx) n.dataset.fx = 'rise';
    Array.from(t).forEach(function (c, i) { var q = el('span', 'tc' + (i === tile ? ' tl' : ''), c); q.style.setProperty('--i', i); n.appendChild(q); });
  });
  /* ── running text arrives line by line: every word is its own small mask, and words on the same line share a delay ── */
  $$('main p').forEach(function (p) {
    if (!p.closest('[data-in],[data-at],[data-from],[data-s]') || p.classList.contains('m-cut') || p.closest('#wall,.tkt,.cutting,.fp,.np,.np2,.m-cut,[data-split],.hand,.pencil,.lab,.ttl,.aw-what') || p.querySelector('.hand,.pencil,[data-count],svg,img,figure,.il,.stamp')) return;
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
