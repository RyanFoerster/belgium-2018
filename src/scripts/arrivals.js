import { RM, $$, clamp, E, rng } from './core.js';

/* ── objects written into the page without a trigger of their own get one: they arrive the first time they are seen ── */
export function autoEntrances() {
  var OBJ = '.il,.dd,.mk,.print,.tkt,.stk,.slip,.cutting,.lbl,.disc,.mega,.scrawl,.hand,.pencil,.stamp,.m-goals,.flag,svg.scr';
  var HAS = '[data-in],[data-at],[data-t],[data-o],[data-from],[data-s]';
  var SKIP = '#ld,#wall,.fp,.np,.np2,.i-ils,.boot-fx,.pitch,.rp-final,.rp-flood,.rp-stage,.aw-deck,.alb-side,.sheet,.hud,.tkt *,.print *,.stk *,.slip *,.cutting *,.lbl *';
  $$('main ' + OBJ.split(',').join(',main ')).forEach(function (n) {
    if (n.closest(HAS) || n.closest(SKIP)) return;
    n.setAttribute('data-in', '');
  });
}

export function dealArrivals() {
  /* ── arrivals: anything that has not been given its own entrance is dealt one, so no two neighbours come in alike ── */
  $$('[data-in],[data-at],[data-from]').forEach(function (n, k) {
    var c = n.getAttribute('class') || '';
    if (/(^|\s)(fx-\S+|stamp|hand|pencil|scr|sp|pr|il|dd|mk|stk|ttl-l|ttl-s|sheet-w|scrawl|rough|alb-miss)(\s|$)/.test(c) || n.hasAttribute('data-split') || n.closest('#wall')) return;
    var r = rng(k * 211 + 3), obj = /(^|\s)(print|tkt|flag|cutn|disc)(\s|$)/.test(c), L = obj ? ['fx-slap', 'fx-drop', 'fx-slide', 'fx-paste', 'fx-flip'] : ['fx-paste', 'fx-cut', 'fx-flip', 'fx-unroll', 'fx-paste'];
    n.classList.add(L[Math.floor(r() * L.length)]);
    var dir = r() < .5 ? -1 : 1;
    if (!n.style.getPropertyValue('--fx')) n.style.setProperty('--fx', dir * (36 + Math.round(r() * 40)) + 'vw');
    if (!n.style.getPropertyValue('--spin')) n.style.setProperty('--spin', Math.round((r() - .5) * 50) + 'deg');
    n.style.setProperty('--pdx', dir * Math.round(8 + r() * 22) + 'px'); n.style.setProperty('--pdr', (dir * (4 + r() * 8)).toFixed(1) + 'deg');
  });
}

/* ── counters ── */
function count(n) {
  if (n._done) return; n._done = true;
  var to = +n.dataset.count;
  if (RM || !to) { n.textContent = to; return; }
  var t0 = performance.now(), dur = 420 + Math.min(to, 16) * 55;
  (function tick(now) {
    var u = clamp((now - t0) / dur); n.textContent = Math.round(E.o(u) * to);
    if (u < 1) requestAnimationFrame(tick);
  })(t0);
}

export function watchReveals() {
  /* ── one-shot reveals ── */
  if ('IntersectionObserver' in window && !RM) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); io.unobserve(e.target);
        $$('[data-count]', e.target).forEach(count);
        if (e.target.dataset.count) count(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .06 });
    $$('[data-in]').forEach(function (n) { io.observe(n); });
    // labels and match captions have no trigger of their own: they are unrolled the first time they are seen
    $$('.lab,.m-meta').forEach(function (n) { if (!n.matches('[data-in],[data-at],[data-t],[data-o],[data-from],[data-s]') && !n.closest('#ld')) { n.classList.add('lb'); io.observe(n); } });
  } else {
    $$('[data-in]').forEach(function (n) { n.classList.add('in'); $$('[data-count]', n).forEach(count); });
  }

  /* ── what is on screen carries .vis: crayon marks only "boil" there, endless animations only run there, moving pieces only keep a layer there ── */
  (function () {
    if (RM || !('IntersectionObserver' in window)) return;
    var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('vis', e.isIntersecting); }); }, { rootMargin: '10% 0px' });
    $$('main > section, .band, .xf').forEach(function (n) { vio.observe(n); });
  })();
}

export { count };
