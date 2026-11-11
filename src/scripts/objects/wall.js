import { doc, RM, $, E, rng, el } from '../core.js';
import { ticketHTML } from '../../lib/ticket';
import { doodle } from '../../lib/doodles';

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
  } else if (w[0] === 't') { n = el('div', 'tkt'); n.dataset.tkt = w[1]; n.dataset.stamp = ''; n.innerHTML = ticketHTML(w[1], true); rot *= .6; }
  else if (w[0] === 'n') {
    var a = w[1].split('—'); n = el('div', 'sc d'); n.style.setProperty('--opp', 'var(--' + w[2] + ')');
    n.innerHTML = '<span class="cutn c-bel inv" style="--h:9;--rot:-4deg"><i>' + a[0] + '</i></span><span class="cutn c-opp" style="--h:7;--rot:5deg"><i>' + a[1] + '</i></span>';
  } else if (w[0] === 'c') { n = el('div', 'cutting'); n.dataset.torn = 'tb'; n.appendChild(el('p', '', w[1])); rot *= .4; }
  else if (w[0] === 'h') { n = el('span', 'hand ' + (w[2] === 'y' ? 'c-y' : 'c-r'), w[1]); rot *= .5; }
  else if (w[0] === 'i') { n = el('i', 'il ' + (w[4] || '')); n.dataset.il = w[1]; if (w[2]) n.dataset.a = w[2]; if (w[3]) n.dataset.b = w[3]; }
  else if (w[0] === 'g') { var g = doodle(w[1], w[3] || ''); n = el('i', 'dd ' + (w[2] || '')); n.innerHTML = g.svg; n.style.aspectRatio = g.w + '/' + g.h; n.setAttribute('aria-hidden', 'true'); }
  else { n = el('div', 'w-draw'); n.innerHTML = DRAW; rot *= .4; }
  n.classList.add('wi');
  return [n, rot];
}

export function buildWall() {
  // 08 · the wall: everything met on the way, in the order it was found, pinned wherever there was room
  (function () {
    var wall = $('#wall'); if (!wall) return;
    var W = [
      ['p', 'team', 'Moscow, 23.06'], ['s', 'hazard', 10, 'E. Hazard'], ['t', 13], ['n', '3—0', 'pan'], ['p', 'mertens', '47′, volley'], ['s', 'lukaku', 9, 'R. Lukaku'],
      ['t', 29], ['n', '5—2', 'tun'], ['p', 'penalty', 'from the spot'], ['h', '4 in 2', 'r'], ['s', 'courtois', 1, 'Courtois'],
      ['t', 45], ['p', 'januzaj', 'Kaliningrad'], ['n', '1—0', 'eng'], ['p', 'fansKal', 'red devils', 'duo-y'], ['c', 'Nine points out of nine.'],
      ['t', 54], ['p', 'japan', 'Rostov'], ['h', 'plan B', 'y'], ['s', 'fellaini', 8, 'Fellaini'], ['s', 'chadli', 22, 'Chadli'], ['d'], ['n', '3—2', 'jpn'], ['h', 'impossible.', 'r'], ['p', 'street', '2.07.18'],
      ['s', 'kdb', 7, 'De Bruyne'], ['t', 58], ['p', 'brazilTeam', 'Kazan, 6.07'], ['c', 'Belgium are in the semi-final.'], ['n', '2—1', 'bra'], ['p', 'kdbJoy', '31′'], ['p', 'braHug', 'Kazan', 'duo-r'], ['h', 'we can win this thing', 'r'], ['p', 'kontich', 'Kontich, 22:43'], ['s', 'kompany', 4, 'Kompany'],
      ['t', 61], ['p', 'france', 'Hazard / Mbappé'], ['n', '0—1', 'fra'], ['h', 'one corner', 'r'], ['p', 'fanWig', 'Saint Petersburg', 'duo-y'],
      ['t', 63], ['n', '2—0', 'eng'], ['p', 'vertMedal', 'bronze'], ['p', 'meunierMedal', 'Meunier'], ['s', 'vertonghen', 5, 'Vertonghen'], ['s', 'witsel', 6, 'Witsel'], ['c', '16 goals. 10 scorers. 6 wins.'], ['p', 'bronze', '3rd'], ['h', 'merci', 'y'], ['p', 'braSalute', 'thank you'],
      ['i', 'oval', 'RED DEVILS', 'BELGIUM'], ['i', 'jersey', '10'], ['i', 'pent', '2018', 'WORLD CUP', 'y'], ['i', 'box', 'N°3'], ['i', 'stack', 'GOAL!'], ['i', 'arc'], ['i', 'dots', '', '', 'y'], ['i', 'arrow', 'ROSTOV', '', 'k'], ['i', 'flag', 'BEL'],
      ['i', 'pill', '16 GOALS', '7 MATCHES', 'y'], ['i', 'rnd', '3', 'THIRD PLACE', 'y'], ['i', 'bars', '', '', 'y'], ['i', 'dia', 'ROSTOV', '', 'k'], ['i', 'hex', 'PLAN B', '65′'], ['i', 'rnd', '94′', 'CHADLI', 'k'], ['i', 'pill', 'KAZAN', '6 JULY', 'k'],
      ['g', 'ball'], ['g', 'boot', 'r'], ['g', 'glove'], ['g', 'medal', '', '3'], ['g', 'flame', 'r'], ['g', 'star'], ['g', 'bolt'], ['g', 'megaphone', 'r'], ['g', 'crown']
    ];
    // the illustrated stickers are dealt evenly through the story instead of arriving in one batch at the end
    var extra = W.filter(function (w) { return w[0] === 'i' || w[0] === 'g'; }), base = W.length - extra.length;
    W = W.filter(function (w) { return w[0] !== 'i' && w[0] !== 'g'; });
    extra.forEach(function (w, j) { W.splice(Math.round((j + 1) * base / (extra.length + 1)) + j, 0, w); });
    var r = rng(2018), port = window.innerWidth < 820 && window.innerHeight > window.innerWidth;
    var C = port ? 5 : 10, R = Math.ceil(W.length / C), cells = [], i;
    for (i = 0; i < C * R; i++) cells.push(i);
    for (i = cells.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = cells[i]; cells[i] = cells[j]; cells[j] = t; }
    var FX = ['fx-slap', 'fx-drop', 'fx-slide', '', 'fx-slap'];
    W.forEach(function (w, k) {
      var c = cells[k], cx = c % C, cy = Math.floor(c / C), q = piece(w, r), n = q[0], rot = q[1];
      var fx = FX[Math.floor(r() * FX.length)]; if (fx && w[0] !== 's' && w[0] !== 'h' && w[0] !== 'i' && w[0] !== 'g') n.classList.add(fx);
      n.style.setProperty('--wx', ((cx + .5 + (r() - .5) * .7) / C * 100).toFixed(1) + '%');
      n.style.setProperty('--wy', ((cy + .5 + (r() - .5) * .6) / R * 100).toFixed(1) + '%');
      n.style.setProperty('--rot', rot.toFixed(1) + 'deg'); n.style.setProperty('--wz', k + 1);
      n.style.setProperty('--fx', Math.round((r() - .5) * 140) + 'vw'); n.style.setProperty('--fy', Math.round(-30 - r() * 50) + 'vh'); n.style.setProperty('--spin', Math.round((r() - .5) * 70) + 'deg');
      n.dataset.at = (.03 + k / W.length * .66).toFixed(3);
      wall.appendChild(n);
    });
  })();
}

// the loader: the same things, pinned round the drawing of the 94th minute (components/chrome/Loader.astro).
// They take the cells of a loose grid that the drawing does not cover (a second layer when there are more pieces than cells),
// and each is given the touch of the ball that throws it (data-b, 0–7: scripts/loader.js).
export function buildLoaderWall() {
  var wall = $('#ldWall'), sheet = $('#lbSheet'); if (!wall || !sheet || RM || !doc.classList.contains('ld-on') || /[?&]ld=0/.test(location.search)) return;
  var W = [
    ['p', 'team', 'Moscow, 23.06'], ['i', 'oval', 'RED DEVILS', 'BELGIUM'], ['t', 13], ['s', 'hazard', 10, 'E. Hazard'], ['n', '3—0', 'pan'], ['g', 'ball'],
    ['p', 'mertens', '47′, volley'], ['i', 'pent', '2018', 'WORLD CUP', 'y'], ['t', 29], ['s', 'lukaku', 9, 'R. Lukaku'], ['n', '5—2', 'tun'], ['h', '4 in 2', 'r'],
    ['p', 'januzaj', 'Kaliningrad'], ['g', 'boot', 'r'], ['t', 45], ['n', '1—0', 'eng'], ['p', 'fansKal', 'red devils', 'duo-y'], ['i', 'jersey', '10'],
    ['p', 'japan', 'Rostov'], ['t', 54], ['s', 'chadli', 22, 'Chadli'], ['i', 'rnd', '94′', 'CHADLI', 'k'], ['h', 'impossible.', 'r'], ['s', 'courtois', 1, 'Courtois'],
    ['p', 'kdbJoy', '31′'], ['t', 58], ['s', 'kdb', 7, 'De Bruyne'], ['n', '2—1', 'bra'], ['g', 'flame', 'r'], ['p', 'kontich', 'Kontich, 22:43'], ['i', 'pill', 'KAZAN', '6 JULY', 'k'],
    ['t', 61], ['p', 'france', 'Hazard / Mbappé'], ['n', '0—1', 'fra'], ['g', 'glove'],
    ['t', 63], ['n', '2—0', 'eng'], ['p', 'bronze', '3rd'], ['i', 'rnd', '3', 'THIRD PLACE', 'y'], ['g', 'medal', '', '3'], ['h', 'merci', 'y']
  ];
  var r = rng(1830), port = window.innerWidth < 820 && window.innerHeight > window.innerWidth;
  if (port) W = W.filter(function (w, k) { return k % 3 !== 2; });
  var C = port ? 5 : 10, R = port ? 8 : 5, wr = wall.getBoundingClientRect(), sr = sheet.getBoundingClientRect(), cells = [], i;
  // a cell is free when its middle is not well inside the drawing
  var ix0 = (sr.left - wr.left + sr.width * .12) / wr.width, ix1 = (sr.right - wr.left - sr.width * .12) / wr.width;
  var iy0 = (sr.top - wr.top + sr.height * .14) / wr.height, iy1 = (sr.bottom - wr.top - sr.height * .14) / wr.height;
  for (i = 0; i < C * R; i++) { var mx = (i % C + .5) / C, my = (Math.floor(i / C) + .5) / R; if (!(mx > ix0 && mx < ix1 && my > iy0 && my < iy1)) cells.push(i); }
  for (i = cells.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = cells[i]; cells[i] = cells[j]; cells[j] = t; }
  W.forEach(function (w, k) {
    var c = cells[k % cells.length], cx = c % C, cy = Math.floor(c / C), q = piece(w, r), n = q[0], layer = k >= cells.length;
    n.style.setProperty('--wx', ((cx + .5 + (r() - .5) * (layer ? 1 : .6)) / C * 100).toFixed(1) + '%');
    n.style.setProperty('--wy', ((cy + .5 + (r() - .5) * (layer ? .9 : .5)) / R * 100).toFixed(1) + '%');
    n.style.setProperty('--rot', q[1].toFixed(1) + 'deg'); n.style.setProperty('--wz', k + 1);
    n.style.setProperty('--spin', Math.round((r() - .5) * 140) + 'deg'); n.style.setProperty('--dur', (.5 + r() * .22).toFixed(2) + 's');
    n.dataset.b = Math.min(7, Math.floor(k / W.length * 8));
    wall.appendChild(n);
  });
}
