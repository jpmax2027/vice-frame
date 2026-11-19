function fitFont(ctx, text, weight, family, startSize, maxWidth) {
  let size = startSize;
  while (size > 12) {
    ctx.font = weight + ' ' + size + 'px ' + family;
    const w = ctx.measureText(text).width;
    if (w <= maxWidth) {
      return size;
    }
    size = size - 4;
  }
  return size;
}
export function drawMasthead(ctx, texts, cx, topY, maxWidth, align) {
  const top = (texts.titleTop || '').toUpperCase();
  const main = (texts.titleMain || '').toUpperCase();
  const base = Math.round(maxWidth * 0.125);
  ctx.save();
  ctx.textBaseline = 'top';
  let y = topY;
  let topH = 0;
  let mainH = 0;
  if (top) {
    const size = fitFont(ctx, top, '400', "'Anton', sans-serif", base, maxWidth);
    ctx.font = '400 ' + size + 'px ' + "'Anton', sans-serif";
    topH = size;
    const grad = ctx.createLinearGradient(0, y, 0, y + size);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#ffd9a0');
    grad.addColorStop(1, '#ff7a3d');
    ctx.save();
    if (align === 'left') {
      ctx.textAlign = 'left';
      ctx.translate(cx, y);
    } else {
      ctx.textAlign = 'center';
      ctx.translate(cx, y);
    }
    ctx.transform(1, 0, -0.08, 1, 0, 0);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = Math.max(6, size * 0.16);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillText(top, size * 0.06, size * 0.07);
    ctx.strokeText(top, 0, 0);
    ctx.fillStyle = grad;
    ctx.fillText(top, 0, 0);
    ctx.restore();
    y = y + size * 1.02;
  }
  if (main) {
    const size2 = fitFont(ctx, main, '400', "'Anton', sans-serif", Math.round(base * 1.35), maxWidth);
    ctx.font = '400 ' + size2 + 'px ' + "'Anton', sans-serif";
    mainH = size2;
    const grad2 = ctx.createLinearGradient(0, y, 0, y + size2);
    grad2.addColorStop(0, '#ffffff');
    grad2.addColorStop(0.5, '#ffe9b0');
    grad2.addColorStop(1, '#ff2e88');
    ctx.save();
    if (align === 'left') {
      ctx.textAlign = 'left';
      ctx.translate(cx, y);
    } else {
      ctx.textAlign = 'center';
      ctx.translate(cx, y);
    }
    ctx.transform(1, 0, -0.08, 1, 0, 0);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = Math.max(7, size2 * 0.15);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillText(main, size2 * 0.05, size2 * 0.06);
    ctx.strokeText(main, 0, 0);
    ctx.fillStyle = grad2;
    ctx.fillText(main, 0, 0);
    ctx.restore();
    y = y + size2 * 1.02;
  }
  ctx.restore();
  const total = topH + mainH;
  const result = {};
  result.bottom = y;
  result.height = total;
  return result;
}
export function drawScriptLine(ctx, text, cx, y, maxWidth, align) {
  if (!text) {
    return y;
  }
  ctx.save();
  const size = fitFont(ctx, text, '400', "'Pacifico', cursive", Math.round(maxWidth * 0.075), maxWidth);
  ctx.font = '400 ' + size + 'px ' + "'Pacifico', cursive";
  ctx.textBaseline = 'top';
  if (align === 'left') {
    ctx.textAlign = 'left';
  } else {
    ctx.textAlign = 'center';
  }
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = Math.max(10, size * 0.45);
  ctx.strokeStyle = 'rgba(40, 0, 30, 0.9)';
  ctx.lineWidth = Math.max(3, size * 0.1);
  ctx.lineJoin = 'round';
  ctx.strokeText(text, cx, y);
  ctx.fillStyle = '#ff6ec7';
  ctx.fillText(text, cx, y);
  ctx.fillText(text, cx, y);
  ctx.restore();
  return y + size * 1.35;
}
export function drawCaptionBar(ctx, caption, W, H) {
  if (!caption) {
    return;
  }
  const barH = Math.round(H * 0.075);
  const y = H - barH;
  ctx.save();
  ctx.fillStyle = 'rgba(8, 4, 16, 0.88)';
  ctx.fillRect(0, y, W, barH);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, y, W, Math.max(3, Math.round(H * 0.006)));
  const text = caption.toUpperCase();
  const size = fitFont(ctx, text, '400', "'Anton', sans-serif", Math.round(barH * 0.52), W * 0.92);
  ctx.font = '400 ' + size + 'px ' + "'Anton', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try {
    ctx.letterSpacing = Math.round(size * 0.18) + 'px';
  } catch {
    ctx.letterSpacing = '0px';
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, W / 2, y + barH / 2 + 1);
  ctx.restore();
}
export function drawStarMeter(ctx, stars, x, y, unit) {
  const n = Math.max(0, Math.min(5, Math.round(stars)));
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.font = '400 ' + unit + 'px sans-serif';
  for (let i = 0; i < 5; i = i + 1) {
    const sx = x + i * (unit * 1.15);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 6;
    if (i < n) {
      ctx.fillStyle = '#ffd166';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
    }
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    drawStarPath(ctx, sx, y, unit * 0.52);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
function drawStarPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i = i + 1) {
    const rad = i % 2 === 0 ? r : r * 0.48;
    const ang = -Math.PI / 2 + i * Math.PI / 5;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
}
export function drawBadge(ctx, badgeText, cx, cy, radius) {
  if (!badgeText) {
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2e88';
  ctx.fill();
  ctx.lineWidth = Math.max(3, radius * 0.09);
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = Math.max(1, radius * 0.04);
  ctx.stroke();
  const words = badgeText.toUpperCase().split(' ');
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (words.length >= 2) {
    const s1 = fitFont(ctx, words[0], '400', "'Anton', sans-serif", Math.round(radius * 0.52), radius * 1.5);
    ctx.font = '400 ' + s1 + 'px ' + "'Anton', sans-serif";
    ctx.fillText(words[0], cx, cy - radius * 0.24);
    const rest = words.slice(1).join(' ');
    const s2 = fitFont(ctx, rest, '400', "'Anton', sans-serif", Math.round(radius * 0.52), radius * 1.5);
    ctx.font = '400 ' + s2 + 'px ' + "'Anton', sans-serif";
    ctx.fillText(rest, cx, cy + radius * 0.28);
  } else {
    const s = fitFont(ctx, badgeText.toUpperCase(), '400', "'Anton', sans-serif", Math.round(radius * 0.55), radius * 1.55);
    ctx.font = '400 ' + s + 'px ' + "'Anton', sans-serif";
    ctx.fillText(badgeText.toUpperCase(), cx, cy);
  }
  ctx.restore();
}
export function drawRibbon(ctx, badgeText, x, y, maxWidth) {
  if (!badgeText) {
    return;
  }
  ctx.save();
  const text = badgeText.toUpperCase();
  const size = fitFont(ctx, text, '400', "'Anton', sans-serif", 30, maxWidth);
  ctx.font = '400 ' + size + 'px ' + "'Anton', sans-serif";
  const tw = ctx.measureText(text).width;
  const pad = size * 0.7;
  const bw = tw + pad * 2;
  const bh = size * 1.7;
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x, y, bw, bh);
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, bw, bh);
  ctx.fillStyle = '#140a24';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + bw / 2, y + bh / 2 + 1);
  ctx.restore();
}
