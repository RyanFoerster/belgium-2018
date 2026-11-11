import { doc, RM, $, $$, el, clamp } from './core.js';
import { ticketBackHTML } from '../lib/ticket';
import { SQUAD } from '../data/squad';

/* The archive can be handled. Nothing here is needed to read the story — the scroll still tells it — but the things on
   the page answer the hand, each in its own way, and every one works with a mouse, a finger and the keyboard:
     a ticket        turns over: the full-time score and who scored are on its back
     a sticker       marked data-peel="big|small" is peeled back, and something is printed under it
     a print         is picked up and held close; a click, Escape or the scroll puts it back
     a player        of the twenty-three opens his card (position, club, his figures in Russia)
     the wall        can be entered: twice as large, dragged around
   What each thing does is written in the ring behind the pointer (data-cur → scripts/cursor.js); on a touch screen the
   peelable stickers carry a small tab instead. Styles: styles/interact.css. */

function button(n, label, fn) {
  n.setAttribute('role', 'button'); n.setAttribute('tabindex', '0'); if (label) n.setAttribute('aria-label', label);
  n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } });
}

export function setupInteract(engine) {
  var main = $('main'); if (!main) return;

  // clicking fast on a thing never starts a text selection around it
  main.addEventListener('mousedown', function (e) { if (e.detail > 1 && e.target.closest && e.target.closest('.il,.dd,.tkt,.stk,.sq-i,.print,.wi')) e.preventDefault(); });

  /* ── tickets turn over ── */
  $$('.tkt', main).forEach(function (t) {
    if (t.classList.contains('wi') || !t.dataset.tkt) return;
    var back = el('div', 'tkt-back'); back.innerHTML = ticketBackHTML(t.dataset.tkt); back.setAttribute('aria-hidden', 'true'); t.appendChild(back);
    t.classList.add('flippable'); t.dataset.cur = 'flip';
    var busy = false, turn = function () {
      if (busy) return; busy = true;
      // edge-on, the faces are swapped, and it comes back flat
      t.classList.add('turning');
      setTimeout(function () {
        var b = t.classList.toggle('back'); back.setAttribute('aria-hidden', b ? 'false' : 'true'); t.dataset.cur = b ? 'back' : 'flip';
        t.classList.remove('turning'); busy = false;
      }, RM ? 0 : 230);
    };
    t.addEventListener('click', turn);
    button(t, 'Match ' + t.dataset.tkt + ' ticket — turn it over for the score', turn);
  });

  /* ── stickers that come off ── */
  $$('.il[data-peel]', main).forEach(function (s) {
    var d = s.dataset.peel.split('|'), u = el('span', 'peel-u');
    u.appendChild(el('b', 'd', d[0])); if (d[1]) u.appendChild(el('small', 'mono', d[1]));
    s.insertBefore(u, s.firstChild); s.appendChild(el('i', 'peel-tab mono', 'peel'));
    s.dataset.cur = 'peel';
    var f = function () { var on = s.classList.toggle('peeled'); s.dataset.cur = on ? 'stick' : 'peel'; };
    s.addEventListener('click', f);
    button(s, 'Sticker — peel it back', f);
  });

  /* ── prints are picked up ── */
  var held = null, layer = null, y0 = 0;
  function drop() {
    if (!held) return;
    var h = held; held = null;
    h.clone.style.transform = 'none'; h.clone.style.setProperty('rotate', h.rot, 'important'); h.clone.classList.remove('up');
    layer.classList.remove('on');
    setTimeout(function () { h.src.style.visibility = ''; if (h.clone.parentNode) h.clone.parentNode.removeChild(h.clone); }, RM ? 0 : 430);
  }
  function lift(p) {
    if (held) { drop(); return; }
    if (!layer) {
      layer = el('div', 'lift'); layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer);
      layer.addEventListener('click', drop);
    }
    var r = p.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var rot = getComputedStyle(p).rotate; if (!rot || rot === 'none') rot = '0deg';
    var c = p.cloneNode(true), st = c.style, vw = window.innerWidth, vh = window.innerHeight;
    c.removeAttribute('id'); c.classList.add('held');
    [['position', 'fixed'], ['left', (cx - w / 2) + 'px'], ['top', (cy - h / 2) + 'px'], ['right', 'auto'], ['bottom', 'auto'], ['width', w + 'px'], ['height', h + 'px'],
      ['margin', '0'], ['translate', 'none'], ['scale', 'none'], ['rotate', rot], ['visibility', 'visible']].forEach(function (q) { st.setProperty(q[0], q[1], 'important'); });
    layer.appendChild(c); c.getBoundingClientRect();
    var s = Math.min(vw * .86 / w, vh * .76 / h, 2.6);
    st.transform = 'translate(' + (vw / 2 - cx).toFixed(1) + 'px,' + (vh * .49 - cy).toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
    st.setProperty('rotate', (parseFloat(rot) > 0 ? 1.5 : -1.5) + 'deg', 'important'); c.classList.add('up');
    p.style.visibility = 'hidden'; layer.classList.add('on');
    held = { src: p, clone: c, rot: rot }; y0 = window.scrollY;
  }
  main.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var p = t.closest('.print');
    if (!p || p.closest('.sq-i,.tkt,.fp-w,.aw-deck') || main.classList.contains('dragged')) return;
    lift(p);
  });
  $$('.print', main).forEach(function (p) { if (!p.closest('.sq-i,.tkt,.fp-w,.aw-deck')) p.dataset.cur = 'look'; });
  window.addEventListener('scroll', function () { if (held && Math.abs(window.scrollY - y0) > 70) drop(); }, { passive: true });

  /* ── the twenty-three: a card for the one who is picked ── */
  (function () {
    var sc = $('.s-sq'), pin = sc && $('.pin', sc); if (!pin) return;
    var card = el('div', 'sq-card'); card.setAttribute('role', 'dialog'); card.setAttribute('aria-live', 'polite'); pin.appendChild(card);
    var shown = null;
    function fill(pl, li) {
      var facts = (pl.facts || []).map(function (f) { return '<div><b class="d">' + f[0] + '</b><span class="mono">' + f[1] + '</span></div>'; }).join('');
      card.innerHTML = '<b class="d sqc-no">' + pl.no + '</b><span class="d sqc-nm">' + pl.name + (pl.captain ? ' (C)' : '') + '</span>' +
        '<span class="mono sqc-pos">' + pl.pos + ' · ' + pl.club + '</span>' +
        (facts ? '<div class="sqc-f">' + facts + '</div>' : '<span class="mono sqc-one">One of the twenty-three</span>') +
        (pl.note ? '<span class="hand c-r sqc-note">' + pl.note + '</span>' : '') +
        '<button type="button" class="chip sqc-x">Back to the 23 ✕</button>';
      // the card stands on the side of the wall the sticker is not on
      var r = li.getBoundingClientRect(); card.classList.toggle('lft', r.left + r.width / 2 > window.innerWidth / 2);
    }
    function sync() {
      var li = $('.sq-i.pick', sc), no = li ? +li.dataset.no : 0, pl = no && SQUAD.filter(function (p) { return p.no === no; })[0];
      if (pl === shown || (!pl && !shown)) return;
      shown = pl || null; sc.classList.toggle('has-pick', !!pl);
      if (pl) { fill(pl, li); card.classList.remove('on'); void card.offsetWidth; card.classList.add('on'); } else card.classList.remove('on');
    }
    // scripts/nav.js picks and un-picks on click; the card follows whatever is picked
    main.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.sqc-x')) { var w = $('.sq-i.pick', sc); if (w) w.classList.remove('pick'); }
      setTimeout(sync, 0);
    });
    $$('.sq-i[data-no]', sc).forEach(function (li) {
      li.dataset.cur = 'open';
      button(li, 'Player ' + li.dataset.no + ' — open his card', function () { li.click(); });
    });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var w = $('.sq-i.pick', sc); if (w) { w.classList.remove('pick'); sync(); } drop(); } });
    window.addEventListener('scroll', function () { if (shown && !sc.classList.contains('vis')) { var w = $('.sq-i.pick', sc); if (w) w.classList.remove('pick'); sync(); } }, { passive: true });
  })();

  /* ── the wall can be entered: twice as large, and dragged ── */
  (function () {
    var sc = $('.s-wall'), wall = $('#wall'), btn = $('#wallX'); if (!sc || !wall || !btn) return;
    var on = false, x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, drag = false, moved = 0, Z = 1.9;
    function put() { wall.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px'; }
    function set(v) {
      on = v; sc.classList.toggle('explore', on); btn.textContent = on ? 'Back to the story ✕' : 'Explore the wall';
      if (!on) { x = y = 0; wall.style.translate = ''; }
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!on); });
    wall.addEventListener('pointerdown', function (e) {
      if (!on || (e.pointerType === 'mouse' && e.button)) return;
      drag = true; moved = 0; sx = e.clientX; sy = e.clientY; px = x; py = y; wall.classList.add('grab');
      try { wall.setPointerCapture(e.pointerId); } catch (err) {}
    });
    wall.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - sx, dy = e.clientY - sy, mx = wall.offsetWidth * (Z - 1) / 2, my = wall.offsetHeight * (Z - 1) / 2;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      x = clamp(px + dx, -mx, mx); y = clamp(py + dy, -my, my); put();
    });
    var end = function () {
      if (!drag) return; drag = false; wall.classList.remove('grab');
      // a drag is not a click: the print under the finger is not picked up
      if (moved > 8) { main.classList.add('dragged'); setTimeout(function () { main.classList.remove('dragged'); }, 60); }
    };
    wall.addEventListener('pointerup', end); wall.addEventListener('pointercancel', end);
    window.addEventListener('keydown', function (e) {
      if (!on) return;
      if (e.key === 'Escape') { set(false); return; }
      var k = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }[e.key]; if (!k) return;
      e.preventDefault(); var mx = wall.offsetWidth * (Z - 1) / 2, my = wall.offsetHeight * (Z - 1) / 2;
      x = clamp(x + k[0], -mx, mx); y = clamp(y + k[1], -my, my); put();
    });
    // leaving the wall closes it
    window.addEventListener('scroll', function () { if (on && !sc.classList.contains('vis')) set(false); }, { passive: true });
  })();

  if (RM) doc.classList.add('ix-rm');
}
