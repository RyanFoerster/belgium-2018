import { Board } from '../pitch.js';

/* The loader's tactical drawing: one of Belgium's goals of 2018, drawn on a yellow sheet in black ink (the Belgian players
   in red, the move's own players in black, the ball's path in red) and played by the loading of the page: t goes from 0 to
   the goal's T. A goal is drawn at random on every visit (GOALS below).
   The two goals replayed in chapters 04 and 05 keep the replay's own positions (scripts/pitch.js); the three others follow
   the move as it happened — who passed to whom, from which side, how it was finished — with positions that are indicative,
   like the supporting runs of the replays. Opponents are unnamed except the goalkeepers. */
var NS = 'http://www.w3.org/2000/svg';
function mk(tag, at, parent) { var n = document.createElementNS(NS, tag); for (var k in at) n.setAttribute(k, at[k]); if (parent) parent.appendChild(n); return n; }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function f2(n) { return n.toFixed(2); }

// where an actor stands at t (Catmull-Rom through its keys, as on the replay board)
function pos(keys, t) {
  var n = keys.length;
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  if (t >= keys[n - 1][0]) return [keys[n - 1][1], keys[n - 1][2]];
  var i = 0; while (i < n - 2 && t > keys[i + 1][0]) i++;
  var p1 = keys[i], p2 = keys[i + 1];
  if (p1[1] === p2[1] && p1[2] === p2[2]) return [p1[1], p1[2]];
  var p0 = keys[Math.max(0, i - 1)], p3 = keys[Math.min(n - 1, i + 2)], u = (t - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
  var cr = function (a, b, c, d) { return .5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3); };
  return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])];
}

var mate = function (k) { return { cls: 'mate', keys: k }; }, opp = function (k) { return { cls: 'opp', keys: k }; };
// every goal: the move (actors, ball), what is written on it and when (notes, in t), and the words round the sheet
export var GOALS = [
  { key: 'chadli', m: Board.CHADLI, T: 80, trail: 9, min: '90+4′', score: '3—2.', where: 'Rostov, 2 July 2018', cap: 'Rostov Arena · 02.07.2018 · Belgium—Japan', note: 'around ten seconds, box to box',
    notes: [
      { t: 9, ring: 'gk' }, { t: 9.5, text: 'caught.', at: 'gk', off: [-2, -9], voff: [13, 5] },
      { t: 30, text: 'they back off', at: 'd1', off: [6, -6], voff: [-13, -4] },
      { t: 50, ring: 'luk' }, { t: 51, text: 'takes one with him', at: 'luk', off: [4, -8], voff: [-15, -5] },
      { t: 52, ring: [84, 59], r: 7 }, { t: 53, text: 'space', at: [84, 59], off: [-13, 2], voff: [0, 11] },
      { t: 70, text: 'leaves it!', at: 'luk', off: [-13, 8], voff: [14, 6], big: 1 },
      { t: 76, ring: 'cha' }
    ] },
  { key: 'kdb', m: Board.KDB, T: 74, trail: 8, min: '31′', score: '2—0.', where: 'Kazan, 6 July 2018', cap: 'Kazan Arena · 06.07.2018 · Brazil—Belgium', note: 'two—nil to Belgium.',
    notes: [
      { t: 8, ring: 'luk' }, { t: 9, text: 'turns', at: 'luk', off: [-7, -5], voff: [-11, 2] },
      { t: 24, text: '40 yards', at: [52, 34], off: [0, 9], voff: [-14, 0], big: 1 },
      { t: 60, ring: 'kdb' }, { t: 61, text: 'far post', at: [100, 26], off: [-6, -5], voff: [-12, -3] }
    ] },
  // Japan 2—2: Hazard carries it down the left and crosses, Fellaini heads it in
  { key: 'fellaini', T: 48, trail: 0, min: '74′', score: '2—2.', where: 'Rostov, 2 July 2018', cap: 'Rostov Arena · 02.07.2018 · Belgium—Japan', note: 'level, five minutes after the first',
    m: { actors: [
      { id: 'haz', n: 10, name: 'Hazard', label: 'b', vlabel: 'r', run: [0, 24], keys: [[0, 78, 10], [12, 85, 8.5], [24, 90, 9.5], [48, 91, 10]] },
      { id: 'fel', n: 8, name: 'Fellaini', label: 't', vlabel: 'l', run: [0, 40], keys: [[0, 86, 41], [24, 91, 40], [38, 97, 37], [48, 98, 36.5]] },
      mate([[0, 89, 29], [24, 95, 28], [48, 97, 27]]), mate([[0, 68, 26]]), mate([[0, 70, 50], [30, 82, 52]]), mate([[0, 58, 36]]),
      opp([[0, 95, 31], [24, 98, 32.5], [48, 99, 33.5]]), opp([[0, 93, 42], [30, 96, 41], [48, 96.5, 41.5]]), opp([[0, 88, 18], [24, 92, 13], [48, 93, 13.5]]),
      opp([[0, 94, 50]]), opp([[0, 82, 31], [30, 88, 33]]),
      { cls: 'opp', name: 'Kawashima', label: 'b', vlabel: 't', keys: [[0, 103, 34], [40, 103.4, 35], [48, 103, 36]] }
    ], ball: [
      { t: [0, 24], type: 'carry', who: 'haz', off: [1.2, .5] },
      { t: [24, 40], type: 'pass', from: 'haz', foff: [1.2, .5], to: 'fel', toff: [0, -1], bend: [-3, -4] },
      { t: [40, 48], type: 'pass', from: 'fel', foff: [0, -1], to: [106.2, 34.6], shot: true }
    ] },
    notes: [
      { t: 22, ring: 'haz' }, { t: 23, text: 'the cross', at: 'haz', off: [-15, 9], voff: [6, 10] },
      { t: 40, ring: 'fel' }, { t: 41, text: 'header!', at: 'fel', off: [-15, -6], voff: [-14, -4], big: 1 }
    ] },
  // England, third place, 4′: Lukaku finds Chadli on the left, Chadli crosses, Meunier at the far post
  { key: 'meunier', T: 56, trail: 0, min: '4′', score: '1—0.', where: 'Saint Petersburg, 14 July 2018', cap: 'Saint Petersburg Stadium · 14.07.2018 · Belgium—England', note: 'four minutes in',
    m: { actors: [
      { id: 'luk', n: 9, name: 'Lukaku', label: 'b', vlabel: 'l', keys: [[0, 55, 32], [14, 58, 31], [56, 63, 30]] },
      { id: 'cha', n: 22, name: 'Chadli', label: 'b', vlabel: 'r', run: [0, 40], keys: [[0, 70, 13], [14, 78, 9.5], [30, 89, 8.5], [40, 93, 9.5], [56, 94, 10.5]] },
      { id: 'meu', n: 15, name: 'Meunier', label: 't', vlabel: 'l', run: [0, 52], keys: [[0, 72, 58], [14, 82, 58], [30, 92, 57], [44, 99, 54], [52, 101.5, 52], [56, 102, 51.5]] },
      mate([[0, 45, 40]]), mate([[0, 40, 22]]), mate([[0, 80, 36], [44, 96, 33]]),
      opp([[0, 62, 20], [30, 82, 14], [56, 86, 13]]), opp([[0, 75, 31], [44, 96, 30.5]]), opp([[0, 78, 42], [44, 97, 41]]), opp([[0, 80, 51], [44, 96, 49], [56, 98, 49.5]]), opp([[0, 64, 39]]),
      { cls: 'opp', name: 'Pickford', label: 'b', vlabel: 't', keys: [[0, 103, 34], [40, 103, 29], [52, 103.3, 33], [56, 103.5, 34]] }
    ], ball: [
      { t: [0, 14], type: 'pass', from: 'luk', foff: [1.2, .3], to: 'cha', toff: [.6, 1.2], bend: [3, -5] },
      { t: [14, 40], type: 'carry', who: 'cha', off: [.6, 1.2] },
      { t: [40, 52], type: 'pass', from: 'cha', foff: [.6, 1.2], to: 'meu', toff: [-.4, -1] },
      { t: [52, 56], type: 'pass', from: 'meu', foff: [-.4, -1], to: [106.2, 36], shot: true }
    ] },
    notes: [
      { t: 13, ring: 'cha' }, { t: 41, text: 'low across', at: 'cha', off: [-4, 13], voff: [12, 6] },
      { t: 51, ring: 'meu' }, { t: 52, text: 'far post', at: 'meu', off: [-17, 6], voff: [-14, 4], big: 1 }
    ] },
  // England, third place, 82′: De Bruyne's pass, Hazard goes past his man and scores
  { key: 'hazard', T: 50, trail: 0, min: '82′', score: '2—0.', where: 'Saint Petersburg, 14 July 2018', cap: 'Saint Petersburg Stadium · 14.07.2018 · Belgium—England', note: 'third in the world',
    m: { actors: [
      { id: 'kdb', n: 7, name: 'De Bruyne', label: 'b', vlabel: 'l', keys: [[0, 58, 40], [12, 62, 40], [50, 66, 41]] },
      { id: 'haz', n: 10, name: 'Hazard', label: 't', vlabel: 'r', run: [0, 46], keys: [[0, 70, 29], [12, 76, 27], [28, 88, 29], [40, 96, 31], [46, 99, 32], [50, 100, 32.5]] },
      mate([[0, 64, 55], [30, 80, 58]]), mate([[0, 50, 22]]), mate([[0, 74, 46], [30, 90, 44]]), mate([[0, 42, 40]]),
      opp([[0, 80, 33], [28, 90, 31], [40, 96.5, 33.5], [50, 97, 35]]), opp([[0, 82, 42], [40, 95, 40]]), opp([[0, 78, 20], [40, 92, 22]]), opp([[0, 70, 41]]),
      { cls: 'opp', name: 'Pickford', label: 'b', vlabel: 't', keys: [[0, 103, 34], [40, 102, 33], [50, 102.5, 32.6]] }
    ], ball: [
      { t: [0, 12], type: 'pass', from: 'kdb', foff: [1.2, .3], to: 'haz', toff: [1.2, .4] },
      { t: [12, 46], type: 'carry', who: 'haz', off: [1.2, .4] },
      { t: [46, 50], type: 'pass', from: 'haz', foff: [1.2, .4], to: [106.2, 35.4], shot: true }
    ] },
    notes: [
      { t: 1, ring: 'kdb' }, { t: 2, text: 'the pass', at: 'kdb', off: [-5, -7], voff: [-13, -4] },
      { t: 36, text: 'past his man', at: 'haz', off: [-16, -7], voff: [-15, -5], big: 1 }, { t: 46, ring: 'haz' }
    ] }
];

export function drawBoard(svg, orient, G) {
  var M = G.m, NOTES = G.notes, V = orient === 'v', by = {}, acts = [], notes = [], S = function (x, y) { return V ? [y, 105 - x] : [x, y]; };
  var str = function (x, y) { var p = S(x, y); return f2(p[0]) + ' ' + f2(p[1]); };
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute('viewBox', V ? '-6 -6 80 117' : '-6 -6 117 80');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  var gl = mk('g', { 'class': 'tb94-lines' }, svg), gt = mk('g', { 'class': 'tb94-trails' }, svg), gn = mk('g', { 'class': 'tb94-notes' }, svg), gp = mk('g', { 'class': 'tb94-players' }, svg);

  // the pitch, line by line
  var poly = function (pts, close) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + str(p[0], p[1]); }).join('') + (close ? 'Z' : ''); };
  var L = [
    poly([[0, 0], [105, 0], [105, 68], [0, 68]], true), poly([[52.5, 0], [52.5, 68]]),
    'M' + str(43.35, 34) + 'A9.15 9.15 0 1 0 ' + str(61.65, 34) + 'A9.15 9.15 0 1 0 ' + str(43.35, 34),
    poly([[0, 13.84], [16.5, 13.84], [16.5, 54.16], [0, 54.16]]), poly([[105, 13.84], [88.5, 13.84], [88.5, 54.16], [105, 54.16]]),
    poly([[0, 24.84], [5.5, 24.84], [5.5, 43.16], [0, 43.16]]), poly([[105, 24.84], [99.5, 24.84], [99.5, 43.16], [105, 43.16]]),
    'M' + str(16.5, 26.69) + 'A9.15 9.15 0 0 1 ' + str(16.5, 41.31), 'M' + str(88.5, 26.69) + 'A9.15 9.15 0 0 0 ' + str(88.5, 41.31),
    poly([[0, 30.34], [-2, 30.34], [-2, 37.66], [0, 37.66]])
  ];
  L.forEach(function (d, i) { mk('path', { 'class': 'ln', d: d, pathLength: 1, style: '--i:' + i }, gl); });
  var net = mk('path', { 'class': 'ln tb94-net', d: poly([[105, 30.34], [107.4, 30.34], [107.4, 37.66], [105, 37.66]]), pathLength: 1, style: '--i:' + L.length }, gl);

  // the players: the move's five in black with their names, the other Belgians in red, Japan in white
  var k = 0;
  M.actors.forEach(function (a) {
    var key = !!a.id && !a.cls, cls = key ? 'pl key' : 'pl ' + (a.cls === 'opp' ? 'opp' : 'mate');
    if (a.cls === 'opp' && a.id) cls += ' def';
    var g = mk('g', { 'class': cls }, gp), inn = mk('g', { 'class': 'pl-i', style: '--i:' + (k++) }, g);
    mk('circle', { r: key ? 2.3 : 1.7 }, inn);
    if (a.n) mk('text', { 'class': 'num', y: .05 }, inn).textContent = a.n;
    if (key && a.name) {
      var side = V ? a.vlabel : a.label, o = { l: [-3.3, 0, 'end'], r: [3.3, 0, 'start'], t: [0, -3.4, 'middle'], b: [0, 4.4, 'middle'] }[side] || [0, -3.4, 'middle'];
      var nm = mk('text', { 'class': 'nm', x: o[0], y: o[1] + .8, 'text-anchor': o[2] }, inn); nm.textContent = a.name;
    }
    var o2 = { a: a, g: g, still: a.keys.length === 1, trail: null, pts: [] };
    if (a.run) { o2.trail = mk('path', { 'class': 'tb94-run', d: '' }, gt); }
    acts.push(o2); if (a.id) by[a.id] = o2;
  });
  var ball = mk('g', { 'class': 'tb94-ball' }, gp); mk('circle', { r: 1.15 }, ball);
  var trail = mk('path', { 'class': 'tb94-tr', d: '' }, gt), tpts = [];

  function at(ref, t, off) {
    if (typeof ref !== 'string') return ref;
    var q = pos(by[ref].a.keys, t); off = off || [0, 0];
    return [q[0] + off[0], q[1] + off[1]];
  }
  function ballAt(t) {
    var B = M.ball, b = B[0];
    for (var i = 0; i < B.length; i++) if (t >= B[i].t[0]) b = B[i];
    var tt = clamp(t, b.t[0], b.t[1]);
    if (b.type === 'carry') return at(b.who, tt, b.off);
    var u = clamp((tt - b.t[0]) / (b.t[1] - b.t[0]), 0, 1), A = at(b.from, b.t[0], b.foff), Z = at(b.to, b.t[1], b.toff);
    u = b.shot ? u * u : 1 - Math.pow(1 - u, 1.6);
    if (b.bend) { var C = [(A[0] + Z[0]) / 2 + b.bend[0], (A[1] + Z[1]) / 2 + b.bend[1]], v = 1 - u; return [v * v * A[0] + 2 * v * u * C[0] + u * u * Z[0], v * v * A[1] + 2 * v * u * C[1] + u * u * Z[1]]; }
    return [A[0] + (Z[0] - A[0]) * u, A[1] + (Z[1] - A[1]) * u];
  }

  // the notes: rings drawn round a player or a patch of grass, words in the script face
  NOTES.forEach(function (q) {
    var n;
    if (q.ring) {
      n = mk('circle', { 'class': 'tb94-ring', r: q.r || 4, pathLength: 1 }, gn);
    } else {
      n = mk('text', { 'class': 'tb94-hand' + (q.big ? ' big' : '') }, gn); n.textContent = q.text;
    }
    notes.push({ q: q, n: n, on: false });
  });
  function place(t) {
    notes.forEach(function (o) {
      var q = o.q, c = q.ring ? at(q.ring, Math.max(t, q.t)) : at(q.at, Math.max(t, q.t)), off = q.ring ? [0, 0] : (V ? q.voff : q.off), p = S(c[0] + off[0], c[1] + off[1]);
      if (q.ring) { o.n.setAttribute('cx', f2(p[0])); o.n.setAttribute('cy', f2(p[1])); }
      else { o.n.setAttribute('x', f2(p[0])); o.n.setAttribute('y', f2(p[1])); }
    });
  }

  var last = -1;
  function render(t) {
    if (t === last) return; last = t;
    acts.forEach(function (o) {
      if (o.still && o.done) return;
      var q = pos(o.a.keys, t), p = S(q[0], q[1]);
      o.g.setAttribute('transform', 'translate(' + f2(p[0]) + ' ' + f2(p[1]) + ')'); o.done = true;
      if (o.trail && t >= o.a.run[0]) {
        var pp = o.pts[o.pts.length - 1];
        if (!pp || Math.abs(pp[0] - p[0]) + Math.abs(pp[1] - p[1]) > .7) { o.pts.push(p); o.trail.setAttribute('d', 'M' + o.pts.map(function (z) { return f2(z[0]) + ' ' + f2(z[1]); }).join('L')); }
      }
    });
    var bq = ballAt(t), bp = S(bq[0], bq[1]);
    ball.setAttribute('transform', 'translate(' + f2(bp[0]) + ' ' + f2(bp[1]) + ')');
    if (t >= G.trail) {
      var tp = tpts[tpts.length - 1];
      if (!tp || Math.abs(tp[0] - bp[0]) + Math.abs(tp[1] - bp[1]) > .6) { tpts.push(bp); trail.setAttribute('d', 'M' + tpts.map(function (z) { return f2(z[0]) + ' ' + f2(z[1]); }).join('L')); }
    }
    place(t);
    notes.forEach(function (o) { var on = t >= o.q.t; if (on !== o.on) { o.on = on; o.n.classList.toggle('on', on); } });
    net.classList.toggle('hit', t >= G.T - .5);
  }
  render(0);
  // where the ball is on the screen
  function ballPoint() {
    var m = svg.getScreenCTM(), b = ball.transform.baseVal.consolidate();
    if (!m || !b) return null;
    var pt = svg.createSVGPoint(); pt.x = b.matrix.e; pt.y = b.matrix.f; pt = pt.matrixTransform(m);
    return [pt.x, pt.y];
  }
  return { render: render, ballPoint: ballPoint };
}
