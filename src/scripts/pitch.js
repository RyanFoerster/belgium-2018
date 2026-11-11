/* Tactical board engine — SVG, scroll-driven.
 Pitch coordinates are metres: x = distance from Belgium's own goal line (0–105),
 y = distance from Belgium's left touchline (0–68). Belgium always attacks +x.
 Orientation 'h' draws left→right, 'v' draws bottom→top (mobile). */
var NS = 'http://www.w3.org/2000/svg';
function mk(tag, attrs, parent) {
  var n = document.createElementNS(NS, tag);
  if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var seg = function (p, a, b) { return clamp((p - a) / (b - a)); };
var E = {
  io: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  o: function (t) { return 1 - Math.pow(1 - t, 3); },
  i: function (t) { return t * t * t; }
};
// deterministic "hand" wobble
function noise(i, s) { return Math.sin(i * 1.3 + s * 12.9) * .55 + Math.sin(i * 2.9 + s * 4.1) * .3 + Math.sin(i * .47 + s * 7.7) * .15; }
function f2(n) { return n.toFixed(2); }

/* ───────── Pitch ───────── */
function Pitch(svg, opts) {
  this.svg = svg; this.opts = opts || {}; this.o = this.opts.orient || 'h';
  this.build();
}
Pitch.prototype.P = function (x, y) { return this.o === 'h' ? [x, y] : [y, 105 - x]; };
Pitch.prototype.S = function (x, y) { var p = this.P(x, y); return f2(p[0]) + ' ' + f2(p[1]); };
Pitch.prototype.build = function () {
  var s = this.svg, self = this;
  while (s.firstChild) s.removeChild(s.firstChild);
  s.setAttribute('viewBox', this.o === 'h' ? '-8 -8 121 84' : '-8 -8 84 121');
  s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  this.g = {};
  ['lines', 'links', 'trails', 'notes', 'players', 'ball', 'top'].forEach(function (k) { self.g[k] = mk('g', { 'class': 'g-' + k }, s); });

  var S = this.S.bind(this), L = [];
  var poly = function (pts, close) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + S(p[0], p[1]); }).join('') + (close ? 'Z' : ''); };
  L.push(poly([[0, 0], [105, 0], [105, 68], [0, 68]], true));
  L.push(poly([[52.5, 0], [52.5, 68]]));
  L.push('M' + S(43.35, 34) + 'A9.15 9.15 0 1 0 ' + S(61.65, 34) + 'A9.15 9.15 0 1 0 ' + S(43.35, 34));
  L.push(poly([[0, 13.84], [16.5, 13.84], [16.5, 54.16], [0, 54.16]]));
  L.push(poly([[105, 13.84], [88.5, 13.84], [88.5, 54.16], [105, 54.16]]));
  L.push(poly([[0, 24.84], [5.5, 24.84], [5.5, 43.16], [0, 43.16]]));
  L.push(poly([[105, 24.84], [99.5, 24.84], [99.5, 43.16], [105, 43.16]]));
  L.push('M' + S(16.5, 26.69) + 'A9.15 9.15 0 0 1 ' + S(16.5, 41.31));
  L.push('M' + S(88.5, 26.69) + 'A9.15 9.15 0 0 0 ' + S(88.5, 41.31));
  L.push(poly([[0, 30.34], [-2, 30.34], [-2, 37.66], [0, 37.66]]));
  L.push(poly([[105, 30.34], [107, 30.34], [107, 37.66], [105, 37.66]]));
  L.push(poly([[10.7, 34], [11.3, 34]])); L.push(poly([[93.7, 34], [94.3, 34]])); L.push(poly([[52.2, 34], [52.8, 34]]));
  L.forEach(function (d, i) { mk('path', { 'class': 'ln', d: d, pathLength: 1, style: '--i:' + i }, self.g.lines); });

  // ruler ticks + crop marks: the pitch as a technical drawing
  for (var x = 0; x <= 105.01; x += 10.5) mk('path', { 'class': 'tick', d: 'M' + S(x, -1.2) + 'L' + S(x, x % 52.5 < .1 ? -3.4 : -2.4) }, this.g.lines);
  [[0, 0, -1, -1], [105, 0, 1, -1], [105, 68, 1, 1], [0, 68, -1, 1]].forEach(function (c) {
    mk('path', { 'class': 'tick', d: 'M' + S(c[0] + c[2] * 2, c[1] + c[3] * 4.6) + 'L' + S(c[0] + c[2] * 4.6, c[1] + c[3] * 4.6) + 'L' + S(c[0] + c[2] * 4.6, c[1] + c[3] * 2) }, self.g.lines);
  });
  var e = this.opts.edge;
  if (e) {
    var h = this.o === 'h';
    var a = mk('text', { 'class': 'edge', x: 0, y: h ? 71.2 : 109, 'text-anchor': 'start' }, this.g.lines); a.textContent = e[0];
    var b = mk('text', { 'class': 'edge', x: h ? 105 : 68, y: h ? 71.2 : 109, 'text-anchor': 'end' }, this.g.lines); b.textContent = e[1];
    if (this.opts.big) { a.setAttribute('font-size', 1.9); b.setAttribute('font-size', 1.9); }
  }
};
Pitch.prototype.addPlayer = function (d) {
  var big = this.opts.big, self = this;
  var r = d.r || (d.cls && /opp|mate/.test(d.cls) ? (big ? 2.1 : 1.6) : (big ? 3 : 2.3));
  var g = mk('g', { 'class': 'pl ' + (d.cls || '') }, this.g.players);
  mk('circle', { r: r }, g);
  if (d.n != null) { mk('text', { 'class': 'num', 'font-size': f2(r * 1.12), y: f2(r * .04) }, g).textContent = d.n; }
  if (d.name) {
    var fs = big ? 2.35 : 1.7, side = d.label || 'b', off = r + .9;
    var a = { r: [off, 0, 'start', 'central'], l: [-off, 0, 'end', 'central'], t: [0, -off - .2, 'middle', 'auto'], b: [0, off + fs * .85, 'middle', 'auto'] }[side];
    mk('text', { 'class': 'nm', 'font-size': fs, x: f2(a[0]), y: f2(a[1]), 'text-anchor': a[2], 'dominant-baseline': a[3] }, g).textContent = d.name;
  }
  var o = { g: g, d: d, r: r, x: 0, y: 0 };
  o.set = function (x, y, s) {
    o.x = x; o.y = y; var p = self.P(x, y);
    g.setAttribute('transform', 'translate(' + f2(p[0]) + ' ' + f2(p[1]) + ')' + (s != null && s !== 1 ? ' scale(' + s.toFixed(3) + ')' : ''));
  };
  return o;
};
function ringD(r, seed) {
  var d = '', n = 28;
  for (var i = 0; i <= n + 4; i++) {
    var a = -2.3 + i / n * Math.PI * 2, rr = r * (1 + .07 * noise(i, seed)) * (1 + i / n * .07);
    d += (i ? 'L' : 'M') + f2(Math.cos(a) * rr * 1.14) + ' ' + f2(Math.sin(a) * rr * .92);
  }
  return d;
}
Pitch.prototype.addRing = function (r, color, seed) {
  return mk('path', { 'class': 'ring ' + color, d: ringD(r, seed || 1), pathLength: 1, 'stroke-dashoffset': 1 }, this.g.notes);
};
Pitch.prototype.addHand = function (text, color, size, rot) {
  var t = mk('text', { 'class': 'hw ' + color, 'font-size': size || 3, 'text-anchor': 'middle', opacity: 0 }, this.g.top);
  t.textContent = text; t._rot = rot == null ? -6 : rot; return t;
};
function placeHand(pitch, t, x, y, dx, dy) {
  var p = pitch.P(x, y);
  t.setAttribute('transform', 'translate(' + f2(p[0] + (dx || 0)) + ' ' + f2(p[1] + (dy || 0)) + ') rotate(' + t._rot + ')');
}

/* ───────── Signature 01 — Starting XI ───────── */
var XI_DATA = [
  { n: 1, name: 'Courtois', full: 'Thibaut Courtois', role: 'Goalkeeper · Chelsea', x: 5.5, y: 34 },
  { n: 2, name: 'Alderweireld', full: 'Toby Alderweireld', role: 'Centre-back, right · Tottenham', x: 23, y: 51 },
  { n: 20, name: 'Boyata', full: 'Dedryck Boyata', role: 'Centre-back · Celtic', x: 20, y: 34 },
  { n: 5, name: 'Vertonghen', full: 'Jan Vertonghen', role: 'Centre-back, left · Tottenham', x: 23, y: 17 },
  { n: 15, name: 'Meunier', full: 'Thomas Meunier', role: 'Right wing-back · Paris SG', x: 47, y: 61.5 },
  { n: 7, name: 'De Bruyne', full: 'Kevin De Bruyne', role: 'Central midfield · Man. City', x: 42, y: 43 },
  { n: 6, name: 'Witsel', full: 'Axel Witsel', role: 'Central midfield · Tianjin Quanjian', x: 40, y: 25 },
  { n: 11, name: 'Carrasco', full: 'Yannick Carrasco', role: 'Left wing-back · Dalian Yifang', x: 47, y: 6.5 },
  { n: 14, name: 'Mertens', full: 'Dries Mertens', role: 'Forward, right · Napoli', x: 68, y: 47 },
  { n: 10, name: 'E. Hazard', full: 'Eden Hazard', role: 'Forward, left · Captain · Chelsea', x: 68, y: 21 },
  { n: 9, name: 'Lukaku', full: 'Romelu Lukaku', role: 'Centre-forward · Man. United', x: 85, y: 34 }
];
var XI_LINKS = [[0, 2], [1, 2], [2, 3], [1, 4], [3, 7], [5, 6], [1, 5], [3, 6], [4, 8], [7, 9], [5, 8], [6, 9], [8, 9], [8, 10], [9, 10]];
var XI_NOTES = [
  { i: 9, color: 'r', text: 'capt.', dx: -9, dy: -5.5 },
  { i: 5, color: 'y', text: 'deep. for now.', dx: 11, dy: -5.5 },
  { i: 2, color: 'r', text: 'in for Kompany', dx: 15.5, dy: 7.5, rot: -3 },
  { i: 10, color: 'y', text: 'scores twice', dx: 14, dy: -5.5 }
];
function XI(scene) {
  this.scene = scene; this.svg = scene.querySelector('svg.pitch');
  this.num = scene.querySelector('#xiNum'); this.nm = scene.querySelector('#xiName'); this.role = scene.querySelector('#xiRole');
  this.list = scene.querySelector('#xiList'); this.cur = -2; this.p = 0;
  this.build();
}
XI.prototype.build = function () {
  var self = this;
  this.pitch = new Pitch(this.svg, { orient: 'v', big: true, edge: ['Belgium v Panama · 18.06.2018', 'Attacking ↑'] });
  this.links = XI_LINKS.map(function () { return mk('path', { 'class': 'link' }, self.pitch.g.links); });
  this.players = XI_DATA.map(function (d) { return self.pitch.addPlayer({ n: d.n, name: d.name, label: 'b' }); });
  this.notes = XI_NOTES.map(function (n, k) {
    var ring = self.pitch.addRing(4.6, n.color, k + 2), d = XI_DATA[n.i], p = self.pitch.P(d.x, d.y);
    ring.setAttribute('transform', 'translate(' + f2(p[0]) + ' ' + f2(p[1]) + ')');
    var t = self.pitch.addHand(n.text, n.color, 3.6, n.rot); placeHand(self.pitch, t, d.x, d.y, n.dx, n.dy);
    return { ring: ring, t: t };
  });
  this.list.innerHTML = '';
  this.items = XI_DATA.map(function (d) { var li = document.createElement('li'); li.textContent = (d.n < 10 ? '0' : '') + d.n + ' ' + d.name; self.list.appendChild(li); return li; });
  this.cur = -2; this.update(this.p);
};
XI.prototype.update = function (p) {
  this.p = p; var self = this, idx = -1;
  this.svg.style.setProperty('--draw', E.io(seg(p, 0, .1)).toFixed(3));
  this.players.forEach(function (pl, i) {
    var a = .1 + i * .062, t = seg(p, a, a + .075), e = E.o(t), d = XI_DATA[i];
    if (p >= a) idx = i;
    pl.set(lerp(52.5, d.x, e), lerp(-13, d.y, e), lerp(2.6, 1, e));
    pl.g.style.opacity = t > 0 ? 1 : 0;
    pl.g.classList.toggle('key', t > 0 && t < 1);
    self.items[i].classList.toggle('on', t > 0);
  });
  this.links.forEach(function (ln, k) {
    var t = E.o(seg(p, .79 + k * .005, .85 + k * .005)), a = XI_DATA[XI_LINKS[k][0]], b = XI_DATA[XI_LINKS[k][1]];
    ln.setAttribute('d', 'M' + self.pitch.S(a.x, a.y) + 'L' + self.pitch.S(lerp(a.x, b.x, t), lerp(a.y, b.y, t)));
    ln.style.opacity = t > 0 ? .7 : 0;
  });
  this.notes.forEach(function (n, k) {
    var a = .885 + k * .026;
    n.ring.setAttribute('stroke-dashoffset', (1 - E.io(seg(p, a, a + .03))).toFixed(3));
    n.t.setAttribute('opacity', seg(p, a + .022, a + .03).toFixed(2));
  });
  if (idx !== this.cur) {
    this.cur = idx;
    var d = XI_DATA[idx];
    this.num.textContent = d ? d.n : 'XI';
    this.nm.textContent = d ? d.full.split(' ').slice(1).join(' ') : 'Belgium';
    this.role.textContent = d ? d.role : 'Eleven names · one shape';
    this.items.forEach(function (li, i) { li.classList.toggle('cur', i === idx); });
    if (!document.documentElement.classList.contains('rm')) {
      [this.num, this.nm].forEach(function (el) { el.classList.remove('slam'); void el.offsetWidth; el.classList.add('slam'); });
    }
  }
};

/* ───────── Signature 02 — animated replays ───────── */
function Replay(scene, cfg) {
  this.scene = scene; this.cfg = cfg; this.svg = scene.querySelector('svg.pitch');
  this.steps = [].slice.call(scene.querySelectorAll('[data-step]'));
  this.p = 0; this.build();
}
Replay.orient = function () { return (window.innerWidth < 820 || window.innerWidth < window.innerHeight) ? 'v' : 'h'; };
Replay.prototype.build = function () {
  var self = this, cfg = this.cfg, big = Replay.orient() === 'v';
  this.o = Replay.orient();
  this.pitch = new Pitch(this.svg, { orient: this.o, big: big, edge: cfg.edge.map(function (e) { return big ? e.replace('→', '↑') : e; }) });
  this.by = {};
  this.actors = cfg.actors.map(function (a) {
    var pl = self.pitch.addPlayer({ n: a.n, name: a.name, cls: a.cls, label: big && a.vlabel ? a.vlabel : a.label });
    var o = { a: a, pl: pl }; if (a.id) self.by[a.id] = o; return o;
  });
  // run arrows (red, hand-drawn, slightly ahead of the runner)
  this.runs = this.actors.filter(function (o) { return o.a.run; }).map(function (o, k) {
    var N = 44, pts = [], pts2 = [];
    for (var i = 0; i <= N; i++) {
      var t = lerp(o.a.run[0], o.a.run[1], i / N), q = self.pos(o, t), s = self.pitch.P(q[0], q[1]);
      var fade = Math.sin(i / N * Math.PI);
      pts.push([s[0] + noise(i, k + 1) * .5 * fade, s[1] + noise(i, k + 9) * .5 * fade]);
      pts2.push([s[0] + noise(i, k + 21) * .7 * fade, s[1] + noise(i, k + 33) * .7 * fade]);
    }
    return { o: o, N: N, pts: pts, pts2: pts2, a: mk('path', { 'class': 'run' }, self.pitch.g.trails), b: mk('path', { 'class': 'run b' }, self.pitch.g.trails), head: mk('path', { 'class': 'run' }, self.pitch.g.trails) };
  });
  this.passes = cfg.ball.map(function (b) {
    if (b.type === 'pass') return mk('path', { 'class': 'pass' }, self.pitch.g.trails);
    if (b.trail) return mk('polyline', { 'class': 'carry' }, self.pitch.g.trails);
    return null;
  });
  this.glow = mk('circle', { 'class': 'glow', r: big ? 6 : 5 }, this.pitch.g.notes);
  this.notes = (cfg.notes || []).map(function (n, k) {
    var o = { n: n };
    if (n.ring) o.el = self.pitch.addRing(n.r || (big ? 5 : 4.2), n.color || 'y', k + 3);
    else o.el = self.pitch.addHand(n.text, n.color || 'y', big ? (n.size || 3) * 1.25 : (n.size || 3), n.rot);
    return o;
  });
  this.ballRing = mk('circle', { 'class': 'ballring', r: big ? 2.2 : 1.8 }, this.pitch.g.ball);
  this.ball = mk('circle', { 'class': 'ball', r: big ? 1.25 : 1 }, this.pitch.g.ball);
  this.locate(); this.update(this.p);
};
// Catmull-Rom through timed keys [t, x, y]
Replay.prototype.pos = function (o, t) {
  var k = o.a.keys, n = k.length;
  if (t <= k[0][0]) return [k[0][1], k[0][2]];
  if (t >= k[n - 1][0]) return [k[n - 1][1], k[n - 1][2]];
  var i = 0; while (i < n - 2 && t > k[i + 1][0]) i++;
  var p1 = k[i], p2 = k[i + 1];
  if (p1[1] === p2[1] && p1[2] === p2[2]) return [p1[1], p1[2]];
  var p0 = k[Math.max(0, i - 1)], p3 = k[Math.min(n - 1, i + 2)], u = (t - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
  var cr = function (a, b, c, d) { return .5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3); };
  return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
};
Replay.prototype.end = function (ref, t, off) {
  if (typeof ref !== 'string') return ref;
  var q = this.pos(this.by[ref], t); off = off || [0, 0];
  return [q[0] + off[0], q[1] + off[1]];
};
Replay.prototype.ballAt = function (t) {
  var B = this.cfg.ball, b = B[0];
  for (var i = 0; i < B.length; i++) { if (t >= B[i].t[0]) b = B[i]; }
  var tt = clamp(t, b.t[0], b.t[1]);
  if (b.type === 'carry') return this.end(b.who, tt, b.off);
  var u = seg(tt, b.t[0], b.t[1]), A = this.end(b.from, b.t[0], b.foff), Z = this.end(b.to, b.t[1], b.toff);
  u = b.shot ? u * u : 1 - Math.pow(1 - u, 1.6);
  if (b.bend) { var C = [(A[0] + Z[0]) / 2 + b.bend[0], (A[1] + Z[1]) / 2 + b.bend[1]], v = 1 - u; return [v * v * A[0] + 2 * v * u * C[0] + u * u * Z[0], v * v * A[1] + 2 * v * u * C[1] + u * u * Z[1]]; }
  return [lerp(A[0], Z[0], u), lerp(A[1], Z[1], u)];
};
Replay.prototype.tOf = function (p) {
  var m = this.cfg.map;
  for (var i = 1; i < m.length; i++) if (p <= m[i][0]) return lerp(m[i - 1][1], m[i][1], seg(p, m[i - 1][0], m[i][0]));
  return m[m.length - 1][1];
};
Replay.prototype.locate = function () {
  // where the goal sits on screen: origin of the photographic reveal
  try {
    var g = this.pitch.P(this.cfg.goal[0], this.cfg.goal[1]), pt = this.svg.createSVGPoint(); pt.x = g[0]; pt.y = g[1];
    var s = pt.matrixTransform(this.svg.getScreenCTM()), r = this.scene.querySelector('.pin').getBoundingClientRect();
    this.scene.style.setProperty('--gx', (s.x - r.left).toFixed(0) + 'px');
    this.scene.style.setProperty('--gy', (s.y - r.top).toFixed(0) + 'px');
  } catch (e) { /* not laid out yet */ }
};
Replay.prototype.update = function (p) {
  this.p = p;
  var self = this, cfg = this.cfg, t = this.tOf(p), P = this.pitch, F = cfg.fx, st = this.scene.style;
  var dis = seg(p, F.dis[0], F.dis[1]);
  this.svg.style.setProperty('--draw', (E.io(seg(p, 0, cfg.map[1][0])) * (1 - dis)).toFixed(3));

  this.actors.forEach(function (o) {
    var q = self.pos(o, t);
    o.pl.set(q[0] + (o.a.cls ? 0 : noise(o.a.n || 1, 3) * dis * 14), q[1] + (o.a.cls ? 0 : noise(o.a.n || 1, 5) * dis * 14), 1 + dis * .6);
    o.pl.g.style.opacity = seg(p, cfg.map[1][0] * .5, cfg.map[1][0]);
  });

  var bp = this.ballAt(t), bs = P.P(bp[0], bp[1]);
  this.ball.setAttribute('cx', f2(bs[0])); this.ball.setAttribute('cy', f2(bs[1]));
  this.ballRing.setAttribute('cx', f2(bs[0])); this.ballRing.setAttribute('cy', f2(bs[1]));
  this.ball.style.opacity = this.ballRing.style.opacity = seg(p, cfg.map[1][0] * .7, cfg.map[1][0]);

  cfg.ball.forEach(function (b, i) {
    var el = self.passes[i]; if (!el) return;
    if (t <= b.t[0]) { el.style.opacity = 0; return; }
    el.style.opacity = 1;
    var tt = Math.min(t, b.t[1]);
    if (b.type === 'pass') {
      var A = self.end(b.from, b.t[0], b.foff), Z = self.ballAt(tt);
      if (b.bend) {
        var full = self.end(b.to, b.t[1], b.toff), C = [(A[0] + full[0]) / 2 + b.bend[0], (A[1] + full[1]) / 2 + b.bend[1]];
        var u = seg(tt, b.t[0], b.t[1]); u = 1 - Math.pow(1 - u, 1.6);
        el.setAttribute('d', 'M' + P.S(A[0], A[1]) + 'Q' + P.S(lerp(A[0], C[0], u), lerp(A[1], C[1], u)) + ' ' + P.S(Z[0], Z[1]));
      } else el.setAttribute('d', 'M' + P.S(A[0], A[1]) + 'L' + P.S(Z[0], Z[1]));
    } else {
      var pts = [];
      for (var k = b.t[0]; k < tt; k += 1) { var q = self.ballAt(k); pts.push(P.S(q[0], q[1]).replace(' ', ',')); }
      var e = self.ballAt(tt); pts.push(P.S(e[0], e[1]).replace(' ', ','));
      el.setAttribute('points', pts.join(' '));
    }
  });

  this.runs.forEach(function (r) {
    var lead = seg(t + 7, r.o.a.run[0], r.o.a.run[1]), k = Math.floor(lead * r.N);
    if (t < r.o.a.run[0] - 4 || k < 2) { r.a.style.opacity = r.b.style.opacity = r.head.style.opacity = 0; return; }
    r.a.style.opacity = r.head.style.opacity = 1; r.b.style.opacity = .6;
    var d = '', d2 = '';
    for (var i = 0; i <= k; i++) { d += (i ? 'L' : 'M') + f2(r.pts[i][0]) + ' ' + f2(r.pts[i][1]); d2 += (i ? 'L' : 'M') + f2(r.pts2[i][0]) + ' ' + f2(r.pts2[i][1]); }
    r.a.setAttribute('d', d); r.b.setAttribute('d', d2);
    var T = r.pts[k], Q = r.pts[Math.max(0, k - 3)], dx = T[0] - Q[0], dy = T[1] - Q[1], len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    r.head.setAttribute('d', 'M' + f2(T[0] - dx * 2.2 - dy * 1.2) + ' ' + f2(T[1] - dy * 2.2 + dx * 1.2) + 'L' + f2(T[0]) + ' ' + f2(T[1]) + 'L' + f2(T[0] - dx * 2.2 + dy * 1.3) + ' ' + f2(T[1] - dy * 2.2 - dx * 1.3));
  });

  var glow = 0;
  this.notes.forEach(function (o) {
    var n = o.n, vis = p >= n.p[0] && (n.end == null || p < n.end), at = typeof n.at === 'string' ? self.pos(self.by[n.at], t) : n.at;
    if (n.ring) {
      var s = P.P(at[0], at[1]);
      o.el.setAttribute('transform', 'translate(' + f2(s[0]) + ' ' + f2(s[1]) + ')');
      o.el.setAttribute('stroke-dashoffset', vis ? (1 - E.io(seg(p, n.p[0], n.p[1]))).toFixed(3) : 1);
      if (n.glow && vis) glow = Math.max(glow, seg(p, n.p[0], n.p[1]) * .22);
      if (n.glow && vis) { self.glow.setAttribute('cx', f2(s[0])); self.glow.setAttribute('cy', f2(s[1])); }
    } else {
      var big = self.o === 'v', off = big && n.voff ? n.voff : (n.off || [0, 0]);
      placeHand(P, o.el, at[0], at[1], off[0], off[1]);
      o.el.setAttribute('opacity', vis ? seg(p, n.p[0], n.p[1]).toFixed(2) : 0);
    }
  });
  this.glow.style.opacity = glow;

  this.steps.forEach(function (li, i) { var r = cfg.steps[i]; li.classList.toggle('on', p >= r[0] && p < r[1]); });

  var fl = F.flash, flash = p < fl[1] ? seg(p, fl[0], fl[1]) : 1 - seg(p, fl[1], fl[2]);
  var rev = E.io(seg(p, F.rev[0], F.rev[1]));
  st.setProperty('--flash', (flash * .92).toFixed(3));
  st.setProperty('--dis', dis.toFixed(3));
  st.setProperty('--rev', rev.toFixed(3));
  st.setProperty('--rev-vis', rev > 0 ? 'visible' : 'hidden');
  st.setProperty('--ty1', E.o(seg(p, F.ty1[0], F.ty1[1])).toFixed(3));
  st.setProperty('--ty2', E.o(seg(p, F.ty2[0], F.ty2[1])).toFixed(3));
  st.setProperty('--ty3', E.o(seg(p, F.ty3[0], F.ty3[1])).toFixed(3));
  if (F.flood) st.setProperty('--fl', E.io(seg(p, F.flood[0], F.flood[1])).toFixed(3));
};

/* ───────── Belgium 3–2 Japan · Chadli 90+4′ ─────────
   Sequence as it happened: Honda's corner → Courtois catches → rolls out to De Bruyne →
   De Bruyne carries across halfway → Meunier, free on the right because Lukaku's run
   dragged his marker inside → low first-time cross → Lukaku steps over → Chadli scores.
   Positions and timings are approximate; opponents other than Honda and Kawashima are unnamed. */
var CHADLI = {
  edge: ['Rostov Arena · 02.07.2018', 'BEL attacking →'], goal: [105, 33],
  actors: [
    { id: 'gk', n: 1, name: 'Courtois', label: 'l', vlabel: 'b', keys: [[0, 3, 34], [5, 4, 35], [9, 7, 37], [16, 15, 38], [80, 15, 38]] },
    { id: 'kdb', n: 7, name: 'De Bruyne', label: 't', vlabel: 'l', keys: [[0, 18, 41], [9, 19, 40], [21, 31, 38], [36, 47, 37], [52, 61, 38], [66, 70, 40], [80, 75, 41]] },
    { id: 'luk', n: 9, name: 'Lukaku', label: 'b', vlabel: 'r', run: [18, 72], keys: [[0, 50, 47], [18, 51, 47], [34, 66, 43], [50, 80, 38.5], [64, 89, 38], [72, 93.2, 38.7], [80, 94.5, 39.4]] },
    { id: 'meu', n: 15, name: 'Meunier', label: 'b', vlabel: 'r', run: [10, 60], keys: [[0, 11, 52], [10, 12, 53], [28, 38, 59], [44, 63, 61], [60, 86.5, 57], [80, 89.5, 56]] },
    { id: 'cha', n: 22, name: 'Chadli', label: 't', vlabel: 'l', run: [10, 75], keys: [[0, 8, 25], [10, 9, 25], [28, 33, 23], [44, 58, 23], [58, 79, 25], [70, 92, 29.5], [75, 96.5, 31.5], [80, 99, 32]] },
    { cls: 'mate', keys: [[0, 5, 30]] }, { cls: 'mate', keys: [[0, 8, 34.5]] }, { cls: 'mate', keys: [[0, 6, 39.5]] },
    { cls: 'mate', keys: [[0, 10, 43]] }, { cls: 'mate', keys: [[0, 12.5, 30.5]] }, { cls: 'mate', keys: [[0, 14, 46]] },
    { cls: 'opp', name: 'Honda', label: 'l', vlabel: 't', keys: [[0, 1, 66.8]] },
    { cls: 'opp', keys: [[0, 6.5, 32.5]] }, { cls: 'opp', keys: [[0, 9, 36.5]] }, { cls: 'opp', keys: [[0, 7.5, 41.5]] },
    { cls: 'opp', keys: [[0, 11, 33.5], [12, 12, 33], [75, 86, 28.5]] },
    { cls: 'opp', keys: [[0, 12, 40], [14, 13, 40], [75, 72, 41]] },
    { cls: 'opp', keys: [[0, 21, 35], [16, 22, 35], [75, 63, 36]] },
    { id: 'd1', cls: 'opp', keys: [[0, 56, 37], [21, 58, 37], [52, 79, 37], [62, 87, 39.5], [80, 91, 42]] },
    { id: 'd2', cls: 'opp', keys: [[0, 54, 49], [18, 55, 49], [34, 69, 45], [50, 81, 41.5], [60, 86, 50], [66, 88.5, 53.5], [80, 89.5, 53.5]] },
    { id: 'd3', cls: 'opp', keys: [[0, 62, 25], [21, 64, 25], [50, 82, 28], [64, 90, 34], [72, 94.4, 36.4], [80, 95.2, 37]] },
    { id: 'kaw', cls: 'opp', name: 'Kawashima', label: 'b', vlabel: 't', keys: [[0, 101, 34], [52, 102, 34.5], [66, 103, 36], [74, 103.4, 36.4], [80, 103.4, 35]] }
  ],
  ball: [
    { t: [0, 9], type: 'pass', from: [.6, 67.4], to: 'gk', bend: [7, 6] },
    { t: [9, 16], type: 'carry', who: 'gk', off: [.8, .6] },
    { t: [16, 21], type: 'pass', from: 'gk', foff: [.8, .6], to: 'kdb', toff: [1.6, .3] },
    { t: [21, 52], type: 'carry', who: 'kdb', off: [1.6, .3], trail: true },
    { t: [52, 60], type: 'pass', from: 'kdb', foff: [1.6, .3], to: 'meu', toff: [.8, -1] },
    { t: [60, 62], type: 'carry', who: 'meu', off: [.8, -1] },
    { t: [62, 75], type: 'pass', from: 'meu', foff: [.8, -1], to: 'cha', toff: [.6, .8] },
    { t: [75, 76.5], type: 'carry', who: 'cha', off: [.6, .8] },
    { t: [76.5, 80], type: 'pass', from: 'cha', foff: [.6, .8], to: [106.2, 33.4], shot: true }
  ],
  map: [[0, 0], [.05, 0], [.14, 9], [.165, 9], [.25, 21], [.40, 52], [.445, 52], [.50, 60], [.515, 60.5], [.60, 72], [.645, 72], [.685, 76.5], [.715, 80], [1, 80]],
  steps: [[.05, .165], [.165, .25], [.25, .40], [.40, .515], [.515, .645], [.645, .76]],
  notes: [
    { ring: 1, at: 'gk', color: 'y', p: [.135, .16], end: .27 },
    { text: 'caught.', at: 'gk', off: [-2, -9], voff: [13, 5], color: 'y', p: [.15, .165], end: .27 },
    { text: 'they back off', at: 'd1', off: [6, -6], voff: [-13, -4], color: 'r', p: [.31, .33], end: .40 },
    { ring: 1, at: 'luk', color: 'r', p: [.40, .43], end: .52 },
    { text: 'takes one with him', at: 'luk', off: [4, -8], voff: [-15, -5], color: 'r', size: 2.8, p: [.415, .435], end: .52 },
    { ring: 1, at: [84, 59], r: 7, color: 'y', p: [.42, .445], end: .52 },
    { text: 'space', at: [84, 59], off: [-13, 2], voff: [0, 11], color: 'y', p: [.43, .445], end: .52 },
    { ring: 1, at: 'luk', color: 'y', glow: 1, p: [.60, .63], end: .70 },
    { text: 'leaves it!', at: 'luk', off: [-13, 8], voff: [14, 6], color: 'y', size: 3.6, p: [.615, .64], end: .70 },
    { ring: 1, at: 'cha', color: 'r', p: [.685, .71], end: .76 }
  ],
  fx: { flash: [.708, .722, .77], dis: [.74, .83], rev: [.76, .875], ty1: [.83, .88], ty2: [.86, .91], ty3: [.895, .935], flood: [.952, .974] }
};

/* ───────── Brazil 1–2 Belgium · De Bruyne 31′ ─────────
   A cleared Brazil corner → Lukaku wins the ball in his own half and carries ~40 yards →
   pass to De Bruyne on the right → low right-foot shot from the edge of the box across Alisson.
   Opponents other than Alisson are unnamed; supporting runs are indicative. */
var KDB = {
  edge: ['Kazan Arena · 06.07.2018', 'BEL attacking →'], goal: [105, 31.5],
  actors: [
    { id: 'luk', n: 9, name: 'Lukaku', label: 't', vlabel: 'l', keys: [[0, 30, 36], [8, 33, 35], [30, 52, 34], [52, 70, 37], [74, 79, 38]] },
    { id: 'kdb', n: 7, name: 'De Bruyne', label: 'b', vlabel: 'r', run: [8, 60], keys: [[0, 44, 48], [8, 46, 48], [30, 62, 50], [52, 76, 47.5], [60, 80, 46.6], [66, 84.5, 45.5], [74, 86, 45.2]] },
    { cls: 'mate', keys: [[0, 40, 60], [8, 42, 60], [66, 80, 62]] }, { cls: 'mate', keys: [[0, 42, 18], [8, 44, 18], [66, 74, 20]] },
    { cls: 'mate', keys: [[0, 20, 30]] }, { cls: 'mate', keys: [[0, 16, 40]] }, { cls: 'mate', keys: [[0, 24, 46]] },
    { cls: 'opp', keys: [[0, 35, 32], [8, 35.5, 33.5], [52, 58, 35]] },
    { cls: 'opp', keys: [[0, 45, 39], [26, 49, 37], [52, 64, 38.5]] },
    { cls: 'opp', keys: [[0, 70, 29], [52, 85, 32], [74, 91, 33]] },
    { cls: 'opp', keys: [[0, 72, 42], [52, 86.5, 41], [66, 89.5, 42.6], [74, 90.5, 42.6]] },
    { cls: 'opp', keys: [[0, 74, 53], [52, 85, 57], [74, 86.5, 57]] },
    { cls: 'opp', name: 'Alisson', label: 'b', vlabel: 't', keys: [[0, 102, 34], [52, 102.4, 35], [66, 102.4, 35.6], [74, 103, 34]] }
  ],
  ball: [
    { t: [0, 8], type: 'pass', from: [13, 41], to: 'luk', toff: [1.4, .3], bend: [2, -5] },
    { t: [8, 52], type: 'carry', who: 'luk', off: [1.4, .3], trail: true },
    { t: [52, 60], type: 'pass', from: 'luk', foff: [1.4, .3], to: 'kdb', toff: [1.2, -.6] },
    { t: [60, 66], type: 'carry', who: 'kdb', off: [1.2, -.6], trail: true },
    { t: [66, 74], type: 'pass', from: 'kdb', foff: [1.2, -.6], to: [106.2, 31.3], shot: true }
  ],
  map: [[0, 0], [.06, 0], [.16, 8], [.19, 8], [.42, 52], [.46, 52], [.54, 60], [.60, 66], [.635, 66], [.70, 74], [1, 74]],
  steps: [[.06, .19], [.19, .46], [.46, .75]],
  notes: [
    { ring: 1, at: 'luk', color: 'y', p: [.16, .185], end: .26 },
    { text: 'turns', at: 'luk', off: [-7, -5], voff: [-11, 2], color: 'y', p: [.17, .19], end: .26 },
    { text: '40 yards', at: [52, 34], off: [0, 9], voff: [-14, 0], color: 'r', size: 3.4, p: [.30, .33], end: .47 },
    { ring: 1, at: 'kdb', color: 'y', glow: 1, p: [.60, .63], end: .72 },
    { text: 'far post', at: [100, 26], off: [-6, -5], voff: [-12, -3], color: 'y', p: [.612, .635], end: .72 }
  ],
  fx: { flash: [.695, .71, .76], dis: [.73, .82], rev: [.75, .875], ty1: [.84, .89], ty2: [.87, .92], ty3: [.91, .955] }
};

export const Board = { Pitch: Pitch, XI: XI, Replay: Replay, CHADLI: CHADLI, KDB: KDB };
