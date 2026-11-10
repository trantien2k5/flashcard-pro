/**
 * Study Autoplay Engine
 * Điều phối chế độ Tự động học rảnh tay: đọc tiếng Anh, đếm ngược giây, lật thẻ & đọc nghĩa
 */

import { getAutoPlayPrefs, saveAutoPlayPrefs } from './prefs.js';
import { StorageManager } from '../../services/storage.js';
import { globalStudyTimer } from '../../core/stats.js';
import { speak, speakVi } from '../../services/audio.js';

let _isAutoPlaying = false;
let _autoPlayTimer = null;

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

export function triggerAutoPlayStep(app, triggerFlip) {
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
          if (!app.studySession.isFlipped && typeof triggerFlip === 'function') {
            triggerFlip();
          }
          triggerAutoPlayStep(app, triggerFlip);
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
}

export function setupAutoPlayControls(app, triggerFlip) {
  app._studyTriggerAutoPlay = () => triggerAutoPlayStep(app, triggerFlip);

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

  if (btnAutoplay && !btnAutoplay._bound) {
    btnAutoplay._bound = true;
    btnAutoplay.addEventListener('click', (e) => {
      e.stopPropagation();
      openAutoplayModal();
    });
  }

  if (btnCloseAutoplayModal && !btnCloseAutoplayModal._bound) {
    btnCloseAutoplayModal._bound = true;
    btnCloseAutoplayModal.addEventListener('click', closeAutoplayModal);
  }
  if (modalAutoplayBackdrop && !modalAutoplayBackdrop._bound) {
    modalAutoplayBackdrop._bound = true;
    modalAutoplayBackdrop.addEventListener('click', closeAutoplayModal);
  }

  // Steppers mặt trước
  if (btnFrontMinus && !btnFrontMinus._bound) {
    btnFrontMinus._bound = true;
    btnFrontMinus.addEventListener('click', (e) => {
      e.stopPropagation();
      currentAutoPrefs.frontDelaySec = Math.max(1.0, Math.round((currentAutoPrefs.frontDelaySec - 0.5) * 10) / 10);
      saveAutoPlayPrefs(currentAutoPrefs);
      syncAutoplayInputs();
    });
  }
  if (btnFrontPlus && !btnFrontPlus._bound) {
    btnFrontPlus._bound = true;
    btnFrontPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      currentAutoPrefs.frontDelaySec = Math.min(10.0, Math.round((currentAutoPrefs.frontDelaySec + 0.5) * 10) / 10);
      saveAutoPlayPrefs(currentAutoPrefs);
      syncAutoplayInputs();
    });
  }

  // Steppers mặt sau
  if (btnBackMinus && !btnBackMinus._bound) {
    btnBackMinus._bound = true;
    btnBackMinus.addEventListener('click', (e) => {
      e.stopPropagation();
      currentAutoPrefs.backDelaySec = Math.max(1.0, Math.round((currentAutoPrefs.backDelaySec - 0.5) * 10) / 10);
      saveAutoPlayPrefs(currentAutoPrefs);
      syncAutoplayInputs();
    });
  }
  if (btnBackPlus && !btnBackPlus._bound) {
    btnBackPlus._bound = true;
    btnBackPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      currentAutoPrefs.backDelaySec = Math.min(10.0, Math.round((currentAutoPrefs.backDelaySec + 0.5) * 10) / 10);
      saveAutoPlayPrefs(currentAutoPrefs);
      syncAutoplayInputs();
    });
  }

  // Toggles
  if (toggleSpeakVi && !toggleSpeakVi._bound) {
    toggleSpeakVi._bound = true;
    toggleSpeakVi.addEventListener('change', () => {
      currentAutoPrefs.speakVi = toggleSpeakVi.checked;
      saveAutoPlayPrefs(currentAutoPrefs);
    });
  }
  if (toggleLoop && !toggleLoop._bound) {
    toggleLoop._bound = true;
    toggleLoop.addEventListener('change', () => {
      currentAutoPrefs.loopList = toggleLoop.checked;
      saveAutoPlayPrefs(currentAutoPrefs);
    });
  }

  // Nút Bắt đầu / Tạm dừng lớn trong popup
  if (btnMainAction && !btnMainAction._bound) {
    btnMainAction._bound = true;
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
        triggerAutoPlayStep(app, triggerFlip);
      }
    });
  }
}
