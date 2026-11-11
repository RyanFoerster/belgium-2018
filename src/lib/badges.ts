/* Printed stickers: a flat colour slightly out of register with its black keyline, a white edge, a halftone shadow,
   type set tight inside — two passes of a risograph, never quite aligned.
   One small generator per shape. Pure string builders: the <Sticker> component uses them at build time, the wall uses them in the browser.
   Colour classes on the shapes: b1 = the sticker's colour, b2 = its second colour, bw cream, bk black, by yellow, br red; "kl" adds the keyline. */
export function esc(t: unknown): string { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function fzs(t: string, max: number, cap: number): string { return Math.min(cap, max / (Math.max(1, t.length) * .4)).toFixed(1); }
function tx(cls: string, x: number, y: number, size: number | string, max: number, t: string, extra = ''): string { return t ? '<text class="bt ' + cls + '" x="' + x + '" y="' + y + '" font-size="' + size + '" data-max="' + max + '"' + extra + '>' + esc(t) + '</text>' : ''; }
/* a shape with a keyline ("kl") is printed twice: the flat colour, a little out of register, then the black line */
function shape(cls: string, d: string): string {
  if (/(^| )kl( |$)/.test(cls) && !/(^| )nf( |$)/.test(cls)) return '<path class="' + cls.replace(/(^| )kl( |$)/, ' ').trim() + ' fl" d="' + d + '"/><path class="kl nf" d="' + d + '"/>';
  return '<path class="' + cls + '" d="' + d + '"/>';
}
/* a toothed seal: n points between two radii */
function burst(cx: number, cy: number, R: number, r: number, n: number): string {
  let d = '';
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * q).toFixed(1) + ' ' + (cy + Math.sin(a) * q).toFixed(1); }
  return d + 'Z';
}
function star(cx: number, cy: number, R: number): string { return burst(cx, cy, R, R * .42, 5); }
/* half a ring, standing on y */
function arch(cx: number, y: number, R: number, r: number): string { return 'M' + (cx - R) + ' ' + y + 'A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + y + 'H' + (cx + r) + 'A' + r + ' ' + r + ' 0 0 0 ' + (cx - r) + ' ' + y + 'Z'; }

type Shape = [width: number, height: number, cut: string, body: string];
const BD: Record<string, (a: string, b: string) => Shape> = {
  /* a crest: the word across an oval, three stars under it */
  oval: function (a, b) {
    const p = 'M60 3C101 3 117 14 117 46S101 89 60 89 3 78 3 46 19 3 60 3Z';
    return [120, 92, p, shape('b1 kl', p) + '<path class="rim" d="' + p + '" transform="translate(60 46) scale(.87) translate(-60 -46)"/>' + tx('s f', 60, 27, 6.5, 58, b) + tx('a f', 60, b ? 56 : 58, fzs(a, 84, 27), 84, a) + shape('bf', star(44, 71, 5.5) + star(60, 73, 5.5) + star(76, 71, 5.5))];
  },
  /* a pennant: the small line on a band of the second colour, the word under it, a chevron in the point */
  pent: function (a, b) {
    const p = 'M5 4H95V64L50 94 5 64Z';
    return [100, 98, p, shape('b1 kl', p) + shape('b2 kl', b ? 'M5 4H95V29H5Z' : 'M5 4H95V17H5Z') + tx('s w', 50, 20, 6.5, 74, b) + tx('a f', 50, b ? 59 : 52, fzs(a, 74, 32), 74, a) + '<path class="chev" d="M30 68 50 81 70 68"/>'];
  },
  /* a diamond with a band through it, wider than the diamond */
  dia: function (a, b) {
    const d = 'M65 2 106 42 65 82 24 42Z', band = 'M3 26H127V58H3Z';
    return [130, 84, d + band, shape('b1 kl', d) + shape('bf', star(65, 15, 6)) + shape('b2 kl', band) + tx('a w', 65, 51.5, fzs(a, 108, 26), 108, a) + tx('s f', 65, 70, 5.5, 34, b)];
  },
  /* a label cut on the slant */
  box: function (a) {
    const p = 'M14 2H128L116 56H2Z';
    return [130, 58, p, shape('b1 kl', p) + tx('a f', 72.5, 42, fzs(a, 92, 34), 92, a, ' transform="skewX(-10)"')];
  },
  /* a seal: a toothed disc, the figure in a cream eye, the small line on a band across it */
  rnd: function (a, b) {
    const p = burst(50, 50, 48, 41.5, 18), band = 'M2 60H98V79H2Z';
    return [100, 100, p + (b ? band : ''), shape('b1 kl', p) + '<circle class="bw fl" cx="50" cy="50" r="31.5"/><circle class="kl nf" cx="50" cy="50" r="31.5"/>' + tx('a k', 50, b ? 54 : 62.5, fzs(a, 52, b ? 30 : 38), 52, a) + (b ? shape('b2 kl', band) + tx('s w', 50, 72.6, 7.4, 86, b) : '')];
  },
  /* a capsule, with the small line on a tab hanging from it */
  pill: function (a, b) {
    const p = 'M33 2H97A29 29 0 0 1 97 60H33A29 29 0 0 1 33 2Z', tab = 'M30 49H100A8.5 8.5 0 0 1 100 66H30A8.5 8.5 0 0 1 30 49Z';
    return [130, 68, p + (b ? tab : ''), shape('b1 kl', p) + tx('a f', 65, b ? 39 : 43, fzs(a, 98, b ? 29 : 34), 98, a) + (b ? shape('b2 kl', tab) + tx('s w', 65, 60, 6.2, 62, b) : '')];
  },
  /* a long hexagon: one corner in the second colour, the small line in the foot */
  hex: function (a, b) {
    const p = 'M22 4H108L127 42 108 80H22L3 42Z';
    return [130, 84, p, shape('b1 kl', p) + shape('b2', 'M22 4H58L12 60 3 42Z') + shape('b2 kl', 'M11 58H119L108 80H22Z') + '<path class="kl nf" d="' + p + '"/>' + tx('a f', 68, 49, fzs(a, 84, 30), 84, a) + tx('a w', 65, 75.5, fzs(b || '', 76, 15), 76, b)];
  },
  /* the flag as three speed stripes */
  bars: function () {
    const s = (x: number) => 'M' + (30 + x) + ' 3H' + (46 + x) + 'L' + (20 + x) + ' 97H' + (4 + x) + 'Z';
    return [98, 100, s(0) + s(24) + s(48), shape('bk kl', s(0)) + shape('by kl', s(24)) + shape('br kl', s(48))];
  },
  /* a word pushed out of the sheet: black extrusion, coloured face */
  stack: function (a) {
    const q = fzs(a, 132, 46), t = function (cls: string, o: number) { return '<text class="bt a ' + cls + '" x="' + (80 + o).toFixed(1) + '" y="' + (46 + o).toFixed(1) + '" font-size="' + q + '" data-max="132">' + esc(a) + '</text>'; };
    let e = '';
    for (let i = 7; i > 0; i--) e += t('ext', i * 1.1);
    return [160, 64, '', e + t('face', 0)];
  },
  /* the tricolour, with a black label across it */
  flag: function (a) {
    const p = 'M14 3H86Q97 3 97 14V86Q97 97 86 97H14Q3 97 3 86V14Q3 3 14 3Z';
    return [100, 100, p, '<path class="bk" d="M14 3H35V97H14Q3 97 3 86V14Q3 3 14 3Z"/><path class="by" d="M35 3H65V97H35Z"/><path class="br" d="M65 3H86Q97 3 97 14V86Q97 97 86 97H65Z"/><path class="kl nf" d="' + p + '"/>' + (a ? shape('bw kl', 'M-3 58H103V84H-3Z') + tx('a k', 50, 79, fzs(a, 70, 24), 70, a) : '')];
  },
  star: function () { const p = 'M50 4 61 37 96 37 68 58 79 92 50 71 21 92 32 58 4 37 39 37Z'; return [100, 96, p, shape('b1 kl', p)]; },
  jersey: function (a) {
    const p = 'M30 14 42 9Q50 19 58 9L70 14 93 30 83 47 72 40 73 91H27L28 40 17 47 7 30Z';
    return [100, 100, p, shape('b1 kl', p) + shape('b2 kl', 'M7 30 17 47 23 43 13 26ZM93 30 83 47 77 43 87 26ZM42 9Q50 23 58 9L54 8Q50 16 46 8Z') + tx('a f', 50, 74, fzs(a, 36, 36), 36, a)];
  },
  /* three arches, black over yellow over red, standing on a cream foot */
  arc: function (a) {
    const cut = 'M5 66A60 60 0 0 1 125 66' + (a ? 'V86H5Z' : 'Z');
    return [130, a ? 90 : 70, cut, shape('bk kl', arch(65, 66, 60, 44)) + shape('by kl', arch(65, 66, 44, 28)) + shape('br kl', arch(65, 66, 28, 12)) + (a ? shape('bw kl', 'M5 66H125V86H5Z') + tx('a k', 65, 82, fzs(a, 104, 17), 104, a) : '')];
  },
  /* a fat arrow with a word in it */
  arrow: function (a) {
    const p = 'M3 20H84V3L127 37 84 71V54H3Z';
    return [130, 74, p, shape('b1 kl', p) + tx('a f', 50, 46, fzs(a, 76, 25), 76, a)];
  },
  /* a disc of halftone: dots growing towards one edge */
  dots: function () {
    const p = 'M50 3A47 47 0 1 1 50 97A47 47 0 1 1 50 3Z';
    let d = '';
    for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) {
      const x = 14 + i * 9 + (j % 2 ? 4.5 : 0), y = 14 + j * 9, q = Math.hypot(x - 50, y - 50);
      if (q > 41) continue;
      const r = .7 + (i + j) / 16 * 3.6;
      d += 'M' + (x - r).toFixed(1) + ' ' + y + 'a' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 1 0 ' + (r * 2).toFixed(1) + ' 0a' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 1 0 ' + (-r * 2).toFixed(1) + ' 0Z';
    }
    return [100, 100, p, shape('b1 kl', p) + shape('bf', d)];
  }
};

export type BadgeType = 'oval' | 'pent' | 'dia' | 'box' | 'rnd' | 'pill' | 'hex' | 'bars' | 'stack' | 'flag' | 'star' | 'jersey' | 'arc' | 'arrow' | 'dots';
export interface Badge { w: number; h: number; svg: string }

export function badge(type: string, a = '', b = ''): Badge {
  const q = (BD[type] || BD.rnd)(a, b), w = q[0] + 12, h = q[1] + 13;
  return { w, h, svg: '<svg viewBox="-3 -3 ' + w + ' ' + h + '" aria-hidden="true">' + (q[2] ? '<path class="bd-sh" fill="url(#ht)" d="' + q[2] + '" transform="translate(5.5 6.5)"/><path class="bd-w" d="' + q[2] + '" transform="translate(-1.8 -1.5)"/>' : '') + '<g class="bd-in">' + q[3] + '</g></svg>' };
}
