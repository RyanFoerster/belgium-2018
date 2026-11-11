/* Hand-drawn football illustrations, printed like a two-colour risograph:
   a flat colour laid down slightly out of register, a halftone shade, then the black line on top — and a white keyline
   that never quite sits under it. Every path of the line layer carries pathLength="1", so the drawing can draw itself.
   Pure string builders, like lib/badges.ts: used at build time by <Doodle>, and in the browser by the wall. */
import { rng } from './rng';

interface Art {
  /** viewBox width / height */
  w: number; h: number;
  /** the silhouette: white keyline and colour fill */
  cut: string;
  /** flat colour areas: [class, path] — "f1" the doodle's colour, "f2" its second, "fk" black, "fw" paper, "fy" yellow, "fr" red */
  fills?: [string, string][];
  /** where the halftone shade falls */
  shade?: string;
  /** the ink line, stroke by stroke, in the order they are drawn */
  lines: string[];
  /** a word or a number lettered inside */
  text?: [x: number, y: number, size: number];
}

const f = (n: number) => n.toFixed(1);
/* a circle drawn by hand: never quite round, never quite closed */
function wob(cx: number, cy: number, r: number, seed: number, over = .12): string {
  const q = rng(seed), n = 22; let d = '';
  for (let i = 0; i <= n * (1 + over); i++) {
    const a = -1.9 + i / n * Math.PI * 2, rr = r * (1 + (q() - .5) * .06) * (1 + i / n * .025);
    d += (i ? 'L' : 'M') + f(cx + Math.cos(a) * rr) + ' ' + f(cy + Math.sin(a) * rr);
  }
  return d;
}
function poly(pts: number[][], close = true): string { return pts.map((p, i) => (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1])).join('') + (close ? 'Z' : ''); }
function ring(cx: number, cy: number, r: number, n: number, rot: number): number[][] { const o: number[][] = []; for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }

/* the classic ball: one pentagon in the middle, five spokes, five dark patches on the rim */
function ball(): Art {
  const c = 50, P = ring(c, c, 14.5, 5, -Math.PI / 2), O = ring(c, c, 29, 5, -Math.PI / 2), fills: [string, string][] = [['fk', poly(P)]], lines: string[] = [wob(c, c, 43, 5)];
  lines.push(poly(P));
  P.forEach((p, i) => lines.push(poly([p, O[i]], false)));
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + .5) / 5 * Math.PI * 2, s = .33;
    const patch = [[c + Math.cos(a - s) * 31, c + Math.sin(a - s) * 31], [c + Math.cos(a) * 26, c + Math.sin(a) * 26], [c + Math.cos(a + s) * 31, c + Math.sin(a + s) * 31], [c + Math.cos(a + s * .82) * 42, c + Math.sin(a + s * .82) * 42], [c + Math.cos(a) * 43.5, c + Math.sin(a) * 43.5], [c + Math.cos(a - s * .82) * 42, c + Math.sin(a - s * .82) * 42]];
    fills.push(['fk', poly(patch)]);
    lines.push(poly([O[i], patch[0]], false) + poly([O[(i + 1) % 5], patch[2]], false));
  }
  return { w: 100, h: 100, cut: 'M50 7A43 43 0 1 1 50 93A43 43 0 1 1 50 7Z', fills, shade: 'M88 34A43 43 0 0 1 28 87A52 52 0 0 0 88 34Z', lines };
}
/* a comic explosion: spikes of uneven length, a second one inside */
function burst(seed = 3): Art {
  const q = rng(seed), n = 13, mk = (R: number, r: number) => { const p: number[][] = []; for (let i = 0; i < n * 2; i++) { const a = -1.4 + i / (n * 2) * Math.PI * 2, rr = (i % 2 ? r : R) * (.82 + q() * .3); p.push([60 + Math.cos(a) * rr * 1.18, 50 + Math.sin(a) * rr * .96]); } return poly(p); };
  const out = mk(46, 27), inn = mk(30, 17);
  return { w: 120, h: 100, cut: out, fills: [['f1', out], ['f2', inn]], lines: [out, inn] };
}

const ART: Record<string, () => Art> = {
  ball,
  burst: () => burst(3),
  boot: () => ({
    w: 124, h: 84, cut: 'M14 14C22 7 35 8 43 13L51 31C68 34 90 38 106 45 119 51 118 64 107 64L18 64C7 64 5 49 8 38Z',
    fills: [['f1', 'M14 14C22 7 35 8 43 13L51 31C68 34 90 38 106 45 119 51 118 64 107 64L18 64C7 64 5 49 8 38Z'], ['fk', 'M10 56H115C116 62 112 64 107 64H18C13 64 10 61 10 56Z'], ['fw', 'M27 46 35 37 41 47 49 38 53 44 46 52 40 55 33 50Z']],
    shade: 'M52 31C68 34 90 38 106 45 113 48 116 53 115 56H70C66 46 60 38 52 31Z',
    lines: ['M14 14C22 7 35 8 43 13L51 31C68 34 90 38 106 45 119 51 118 64 107 64L18 64C7 64 5 49 8 38Z', 'M10 56H115', 'M22 64v8h9v-8M45 64v8h9v-8M71 64v8h9v-8M93 64v8h9v-8', 'M53 31 61 23M61 33 69 25M69 36 77 28', 'M27 46 35 37 41 47 49 38', 'M14 14C20 20 30 22 43 13']
  }),
  glove: () => ({
    w: 86, h: 112, cut: 'M21 106 21 63C12 56 6 44 11 36 16 29 24 34 26 43L26 22C26 11 38 11 38 22L38 14C38 3 50 3 50 14L50 18C50 7 62 7 62 18L62 27C62 17 74 17 74 28L74 62C74 75 68 83 66 89L66 106Z',
    fills: [['f1', 'M21 106 21 63C12 56 6 44 11 36 16 29 24 34 26 43L26 22C26 11 38 11 38 22L38 14C38 3 50 3 50 14L50 18C50 7 62 7 62 18L62 27C62 17 74 17 74 28L74 62C74 75 68 83 66 89L66 106Z'], ['f2', 'M21 90H66V106H21Z']],
    shade: 'M62 27C62 17 74 17 74 28L74 62C74 75 68 83 66 89H50C58 76 62 60 62 27Z',
    lines: ['M21 106 21 63C12 56 6 44 11 36 16 29 24 34 26 43L26 22C26 11 38 11 38 22L38 14C38 3 50 3 50 14L50 18C50 7 62 7 62 18L62 27C62 17 74 17 74 28L74 62C74 75 68 83 66 89L66 106Z', 'M21 90H66', 'M38 22V47M50 18V47M62 27V47', 'M30 60C40 53 56 53 66 60', 'M28 98H40M46 98H60']
  }),
  medal: () => ({
    w: 80, h: 112, cut: 'M16 3H36L40 18 44 3H64L50 48A27 27 0 1 1 30 48Z',
    fills: [['fr', 'M16 3H36L48 48H32Z'], ['fk', 'M64 3H44L32 48H48Z'], ['f1', 'M40 46A27 27 0 1 1 40 100A27 27 0 1 1 40 46Z']],
    shade: 'M62 58A27 27 0 0 1 26 96A32 32 0 0 0 62 58Z',
    lines: ['M16 3H36L48 48', 'M64 3H44L32 48', 'M16 3 30 50M64 3 50 50', wob(40, 73, 27, 9), wob(40, 73, 20, 14, .05)],
    text: [40, 84, 30]
  }),
  cup: () => ({
    w: 92, h: 112, cut: 'M22 8H70V20C88 16 88 44 66 44 62 56 54 62 50 63V82H64V92H70V104H22V92H28V82H42V63C38 62 30 56 26 44 4 44 4 16 22 20Z',
    fills: [['f1', 'M22 8H70V34C70 52 57 63 46 63S22 52 22 34Z'], ['f1', 'M42 63H50V82H42Z'], ['f2', 'M28 82H64V92H28ZM22 92H70V104H22Z']],
    shade: 'M58 8H70V34C70 52 57 63 46 63 56 54 58 40 58 8Z',
    lines: ['M22 8H70V34C70 52 57 63 46 63S22 52 22 34Z', 'M22 18C5 15 5 43 26 43M70 18C87 15 87 43 66 43', 'M42 63V82M50 63V82', 'M28 82H64V92H28ZM22 92H70V104H22Z', 'M32 16V34'],
  }),
  flame: () => ({
    w: 100, h: 104, cut: 'M50 98C24 98 13 75 26 54 30 64 36 64 38 58 30 36 48 20 52 5 56 26 79 38 77 66 83 62 85 54 83 48 97 71 81 98 50 98Z',
    fills: [['f1', 'M50 98C24 98 13 75 26 54 30 64 36 64 38 58 30 36 48 20 52 5 56 26 79 38 77 66 83 62 85 54 83 48 97 71 81 98 50 98Z'], ['f2', 'M50 92C37 92 33 79 42 66 46 72 50 70 50 61 61 70 67 84 50 92Z']],
    lines: ['M50 98C24 98 13 75 26 54 30 64 36 64 38 58 30 36 48 20 52 5 56 26 79 38 77 66 83 62 85 54 83 48 97 71 81 98 50 98Z', 'M50 92C37 92 33 79 42 66 46 72 50 70 50 61 61 70 67 84 50 92Z']
  }),
  bolt: () => ({ w: 100, h: 104, cut: 'M60 4 16 58H44L32 100 86 42H56Z', fills: [['f1', 'M60 4 16 58H44L32 100 86 42H56Z']], shade: 'M56 42H86L32 100 50 52Z', lines: ['M60 4 16 58H44L32 100 86 42H56Z'] }),
  star: () => ({ w: 100, h: 100, cut: 'M51 5 62 36 96 38 69 58 79 93 50 73 20 92 31 58 5 37 39 36Z', fills: [['f1', 'M51 5 62 36 96 38 69 58 79 93 50 73 20 92 31 58 5 37 39 36Z']], shade: 'M62 36 96 38 69 58 79 93 50 73 58 52Z', lines: ['M51 5 62 36 96 38 69 58 79 93 50 73 20 92 31 58 5 37 39 36Z'] }),
  arrow: () => ({ w: 108, h: 80, cut: 'M5 66C28 28 60 18 84 26L80 8 103 35 74 50 79 36C60 31 36 40 17 72Z', fills: [['f1', 'M5 66C28 28 60 18 84 26L80 8 103 35 74 50 79 36C60 31 36 40 17 72Z']], lines: ['M5 66C28 28 60 18 84 26L80 8 103 35 74 50 79 36C60 31 36 40 17 72Z'] }),
  crown: () => ({ w: 100, h: 86, cut: 'M10 80 5 26 30 50 50 10 70 50 95 26 90 80Z', fills: [['f1', 'M10 80 5 26 30 50 50 10 70 50 95 26 90 80Z'], ['f2', 'M10 68H90V80H10Z']], lines: ['M10 80 5 26 30 50 50 10 70 50 95 26 90 80Z', 'M11 68H89', 'M5 26v-1M50 10v-1M95 26v-1'] }),
  flag: () => ({
    w: 100, h: 112, cut: 'M10 4H18V10C36 2 52 20 72 12S94 10 94 10V54C78 48 64 64 46 56S18 56 18 56V108H10Z',
    fills: [['fk', 'M18 10C27 6 35 8 43 12V55C35 51 27 52 18 56Z'], ['fy', 'M43 12C52 16 60 17 68 13V59C60 62 52 59 43 55Z'], ['fr', 'M68 13C80 9 94 10 94 10V54C82 50 76 55 68 59Z'], ['fw', 'M10 4H18V108H10Z']],
    lines: ['M10 4H18V108H10Z', 'M18 10C36 2 52 20 72 12S94 10 94 10V54C78 48 64 64 46 56S18 56 18 56', 'M43 12V55M68 13V59']
  }),
  megaphone: () => ({
    w: 112, h: 96, cut: 'M8 42 62 16V86L8 62ZM20 66 24 90H38L34 72Z',
    fills: [['f1', 'M8 42 62 16V86L8 62Z'], ['f2', 'M20 66 24 90H38L34 72Z'], ['fw', 'M62 28C78 32 78 70 62 74Z']],
    shade: 'M34 30 62 16V50Z',
    lines: ['M8 42 62 16V86L8 62Z', 'M62 28C78 32 78 70 62 74', 'M20 66 24 90H38L34 72', 'M22 36V68', 'M84 30 100 18M88 51H108M84 72 100 84']
  }),
  goal: () => ({
    w: 124, h: 96, cut: 'M4 92V8H120V92H112V16H12V92Z',
    fills: [['fw', 'M4 92V8H120V92H112V16H12V92Z']],
    lines: ['M4 92V8H120V92', 'M12 92V16H112V92', 'M30 16V86M48 16V86M66 16V86M84 16V86M100 16V86', 'M12 32H112M12 48H112M12 64H112M12 80H112']
  })
};

export type DoodleName = 'ball' | 'burst' | 'boot' | 'glove' | 'medal' | 'cup' | 'flame' | 'bolt' | 'star' | 'arrow' | 'crown' | 'flag' | 'megaphone' | 'goal';
export interface Drawing { w: number; h: number; svg: string }

export function doodle(name: string, text = ''): Drawing {
  const a = (ART[name] || ART.star)(), w = a.w + 16, h = a.h + 16;
  const fills = (a.fills || []).map((q) => '<path class="' + q[0] + '" d="' + q[1] + '"/>').join('');
  const lines = a.lines.map((d, i) => '<path pathLength="1" style="--i:' + i + '" d="' + d + '"/>').join('');
  const t = text && a.text ? '<text class="dd-t" x="' + a.text[0] + '" y="' + a.text[1] + '" font-size="' + a.text[2] + '">' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text>' : '';
  return {
    w, h,
    svg: '<svg viewBox="-8 -8 ' + w + ' ' + h + '" aria-hidden="true"><path class="dd-w" d="' + a.cut + '"/><g class="dd-f">' + fills + '</g>' + (a.shade ? '<path class="dd-h" fill="url(#ht)" d="' + a.shade + '"/>' : '') + '<g class="dd-l">' + lines + '</g>' + t + '</svg>'
  };
}
