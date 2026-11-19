// Leonida Sunset Studio — editor wiring and screenshot scenes.
// Owns the app state (photos, panel framing, lettering, grade, size),
// binds every control in index.html to it, handles upload / drag & drop,
// canvas dragging and wheel zoom, PNG export, and the fixed ?shot=
// scenes the screenshots are taken from.

import { LAYOUTS, layoutById } from './layouts.js';
import { GRADES } from './grades.js';
import { EXPORT_SIZES, exportSizeById, freshPanelFraming, drawCoverArt } from './render.js';

const canvas = document.getElementById('coverCanvas');
const statusLine = document.getElementById('statusLine');

const SAMPLE_PHOTOS = [
  { name: 'Sample · Coast', url: './samples/coast.jpg' },
  { name: 'Sample · Neon', url: './samples/neon.jpg' },
];

const state = {
  layoutId: 'quad',
  gradeId: 'sunset',
  title: 'LEONIDA',
  accent: 'sunset strip',
  caption: 'MIDNIGHT RUN',
  badgeTop: 'LEONIDA',
  badgeBottom: 'EST. 2026',
  heat: 4,
  sizeId: 'square',
  panels: [],
  photos: [],
  photoNames: [],
  selectedPanel: 0,
  showSelection: true,
};

/** Loads an image from a URL or object URL, resolving once drawable. */
export function loadPhotoImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Resets panel framing for the current layout, spreading the library. */
function resetPanels(keepFraming) {
  const layout = layoutById(state.layoutId);
  const previous = keepFraming ? state.panels : [];
  state.panels = layout.panels.map((panel, index) => {
    const kept = previous[index] ? { ...previous[index] } : freshPanelFraming();
    if (!previous[index] && state.photos.length > 0) {
      kept.photoIndex = index % state.photos.length;
    }
    return kept;
  });
  if (state.selectedPanel >= layout.panels.length) state.selectedPanel = 0;
}

/** Renders the current state to the preview canvas at the export size. */
function redraw() {
  const size = exportSizeById(state.sizeId);
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCoverArt(canvas, state);
}

/** Rebuilds the photo library chips and the panel photo picker. */
function refreshPhotoControls() {
  const list = document.getElementById('photoList');
  list.replaceChildren();
  state.photoNames.forEach((name, index) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'photo-chip';
    chip.textContent = name;
    chip.addEventListener('click', () => assignPhotoToSelectedPanel(index));
    list.appendChild(chip);
  });
  const picker = document.getElementById('panelPhotoSelect');
  picker.replaceChildren();
  state.photoNames.forEach((name, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = name;
    picker.appendChild(option);
  });
  syncPanelControls();
}

/** Rebuilds the panel picker for the current layout. */
function refreshPanelPicker() {
  const picker = document.getElementById('panelSelect');
  picker.replaceChildren();
  layoutById(state.layoutId).panels.forEach((panel, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `Panel ${index + 1}`;
    picker.appendChild(option);
  });
  picker.value = String(state.selectedPanel);
}

/** Copies the selected panel's framing into its controls. */
function syncPanelControls() {
  const framing = state.panels[state.selectedPanel];
  if (!framing) return;
  document.getElementById('panelSelect').value = String(state.selectedPanel);
  document.getElementById('panelPhotoSelect').value = String(framing.photoIndex);
  document.getElementById('zoomRange').value = String(framing.zoom);
  document.querySelectorAll('.photo-chip').forEach((chip, index) => {
    chip.classList.toggle('active', index === framing.photoIndex);
  });
}

/** Points the selected panel at a library photo and redraws. */
function assignPhotoToSelectedPanel(photoIndex) {
  const framing = state.panels[state.selectedPanel];
  if (!framing) return;
  framing.photoIndex = photoIndex;
  syncPanelControls();
  redraw();
}

/** Adds one loaded image to the library and refreshes the controls. */
function addPhotoToLibrary(img, name) {
  state.photos.push(img);
  state.photoNames.push(name);
  refreshPhotoControls();
}

/** Builds the layout chips, grade picker and size picker. */
function buildPickers() {
  const bar = document.getElementById('layoutBar');
  LAYOUTS.forEach((layout) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (layout.id === state.layoutId ? ' active' : '');
    chip.textContent = layout.name;
    chip.dataset.layoutId = layout.id;
    chip.addEventListener('click', () => {
      state.layoutId = layout.id;
      bar.querySelectorAll('.chip').forEach((el) => el.classList.toggle('active', el.dataset.layoutId === layout.id));
      resetPanels(true);
      refreshPanelPicker();
      syncPanelControls();
      redraw();
    });
    bar.appendChild(chip);
  });
  const gradeSelect = document.getElementById('gradeSelect');
  GRADES.forEach((grade) => {
    const option = document.createElement('option');
    option.value = grade.id;
    option.textContent = grade.name;
    gradeSelect.appendChild(option);
  });
  gradeSelect.value = state.gradeId;
  gradeSelect.addEventListener('change', () => {
    state.gradeId = gradeSelect.value;
    redraw();
  });
  const sizeSelect = document.getElementById('sizeSelect');
  EXPORT_SIZES.forEach((size) => {
    const option = document.createElement('option');
    option.value = size.id;
    option.textContent = size.name;
    sizeSelect.appendChild(option);
  });
  sizeSelect.value = state.sizeId;
  sizeSelect.addEventListener('change', () => {
    state.sizeId = sizeSelect.value;
    redraw();
  });
}

/** Binds the lettering inputs to the state. */
function bindLettering() {
  const bind = (id, key) => {
    document.getElementById(id).addEventListener('input', (event) => {
      state[key] = event.target.value;
      redraw();
    });
  };
  bind('titleInput', 'title');
  bind('accentInput', 'accent');
  bind('captionInput', 'caption');
  bind('badgeInput', 'badgeTop');
  const heat = document.getElementById('heatRange');
  heat.addEventListener('input', () => {
    state.heat = Number(heat.value);
    document.getElementById('heatValue').textContent = heat.value;
    redraw();
  });
}

/** Binds panel pickers, zoom, fill-all and the export button. */
function bindPanelAndExport() {
  document.getElementById('panelSelect').addEventListener('change', (event) => {
    state.selectedPanel = Number(event.target.value);
    syncPanelControls();
    redraw();
  });
  document.getElementById('panelPhotoSelect').addEventListener('change', (event) => {
    assignPhotoToSelectedPanel(Number(event.target.value));
  });
  document.getElementById('zoomRange').addEventListener('input', (event) => {
    const framing = state.panels[state.selectedPanel];
    if (!framing) return;
    framing.zoom = Number(event.target.value);
    redraw();
  });
  document.getElementById('fillAllBtn').addEventListener('click', () => {
    const framing = state.panels[state.selectedPanel];
    if (!framing) return;
    state.panels.forEach((panel) => { panel.photoIndex = framing.photoIndex; });
    redraw();
  });
  document.getElementById('exportBtn').addEventListener('click', () => {
    const wasShowing = state.showSelection;
    state.showSelection = false;
    redraw();
    const size = exportSizeById(state.sizeId);
    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `leonida-cover-${size.w}x${size.h}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      statusLine.textContent = `Saved leonida-cover-${size.w}x${size.h}.png`;
      state.showSelection = wasShowing;
      redraw();
    }, 'image/png');
  });
}

/** Reads user files into the library; photos never leave the machine. */
async function ingestFiles(fileList) {
  for (const file of fileList) {
    if (!file.type.startsWith('image/')) continue;
    const img = await loadPhotoImage(URL.createObjectURL(file));
    addPhotoToLibrary(img, file.name.slice(0, 26));
  }
  if (state.photos.length > 0) redraw();
}

/** Binds the file input and drag & drop zone. */
function bindUploads() {
  document.getElementById('fileInput').addEventListener('change', (event) => {
    ingestFiles([...event.target.files]);
  });
  const zone = document.getElementById('dropZone');
  zone.addEventListener('dragover', (event) => {
    event.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (event) => {
    event.preventDefault();
    zone.classList.remove('drag-over');
    ingestFiles([...event.dataTransfer.files]);
  });
}

/** Binds canvas dragging (reposition) and wheel zoom on the cover. */
function bindCanvasGestures() {
  let drag = null;
  const panelAt = (event) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    const layout = layoutById(state.layoutId);
    const index = layout.panels.findIndex(
      (p) => nx >= p.x && nx <= p.x + p.w && ny >= p.y && ny <= p.y + p.h,
    );
    return { index: Math.max(0, index), nx, ny, rect };
  };
  canvas.addEventListener('pointerdown', (event) => {
    const hit = panelAt(event);
    state.selectedPanel = hit.index;
    syncPanelControls();
    drag = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    redraw();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const framing = state.panels[state.selectedPanel];
    const panel = layoutById(state.layoutId).panels[state.selectedPanel];
    if (!framing || !panel) return;
    const rect = canvas.getBoundingClientRect();
    framing.offsetX += (event.clientX - drag.x) / (rect.width * panel.w);
    framing.offsetY += (event.clientY - drag.y) / (rect.height * panel.h);
    drag = { x: event.clientX, y: event.clientY };
    redraw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const framing = state.panels[state.selectedPanel];
    if (!framing) return;
    framing.zoom = Math.min(3, Math.max(1, framing.zoom * (event.deltaY < 0 ? 1.06 : 0.94)));
    document.getElementById('zoomRange').value = String(framing.zoom);
    redraw();
  }, { passive: false });
}

/** Loads the two bundled samples into the library. */
async function loadSamples() {
  for (const sample of SAMPLE_PHOTOS) {
    const img = await loadPhotoImage(sample.url);
    addPhotoToLibrary(img, sample.name);
  }
}

/** Applies a ?shot= scene: fixed layout, grade, words and photo spread. */
async function applyShotScene(query) {
  const shot = query.get('shot');
  if (query.get('layout')) state.layoutId = query.get('layout');
  if (query.get('grade')) state.gradeId = query.get('grade');
  if (query.get('title')) state.title = query.get('title');
  if (query.get('accent')) state.accent = query.get('accent');
  if (query.get('caption')) state.caption = query.get('caption');
  if (query.get('badge')) state.badgeTop = query.get('badge');
  if (query.get('heat')) state.heat = Number(query.get('heat'));
  if (query.get('size')) state.sizeId = query.get('size');
  document.getElementById('gradeSelect').value = state.gradeId;
  document.getElementById('sizeSelect').value = state.sizeId;
  document.querySelectorAll('#layoutBar .chip').forEach((el) => {
    el.classList.toggle('active', el.dataset.layoutId === state.layoutId);
  });
  resetPanels(false);
  const assign = query.get('assign');
  if (assign) {
    assign.split(',').forEach((value, index) => {
      if (state.panels[index]) state.panels[index].photoIndex = Number(value) || 0;
    });
  }
  refreshPanelPicker();
  syncPanelControls();
  if (shot === 'cover') {
    state.showSelection = false;
    document.body.classList.add('shot-cover');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawCoverArt(canvas, state);
  } else {
    if (shot === 'export') document.body.classList.add('shot-export');
    redraw();
  }
  await document.fonts.ready;
  redrawCoverForShot(shot);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

/** Repaints once fonts arrive so shot lettering uses Anton / Pacifico. */
function redrawCoverForShot(shot) {
  if (shot === 'cover') {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawCoverArt(canvas, state);
  } else {
    redraw();
  }
}

/** Boots the editor: pickers, samples, bindings, first paint, shots. */
async function boot() {
  buildPickers();
  bindLettering();
  bindPanelAndExport();
  bindUploads();
  bindCanvasGestures();
  await loadSamples();
  resetPanels(false);
  refreshPanelPicker();
  syncPanelControls();
  await document.fonts.ready;
  const query = new URLSearchParams(location.search);
  if (query.get('shot')) {
    await applyShotScene(query);
  } else {
    redraw();
  }
}

boot();
