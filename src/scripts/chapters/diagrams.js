import { $ } from '../core.js';
import { Board } from '../pitch.js';

// the two goals replayed pass by pass on the tactical board
export function setupDiagrams(engine) {
  var on = engine.on, B = Board, replays = [];
  [['#chadli', B.CHADLI], ['#kdb', B.KDB]].forEach(function (r) {
    var n = $(r[0]); if (!n) return;
    var rp = new B.Replay(n, r[1]); replays.push(rp);
    on(r[0], function (p) { rp.update(p); });
  });
  return { Board: B, replays: replays };
}
