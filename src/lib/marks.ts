/* The marks thrown around a photograph or a word: dry-brush strokes, paper shards, a coach's crosses and noughts,
   a pen line that wanders, a spray of ink, a grid. Each is generated once from a seed, so it is the same on every visit.
   Strokes carry pathLength="1" and their index (--i): the page draws them one after the other.
   Colour classes: m1 yellow · m2 red · m3 black · m4 paper — remapped per section in CSS. */
import { rng } from './rng';

const f = (n: number) => n.toFixed(1);
export type MarkKind = 'brush' | 'shards' | 'tactic' | 'scribble' | 'spray' | 'grid' | 'crosses' | 'speed';
export interface Mark { w: number; h: number; svg: string }

const GEN: Record<MarkKind, (q: () => number, n: number) => [number, number, string]> = {
  /* strokes of a loaded brush, pulled outwards from somewhere near the middle */
  brush(q, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n + (q() - .5) * .09) * Math.PI * 2, r1 = 8 + q() * 26, r2 = 62 + q() * 36, b = (q() - .5) * 26, w = 8 + q() * 15;
      const x1 = 100 + Math.cos(a) * r1, y1 = 100 + Math.sin(a) * r1, x2 = 100 + Math.cos(a) * r2, y2 = 100 + Math.sin(a) * r2;
      const cx = (x1 + x2) / 2 - Math.sin(a) * b, cy = (y1 + y2) / 2 + Math.cos(a) * b;
      s += '<path class="st m' + (1 + (i % 3 === 2 ? 2 : i % 2)) + '" pathLength="1" style="--i:' + i + '" stroke-width="' + f(w) + '" d="M' + f(x1) + ' ' + f(y1) + 'Q' + f(cx) + ' ' + f(cy) + ' ' + f(x2) + ' ' + f(y2) + '"/>';
    }
    return [200, 200, s];
  },
  /* cut paper, all corners: triangles and slivers flying off a centre */
  shards(q, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n + (q() - .5) * .1) * Math.PI * 2, r = 30 + q() * 52, cx = 100 + Math.cos(a) * r, cy = 100 + Math.sin(a) * r * .9, len = 18 + q() * 34, wd = 5 + q() * 16, t = a + (q() - .5) * .9;
      const p = [[cx + Math.cos(t) * len, cy + Math.sin(t) * len], [cx - Math.cos(t) * len * .7 - Math.sin(t) * wd, cy - Math.sin(t) * len * .7 + Math.cos(t) * wd], [cx - Math.cos(t) * len * .5 + Math.sin(t) * wd, cy - Math.sin(t) * len * .5 - Math.cos(t) * wd]];
      s += '<path class="sh m' + (1 + (i % 4 === 3 ? 2 : i % 2)) + '" style="--i:' + i + '" d="M' + p.map((v) => f(v[0]) + ' ' + f(v[1])).join('L') + 'Z"/>';
    }
    return [200, 200, s];
  },
  /* the coach's board: crosses, noughts, a dotted run that ends in an arrow */
  tactic(q) {
    const x = (cx: number, cy: number, i: number) => '<path class="ln m3" pathLength="1" style="--i:' + i + '" d="M' + f(cx - 6) + ' ' + f(cy - 7) + 'L' + f(cx + 7) + ' ' + f(cy + 6) + 'M' + f(cx + 6) + ' ' + f(cy - 6) + 'L' + f(cx - 7) + ' ' + f(cy + 7) + '"/>';
    const o = (cx: number, cy: number, i: number) => '<path class="ln m3" pathLength="1" style="--i:' + i + '" d="M' + f(cx + 7) + ' ' + f(cy) + 'A7 7.6 0 1 1 ' + f(cx + 6.4) + ' ' + f(cy - 2.6) + '"/>';
    const j = () => (q() - .5) * 8;
    return [200, 120, x(22 + j(), 26 + j(), 0) + o(58 + j(), 78 + j(), 1) + x(96 + j(), 40 + j(), 2) + o(140 + j(), 24 + j(), 3) + x(170 + j(), 84 + j(), 4)
      + '<path class="ln dash m2" style="--i:5" d="M24 96C60 112 96 70 118 78S160 104 184 50"/><path class="ln m2" pathLength="1" style="--i:6" d="M170 54 185 48 187 65"/>'];
  },
  /* a pen that never leaves the paper */
  scribble(q, n) {
    const pts: number[][] = [];
    for (let i = 0; i < n; i++) { const a = i * 1.9 + q() * 1.4, r = 28 + q() * 62; pts.push([100 + Math.cos(a) * r * 1.05, 70 + Math.sin(a) * r * .66]); }
    let d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += 'Q' + f(pts[i][0]) + ' ' + f(pts[i][1]) + ' ' + f(m[0]) + ' ' + f(m[1]); }
    return [200, 140, '<path class="ln thin m3" pathLength="1" style="--i:0" d="' + d + '"/>'];
  },
  /* ink thrown off a brush: dense at one side, thinning out */
  spray(q, n) {
    let d = '';
    for (let i = 0; i < n; i++) { const u = Math.pow(q(), 1.8), a = (q() - .5) * 1.5, x = 20 + u * 170, y = 60 + Math.sin(a) * (10 + u * 52), r = (1 - u) * 2.6 + q() * .9 + .3; d += 'M' + f(x - r) + ' ' + f(y) + 'a' + f(r) + ' ' + f(r) + ' 0 1 0 ' + f(r * 2) + ' 0a' + f(r) + ' ' + f(r) + ' 0 1 0 ' + f(-r * 2) + ' 0Z'; }
    return [200, 120, '<path class="sp m3" d="' + d + '"/>'];
  },
  grid(_q, n) {
    let d = '';
    for (let i = 0; i <= n; i++) d += 'M' + f(i * 200 / n) + ' 0V140';
    for (let i = 0; i <= 5; i++) d += 'M0 ' + f(i * 28) + 'H200';
    return [200, 140, '<path class="ln hair m4" d="' + d + '"/>'];
  },
  crosses(q, n) {
    let s = '';
    for (let i = 0; i < n; i++) { const cx = 14 + q() * 172, cy = 12 + q() * 96, k = 4 + q() * 4; s += '<path class="ln m' + (i % 2 ? 3 : 2) + '" pathLength="1" style="--i:' + i + '" d="M' + f(cx - k) + ' ' + f(cy - k) + 'L' + f(cx + k) + ' ' + f(cy + k) + 'M' + f(cx + k) + ' ' + f(cy - k) + 'L' + f(cx - k) + ' ' + f(cy + k) + '"/>'; }
    return [200, 120, s];
  },
  /* speed: a handful of lines, all going the same way, none the same length */
  speed(q, n) {
    let s = '';
    for (let i = 0; i < n; i++) { const y = 8 + i * (104 / n) + (q() - .5) * 5, x1 = q() * 70, x2 = 110 + q() * 88; s += '<path class="ln m3" pathLength="1" style="--i:' + i + '" stroke-width="' + f(1.6 + q() * 3.4) + '" d="M' + f(x1) + ' ' + f(y) + 'L' + f(x2) + ' ' + f(y + (q() - .5) * 3) + '"/>'; }
    return [200, 120, s];
  }
};
const N: Record<MarkKind, number> = { brush: 13, shards: 11, tactic: 0, scribble: 13, spray: 150, grid: 8, crosses: 6, speed: 7 };

export function mark(kind: MarkKind, seed = 1, n?: number): Mark {
  const g = GEN[kind](rng(seed * 7919 + 13), n || N[kind]);
  return { w: g[0], h: g[1], svg: '<svg viewBox="0 0 ' + g[0] + ' ' + g[1] + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + g[2] + '</svg>' };
}
