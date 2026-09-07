/**
 * Study Controller Component - Handles Flashcard 3D flip, FSRS rating interaction, progress & summary modal
 */

import { Rating } from '../fsrs.js';
import { showConfirm } from './feedback.js';
import { globalStudyTimer } from '../timer.js';
import { unlockAudioContext } from '../study-session.js';

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

export function setupStudyControls(app) {
  try {
    const overlay = document.getElementById('study-overlay');
    const flashcardEl = document.getElementById('flashcard-element');
    const fsrsButtonsContainer = document.getElementById('fsrs-buttons-container');
    const btnClose = document.getElementById('btn-study-close');
    const btnAudioFront = document.getElementById('btn-audio-front');

    if (!overlay || !flashcardEl) return;

    // Lật thẻ khi chạm vào thẻ
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
      if (e.target.closest('.btn-tts-audio')) return;
      triggerFlip();
    });

    const handleSpeakAudio = (e) => {
      try {
        e.stopPropagation();
        globalStudyTimer.recordActivity();
        if (app.studySession.currentCard) {
          const word = app.studySession.currentCard.word;
          app.studySession.speak(word);
        }
      } catch (err) {
        console.error('Lỗi phát âm thẻ:', err);
      }
    };

    // Audio button trên mặt trước thẻ
    if (btnAudioFront) {
      btnAudioFront.addEventListener('click', handleSpeakAudio);
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
            globalStudyTimer.endSession();
            overlay.classList.remove('active');
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

    // Keyboard Shortcuts (Space: Flip, 1/2/3/4: Ratings)
    window.addEventListener('keydown', (e) => {
      try {
        if (!overlay.classList.contains('active')) return;
        globalStudyTimer.recordActivity();
        if (e.code === 'Space') {
          e.preventDefault();
          triggerFlip();
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

    // Reset về mặt trước
    flashcardEl.classList.remove('flipped');
    fsrsButtonsContainer.classList.remove('visible');

    // Cập nhật nội dung thẻ và thanh tiến độ (Chỉ tăng khi nhớ từ thành công)
    const completedNum = progress.completed !== undefined ? progress.completed : 0;
    const totalNum = progress.total || 1;
    const percent = Math.min(100, Math.max(completedNum === 0 ? 0 : 5, Math.round((completedNum / totalNum) * 100)));
    
    const progressText = document.getElementById('study-progress-text');
    if (progressText) progressText.textContent = `${completedNum} / ${totalNum}`;

    const progressBar = document.getElementById('study-progress-bar-fill');
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }

    const posBack = document.getElementById('card-pos-badge-back');
    if (posBack) posBack.textContent = (card.pos || 'word').toUpperCase();
    
    const cefrText = card.level || 'A2';
    const cefrBadgeBack = document.getElementById('card-cefr-badge-back');
    if (cefrBadgeBack) cefrBadgeBack.textContent = cefrText;

    const wordFront = document.getElementById('card-front-word');
    const phoneticFront = document.getElementById('card-front-phonetic');
    const meaningBack = document.getElementById('card-back-meaning');
    const exBack = document.getElementById('card-back-example');

    if (wordFront) wordFront.textContent = card.word || '';
    if (phoneticFront) phoneticFront.textContent = card.phonetic || '';
    if (meaningBack) meaningBack.textContent = card.meaning || '';

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

    // Cập nhật FSRS Dynamic Intervals trên 4 nút (Loại bỏ hoàn toàn dấu <)
    if (card.previews) {
      const iAgain = document.getElementById('interval-again');
      const iHard = document.getElementById('interval-hard');
      const iGood = document.getElementById('interval-good');
      const iEasy = document.getElementById('interval-easy');

      const formatClean = (txt, fallback) => (txt || fallback).toString().replace(/^[<≤\s]+/, '').trim();
      if (iAgain) iAgain.textContent = formatClean(card.previews[Rating.Again]?.intervalText, '1m');
      if (iHard) iHard.textContent = formatClean(card.previews[Rating.Hard]?.intervalText, '10m');
      if (iGood) iGood.textContent = formatClean(card.previews[Rating.Good]?.intervalText, '1d');
      if (iEasy) iEasy.textContent = formatClean(card.previews[Rating.Easy]?.intervalText, '4d');
    }
  } catch (err) {
    console.error('Lỗi trong handleCardChange:', err);
  }
}

export function handleStudyFinish(app, sessionStats) {
  try {
    globalStudyTimer.endSession();
    const overlay = document.getElementById('study-overlay');
    if (overlay) overlay.classList.remove('active');
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
