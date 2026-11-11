import { doc, RM, $, $$, clamp, el } from './core.js';
import { goTo, playTo, stopPlay, playing } from './glide.js';

/* The page can be read by scrolling, and it can be used:
   – a chapter index drops over everything (button top right, key M, keys 1–8 go straight to a chapter)
   – a rail of chapters runs down the right edge
   – the ticket stubs at the bottom take you back to their match
   – each replay has a list of steps to click and a button that plays the move for you
   – stickers and drawings jump when poked, a player sticker comes forward when picked.
   Everything is built from what the page already says about itself ([data-chapter], [data-collect], [data-step]). */

var ABOUT = { '01': 'One generation, one dream', '02': 'Twenty-three players', '03': 'Group G · three matches, nine points', '04': 'Japan · two down, 3—2', '05': 'Brazil · the quarter-final, 2—1', '06': 'France · the semi-final, 0—1', '07': 'England · third place, 2—0', '08': 'Everything that was in the box' };
var MORE = [['#squad', 'The twenty-three'], ['#chadli', 'Chadli, 90+4′'], ['#kdb', 'De Bruyne, 31′'], ['#awards', 'The awards'], ['#wall', 'The wall']];

export function setupNav(engine, replays) {
  var nav = $('#nav'), btn = $('#navBtn'), list = $('#navList'), more = $('#navMore'), rail = $('#rail');
  var vh = function () { return window.innerHeight; };

  /* ── where things are ── */
  // the top of anything in the page, as if no section were being slid over another
  function topOf(n) {
    var sec = n.closest('main > section') || n, was = sec.style.translate; sec.style.translate = 'none';
    var y = n.getBoundingClientRect().top + window.scrollY; sec.style.translate = was; return y;
  }
  function yOf(n) {
    var s = engine.sceneOf(n); if (s) return s.top + 2;
    // a panel of a horizontal track: the scroll position that brings it to the left edge
    for (var i = 0; i < engine.tracks.length; i++) {
      var t = engine.tracks[i], ts = engine.sceneOf(t.el);
      for (var k = 0; ts && k < t.panels.length; k++) if (t.panels[k].el === n) return ts.top + clamp(.02 + (t.max ? t.panels[k].left / t.max : 0) * .95, 0, .985) * ts.len + 2;
    }
    return topOf(n) + 2;
  }
  // near: glide there. Far: a sheet drops, the page is moved behind it, the sheet lifts.
  var busy = false;
  function send(y) {
    if (RM) { goTo(y, true); return; }
    if (Math.abs(y - window.scrollY) < vh() * 2.2) { goTo(y, 1.15); return; }
    if (busy) return; busy = true;
    nav.classList.add('wipe');
    setTimeout(function () { goTo(y, true); }, 480);
    setTimeout(function () { nav.classList.remove('wipe'); busy = false; }, 640);
  }

  /* ── the chapter index and the rail ── */
  var chs = [];
  $$('main [data-chapter]').forEach(function (n) { var c = n.dataset.chapter.split('|'); if (!chs.some(function (x) { return x.no === c[0]; })) chs.push({ no: c[0], name: c[1], el: n }); });
  var open = false;
  function setOpen(v) {
    if (!nav || v === open) return; open = v;
    nav.classList.toggle('open', v); doc.classList.toggle('nav-on', v);
    if (v) nav.removeAttribute('inert'); else nav.setAttribute('inert', '');
    btn.setAttribute('aria-expanded', v ? 'true' : 'false'); $('span', btn).textContent = v ? 'Close' : 'Chapters';
    if (v) stopPlay();
  }
  function go(n) {
    var y = yOf(n);
    // from the index the sheet is already down: move behind it, then lift it
    if (open) { goTo(y, true); setTimeout(function () { setOpen(false); }, 60); } else send(y);
  }
  if (nav && btn) {
    chs.forEach(function (c, i) {
      var li = el('li'), a = el('a'); a.href = '#'; li.style.setProperty('--i', i); li.dataset.no = c.no;
      a.appendChild(el('b', 'd', c.no)); a.appendChild(el('span', 'd', c.name.replace(/ — .*$/, ''))); a.appendChild(el('i', 'mono', ABOUT[c.no] || ''));
      a.addEventListener('click', function (e) { e.preventDefault(); go(c.el); });
      li.appendChild(a); list.appendChild(li);
      if (rail) {
        var rl = el('li'), rb = el('button'); rb.type = 'button'; rl.dataset.no = c.no; rb.setAttribute('aria-label', 'Chapter ' + c.no + ' — ' + c.name);
        rb.appendChild(el('span', '', c.name.replace(/ — .*$/, ''))); rb.appendChild(el('i', '', c.no));
        rb.addEventListener('click', function () { go(c.el); }); rl.appendChild(rb); rail.appendChild(rl);
      }
    });
    MORE.forEach(function (m) {
      var t = $(m[0]); if (!t) return;
      var b = el('button', 'chip', m[1]); b.type = 'button'; b.addEventListener('click', function () { go(t); }); more.appendChild(b);
    });
    btn.addEventListener('click', function () { setOpen(!open); });
    $$('[data-nav-open]').forEach(function (b) { b.addEventListener('click', function () { setOpen(true); }); });
    // the chapter the running head shows is the one marked in the index and on the rail
    var no = $('#hudNo'), mark = function () {
      var cur = no.textContent, seen = true;
      $$('li', list).concat(rail ? $$('li', rail) : []).forEach(function (li) { li.classList.toggle('here', li.dataset.no === cur); });
      if (rail) $$('li', rail).forEach(function (li) { if (li.dataset.no === cur) seen = false; li.classList.toggle('past', seen); });
    };
    if (no && window.MutationObserver) { new MutationObserver(mark).observe(no, { childList: true, characterData: true, subtree: true }); mark(); }
    window.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '')) return;
      if (e.key === 'Escape') setOpen(false);
      else if (e.key === 'm' || e.key === 'M') setOpen(!open);
      else if (/^[1-9]$/.test(e.key) && chs[+e.key - 1]) go(chs[+e.key - 1].el);
    });
  }
  $$('[data-jump="next"]').forEach(function (b) {
    b.addEventListener('click', function () { var sec = b.closest('main > section'), nx = sec && sec.nextElementSibling; while (nx && nx.tagName !== 'SECTION') nx = nx.nextElementSibling; if (nx) goTo(yOf(nx) + vh() * .04, 1.5); });
  });

  /* ── ticket stubs: back to the match ── */
  $$('#col [data-c]').forEach(function (c) {
    var t = $('main [data-collect="' + c.dataset.c + '"]'); if (!t) return;
    c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-label', 'Go to match ' + c.dataset.c);
    var f = function () { send(yOf(t)); };
    c.addEventListener('click', f); c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
  });

  /* ── replays: steps to click, and a button that plays the move ── */
  (replays || []).forEach(function (rp) {
    var s = engine.sceneOf(rp.scene), pin = $('.pin', rp.scene), cfg = rp.cfg; if (!s || !pin) return;
    var at = function (p) { return s.top + p * s.len; }, N = cfg.steps.length, endP = cfg.fx.ty3[1] + .012;
    rp.steps.forEach(function (li, i) {
      li.setAttribute('role', 'button'); li.setAttribute('tabindex', '0');
      var f = function () { goTo(at(cfg.steps[i][0] + (cfg.steps[i][1] - cfg.steps[i][0]) * .12), .9); };
      li.addEventListener('click', f); li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
    });
    var ctl = el('div', 'rp-ctl'), pb = el('button', 'btn btn-y rp-play'), count = el('span', 'mono rp-count'), prog = el('i', 'rp-prog'), fill = el('b');
    pb.type = 'button'; prog.appendChild(fill); ctl.appendChild(pb); ctl.appendChild(count); ctl.appendChild(prog); pin.appendChild(ctl);
    var label = function () { pb.textContent = playing() ? '❚❚ Pause' : (s.p >= endP - .02 ? '↺ Replay' : '▶ Play the move'); };
    pb.addEventListener('click', function (e) {
      e.stopPropagation();
      if (playing()) { stopPlay(); return; }
      var from = s.p >= endP - .02 || s.p < cfg.steps[0][0] ? cfg.steps[0][0] : s.p;
      if (from !== s.p) goTo(at(from), true);
      // a little under four seconds of reading per screen of scroll
      setTimeout(function () { playTo(at(endP), (endP - from) * s.len / vh() * 3.6, label); label(); }, 40);
    });
    pb.addEventListener('mousedown', function (e) { e.stopPropagation(); });
    // the line of the move is a handle: drag it (or click it) to go to any moment, forwards or backwards
    var a0 = cfg.steps[0][0], a1 = cfg.steps[N - 1][1], drag = false;
    var seek = function (x) { var r = prog.getBoundingClientRect(); stopPlay(); goTo(at(a0 + clamp((x - r.left) / Math.max(1, r.width)) * (a1 - a0)), true); };
    prog.setAttribute('role', 'slider'); prog.setAttribute('tabindex', '0'); prog.setAttribute('aria-label', 'Moment of the move'); prog.dataset.cur = 'drag';
    prog.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); drag = true; try { prog.setPointerCapture(e.pointerId); } catch (err) {} seek(e.clientX); });
    prog.addEventListener('pointermove', function (e) { if (drag) seek(e.clientX); });
    var undrag = function () { drag = false; }; prog.addEventListener('pointerup', undrag); prog.addEventListener('pointercancel', undrag);
    // and the keyboard, while the board is on screen: ← → one step back or on, the space bar plays and pauses
    var stepTo = function (d) {
      var k = 0; for (var i = 0; i < N; i++) if (s.p >= cfg.steps[i][0] - .002) k = i;
      k = Math.max(0, Math.min(N - 1, k + d)); stopPlay(); goTo(at(cfg.steps[k][0] + (cfg.steps[k][1] - cfg.steps[k][0]) * .12), .7);
    };
    window.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || !(s.p > 0 && s.p < 1) || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test((e.target && e.target.tagName) || '')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); stepTo(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stepTo(-1); }
      else if (e.key === ' ') { e.preventDefault(); pb.click(); }
    });
    var last = -2;
    s.fns.push(function (p) {
      var k = -1; for (var i = 0; i < N; i++) if (p >= cfg.steps[i][0]) k = i;
      fill.style.transform = 'scaleX(' + clamp((p - cfg.steps[0][0]) / (cfg.steps[N - 1][1] - cfg.steps[0][0])).toFixed(3) + ')';
      var st = k * 2 + (p >= endP - .02 ? 1 : 0);
      if (st !== last) { last = st; count.textContent = ('0' + Math.max(1, k + 1)).slice(-2) + ' / ' + ('0' + N).slice(-2); label(); }
    });
    label();
  });

  /* ── the awards: one card per label ── */
  $$('.aw-dots li[data-s]').forEach(function (li) {
    var sc = li.closest('[data-states]'), s = sc && engine.sceneOf(sc); if (!s || !s.states) return;
    var k = +li.dataset.s.split(' ')[0];
    li.setAttribute('role', 'button'); li.setAttribute('tabindex', '0');
    li.addEventListener('click', function () { var a = s.states[k], b = s.states[k + 1] == null ? 1 : s.states[k + 1]; goTo(s.top + (a + (b - a) * .3) * s.len, .9); });
  });

  /* ── things that answer when touched ── */
  var main = $('main');
  if (main) main.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    // a player of the squad comes forward; a second click, or a click elsewhere, puts him back
    var pl = t.closest('.sq-i'), was = $('.sq-i.pick');
    if (was && was !== pl) was.classList.remove('pick');
    if (pl) { pl.classList.toggle('pick'); return; }
    // a sticker or a drawing jumps under the finger. The jump is played on top of whatever the thing is doing and leaves
    // its own animations alone: swapping its `animation` for the jump and back made its arrival play again afterwards.
    var it = t.closest('.il,.dd');
    if (it && !RM && it.animate && it.dataset.peel == null) {
      // where it rests is read once, while nothing is moving it; a new jump starts from wherever the last one had got to,
      // so clicking again and again never snaps
      var cs = getComputedStyle(it), spin = it.classList.contains('spin');
      if (!it._rest || !it._jump || it._jump.playState !== 'running') it._rest = [parseFloat(cs.scale) || 1, parseFloat(cs.rotate) || 0];
      var s0 = it._rest[0], r0 = it._rest[1], sc = parseFloat(cs.scale) || 1, rc = parseFloat(cs.rotate) || 0;
      if (it._jump) it._jump.cancel();
      var kf = [
        { scale: sc, easing: 'cubic-bezier(.2,.7,.3,1)' },
        { scale: s0 * 1.11, offset: .28, easing: 'cubic-bezier(.45,0,.3,1)' },
        { scale: s0 * .975, offset: .62, easing: 'cubic-bezier(.4,0,.4,1)' },
        { scale: s0 }
      ];
      if (!spin) [rc, r0 + 6, r0 - 2.5, r0].forEach(function (v, i) { kf[i].rotate = v + 'deg'; });
      it._jump = it.animate(kf, { duration: 880 });
    }
  });
}
