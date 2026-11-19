import { getPanels, mastheadAnchor } from './layouts.js';
import { applyGrade, backdropColors } from './grade.js';
import { drawMasthead, drawScriptLine, drawCaptionBar, drawStarMeter, drawBadge } from './lettering.js';
import { findPhoto } from './state.js';
let noiseCanvas = null;
function getNoiseCanvas() {
  if (noiseCanvas) {
    return noiseCanvas;
  }
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const nctx = c.getContext('2d');
  const imgData = nctx.createImageData(256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i = i + 4) {
    const v = Math.floor(Math.random() * 255);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  nctx.putImageData(imgData, 0, 0);
  noiseCanvas = c;
  return c;
}
function drawCoverFit(ctx, img, x, y, w, h, view) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) {
    return;
  }
  const zoom = view ? view.zoom : 1;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = view ? view.dx : 0;
  const dy = view ? view.dy : 0;
  const px = x + (w - dw) / 2 + dx * w * 0.4;
  const py = y + (h - dh) / 2 + dy * h * 0.4;
  ctx.drawImage(img, px, py, dw, dh);
}
export function renderCover(ctx, state, W, H) {
  const panels = getPanels(state.layoutId, W, H);
  const colors = backdropColors(state.gradeId);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.55, colors[1]);
  grad.addColorStop(1, colors[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  if (state.gradeId === 'vice-sunset') {
    const sunR = Math.round(W * 0.3);
    const sunX = W * 0.72;
    const sunY = H * 0.3;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0, 'rgba(255, 214, 120, 0.95)');
    sunGrad.addColorStop(0.55, 'rgba(255, 130, 60, 0.75)');
    sunGrad.addColorStop(1, 'rgba(255, 80, 80, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 200, 0.95)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 0.34, 0, Math.PI * 2);
    ctx.fill();
  }
  const keyline = Math.max(3, Math.round(W * 0.006));
  for (let i = 0; i < panels.length; i = i + 1) {
    const panel = panels[i];
    if (panel.isTitleBlock) {
      ctx.save();
      ctx.fillStyle = '#12081f';
      ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
      const innerGrad = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
      innerGrad.addColorStop(0, 'rgba(255,46,136,0.35)');
      innerGrad.addColorStop(1, 'rgba(20,8,36,0.1)');
      ctx.fillStyle = innerGrad;
      ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
      ctx.restore();
      continue;
    }
    const photoId = state.panelPhoto[i];
    const photo = photoId !== null && photoId !== undefined ? findPhoto(state, photoId) : null;
    const view = state.panelView[i] || { dx: 0, dy: 0, zoom: 1 };
    ctx.save();
    if (panel.rotation) {
      const cx = panel.x + panel.w / 2;
      const cy = panel.y + panel.h / 2;
      ctx.translate(cx, cy);
      ctx.rotate(panel.rotation);
      ctx.translate(-cx, -cy);
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = Math.round(W * 0.02);
      ctx.shadowOffsetY = Math.round(H * 0.012);
    }
    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.w, panel.h);
    ctx.clip();
    if (photo && photo.img) {
      const tmp = document.createElement('canvas');
      tmp.width = Math.max(2, Math.round(panel.w));
      tmp.height = Math.max(2, Math.round(panel.h));
      const tctx = tmp.getContext('2d');
      tctx.fillStyle = '#1a1028';
      tctx.fillRect(0, 0, tmp.width, tmp.height);
      drawCoverFit(tctx, photo.img, 0, 0, tmp.width, tmp.height, view);
      const graded = applyGrade(tmp, state.gradeId, state.gradeStrength);
      ctx.drawImage(graded, panel.x, panel.y, panel.w, panel.h);
    } else {
      const ph = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
      ph.addColorStop(0, '#2a1a4d');
      ph.addColorStop(1, '#0e2a3a');
      ctx.fillStyle = ph;
      ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '400 ' + Math.round(panel.w * 0.07 + 12) + 'px ' + "'Anton', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(panel.label.toUpperCase(), panel.x + panel.w / 2, panel.y + panel.h / 2);
    }
    ctx.restore();
    ctx.save();
    if (panel.rotation) {
      const cx2 = panel.x + panel.w / 2;
      const cy2 = panel.y + panel.h / 2;
      ctx.translate(cx2, cy2);
      ctx.rotate(panel.rotation);
      ctx.translate(-cx2, -cy2);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = keyline;
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
    ctx.strokeStyle = 'rgba(255, 46, 136, 0.55)';
    ctx.lineWidth = Math.max(1, Math.round(keyline / 2));
    ctx.strokeRect(panel.x - keyline, panel.y - keyline, panel.w + keyline * 2, panel.h + keyline * 2);
    ctx.restore();
  }
  const anchor = mastheadAnchor(state.layoutId, W, H);
  const texts = state.texts;
  if (anchor.mode === 'centre') {
    const block = panels[4];
    if (block) {
      const mw = block.w * 1.35;
      const res = drawMasthead(ctx, texts, block.x + block.w / 2, block.y + block.h * 0.14, mw, 'center');
      drawScriptLine(ctx, texts.scriptLine, block.x + block.w / 2, res.bottom + block.h * 0.03, mw, 'center');
    }
  } else if (anchor.mode === 'lower-left') {
    const mw = W * 0.72;
    const res = drawMasthead(ctx, texts, anchor.x, anchor.y, mw, 'left');
    drawScriptLine(ctx, texts.scriptLine, anchor.x + W * 0.01, res.bottom + H * 0.01, mw, 'left');
  } else if (anchor.mode === 'top-centre') {
    const mw = W * 0.86;
    ctx.save();
    ctx.fillStyle = 'rgba(8, 4, 16, 0.42)';
    ctx.fillRect(0, 0, W, H * 0.3);
    ctx.restore();
    const res = drawMasthead(ctx, texts, anchor.x, anchor.y + H * 0.015, mw, 'center');
    drawScriptLine(ctx, texts.scriptLine, anchor.x, res.bottom + H * 0.008, mw, 'center');
  } else {
    const mw = W * 0.88;
    ctx.save();
    const shade = ctx.createLinearGradient(0, 0, 0, H * 0.34);
    shade.addColorStop(0, 'rgba(8, 4, 16, 0.62)');
    shade.addColorStop(1, 'rgba(8, 4, 16, 0)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H * 0.34);
    ctx.restore();
    const res = drawMasthead(ctx, texts, anchor.x, anchor.y + H * 0.012, mw, 'center');
    drawScriptLine(ctx, texts.scriptLine, anchor.x, res.bottom + H * 0.006, mw, 'center');
  }
  drawStarMeter(ctx, texts.stars, W * 0.045, H * 0.045, Math.round(W * 0.032));
  const badgeR = Math.round(Math.min(W, H) * 0.085);
  drawBadge(ctx, texts.badgeText, W - badgeR - W * 0.03, badgeR + H * 0.025, badgeR);
  drawCaptionBar(ctx, texts.caption, W, H);
  const noise = getNoiseCanvas();
  ctx.save();
  ctx.globalAlpha = 0.05;
  const pat = ctx.createPattern(noise, 'repeat');
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}
export function getNoiseForTest() {
  return getNoiseCanvas();
}
