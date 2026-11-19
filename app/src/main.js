import { createDefaultState, addPhoto, assignPhotoToPanel, ensurePanelSlots } from './state.js';
import { getPanels } from './layouts.js';
import { renderCover } from './render.js';
import { initEditor } from './editor.js';
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error('failed to load ' + src));
    };
    img.src = src;
  });
}
async function buildDefaultScene(state, forW, forH) {
  const boulevard = await loadImage('samples/boulevard.jpg');
  const pier = await loadImage('samples/pier.jpg');
  const bPhoto = addPhoto(state, boulevard, 'boulevard.jpg');
  const pPhoto = addPhoto(state, pier, 'pier.jpg');
  const panels = getPanels(state.layoutId, forW || 1080, forH || 1080);
  ensurePanelSlots(state, panels.length);
  for (let idx = 0; idx < panels.length; idx = idx + 1) {
    if (panels[idx].isTitleBlock) {
      continue;
    }
    if (idx === 0) {
      assignPhotoToPanel(state, idx, bPhoto.id);
    } else if (idx % 2 === 1) {
      assignPhotoToPanel(state, idx, pPhoto.id);
    } else {
      assignPhotoToPanel(state, idx, bPhoto.id);
    }
  }
  return { boulevard: bPhoto, pier: pPhoto };
}
async function runShotCover(params) {
  document.body.classList.add('shot-cover');
  const layout = params.get('layout') || 'cover-grid';
  const grade = params.get('grade') || 'vice-sunset';
  const w = Number(params.get('w') || window.innerWidth);
  const h = Number(params.get('h') || window.innerHeight);
  const state = createDefaultState();
  state.layoutId = layout;
  state.gradeId = grade;
  await buildDefaultScene(state, w, h);
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.id = 'shot-canvas';
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  renderCover(ctx, state, w, h);
  window.__VICE_READY = true;
}
async function runEditor() {
  const state = createDefaultState();
  const scene = await buildDefaultScene(state);
  await document.fonts.ready;
  let editorApi = null;
  const hooks = {};
  hooks.loadSample = (which) => {
    if (which === 'boulevard') {
      const img = new Image();
      img.onload = () => {
        addPhoto(state, img, 'boulevard.jpg');
        if (editorApi) {
          editorApi.refresh();
        }
      };
      img.src = 'samples/boulevard.jpg';
    } else {
      const img = new Image();
      img.onload = () => {
        addPhoto(state, img, 'pier.jpg');
        if (editorApi) {
          editorApi.refresh();
        }
      };
      img.src = 'samples/pier.jpg';
    }
    void scene;
  };
  editorApi = initEditor(state, hooks);
  window.__VICE_READY = true;
}
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot === 'cover') {
  runShotCover(params).catch((err) => {
    console.error(err);
    window.__VICE_READY = true;
  });
} else {
  runEditor().catch((err) => {
    console.error(err);
    window.__VICE_READY = true;
  });
}
