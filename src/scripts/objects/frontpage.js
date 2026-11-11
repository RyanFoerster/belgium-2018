import { $ } from '../core.js';

export function cloneFrontPage() {
  // 01 · the front page is written once and seen through three windows (the folded quarter + two flaps)
  (function () {
    var page = $('#fpPage'); if (!page) return;
    ['.fp-tr', '.fp-bot'].forEach(function (s) { var w = $(s), c = page.cloneNode(true); c.removeAttribute('id'); if (w) w.appendChild(c); });
  })();
}
