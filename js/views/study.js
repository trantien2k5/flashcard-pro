/**
 * Study View Controller - Flashcard 3D Interactive Learning Engine
 */

import { Rating } from '../core/fsrs.js';
import { showConfirm } from './components.js';
import { globalStudyTimer } from '../core/stats.js';
import { unlockAudioContext } from '../core/session.js';
import { escapeHTML, formatCleanInterval, scrollToTop } from '../utils.js';
import { onAudioPlayStateChange, speak } from '../services/audio.js';

export function renderStudyOverlayShell() {
  let overlay = document.getElementById('study-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'study-overlay';
    overlay.className = 'study-overlay';
    document.body.appendChild(overlay);
  }

  if (!overlay.querySelector('.study-header-bar')) {
    overlay.innerHTML = `
      <div class="study-header-bar">
        <div class="study-header-inner">
          <button id="btn-study-close" class="btn-study-exit" title="Thoát phiên học (Esc)" aria-label="Đóng phiên học">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>

          <div class="study-top-bar">
            <div class="study-progress-track-wrapper">
              <div class="study-progress-track">
                <div id="study-progress-bar-fill" class="study-progress-bar-fill" style="width: 0%;"></div>
              </div>
            </div>

            <div class="study-progress-counter" id="study-progress-text">
              <span class="counter-num">0</span><span class="counter-sep">/</span><span class="counter-total">0</span>
            </div>
          </div>
        </div>
      </div>

      <div class="study-body-wrapper">
        <div class="flashcard-stage">
          <div id="flashcard-element" class="flashcard-3d-wrapper">
            <!-- MẶT TRƯỚC -->
            <div class="flashcard-face face-front">
              <div class="card-image-container" id="card-front-img-container" style="display: none;">
                <img id="card-front-img" class="fc-image" alt="Visual" />
              </div>
              <div class="card-word-info">
                <h2 class="card-word-title fc-title" id="card-front-word">...</h2>
                <p class="card-word-phonetic fc-phonetic" id="card-front-phonetic">/ ... /</p>
                <button class="card-sound-btn fc-sound-btn" id="btn-audio-speaker" type="button" title="Phát âm từ vựng (R)" aria-label="Phát âm từ vựng">
                  🔊 Phát âm
                </button>
              </div>
              <div class="card-hint-flip">
                <span class="hint-touch">👆 Chạm để lật mặt sau</span>
                <span class="hint-mouse">Click hoặc nhấn Space để xem nghĩa</span>
              </div>
            </div>

            <!-- MẶT SAU -->
            <div class="flashcard-face face-back">
              <div class="card-back-content">
                <div class="card-back-tag-row">
                  <span class="card-back-tag" id="card-back-tag">NGHĨA TIẾNG VIỆT</span>
                  <span class="card-pos-tag" id="card-pos-badge-back">WORD</span>
                  <span class="card-cefr-tag" id="card-cefr-badge-back">A1</span>
                </div>
                <div class="card-back-meaning fc-meaning" id="card-back-meaning">...</div>
                <div class="card-divider"></div>
                <div class="card-back-def fc-def" id="card-back-def" style="display: none;">...</div>
                <div class="card-back-example fc-example" id="card-back-example-box">
                  <div class="card-example-en" id="card-back-example">...</div>
                  <div class="card-example-vi" id="card-back-example-vi">...</div>
                </div>
              </div>
              <div class="card-hint-flip">
                <span class="hint-touch">👆 Chạm thẻ để lật lại</span>
                <span class="hint-mouse">Click hoặc nhấn Space để lật lại</span>
              </div>
            </div>
          </div>
        </div>

        <div class="study-bottom-controls" id="study-controls-wrapper">
          <div id="fsrs-buttons-container" class="fsrs-buttons-grid">
            <button class="btn-fsrs-rating again" data-rating="1" title="Quên (1)">
              <span class="fsrs-rating-title">Quên</span>
              <span class="fsrs-badge-interval" id="interval-again">1m</span>
            </button>

            <button class="btn-fsrs-rating hard" data-rating="2" title="Khó (2)">
              <span class="fsrs-rating-title">Khó</span>
              <span class="fsrs-badge-interval" id="interval-hard">10m</span>
            </button>

            <button class="btn-fsrs-rating good" data-rating="3" title="Nhớ (3)">
              <span class="fsrs-rating-title">Nhớ</span>
              <span class="fsrs-badge-interval" id="interval-good">1d</span>
            </button>

            <button class="btn-fsrs-rating easy" data-rating="4" title="Dễ (4)">
              <span class="fsrs-rating-title">Dễ</span>
              <span class="fsrs-badge-interval" id="interval-easy">4d</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

export function setupStudyControls(app) {
  try {
    renderStudyOverlayShell();
    const overlay = document.getElementById('study-overlay');
    const flashcardEl = document.getElementById('flashcard-element');
    const fsrsButtonsContainer = document.getElementById('fsrs-buttons-container');
    const btnClose = document.getElementById('btn-study-close');
    const btnAudioSpeaker = document.getElementById('btn-audio-speaker');

    if (!overlay || !flashcardEl) return;

    // Lắng nghe trạng thái phát âm thanh để bật hiệu ứng phát sáng
    onAudioPlayStateChange((isPlaying) => {
      if (btnAudioSpeaker) {
        btnAudioSpeaker.classList.toggle('playing', isPlaying);
      }
    });

    // Lật thẻ khi chạm vào thẻ (ngoại trừ khi chạm vào nút loa)
    const triggerFlip = () => {
      try {
        if (!overlay.classList.contains('active')) return;
        globalStudyTimer.recordActivity();
        const isFlipped = app.studySession.flipCard();
        flashcardEl.classList.toggle('flipped', isFlipped);
        fsrsButtonsContainer.classList.toggle('visible', isFlipped);
      } catch (err) {
        console.error('Lỗi khi lật thẻ:', err);
      }
    };

    flashcardEl.addEventListener('click', (e) => {
      if (e.target.closest('.card-sound-btn') || e.target.closest('#btn-audio-speaker') || e.target.closest('.btn-card-audio-single')) {
        return;
      }
      triggerFlip();
    });

    // Touch Swipe Gesture Support (Vuốt lên: Lật thẻ; Vuốt trái: Quên; Vuốt phải: Nhớ)
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

      // Swipe detected within 500ms and > 50px
      if (elapsed < 500) {
        if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
          // Vuốt ngang
          if (app.studySession.isFlipped) {
            if (diffX < 0) {
              // Vuốt sang trái -> Quên (Again)
              app.studySession.rateCard(Rating.Again);
            } else {
              // Vuốt sang phải -> Nhớ (Good)
              app.studySession.rateCard(Rating.Good);
            }
          }
        } else if (diffY < -50 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
          // Vuốt lên trên -> Lật thẻ
          if (!app.studySession.isFlipped) {
            triggerFlip();
          }
        }
      }
    }, { passive: true });

    // Nút phát âm đơn giản dưới phiên âm
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
          console.error('Lỗi phát âm:', err);
        }
      });
    }

    // Đóng phiên học với Custom Confirmation
    if (btnClose) {
      btnClose.addEventListener('click', async () => {
        try {
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
            app.studySession?.stopAudio();
            globalStudyTimer.endSession();
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
      btn.addEventListener('click', () => {
        try {
          globalStudyTimer.recordActivity();
          const rating = parseInt(btn.getAttribute('data-rating'), 10);
          app.studySession.rateCard(rating);
        } catch (err) {
          console.error('Lỗi rating thẻ:', err);
        }
      });
    });

    // Keyboard Shortcuts (Space: Flip, 1/2/3/4: Ratings, R: Audio, Esc: Exit)
    window.addEventListener('keydown', (e) => {
      try {
        if (!overlay.classList.contains('active')) return;
        globalStudyTimer.recordActivity();

        if (e.code === 'Space') {
          e.preventDefault();
          triggerFlip();
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          if (app.studySession.currentCard) {
            app.studySession.speak(app.studySession.currentCard.word);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (btnClose) btnClose.click();
        } else if (app.studySession.isFlipped) {
          let rating = null;
          if (e.key === '1') rating = Rating.Again;
          else if (e.key === '2') rating = Rating.Hard;
          else if (e.key === '3') rating = Rating.Good;
          else if (e.key === '4') rating = Rating.Easy;

          if (rating) {
            app.studySession.rateCard(rating);
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
          document.getElementById('study-overlay')?.classList.remove('active');
          scrollToTop();
          app.refreshAllViews();
        } catch (err) {
          console.error('Lỗi đóng summary modal:', err);
        }
      });
    }
  } catch (err) {
    console.error('Lỗi setupStudyControls:', err);
  }
}

export function startStudySession(app, queue) {
  try {
    unlockAudioContext();
    const overlay = document.getElementById('study-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    globalStudyTimer.startSession();
    app.studySession.start(queue);
  } catch (err) {
    console.error('Lỗi khi bắt đầu startStudySession:', err);
  }
}

export function handleCardChange(app, card, progress) {
  try {
    const flashcardEl = document.getElementById('flashcard-element');
    const fsrsButtonsContainer = document.getElementById('fsrs-buttons-container');

    if (!flashcardEl || !fsrsButtonsContainer) return;

    // Reset về mặt trước và tắt trạng thái phát âm thanh
    flashcardEl.classList.remove('flipped');
    fsrsButtonsContainer.classList.remove('visible');
    document.getElementById('btn-audio-us')?.classList.remove('playing');
    document.getElementById('btn-audio-uk')?.classList.remove('playing');

    // Cập nhật nội dung thẻ và thanh tiến độ
    const completedNum = progress.completed !== undefined ? progress.completed : 0;
    const totalNum = progress.total || 1;
    const percent = Math.min(100, Math.max(completedNum === 0 ? 0 : 5, Math.round((completedNum / totalNum) * 100)));
    
    const progressText = document.getElementById('study-progress-text');
    if (progressText) {
      progressText.innerHTML = `<span class="counter-num">${completedNum}</span><span class="counter-sep">/</span><span class="counter-total">${totalNum}</span>`;
    }

    const progressBar = document.getElementById('study-progress-bar-fill');
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }

    // Xử lý hình ảnh minh họa trực quan (nếu từ vựng có trường img hoặc image)
    const imgContainer = document.getElementById('card-front-img-container');
    const imgEl = document.getElementById('card-front-img');
    const imgSrc = card.img || card.image || '';
    if (imgContainer && imgEl) {
      if (imgSrc) {
        imgEl.src = imgSrc;
        imgContainer.style.display = 'flex';
      } else {
        imgEl.src = '';
        imgContainer.style.display = 'none';
      }
    }

    const posBack = document.getElementById('card-pos-badge-back');
    if (posBack) posBack.textContent = (card.pos || 'word').toUpperCase();
    
    const cefrText = card.cefr || card.level || 'A1';
    const cefrBadgeBack = document.getElementById('card-cefr-badge-back');
    if (cefrBadgeBack) cefrBadgeBack.textContent = cefrText.toUpperCase();

    const wordFront = document.getElementById('card-front-word');
    const phoneticFront = document.getElementById('card-front-phonetic');
    const meaningBack = document.getElementById('card-back-meaning');
    const defBack = document.getElementById('card-back-def');
    const exBack = document.getElementById('card-back-example');

    if (wordFront) wordFront.textContent = card.word || '';
    if (phoneticFront) phoneticFront.textContent = card.phonetic || card.ipa || '';
    if (meaningBack) meaningBack.textContent = card.meaning || '';

    // Hiển thị định nghĩa tiếng Anh nếu có
    if (defBack) {
      const defText = card.definition || card.def || '';
      if (defText) {
        defBack.textContent = defText;
        defBack.style.display = 'block';
      } else {
        defBack.textContent = '';
        defBack.style.display = 'none';
      }
    }

    // Highlight từ vựng trong câu ví dụ tiếng Anh nếu có
    if (exBack) {
      if (card.example && card.word) {
        try {
          const safeExample = escapeHTML(card.example);
          const escapedWord = escapeHTML(card.word.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${escapedWord})`, 'gi');
          exBack.innerHTML = safeExample.replace(regex, '<span class="example-highlight">$1</span>');
        } catch (e) {
          exBack.textContent = card.example;
        }
      } else {
        exBack.textContent = card.example || '';
      }
    }

    // Hiển thị câu dịch tiếng Việt nếu có
    const exViBack = document.getElementById('card-back-example-vi');
    if (exViBack) {
      if (card.exampleVi) {
        exViBack.textContent = card.exampleVi;
        exViBack.style.display = 'block';
      } else {
        exViBack.textContent = '';
        exViBack.style.display = 'none';
      }
    }

    // Cập nhật FSRS Dynamic Intervals trên 4 nút
    if (card.previews) {
      const iAgain = document.getElementById('interval-again');
      const iHard = document.getElementById('interval-hard');
      const iGood = document.getElementById('interval-good');
      const iEasy = document.getElementById('interval-easy');

      if (iAgain) iAgain.textContent = formatCleanInterval(card.previews[Rating.Again]?.intervalText, '1m');
      if (iHard) iHard.textContent = formatCleanInterval(card.previews[Rating.Hard]?.intervalText, '10m');
      if (iGood) iGood.textContent = formatCleanInterval(card.previews[Rating.Good]?.intervalText, '1d');
      if (iEasy) iEasy.textContent = formatCleanInterval(card.previews[Rating.Easy]?.intervalText, '4d');
    }
  } catch (err) {
    console.error('Lỗi trong handleCardChange:', err);
  }
}

export function handleStudyFinish(app, sessionStats) {
  try {
    app.studySession?.stopAudio();
    globalStudyTimer.endSession();
    const overlay = document.getElementById('study-overlay');
    if (overlay) overlay.classList.remove('active');
    scrollToTop();
    showSummaryModal(app, sessionStats, false);
    app.refreshAllViews();
  } catch (err) {
    console.error('Lỗi trong handleStudyFinish:', err);
  }
}

export function showSummaryModal(app, stats, isEarlyExit = false) {
  try {
    const modal = document.getElementById('study-summary-modal');
    if (!modal) return;

    const titleEl = document.getElementById('summary-modal-title');
    const subtitleEl = document.getElementById('summary-modal-subtitle');
    
    if (isEarlyExit) {
      if (titleEl) titleEl.textContent = '📊 Tổng kết phiên học';
      if (subtitleEl) subtitleEl.textContent = 'Tiến trình của các từ bạn vừa ôn đã được lưu an toàn!';
    } else {
      if (titleEl) titleEl.textContent = '🎉 Xuất sắc! Hoàn thành mục tiêu';
      if (subtitleEl) subtitleEl.textContent = 'Trí nhớ dài hạn của bạn đã được củng cố với thuật toán FSRS-6';
    }

    const reviewed = stats.reviewedCount || (stats.again + stats.hard + stats.good + stats.easy) || 0;
    const remembered = (stats.hard || 0) + (stats.good || 0) + (stats.easy || 0);
    const retentionRate = reviewed > 0 ? Math.round((remembered / reviewed) * 100) : 100;

    const sumTotal = document.getElementById('sum-stat-total');
    const sumRetention = document.getElementById('sum-stat-retention');
    const sumAgain = document.getElementById('sum-stat-again');
    const sumHard = document.getElementById('sum-stat-hard');
    const sumGood = document.getElementById('sum-stat-good');
    const sumEasy = document.getElementById('sum-stat-easy');

    if (sumTotal) sumTotal.textContent = reviewed;
    if (sumRetention) sumRetention.textContent = `${retentionRate}%`;
    if (sumAgain) sumAgain.textContent = stats.again || 0;
    if (sumHard) sumHard.textContent = stats.hard || 0;
    if (sumGood) sumGood.textContent = stats.good || 0;
    if (sumEasy) sumEasy.textContent = stats.easy || 0;

    modal.classList.add('active');
  } catch (err) {
    console.error('Lỗi trong showSummaryModal:', err);
  }
}
