/**
 * Shared Runtime State & Active Recall Countdown Timer for Study View
 */

import { getStudyPrefs } from './prefs.js';

export const studyRuntime = {
  cardShowTime: 0,
  backShowTime: 0,
  lastFlipLatencyMs: 0,
  isFlipLocked: false,
  flipCountdownTimer: null,
  flipResetTimer: null,
  timerUnsubscribe: null,
  isRatingInProgress: false
};

export function clearStudyTimerSubscription() {
  if (studyRuntime.timerUnsubscribe) {
    studyRuntime.timerUnsubscribe();
    studyRuntime.timerUnsubscribe = null;
  }
}

export function clearFlipCountdownTimer() {
  if (studyRuntime.flipCountdownTimer) {
    clearInterval(studyRuntime.flipCountdownTimer);
    studyRuntime.flipCountdownTimer = null;
  }
  studyRuntime.isFlipLocked = false;
}

export function startFrontActiveRecallTimer() {
  clearFlipCountdownTimer();

  const btn = document.getElementById('btn-main-flip');
  if (!btn) return;

  const prefs = getStudyPrefs();
  const delaySec = Number(prefs.thinkDelaySec || 0);

  if (delaySec <= 0) {
    btn.classList.remove('is-locked');
    btn.innerHTML = `<span class="swipe-flip-icon">⌃</span><span>Vuốt lên để lật thẻ</span>`;
    return;
  }

  const durationMs = delaySec * 1000;
  const startTime = performance.now();
  studyRuntime.isFlipLocked = true;
  btn.classList.add('is-locked');

  const updateCountdown = () => {
    const elapsed = performance.now() - startTime;
    const remainingSec = Math.max(0, (durationMs - elapsed) / 1000);

    if (remainingSec <= 0.05) {
      clearFlipCountdownTimer();
      btn.classList.remove('is-locked');
      btn.innerHTML = `<span class="swipe-flip-icon">⌃</span><span>Vuốt lên để lật thẻ</span>`;
    } else {
      const displaySec = Math.max(1, Math.ceil(remainingSec));
      btn.innerHTML = `
        <span class="swipe-flip-icon">⏳</span>
        <span>Suy nghĩ (${displaySec}s)</span>
      `;
    }
  };

  updateCountdown();
  studyRuntime.flipCountdownTimer = setInterval(updateCountdown, 100);
}

