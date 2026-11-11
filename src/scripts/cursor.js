import { RM, FINE, el } from './core.js';

export function setupCursor() {
  /* ── the pointer drags a ring behind it ── */
  if (!RM && FINE) (function () {
    var c = el('i', 'cur'); c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c);
    var x = 0, y = 0, cx = 0, cy = 0, raf = 0, seen = false;
    function step() {
      cx += (x - cx) * .17; cy += (y - cy) * .17; c.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      raf = Math.abs(x - cx) + Math.abs(y - cy) > .3 ? requestAnimationFrame(step) : 0;
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; cx = x; cy = y; c.classList.add('live'); }
      var hit = e.target && e.target.closest ? e.target.closest('a,button,[role="button"],.tkt,.stk,.sq-i,.il,.dd,.print,[data-cur]') : null;
      c.classList.toggle('big', !!hit);
      // …and what the thing under it does, when it does something: flip, peel, look, open
      var w = hit ? (hit.closest('[data-cur]') || hit).dataset.cur || '' : '';
      if (c.dataset.w !== w) c.dataset.w = w;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  })();
}
