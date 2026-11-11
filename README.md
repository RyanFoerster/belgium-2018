# Belgium 2018 — The Road to Glory

A scrolling editorial about Belgium's 2018 World Cup. Astro (static output), deployed to Cloudflare at `belgium.ryanfoerster.dev`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Astro dev server on `localhost:4321` |
| `npm run build` | Writes the static site to `dist/` |
| `npm run preview` | Serves `dist/` locally |
| `npm run check` | Type-checks components, data and lib |
| `npm run cf:preview` | Builds, then serves `dist/` through `wrangler dev` |
| `npm run deploy` | Builds, then `wrangler deploy` (see below) |

## Structure

```
src/
  pages/        index.astro (the story), 404.astro
  layouts/      Base.astro — document shell, fonts, stylesheet
  components/
    ui/         reusable pieces: Sticker, Photo, PlayerSticker, Ticket, Title/TitleLine/TitleNote, Join, Rip
    chrome/     Loader, Hud, SvgDefs
    sections/   one file per section, one folder per chapter (01-dream … 08-wall)
  data/         photos.ts (Wikimedia manifest), matches.ts (the seven tickets), joins.ts (chapter strips)
  lib/          badges.ts (sticker shapes), ticket.ts, attrs.ts — pure, shared by build and browser
  scripts/      the scroll engine, one module per job; main.js is the entry and sets the order
    objects/    wall, stickers, front page
    chapters/   group-stage, japan, brazil, diagrams
  styles/       global.css (layers + Tailwind theme) → base, archive, collage, ink
legacy/         the original single-file static version, kept for reference
```

Useful query strings: `?ld=hold100` freezes the loader when printed (`?ld=hold52` mid-pass), `?ld=0` skips it,
`?glide=0` turns the smooth wheel off, `?ink=0` shows the photographs un-inked, `?rm=1` forces reduced motion.

## Deploy (Cloudflare)

`wrangler.jsonc` serves `dist/` as static assets and attaches the custom domain `belgium.ryanfoerster.dev`.
The zone `ryanfoerster.dev` has to be on the Cloudflare account you log in with.

```bash
npx wrangler login
npm run deploy
```
