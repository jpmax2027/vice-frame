# vice-frame
[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jpmax2027/vice-frame/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jpmax2027/vice-frame/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Frame is an offline cover-art studio that turns your own photos into a bold multi-panel poster. Drop in one photo or several, arrange them across collage panels, grade the colours into a sunset or neon look, set huge poster lettering over the top, and export a crisp PNG ready to post. Everything runs locally in the browser — photos never leave your machine and the app makes zero network requests.

## Features

- Six layouts: asymmetric cover-grid collage, hero-strip, nine-panel grid with a centre title block, duo-split, full-bleed, and tilted snapshot panels.
- Per-panel control: click a panel to select it, assign any uploaded photo to it, drag on the canvas to pan, and zoom with a slider.
- Photo library: upload your own images or start from the two bundled sample photos (boulevard and pier).
- Five colour grades applied per pixel: Vice Sunset, Neon Nights, Golden Hour, Noir Ink, and Clean, each with a strength slider.
- Poster lettering: two-line masthead in Anton with gradient fill and hard shadow, a glowing Pacifico script line, a letterspaced caption bar, a 0–5 star meter, and a round badge.
- Post sizes: 1080x1080, 1080x1350, 1920x1080, and 1080x1920, exported as a PNG download in one click.
- Finishing touches: bright keylines between panels, film grain, vignette, and a low sun disc on the sunset grade.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in your browser.

Hand-in build:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Fonts

- Anton — SIL Open Font License 1.1, bundled at `app/fonts/Anton-Regular.ttf`.
- Pacifico — SIL Open Font License 1.1, bundled at `app/fonts/Pacifico-Regular.ttf`.

<sub>Entered on [make.fun](https://make.fun/?ref=zbqpv30a&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
