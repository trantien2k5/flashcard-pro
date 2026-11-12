/**
 * Study Card 3D Flip Animation, Touch Swipe, Mouse Drag & Audio Listeners
 */

import { Rating } from '../../core/fsrs.js';
import { globalStudyTimer } from '../../core/stats.js';
import { onAudioPlayStateChange, speak } from '../../services/audio.js';
import { openWordDetailModal } from '../library/detail-modal.js';
import {
  studyRuntime,
  clearFlipCountdownTimer,
  startFrontActiveRecallTimer
} from './state.js';

/**
 * Tạo handler lật thẻ 3D hỗ trợ vuốt lên 360 độ liên tục và vuốt xuống lật lại
 */
export function createFlipHandler(app, { overlay, flashcardEl, frontFlipControl, fsrsButtonsContainer, btnMainFlip }) {
  return (direction = 'toggle') => {
    try {
      if (!overlay.classList.contains('active')) return;

      if (!app.studySession.isFlipped && studyRuntime.isFlipLocked) {
        btnMainFlip?.classList.add('shake-cue');
        setTimeout(() => btnMainFlip?.classList.remove('shake-cue'), 350);
        return;
      }

      clearFlipCountdownTimer();
      globalStudyTimer.recordActivity();
      const currentlyFlipped = app.studySession.isFlipped;

      if (direction === 'up' && currentlyFlipped) {
        app.studySession.isFlipped = false;
        flashcardEl.classList.remove('flipped');
        flashcardEl.classList.add('flipped-360');

        if (studyRuntime.flipResetTimer) clearTimeout(studyRuntime.flipResetTimer);
        studyRuntime.flipResetTimer = setTimeout(() => {
          flashcardEl.classList.add('no-transition');
          flashcardEl.classList.remove('flipped-360');
          void flashcardEl.offsetHeight;
          requestAnimationFrame(() => {
            flashcardEl.classList.remove('no-transition');
          });
          studyRuntime.flipResetTimer = null;
        }, 290);

        frontFlipControl?.classList.add('visible');
        fsrsButtonsContainer?.classList.remove('visible');
        startFrontActiveRecallTimer();
      } else if (direction === 'down' && currentlyFlipped) {
        app.studySession.isFlipped = false;
        if (studyRuntime.flipResetTimer) {
          clearTimeout(studyRuntime.flipResetTimer);
          studyRuntime.flipResetTimer = null;
        }
        flashcardEl.classList.remove('flipped', 'flipped-360');
        frontFlipControl?.classList.add('visible');
        fsrsButtonsContainer?.classList.remove('visible');
        startFrontActiveRecallTimer();
      } else {
        const isFlipped = app.studySession.flipCard();
        if (studyRuntime.flipResetTimer) {
          clearTimeout(studyRuntime.flipResetTimer);
          studyRuntime.flipResetTimer = null;
        }
        flashcardEl.classList.remove('flipped-360');
        flashcardEl.classList.toggle('flipped', isFlipped);

        if (isFlipped) {
          studyRuntime.backShowTime = performance.now();
          studyRuntime.lastFlipLatencyMs = studyRuntime.backShowTime - (studyRuntime.cardShowTime || studyRuntime.backShowTime);
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
}

/**
 * Gắn cử chỉ chạm màn hình, kéo chuột Desktop và nút lật thẻ
 */
export function bindCardSwipeAndDragGestures(app, { flashcardEl, btnMainFlip, triggerFlip, safeRateCard }) {
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
      e.target.closest('.btn-card-info') ||
      e.target.closest('#card-audio-blind-wrap')
    ) {
      return;
    }
    triggerFlip();
  });

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
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    const elapsed = Date.now() - touchStartTime;

    if (elapsed < 600) {
      if (diffY < -35 && Math.abs(diffY) > Math.abs(diffX) * 0.8) {
        triggerFlip('up');
      } else if (diffY > 35 && Math.abs(diffY) > Math.abs(diffX) * 0.8) {
        triggerFlip('down');
      } else if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (app.studySession.isFlipped) {
          safeRateCard(diffX < 0 ? Rating.Again : Rating.Good);
        }
      }
    }
  }, { passive: true });

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
      if (diffY < -35) triggerFlip('up');
      else if (diffY > 35) triggerFlip('down');
    }
  });
}

/**
 * Gắn nút loa phát âm (mặt trước, mặt sau, câu ví dụ, audio-blind) và nút FSRS Inspector
 */
export function bindCardAudioAndInfo(app) {
  const btnAudioSpeaker = document.getElementById('btn-audio-speaker');
  const btnAudioSpeakerBack = document.getElementById('btn-audio-speaker-back');
  const btnExampleAudio = document.getElementById('btn-example-audio');
  const audioBlindWrap = document.getElementById('card-audio-blind-wrap');

  onAudioPlayStateChange((isPlaying) => {
    if (btnAudioSpeaker) btnAudioSpeaker.classList.toggle('playing', isPlaying);
    if (btnAudioSpeakerBack) btnAudioSpeakerBack.classList.toggle('playing', isPlaying);
  });

  const bindWordSpeak = (el, label) => {
    if (!el) return;
    el.addEventListener('click', (e) => {
      try {
        e.stopPropagation();
        globalStudyTimer.recordActivity();
        if (app.studySession?.currentCard) {
          speak(app.studySession.currentCard.word, { cardObj: app.studySession.currentCard });
        }
      } catch (err) {
        console.error(`Lỗi phát âm ${label}:`, err);
      }
    });
  };

  bindWordSpeak(btnAudioSpeaker, 'mặt trước');
  bindWordSpeak(audioBlindWrap, 'Audio Blind');
  bindWordSpeak(btnAudioSpeakerBack, 'mặt sau');

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

  const handleShowCardInfo = (e) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      globalStudyTimer.recordActivity();
      const currentCard = app.studySession?.currentCard;
      if (currentCard) {
        openWordDetailModal(currentCard, app);
      }
    } catch (err) {
      console.error('Lỗi mở chi tiết từ vựng:', err);
    }
  };

  const btnCardInfoFront = document.getElementById('btn-card-info-front');
  const btnCardInfoBack = document.getElementById('btn-card-info-back');
  if (btnCardInfoFront) btnCardInfoFront.addEventListener('click', handleShowCardInfo);
  if (btnCardInfoBack) btnCardInfoBack.addEventListener('click', handleShowCardInfo);
}

