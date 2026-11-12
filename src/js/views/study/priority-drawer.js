/**
 * Study Priority Switcher & Preferences Drawer (3-Dot Menu) Controller
 */

import { StorageManager } from '../../services/storage.js';
import { showConfirm } from '../components.js';
import {
  DEFAULT_STUDY_PREFS,
  getStudyPrefs,
  saveStudyPrefs,
  applyRatingButtonsMode
} from './prefs.js';
import { applyFieldVisibility } from './renderer.js';

/**
 * Cập nhật hiển thị nhãn và biểu tượng chế độ ưu tiên trên Header thanh học Flashcard
 */
export function updateStudyPriorityUI(mode = 'due_first') {
  const iconEl = document.getElementById('study-priority-icon');
  const labelEl = document.getElementById('study-priority-label');
  const optionBtns = document.querySelectorAll('.priority-option-btn');

  const modeConfig = {
    due_first: { icon: '🎯', label: 'Cần ôn' },
    new_only: { icon: '🌱', label: 'Từ mới' },
    weak_hunter: { icon: '🔥', label: 'Từ khó' },
    sprint_10: { icon: '⚡', label: 'Tốc chiến' },
    audio_blind: { icon: '🎧', label: 'Luyện nghe' }
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
      due_first: 'Cần ôn',
      new_only: 'Ưu tiên Từ mới',
      weak_hunter: 'Ưu tiên Từ khó',
      sprint_10: 'Tốc chiến 10 từ',
      audio_blind: 'Luyện nghe'
    };
    app.showToast?.(`🎯 Đã đổi ưu tiên: ${modeLabels[targetMode] || targetMode} (${newQueue.length} từ)`, 'success', 2000);
    return true;
  } catch (err) {
    console.error('Lỗi switchStudyPriority:', err);
    app.showToast?.('Không thể chuyển thứ tự học: ' + (err?.message || err), 'error');
    return false;
  }
}

/**
 * Gắn sự kiện Drawer tùy chọn học tập, Modal ưu tiên & Đặt lại thẻ hiện tại
 */
export function setupStudyPrefsDrawer(app, { onSwitchToQuiz, onCardRefresh }) {
  const btnMenu = document.getElementById('btn-study-menu');
  const drawer = document.getElementById('study-prefs-drawer');
  const drawerBackdrop = document.getElementById('study-prefs-backdrop');
  const btnCloseDrawer = document.getElementById('btn-prefs-close');
  const btnResetPrefs = document.getElementById('btn-reset-prefs');

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

  const syncCheckboxesFromPrefs = () => {
    const p = getStudyPrefs();
    if (selectStudyMode) selectStudyMode.value = 'flashcard';
    if (selectButtonsMode) selectButtonsMode.value = p.ratingButtonsMode || '2_buttons';
    applyRatingButtonsMode(p.ratingButtonsMode || '2_buttons');
    const isAutoplay = (p.autoplayAudio !== undefined) ? !!p.autoplayAudio : (app.settings?.autoPronounce !== false);
    if (toggleAutoplay) toggleAutoplay.checked = isAutoplay;
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

  const controlEls = [
    selectButtonsMode, toggleAutoplay, selectAccent, toggleShowImage,
    toggleShowPhonetic, toggleShowPos, toggleShowExample, toggleShowExampleVi,
    toggleShowDef, toggleShowCloze, toggleBackLock, selectThinkDelay
  ];
  for (const el of controlEls) {
    if (el) el.addEventListener('change', updatePrefFromControls);
  }

  if (btnResetPrefs) {
    btnResetPrefs.addEventListener('click', () => {
      saveStudyPrefs(DEFAULT_STUDY_PREFS);
      if (app.settings) {
        app.settings.autoPronounce = true;
        app.settings.audioAccent = 'us';
        StorageManager.saveSettings(app.settings);
      }
      if (app.studySession) app.studySession.updateSettings();
      syncCheckboxesFromPrefs();
      if (app.studySession?.currentCard) {
        applyFieldVisibility(DEFAULT_STUDY_PREFS, app.studySession.currentCard);
      }
      app.showToast?.('Đã khôi phục cài đặt mặc định', 'success', 1500);
    });
  }

  if (selectStudyMode) {
    selectStudyMode.addEventListener('change', (e) => {
      if (e.target.value === 'quiz') {
        e.target.value = 'flashcard';
        onSwitchToQuiz?.();
      }
    });
  }

  const openDrawer = () => {
    syncCheckboxesFromPrefs();
    drawer?.classList.add('active');
  };
  const closeDrawer = () => drawer?.classList.remove('active');

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
  const closePriorityModal = () => priorityModal?.classList.remove('active');

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
      if (targetMode) switchStudyPriority(app, targetMode);
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
          onCardRefresh?.(app, app.studySession.currentCard, {
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

  return { closeDrawer };
}

