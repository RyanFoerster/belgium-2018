import { doc, RM, $, $$ } from './core.js';
import { LOAD } from './photos.js';
import { drawBoard, GOALS } from './objects/board94.js';

// the poster's headline (the first screen) is fitted to its sheet, and the block behind its fourth letter is put where that letter really is
export function fitLoader() {
  $$('.ld-art').forEach(function (art) {
    var h = $('.ld-h', art), g = $('.ld-g', art); if (!h || !g || !art.offsetWidth) return;
    h.style.fontSize = '100px'; var w = h.offsetWidth; if (!w) return;
    var port = art.offsetHeight > art.offsetWidth;
    h.style.fontSize = Math.min(100 * art.offsetWidth * (port ? .98 : .95) / w, art.offsetHeight * (port ? .34 : .56)).toFixed(1) + 'px';
    var a = art.getBoundingClientRect(), b = g.getBoundingClientRect();
    $$('.ld-tile', art).forEach(function (t) {
      t.style.left = ((b.left - a.left) / a.width * 100).toFixed(2) + '%'; t.style.top = ((b.top - a.top) / a.height * 100).toFixed(2) + '%';
      t.style.width = (b.width / a.width * 100).toFixed(2) + '%'; t.style.height = (b.height / a.height * 100).toFixed(2) + '%';
    });
    // the red star sits on the top right corner of the last letter (the M)
    var m = h.lastElementChild, mr = m && m.getBoundingClientRect();
    if (mr) $$('.ld-s1', art).forEach(function (s) {
      var sw = parseFloat(getComputedStyle(s).width) || 0; // its own width, whatever it is doing at the moment
      s.style.left = ((mr.right - a.left - sw * .66) / a.width * 100).toFixed(2) + '%'; s.style.top = ((mr.top - a.top - sw * .62) / a.height * 100).toFixed(2) + '%';
    });
  });
}

// statics: marks written once the loader has left · onReady: called at the moment the page is released
export function runLoader(statics, onReady) {
  // anything not tied to a trigger starts once the loader has left
  var booted = false;
  function boot() { if (booted) return; booted = true; doc.classList.add('booted'); statics.forEach(function (n) { n.classList.add('on'); }); }
  /* ── the loader: one of Belgium's goals played by the loading of the page, the wall filling around it (components/chrome/Loader.astro) ── */
  var ld = $('#ld'), gone = false;
  // the page is released: scrolling, the menu, and the first screen comes in piece by piece (hero-go)
  function ready() {
    if (gone) return; gone = true;
    doc.classList.add('ready', 'hero-go'); if (onReady) onReady();
    setTimeout(boot, 500);
  }
  if (!ld || RM || !doc.classList.contains('ld-on') || /[?&]ld=0/.test(location.search)) { if (ld && ld.parentNode) ld.parentNode.removeChild(ld); ready(); return; }

  var t0 = Date.now(), shown = 0, out = $('#ldN'), fonts = !(document.fonts && document.fonts.ready);
  if (!fonts) document.fonts.ready.then(function () { fonts = true; });
  var port = window.innerWidth < 820 && window.innerHeight > window.innerWidth;
  // one of Belgium's goals, a different one each visit if possible (?goal=kdb asks for one)
  var gq = /[?&]goal=(\w+)/.exec(location.search), last = null;
  try { last = sessionStorage.getItem('bel18.goal'); } catch (e) {}
  var pool = GOALS.filter(function (g) { return g.key !== last; }), G = (gq && GOALS.filter(function (g) { return g.key === gq[1]; })[0]) || pool[Math.floor(Math.random() * pool.length)];
  try { sessionStorage.setItem('bel18.goal', G.key); } catch (e) {}
  var T = G.T, board = drawBoard($('#lbSvg'), port ? 'v' : 'h', G), wall = $('#ldWall'), note = $('#ldNote');
  $('#ldS1').textContent = G.min; $('#ldKo').textContent = G.score; note.textContent = G.note; $('#ldWhere').textContent = G.where; $('.tb94-cap', ld).textContent = G.cap;
  // the pieces of the wall, each with the touch of the ball that throws it (data-b, 0–7). A print waits for its photograph
  var pcs = $$('.wi', wall).map(function (n) { return { n: n, b: +n.dataset.b, f: n.matches('.ph') ? n : $('.ph', n), im: null, on: false }; });
  var TOUCH = [.11, .26, .45, .65, .78, .9, .96, 1].map(function (f) { return f * T; });
  function arrived(q) { if (!q.f) return true; var im = q.im || (q.im = $('img', q.f)); return !!(im && im.complete && im.naturalWidth); }
  function throwUpTo(b, all) {
    var bp = null;
    pcs.forEach(function (q) {
      if (q.on || q.b > b || (!all && !arrived(q))) return;
      q.on = true;
      // the piece comes out of the ball: it starts where the ball is on the screen, small, and lands in its place
      if (!bp) bp = board.ballPoint() || [-1, -1];
      if (bp[0] >= 0) {
        var r = q.n.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        q.n.style.setProperty('--bx', Math.round(bp[0] - cx) + 'px'); q.n.style.setProperty('--by', Math.round(bp[1] - cy) + 'px');
      }
      q.n.classList.add('on');
    });
  }
  var thrown = -1, polls = 0;
  function touches(t) { var b = -1; for (var i = 0; i < TOUCH.length; i++) if (t >= TOUCH[i]) b = i; return b; }

  // ?ld=hold keeps the loader on screen (to look at it): ?ld=hold47 stops the move at 47 %, ?ld=hold100 shows the score
  var hold = /[?&]ld=hold(\d*)/.exec(location.search);
  // the lines are drawn and the players stamped on from here (their starting state has to be computed first)
  ld.getBoundingClientRect(); ld.classList.add('go');
  if (hold) {
    var hv = hold[1] === '' ? 60 : Math.min(100, +hold[1]), ht = hv / 100 * T;
    for (var ti = 0; ti < ht; ti += .5) board.render(ti);
    board.render(ht); out.textContent = hv;
    setInterval(function () { throwUpTo(touches(ht), true); }, 200);
    $('#ldS1').classList.add('on'); if (hv >= 50) note.classList.add('on');
    if (hv >= 100) { ld.classList.add('done'); $('#ldKo').classList.add('on'); }
    return;
  }

  // the move: t follows the count (0 → T), never faster than the whole move in 1.6 s, and only once the pitch is drawn
  var t = 0, target = 0, lastF = 0, scored = false;
  // a frame when the browser gives one — and without waiting for it for ever if the tab is not being drawn
  function next(fn) { var did = false, go = function (now) { if (did) return; did = true; fn(now || performance.now()); }; requestAnimationFrame(go); setTimeout(go, 120); }
  function frame(now) {
    var dt = lastF ? Math.min(.05, (now - lastF) / 1000) : .016; lastF = now;
    if (target > t) t = Math.min(target, t + Math.max(dt * T / 10, (target - t) * dt * 7), t + dt * T / 1.6);
    board.render(t);
    var b = touches(t);
    // a touch throws its pieces; a print whose photograph was late goes up as soon as it is there
    if (b > thrown) { thrown = b; throwUpTo(b, false); } else if (b >= 0 && ++polls % 8 === 0) throwUpTo(b, false);
    if (t >= T / 2) note.classList.add('on');
    if (t >= T && !scored) { scored = true; goal(); return; }
    next(frame);
  }
  setTimeout(function () { $('#ldS1').classList.add('on'); }, 350);
  (function tick() {
    var ms = Date.now() - t0, goal = (LOAD.done + (fonts ? 2 : 0)) / (LOAD.total + 2);
    if (ms > 6500) goal = 1;
    goal = Math.min(goal, Math.max(0, ms - 600) / 1800) * 100;
    shown = Math.min(goal, shown + Math.max(.8, (goal - shown) * .3));
    out.textContent = Math.round(shown);
    target = shown / 100 * T;
    if (shown < 100) setTimeout(tick, 50);
  })();
  setTimeout(function () { next(frame); }, 600);

  // in the net: every piece left goes up and the red slab slams across
  function goal() {
    throwUpTo(7, true);
    ld.classList.add('done'); $('#ldKo').classList.add('on');
    setTimeout(flood, 430);
  }
  // the score takes the whole screen: two flat sheets the size of the slab (red, a yellow one under it) grow from it until
  // they cover everything, at the slab's own tilt…
  function flood() {
    var k = $('#ldKo'), w = k.offsetWidth, h = k.offsetHeight, vw = window.innerWidth, vh = window.innerHeight, D = Math.sqrt(vw * vw + vh * vh) * 1.12;
    ld.style.setProperty('--fw', w + 'px'); ld.style.setProperty('--fh', h + 'px');
    ld.style.setProperty('--gsx', (D / w).toFixed(3)); ld.style.setProperty('--gsy', (D / h).toFixed(3));
    ld.style.setProperty('--gl', Math.round(D / 2 + vh / 2 + 60) + 'px');
    ld.getBoundingClientRect(); ld.classList.add('flood');
    setTimeout(function () { ld.classList.add('cover'); setTimeout(lift, 70); }, 380);
  }
  // …then they are lifted off in one move, the yellow a step behind the red, and the first screen comes in under them
  function lift() {
    ld.classList.add('lift');
    setTimeout(ready, 170);
    setTimeout(function () { if (ld.parentNode) ld.parentNode.removeChild(ld); }, 950);
  }
}
