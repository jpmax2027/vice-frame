let nextPhotoId = 1;
export const POST_SIZES = [
  { id: 'sq1080', label: '1080 × 1080', w: 1080, h: 1080 },
  { id: 'port1350', label: '1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide1920', label: '1920 × 1080', w: 1920, h: 1080 },
  { id: 'story1920', label: '1080 × 1920', w: 1080, h: 1920 }
];
export function createDefaultState() {
  const state = {};
  state.photos = [];
  state.panelPhoto = [];
  state.panelView = [];
  state.selectedPanel = 0;
  state.layoutId = 'cover-grid';
  state.gradeId = 'vice-sunset';
  state.gradeStrength = 0.9;
  state.sizeId = 'sq1080';
  state.texts = {};
  state.texts.titleTop = 'NEON';
  state.texts.titleMain = 'SHORES';
  state.texts.scriptLine = 'midnight heat';
  state.texts.caption = 'PALM COUNTY AFTER DARK';
  state.texts.badgeText = 'VICE FRAME';
  state.texts.stars = 5;
  return state;
}
export function addPhoto(state, img, name) {
  const photo = {};
  photo.id = nextPhotoId;
  nextPhotoId = nextPhotoId + 1;
  photo.img = img;
  photo.name = name;
  state.photos.push(photo);
  return photo;
}
export function ensurePanelSlots(state, panelCount) {
  while (state.panelPhoto.length < panelCount) {
    state.panelPhoto.push(null);
  }
  while (state.panelView.length < panelCount) {
    const view = {};
    view.dx = 0;
    view.dy = 0;
    view.zoom = 1;
    state.panelView.push(view);
  }
}
export function assignPhotoToPanel(state, panelIndex, photoId) {
  state.panelPhoto[panelIndex] = photoId;
}
export function findPhoto(state, photoId) {
  for (const photo of state.photos) {
    if (photo.id === photoId) {
      return photo;
    }
  }
  return null;
}
export function getPostSize(state) {
  for (const size of POST_SIZES) {
    if (size.id === state.sizeId) {
      return size;
    }
  }
  return POST_SIZES[0];
}
export function resetView(state, panelIndex) {
  const view = {};
  view.dx = 0;
  view.dy = 0;
  view.zoom = 1;
  state.panelView[panelIndex] = view;
}
