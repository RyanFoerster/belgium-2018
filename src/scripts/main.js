/* Entry point of the page's behaviour. The order below is the order things have to exist in:
   the archive's own objects first (so photographs and lettering treat them like any other markup),
   then photographs and type, then the scroll engine that reads the finished page, then the loader that releases it. */
import { doc, RM } from './core.js';
import { drawSurfaces } from './surfaces.js';
import { buildWall } from './objects/wall.js';
import { hydrateStickers, fitStickers } from './objects/stickers.js';
import { cloneFrontPage } from './objects/frontpage.js';
import { setupPhotos } from './photos.js';
import { setupType, statics, fitAll, lineUp } from './type.js';
import { autoEntrances, dealArrivals, watchReveals } from './arrivals.js';
import { addRipCores, ripSheets, tornAll } from './paper.js';
import { createEngine } from './engine.js';
import { setupGroupStage } from './chapters/group-stage.js';
import { setupDiagrams } from './chapters/diagrams.js';
import { fitLoader, runLoader } from './loader.js';
import { setupGlide } from './glide.js';
import { setupCursor } from './cursor.js';
import { setupNav } from './nav.js';

if (RM) doc.classList.add('rm');

/* ── the page's own objects ── */
drawSurfaces();
buildWall();
hydrateStickers();
cloneFrontPage();

/* ── photographs, type, arrivals, paper edges ── */
autoEntrances();
setupPhotos();
setupType();
dealArrivals();
addRipCores();
ripSheets();
watchReveals();

/* ── scroll ── */
var engine = createEngine();
setupGroupStage(engine);
var diagrams = setupDiagrams(engine), Board = diagrams.Board, replays = diagrams.replays;

/* ── the way round the page: chapter index, rail, stubs, replay controls, things that answer when touched ── */
setupNav(engine, replays);

/* ── layout: everything that depends on sizes, redone when they change ── */
var lastW = window.innerWidth, lastO = Board ? Board.Replay.orient() : 'h';
function layout() {
  fitAll(); fitStickers(); fitLoader(); lineUp(); tornAll(); engine.measure();
  replays.forEach(function (rp) { rp.locate(); });
  if (RM) {
    // reduced motion: every scene is shown as its poster frame
    engine.scenes.forEach(function (s) { s.p = -1; engine.apply(s, s.poster); });
    engine.tracks.forEach(function (t) { t.panels.forEach(function (ps) { ps.p = -1; engine.apply(ps, 1); }); });
    engine.frame();
  } else { engine.scenes.forEach(function (s) { s.p = -1; }); engine.frame(); }
}
window.addEventListener('scroll', engine.onScroll, { passive: true });
window.addEventListener('resize', function () {
  // mobile URL-bar resizes change only the height: ignore those, keep the frame stable
  if (window.innerWidth === lastW && Math.abs(window.innerHeight - engine.vh()) < 140) return;
  lastW = window.innerWidth;
  if (Board && Board.Replay.orient() !== lastO) { lastO = Board.Replay.orient(); replays.forEach(function (rp) { rp.build(); }); }
  layout();
});
layout();
window.addEventListener('load', layout);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

/* ── pointer, wheel, and the press that releases the page ── */
setupCursor();
runLoader(statics, setupGlide());
