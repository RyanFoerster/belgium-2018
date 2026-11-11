import { $, seg, E } from '../core.js';

// returns the measurement the layout pass has to redo on resize
export function setupBrazil(engine) {
  var on = engine.on;
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
  return measureBra;
}
