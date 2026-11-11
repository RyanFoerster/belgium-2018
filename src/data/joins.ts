/* What is printed on the torn strips that cross the join between two chapters (<Join>).
   A strip without text is a checkerboard. drift: how far it slides sideways with the scroll (sign = direction). */
export interface Strip {
  text?: string;
  /** ground colour (bg-r, bg-y, bg-w) or, for a checkerboard, "r" for red */
  class?: string;
  drift: string;
  /** tilt (--rot) and vertical offset (--ty) */
  style: string;
}

export const JOINS = {
  beginning: [
    { text: "02 — The Beginning — Twenty-three players — One manager — ", class: "bg-r", drift: ".45", style: "--rot:-2.5deg;--ty:-9vh" },
    { drift: "-.5", style: "--rot:1.6deg;--ty:1vh" },
  ],
  japan: [
    { text: "Next: Japan — Rostov-on-Don — Round of 16 — ", class: "bg-r", drift: ".45", style: "--rot:-2.2deg;--ty:-10vh" },
    { text: "2 July 2018 — Rostov Arena — ", class: "bg-y", drift: "-.5", style: "--rot:1.8deg;--ty:-1vh" },
    { drift: ".3", style: "--rot:-1deg;--ty:7vh" },
  ],
  brazil: [
    { text: "Quarter-final — Kazan Arena — 6 July 2018 — ", class: "bg-y", drift: "-.45", style: "--rot:2.2deg;--ty:-10vh" },
    { text: "Brazil — five-time champions — ", class: "bg-w", drift: ".5", style: "--rot:-1.6deg;--ty:-1vh" },
  ],
  france: [
    { text: "Semi-final — Saint Petersburg — 10 July 2018 — ", class: "bg-y", drift: ".45", style: "--rot:-2.4deg;--ty:-10vh" },
    { text: "France — Belgium — ", drift: "-.5", style: "--rot:1.8deg;--ty:-1vh;background-color:var(--fra);color:var(--w)" },
  ],
  thirdPlace: [
    { text: "Third-place play-off — 14 July 2018 — Belgium v England — ", class: "bg-r", drift: "-.45", style: "--rot:2deg;--ty:-10vh" },
    { text: "Same stadium — four days later — ", class: "bg-y", drift: ".5", style: "--rot:-1.8deg;--ty:-1vh" },
  ],
  wall: [
    { text: "08 — The Wall — Everything that was in the box — ", class: "bg-r", drift: ".45", style: "--rot:-2.2deg;--ty:-10vh" },
    { class: "r", drift: "-.5", style: "--rot:1.6deg;--ty:0vh" },
  ],
} satisfies Record<string, Strip[]>;
