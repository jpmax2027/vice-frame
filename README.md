# vice-frame

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jpmax2027/vice-frame/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jpmax2027/vice-frame/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Leonida Sunset Studio is a fully offline web app that turns your own photos into GTA-poster-style cover art: multi-panel collage layouts with white poster gutters, per-pixel sunset and neon colour grades, a big Anton masthead with a Pacifico script accent, a caption bar, a wanted-style star meter and a round badge stamp — exported as a PNG in the common post sizes, ready to share. Your photos are read on your own machine and never uploaded; the app makes no network requests and works from its static files alone.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. There is no build step and nothing to install beyond Node.js 22 or later — or serve the `app/` folder with any static file server and open `app/index.html`.

## Features

- **Any photo** — upload with the file picker or drag & drop, or start from the two bundled sample photos. Photos stay on your machine.
- **Six collage layouts** — Hero Solo, Duo Split, Trio Strip, Quad Grid, Hero + Trio and Mosaic Lead.
- **Per-panel framing** — click a panel (or pick it from the list), assign any library photo to it, drag on the cover to reposition it, and zoom with the slider or the mouse wheel. One photo can fill every panel, or each panel can hold a different one.
- **Five colour grades** — Sunset Melt, Teal & Orange, Noir Ink, Neon Vivid and Faded Postcard, all applied per pixel on a canvas.
- **Poster lettering** — an Anton masthead title, a tilted Pacifico script accent, an editable caption bar, a 0–5 wanted star meter and a round badge stamp.
- **PNG export** — 1080 × 1080 (square post), 1080 × 1350 (portrait post), 1920 × 1080 (wide banner) and 1080 × 1920 (story), in one click.
- **Original art only** — no Rockstar Games logos, artwork or fonts. The display fonts are Anton and Pacifico, vendored under `app/fonts/` under the SIL Open Font License (license texts included beside them).

## Handing it in

`main.ts` is the entrypoint: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `buildDossier` library.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`. The vendored fonts keep their own SIL Open Font License texts in `app/fonts/`.

---

Entered on [make.fun](https://make.fun/?ref=zbqpv30a&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards

Entered in make.fun's gta6-cover-art-01 — https://make.fun/r/zbqpv30a
