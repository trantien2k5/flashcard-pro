/**
 * Study View Submodule: DOM Cache, Card Face Renderer, Cloze & Field Visibility
 */

import { Rating, State } from '../../core/fsrs.js';
import { globalStudyTimer } from '../../core/timer.js';
import { StorageManager } from '../../services/storage.js';
import { escapeHTML, formatCleanInterval } from '../../utils.js';
import { speak } from '../../services/audio.js';
import { getStudyPrefs, applyRatingButtonsMode } from './prefs.js';
import { getStudyOverlay } from './shell.js';
import { isAutoPlayActive, triggerAutoPlayStep } from './autoplay.js';

// Bộ đệm tham chiếu DOM trong phiên học
let _dom = null;

export function getStudyDom() {
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

export function updateStudyLiveTimerUI(state) {
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


export function applyFieldVisibility(prefs, card) {
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

export function renderCardChange(app, card, progress, hooks = {}) {
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
    if (hooks.onResetTiming) hooks.onResetTiming();
    if (hooks.startFrontActiveRecallTimer) hooks.startFrontActiveRecallTimer();

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
      stateText = 'Luyện lại';
    } else if (stateNum === State.Learning || stateNum === 1) {
      stateText = 'Đang học';
      stateClass = 'state-learning';
    } else if (stateNum === State.Review || stateNum === 2) {
      stateText = 'Ôn lại';
      stateClass = 'state-review';
    } else if (stateNum === State.Relearning || stateNum === 3) {
      stateText = 'Luyện lại';
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
    if (isAutoPlayActive()) {
      setTimeout(() => {
        if (isAutoPlayActive() && app._studyTriggerAutoPlay) {
          app._studyTriggerAutoPlay();
        }
      }, 100);
    }
  } catch (err) {
    console.error('Lỗi trong handleCardChange:', err);
  }
}

