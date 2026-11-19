import { POST_SIZES, addPhoto, assignPhotoToPanel, ensurePanelSlots, getPostSize, resetView } from './state.js';
import { LAYOUTS, getPanels } from './layouts.js';
import { GRADES } from './grade.js';
import { renderCover } from './render.js';
export function initEditor(state, hooks) {
  const canvas = document.getElementById('preview');
  const ctx = canvas.getContext('2d');
  const fileInput = document.getElementById('file-input');
  const photoList = document.getElementById('photo-list');
  const panelList = document.getElementById('panel-list');
  const layoutPicker = document.getElementById('layout-picker');
  const gradePicker = document.getElementById('grade-picker');
  const sizePicker = document.getElementById('size-picker');
  const sizeReadout = document.getElementById('size-readout');
  const zoomRange = document.getElementById('zoom-range');
  const strengthRange = document.getElementById('grade-strength');
  function refresh() {
    const size = getPostSize(state);
    canvas.width = size.w;
    canvas.height = size.h;
    const panels = getPanels(state.layoutId, size.w, size.h);
    ensurePanelSlots(state, panels.length);
    renderCover(ctx, state, size.w, size.h);
    if (sizeReadout) {
      sizeReadout.textContent = size.w + ' × ' + size.h;
    }
    renderPhotoList();
    renderPanelList(panels);
    syncControls(panels);
    if (hooks && hooks.onChange) {
      hooks.onChange();
    }
  }
  function renderPhotoList() {
    photoList.innerHTML = '';
    for (const photo of state.photos) {
      const row = document.createElement('div');
      row.className = 'photo-item';
      const thumb = document.createElement('img');
      thumb.src = photo.img.src;
      thumb.alt = photo.name;
      const label = document.createElement('span');
      label.className = 'grow';
      label.textContent = photo.name;
      const useBtn = document.createElement('button');
      useBtn.type = 'button';
      useBtn.textContent = 'Use in panel';
      useBtn.addEventListener('click', () => {
        assignPhotoToPanel(state, state.selectedPanel, photo.id);
        refresh();
      });
      row.appendChild(thumb);
      row.appendChild(label);
      row.appendChild(useBtn);
      photoList.appendChild(row);
    }
    if (state.photos.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'note';
      empty.textContent = 'No photos yet — upload one or add a sample.';
      photoList.appendChild(empty);
    }
  }
  function renderPanelList(panels) {
    panelList.innerHTML = '';
    for (let i = 0; i < panels.length; i = i + 1) {
      const panel = panels[i];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'panel-item' + (i === state.selectedPanel ? ' selected' : '');
      const nameSpan = document.createElement('span');
      nameSpan.className = 'grow';
      let suffix = 'empty';
      if (panel.isTitleBlock) {
        suffix = 'title block';
      } else if (state.panelPhoto[i] !== null && state.panelPhoto[i] !== undefined) {
        for (const photo of state.photos) {
          if (photo.id === state.panelPhoto[i]) {
            suffix = photo.name;
          }
        }
      }
      nameSpan.textContent = (i + 1) + '. ' + panel.label + ' — ' + suffix;
      btn.appendChild(nameSpan);
      btn.addEventListener('click', () => {
        state.selectedPanel = i;
        refresh();
      });
      panelList.appendChild(btn);
    }
  }
  function syncControls(panels) {
    const view = state.panelView[state.selectedPanel];
    if (view && zoomRange) {
      zoomRange.value = String(view.zoom);
    }
    if (strengthRange) {
      strengthRange.value = String(state.gradeStrength);
    }
    for (const btn of layoutPicker.querySelectorAll('button')) {
      btn.classList.toggle('active', btn.dataset.id === state.layoutId);
    }
    for (const btn of gradePicker.querySelectorAll('button')) {
      btn.classList.toggle('active', btn.dataset.id === state.gradeId);
    }
    for (const btn of sizePicker.querySelectorAll('button')) {
      btn.classList.toggle('active', btn.dataset.id === state.sizeId);
    }
    const starsEl = document.getElementById('stars-value');
    if (starsEl) {
      starsEl.textContent = String(state.texts.stars);
    }
    void panels;
  }
  function buildPickers() {
    for (const layout of LAYOUTS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.id = layout.id;
      btn.textContent = layout.label;
      btn.addEventListener('click', () => {
        state.layoutId = layout.id;
        state.selectedPanel = 0;
        refresh();
      });
      layoutPicker.appendChild(btn);
    }
    for (const grade of GRADES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.id = grade.id;
      btn.textContent = grade.label;
      btn.addEventListener('click', () => {
        state.gradeId = grade.id;
        refresh();
      });
      gradePicker.appendChild(btn);
    }
    for (const size of POST_SIZES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.id = size.id;
      btn.textContent = size.label;
      btn.addEventListener('click', () => {
        state.sizeId = size.id;
        refresh();
      });
      sizePicker.appendChild(btn);
    }
  }
  function bindTextInputs() {
    const fields = ['titleTop', 'titleMain', 'scriptLine', 'caption', 'badgeText'];
    for (const field of fields) {
      const input = document.getElementById('text-' + field);
      if (!input) {
        continue;
      }
      input.value = state.texts[field];
      input.addEventListener('input', () => {
        state.texts[field] = input.value;
        refresh();
      });
    }
  }
  function exportPng() {
    const size = getPostSize(state);
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    const octx = off.getContext('2d');
    renderCover(octx, state, size.w, size.h);
    off.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vice-frame-cover.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 4000);
    }, 'image/png');
  }
  buildPickers();
  bindTextInputs();
  document.getElementById('upload-btn').addEventListener('click', () => {
    fileInput.click();
  });
  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files || []);
    let pending = files.length;
    if (pending === 0) {
      return;
    }
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          addPhoto(state, img, file.name);
          pending = pending - 1;
          if (pending === 0) {
            refresh();
          }
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    }
    fileInput.value = '';
  });
  document.getElementById('sample-boulevard-btn').addEventListener('click', () => {
    if (hooks && hooks.loadSample) {
      hooks.loadSample('boulevard');
    }
  });
  document.getElementById('sample-pier-btn').addEventListener('click', () => {
    if (hooks && hooks.loadSample) {
      hooks.loadSample('pier');
    }
  });
  zoomRange.addEventListener('input', () => {
    const view = state.panelView[state.selectedPanel];
    if (view) {
      view.zoom = Number(zoomRange.value);
      refresh();
    }
  });
  strengthRange.addEventListener('input', () => {
    state.gradeStrength = Number(strengthRange.value);
    refresh();
  });
  document.getElementById('center-btn').addEventListener('click', () => {
    resetView(state, state.selectedPanel);
    refresh();
  });
  document.getElementById('fill-all-btn').addEventListener('click', () => {
    if (state.photos.length === 0) {
      return;
    }
    const panels = getPanels(state.layoutId, 1080, 1080);
    for (let i = 0; i < panels.length; i = i + 1) {
      if (panels[i].isTitleBlock) {
        continue;
      }
      const photo = state.photos[i % state.photos.length];
      assignPhotoToPanel(state, i, photo.id);
    }
    refresh();
  });
  document.getElementById('stars-minus').addEventListener('click', () => {
    state.texts.stars = Math.max(0, state.texts.stars - 1);
    refresh();
  });
  document.getElementById('stars-plus').addEventListener('click', () => {
    state.texts.stars = Math.min(5, state.texts.stars + 1);
    refresh();
  });
  document.getElementById('export-btn').addEventListener('click', exportPng);
  document.getElementById('export-btn-2').addEventListener('click', exportPng);
  canvas.addEventListener('click', (ev) => {
    const rectBox = canvas.getBoundingClientRect();
    const size = getPostSize(state);
    const px = (ev.clientX - rectBox.left) / rectBox.width * size.w;
    const py = (ev.clientY - rectBox.top) / rectBox.height * size.h;
    const panels = getPanels(state.layoutId, size.w, size.h);
    for (let i = 0; i < panels.length; i = i + 1) {
      const p = panels[i];
      if (px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) {
        state.selectedPanel = i;
        refresh();
        break;
      }
    }
  });
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener('pointerdown', (ev) => {
    dragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!dragging) {
      return;
    }
    const rectBox = canvas.getBoundingClientRect();
    const size = getPostSize(state);
    const dxPx = (ev.clientX - lastX) / rectBox.width * size.w;
    const dyPx = (ev.clientY - lastY) / rectBox.height * size.h;
    lastX = ev.clientX;
    lastY = ev.clientY;
    const view = state.panelView[state.selectedPanel];
    if (view) {
      view.dx = view.dx + dxPx / size.w;
      view.dy = view.dy + dyPx / size.h;
      renderCover(ctx, state, size.w, size.h);
    }
  });
  canvas.addEventListener('pointerup', () => {
    dragging = false;
    refresh();
  });
  canvas.addEventListener('pointercancel', () => {
    dragging = false;
  });
  const api = {};
  api.refresh = refresh;
  api.exportPng = exportPng;
  refresh();
  return api;
}
