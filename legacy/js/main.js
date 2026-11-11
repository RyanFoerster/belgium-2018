/* Scroll engine + scrapbook choreography.
   Three motion languages on purpose:
   – scrubbed  : [data-t="a b"] gets --t (0→1) as scene progress crosses a→b (slow, physical; data-ease may overshoot or step)
   – triggered : [data-at] / [data-from] / [data-in] get .on / .in once, CSS plays a thrown / dropped / peeled entrance
   – states    : [data-states] scenes flip data-state at thresholds, CSS snaps (fast, abrupt) */
(function () {
  'use strict';
  var doc = document.documentElement;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]rm=1/.test(location.search);
  if (RM) doc.classList.add('rm');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a)); };
  var E = {
    io: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    o: function (t) { return 1 - Math.pow(1 - t, 3); },
    i: function (t) { return t * t * t; },
    // overshoots, then settles — things that land
    back: function (t) { var c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    // stop-motion: the same move on 8 or 12 drawings
    s8: function (t) { return Math.round(E.o(t) * 8) / 8; },
    s12: function (t) { return Math.round(t * 12) / 12; }
  };
  // small deterministic generator: every "random" cut, tear and tilt is the same on each visit
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  // nodes inside the loader are listed last, so the seeded cuts and tilts of the page are the same with or without it
  function seeded(sel) { var a = $$(sel), l = a.filter(function (n) { return n.closest('#ld'); }); return a.filter(function (n) { return !n.closest('#ld'); }).concat(l); }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* ── surfaces: film grain, paper fibre, dust — small tiles drawn once ── */
  (function () {
    function tile(n, fn) { var c = document.createElement('canvas'); c.width = c.height = n; fn(c.getContext('2d'), n); return 'url(' + c.toDataURL() + ')'; }
    try {
      doc.style.setProperty('--grain', tile(220, function (x, n) {
        var im = x.createImageData(n, n), d = im.data;
        for (var i = 0; i < d.length; i += 4) { var v = Math.random() < .5 ? 0 : 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.random() * 38; }
        x.putImageData(im, 0, 0);
      }));
      // newsprint: specks, short fibres, a few toner blotches
      doc.style.setProperty('--tx-paper', tile(420, function (x, n) {
        var r = rng(11), i;
        for (i = 0; i < 5200; i++) { x.fillStyle = 'rgba(8,8,8,' + (.03 + r() * .12).toFixed(3) + ')'; x.fillRect(r() * n, r() * n, 1 + (r() < .08 ? 1 : 0), 1); }
        x.lineCap = 'round';
        for (i = 0; i < 150; i++) {
          var a = r() * n, b = r() * n, l = 5 + r() * 16, g = r() * 6.3;
          x.strokeStyle = 'rgba(8,8,8,' + (.05 + r() * .09).toFixed(3) + ')'; x.lineWidth = .6;
          x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + Math.cos(g) * l * .5 + (r() - .5) * 6, b + Math.sin(g) * l * .5 + (r() - .5) * 6, a + Math.cos(g) * l, b + Math.sin(g) * l); x.stroke();
        }
        for (i = 0; i < 9; i++) { x.fillStyle = 'rgba(8,8,8,' + (.008 + r() * .014).toFixed(3) + ')'; x.beginPath(); x.ellipse(r() * n, r() * n, 6 + r() * 26, 3 + r() * 9, r() * 3, 0, 6.3); x.fill(); }
      }));
      // dust + scratches for the black pages
      doc.style.setProperty('--tx-dust', tile(420, function (x, n) {
        var r = rng(29), i;
        for (i = 0; i < 900; i++) { x.fillStyle = 'rgba(245,243,238,' + (.05 + r() * .22).toFixed(3) + ')'; x.fillRect(r() * n, r() * n, 1, 1); }
        for (i = 0; i < 14; i++) { x.strokeStyle = 'rgba(245,243,238,' + (.05 + r() * .1).toFixed(3) + ')'; x.lineWidth = .5; var a = r() * n, b = r() * n; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (r() - .5) * 26, b + 30 + r() * 110); x.stroke(); }
        for (i = 0; i < 40; i++) { x.fillStyle = 'rgba(245,243,238,' + (.08 + r() * .2).toFixed(3) + ')'; x.beginPath(); x.arc(r() * n, r() * n, .6 + r() * 1.4, 0, 6.3); x.fill(); }
      }));
      // uneven ink for rubber stamps: mostly there, eaten away in patches (tileable value noise, thresholded)
      doc.style.setProperty('--ink-mask', tile(240, function (x, n) {
        var r = rng(47), im = x.createImageData(n, n), d = im.data, g = [], G = 12, i, j;
        for (i = 0; i < G * G; i++) g.push(r());
        var w = function (p, q) { return g[(q % G) * G + (p % G)]; };
        for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
          var u = i / n * G, v = j / n * G, a = Math.floor(u), b = Math.floor(v), fu = u - a, fv = v - b;
          var val = (w(a, b) * (1 - fu) + w(a + 1, b) * fu) * (1 - fv) + (w(a, b + 1) * (1 - fu) + w(a + 1, b + 1) * fu) * fv + (r() - .5) * .5;
          d[(j * n + i) * 4 + 3] = val > .3 ? (val > .42 ? 255 : 150) : 0;
        }
        x.putImageData(im, 0, 0);
      }));
      // worn ink for the big type: almost all there, specks and a few scuffs missing
      doc.style.setProperty('--worn', tile(520, function (x, n) {
        var r = rng(73), i; x.fillStyle = '#000'; x.fillRect(0, 0, n, n); x.globalCompositeOperation = 'destination-out';
        for (i = 0; i < 2600; i++) { x.globalAlpha = .5 + r() * .5; x.fillRect(r() * n, r() * n, 1 + (r() < .25 ? 1 : 0), 1 + (r() < .12 ? 1 : 0)); }
        for (i = 0; i < 46; i++) { x.globalAlpha = .35 + r() * .5; x.beginPath(); x.ellipse(r() * n, r() * n, 2 + r() * 9, 1 + r() * 3, r() * 3, 0, 6.3); x.fill(); }
        x.lineWidth = 1; for (i = 0; i < 26; i++) { x.globalAlpha = .4 + r() * .4; var a = r() * n, b = r() * n; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (r() - .5) * 90, b + (r() - .5) * 26); x.stroke(); }
      }));
    } catch (e) {}
  })();

  /* ── the archive's own objects: built first, so photographs and lettering below treat them like any other markup ── */
  // one object of the archive (print, sticker, ticket, score, cutting, note, badge, drawing): the wall and the loader pin up the same things
  var DRAW = '<svg viewBox="0 0 120 78"><rect x="2" y="2" width="116" height="74"/><path d="M60 2v74M2 22h16v34H2M118 22h-16v34h16"/><circle cx="60" cy="39" r="9" style="fill:none;stroke:currentColor"/><path class="hl" d="M92 14 108 42"/><path class="a" d="M12 40 56 41M58 41 92 14M92 14 108 42"/><g><circle cx="12" cy="40" r="5"/><text x="12" y="42">1</text><circle cx="57" cy="41" r="5"/><text x="57" y="43">7</text><circle cx="92" cy="14" r="5"/><text x="92" y="16">15</text><circle cx="108" cy="43" r="5"/><text x="108" y="45">22</text></g></svg><span class="pencil">90+4′ — box to box</span>';
  function piece(w, r) {
    var n, rot = (r() - .5) * 26;
    if (w[0] === 'p') {
      n = el('figure', 'ph print ' + (w[3] || '')); n.dataset.photo = w[1]; n.dataset.cap = w[2] || '';
      if (r() < .45) n.dataset.tape = r() < .5 ? 't' : 'tl'; else if (r() < .35) n.dataset.pin = '';
      n.style.setProperty('--ws', (12 + r() * 6).toFixed(1)); n.style.setProperty('--ar', ['3/2', '4/3', '1/1', '3/2'][Math.floor(r() * 4)]);
    } else if (w[0] === 's') {
      n = el('div', 'stk'); var f = el('figure', 'ph'); f.dataset.photo = w[1]; n.appendChild(f); n.appendChild(el('b', 'd stk-n', w[2])); n.appendChild(el('span', 'd stk-nm', w[3]));
    } else if (w[0] === 't') { n = el('div', 'tkt'); n.dataset.tkt = w[1]; n.dataset.stamp = ''; rot *= .6; }
    else if (w[0] === 'n') {
      var a = w[1].split('—'); n = el('div', 'sc d'); n.style.setProperty('--opp', 'var(--' + w[2] + ')');
      n.innerHTML = '<span class="cutn c-bel inv" style="--h:9;--rot:-4deg"><i>' + a[0] + '</i></span><span class="cutn c-opp" style="--h:7;--rot:5deg"><i>' + a[1] + '</i></span>';
    } else if (w[0] === 'c') { n = el('div', 'cutting'); n.dataset.torn = 'tb'; n.appendChild(el('p', '', w[1])); rot *= .4; }
    else if (w[0] === 'h') { n = el('span', 'hand ' + (w[2] === 'y' ? 'c-y' : 'c-r'), w[1]); rot *= .5; }
    else if (w[0] === 'i') { n = el('i', 'il ' + (w[4] || '')); n.dataset.il = w[1]; if (w[2]) n.dataset.a = w[2]; if (w[3]) n.dataset.b = w[3]; }
    else { n = el('div', 'w-draw'); n.innerHTML = DRAW; rot *= .4; }
    n.classList.add('wi');
    return [n, rot];
  }
  // 08 · the wall: everything met on the way, in the order it was found, pinned wherever there was room
  (function () {
    var wall = $('#wall'); if (!wall) return;
    var W = [
      ['p', 'team', 'Moscow, 23.06'], ['s', 'hazard', 10, 'E. Hazard'], ['t', 13], ['n', '3—0', 'pan'], ['p', 'mertens', '47′, volley'], ['s', 'lukaku', 9, 'R. Lukaku'],
      ['t', 29], ['n', '5—2', 'tun'], ['p', 'penalty', 'from the spot'], ['h', '4 in 2', 'r'], ['s', 'courtois', 1, 'Courtois'],
      ['t', 45], ['p', 'januzaj', 'Kaliningrad'], ['n', '1—0', 'eng'], ['p', 'fansKal', 'red devils', 'duo-y'], ['c', 'Nine points out of nine.'],
      ['t', 54], ['p', 'japan', 'Rostov'], ['h', 'plan B', 'y'], ['s', 'fellaini', 8, 'Fellaini'], ['s', 'chadli', 22, 'Chadli'], ['d'], ['n', '3—2', 'jpn'], ['h', 'impossible.', 'r'], ['p', 'street', '2.07.18'],
      ['s', 'kdb', 7, 'De Bruyne'], ['t', 58], ['p', 'brazilTeam', 'Kazan, 6.07'], ['c', 'Belgium are in the semi-final.'], ['n', '2—1', 'bra'], ['p', 'kdbJoy', '31′'], ['p', 'braHug', 'Kazan', 'duo-r'], ['h', 'we can win this thing', 'r'], ['p', 'kontich', 'Kontich, 22:43'], ['s', 'kompany', 4, 'Kompany'],
      ['t', 61], ['p', 'france', 'Hazard / Mbappé'], ['n', '0—1', 'fra'], ['h', 'so close', 'r'], ['p', 'fanWig', 'Saint Petersburg', 'duo-y'],
      ['t', 63], ['n', '2—0', 'eng'], ['p', 'vertMedal', 'bronze'], ['p', 'meunierMedal', 'Meunier'], ['s', 'vertonghen', 5, 'Vertonghen'], ['s', 'witsel', 6, 'Witsel'], ['c', '16 goals. 10 scorers. 6 wins.'], ['p', 'bronze', '3rd'], ['h', 'merci', 'y'], ['p', 'braSalute', 'thank you'],
      ['i', 'oval', 'RED DEVILS', 'BELGIUM'], ['i', 'jersey', '10'], ['i', 'pent', '2018', 'WORLD CUP', 'y'], ['i', 'box', 'N°3'], ['i', 'stack', 'GOAL!'], ['i', 'chk', '', '', 'k'], ['i', 'flag', 'BEL'],
      ['i', 'pill', '16 GOALS', '7 MATCHES', 'y'], ['i', 'rnd', '3', 'THIRD PLACE', 'y'], ['i', 'bars', '', '', 'y'], ['i', 'dia', 'ROSTOV', '', 'k'], ['i', 'hex', 'PLAN B', '65′'], ['i', 'rnd', '94′', 'CHADLI', 'k'], ['i', 'pill', 'KAZAN', '6 JULY', 'k'],
      ['i', 'star', '', '', 'y'], ['i', 'star'], ['i', 'star', '', '', 'y']
    ];
    // the illustrated stickers are dealt evenly through the story instead of arriving in one batch at the end
    var extra = W.filter(function (w) { return w[0] === 'i'; }), base = W.length - extra.length;
    W = W.filter(function (w) { return w[0] !== 'i'; });
    extra.forEach(function (w, j) { W.splice(Math.round((j + 1) * base / (extra.length + 1)) + j, 0, w); });
    var r = rng(2018), port = window.innerWidth < 820 && window.innerHeight > window.innerWidth;
    var C = port ? 5 : 10, R = Math.ceil(W.length / C), cells = [], i;
    for (i = 0; i < C * R; i++) cells.push(i);
    for (i = cells.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = cells[i]; cells[i] = cells[j]; cells[j] = t; }
    var FX = ['fx-slap', 'fx-drop', 'fx-slide', '', 'fx-slap'];
    W.forEach(function (w, k) {
      var c = cells[k], cx = c % C, cy = Math.floor(c / C), q = piece(w, r), n = q[0], rot = q[1];
      var fx = FX[Math.floor(r() * FX.length)]; if (fx && w[0] !== 's' && w[0] !== 'h' && w[0] !== 'i') n.classList.add(fx);
      n.style.setProperty('--wx', ((cx + .5 + (r() - .5) * .7) / C * 100).toFixed(1) + '%');
      n.style.setProperty('--wy', ((cy + .5 + (r() - .5) * .6) / R * 100).toFixed(1) + '%');
      n.style.setProperty('--rot', rot.toFixed(1) + 'deg'); n.style.setProperty('--wz', k + 1);
      n.style.setProperty('--fx', Math.round((r() - .5) * 140) + 'vw'); n.style.setProperty('--fy', Math.round(-30 - r() * 50) + 'vh'); n.style.setProperty('--spin', Math.round((r() - .5) * 70) + 'deg');
      n.dataset.at = (.03 + k / W.length * .66).toFixed(3);
      wall.appendChild(n);
    });
  })();
  // match tickets: one template, seven matches — the facts printed on them are the ones used on the page
  var MATCH = {
    13: ['BEL—PAN', 'Group G', 'Fisht Stadium, Sochi', '18.06.18', '3—0', 't-pan'],
    29: ['BEL—TUN', 'Group G', 'Spartak Stadium, Moscow', '23.06.18', '5—2', 't-tun'],
    45: ['ENG—BEL', 'Group G', 'Kaliningrad Stadium', '28.06.18', '0—1', 't-eng'],
    54: ['BEL—JPN', 'Round of 16', 'Rostov Arena', '02.07.18', '3—2', 't-jpn'],
    58: ['BRA—BEL', 'Quarter-final', 'Kazan Arena', '06.07.18', '1—2', 't-bra'],
    61: ['FRA—BEL', 'Semi-final', 'Saint Petersburg Stadium', '10.07.18', '1—0', 't-fra'],
    63: ['BEL—ENG', 'Third-place play-off', 'Saint Petersburg Stadium', '14.07.18', '2—0', 't-eng']
  };
  $$('[data-tkt]').forEach(function (n) {
    var no = n.dataset.tkt, m = MATCH[no]; if (!m) return;
    n.classList.add(m[5]);
    n.innerHTML = '<div class="tkt-a"><span class="mono">World Cup · Russia 2018 · ' + m[1] + '</span><b class="d">' + m[0] + '</b><span class="mono">' + m[2] + '</span><i class="tkt-bar"></i><span class="mono tkt-ser">№ ' + ('00' + no).slice(-3) + ' / 064 · keep this stub</span></div>' +
      '<div class="tkt-b"><span class="mono">Match</span><b class="d">' + no + '</b><span class="mono">' + m[3] + '</span></div>' +
      (n.dataset.stamp != null ? '<span class="stamp tkt-st">' + m[4] + '<small>full time</small></span>' : '');
  });
  // stickers: type inside a flat shape, a fat cream die-cut around it — one small generator per shape
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function fzs(t, max, cap) { return Math.min(cap, max / (Math.max(1, t.length) * .47)).toFixed(1); }
  function tx(cls, x, y, size, max, t) { return t ? '<text class="bt ' + cls + '" x="' + x + '" y="' + y + '" font-size="' + size + '" data-max="' + max + '">' + esc(t) + '</text>' : ''; }
  function checker(x, y, cols, rows, q, cls) { var d = '', i, j; for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) if ((i + j) % 2 === 0) d += 'M' + (x + i * q) + ' ' + (y + j * q) + 'h' + q + 'v' + q + 'h-' + q + 'z'; return '<path class="' + cls + '" d="' + d + '"/>'; }
  var BD = {
    oval: function (a, b) { var p = 'M60 3C101 3 117 12 117 46S101 89 60 89 3 80 3 46 19 3 60 3Z'; return [120, 92, p, '<path class="b1" d="' + p + '"/><path class="bo" d="' + p + '" transform="translate(60 46) scale(.9) translate(-60 -46)"/>' + checker(36, 12, 12, 2, 4, 'bw') + checker(36, 70, 12, 2, 4, 'bw') + tx('s f', 60, 33.5, 6.5, 62, b) + tx('a f', 60, 60, fzs(a, 86, 27), 86, a)]; },
    pent: function (a, b) { var p = 'M5 4H95V64L50 94 5 64Z'; return [100, 98, p, '<path class="b1" d="' + p + '"/><path class="bo" d="M11 10H89V61L50 87 11 61Z"/>' + tx('s f', 50, 25, 6.5, 66, b) + tx('a f', 50, b ? 57 : 52, fzs(a, 70, 34), 70, a)]; },
    dia: function (a, b) { return [130, 84, 'M65 2 104 42 65 82 26 42ZM3 25H127V59H3Z', '<path class="b1" d="M65 2 104 42 65 82 26 42Z"/><path class="b1" d="M3 25H127V59H3Z"/><path class="bo" d="M7 29H123V55H7Z"/>' + tx('a f', 65, 51, fzs(a, 108, 25), 108, a) + tx('s f', 65, 70, 5, 30, b)]; },
    box: function (a) { var p = 'M2 2H128V56H2Z'; return [130, 58, p, '<path class="bw" d="' + p + '"/><path class="bf" d="M8 8H122V50H8Z"/>' + tx('a c', 65, 41, fzs(a, 100, 32), 100, a)]; },
    rnd: function (a, b) { var p = 'M50 3A47 47 0 1 1 50 97A47 47 0 1 1 50 3Z'; return [100, 100, p, '<path class="b1" d="' + p + '"/><circle class="bo" cx="50" cy="50" r="41"/>' + tx('a f', 50, b ? 58 : 64, fzs(a, 64, b ? 38 : 46), 64, a) + tx('s f', 50, 74, 6, 50, b)]; },
    pill: function (a, b) { var p = 'M65 2C103 2 128 14 128 33S103 64 65 64 2 52 2 33 27 2 65 2Z'; return [130, 66, p, '<path class="b1" d="' + p + '"/>' + tx('a f', 65, b ? 40 : 44, fzs(a, 94, b ? 30 : 34), 94, a) + tx('s f', 65, 53, 6, 72, b)]; },
    hex: function (a, b) { var p = 'M22 4H108L127 42 108 80H22L3 42Z'; return [130, 84, p, '<path class="bw" d="' + p + '"/><path class="bf2" d="M25 10H105L120 42 105 74H25L10 42Z"/>' + tx('a k', 65, b ? 41 : 52, fzs(a, 90, b ? 25 : 31), 90, a) + tx('a c', 65, 65, fzs(b || '', 80, 21), 80, b)]; },
    chk: function () { var p = 'M3 2H109V50H3Z'; return [112, 52, p, '<path class="bw" d="' + p + '"/>' + checker(8, 6, 12, 5, 8, 'b1')]; },
    bars: function () { return [74, 100, 'M30 3H46L20 97H4ZM54 3H70L44 97H28Z', '<path class="b1" d="M30 3H46L20 97H4Z"/><path class="b2" d="M54 3H70L44 97H28Z"/>']; },
    stack: function (a) {
      var q = fzs(a, 132, 46), e = '', i, t = function (cls, o) { return '<text class="bt a ' + cls + '" x="' + (80 + o).toFixed(1) + '" y="' + (46 + o).toFixed(1) + '" font-size="' + q + '" data-max="132">' + esc(a) + '</text>'; };
      for (i = 6; i > 0; i--) e += t('b2s', i * 1.1);
      return [160, 64, '', t('cutt', 0) + t('cutt', 6.6) + e + t('c', 0)];
    },
    flag: function (a) { var p = 'M14 3H86Q97 3 97 14V86Q97 97 86 97H14Q3 97 3 86V14Q3 3 14 3Z'; return [100, 100, p, '<path class="bk" d="M14 3H35V97H14Q3 97 3 86V14Q3 3 14 3Z"/><path class="by" d="M35 3H65V97H35Z"/><path class="br" d="M65 3H86Q97 3 97 14V86Q97 97 86 97H65Z"/>' + (a ? '<path class="bw" d="M14 60H86V84H14Z"/>' + tx('a k', 50, 79.5, fzs(a, 60, 23), 60, a) : '')]; },
    star: function () { var p = 'M50 4 61 37 96 37 68 58 79 92 50 71 21 92 32 58 4 37 39 37Z'; return [100, 96, p, '<path class="b1" d="' + p + '"/>']; },
    jersey: function (a) { var p = 'M30 14 42 9Q50 19 58 9L70 14 93 30 83 47 72 40 73 91H27L28 40 17 47 7 30Z'; return [100, 100, p, '<path class="b1" d="' + p + '"/><path class="b2" d="M7 30 17 47 23 43 13 26ZM93 30 83 47 77 43 87 26ZM42 9Q50 23 58 9L54 8Q50 16 46 8Z"/>' + tx('a f', 50, 73, fzs(a, 34, 34), 34, a)]; }
  };
  seeded('[data-il]').forEach(function (n, k) {
    var q = (BD[n.dataset.il] || BD.rnd)(n.dataset.a || '', n.dataset.b || ''), r = rng(k * 131 + 7);
    n.innerHTML = '<svg viewBox="-7 -7 ' + (q[0] + 14) + ' ' + (q[1] + 14) + '" aria-hidden="true">' + (q[2] ? '<path class="bd-cut" d="' + q[2] + '"/>' : '') + '<g class="bd-in">' + q[3] + '</g></svg>';
    n.style.aspectRatio = (q[0] + 14) + '/' + (q[1] + 14);
    if (!n.style.getPropertyValue('--rot')) n.style.setProperty('--rot', ((r() - .5) * 24).toFixed(1) + 'deg');
    n.style.setProperty('--md', Math.round((r() - .5) * 40)); n.style.setProperty('--fd', (5 + r() * 6).toFixed(1) + 's');
    n.setAttribute('aria-hidden', 'true');
  });
  // once the fonts are in, any word wider than its shape is squeezed to fit
  function fitStickers() {
    $$('.il text[data-max]').forEach(function (t) {
      t.removeAttribute('textLength'); t.removeAttribute('lengthAdjust');
      var m = +t.getAttribute('data-max'), len = 0; try { len = t.getComputedTextLength(); } catch (e) {}
      if (len > m) { t.setAttribute('textLength', m); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    });
  }
  // 01 · the front page is written once and seen through three windows (the folded quarter + two flaps)
  (function () {
    var page = $('#fpPage'); if (!page) return;
    ['.fp-tr', '.fp-bot'].forEach(function (s) { var w = $(s), c = page.cloneNode(true); c.removeAttribute('id'); if (w) w.appendChild(c); });
  })();
  // cut with scissors: five snips a side, corners lopped off
  function scissors(r) {
    var p = [], n = 5, i, q = function (v) { return v.toFixed(1) + '%'; };
    for (i = 0; i < n; i++) p.push(q(4 + i / n * 92 + r() * 8) + ' ' + q(r() * 7));
    for (i = 0; i < n; i++) p.push(q(100 - r() * 7) + ' ' + q(4 + i / n * 92 + r() * 8));
    for (i = 0; i < n; i++) p.push(q(96 - i / n * 92 - r() * 8) + ' ' + q(100 - r() * 7));
    for (i = 0; i < n; i++) p.push(q(r() * 7) + ' ' + q(96 - i / n * 92 - r() * 8));
    return 'polygon(' + p.join(',') + ')';
  }

  // the white margin of a print: cut by hand, a few pixels out everywhere, never a rectangle
  function cutpx(r, d) {
    var p = [], n = 4, i, px = function () { return (r() * d).toFixed(1) + 'px'; }, at = function (i) { return (i / n * 100 + (i && i < n ? (r() - .5) * 14 : 0)).toFixed(1) + '%'; };
    for (i = 0; i <= n; i++) p.push(at(i) + ' ' + px());
    for (i = 1; i < n; i++) p.push('calc(100% - ' + px() + ') ' + at(i));
    for (i = n; i >= 0; i--) p.push(at(i) + ' calc(100% - ' + px() + ')');
    for (i = n - 1; i > 0; i--) p.push(px() + ' ' + at(i));
    return 'polygon(' + p.join(',') + ')';
  }
  // a band torn across a photograph (y0→y1, in %): the inner shape keeps its colour, the outer one is the white fibre around it
  function tearBand(r, y0, y1) {
    var a = [], b = [], n = 11, i, x;
    for (i = 0; i <= n; i++) { x = -4 + i / n * 108; a.push([x, y0 + (r() - .5) * 7 + (i % 3 === 1 ? 3 : 0)]); b.push([x, y1 + (r() - .5) * 7 - (i % 4 === 2 ? 3 : 0)]); }
    var poly = function (g) { return 'polygon(' + a.map(function (q) { return q[0].toFixed(1) + '% ' + (q[1] - g).toFixed(1) + '%'; }).concat(b.slice().reverse().map(function (q) { return q[0].toFixed(1) + '% ' + (q[1] + g).toFixed(1) + '%'; })).join(',') + ')'; };
    return [poly(0), poly(1.5)];
  }
  var LOAD = { total: 0, done: 0 };

  /* ── photographs: prints, tape, pencil captions, credits — and each one pulled as a screen print ── */
  (function () {
    var used = {}, P = window.PHOTOS || {}, keys = {}, order = [], qi = 0, active = 0, nfig = 0, off = $$('#ld [data-photo]').length;
    // [paper, spot colour]: black ink always; "a" leaves everything but the ink transparent
    var TONE = { k: [[245, 243, 238], null], y: [[245, 243, 238], [247, 212, 23]], r: [[245, 243, 238], [229, 43, 50]], yk: [[247, 212, 23], null], rk: [[229, 43, 50], null], g: [[226, 223, 216], [112, 109, 104]], a: [null, null] };
    function toneOf(fig, idx) {
      if (fig.dataset.ink) return fig.dataset.ink;
      if (/(^|\s)duo-/.test(fig.className)) return 'a';
      if (fig.closest('.stk')) return ['yk', 'k', 'y', 'yk', 'k', 'r'][Math.abs(idx) % 6];
      if (fig.classList.contains('print')) return ['k', 'y', 'k', 'k', 'r', 'k', 'y'][Math.abs(idx) % 7];
      return 'g';
    }
    // the photograph is cut down to one black ink: where it thins out it breaks into stipple; the mid-tones take the flat colour, the lights are bare paper
    function ink(img, tone) {
      var T = TONE[tone] || TONE.k, w = Math.min(tone === 'g' ? 1100 : 820, img.naturalWidth), h = Math.max(1, Math.round(w * img.naturalHeight / img.naturalWidth));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
      var im = x.getImageData(0, 0, w, h), d = im.data, n = w * h, L = new Uint8Array(n), hist = new Uint32Array(256), i, v, o, nz;
      for (i = 0; i < n; i++) { v = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8; L[i] = v; hist[v]++; }
      function pct(q) { var a = 0; for (var k = 0; k < 256; k++) { a += hist[k]; if (a >= n * q) return k; } return 255; }
      var t1 = pct(.41) * .62 + 104 * .38, t2 = pct(.75) * .62 + 176 * .38, s = (w * 40503 + h * 97 + tone.charCodeAt(0)) >>> 0, pa = T[0], sp = T[1], a1 = tone === 'g' ? 30 : 62, a2 = 34;
      for (i = 0; i < n; i++) {
        s = (s * 1664525 + 1013904223) >>> 0; nz = (s >>> 24) / 255 - .5; v = L[i]; o = i * 4;
        if (v + nz * a1 < t1) { d[o] = d[o + 1] = d[o + 2] = 9; d[o + 3] = 255; }
        else if (sp && v + nz * a2 < t2) { d[o] = sp[0]; d[o + 1] = sp[1]; d[o + 2] = sp[2]; d[o + 3] = 255; }
        else if (pa) { d[o] = pa[0]; d[o + 1] = pa[1]; d[o + 2] = pa[2]; d[o + 3] = 255; }
        else d[o + 3] = 0;
      }
      x.putImageData(im, 0, 0); return c;
    }
    var jobs = [], busy = false;
    function work() {
      if (busy || !jobs.length) return; busy = true;
      var j = jobs.shift(), end = function (u) { busy = false; j.cb(u); setTimeout(work, 0); };
      try { ink(j.img, j.tone).toBlob(function (b) { end(b ? URL.createObjectURL(b) : null); }, 'image/png'); } catch (e) { end(null); }
    }
    function loadKey(K) {
      active++;
      var im = new Image(), done = function () { active--; pump(); };
      if (K.cors) im.crossOrigin = 'anonymous';
      im.onload = function () {
        var urls = {};
        K.figs.forEach(function (f) {
          var fin = function (u) {
            f.img.onload = f.img.onerror = function () { f.img.onload = f.img.onerror = null; if (f.first) LOAD.done++; };
            f.img.src = u || K.src; if (u) f.fig.classList.add('inked', 'ink-' + f.tone); if (f.col) f.col.src = K.src;
          };
          if (!K.cors || f.tone === 'none') return fin(null);
          if (urls[f.tone] === undefined) { urls[f.tone] = []; (function (t) { jobs.push({ img: im, tone: t, cb: function (u) { var w = urls[t]; urls[t] = u || ''; w.forEach(function (g) { g(u); }); } }); })(f.tone); }
          if (typeof urls[f.tone] === 'string') fin(urls[f.tone] || null); else urls[f.tone].push(fin);
        });
        work(); done();
      };
      im.onerror = function () {
        // the plain link still works, without the ink
        if (K.cors) { K.cors = false; K.src = window.photoSrc(K.p); active--; loadKey(K); return; }
        K.figs.forEach(function (f) { f.fig.classList.add('missing'); f.img.remove(); if (f.first) LOAD.done++; }); done();
      };
      im.src = K.src;
    }
    function pump() { while (active < 5 && qi < order.length) loadKey(order[qi++]); }
    $$('[data-photo]').forEach(function (fig, idx) {
      idx -= off;
      var key = fig.dataset.photo, p = P[key], inner = el('span', 'ph-i');
      fig.appendChild(inner);
      if (fig.dataset.cutout != null) fig.style.setProperty('--cut', scissors(rng(idx * 77 + 9)));
      else if (fig.classList.contains('print') && !fig.classList.contains('wi')) fig.style.setProperty('--cut', cutpx(rng(idx * 41 + 5), 8));
      if (fig.dataset.cap != null && fig.dataset.cap !== '') fig.appendChild(el('span', 'print-cap pencil', fig.dataset.cap));
      if (fig.dataset.tape != null) { var t = el('i', 'tape ' + (fig.dataset.tape || 't')); fig.appendChild(t); if (fig.dataset.tape === 'x') fig.appendChild(el('i', 'tape tr')); }
      if (fig.dataset.pin != null) fig.appendChild(el('i', 'pinhead'));
      if (!p) { fig.classList.add('missing'); return; }
      var img = new Image();
      img.alt = fig.closest('[aria-hidden="true"]') ? '' : (p.alt || '');
      img.loading = 'eager';
      inner.appendChild(img);
      inner.appendChild(el('span', 'cred', p.by + ' · ' + p.lic));
      var col = null;
      if (fig.dataset.color != null) {
        var yy = (fig.dataset.color || '14 52').split(' ').map(Number), tb = tearBand(rng(idx * 19 + 3), yy[0], yy[1] || yy[0] + 36), rim = el('span', 'ph-cr'), cw = el('span', 'ph-c');
        col = new Image(); col.alt = ''; cw.appendChild(col);
        rim.style.setProperty('--tear2', tb[1]); cw.style.setProperty('--tear', tb[0]);
        inner.appendChild(rim); inner.appendChild(cw);
      }
      var first = nfig++ < 12; if (first) LOAD.total++;
      var K = keys[key]; if (!K) { K = keys[key] = { p: p, figs: [], src: '', cors: false }; order.push(K); }
      K.figs.push({ fig: fig, img: img, tone: toneOf(fig, idx), col: col, first: first });
      used[key] = p;
    });
    // one question to Commons gives every photograph an address a canvas may read; with no answer the plain links are used, un-inked
    var started = false, nm = function (f) { return String(f).replace(/_/g, ' '); };
    function start(map) {
      if (started) return; started = true;
      order.forEach(function (K) { var u = map && K.p.file && map[nm(K.p.file)]; if (u) { K.cors = true; K.src = u; } else K.src = window.photoSrc(K.p); });
      pump();
    }
    var files = order.filter(function (K) { return K.p.file && !K.p.src; }).map(function (K) { return nm(K.p.file); }).slice(0, 50), cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('bel18.thumbs') || 'null'); } catch (e) {}
    if (/[?&]ink=0/.test(location.search) || !window.fetch || !files.length) start(null);
    else if (cached && files.every(function (f) { return cached[f]; })) start(cached);
    else {
      setTimeout(function () { start(null); }, 3200);
      fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url&iiurlwidth=960&titles=' + encodeURIComponent(files.map(function (f) { return 'File:' + f; }).join('|')))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var m = {}, pg = (j.query && j.query.pages) || {};
          Object.keys(pg).forEach(function (id) { var q = pg[id]; if (q.imageinfo && q.imageinfo[0]) m[nm(q.title.replace(/^File:/, ''))] = q.imageinfo[0].thumburl || q.imageinfo[0].url; });
          try { sessionStorage.setItem('bel18.thumbs', JSON.stringify(m)); } catch (e) {}
          start(m);
        })
        .catch(function () { start(null); });
    }
    var ul = $('#credits');
    if (ul) Object.keys(used).forEach(function (k) {
      var p = used[k], li = el('li'), a = el('a', '', p.alt);
      a.href = window.photoPage(p); a.target = '_blank'; a.rel = 'noopener';
      li.appendChild(a); li.appendChild(document.createTextNode(' — ' + p.by + ', ' + p.lic)); ul.appendChild(li);
    });
  })();

  /* ── type: letters that arrive one by one, handwriting that is written, headlines cut from papers ── */
  function split(node, mode, seed) {
    var r = rng(seed), i = 0;
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.nodeValue.split(/([ \n\t]+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^[ \n\t]+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = el('span', 'wd');
            Array.from(tok).forEach(function (chr) {
              var s = el('span', 'ch', chr);
              s.style.setProperty('--i', i++);
              if (mode === 'sp') s.style.setProperty('--rz', ((r() - .5) * 38).toFixed(1) + 'deg');
              else s.style.setProperty('--j', Math.round(r() * 55) + 'ms');
              w.appendChild(s);
            });
            frag.appendChild(w);
          });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(node);
    node.style.setProperty('--n', i);
  }
  var statics = [];
  $$('[data-split]').forEach(function (n, k) { if (/^H\d$/.test(n.tagName)) n.setAttribute('aria-label', n.textContent.replace(/\s+/g, ' ').trim()); split(n, 'sp', k * 97 + 13); });
  seeded('.hand,.pencil').forEach(function (n, k) {
    split(n, 'hw', k * 61 + 5);
    n.classList.add('hw', n.dataset.t ? 'hw-s' : 'hw-a');
    if (!n.dataset.t && !n.closest('[data-in],[data-at],[data-from],[data-s]')) statics.push(n);
  });
  $$('[data-cut]').forEach(function (n, k) {
    var dark = n.dataset.cut === 'k', r = rng(k * 53 + 17), txt = n.textContent.replace(/\s+/g, ' ').trim(), last = '';
    var V = dark ? ['v2', 'v3', 'v2', 'v6', 'v3', 'v5'] : ['v1', 'v2', 'v3', 'v1', 'v5', 'v2'];
    n.textContent = ''; n.appendChild(el('span', 'vh', txt));
    txt.split(' ').forEach(function (w, i) {
      var v = w.length <= 3 ? 'v4' : V[Math.floor(r() * V.length)];
      if (v === last && v !== 'v4') v = V[(V.indexOf(v) + 1) % V.length];
      last = v;
      var o = el('span', 'cw ' + v), inner = el('span', 'cw-i', w);
      o.setAttribute('aria-hidden', 'true');
      o.style.cssText = '--i:' + i + ';--rot:' + ((r() - .5) * 8).toFixed(1) + 'deg;--dy:' + Math.round((r() - .5) * 12) + 'px;--j:' + Math.round(r() * 70) + 'ms;--fs:' + (.86 + r() * .32).toFixed(2) + 'em';
      var q = function (a, b) { return (a + r() * b).toFixed(1) + '%'; };
      // cut with scissors, not a ruler: four corners, none of them square
      inner.style.clipPath = 'polygon(' + q(0, 4) + ' ' + q(0, 10) + ',' + q(96, 4) + ' ' + q(0, 10) + ',' + q(96, 4) + ' ' + q(90, 10) + ',' + q(0, 4) + ' ' + q(90, 10) + ')';
      o.appendChild(inner); n.appendChild(o);
    });
  });

  /* ── headlines: fitted to the full width, each line with its own way of arriving ── */
  $$('.ttl-l').forEach(function (n) {
    var t = n.textContent.replace(/\s+/g, ' ').trim(), tile = n.dataset.tile != null ? +n.dataset.tile : -1;
    n.setAttribute('aria-hidden', 'true'); n.textContent = '';
    if (!n.dataset.fx) n.dataset.fx = 'rise';
    Array.from(t).forEach(function (c, i) { var q = el('span', 'tc' + (i === tile ? ' tl' : ''), c); q.style.setProperty('--i', i); n.appendChild(q); });
  });
  /* ── running text arrives line by line: every word is its own small mask, and words on the same line share a delay ── */
  var LW = [];
  $$('main p').forEach(function (p) {
    if (!p.closest('[data-in],[data-at],[data-from],[data-s]') || p.closest('#wall,.tkt,.cutting,.fp,.np,.np2,[data-cut],[data-split],.hand,.pencil,.lab,.ttl') || p.querySelector('.hand,.pencil,[data-count],svg,img,figure,.il,.stamp')) return;
    var ws = [];
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.nodeValue.split(/([ \n\t]+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^[ \n\t]+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = el('span', 'lw'); o.appendChild(el('span', 'lw-i', tok)); frag.appendChild(o); ws.push(o);
          });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(p);
    if (ws.length) { p.classList.add('lns'); LW.push(ws); }
  });
  function lineUp() {
    LW.forEach(function (ws) { var top = null, li = -1; ws.forEach(function (o) { var t = o.offsetTop; if (top === null || Math.abs(t - top) > 3) { li++; top = t; } o.style.setProperty('--li', li); }); });
  }
  // the loader's headline is fitted to its sheet, and the block behind its fourth letter is put where that letter really is
  function fitLd() {
    var art = $('#ldArt'), h = $('#ldH'), g = $('#ldG'); if (!art || !h || !g || !art.offsetWidth) return;
    h.style.fontSize = '100px'; var w = h.offsetWidth; if (!w) return;
    var port = art.offsetHeight > art.offsetWidth;
    h.style.fontSize = Math.min(100 * art.offsetWidth * (port ? .98 : .95) / w, art.offsetHeight * (port ? .34 : .56)).toFixed(1) + 'px';
    var a = art.getBoundingClientRect(), b = g.getBoundingClientRect();
    $$('.ld-tile', art).forEach(function (t) {
      t.style.left = ((b.left - a.left) / a.width * 100).toFixed(2) + '%'; t.style.top = ((b.top - a.top) / a.height * 100).toFixed(2) + '%';
      t.style.width = (b.width / a.width * 100).toFixed(2) + '%'; t.style.height = (b.height / a.height * 100).toFixed(2) + '%';
    });
  }
  function fitAll() {
    var H = window.innerHeight;
    $$('[data-fit]').forEach(function (n) {
      var box = n.closest('.ttl') || n.parentNode, W = box.clientWidth; if (!W) return;
      n.style.setProperty('--fz', '100px'); var w = n.offsetWidth; if (!w) return;
      n.style.setProperty('--fz', Math.min(100 * W / w, (+n.dataset.fit || 46) * H / 79).toFixed(1) + 'px');
    });
    $$('.ttl').forEach(function (t) { var l = $('.ttl-l', t); if (l) t.style.setProperty('--nz', (parseFloat(l.style.getPropertyValue('--fz')) * .36).toFixed(1) + 'px'); });
  }
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
  // every torn chapter edge gets a paper core that slides out from under it
  $$('.rip').forEach(function (n) { var w = el('i', 'rip rip-w'); w.dataset.torn = 'b'; w.dataset.tornD = '30'; w.dataset.par = '-.05'; n.dataset.tornD = '26'; n.parentNode.insertBefore(w, n); });

  /* ── paper: torn edges, and one sheet ripped in two ── */
  function tornAll() {
    seeded('[data-torn]').forEach(function (n, k) {
      var sides = n.dataset.torn, d = +(n.dataset.tornD || 5), r = rng(k * 131 + 7), w = n.offsetWidth || 300, h = n.offsetHeight || 80, pts = [], tmp;
      function run(len, has, fn) { if (!has) return; var c = Math.max(4, Math.round(len / 13)); for (var i = 1; i < c; i++) fn((i / c * 100 + (r() - .5) * (60 / c)).toFixed(2), (r() * d).toFixed(1)); }
      pts.push('0 0'); run(w, sides.indexOf('t') > -1, function (a, o) { pts.push(a + '% ' + o + 'px'); });
      pts.push('100% 0'); run(h, sides.indexOf('r') > -1, function (a, o) { pts.push('calc(100% - ' + o + 'px) ' + a + '%'); });
      pts.push('100% 100%'); tmp = []; run(w, sides.indexOf('b') > -1, function (a, o) { tmp.push(a + '% calc(100% - ' + o + 'px)'); }); pts = pts.concat(tmp.reverse());
      pts.push('0 100%'); tmp = []; run(h, sides.indexOf('l') > -1, function (a, o) { tmp.push(o + 'px ' + a + '%'); }); pts = pts.concat(tmp.reverse());
      n.style.setProperty('--torn', 'polygon(' + pts.join(',') + ')');
    });
  }
  $$('[data-rip]').forEach(function (n, k) {
    var r = rng(k * 7 + 3), pts = [], c = 18;
    for (var i = 0; i <= c; i++) pts.push((56 - i / c * 12 + (r() - .5) * 6).toFixed(1) + '% ' + (i / c * 100).toFixed(1) + '%');
    var clone = n.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true'); clone.removeAttribute('data-rip');
    n.classList.add('rip-a'); clone.classList.add('rip-b');
    n.style.clipPath = 'polygon(0 0,' + pts.join(',') + ',0 100%)';
    clone.style.clipPath = 'polygon(100% 0,' + pts.join(',') + ',100% 100%)';
    n.parentNode.appendChild(clone);
  });

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

  /* ── scenes ── */
  // a scene is anything with its own 0→1 progress: a pinned section, or one panel of a horizontal track
  function mkScene(n, skipPanels) {
    var mine = function (m) { return !skipPanels || !m.closest('.panel'); };
    return {
      el: n, p: -1, top: 0, len: 1, left: 0, w: 1,
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
    return { n: n, c: c, panel: panel, top: 0, got: false };
  });
  function apply(s, p) {
    if (p === s.p) return; s.p = p;
    s.el.style.setProperty('--p', p.toFixed(4));
    var i, it;
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

  // chapter joins: the next chapter climbs over the end of the last one, which goes dark underneath it
  var covers = RM ? [] : $$('.xf').map(function (x) {
    var nx = x.nextElementSibling, pv = x.previousElementSibling; if (!nx || !pv) return null;
    nx.classList.add('cov'); var dim = el('i', 'xd'); dim.setAttribute('aria-hidden', 'true'); pv.appendChild(dim);
    return { xf: x, nx: nx, dim: dim, top: 0, o: 0, last: -1 };
  }).filter(Boolean), tilts = [];
  var chapters = [], parallax = [], vh = window.innerHeight, docH = 1;
  function measure() {
    vh = window.innerHeight; var y = window.scrollY;
    covers.forEach(function (c) { c.nx.style.translate = 'none'; c.xf.style.translate = 'none'; });
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
    covers.forEach(function (c) { c.top = c.nx.getBoundingClientRect().top + y; c.o = Math.max(0, -parseFloat(getComputedStyle(c.nx).marginTop) || 0); c.last = -1; });
    tilts = RM ? [] : $$('.clg').filter(function (n) { return !n.closest('[data-scene]'); }).map(function (n) { var r = n.getBoundingClientRect(); return { el: n, mid: r.top + y + r.height / 2, last: 9 }; });
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
    var mraf = 0, mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX / window.innerWidth * 2 - 1; my = e.clientY / window.innerHeight * 2 - 1;
      if (!mraf) mraf = requestAnimationFrame(function () { mraf = 0; $$('main > section.vis').forEach(function (s) { s.style.setProperty('--mx', mx.toFixed(3)); s.style.setProperty('--my', my.toFixed(3)); }); });
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
      if (co !== cv.last) {
        cv.last = co; cv.nx.style.translate = co ? '0 ' + co + 'px' : 'none'; cv.xf.style.translate = '0 ' + (co - cv.o) + 'px';
        cv.dim.style.opacity = sn < 1.1 ? ((1 - ce) * .62).toFixed(3) : 0;
      }
    }
    for (i = 0; i < tilts.length; i++) {
      var tl = tilts[i], td = (tl.mid - (y + vh / 2)) / vh;
      if (td > -1.6 && td < 1.6) { td = clamp(td, -1, 1); if (Math.abs(td - tl.last) > .004) { tl.last = td; tl.el.style.setProperty('--sy', td.toFixed(3)); } }
    }
    for (i = 0; i < stubs.length; i++) {
      var sb = stubs[i], got = sb.panel ? sb.panel.p >= .44 : y + vh * .55 >= sb.top;
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
      curCh = ch.no; hudNo.textContent = ch.no; hudName.textContent = ch.name;
      if (chapTx) { chapTx.textContent = ch.no; if (!RM) { chapSt.classList.remove('pop'); void chapSt.offsetWidth; chapSt.classList.add('pop'); } }
    }
    bar.style.transform = 'scaleX(' + clamp(y / docH).toFixed(4) + ')';
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }

  /* ── chapter-specific choreography ── */
  function sceneOf(n) { for (var i = 0; i < scenes.length; i++) if (scenes[i].el === n) return scenes[i]; }
  function on(sel, fn) { var n = $(sel), s = n && sceneOf(n); if (s) s.fns.push(fn); return s; }

  // 03 · the group stage travels left to right
  tracks.forEach(function (t) {
    var s = sceneOf(t.el); if (!s) return;
    s.fns.push(function (p) {
      // each panel is moved on its own and switched off while it is off screen: never more than two are painted
      var x = seg(p, .02, .97) * t.max, tf = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
      for (var i = 0; i < t.panels.length; i++) {
        var ps = t.panels[i], q = clamp((x + t.vw - ps.left) / (ps.w + t.vw)), vis = q > 0 && q < 1;
        if (vis !== ps.vis) { ps.vis = vis; ps.el.style.visibility = vis ? '' : 'hidden'; }
        if (vis) ps.el.style.transform = tf;
        apply(ps, q);
      }
    });
  });

  // 04 · Japan — the minute readout follows the state
  var jp = $('.s-jp');
  if (jp) {
    var MIN = ['45', '48', '52', '52', '65', '69', '74'], SC = [[0, 0], [0, 1], [0, 2], [0, 2], [0, 2], [1, 2], [2, 2]];
    var jpMin = $('#jpMin'), jpScore = $('#jpScore'), minBox = jpMin.parentNode;
    jp.addEventListener('state', function (e) {
      jpMin.textContent = MIN[e.detail];
      jpScore.setAttribute('aria-label', 'Belgium ' + SC[e.detail][0] + ', Japan ' + SC[e.detail][1]);
      if (!RM) { minBox.classList.remove('slam'); void minBox.offsetWidth; minBox.classList.add('slam'); }
    });
  }

  // 05 · Brazil — the photograph is first seen through the word, then the word swallows the screen
  var braWord = $('#braWord'), braPivot = $('#braPivot'), braMask = $('#braMask');
  function measureBra() {
    if (!braWord) return;
    var prev = braWord.style.transform; braWord.style.transform = 'none';
    var a = braWord.getBoundingClientRect(), b = braPivot.getBoundingClientRect();
    braWord.style.transform = prev;
    braWord.style.setProperty('--mx', (b.left + b.width / 2 - a.left).toFixed(1) + 'px');
  }
  on('.s-bra', function (p) {
    braWord.style.setProperty('--ms', Math.pow(30, E.i(seg(p, .04, .46))).toFixed(3));
    braMask.style.setProperty('--mo', (1 - seg(p, .42, .5)).toFixed(3));
  });

  // Signature diagrams
  var B = window.Board, xi, replays = [];
  if (B) {
    var xiEl = $('#xi'); if (xiEl) { xi = new B.XI(xiEl); on('#xi', function (p) { xi.update(p); }); }
    [['#chadli', B.CHADLI], ['#kdb', B.KDB]].forEach(function (r) {
      var n = $(r[0]); if (!n) return;
      var rp = new B.Replay(n, r[1]); replays.push(rp);
      on(r[0], function (p) { rp.update(p); });
    });
  }

  /* ── boot / resize ── */
  var lastW = window.innerWidth, lastO = B ? B.Replay.orient() : 'h';
  function layout() {
    fitAll(); fitStickers(); fitLd(); lineUp(); tornAll(); measure(); measureBra();
    replays.forEach(function (rp) { rp.locate(); });
    if (RM) {
      scenes.forEach(function (s) { s.p = -1; apply(s, s.poster); });
      tracks.forEach(function (t) { t.panels.forEach(function (ps) { ps.p = -1; apply(ps, 1); }); });
      frame();
    } else { scenes.forEach(function (s) { s.p = -1; }); frame(); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    // mobile URL-bar resizes change only the height: ignore those, keep the frame stable
    if (window.innerWidth === lastW && Math.abs(window.innerHeight - vh) < 140) return;
    lastW = window.innerWidth;
    if (B && B.Replay.orient() !== lastO) { lastO = B.Replay.orient(); replays.forEach(function (rp) { rp.build(); }); }
    layout();
  });
  layout();
  window.addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  // anything not tied to a trigger starts once the loader has left
  var booted = false;
  function boot() { if (booted) return; booted = true; doc.classList.add('booted'); statics.forEach(function (n) { n.classList.add('on'); }); }
  /* ── the wheel does not jump: the page glides to where it was sent ── */
  var FINE = window.matchMedia('(pointer:fine)').matches;
  if (!RM && FINE && !/[?&]glide=0/.test(location.search)) (function () {
    var tgt = window.scrollY, cur = tgt, raf = 0;
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; tgt = cur = window.scrollY; }
    function step() {
      cur += (tgt - cur) * .1;
      if (Math.abs(tgt - cur) < .6) { cur = tgt; raf = 0; } else raf = requestAnimationFrame(step);
      window.scrollTo(0, cur);
    }
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey || !doc.classList.contains('ready')) return;
      e.preventDefault();
      if (!raf) tgt = cur = window.scrollY;
      var d = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      tgt = clamp(tgt + d, 0, doc.scrollHeight - window.innerHeight);
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: false });
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { window.addEventListener(t, stop, { passive: true }); });
  })();
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
      c.classList.toggle('big', !!(e.target && e.target.closest && e.target.closest('a,button,.tkt,.stk')));
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  })();

  /* ── the loader is the press: the poster is printed in three passes — yellow, red, black — as the page arrives ── */
  var ld = $('#ld'), gone = false;
  function ready(now) {
    if (gone) return; gone = true;
    doc.classList.add('ready');
    if (ld) { ld.classList.add('out'); setTimeout(function () { if (ld.parentNode) ld.parentNode.removeChild(ld); }, now ? 0 : 1550); }
    setTimeout(boot, now ? 0 : 560);
  }
  if (!ld || RM || !doc.classList.contains('ld-on') || /[?&]ld=0/.test(location.search)) ready(true);
  else (function () {
    // the count follows what is really arriving (fonts, the first photographs), never faster than two and a half seconds, never longer than six
    var t0 = Date.now(), shown = 0, out = $('#ldN'), pass = $('#ldPass'), fonts = !(document.fonts && document.fonts.ready), NAMES = ['Yellow', 'Red', 'Black'];
    if (!fonts) document.fonts.ready.then(function () { fonts = true; });
    function show(v) {
      var q = [clamp(v / 33), clamp((v - 33) / 33), clamp((v - 66) / 34)], k = v < 33 ? 0 : v < 66 ? 1 : 2;
      out.textContent = ('00' + Math.round(v)).slice(-3);
      ld.style.setProperty('--q1', q[0].toFixed(3)); ld.style.setProperty('--q2', q[1].toFixed(3)); ld.style.setProperty('--q3', q[2].toFixed(3));
      ld.style.setProperty('--sq', q[k].toFixed(3));
      if (ld.dataset.pass !== String(k + 1)) { ld.dataset.pass = k + 1; pass.textContent = 'Pass ' + (k + 1) + '/3 — ' + NAMES[k]; }
    }
    function done() { ld.classList.add('done'); pass.textContent = 'Printed — 3/3'; }
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
})();
