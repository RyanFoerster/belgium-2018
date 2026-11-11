/* Typographic stickers: type inside a flat shape, a fat cream die-cut around it. One small generator per shape.
   Pure string builders: the <Sticker> component uses them at build time, the wall uses them in the browser. */
// stickers: type inside a flat shape, a fat cream die-cut around it — one small generator per shape
export function esc(t: unknown): string { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function fzs(t: string, max: number, cap: number): string { return Math.min(cap, max / (Math.max(1, t.length) * .47)).toFixed(1); }
function tx(cls: string, x: number, y: number, size: number | string, max: number, t: string): string { return t ? '<text class="bt ' + cls + '" x="' + x + '" y="' + y + '" font-size="' + size + '" data-max="' + max + '">' + esc(t) + '</text>' : ''; }
function checker(x: number, y: number, cols: number, rows: number, q: number, cls: string): string { var d = '', i, j; for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) if ((i + j) % 2 === 0) d += 'M' + (x + i * q) + ' ' + (y + j * q) + 'h' + q + 'v' + q + 'h-' + q + 'z'; return '<path class="' + cls + '" d="' + d + '"/>'; }
type Shape = [width: number, height: number, cut: string, body: string];
const BD: Record<string, (a: string, b: string) => Shape> = {
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
    var q = fzs(a, 132, 46), e = '', i, t = function (cls: string, o: number) { return '<text class="bt a ' + cls + '" x="' + (80 + o).toFixed(1) + '" y="' + (46 + o).toFixed(1) + '" font-size="' + q + '" data-max="132">' + esc(a) + '</text>'; };
    for (i = 6; i > 0; i--) e += t('b2s', i * 1.1);
    return [160, 64, '', t('cutt', 0) + t('cutt', 6.6) + e + t('c', 0)];
  },
  flag: function (a) { var p = 'M14 3H86Q97 3 97 14V86Q97 97 86 97H14Q3 97 3 86V14Q3 3 14 3Z'; return [100, 100, p, '<path class="bk" d="M14 3H35V97H14Q3 97 3 86V14Q3 3 14 3Z"/><path class="by" d="M35 3H65V97H35Z"/><path class="br" d="M65 3H86Q97 3 97 14V86Q97 97 86 97H65Z"/>' + (a ? '<path class="bw" d="M14 60H86V84H14Z"/>' + tx('a k', 50, 79.5, fzs(a, 60, 23), 60, a) : '')]; },
  star: function () { var p = 'M50 4 61 37 96 37 68 58 79 92 50 71 21 92 32 58 4 37 39 37Z'; return [100, 96, p, '<path class="b1" d="' + p + '"/>']; },
  jersey: function (a) { var p = 'M30 14 42 9Q50 19 58 9L70 14 93 30 83 47 72 40 73 91H27L28 40 17 47 7 30Z'; return [100, 100, p, '<path class="b1" d="' + p + '"/><path class="b2" d="M7 30 17 47 23 43 13 26ZM93 30 83 47 77 43 87 26ZM42 9Q50 23 58 9L54 8Q50 16 46 8Z"/>' + tx('a f', 50, 73, fzs(a, 34, 34), 34, a)]; }
};

export type BadgeType = 'oval' | 'pent' | 'dia' | 'box' | 'rnd' | 'pill' | 'hex' | 'chk' | 'bars' | 'stack' | 'star' | 'flag' | 'jersey';
export interface Badge { w: number; h: number; svg: string }

export function badge(type: string, a = '', b = ''): Badge {
  const q = (BD[type] || BD.rnd)(a, b), w = q[0] + 14, h = q[1] + 14;
  return { w, h, svg: '<svg viewBox="-7 -7 ' + w + ' ' + h + '" aria-hidden="true">' + (q[2] ? '<path class="bd-cut" d="' + q[2] + '"/>' : '') + '<g class="bd-in">' + q[3] + '</g></svg>' };
}
