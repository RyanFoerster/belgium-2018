import { doc, RM, $, $$, clamp, seg, E, el } from './core.js';
import { count } from './arrivals.js';

/* Three motion languages on purpose:
   – scrubbed  : [data-t="a b"] gets --t (0→1) as scene progress crosses a→b (data-ease may overshoot or step)
   – triggered : [data-at] / [data-from] / [data-in] get .on / .in once, and the CSS plays the entrance
   – states    : [data-states] scenes flip data-state at thresholds, the CSS snaps
   Built once the page's own objects exist (wall, tickets, stickers), so they are scenes' children like any other markup. */
/* What a frame costs is mostly what it makes the browser recompute, so the engine writes as little as it can, as low in the tree as it can:
   --p, --mx, --my, --lean and --vel are registered as non-inherited (styles/base.css) and written on the very elements whose rules read them
   — never on a whole section, whose hundreds of descendants would all be restyled for a number most of them ignore. */
var P_USERS = '.px,.trk-rail,.wall,.sq-wall';                               // rules that read var(--p)
var PTR_USERS = '.il,.clg,.clg > *,.wall,.wall .wi,.sq-wall,.sq-i';          // rules that read var(--mx) / var(--my)

export function createEngine() {
  /* ── scenes ── */
  // a scene is anything with its own 0→1 progress: a pinned section, or one panel of a horizontal track
  function mkScene(n, skipPanels) {
    var mine = function (m) { return !skipPanels || !m.closest('.panel'); };
    return {
      el: n, p: -1, top: 0, len: 1, left: 0, w: 1,
      pu: $$(P_USERS, n).filter(mine),
      poster: n.dataset.poster != null ? +n.dataset.poster : 1,
      items: $$('[data-t],[data-o]', n).filter(mine).map(function (m) {
        var t = m.dataset.t ? m.dataset.t.trim().split(/\s+/).map(Number) : null, o = m.dataset.o ? m.dataset.o.trim().split(/\s+/).map(Number) : null;
        return { n: m, t: t, o: o, e: E[m.dataset.ease], lt: -1, lo: -1 };
      }),
      ats: $$('[data-at]', n).filter(mine).map(function (m) { return { n: m, at: +m.dataset.at, on: false }; }),
      froms: $$('[data-from]', n).map(function (m) { return { n: m, a: +m.dataset.from, b: m.dataset.to != null ? +m.dataset.to : 99 }; }),
      states: n.dataset.states ? n.dataset.states.trim().split(/\s+/).map(Number) : null,
      caps: $$('[data-s]', n), counts: $$('[data-count-at]', n).filter(mine), state: -1, fns: []
    };
  }
  var scenes = $$('[data-scene]').map(function (n) { return mkScene(n, n.dataset.track != null); });
  // horizontal tracks: vertical scroll drives the strip sideways; each panel gets its own progress as it crosses the screen
  var tracks = $$('[data-track]').map(function (n) {
    var tr = $('.track', n);
    return { el: n, tr: tr, max: 0, vw: 1, panels: $$('.panel', tr).map(function (pn) { return mkScene(pn); }) };
  });
  var stubs = $$('[data-collect]').map(function (n, k) {
    var c = $('#col [data-c="' + n.dataset.collect + '"]'), panel = null;
    tracks.forEach(function (t) { t.panels.forEach(function (ps) { if (ps.el === n) panel = ps; }); });
    if (c) c.style.setProperty('--rot', ((k * 37 % 9) - 4) + 'deg');
    // a pinned scene may say how far it has to be played before its stub is handed over
    var own = null; scenes.forEach(function (sc) { if (sc.el === n) own = sc; });
    return { n: n, c: c, panel: panel, scene: n.dataset.collectAt != null ? own : null, at: +n.dataset.collectAt || 0, top: 0, got: false };
  });
  function apply(s, p) {
    if (p === s.p) return; s.p = p;
    var i, it, pv = p.toFixed(4);
    s.el.style.setProperty('--p', pv);
    for (i = 0; i < s.pu.length; i++) s.pu[i].style.setProperty('--p', pv);
    for (i = 0; i < s.items.length; i++) {
      it = s.items[i];
      if (it.t) { var t = seg(p, it.t[0], it.t[1]); if (it.e) t = it.e(t); if (t !== it.lt) { it.lt = t; it.n.style.setProperty('--t', t.toFixed(4)); } }
      if (it.o) { var o = seg(p, it.o[0], it.o[1]); if (o !== it.lo) { it.lo = o; it.n.style.setProperty('--o', o.toFixed(4)); } }
    }
    for (i = 0; i < s.ats.length; i++) { it = s.ats[i]; var on = p >= it.at; if (on !== it.on) { it.on = on; it.n.classList.toggle('on', on); } }
    if (s.states) {
      var st = 0; for (var k = 0; k < s.states.length; k++) if (p >= s.states[k]) st = k;
      if (st !== s.state) {
        s.state = st; s.el.dataset.state = st;
        s.caps.forEach(function (c) { c.classList.toggle('on', c.dataset.s.split(' ').indexOf(String(st)) > -1); });
        s.froms.forEach(function (f) { f.n.classList.toggle('on', st >= f.a && st <= f.b); });
        s.el.dispatchEvent(new CustomEvent('state', { detail: st }));
      }
    }
    s.counts.forEach(function (c) { if (p >= +c.dataset.countAt) count(c); });
    for (var f = 0; f < s.fns.length; f++) s.fns[f](p);
  }

  // every section climbs over the end of the one before it, and the one before it holds back: while it is being covered it
  // leaves at a fraction of the scroll (parallax), so the new sheet really slides over a page that is still there.
  // Between two chapters (a <Join>) the climb is longer and the strips cross the seam. No shadow, no dimming: a clean edge.
  var LAG = .6;
  var covers = RM ? [] : $$('main > section').slice(1).map(function (nx) {
    var pe = nx.previousElementSibling, xf = pe && pe.classList.contains('xf') ? pe : null, pv = xf ? xf.previousElementSibling : pe;
    if (!pv || pv.tagName !== 'SECTION') return null;
    nx.classList.add('cov'); if (!xf) nx.classList.add('cov-s');
    // what holds back: the pinned screen of a scene, or a whole flowing section when it is not too tall to be moved as one layer
    var pin = pv.dataset.scene != null ? $('.pin', pv) : null;
    return { xf: xf, nx: nx, pv: pv, pin: pin, lag: pin, rel: .66, top: 0, o: 0, last: -1, lastL: -1, act: false };
  }).filter(Boolean), tilts = [];
  var chapters = [], parallax = [], vh = window.innerHeight, docH = 1;
  function measure() {
    vh = window.innerHeight; var y = window.scrollY;
    covers.forEach(function (c) { c.nx.style.translate = 'none'; if (c.xf) c.xf.style.translate = 'none'; });
    scenes.forEach(function (s) { var r = s.el.getBoundingClientRect(); s.top = r.top + y; s.len = Math.max(1, r.height - vh); });
    chapters = $$('[data-chapter]').map(function (n) { var c = n.dataset.chapter.split('|'); return { top: n.getBoundingClientRect().top + y, no: c[0], name: c[1] }; });
    parallax = RM ? [] : $$('[data-par],[data-parx]').map(function (n) {
      n.style.translate = 'none'; var r = n.getBoundingClientRect(), x = n.dataset.parx != null;
      return { el: n, mid: r.top + y + r.height / 2, k: +(x ? n.dataset.parx : n.dataset.par) * (n.classList.contains('xf-s') ? Math.min(1, window.innerWidth / window.innerHeight) : 1), h: r.height, x: x };
    });
    tracks.forEach(function (t) {
      t.vw = window.innerWidth;
      t.panels.forEach(function (ps) { ps.left = ps.el.offsetLeft; ps.w = ps.el.offsetWidth; ps.p = -1; ps.vis = null; });
      var last = t.panels[t.panels.length - 1];
      t.max = last ? Math.max(0, last.left + last.w - t.vw) : 0;
    });
    stubs.forEach(function (s) { s.top = s.n.getBoundingClientRect().top + y; });
    docH = Math.max(1, doc.scrollHeight - vh);
    covers.forEach(function (c) {
      c.top = c.nx.getBoundingClientRect().top + y; c.o = Math.max(0, -parseFloat(getComputedStyle(c.nx).marginTop) || 0); c.last = c.lastL = -1;
      // the sheet underneath is let go by the scroll when the next one has this much of the screen left to climb
      c.rel = Math.max(.3, 1 - c.o / vh);
      if (!c.pin) { var ph = c.pv.offsetHeight; c.lag = ph > vh * 1.2 && ph < vh * 2.6 ? c.pv : null; }
    });
    tilts = RM ? [] : $$('.clg').filter(function (n) { return !n.closest('[data-scene]'); }).map(function (n) { var r = n.getBoundingClientRect(); return { el: n, kids: [].slice.call(n.children), mid: r.top + y + r.height / 2, last: 9 }; });
  }
  // big type leans into the scroll, then stands back up
  var sway = [], vel = 0, lastY = window.scrollY;
  if (!RM && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._vis = e.isIntersecting; }); });
    sway = $$('.sway'); sway.forEach(function (n) { sio.observe(n); });
  }
  var hudNo = $('#hudNo'), hudName = $('#hudName'), bar = $('#bar'), curCh = '', chapSt = $('#chapSt'), chapTx = chapSt && $('text.a', chapSt);
  // stickers lean a few pixels towards the pointer, each by its own amount — only in the sections on screen
  if (!RM && window.matchMedia('(pointer:fine)').matches) {
    var mraf = 0, mx = 0, my = 0, lmx = 9, lmy = 9;
    var ptr = $$('main > section').map(function (s) { return { s: s, ns: $$(PTR_USERS, s), x: 9, y: 9 }; }).filter(function (q) { return q.ns.length; });
    window.addEventListener('pointermove', function (e) {
      mx = Math.round((e.clientX / window.innerWidth * 2 - 1) * 50) / 50; my = Math.round((e.clientY / window.innerHeight * 2 - 1) * 50) / 50;
      if (mx === lmx && my === lmy) return; lmx = mx; lmy = my;
      if (!mraf) mraf = requestAnimationFrame(function () {
        mraf = 0;
        for (var a = 0; a < ptr.length; a++) {
          var q = ptr[a]; if ((q.x === mx && q.y === my) || !q.s.classList.contains('vis')) continue;
          q.x = mx; q.y = my;
          for (var b = 0; b < q.ns.length; b++) { q.ns[b].style.setProperty('--mx', mx); q.ns[b].style.setProperty('--my', my); }
        }
      });
    }, { passive: true });
  }
  function frame() {
    var y = window.scrollY, i;
    if (!RM) scenes.forEach(function (s) {
      if (y < s.top - vh * 1.5 && s.p === 0) return;
      if (y > s.top + s.len + vh * 1.5 && s.p === 1) return;
      apply(s, clamp((y - s.top) / s.len));
    });
    for (i = 0; i < parallax.length; i++) {
      var q = parallax[i], d = q.mid - (y + vh / 2);
      if (Math.abs(d) < vh + q.h) q.el.style.translate = q.x ? (d * q.k).toFixed(1) + 'px 0' : '0 ' + (d * -q.k).toFixed(1) + 'px';
    }
    for (i = 0; i < covers.length; i++) {
      var cv = covers[i], sn = (cv.top - y) / vh, ce = clamp(sn / .66), co = Math.round(ce * cv.o);
      var lg = cv.lag && sn > -.02 && sn < cv.rel ? Math.round((cv.rel - sn) * vh * LAG) : 0;
      // while one sheet climbs over the other, both are moved as layers instead of being repainted at every frame; the layers are given back afterwards
      var act = sn > -.15 && sn < 1.25;
      if (act !== cv.act) { cv.act = act; cv.nx.style.willChange = act ? 'transform' : ''; if (cv.lag) cv.lag.style.willChange = act ? 'transform' : ''; }
      if (co !== cv.last) { cv.last = co; cv.nx.style.translate = co ? '0 ' + co + 'px' : 'none'; if (cv.xf) cv.xf.style.translate = '0 ' + (co - cv.o) + 'px'; }
      if (lg !== cv.lastL) { cv.lastL = lg; if (cv.lag) cv.lag.style.transform = lg ? 'translateY(' + lg + 'px)' : ''; }
    }
    for (i = 0; i < tilts.length; i++) {
      var tl = tilts[i], td = (tl.mid - (y + vh / 2)) / vh;
      if (td > -1.6 && td < 1.6) { td = clamp(td, -1, 1); if (Math.abs(td - tl.last) > .004) { tl.last = td; var lv = td.toFixed(3); tl.el.style.setProperty('--lean', lv); for (var tk = 0; tk < tl.kids.length; tk++) tl.kids[tk].style.setProperty('--lean', lv); } }
    }
    for (i = 0; i < stubs.length; i++) {
      var sb = stubs[i], got = sb.panel ? sb.panel.p >= .44 : sb.scene ? sb.scene.p >= sb.at : y + vh * .55 >= sb.top;
      if (got !== sb.got && sb.c) { sb.got = got; sb.c.classList.toggle('got', got); }
    }
    if (sway.length) {
      vel += (clamp((y - lastY) / 60, -1, 1) - vel) * .22; lastY = y;
      if (Math.abs(vel) < .004) vel = 0;
      for (i = 0; i < sway.length; i++) if (sway[i]._vis) sway[i].style.setProperty('--vel', vel.toFixed(3));
      if (vel !== 0) onScroll();
    }
    var ch = chapters[0];
    for (var c = 0; c < chapters.length; c++) if (y + vh * .5 >= chapters[c].top) ch = chapters[c];
    if (ch && ch.no !== curCh) {
      var first = !curCh, hc = hudNo.parentNode;
      curCh = ch.no; hudNo.textContent = ch.no; hudName.textContent = ch.name;
      if (!RM && !first) { hc.classList.remove('sw'); void hc.offsetWidth; hc.classList.add('sw'); }
      if (chapTx) { chapTx.textContent = ch.no; if (!RM) { chapSt.classList.remove('pop'); void chapSt.offsetWidth; chapSt.classList.add('pop'); } }
    }
    bar.style.transform = 'scaleX(' + clamp(y / docH).toFixed(4) + ')';
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }

  /* ── chapter-specific choreography ── */
  function sceneOf(n) { for (var i = 0; i < scenes.length; i++) if (scenes[i].el === n) return scenes[i]; }
  function on(sel, fn) { var n = $(sel), s = n && sceneOf(n); if (s) s.fns.push(fn); return s; }

  return { scenes: scenes, tracks: tracks, apply: apply, measure: measure, frame: frame, onScroll: onScroll, sceneOf: sceneOf, on: on, vh: function () { return vh; } };
}
