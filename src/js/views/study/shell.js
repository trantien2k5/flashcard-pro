/**
 * Study Overlay Shell Renderer
 * Dựng bộ khung HTML DOM cho màn hình học Flashcard 3D và các Drawer tùy chọn
 */

import { getStudyOverlayTemplate } from './template.js';

let _studyOverlayEl = null;

export function getStudyOverlay() {
  if (!_studyOverlayEl || !_studyOverlayEl.isConnected) {
    _studyOverlayEl = document.getElementById('study-overlay');
  }
  return _studyOverlayEl;
}

export function renderStudyOverlayShell() {
  let overlay = getStudyOverlay();
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'study-overlay';
    overlay.className = 'study-overlay';
    document.body.appendChild(overlay);
    _studyOverlayEl = overlay;
  }

  if (!overlay.querySelector('.study-header-bar')) {
    overlay.innerHTML = getStudyOverlayTemplate();
  }
}
