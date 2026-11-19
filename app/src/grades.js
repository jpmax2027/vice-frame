// Leonida Sunset Studio — per-pixel colour grades.
// Every grade is a small function over one pixel's red, green and blue
// channels (0..255). The renderer walks the ImageData of each panel once
// and rewrites it, so grades work on any photo with no library and no
// network. A shared contrast / saturation helper keeps the looks coherent.

function clampChannel(value) {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

function applyContrast(r, g, b, amount) {
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));
  return [
    clampChannel(factor * (r - 128) + 128),
    clampChannel(factor * (g - 128) + 128),
    clampChannel(factor * (b - 128) + 128),
  ];
}

function applySaturation(r, g, b, amount) {
  const grey = 0.299 * r + 0.587 * g + 0.114 * b;
  return [
    clampChannel(grey + (r - grey) * amount),
    clampChannel(grey + (g - grey) * amount),
    clampChannel(grey + (b - grey) * amount),
  ];
}

function gradeSunset(r, g, b) {
  const warmed = applySaturation(r * 1.1 + 16, g * 0.99 + 6, b * 0.8, 1.18);
  return applyContrast(warmed[0], warmed[1], warmed[2], 22);
}

function gradeVice(r, g, b) {
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const shadowTeal = 1 - lum;
  const tealR = r + shadowTeal * -8 + lum * 22;
  const tealG = g + shadowTeal * 26 + lum * 4;
  const tealB = b + shadowTeal * 30 + lum * -14;
  const boosted = applySaturation(tealR, tealG, tealB, 1.22);
  return applyContrast(boosted[0], boosted[1], boosted[2], 18);
}

function gradeNoir(r, g, b) {
  const grey = 0.299 * r + 0.587 * g + 0.114 * b;
  const hard = applyContrast(grey, grey, grey, 58);
  return [hard[0], hard[1], clampChannel(hard[2] + 6)];
}

function gradeVivid(r, g, b) {
  const boosted = applySaturation(r, g, b, 1.55);
  return applyContrast(boosted[0], boosted[1], boosted[2], 14);
}

function gradeFaded(r, g, b) {
  const soft = applySaturation(r, g, b, 0.72);
  return [
    clampChannel(soft[0] * 0.88 + 30),
    clampChannel(soft[1] * 0.88 + 28),
    clampChannel(soft[2] * 0.88 + 26),
  ];
}

export const GRADES = [
  { id: 'sunset', name: 'Sunset Melt', gradePixel: gradeSunset },
  { id: 'vice', name: 'Teal & Orange', gradePixel: gradeVice },
  { id: 'noir', name: 'Noir Ink', gradePixel: gradeNoir },
  { id: 'vivid', name: 'Neon Vivid', gradePixel: gradeVivid },
  { id: 'faded', name: 'Faded Postcard', gradePixel: gradeFaded },
];

/** Finds a grade by id, falling back to the sunset grade. */
export function gradeById(id) {
  return GRADES.find((grade) => grade.id === id) ?? GRADES[0];
}

/** Rewrites an ImageData block in place with the chosen grade. */
export function applyGradeToImageData(imageData, grade) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const out = grade.gradePixel(data[i], data[i + 1], data[i + 2]);
    data[i] = out[0];
    data[i + 1] = out[1];
    data[i + 2] = out[2];
  }
  return imageData;
}
