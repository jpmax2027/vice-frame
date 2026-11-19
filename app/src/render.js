// Leonida Sunset Studio — the cover renderer.
// Draws the whole poster onto any 2D canvas at any size: graded photo
// panels with white poster gutters, a big Anton masthead with a Pacifico
// script accent, a caption bar, a wanted-style star meter and a round
// badge stamp. Everything is drawn from the state object, so the live
// preview and the exported PNG are the same picture at two sizes.

import { layoutById } from './layouts.js';
import { gradeById, applyGradeToImageData } from './grades.js';

export const EXPORT_SIZES = [
  { id: 'square', name: 'Square post · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait post · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide banner · 1920 × 1080', w: 1920, h: 1080 },
  { id: 'story', name: 'Story · 1080 × 1920', w: 1080, h: 1920 },
];

/** Finds an export size by id, falling back to the square post. */
export function exportSizeById(id) {
  return EXPORT_SIZES.find((size) => size.id === id) ?? EXPORT_SIZES[0];
}

/** Default per-panel framing: centred, no extra zoom. */
export function freshPanelFraming() {
  return { photoIndex: 0, offsetX: 0, offsetY: 0, zoom: 1 };
}

/**
 * Draws one photo into a panel rectangle with cover-fit maths, honouring
 * the panel framing (offset in panel fractions, zoom multiplier), grades
 * the pixels on a scratch canvas, then paints the result clipped to the
 * panel so neighbouring panels never bleed into each other.
 */
function drawGradedPanel(ctx, scratch, photo, rect, framing, grade) {
  const pw = Math.max(2, Math.round(rect.w));
  const ph = Math.max(2, Math.round(rect.h));
  scratch.width = pw;
  scratch.height = ph;
  const sctx = scratch.getContext('2d', { willReadFrequently: true });
  sctx.fillStyle = '#241430';
  sctx.fillRect(0, 0, pw, ph);
  if (photo) {
    const baseScale = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight);
    const scale = baseScale * Math.max(1, framing.zoom || 1);
    const drawnW = photo.naturalWidth * scale;
    const drawnH = photo.naturalHeight * scale;
    const dx = (pw - drawnW) / 2 + (framing.offsetX || 0) * pw;
    const dy = (ph - drawnH) / 2 + (framing.offsetY || 0) * ph;
    sctx.drawImage(photo, dx, dy, drawnW, drawnH);
  }
  const pixels = sctx.getImageData(0, 0, pw, ph);
  applyGradeToImageData(pixels, grade);
  sctx.putImageData(pixels, 0, 0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(scratch, rect.x, rect.y);
  ctx.restore();
}

/** Draws one five-point star centred at (cx, cy). */
function drawStar(ctx, cx, cy, radius, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? radius : radius * 0.45;
    const px = cx + Math.cos(angle) * rad;
    const py = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = '#ffc933';
    ctx.fill();
  }
  ctx.lineWidth = radius * 0.14;
  ctx.strokeStyle = '#ffc933';
  ctx.stroke();
}

/** Draws the wanted-style star meter: `heat` filled stars out of five. */
function drawStarMeter(ctx, x, y, radius, heat) {
  const step = radius * 2.5;
  for (let i = 0; i < 5; i += 1) {
    drawStar(ctx, x + i * step, y, radius, i < heat);
  }
}

/** Draws the round badge stamp with two short lines of lettering. */
function drawBadgeStamp(ctx, cx, cy, radius, topText, bottomText) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.16);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#e63950';
  ctx.fill();
  ctx.lineWidth = radius * 0.09;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
  ctx.lineWidth = radius * 0.045;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(radius * 0.34)}px Anton, sans-serif`;
  ctx.fillText(topText, 0, -radius * 0.2);
  ctx.font = `${Math.round(radius * 0.27)}px Anton, sans-serif`;
  ctx.fillText(bottomText, 0, radius * 0.22);
  ctx.restore();
}

/** Shrinks a font size until the text fits the given width. */
function fitFontSize(ctx, text, maxWidth, startSize, family) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

/**
 * Renders the full cover described by `state` onto `canvas` at the
 * canvas's own pixel size. `state` carries: layoutId, gradeId, title,
 * accent, caption, badgeTop, badgeBottom, heat (0..5), panels (framing
 * per layout panel) and photos (loaded images, by library index).
 */
export function drawCoverArt(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);
  const scratch = document.createElement('canvas');

  ctx.fillStyle = '#1b0f26';
  ctx.fillRect(0, 0, W, H);

  layout.panels.forEach((panel, index) => {
    const framing = state.panels[index] ?? freshPanelFraming();
    const photo = state.photos[framing.photoIndex] ?? state.photos[0] ?? null;
    drawGradedPanel(ctx, scratch, photo, {
      x: panel.x * W,
      y: panel.y * H,
      w: panel.w * W,
      h: panel.h * H,
    }, framing, grade);
  });

  // White poster gutters between and around the panels.
  const gutter = Math.max(3, W * 0.007);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = gutter;
  layout.panels.forEach((panel) => {
    ctx.strokeRect(panel.x * W, panel.y * H, panel.w * W, panel.h * H);
  });
  ctx.strokeRect(0, 0, W, H);

  // Sunset scrim behind the masthead so lettering always reads.
  const scrim = ctx.createLinearGradient(0, 0, 0, H * 0.34);
  scrim.addColorStop(0, 'rgba(20, 6, 32, 0.72)');
  scrim.addColorStop(1, 'rgba(20, 6, 32, 0)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, W, H * 0.34);

  // Masthead: big Anton capitals, white over a hard pink offset shadow.
  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    const size = fitFontSize(ctx, title, W * 0.92, H * 0.16, 'Anton, sans-serif');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `${size}px Anton, sans-serif`;
    ctx.fillStyle = '#ff2e88';
    ctx.fillText(title, W / 2 + size * 0.045, H * 0.035 + size * 0.045);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, W / 2, H * 0.035);
  }

  // Script accent word, tilted, tucked under the masthead.
  const accent = (state.accent || '').trim();
  if (accent) {
    ctx.save();
    ctx.translate(W * 0.68, H * 0.155);
    ctx.rotate(-0.07);
    const size = fitFontSize(ctx, accent, W * 0.5, H * 0.075, 'Pacifico, cursive');
    ctx.font = `${size}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = size * 0.18;
    ctx.fillStyle = '#ffd166';
    ctx.fillText(accent, 0, 0);
    ctx.restore();
  }

  drawBadgeStamp(
    ctx,
    W * 0.885,
    H * 0.76,
    Math.min(W, H) * 0.085,
    (state.badgeTop || 'LEONIDA').toUpperCase(),
    (state.badgeBottom || 'EST. 2026').toUpperCase(),
  );

  // Caption bar along the foot: caption left, star meter right.
  const barH = H * 0.095;
  ctx.fillStyle = 'rgba(10, 4, 18, 0.92)';
  ctx.fillRect(0, H - barH, W, barH);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, H - barH, W, Math.max(3, H * 0.006));
  const caption = (state.caption || '').trim().toUpperCase();
  if (caption) {
    const size = fitFontSize(ctx, caption, W * 0.62, barH * 0.52, 'Anton, sans-serif');
    ctx.font = `${size}px Anton, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption, W * 0.035, H - barH / 2 + 1);
  }
  drawStarMeter(ctx, W * 0.735, H - barH / 2, barH * 0.26, state.heat ?? 4);

  // Selected panel outline, only for the editor preview.
  if (typeof state.selectedPanel === 'number' && state.showSelection) {
    const panel = layout.panels[state.selectedPanel];
    if (panel) {
      ctx.save();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = Math.max(3, W * 0.006);
      ctx.setLineDash([W * 0.02, W * 0.012]);
      ctx.strokeRect(panel.x * W + 4, panel.y * H + 4, panel.w * W - 8, panel.h * H - 8);
      ctx.restore();
    }
  }
  return canvas;
}
