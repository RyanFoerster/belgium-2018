/* Paste in the console of the dev page opened with ?ld=0&glide=0 (or run through the browser tool).
   For every section, at a few moments of its scroll, it lists the pieces of small text that another object covers:
   which text, how much of it, and what is on top. Geometry only — it works in a tab that is not being drawn. */
window.auditOverlaps = async function (opts) {
  opts = opts || {};
  var raf = window.requestAnimationFrame; window.requestAnimationFrame = function (f) { return setTimeout(function () { f(performance.now()); }, 0); };
  var st = document.createElement('style');
  st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}*{pointer-events:auto!important}.cur,.hud,.rail,.hud-menu,.col,#col,.bar,.nav,.sq-card{display:none!important}';
  document.head.appendChild(st);
  document.querySelectorAll('main [data-in]').forEach(function (n) { n.classList.add('in'); });
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var paints = function (n) {
    if (!n || n === document.body || n === document.documentElement) return false;
    var t = n.tagName.toLowerCase();
    if (/^(img|canvas|path|circle|rect|text|polygon|ellipse|line|polyline|use|tspan)$/.test(t)) return true;
    var cs = getComputedStyle(n);
    if (cs.backgroundImage !== 'none' && !n.matches('section,.pin,.panel,main,.scene,.blk')) return true;
    var bg = cs.backgroundColor; if (bg && bg !== 'transparent' && !/rgba\(.*, 0\)$/.test(bg) && !n.matches('section,.pin,.panel,main,.scene,.blk')) return true;
    for (var c = n.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim()) return true;
    return false;
  };
  var name = function (n) { var o = n.closest('.il,.dd,.tkt,.stk,.print,.stamp,.hand,.scrawl,.cutn,.slip,.cutting,.mk,.lbl,.disc,.ph,.ttl,.d,.sh,.shout,.m-cut,.sheet,.pitch,[class]') || n; return (o.getAttribute('class') || o.tagName).split(/\s+/).slice(0, 3).join('.') + (o.dataset && o.dataset.a ? '[' + o.dataset.a + ']' : ''); };
  var out = [], all = {}, secs = [].slice.call(document.querySelectorAll('main > section'));
  if (opts.only) secs = secs.filter(function (s) { return s.matches(opts.only); });
  for (var si = 0; si < secs.length; si++) {
    var s = secs[si]; s.style.translate = 'none';
    var top = s.getBoundingClientRect().top + scrollY, len = Math.max(0, s.offsetHeight - innerHeight), scene = s.dataset.scene != null;
    var ps = opts.ps || (scene ? [.2, .4, .6, .8, .97] : [0, .33, .66, 1]);
    for (var pi = 0; pi < ps.length; pi++) {
      for (var k = 0; k < 3; k++) { scrollTo(0, Math.round(top + ps[pi] * len) + k); window.dispatchEvent(new Event('scroll')); await wait(70); }
      var vw = innerWidth, vh = innerHeight, seen = {};
      var texts = [].slice.call(s.querySelectorAll('p,li,.mono,.d,h3,h4,.tkt,.stk-nm,.print-cap,.hand,.scrawl,.m-cut,dd,dt,.cutting'));
      texts.forEach(function (t) {
        if (!t.textContent.trim() || t.closest('#wall,.il,.dd,[aria-hidden="true"] .wi')) return;
        var cs = getComputedStyle(t); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < .2) return;
        var fs = parseFloat(cs.fontSize), r = t.getBoundingClientRect();
        if (r.width < 8 || r.height < 6 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
        if (fs > (opts.maxFont || 64) && !t.matches('.tkt')) return;       // the giant words are meant to be crossed
        // a parent text block is skipped when a child text block will be measured
        if (t.querySelector('p,li,.mono,.d,h3,h4') && !t.matches('.tkt,p,li')) return;
        var hit = 0, tot = 0, by = {};
        for (var ix = 1; ix <= 5; ix++) for (var iy = 1; iy <= 3; iy++) {
          var x = r.left + r.width * ix / 6, y = r.top + r.height * iy / 4; if (x < 0 || y < 0 || x > vw || y > vh) continue;
          tot++;
          // a point where the text itself cannot be reached is a point where it is clipped away, not covered
          var stack = document.elementsFromPoint(x, y), topEl = null, own = false;
          for (var q0 = 0; q0 < stack.length; q0++) if (stack[q0] === t || t.contains(stack[q0])) { own = true; break; }
          if (!own) { tot--; continue; }
          for (var q = 0; q < stack.length; q++) { var e = stack[q]; if (e === t || t.contains(e)) { topEl = null; break; } if (e.contains(t)) continue; if (paints(e)) { topEl = e; break; } }
          if (topEl) { hit++; var nm = name(topEl); by[nm] = (by[nm] || 0) + 1; }
        }
        if (tot >= 4 && hit / tot >= (opts.min || .25)) {
          var key = s.className.split(' ')[1] + '|' + (t.getAttribute('class') || t.tagName) + '|' + t.textContent.trim().slice(0, 24);
          if (all[key]) return; all[key] = 1;
          out.push(s.className.split(' ')[1] + ' p=' + ps[pi] + ' — "' + t.textContent.trim().replace(/\s+/g, ' ').slice(0, 30) + '" (' + (t.getAttribute('class') || t.tagName).split(' ').slice(0, 2).join('.') + ', ' + Math.round(fs) + 'px) ' + Math.round(hit / tot * 100) + '% under ' + Object.keys(by).sort(function (a, b) { return by[b] - by[a]; }).slice(0, 2).join(' + '));
        }
      });
    }
  }
  st.remove(); window.requestAnimationFrame = raf;
  return out;
};
