function rect(x, y, w, h, label, extra) {
  const r = {};
  r.x = x;
  r.y = y;
  r.w = w;
  r.h = h;
  r.label = label;
  r.rotation = 0;
  r.isTitleBlock = false;
  if (extra) {
    Object.assign(r, extra);
  }
  return r;
}
export const LAYOUTS = [
  { id: 'cover-grid', label: 'Cover Grid' },
  { id: 'hero-strip', label: 'Hero Strip' },
  { id: 'nine-panel', label: 'Nine Panel' },
  { id: 'duo-split', label: 'Duo Split' },
  { id: 'full-bleed', label: 'Full Bleed' },
  { id: 'tilted-snaps', label: 'Tilted Snaps' }
];
export function getPanels(layoutId, W, H) {
  const g = Math.max(6, Math.round(W * 0.008));
  if (layoutId === 'hero-strip') {
    const stripH = Math.round(H * 0.28);
    const heroH = H - stripH - g;
    const third = Math.floor((W - g * 2) / 3);
    const panels = [];
    panels.push(rect(0, 0, W, heroH, 'Hero'));
    panels.push(rect(0, heroH + g, third, stripH, 'Strip Left'));
    panels.push(rect(third + g, heroH + g, third, stripH, 'Strip Centre'));
    panels.push(rect((third + g) * 2, heroH + g, W - (third + g) * 2, stripH, 'Strip Right'));
    return panels;
  }
  if (layoutId === 'nine-panel') {
    const cw = Math.floor((W - g * 2) / 3);
    const ch = Math.floor((H - g * 2) / 3);
    const names = ['Top Left', 'Top Centre', 'Top Right', 'Mid Left', 'Title Block', 'Mid Right', 'Bottom Left', 'Bottom Centre', 'Bottom Right'];
    const panels = [];
    for (let row = 0; row < 3; row = row + 1) {
      for (let col = 0; col < 3; col = col + 1) {
        const idx = row * 3 + col;
        const x = col * (cw + g);
        const y = row * (ch + g);
        const w = col === 2 ? W - x : cw;
        const h = row === 2 ? H - y : ch;
        const isTitle = idx === 4;
        panels.push(rect(x, y, w, h, names[idx], { isTitleBlock: isTitle }));
      }
    }
    return panels;
  }
  if (layoutId === 'duo-split') {
    const half = Math.floor((W - g) / 2);
    const panels = [];
    panels.push(rect(0, 0, half, H, 'Left Half'));
    panels.push(rect(half + g, 0, W - half - g, H, 'Right Half'));
    return panels;
  }
  if (layoutId === 'full-bleed') {
    const panels = [];
    panels.push(rect(0, 0, W, H, 'Full Bleed'));
    return panels;
  }
  if (layoutId === 'tilted-snaps') {
    const panels = [];
    panels.push(rect(0, 0, W, H, 'Backdrop'));
    const sw = Math.round(W * 0.46);
    const sh = Math.round(H * 0.42);
    panels.push(rect(Math.round(W * 0.06), Math.round(H * 0.3), sw, sh, 'Snap Left', { rotation: -0.07 }));
    panels.push(rect(Math.round(W * 0.48), Math.round(H * 0.22), sw, sh, 'Snap Right', { rotation: 0.06 }));
    panels.push(rect(Math.round(W * 0.27), Math.round(H * 0.52), sw, sh, 'Snap Front', { rotation: -0.02 }));
    return panels;
  }
  const heroW = Math.round(W * 0.62);
  const heroH = Math.round(H * 0.58);
  const sideX = heroW + g;
  const sideW = W - sideX;
  const sideH = Math.floor((heroH - g) / 2);
  const botY = heroH + g;
  const botH = H - botY;
  const botW = Math.floor((W - g * 2) / 3);
  const panels = [];
  panels.push(rect(0, 0, heroW, heroH, 'Hero'));
  panels.push(rect(sideX, 0, sideW, sideH, 'Side Top'));
  panels.push(rect(sideX, sideH + g, sideW, heroH - sideH - g, 'Side Bottom'));
  panels.push(rect(0, botY, botW, botH, 'Bottom Left'));
  panels.push(rect(botW + g, botY, botW, botH, 'Bottom Centre'));
  panels.push(rect((botW + g) * 2, botY, W - (botW + g) * 2, botH, 'Bottom Right'));
  return panels;
}
export function mastheadAnchor(layoutId, W, H) {
  if (layoutId === 'nine-panel') {
    const anchor = {};
    anchor.mode = 'centre';
    anchor.x = W / 2;
    anchor.y = H / 2;
    return anchor;
  }
  if (layoutId === 'full-bleed') {
    const anchor = {};
    anchor.mode = 'lower-left';
    anchor.x = W * 0.06;
    anchor.y = H * 0.68;
    return anchor;
  }
  if (layoutId === 'hero-strip') {
    const anchor = {};
    anchor.mode = 'top-centre';
    anchor.x = W / 2;
    anchor.y = H * 0.04;
    return anchor;
  }
  if (layoutId === 'tilted-snaps') {
    const anchor = {};
    anchor.mode = 'top-centre';
    anchor.x = W / 2;
    anchor.y = H * 0.03;
    return anchor;
  }
  const anchor = {};
  anchor.mode = 'top-block';
  anchor.x = W / 2;
  anchor.y = H * 0.02;
  return anchor;
}
