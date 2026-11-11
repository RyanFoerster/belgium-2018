/* What is printed on the two bands at the join between two chapters (<Join>).
   drift: how far it slides sideways with the scroll (sign = direction). */
export interface Strip {
  text: string;
  /** ground colour (bg-r, bg-y, bg-w) */
  class?: string;
  drift: string;
  /** a colour of its own, when no class has it */
  style?: string;
}

export const JOINS = {
  beginning: [
    { text: "02 — The Beginning — Twenty-three players — One manager — ", class: "bg-r", drift: ".45" },
    { text: "Russia — 14 June to 15 July 2018 — ", class: "bg-y", drift: "-.5" },
  ],
  japan: [
    { text: "Next: Japan — Rostov-on-Don — Round of 16 — ", class: "bg-r", drift: ".45" },
    { text: "2 July 2018 — Rostov Arena — ", class: "bg-y", drift: "-.5" },
  ],
  brazil: [
    { text: "Quarter-final — Kazan Arena — 6 July 2018 — ", class: "bg-y", drift: "-.45" },
    { text: "Brazil — five-time champions — ", class: "bg-w", drift: ".5" },
  ],
  france: [
    { text: "Semi-final — Saint Petersburg — 10 July 2018 — ", class: "bg-y", drift: ".45" },
    { text: "France — Belgium — ", drift: "-.5", style: "background-color:var(--fra);color:var(--w)" },
  ],
  thirdPlace: [
    { text: "Third-place play-off — 14 July 2018 — Belgium v England — ", class: "bg-r", drift: "-.45" },
    { text: "Same stadium — four days later — ", class: "bg-y", drift: ".5" },
  ],
  wall: [
    { text: "08 — The Wall — Everything that was in the box — ", class: "bg-r", drift: ".45" },
    { text: "Merci — Dank u — Danke — ", class: "bg-y", drift: "-.5" },
  ],
} satisfies Record<string, Strip[]>;
