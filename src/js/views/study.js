/**
 * Study View Controller - Flashcard 3D Interactive Learning Engine
 * Hỗ trợ chế độ Tối giản Mặc định, Nút Lật Thẻ Trực Quan & Bảng điều khiển Menu 3 chấm
 */

import { Rating, State } from '../core/fsrs.js';
import { StorageManager } from '../services/storage.js';
import { showConfirm } from './components.js';
import { globalStudyTimer, BehavioralOptimizer } from '../core/stats.js';
import { unlockAudioContext } from '../core/session.js';
import { escapeHTML, formatCleanInterval, scrollToTop } from '../utils.js';
import { onAudioPlayStateChange, speak, speakVi, stopAudio } from '../services/audio.js';

// ==========================================
// MODULAR SUB-CONTROLLERS (CHIA ĐỂ TRỊ)
// ==========================================
import {
  DEFAULT_AUTOPLAY_CONFIG,
  getAutoPlayPrefs,
  saveAutoPlayPrefs,
  DEFAULT_STUDY_PREFS,
  getStudyPrefs,
  saveStudyPrefs,
  applyRatingButtonsMode
} from './study/prefs.js';

import {
  getStudyOverlay,
  renderStudyOverlayShell
} from './study/shell.js';

import {
  initPomodoroTracker,
  stopPomodoroTracker,
  recordPomodoroCardReviewed
} from './study/pomodoro.js';

import {
  showSummaryModal
} from './study/summary-modal.js';

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
  showSummaryModal
};

let _isAutoPlaying = false;
let _autoPlayTimer = null;
let _cardShowTime = 0;
let _backShowTime = 0;
let _lastFlipLatencyMs = 0;
let _isFlipLocked = false;
let _flipCountdownTimer = null;

export function isAutoPlayActive() {
  return _isAutoPlaying;
}

export function updateAutoPlayUI(isPlaying) {
  const btnAutoplay = document.getElementById('btn-study-autoplay');
  if (btnAutoplay) {
    if (isPlaying) {
      btnAutoplay.classList.add('active');
    } else {
      btnAutoplay.classList.remove('active');
    }
    const playIcon = btnAutoplay.querySelector('.icon-autoplay-play');
    const pauseIcon = btnAutoplay.querySelector('.icon-autoplay-pause');
    if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
    if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
  }

  const btnAction = document.getElementById('btn-autoplay-main-action');
  if (btnAction) {
    if (isPlaying) {
      btnAction.className = 'btn-autoplay-main-action is-pause';
      btnAction.innerHTML = `
        <span class="action-icon">⏸️</span>
        <span class="action-text">Tạm dừng tự động học</span>
      `;
    } else {
      btnAction.className = 'btn-autoplay-main-action is-start';
      btnAction.innerHTML = `
        <span class="action-icon">▶️</span>
        <span class="action-text">Bắt đầu tự động học</span>
      `;
    }
  }
}

export function stopAutoPlay() {
  _isAutoPlaying = false;
  if (_autoPlayTimer) {
    clearTimeout(_autoPlayTimer);
    _autoPlayTimer = null;
  }
  updateAutoPlayUI(false);
}

export function startFrontActiveRecallTimer() {
  if (_flipCountdownTimer) {
    clearInterval(_flipCountdownTimer);
    _flipCountdownTimer = null;
  }

  const btn = document.getElementById('btn-main-flip');
  if (!btn) return;

  const prefs = getStudyPrefs();
  const delaySec = Number(prefs.thinkDelaySec || 0);

  if (delaySec <= 0) {
    _isFlipLocked = false;
    btn.classList.remove('is-locked');
    btn.innerHTML = `<span class="swipe-flip-icon">⌃</span><span>Vuốt lên để lật thẻ</span>`;
    return;
  }

  const durationMs = delaySec * 1000;
  const startTime = performance.now();
  _isFlipLocked = true;
  btn.classList.add('is-locked');

  const updateCountdown = () => {
    const elapsed = performance.now() - startTime;
    const remainingSec = Math.max(0, (durationMs - elapsed) / 1000);

    if (remainingSec <= 0.05) {
      _isFlipLocked = false;
      if (_flipCountdownTimer) {
        clearInterval(_flipCountdownTimer);
        _flipCountdownTimer = null;
      }
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
  _flipCountdownTimer = setInterval(updateCountdown, 100);
}

// Cấu hình học tập (Study Prefs) đã được module hóa sang ./study/prefs.js

// Bộ khung DOM Study Overlay đã được module hóa sang ./study/shell.js

/**
 * Cập nhật hiển thị nhãn và biểu tượng chế độ ưu tiên trên Header thanh học Flashcard
 */
export function updateStudyPriorityUI(mode = 'due_first') {
  const iconEl = document.getElementById('study-priority-icon');
  const labelEl = document.getElementById('study-priority-label');
  const optionBtns = document.querySelectorAll('.priority-option-btn');

  const modeConfig = {
    due_first: { icon: '🎯', label: 'Tới hạn' },
    new_only: { icon: '🌱', label: 'Từ mới' },
    weak_hunter: { icon: '🔥', label: 'Từ khó' },
    sprint_10: { icon: '⚡', label: 'Tốc chiến' },
    audio_blind: { icon: '🎧', label: 'Nghe' }
  };

  const cfg = modeConfig[mode] || modeConfig.due_first;
  if (iconEl) iconEl.textContent = cfg.icon;
  if (labelEl) labelEl.textContent = cfg.label;

  optionBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });
}

/**
 * Thay đổi thứ tự ưu tiên học trực tiếp trong phiên học (Zero-exit, liền mạch)
 */
export function switchStudyPriority(app, targetMode) {
  try {
    const context = app.currentStudyContext || {};
    const deckId = context.deckId || null;
    const subtopic = context.subtopic || null;

    const studyData = app.deckManager?.getStudyQueue(deckId, app.settings, subtopic, { mode: targetMode });
    const newQueue = studyData?.queue || [];

    if (!newQueue || newQueue.length === 0) {
      const modeNames = {
        due_first: 'từ tới hạn',
        new_only: 'từ mới chưa học',
        weak_hunter: 'từ khó cần củng cố',
        sprint_10: 'từ cấp bách',
        audio_blind: 'từ để luyện nghe'
      };
      app.showToast?.(`Tuyệt vời! Hiện không có ${modeNames[targetMode] || 'từ nào'}.`, 'info', 2500);
      return false;
    }

    if (!app.currentStudyContext) app.currentStudyContext = {};
    app.currentStudyContext.mode = targetMode;
    if (app.currentStudyContext.options) {
      app.currentStudyContext.options.mode = targetMode;
    } else {
      app.currentStudyContext.options = { mode: targetMode };
    }

    updateStudyPriorityUI(targetMode);
    app.studySession?.start(newQueue);

    const modeLabels = {
      due_first: 'Từ tới hạn',
      new_only: 'Ưu tiên Từ mới',
      weak_hunter: 'Ưu tiên Từ khó',
      sprint_10: 'Tốc chiến 10 từ',
      audio_blind: 'Phản xạ Nghe'
    };
    app.showToast?.(`🎯 Đã đổi ưu tiên: ${modeLabels[targetMode] || targetMode} (${newQueue.length} từ)`, 'success', 2000);
    return true;
  } catch (err) {
    console.error('Lỗi switchStudyPriority:', err);
    app.showToast?.('Không thể chuyển thứ tự học: ' + (err?.message || err), 'error');
    return false;
  }
}

export function setupStudyControls(app) {
  try {
    renderStudyOverlayShell();
    const overlay = getStudyOverlay();
    const flashcardEl = document.getElementById('flashcard-element');
    const fsrsButtonsContainer = document.getElementById('fsrs-buttons-container');
    const frontFlipControl = document.getElementById('front-flip-control');
    const btnMainFlip = document.getElementById('btn-main-flip');
    const btnCardFlipAction = document.getElementById('btn-card-flip-action');

    const btnClose = document.getElementById('btn-study-close');
    const btnMenu = document.getElementById('btn-study-menu');
    const btnAudioSpeaker = document.getElementById('btn-audio-speaker');
    const btnAudioSpeakerBack = document.getElementById('btn-audio-speaker-back');
    const btnExampleAudio = document.getElementById('btn-example-audio');

    const drawer = document.getElementById('study-prefs-drawer');
    const drawerBackdrop = document.getElementById('study-prefs-backdrop');
    const btnCloseDrawer = document.getElementById('btn-prefs-close');
    const btnResetPrefs = document.getElementById('btn-reset-prefs');

    // Các điều khiển tùy chọn trong Drawer
    const selectStudyMode = document.getElementById('pref-select-study-mode');
    const selectButtonsMode = document.getElementById('pref-select-buttons-mode');
    const toggleAutoplay = document.getElementById('pref-toggle-autoplay');
    const selectAccent = document.getElementById('pref-select-accent');
    const toggleShowImage = document.getElementById('pref-toggle-show-image');
    const toggleShowPhonetic = document.getElementById('pref-toggle-show-phonetic');
    const toggleShowPos = document.getElementById('pref-toggle-show-pos');
    const toggleShowExample = document.getElementById('pref-toggle-show-example');
    const toggleShowExampleVi = document.getElementById('pref-toggle-show-example-vi');
    const toggleShowDef = document.getElementById('pref-toggle-show-def');
    const selectThinkDelay = document.getElementById('pref-select-think-delay');
    const toggleBackLock = document.getElementById('pref-toggle-back-lock');
    const toggleShowCloze = document.getElementById('pref-toggle-show-cloze');

    if (!overlay || !flashcardEl || overlay._controlsBound) return;
    overlay._controlsBound = true;

    // Khởi tạo trạng thái điều khiển theo Preferences hiện tại
    const syncCheckboxesFromPrefs = () => {
      const p = getStudyPrefs();
      if (selectStudyMode) selectStudyMode.value = 'flashcard';
      if (selectButtonsMode) selectButtonsMode.value = p.ratingButtonsMode || '2_buttons';
      applyRatingButtonsMode(p.ratingButtonsMode || '2_buttons');
      if (toggleAutoplay) toggleAutoplay.checked = (app.settings?.autoPronounce !== false) && (p.autoplayAudio !== false);
      if (selectAccent) selectAccent.value = (app.settings?.audioAccent || p.audioAccent || 'us').toLowerCase();
      if (toggleShowImage) toggleShowImage.checked = !!p.showImage;
      if (toggleShowPhonetic) toggleShowPhonetic.checked = p.showPhonetic !== false;
      if (toggleShowPos) toggleShowPos.checked = p.showPos !== false;
      if (toggleShowExample) toggleShowExample.checked = p.showExample !== false;
      if (toggleShowExampleVi) toggleShowExampleVi.checked = !!p.showExampleVi;
      if (toggleShowDef) toggleShowDef.checked = !!p.showDefinition;
      if (toggleShowCloze) toggleShowCloze.checked = p.showCloze !== false;
      if (selectThinkDelay) selectThinkDelay.value = String(p.thinkDelaySec ?? 0);
      if (toggleBackLock) toggleBackLock.checked = !!p.enableBackLock;
    };

    const updatePrefFromControls = () => {
      const isAutoplay = !!toggleAutoplay?.checked;
      const p = {
        ...DEFAULT_STUDY_PREFS,
        ratingButtonsMode: selectButtonsMode?.value || '2_buttons',
        autoplayAudio: isAutoplay,
        audioAccent: selectAccent?.value || 'us',
        showImage: !!toggleShowImage?.checked,
        showPhonetic: !!toggleShowPhonetic?.checked,
        showPos: !!toggleShowPos?.checked,
        showCefr: !!toggleShowPos?.checked,
        showExample: !!toggleShowExample?.checked,
        showExampleVi: !!toggleShowExampleVi?.checked,
        showDefinition: !!toggleShowDef?.checked,
        showCloze: !!toggleShowCloze?.checked,
        thinkDelaySec: Number(selectThinkDelay?.value || 0),
        enableBackLock: !!toggleBackLock?.checked
      };
      saveStudyPrefs(p);
      applyRatingButtonsMode(p.ratingButtonsMode);
      if (app.settings) {
        app.settings.autoPronounce = isAutoplay;
        if (selectAccent?.value) app.settings.audioAccent = selectAccent.value;
        StorageManager.saveSettings(app.settings);
      }
      if (app.studySession) {
        app.studySession.updateSettings(app.settings);
      }
      if (app.studySession?.currentCard) {
        applyFieldVisibility(p, app.studySession.currentCard);
      }
    };

    syncCheckboxesFromPrefs();

    if (selectButtonsMode) selectButtonsMode.addEventListener('change', updatePrefFromControls);
    if (toggleAutoplay) toggleAutoplay.addEventListener('change', updatePrefFromControls);
    if (selectAccent) selectAccent.addEventListener('change', updatePrefFromControls);
    if (toggleShowImage) toggleShowImage.addEventListener('change', updatePrefFromControls);
    if (toggleShowPhonetic) toggleShowPhonetic.addEventListener('change', updatePrefFromControls);
    if (toggleShowPos) toggleShowPos.addEventListener('change', updatePrefFromControls);
    if (toggleShowExample) toggleShowExample.addEventListener('change', updatePrefFromControls);
    if (toggleShowExampleVi) toggleShowExampleVi.addEventListener('change', updatePrefFromControls);
    if (toggleShowDef) toggleShowDef.addEventListener('change', updatePrefFromControls);
    if (toggleShowCloze) toggleShowCloze.addEventListener('change', updatePrefFromControls);
    if (toggleBackLock) toggleBackLock.addEventListener('change', updatePrefFromControls);
    if (selectThinkDelay) selectThinkDelay.addEventListener('change', updatePrefFromControls);

    if (btnResetPrefs) {
      btnResetPrefs.addEventListener('click', () => {
        saveStudyPrefs(DEFAULT_STUDY_PREFS);
        if (app.settings) {
          app.settings.autoPronounce = true;
          app.settings.audioAccent = 'us';
          StorageManager.saveSettings(app.settings);
        }
        if (app.studySession) {
          app.studySession.updateSettings();
        }
        syncCheckboxesFromPrefs();
        if (app.studySession?.currentCard) {
          applyFieldVisibility(DEFAULT_STUDY_PREFS, app.studySession.currentCard);
        }
        app.showToast?.('Đã khôi phục cài đặt mặc định', 'success', 1500);
      });
    }

    // Chuyển đổi trực tiếp sang Chế độ Trắc nghiệm (Quiz) trong phiên học
    const switchToQuizMode = () => {
      try {
        if (!app.studySession || !app.studySession.isActive) return;
        const currentIndex = app.studySession.currentIndex || 0;
        const remainingQueue = (app.studySession.queue || []).slice(currentIndex);
        
        if (!remainingQueue || remainingQueue.length === 0) {
          app.showToast?.('Không có thẻ nào còn lại trong hàng đợi.', 'info');
          return;
        }

        stopAutoPlay();
        if (_studyTimerUnsubscribe) {
          _studyTimerUnsubscribe();
          _studyTimerUnsubscribe = null;
        }
        stopPomodoroTracker();
        app.studySession?.stopAudio();
        StorageManager.flushPendingSync();

        overlay.classList.remove('active');
        drawer?.classList.remove('active');
        app.studySession.isActive = false;

        app.startQuizSession(remainingQueue);
        app.showToast?.('🎯 Đã chuyển sang chế độ Trắc nghiệm', 'info', 2000);
      } catch (err) {
        console.error('Lỗi chuyển sang chế độ Trắc nghiệm:', err);
      }
    };

    if (selectStudyMode) {
      selectStudyMode.addEventListener('change', (e) => {
        if (e.target.value === 'quiz') {
          e.target.value = 'flashcard';
          switchToQuizMode();
        }
      });
    }

    // Mở / Đóng Drawer 3 chấm
    const openDrawer = () => {
      syncCheckboxesFromPrefs();
      drawer?.classList.add('active');
    };
    const closeDrawer = () => {
      drawer?.classList.remove('active');
    };

    if (btnMenu) {
      btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        openDrawer();
      });
    }
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    // Điều khiển Modal Chọn Thứ Tự Ưu Tiên Học
    const btnPriority = document.getElementById('btn-study-priority');
    const priorityModal = document.getElementById('study-priority-modal');
    const priorityBackdrop = document.getElementById('study-priority-backdrop');
    const btnClosePriority = document.getElementById('btn-priority-modal-close');
    const priorityOptionBtns = document.querySelectorAll('.priority-option-btn');

    const openPriorityModal = () => {
      const curMode = app.currentStudyContext?.options?.mode || app.currentStudyContext?.mode || 'due_first';
      updateStudyPriorityUI(curMode);
      priorityModal?.classList.add('active');
    };
    const closePriorityModal = () => {
      priorityModal?.classList.remove('active');
    };

    if (btnPriority) {
      btnPriority.addEventListener('click', (e) => {
        e.stopPropagation();
        openPriorityModal();
      });
    }
    if (btnClosePriority) btnClosePriority.addEventListener('click', closePriorityModal);
    if (priorityBackdrop) priorityBackdrop.addEventListener('click', closePriorityModal);

    priorityOptionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetMode = btn.getAttribute('data-mode');
        closePriorityModal();
        if (targetMode) {
          switchStudyPriority(app, targetMode);
        }
      });
    });

    // Thao tác Thẻ: Đặt lại tiến độ (Reset to New)
    const btnActionReset = document.getElementById('btn-action-reset-card');
    if (btnActionReset) {
      btnActionReset.addEventListener('click', async () => {
        if (!app.studySession?.currentCard) return;
        const cardWord = app.studySession.currentCard.word || 'từ vựng';
        const confirmed = await showConfirm({
          title: 'Đặt lại tiến độ từ vựng?',
          message: `Bạn có chắc muốn xóa lịch sử học và đưa từ "${cardWord}" về trạng thái Từ mới không?`,
          confirmText: 'Đặt lại',
          type: 'danger',
          icon: '🔄'
        });
        if (confirmed) {
          closeDrawer();
          app.studySession.resetCurrentCard();
          if (app.studySession.currentCard) {
            handleCardChange(app, app.studySession.currentCard, {
              index: app.studySession.currentIndex,
              completed: app.studySession.completedCount,
              total: app.studySession.totalCards || app.studySession.queue.length,
              remaining: app.studySession.queue.length - app.studySession.currentIndex
            });
          }
          app.showToast(`🔄 Đã đặt lại từ "${cardWord}" về Từ mới`, 'success');
        }
      });
    }

    // Lắng nghe trạng thái phát âm thanh
    onAudioPlayStateChange((isPlaying) => {
      if (btnAudioSpeaker) {
        btnAudioSpeaker.classList.toggle('playing', isPlaying);
      }
      if (btnAudioSpeakerBack) {
        btnAudioSpeakerBack.classList.toggle('playing', isPlaying);
      }
    });

    let _flipResetTimer = null;

    // Lật thẻ khi chạm, vuốt hoặc bấm nút lật (hỗ trợ vuốt lên 360 độ liên tục)
    const triggerFlip = (direction = 'toggle') => {
      try {
        if (!overlay.classList.contains('active')) return;
        
        // Nếu đang ở mặt trước và đang trong thời gian suy nghĩ
        if (!app.studySession.isFlipped && _isFlipLocked) {
          btnMainFlip?.classList.add('shake-cue');
          setTimeout(() => btnMainFlip?.classList.remove('shake-cue'), 350);
          return;
        }

        if (_flipCountdownTimer) {
          clearInterval(_flipCountdownTimer);
          _flipCountdownTimer = null;
        }
        _isFlipLocked = false;

        globalStudyTimer.recordActivity();
        const currentlyFlipped = app.studySession.isFlipped;

        if (direction === 'up' && currentlyFlipped) {
          // LƯỚT TIẾP THUẬN CHIỀU LÊN: Lật tiếp 180deg -> 360deg về lại mặt trước
          app.studySession.isFlipped = false;
          flashcardEl.classList.remove('flipped');
          flashcardEl.classList.add('flipped-360');

          if (_flipResetTimer) clearTimeout(_flipResetTimer);
          _flipResetTimer = setTimeout(() => {
            flashcardEl.classList.add('no-transition');
            flashcardEl.classList.remove('flipped-360');
            void flashcardEl.offsetHeight;
            requestAnimationFrame(() => {
              flashcardEl.classList.remove('no-transition');
            });
            _flipResetTimer = null;
          }, 290);

          frontFlipControl?.classList.add('visible');
          fsrsButtonsContainer?.classList.remove('visible');
          startFrontActiveRecallTimer();
        } else if (direction === 'down' && currentlyFlipped) {
          // LƯỚT XUỐNG: Lật ngược 180deg -> 0deg về lại mặt trước
          app.studySession.isFlipped = false;
          if (_flipResetTimer) {
            clearTimeout(_flipResetTimer);
            _flipResetTimer = null;
          }
          flashcardEl.classList.remove('flipped', 'flipped-360');

          frontFlipControl?.classList.add('visible');
          fsrsButtonsContainer?.classList.remove('visible');
          startFrontActiveRecallTimer();
        } else {
          // Lật bình thường (đổi mặt)
          const isFlipped = app.studySession.flipCard();
          if (_flipResetTimer) {
            clearTimeout(_flipResetTimer);
            _flipResetTimer = null;
          }
          flashcardEl.classList.remove('flipped-360');
          flashcardEl.classList.toggle('flipped', isFlipped);

          if (isFlipped) {
            _backShowTime = performance.now();
            _lastFlipLatencyMs = _backShowTime - (_cardShowTime || _backShowTime);
            frontFlipControl?.classList.remove('visible');
            fsrsButtonsContainer?.classList.add('visible');
          } else {
            frontFlipControl?.classList.add('visible');
            fsrsButtonsContainer?.classList.remove('visible');
            startFrontActiveRecallTimer();
          }
        }
      } catch (err) {
        console.error('Lỗi khi lật thẻ:', err);
      }
    };

    // Sự kiện bấm nút Xem đáp án chính ở dưới
    if (btnMainFlip) {
      btnMainFlip.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerFlip();
      });
    }

    flashcardEl.addEventListener('click', (e) => {
      if (
        e.target.closest('.card-sound-btn-inline') ||
        e.target.closest('.card-sound-btn') || 
        e.target.closest('#btn-audio-speaker') || 
        e.target.closest('#btn-audio-speaker-back') || 
        e.target.closest('#btn-example-audio') ||
        e.target.closest('.btn-card-audio-mini') ||
        e.target.closest('.btn-example-audio') ||
        e.target.closest('#card-audio-blind-wrap')
      ) {
        return;
      }
      triggerFlip();
    });

    let _isRatingInProgress = false;
    const safeRateCard = (rating) => {
      if (!app.studySession || !app.studySession.isActive) return;
      if (!app.studySession.isFlipped) return;
      
      const prefs = getStudyPrefs();
      const backViewMs = _backShowTime > 0 ? (performance.now() - _backShowTime) : 0;

      // Khóa thông minh ở mặt sau (nếu người dùng bật trong Menu 3 chấm)
      if (prefs.enableBackLock) {
        let minLockMs = 0;
        if (rating === Rating.Again) minLockMs = 1500;
        else if (rating === Rating.Hard) minLockMs = 1000;
        else if (rating === Rating.Good) minLockMs = 500;
        else if (rating === Rating.Easy) minLockMs = 0;

        if (backViewMs < minLockMs) {
          const ratingClassMap = {
            [Rating.Again]: '.btn-fsrs-rating.again',
            [Rating.Hard]: '.btn-fsrs-rating.hard',
            [Rating.Good]: '.btn-fsrs-rating.good',
            [Rating.Easy]: '.btn-fsrs-rating.easy'
          };
          const targetBtn = document.querySelector(ratingClassMap[rating]);
          if (targetBtn) {
            targetBtn.classList.remove('shake-cue');
            void targetBtn.offsetWidth;
            targetBtn.classList.add('shake-cue');
          }
          return;
        }
      }

      if (_isRatingInProgress) return;
      _isRatingInProgress = true;

      // Chấm điểm và chuyển thẻ tức thì (0ms latency, không chờ animation)
      try {
        globalStudyTimer.recordActivity();
        const latencySec = _lastFlipLatencyMs > 0 ? Number((_lastFlipLatencyMs / 1000).toFixed(2)) : null;
        const backViewSec = Number((backViewMs / 1000).toFixed(2));

        app.studySession.rateCard(rating, { latencySec, backViewSec, backViewMs: Math.round(backViewMs) });
        recordPomodoroCardReviewed();
        // Ẩn toàn bộ thông báo tạm ngưng/thẻ khó trong phiên học để giữ tâm lý thoải mái và tập trung
      } catch (err) {
        console.error('Lỗi rating thẻ:', err);
      } finally {
        _isRatingInProgress = false;
      }
    };

    // Touch Swipe Gesture Support (Vuốt lên lật thẻ dọc, vuốt xuống lật lại)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    flashcardEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    flashcardEl.addEventListener('touchend', (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      const elapsed = Date.now() - touchStartTime;

      if (elapsed < 600) {
        // 1. Vuốt LÊN (Swipe UP): Lật thẻ dọc xem đáp án & lướt tiếp thuận chiều lên lật lại mặt trước!
        if (diffY < -35 && Math.abs(diffY) > Math.abs(diffX) * 0.8) {
          triggerFlip('up');
        }
        // 2. Vuốt XUỐNG (Swipe DOWN): Lật ngược lại mặt trước
        else if (diffY > 35 && Math.abs(diffY) > Math.abs(diffX) * 0.8) {
          triggerFlip('down');
        }
        // 3. Vuốt NGANG khi đã lật (Swipe Left: Quên, Swipe Right: Tốt)
        else if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
          if (app.studySession.isFlipped) {
            if (diffX < 0) {
              safeRateCard(Rating.Again);
            } else {
              safeRateCard(Rating.Good);
            }
          }
        }
      }
    }, { passive: true });

    // Hỗ trợ chuột / Trackpad trên Desktop: Kéo lên lật thẻ dọc (lướt tiếp lật lại), kéo xuống lật lại
    let mouseStartY = 0;
    let mouseStartTime = 0;
    let isMouseDown = false;

    flashcardEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, svg, path, .card-sound-btn, .btn-example-audio, .btn-card-audio-mini')) return;
      mouseStartY = e.clientY;
      mouseStartTime = Date.now();
      isMouseDown = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const diffY = e.clientY - mouseStartY;
      const elapsed = Date.now() - mouseStartTime;
      if (elapsed < 600 && Math.abs(diffY) > 35) {
        if (diffY < -35) {
          triggerFlip('up');
        } else if (diffY > 35) {
          triggerFlip('down');
        }
      }
    });

    // Phát âm từ vựng mặt trước
    if (btnAudioSpeaker) {
      btnAudioSpeaker.addEventListener('click', (e) => {
        try {
          e.stopPropagation();
          globalStudyTimer.recordActivity();
          if (app.studySession.currentCard) {
            const word = app.studySession.currentCard.word;
            speak(word, { cardObj: app.studySession.currentCard });
          }
        } catch (err) {
          console.error('Lỗi phát âm mặt trước:', err);
        }
      });
    }

    // Chạm vào Waveform Audio Blind để nghe lại phát âm
    const audioBlindWrap = document.getElementById('card-audio-blind-wrap');
    if (audioBlindWrap) {
      audioBlindWrap.addEventListener('click', (e) => {
        try {
          e.stopPropagation();
          globalStudyTimer.recordActivity();
          if (app.studySession?.currentCard) {
            const word = app.studySession.currentCard.word;
            speak(word, { cardObj: app.studySession.currentCard });
          }
        } catch (err) {
          console.error('Lỗi phát âm Audio Blind:', err);
        }
      });
    }

    // Phát âm từ vựng mặt sau
    if (btnAudioSpeakerBack) {
      btnAudioSpeakerBack.addEventListener('click', (e) => {
        try {
          e.stopPropagation();
          globalStudyTimer.recordActivity();
          if (app.studySession.currentCard) {
            const word = app.studySession.currentCard.word;
            speak(word, { cardObj: app.studySession.currentCard });
          }
        } catch (err) {
          console.error('Lỗi phát âm mặt sau:', err);
        }
      });
    }

    // Phát âm câu ví dụ
    if (btnExampleAudio) {
      btnExampleAudio.addEventListener('click', (e) => {
        try {
          e.stopPropagation();
          globalStudyTimer.recordActivity();
          if (app.studySession.currentCard && app.studySession.currentCard.example) {
            speak(app.studySession.currentCard.example);
          }
        } catch (err) {
          console.error('Lỗi phát âm câu ví dụ:', err);
        }
      });
    }

    // Cỗ máy điều phối Auto-Play theo nhịp sinh học tùy chỉnh
    const triggerAutoPlayStep = () => {
      if (!_isAutoPlaying || !app.studySession || !app.studySession.isActive) return;
      const currentCard = app.studySession.currentCard;
      if (!currentCard) {
        stopAutoPlay();
        return;
      }

      if (_autoPlayTimer) {
        clearTimeout(_autoPlayTimer);
        _autoPlayTimer = null;
      }

      const prefs = getAutoPlayPrefs();
      const isFlipped = app.studySession.isFlipped;

      if (!isFlipped) {
        // --- BƯỚC 1: MẶT TRƯỚC (Đọc Tiếng Anh -> Chờ não suy nghĩ -> Lật thẻ) ---
        speak(currentCard.word, {
          cardObj: currentCard,
          onEnd: () => {
            if (!_isAutoPlaying || app.studySession?.currentCard?.id !== currentCard.id) return;
            const frontMs = Math.max(500, Math.round((prefs.frontDelaySec || 3.0) * 1000));
            _autoPlayTimer = setTimeout(() => {
              if (!_isAutoPlaying || app.studySession?.currentCard?.id !== currentCard.id) return;
              if (!app.studySession.isFlipped) {
                triggerFlip();
              }
              triggerAutoPlayStep();
            }, frontMs);
          }
        });
      } else {
        // --- BƯỚC 2: MẶT SAU (Đọc Tiếng Việt nếu bật -> Chờ tiếp thu -> Sang thẻ kế tiếp) ---
        const onBackFinished = () => {
          if (!_isAutoPlaying || app.studySession?.currentCard?.id !== currentCard.id) return;
          const backMs = Math.max(500, Math.round((prefs.backDelaySec || 2.5) * 1000));
          _autoPlayTimer = setTimeout(() => {
            if (!_isAutoPlaying || app.studySession?.currentCard?.id !== currentCard.id) return;
            
            globalStudyTimer.recordActivity();

            // Kiểm tra xem đã đến thẻ cuối cùng trong hàng đợi chưa
            const isLastCard = app.studySession.currentIndex >= (app.studySession.queue.length - 1);
            if (isLastCard && prefs.loopList) {
              // Ghi log streak cho từ cuối cùng và quay về đầu danh sách
              StorageManager.logReview({
                cardId: currentCard.id,
                word: currentCard.word,
                isAutoplay: true
              });
              app.studySession.completedCount = (app.studySession.completedCount || 0) + 1;
              app.studySession.sessionStats.reviewedCount = (app.studySession.sessionStats.reviewedCount || 0) + 1;

              setTimeout(() => {
                if (_isAutoPlaying && app.studySession?.queue?.length) {
                  app.studySession.currentIndex = 0;
                  app.studySession.loadCurrentCard();
                }
              }, 300);
            } else if (isLastCard) {
              // Kết thúc danh sách
              if (app.studySession.stepNextAutoplayCard) {
                app.studySession.stepNextAutoplayCard();
              } else {
                app.studySession.currentIndex++;
                app.studySession.loadCurrentCard();
              }
              stopAutoPlay();
            } else {
              // Chuyển sang thẻ kế tiếp: duy trì streak & thời gian học nhưng KHÔNG đánh giá 4 mức độ FSRS
              if (app.studySession.stepNextAutoplayCard) {
                app.studySession.stepNextAutoplayCard();
              } else {
                StorageManager.logReview({
                  cardId: currentCard.id,
                  word: currentCard.word,
                  isAutoplay: true
                });
                app.studySession.completedCount = (app.studySession.completedCount || 0) + 1;
                app.studySession.sessionStats.reviewedCount = (app.studySession.sessionStats.reviewedCount || 0) + 1;
                app.studySession.currentIndex++;
                app.studySession.loadCurrentCard();
              }
            }
          }, backMs);
        };

        if (prefs.speakVi && currentCard.meaning) {
          speakVi(currentCard.meaning, onBackFinished);
        } else {
          onBackFinished();
        }
      }
    };

    app._studyTriggerAutoPlay = triggerAutoPlayStep;

    // Quản lý Modal Cài Đặt Tự Động Học (Auto-Play Modal)
    const modalAutoplay = document.getElementById('study-autoplay-modal');
    const modalAutoplayBackdrop = document.getElementById('study-autoplay-backdrop');
    const btnCloseAutoplayModal = document.getElementById('btn-autoplay-modal-close');
    const btnAutoplay = document.getElementById('btn-study-autoplay');
    const btnMainAction = document.getElementById('btn-autoplay-main-action');

    const btnFrontMinus = document.getElementById('btn-front-delay-minus');
    const btnFrontPlus = document.getElementById('btn-front-delay-plus');
    const valFrontDelay = document.getElementById('val-front-delay');

    const btnBackMinus = document.getElementById('btn-back-delay-minus');
    const btnBackPlus = document.getElementById('btn-back-delay-plus');
    const valBackDelay = document.getElementById('val-back-delay');

    const toggleSpeakVi = document.getElementById('toggle-autoplay-speak-vi');
    const toggleLoop = document.getElementById('toggle-autoplay-loop');

    let currentAutoPrefs = getAutoPlayPrefs();

    const syncAutoplayInputs = () => {
      currentAutoPrefs = getAutoPlayPrefs();
      if (valFrontDelay) valFrontDelay.textContent = `${currentAutoPrefs.frontDelaySec.toFixed(1)}s`;
      if (valBackDelay) valBackDelay.textContent = `${currentAutoPrefs.backDelaySec.toFixed(1)}s`;
      if (toggleSpeakVi) toggleSpeakVi.checked = !!currentAutoPrefs.speakVi;
      if (toggleLoop) toggleLoop.checked = !!currentAutoPrefs.loopList;
      updateAutoPlayUI(_isAutoPlaying);
    };

    syncAutoplayInputs();

    const openAutoplayModal = () => {
      syncAutoplayInputs();
      if (modalAutoplay) modalAutoplay.classList.add('active');
    };

    const closeAutoplayModal = () => {
      if (modalAutoplay) modalAutoplay.classList.remove('active');
    };

    if (btnAutoplay) {
      btnAutoplay.addEventListener('click', (e) => {
        e.stopPropagation();
        openAutoplayModal();
      });
    }

    if (btnCloseAutoplayModal) {
      btnCloseAutoplayModal.addEventListener('click', closeAutoplayModal);
    }
    if (modalAutoplayBackdrop) {
      modalAutoplayBackdrop.addEventListener('click', closeAutoplayModal);
    }

    // Steppers mặt trước
    if (btnFrontMinus) {
      btnFrontMinus.addEventListener('click', (e) => {
        e.stopPropagation();
        currentAutoPrefs.frontDelaySec = Math.max(1.0, Math.round((currentAutoPrefs.frontDelaySec - 0.5) * 10) / 10);
        saveAutoPlayPrefs(currentAutoPrefs);
        syncAutoplayInputs();
      });
    }
    if (btnFrontPlus) {
      btnFrontPlus.addEventListener('click', (e) => {
        e.stopPropagation();
        currentAutoPrefs.frontDelaySec = Math.min(10.0, Math.round((currentAutoPrefs.frontDelaySec + 0.5) * 10) / 10);
        saveAutoPlayPrefs(currentAutoPrefs);
        syncAutoplayInputs();
      });
    }

    // Steppers mặt sau
    if (btnBackMinus) {
      btnBackMinus.addEventListener('click', (e) => {
        e.stopPropagation();
        currentAutoPrefs.backDelaySec = Math.max(1.0, Math.round((currentAutoPrefs.backDelaySec - 0.5) * 10) / 10);
        saveAutoPlayPrefs(currentAutoPrefs);
        syncAutoplayInputs();
      });
    }
    if (btnBackPlus) {
      btnBackPlus.addEventListener('click', (e) => {
        e.stopPropagation();
        currentAutoPrefs.backDelaySec = Math.min(10.0, Math.round((currentAutoPrefs.backDelaySec + 0.5) * 10) / 10);
        saveAutoPlayPrefs(currentAutoPrefs);
        syncAutoplayInputs();
      });
    }

    // Toggles
    if (toggleSpeakVi) {
      toggleSpeakVi.addEventListener('change', () => {
        currentAutoPrefs.speakVi = toggleSpeakVi.checked;
        saveAutoPlayPrefs(currentAutoPrefs);
      });
    }
    if (toggleLoop) {
      toggleLoop.addEventListener('change', () => {
        currentAutoPrefs.loopList = toggleLoop.checked;
        saveAutoPlayPrefs(currentAutoPrefs);
      });
    }

    // Nút Bắt đầu / Tạm dừng lớn trong popup
    if (btnMainAction) {
      btnMainAction.addEventListener('click', (e) => {
        e.stopPropagation();
        if (_isAutoPlaying) {
          stopAutoPlay();
          app.showToast('⏸️ Đã tạm dừng tự động học', 'info', 1500);
        } else {
          _isAutoPlaying = true;
          updateAutoPlayUI(true);
          closeAutoplayModal();
          app.showToast('▶️ Đang tự động lật thẻ & học rảnh tay', 'success', 2000);
          triggerAutoPlayStep();
        }
      });
    }

    // Đóng phiên học với Custom Confirmation
    if (btnClose) {
      btnClose.addEventListener('click', async () => {
        try {
          stopAutoPlay();
          const stats = app.studySession.sessionStats;
          const reviewed = stats.reviewedCount || 0;
          const confirmed = await showConfirm({
            title: 'Thoát phiên học?',
            message: reviewed > 0 
              ? `Bạn đã hoàn thành ${reviewed} thẻ trong phiên học này. Bạn có chắc chắn muốn thoát không?`
              : 'Bạn có chắc chắn muốn thoát phiên học này không?',
            confirmText: 'Xác nhận',
            type: 'danger',
            icon: '🚪'
          });

          if (confirmed) {
            if (_studyTimerUnsubscribe) {
              _studyTimerUnsubscribe();
              _studyTimerUnsubscribe = null;
            }
            stopPomodoroTracker();
            app.studySession?.stopAudio();
            globalStudyTimer.endSession();
    try {
      BehavioralOptimizer.autoCalibrateBackground(app);
    } catch (e) {}
            StorageManager.flushPendingSync();
            overlay.classList.remove('active');
            scrollToTop();
            if (reviewed > 0) {
              showSummaryModal(app, stats, true);
            } else {
              app.refreshAllViews();
            }
          }
        } catch (err) {
          console.error('Lỗi khi đóng phiên học:', err);
        }
      });
    }

    // 4 FSRS Rating buttons
    document.querySelectorAll('.btn-fsrs-rating').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rating = parseInt(btn.getAttribute('data-rating'), 10);
        safeRateCard(rating);
      });
    });

    // Keyboard Shortcuts (Space, 1-4, R, Esc)
    window.addEventListener('keydown', (e) => {
      try {
        if (!overlay.classList.contains('active')) return;
        if (drawer?.classList.contains('active')) {
          if (e.key === 'Escape') closeDrawer();
          return;
        }

        globalStudyTimer.recordActivity();

        if (e.code === 'Space') {
          if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            return;
          }
          e.preventDefault();
          if (!app.studySession.isFlipped) {
            triggerFlip();
          } else {
            // Khi đã lật thẻ: Space đóng vai trò bấm Nhớ (Good)
            safeRateCard(Rating.Good);
          }
          return;
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          if (app.studySession.currentCard) {
            app.studySession.speak(app.studySession.currentCard.word);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (btnClose) btnClose.click();
        } else if (app.studySession.isFlipped) {
          const p = getStudyPrefs();
          const is2Buttons = p.ratingButtonsMode === '2_buttons';
          let rating = null;

          if (is2Buttons) {
            // Chế độ 2 nút tối giản:
            // 1 hoặc Mũi tên trái: Quên (Again)
            // 2 hoặc 3 hoặc Mũi tên phải hoặc Enter: Nhớ (Good)
            if (e.key === '1' || e.key === 'ArrowLeft') {
              rating = Rating.Again;
            } else if (e.key === '2' || e.key === '3' || e.key === 'ArrowRight' || e.key === 'Enter') {
              rating = Rating.Good;
            }
          } else {
            if (e.key === '1') rating = Rating.Again;
            else if (e.key === '2') rating = Rating.Hard;
            else if (e.key === '3') rating = Rating.Good;
            else if (e.key === '4') rating = Rating.Easy;
          }

          if (rating) {
            e.preventDefault();
            safeRateCard(rating);
          }
        }
      } catch (err) {
        console.error('Lỗi phím tắt học:', err);
      }
    });

    // Nút Về trang chủ trong màn hình tổng kết
    const btnSummaryHome = document.getElementById('btn-summary-home');
    if (btnSummaryHome) {
      btnSummaryHome.addEventListener('click', () => {
        try {
          document.getElementById('study-summary-modal')?.classList.remove('active');
          getStudyOverlay()?.classList.remove('active');
          scrollToTop();
          app.refreshAllViews();
          if (app._pendingUpdateReload) {
            app._pendingUpdateReload = false;
            app.showToast('🚀 Đang áp dụng phiên bản mới nhất...', 'success', 2000);
            setTimeout(() => window.location.reload(), 1000);
          }
        } catch (err) {
          console.error('Lỗi đóng summary modal:', err);
        }
      });
    }
  } catch (err) {
    console.error('Lỗi setupStudyControls:', err);
  }
}

// Bộ đệm tham chiếu DOM trong phiên học
let _dom = null;

function getStudyDom() {
  if (_dom && _dom.flashcardEl && document.body.contains(_dom.flashcardEl)) {
    return _dom;
  }
  _dom = {
    overlay: getStudyOverlay(),
    flashcardEl: document.getElementById('flashcard-element'),
    studyControlsWrapper: document.getElementById('study-controls-wrapper'),
    fsrsButtonsContainer: document.getElementById('fsrs-buttons-container'),
    frontFlipControl: document.getElementById('front-flip-control'),
    flashcardStage: document.querySelector('.flashcard-stage'),
    progressText: document.getElementById('study-progress-text'),
    progressBar: document.getElementById('study-progress-bar-fill'),
    imgContainer: document.getElementById('card-front-img-container'),
    imgEl: document.getElementById('card-front-img'),
    badgesFrontWrap: document.getElementById('card-front-badges-wrap'),
    posFront: document.getElementById('card-pos-badge-front'),
    cefrBadgeFront: document.getElementById('card-cefr-badge-front'),
    badgesBackWrap: document.getElementById('card-back-badges-wrap'),
    posBack: document.getElementById('card-pos-badge-back'),
    cefrBadgeBack: document.getElementById('card-cefr-badge-back'),
    wordFront: document.getElementById('card-front-word'),
    wordBackContext: document.getElementById('card-back-word-context-text'),
    phoneticFront: document.getElementById('card-front-phonetic'),
    meaningBack: document.getElementById('card-back-meaning'),
    defBoxBack: document.getElementById('card-back-def-box'),
    defBack: document.getElementById('card-back-def'),
    exBack: document.getElementById('card-back-example'),
    exViBack: document.getElementById('card-back-example-vi'),
    exBoxBack: document.getElementById('card-back-example-box'),
    hintFront: document.getElementById('card-front-hint'),
    hintBack: document.getElementById('card-back-hint'),
    iAgain: document.getElementById('interval-again'),
    iHard: document.getElementById('interval-hard'),
    iGood: document.getElementById('interval-good'),
    iEasy: document.getElementById('interval-easy'),
    btnAudioSpeaker: document.getElementById('btn-audio-speaker'),
    btnAudioSpeakerBack: document.getElementById('btn-audio-speaker-back'),
    btnExampleAudio: document.getElementById('btn-example-audio'),
    statusBadgeFront: document.getElementById('card-front-status-badge'),
    statusTextFront: document.getElementById('card-front-status-text'),
    leechBadgeFront: document.getElementById('card-front-leech-badge'),
    repsBadgeFront: document.getElementById('card-front-reps-badge'),
    repsTextFront: document.getElementById('card-front-reps-text'),
    flipCenter: document.getElementById('card-front-flip-center'),
    backCenter: document.getElementById('card-back-center')
  };
  return _dom;
}

let _studyTimerUnsubscribe = null;

function updateStudyLiveTimerUI(state) {
  if (!state) return;
  const elDigits = document.getElementById('study-timer-digits');
  const elContainer = document.getElementById('study-live-timer');
  if (!elDigits || !elContainer) return;

  const todaySecs = StorageManager.getTodayStudySeconds();
  const liveSecs = todaySecs + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
  const totalMins = liveSecs > 0 && liveSecs < 60 ? 1 : Math.round(liveSecs / 60);

  let timeText = `${totalMins} phút`;
  if (totalMins >= 60) {
    const hrs = Math.floor(totalMins / 60);
    const remMins = totalMins % 60;
    timeText = `${hrs}h ${remMins}p`;
  }

  elDigits.textContent = `⏱️ Đã học: ${timeText}`;

  if (state.isIdle || state.isPaused) {
    elContainer.classList.add('is-idle');
    elContainer.setAttribute('title', `Thời gian đã học hôm nay: ${timeText} (Tạm dừng)`);
  } else {
    elContainer.classList.remove('is-idle');
    elContainer.setAttribute('title', `Thời gian đã học hôm nay: ${timeText}`);
  }
}

// Pomodoro Focus Tracker đã được module hóa sang ./study/pomodoro.js

export function generateClozeSentence(example, word) {
  if (!example || !word) return '';
  try {
    const rawWord = word.trim();
    const escaped = rawWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}[a-z]*\\b|${escaped}`, 'gi');
    return example.replace(regex, '[ ... ]');
  } catch (e) {
    return example;
  }
}

export function startStudySession(app, queue) {
  try {
    const overlay = getStudyOverlay();
    if (!overlay) return;
    overlay.classList.add('active');
    applyRatingButtonsMode(getStudyPrefs().ratingButtonsMode);
    
    // Đồng bộ nhãn chế độ ưu tiên trên header
    const currentMode = app.currentStudyContext?.options?.mode || app.currentStudyContext?.mode || 'due_first';
    updateStudyPriorityUI(currentMode);

    // Mở khóa âm thanh song song không làm nghẽn luồng render giao diện
    setTimeout(() => {
      unlockAudioContext();
    }, 0);
    
    globalStudyTimer.startSession();
    if (_studyTimerUnsubscribe) _studyTimerUnsubscribe();
    _studyTimerUnsubscribe = globalStudyTimer.subscribe((state) => {
      updateStudyLiveTimerUI(state);
    });
    initPomodoroTracker(app);

    // Bỏ qua modal nghỉ ngơi 15 từ để học liền mạch không gián đoạn
    if (app.studySession) {
      app.studySession.onBatchCheckpoint = null;
    }

    app.studySession.start(queue);
  } catch (err) {
    console.error('Lỗi khi bắt đầu startStudySession:', err);
  }
}

function applyFieldVisibility(prefs, card) {
  const dom = getStudyDom();
  if (!dom.flashcardEl) return;

  // 1. Hình ảnh minh họa: Mặc định TẮT
  const imgSrc = card.img || card.image || '';
  if (dom.imgContainer) {
    dom.imgContainer.style.display = (prefs.showImage && imgSrc) ? 'flex' : 'none';
  }

  // 2. Phiên âm IPA ở mặt trước: Mặc định BẬT
  if (dom.phoneticFront) {
    const hasPhonetic = !!(card.phonetic || card.ipa);
    dom.phoneticFront.style.display = (prefs.showPhonetic && hasPhonetic) ? 'inline-block' : 'none';
  }

  // 3. Từ loại (POS) & Cấp độ CEFR
  const hasPos = !!card.pos;
  const cefrVal = card.cefr || card.level;
  const hasCefr = !!cefrVal;

  if (dom.posFront) {
    dom.posFront.style.display = (prefs.showPos && hasPos) ? 'inline-block' : 'none';
  }
  if (dom.cefrBadgeFront) {
    dom.cefrBadgeFront.style.display = (prefs.showCefr && hasCefr) ? 'inline-block' : 'none';
  }
  if (dom.badgesFrontWrap) {
    const showFront = (prefs.showPos && hasPos) || (prefs.showCefr && hasCefr);
    dom.badgesFrontWrap.style.display = showFront ? 'inline-flex' : 'none';
  }

  // Loại từ & Cấp độ CEFR ở mặt sau
  if (dom.posBack) {
    dom.posBack.style.display = (prefs.showPos && hasPos) ? 'inline-block' : 'none';
  }
  if (dom.cefrBadgeBack) {
    dom.cefrBadgeBack.style.display = (prefs.showCefr && hasCefr) ? 'inline-block' : 'none';
  }
  if (dom.badgesBackWrap) {
    const showBack = (prefs.showPos && hasPos) || (prefs.showCefr && hasCefr);
    dom.badgesBackWrap.style.display = showBack ? 'inline-flex' : 'none';
  }

  // 4. Định nghĩa tiếng Anh: Mặc định TẮT
  const defText = card.definition || card.def || '';
  if (dom.defBoxBack) {
    dom.defBoxBack.style.display = (prefs.showDefinition && defText) ? 'flex' : 'none';
  }

  // 5. Câu ví dụ tiếng Anh (BẬT) & Bản dịch tiếng Việt (TẮT)
  const hasExampleEn = !!(prefs.showExample && card.example);
  const hasExampleVi = !!(prefs.showExampleVi && card.exampleVi);

  const topHeader = dom.exBoxBack?.querySelector('#example-top-header') || dom.exBoxBack?.querySelector('.example-top-header');
  if (topHeader) {
    topHeader.style.display = hasExampleEn ? 'flex' : 'none';
  }
  if (dom.exBack) {
    dom.exBack.style.display = hasExampleEn ? 'block' : 'none';
  }
  if (dom.exViBack) {
    dom.exViBack.style.display = hasExampleVi ? 'block' : 'none';
  }
  if (dom.exBoxBack) {
    dom.exBoxBack.style.display = (hasExampleEn || hasExampleVi) ? 'flex' : 'none';
  }

  if (dom.hintFront) dom.hintFront.style.display = 'none';
  if (dom.hintBack) dom.hintBack.style.display = 'none';
}

export function handleCardChange(app, card, progress) {
  try {
    const dom = getStudyDom();
    if (!dom.flashcardEl) return;

    const prefs = getStudyPrefs();

    // 1. Tắt transition và đưa thẻ về mặt trước (0deg) ngay lập tức (0ms)
    dom.flashcardEl.classList.add('no-transition');
    dom.flashcardEl.classList.remove('flipped', 'flipped-360');
    
    // Đặt lại hiển thị controls: Hiện nút Lật thẻ, ẩn 4 nút Rating
    if (dom.frontFlipControl) dom.frontFlipControl.classList.add('visible');
    if (dom.fsrsButtonsContainer) dom.fsrsButtonsContainer.classList.remove('visible');

    // Chuyển thẻ tức thời 0ms (loại bỏ độ trễ và hiệu ứng trượt)
    if (dom.flashcardStage) {
      dom.flashcardStage.classList.remove('tiktok-slide-up', 'tiktok-slide-enter', 'tiktok-slide-in', 'card-enter-anim');
    }
    requestAnimationFrame(() => {
      dom.flashcardEl?.classList.remove('no-transition');
    });

    if (dom.btnAudioSpeaker) dom.btnAudioSpeaker.classList.remove('playing');
    if (dom.btnAudioSpeakerBack) dom.btnAudioSpeakerBack.classList.remove('playing');

    // Cập nhật nội dung thẻ và thanh tiến độ
    const completedNum = progress.completed !== undefined ? progress.completed : 0;
    const totalNum = progress.total || 1;
    const percent = Math.min(100, Math.max(completedNum === 0 ? 0 : 5, Math.round((completedNum / totalNum) * 100)));
    
    if (dom.progressText) {
      dom.progressText.innerHTML = `<span class="counter-num">${completedNum}</span><span class="counter-sep">/</span><span class="counter-total">${totalNum}</span>`;
    }

    if (dom.progressBar) {
      dom.progressBar.style.width = `${percent}%`;
    }

    // Khởi tạo bộ đo thời gian phản xạ lật thẻ của thẻ hiện tại
    _cardShowTime = performance.now();
    _backShowTime = 0;
    _lastFlipLatencyMs = 0;
    startFrontActiveRecallTimer();

    // Cập nhật trạng thái thẻ FSRS và số lần học bấm thẻ (reps)
    const cardState = card.fsrsState || StorageManager.getCardState(card.id) || { state: State.New, reps: 0 };
    const stateNum = cardState.state !== undefined ? cardState.state : State.New;
    const repsCount = cardState.reps || 0;
    const isLeech = Boolean(cardState.isLeech === true || (cardState.lapses && cardState.lapses >= (app.settings?.leechThreshold || 8)));

    let stateText = 'Từ mới';
    let stateClass = 'state-new';

    const isRelearnPass = Boolean(progress.isRelearnPass || card._isRelearnPass);
    if (isRelearnPass) {
      stateClass = 'state-relearning';
      stateText = 'Ôn tập';
    } else if (stateNum === State.Learning || stateNum === 1) {
      stateText = 'Đang học';
      stateClass = 'state-learning';
    } else if (stateNum === State.Review || stateNum === 2) {
      stateText = 'Ôn tập';
      stateClass = 'state-review';
    } else if (stateNum === State.Relearning || stateNum === 3) {
      stateText = 'Ôn tập';
      stateClass = 'state-relearning';
    } else {
      stateText = 'Từ mới';
      stateClass = 'state-new';
    }

    if (dom.statusBadgeFront) {
      dom.statusBadgeFront.className = `card-status-badge ${stateClass}`;
    }
    if (dom.statusTextFront) {
      dom.statusTextFront.textContent = stateText;
    }
    if (dom.leechBadgeFront) {
      dom.leechBadgeFront.style.display = 'none';
    }
    if (dom.repsBadgeFront) {
      dom.repsBadgeFront.style.display = 'none';
    }

    // Nếu là Thẻ khó (Leech), tự động mở rộng câu ví dụ ở mặt sau để tăng cường ngữ cảnh
    if (isLeech && card.example && dom.exBoxBack) {
      dom.exBoxBack.style.display = 'flex';
      if (dom.exBack) dom.exBack.style.display = 'block';
      if (dom.exViBack && card.exampleVi) dom.exViBack.style.display = 'block';
    }

    // Xử lý hình ảnh minh họa
    const imgSrc = card.img || card.image || '';
    if (dom.imgEl) {
      if (imgSrc) {
        dom.imgEl.onerror = () => {
          if (dom.imgContainer) dom.imgContainer.style.display = 'none';
        };
        dom.imgEl.decoding = 'async';
        dom.imgEl.loading = 'eager';
        dom.imgEl.src = imgSrc;
      } else {
        dom.imgEl.removeAttribute('src');
      }
    }

    const wordText = card.word || '';
    if (dom.wordFront) {
      dom.wordFront.textContent = wordText;
      dom.wordFront.classList.remove('word-len-md', 'word-len-lg', 'word-len-xl');
      const wLen = wordText.trim().length;
      if (wLen > 24) {
        dom.wordFront.classList.add('word-len-xl');
      } else if (wLen > 16) {
        dom.wordFront.classList.add('word-len-lg');
      } else if (wLen > 11) {
        dom.wordFront.classList.add('word-len-md');
      }
    }

    if (dom.wordBackContext) {
      dom.wordBackContext.textContent = wordText;
    }

    if (dom.phoneticFront) {
      dom.phoneticFront.textContent = card.phonetic || card.ipa || '';
    }

    const posVal = (card.pos || 'word').toUpperCase();
    if (dom.posFront) {
      dom.posFront.textContent = posVal;
    }
    if (dom.posBack) {
      dom.posBack.textContent = posVal;
    }
    
    const cefrText = (card.cefr || card.level || 'A1').toUpperCase();
    if (dom.cefrBadgeFront) {
      dom.cefrBadgeFront.textContent = cefrText;
    }
    if (dom.cefrBadgeBack) {
      dom.cefrBadgeBack.textContent = cefrText;
    }

    if (dom.meaningBack) {
      const meaningText = card.meaning || '';
      dom.meaningBack.textContent = meaningText;
      dom.meaningBack.classList.remove('meaning-len-lg');
      if (meaningText.length > 30) {
        dom.meaningBack.classList.add('meaning-len-lg');
      }
    }

    // Định nghĩa tiếng Anh
    if (dom.defBack) {
      dom.defBack.textContent = card.definition || card.def || '';
    }

    // Highlight từ vựng trong câu ví dụ tiếng Anh
    if (dom.exBack) {
      if (card.example && card.word) {
        try {
          const safeExample = escapeHTML(card.example);
          const escapedWord = escapeHTML(card.word.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${escapedWord})`, 'gi');
          dom.exBack.innerHTML = safeExample.replace(regex, '<span class="example-highlight">$1</span>');
        } catch (e) {
          dom.exBack.textContent = card.example;
        }
      } else {
        dom.exBack.textContent = card.example || '';
      }
    }

    // Hiển thị câu dịch tiếng Việt
    if (dom.exViBack) {
      dom.exViBack.textContent = card.exampleVi || '';
      dom.exViBack.style.display = card.exampleVi ? 'block' : 'none';
    }

    // Áp dụng bật/tắt trường hiển thị theo preferences
    applyFieldVisibility(prefs, card);

    // Chế độ Luyện Nghe Phản Xạ Mù (Audio Blind Recall)
    const isAudioBlind = !!(progress.isAudioBlind || card._audioBlind);
    const audioBlindWrap = document.getElementById('card-audio-blind-wrap');
    if (isAudioBlind) {
      dom.flashcardEl?.classList.add('is-audio-blind');
      if (audioBlindWrap) audioBlindWrap.style.display = 'flex';
      if (dom.wordFront) {
        dom.wordFront.style.opacity = '0';
        dom.wordFront.style.pointerEvents = 'none';
      }
      if (dom.phoneticFront) {
        dom.phoneticFront.style.opacity = '0';
      }
      if (dom.imgContainer) {
        dom.imgContainer.style.display = 'none';
      }
    } else {
      dom.flashcardEl?.classList.remove('is-audio-blind');
      if (audioBlindWrap) audioBlindWrap.style.display = 'none';
      if (dom.wordFront) {
        dom.wordFront.style.opacity = '1';
        dom.wordFront.style.pointerEvents = 'auto';
      }
      if (dom.phoneticFront) {
        dom.phoneticFront.style.opacity = '1';
      }
    }

    // Gợi ý ngữ cảnh khuyết từ (Contextual Cloze Deletion Hint)
    const clozeContainer = document.getElementById('card-cloze-hint-container');
    const clozeTextEl = document.getElementById('card-cloze-text');
    if (clozeContainer && clozeTextEl) {
      const hasExample = !!(card.example && card.word);
      const isClozeEnabled = prefs.showCloze !== false && !isAudioBlind;
      if (hasExample && isClozeEnabled) {
        const clozeSentence = generateClozeSentence(card.example, card.word);
        clozeTextEl.textContent = `"${clozeSentence}"`;
        clozeContainer.style.display = 'flex';
      } else {
        clozeContainer.style.display = 'none';
      }
    }

    // Cập nhật FSRS Dynamic Intervals trên 4 nút (làm mới dứt điểm, chống rò rỉ nhãn từ thẻ trước)
    if (dom.iAgain) dom.iAgain.textContent = formatCleanInterval(card.previews?.[Rating.Again]?.intervalText, '1m');
    if (dom.iHard) dom.iHard.textContent = formatCleanInterval(card.previews?.[Rating.Hard]?.intervalText, '10m');
    if (dom.iGood) dom.iGood.textContent = formatCleanInterval(card.previews?.[Rating.Good]?.intervalText, '1d');
    if (dom.iEasy) dom.iEasy.textContent = formatCleanInterval(card.previews?.[Rating.Easy]?.intervalText, '4d');

    // Kích hoạt bước tiếp theo nếu đang chạy Auto-Play
    if (_isAutoPlaying) {
      if (_autoPlayTimer) {
        clearTimeout(_autoPlayTimer);
        _autoPlayTimer = null;
      }
      setTimeout(() => {
        if (_isAutoPlaying && app._studyTriggerAutoPlay) {
          app._studyTriggerAutoPlay();
        }
      }, 100);
    }
  } catch (err) {
    console.error('Lỗi trong handleCardChange:', err);
  }
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

      // Kiểm tra tất cả subtopics của deck để tự động đánh dấu hoàn thành nếu 100% thẻ đã học
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

    if (_studyTimerUnsubscribe) {
      _studyTimerUnsubscribe();
      _studyTimerUnsubscribe = null;
    }
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

// Modal tổng kết phiên học (Summary Modal) đã được module hóa sang ./study/summary-modal.js
