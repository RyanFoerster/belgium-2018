/* The same small deterministic generator as the browser's (scripts/core.js): layouts decided at build time
   are "random" once, and identical on every build. */
export function rng(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
