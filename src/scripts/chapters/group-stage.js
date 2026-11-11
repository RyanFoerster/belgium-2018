import { clamp, seg } from '../core.js';

export function setupGroupStage(engine) {
  var tracks = engine.tracks, sceneOf = engine.sceneOf, apply = engine.apply;
  // 03 · the group stage travels left to right
  tracks.forEach(function (t) {
    var s = sceneOf(t.el); if (!s) return;
    s.fns.push(function (p) {
      // each panel is moved on its own and switched off while it is off screen: never more than two are painted
      var x = seg(p, .02, .97) * t.max, tf = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
      for (var i = 0; i < t.panels.length; i++) {
        var ps = t.panels[i], q = clamp((x + t.vw - ps.left) / (ps.w + t.vw)), vis = q > 0 && q < 1;
        if (vis !== ps.vis) { ps.vis = vis; ps.el.style.visibility = vis ? '' : 'hidden'; }
        if (vis) ps.el.style.transform = tf;
        apply(ps, q);
      }
    });
  });
}
