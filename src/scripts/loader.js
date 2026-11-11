import { doc, RM, $, $$, clamp } from './core.js';
import { LOAD } from './photos.js';

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
  });
}

// statics: marks written once the loader has left · onReady: called at the moment the page is released
export function runLoader(statics, onReady) {
  // anything not tied to a trigger starts once the loader has left
  var booted = false;
  function boot() { if (booted) return; booted = true; doc.classList.add('booted'); statics.forEach(function (n) { n.classList.add('on'); }); }
  /* ── the loader is the box being emptied: one more thing lands on the table each time a little more of the page has arrived ── */
  var ld = $('#ld'), gone = false;
  function ready(now) {
    if (gone) return; gone = true;
    doc.classList.add('ready'); if (onReady) onReady();
    if (ld) { ld.classList.add('out'); setTimeout(function () { if (ld.parentNode) ld.parentNode.removeChild(ld); }, now ? 0 : 1550); }
    setTimeout(boot, now ? 0 : 560);
  }
  if (!ld || RM || !doc.classList.contains('ld-on') || /[?&]ld=0/.test(location.search)) ready(true);
  else (function () {
    // the count follows what is really arriving (fonts, the first photographs), never faster than two and a half seconds, never longer than six
    var t0 = Date.now(), shown = 0, out = $('#ldN'), pass = $('#ldPass'), fonts = !(document.fonts && document.fonts.ready);
    if (!fonts) document.fonts.ready.then(function () { fonts = true; });
    var pcs = $$('.ld-pc', ld).map(function (n) { return { n: n, at: +n.dataset.at, on: false }; }), landed = -1;
    function show(v) {
      out.textContent = ('00' + Math.round(v)).slice(-3);
      var c = 0;
      for (var i = 0; i < pcs.length; i++) { var q = pcs[i], on = v >= q.at; if (on) c++; if (on !== q.on) { q.on = on; q.n.classList.toggle('on', on); } }
      if (c !== landed) { landed = c; pass.textContent = c + ' / ' + pcs.length + ' — everything that was in the box'; }
    }
    function done() { ld.classList.add('done'); }
    // ?ld=hold keeps the loader on screen (to look at it); ?ld=hold50 stops it half-way
    var hold = /[?&]ld=hold(\d*)/.exec(location.search);
    if (hold) { show(hold[1] === '' ? 87 : +hold[1]); if (+hold[1] >= 100) done(); return; }
    show(0);
    (function tick() {
      var ms = Date.now() - t0, goal = (LOAD.done + (fonts ? 2 : 0)) / (LOAD.total + 2);
      if (ms > 6000) goal = 1;
      goal = Math.min(goal, ms / 2500) * 100;
      shown = Math.min(goal, shown + Math.max(1, (goal - shown) * .3));
      show(shown);
      if (shown >= 100) { done(); setTimeout(ready, 700); } else setTimeout(tick, 50);
    })();
  })();
}
