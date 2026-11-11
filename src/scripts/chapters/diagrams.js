import { $ } from '../core.js';
import { Board } from '../pitch.js';

// the eleven on the pitch, and the two goals replayed pass by pass
export function setupDiagrams(engine) {
  var on = engine.on;
  // Signature diagrams
  var B = Board, xi, replays = [];
  if (B) {
    var xiEl = $('#xi'); if (xiEl) { xi = new B.XI(xiEl); on('#xi', function (p) { xi.update(p); }); }
    [['#chadli', B.CHADLI], ['#kdb', B.KDB]].forEach(function (r) {
      var n = $(r[0]); if (!n) return;
      var rp = new B.Replay(n, r[1]); replays.push(rp);
      on(r[0], function (p) { rp.update(p); });
    });
  }
  return { Board: B, replays: replays };
}
