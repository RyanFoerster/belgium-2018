import { RM, $ } from '../core.js';

export function setupJapan() {
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
}
