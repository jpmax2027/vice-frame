export const GRADES = [
  { id: 'vice-sunset', label: 'Vice Sunset' },
  { id: 'neon-nights', label: 'Neon Nights' },
  { id: 'golden-hour', label: 'Golden Hour' },
  { id: 'noir-ink', label: 'Noir Ink' },
  { id: 'clean', label: 'Clean' }
];
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function stopsFor(gradeId) {
  if (gradeId === 'neon-nights') {
    return [[8, 4, 32], [64, 10, 92], [196, 30, 160], [30, 200, 230], [255, 240, 200]];
  }
  if (gradeId === 'golden-hour') {
    return [[28, 16, 8], [96, 48, 18], [196, 110, 40], [248, 178, 84], [255, 244, 214]];
  }
  if (gradeId === 'noir-ink') {
    return [[0, 0, 0], [38, 38, 42], [110, 110, 116], [196, 196, 200], [255, 255, 255]];
  }
  if (gradeId === 'clean') {
    return null;
  }
  return [[6, 32, 44], [18, 62, 92], [150, 52, 110], [248, 110, 52], [255, 226, 150]];
}
function mapChannel(stops, t) {
  const seg = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(seg));
  const f = seg - i;
  const out = [];
  out.push(Math.round(lerp(stops[i][0], stops[i + 1][0], f)));
  out.push(Math.round(lerp(stops[i][1], stops[i + 1][1], f)));
  out.push(Math.round(lerp(stops[i][2], stops[i + 1][2], f)));
  return out;
}
export function applyGrade(canvas, gradeId, strength) {
  if (gradeId === 'clean') {
    return canvas;
  }
  const s = Math.max(0, Math.min(1, strength));
  if (s <= 0) {
    return canvas;
  }
  const stops = stopsFor(gradeId);
  if (!stops) {
    return canvas;
  }
  const w = canvas.width;
  const h = canvas.height;
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  octx.drawImage(canvas, 0, 0);
  const imgData = octx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const lut = [];
  for (let i = 0; i < 256; i = i + 1) {
    lut.push(mapChannel(stops, i / 255));
  }
  for (let p = 0; p < data.length; p = p + 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    let lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    if (gradeId === 'noir-ink') {
      const boosted = Math.max(0, Math.min(255, Math.round((lum - 128) * 1.45 + 128)));
      lum = boosted;
    }
    const mapped = lut[lum];
    data[p] = Math.round(lerp(r, mapped[0], s));
    data[p + 1] = Math.round(lerp(g, mapped[1], s));
    data[p + 2] = Math.round(lerp(b, mapped[2], s));
  }
  octx.putImageData(imgData, 0, 0);
  return off;
}
export function backdropColors(gradeId) {
  if (gradeId === 'neon-nights') {
    return ['#12042e', '#3d0a5e', '#0a2a4a'];
  }
  if (gradeId === 'golden-hour') {
    return ['#2a1608', '#7a3c12', '#c97a1e'];
  }
  if (gradeId === 'noir-ink') {
    return ['#050505', '#1c1c1e', '#3a3a3e'];
  }
  if (gradeId === 'clean') {
    return ['#18202c', '#2c3e55', '#4a6a8a'];
  }
  return ['#071e2e', '#5e1a4e', '#e85d2a'];
}
