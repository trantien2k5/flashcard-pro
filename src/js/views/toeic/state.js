/**
 * Shared Runtime State & Overlay Helpers for TOEIC Test View
 */

export const toeicState = {
  app: null,
  currentQuestions: [],
  userAnswers: {},
  flaggedQuestions: new Set(),
  currentQuestionIndex: 0,
  timerInterval: null,
  remainingSeconds: 0,
  totalDurationSeconds: 0,
  testStartTime: 0,
  activeConfig: null,
  overlayEl: null,
  keysBound: false
};

export function getToeicOverlay() {
  if (!toeicState.overlayEl || !toeicState.overlayEl.isConnected) {
    toeicState.overlayEl = document.getElementById('toeic-arena-overlay');
  }
  return toeicState.overlayEl;
}

export function ensureArenaOverlayCreated() {
  let overlay = getToeicOverlay();
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'toeic-arena-overlay';
    overlay.className = 'toeic-arena-overlay';
    document.body.appendChild(overlay);
    toeicState.overlayEl = overlay;
  }
  return overlay;
}

export function stopArenaTimer() {
  if (toeicState.timerInterval) {
    clearInterval(toeicState.timerInterval);
    toeicState.timerInterval = null;
  }
}

