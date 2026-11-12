/**
 * Study View Controller - Flashcard 3D Interactive Learning Engine (Facade)
 * Hỗ trợ chế độ Tối giản Mặc định, Nút Lật Thẻ Trực Quan & Bảng điều khiển Menu 3 chấm
 */

import { State } from '../core/fsrs.js';
import { StorageManager } from '../services/storage.js';
import { globalStudyTimer, BehavioralOptimizer } from '../core/stats.js';
import { unlockAudioContext } from '../core/session.js';
import { scrollToTop } from '../utils.js';

import {
  DEFAULT_AUTOPLAY_CONFIG,
  getAutoPlayPrefs,
  saveAutoPlayPrefs,
  DEFAULT_STUDY_PREFS,
  getStudyPrefs,
  saveStudyPrefs,
  applyRatingButtonsMode
} from './study/prefs.js';
import { getStudyOverlay, renderStudyOverlayShell } from './study/shell.js';
import { initPomodoroTracker, stopPomodoroTracker, recordPomodoroCardReviewed } from './study/pomodoro.js';
import { showSummaryModal } from './study/summary-modal.js';
import {
  isAutoPlayActive,
  updateAutoPlayUI,
  stopAutoPlay,
  triggerAutoPlayStep,
  setupAutoPlayControls
} from './study/autoplay.js';
import { updateStudyLiveTimerUI, renderCardChange } from './study/renderer.js';
import { studyRuntime, clearStudyTimerSubscription, startFrontActiveRecallTimer } from './study/state.js';
import { updateStudyPriorityUI, switchStudyPriority, setupStudyPrefsDrawer } from './study/priority-drawer.js';
import { createFlipHandler, bindCardSwipeAndDragGestures, bindCardAudioAndInfo } from './study/gestures.js';
import { switchToQuizMode, createRateHandler, bindStudyRatingAndShortcuts } from './study/actions.js';

// Re-export toàn bộ API để tương thích 100% với các view và script bên ngoài
export {
  DEFAULT_AUTOPLAY_CONFIG,
  getAutoPlayPrefs,
  saveAutoPlayPrefs,
  DEFAULT_STUDY_PREFS,
  getStudyPrefs,
  saveStudyPrefs,
  applyRatingButtonsMode,
  getStudyOverlay,
  renderStudyOverlayShell,
  initPomodoroTracker,
  stopPomodoroTracker,
  recordPomodoroCardReviewed,
  showSummaryModal,
  isAutoPlayActive,
  updateAutoPlayUI,
  stopAutoPlay,
  triggerAutoPlayStep,
  setupAutoPlayControls,
  startFrontActiveRecallTimer,
  updateStudyPriorityUI,
  switchStudyPriority
};

export function setupStudyControls(app) {
  try {
    renderStudyOverlayShell();
    const overlay = getStudyOverlay();
    const flashcardEl = document.getElementById('flashcard-element');
    const fsrsButtonsContainer = document.getElementById('fsrs-buttons-container');
    const frontFlipControl = document.getElementById('front-flip-control');
    const btnMainFlip = document.getElementById('btn-main-flip');

    if (!overlay || !flashcardEl || overlay._controlsBound) return;
    overlay._controlsBound = true;

    let closeDrawerFn = null;
    const { closeDrawer } = setupStudyPrefsDrawer(app, {
      onSwitchToQuiz: () => switchToQuizMode(app, closeDrawerFn),
      onCardRefresh: (appRef, card, progress) => handleCardChange(appRef, card, progress)
    });
    closeDrawerFn = closeDrawer;

    const triggerFlip = createFlipHandler(app, {
      overlay,
      flashcardEl,
      frontFlipControl,
      fsrsButtonsContainer,
      btnMainFlip
    });
    const safeRateCard = createRateHandler(app);

    bindCardSwipeAndDragGestures(app, {
      flashcardEl,
      btnMainFlip,
      triggerFlip,
      safeRateCard
    });
    bindCardAudioAndInfo(app);
    setupAutoPlayControls(app, triggerFlip);
    bindStudyRatingAndShortcuts(app, {
      overlay,
      triggerFlip,
      safeRateCard,
      closeDrawer
    });
  } catch (err) {
    console.error('Lỗi setupStudyControls:', err);
  }
}

export function startStudySession(app, queue) {
  try {
    const overlay = getStudyOverlay();
    if (!overlay) return;
    overlay.classList.add('active');
    applyRatingButtonsMode(getStudyPrefs().ratingButtonsMode);

    const currentMode = app.currentStudyContext?.options?.mode || app.currentStudyContext?.mode || 'due_first';
    updateStudyPriorityUI(currentMode);

    setTimeout(() => {
      unlockAudioContext();
    }, 0);

    globalStudyTimer.startSession();
    clearStudyTimerSubscription();
    studyRuntime.timerUnsubscribe = globalStudyTimer.subscribe((state) => {
      updateStudyLiveTimerUI(state);
    });
    initPomodoroTracker(app);

    if (app.studySession) {
      app.studySession.onBatchCheckpoint = null;
    }

    app.studySession.start(queue);
  } catch (err) {
    console.error('Lỗi khi bắt đầu startStudySession:', err);
  }
}

export function handleCardChange(app, card, progress) {
  return renderCardChange(app, card, progress, {
    onResetTiming: () => {
      studyRuntime.cardShowTime = performance.now();
      studyRuntime.backShowTime = 0;
      studyRuntime.lastFlipLatencyMs = 0;
    },
    startFrontActiveRecallTimer,
    updateStudyPriorityUI
  });
}

export function handleStudyFinish(app, sessionStats) {
  try {
    stopAutoPlay();
    stopPomodoroTracker();
    app.studySession?.stopAudio();
    globalStudyTimer.endSession();
    StorageManager.flushPendingSync();
    const overlay = getStudyOverlay();
    if (overlay) overlay.classList.remove('active');
    scrollToTop();

    if (app.currentStudyContext && app.currentStudyContext.deckId) {
      const deckId = app.currentStudyContext.deckId;
      const deck = app.deckManager?.getDeckById(deckId);
      const rawSubtopics = deck ? (Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : [])) : [];

      for (let idx = 0; idx < rawSubtopics.length; idx++) {
        const sObj = rawSubtopics[idx];
        const sName = typeof sObj === 'object' ? (sObj.name || sObj.id) : String(sObj);
        const sId = typeof sObj === 'object' ? (sObj.id || `${deckId}-${idx}`) : `${deckId}-${idx}`;
        const sCards = app.deckManager?.getSubtopicCards(deckId, sObj) || [];

        const allLearned = sCards.length > 0 && sCards.every(c => {
          const s = StorageManager.getCardState(c.id);
          return s && s.state !== State.New && s.state !== 0;
        });

        if (allLearned) {
          StorageManager.completeSubtopic(sId);
          if (typeof sObj === 'object' && sObj.id) StorageManager.completeSubtopic(sObj.id);
          if (sName) {
            StorageManager.completeSubtopic(sName);
            StorageManager.completeSubtopic(`${deckId}-${sName}`);
          }
          StorageManager.completeSubtopic(`${deckId}-${idx}`);
        }
      }
    }

    clearStudyTimerSubscription();
    globalStudyTimer.endSession();
    try {
      BehavioralOptimizer.autoCalibrateBackground(app);
    } catch (e) {}

    showSummaryModal(app, sessionStats, false);
    app.refreshAllViews();
  } catch (err) {
    console.error('Lỗi trong handleStudyFinish:', err);
  }
}
