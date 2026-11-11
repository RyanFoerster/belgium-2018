import { RM, $$, clamp, E, rng } from './core.js';

export function dealArrivals() {
  /* ── arrivals: anything that has not been given its own entrance is dealt one, so no two neighbours come in alike ── */
  $$('[data-in],[data-at],[data-from]').forEach(function (n, k) {
    var c = n.getAttribute('class') || '';
    if (/(^|\s)(fx-\S+|stamp|hand|pencil|scr|sp|pr|il|stk|ttl-l|ttl-s|sheet-w|scrawl|rough|alb-miss)(\s|$)/.test(c) || n.hasAttribute('data-cut') || n.hasAttribute('data-split') || n.closest('#wall')) return;
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
  } else {
    $$('[data-in]').forEach(function (n) { n.classList.add('in'); $$('[data-count]', n).forEach(count); });
  }

  /* ── crayon marks only "boil" while their section is on screen ── */
  (function () {
    if (RM || !('IntersectionObserver' in window)) return;
    var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('vis', e.isIntersecting); }); }, { rootMargin: '10% 0px' });
    $$('main > section, .band').forEach(function (n) { vio.observe(n); });
  })();
}

export { count };
