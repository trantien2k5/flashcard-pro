/**
 * Study View Controller - Flashcard 3D Interactive Learning Engine
 * Hỗ trợ chế độ Tối giản Mặc định, Nút Lật Thẻ Trực Quan & Bảng điều khiển Menu 3 chấm
 */

import { Rating, State } from '../core/fsrs.js';
import { StorageManager } from '../services/storage.js';
import { showConfirm } from './components.js';
import { globalStudyTimer } from '../core/stats.js';
import { unlockAudioContext, preloadCardImage } from '../core/session.js';
import { escapeHTML, formatCleanInterval, scrollToTop } from '../utils.js';
import { onAudioPlayStateChange, speak } from '../services/audio.js';

// Cấu hình hiển thị trường dữ liệu mặc định (Tối giản tối đa)
const DEFAULT_STUDY_PREFS = {
  showImage: false,
  showPhonetic: false,
  showDefinition: false,
  showExample: false,
  showBadges: false,
  autoplayAudio: false,
  showHint: false
};

export function getStudyPrefs() {
  try {
    const raw = localStorage.getItem('study_display_prefs');
    if (raw) return { ...DEFAULT_STUDY_PREFS, ...JSON.parse(raw) };
  } catch (e) {}
  return { ...DEFAULT_STUDY_PREFS };
}

export function saveStudyPrefs(prefs) {
  try {
    localStorage.setItem('study_display_prefs', JSON.stringify(prefs));
  } catch (e) {}
}

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
      <!-- Ambient study background glow -->
      <div class="study-ambient-glow" id="study-ambient-glow"></div>

      <!-- Top Header Navigation & Progress -->
      <header class="study-header-bar">
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

            <div class="study-progress-counter" id="study-progress-text" title="Tiến độ phiên học">
              <span class="counter-num">0</span><span class="counter-sep">/</span><span class="counter-total">0</span>
            </div>
          </div>

          <!-- Nút 3 Chấm: Tùy chọn hiển thị trường dữ liệu & Tiện ích nhanh -->
          <button id="btn-study-menu" class="btn-study-menu" title="Tùy chọn hiển thị (Menu 3 chấm)" aria-label="Tùy chọn hiển thị">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="19" cy="12" r="1.5"/>
              <circle cx="5" cy="12" r="1.5"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Study Canvas Center Area -->
      <main class="study-body-wrapper">
        <div class="flashcard-stage">
          <div id="flashcard-element" class="flashcard-3d-wrapper" role="button" tabindex="0" aria-label="Thẻ học từ vựng (Nhấn Space hoặc chạm để lật)">
            
            <!-- ================= MẶT TRƯỚC (FRONT FACE) ================= -->
            <div class="flashcard-face face-front">
              <!-- Top Header Meta: Trạng thái FSRS & Số lần học -->
              <div class="card-top-bar">
                <div class="card-status-badge state-new" id="card-front-status-badge">
                  <span class="status-dot"></span>
                  <span class="status-text" id="card-front-status-text">Từ mới</span>
                </div>
                <div class="card-reps-badge" id="card-front-reps-badge" title="Số lần ôn tập từ này">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                  <span class="reps-text" id="card-front-reps-text">0 lần học</span>
                </div>
              </div>

              <!-- Hình ảnh minh họa (Mặc định ẩn, bật qua 3 chấm) -->
              <div class="card-image-container" id="card-front-img-container" style="display: none;">
                <img id="card-front-img" class="fc-image" alt="Visual representation" />
                <div class="image-gradient-overlay"></div>
              </div>

              <!-- Cụm Từ Vựng & Phát Âm Bản Xứ -->
              <div class="card-word-info">
                <!-- Nút phát âm loa đẹp nằm trên từ tiếng Anh -->
                <button class="card-sound-btn fc-sound-btn" id="btn-audio-speaker" type="button" title="Phát âm từ vựng" aria-label="Phát âm từ vựng">
                  <svg class="speaker-svg-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path class="speaker-wave-1" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path class="speaker-wave-2" d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                  <span class="sound-wave-bars">
                    <span></span><span></span><span></span>
                  </span>
                </button>

                <!-- Từ vựng tiếng Anh -->
                <h2 class="card-word-title fc-title" id="card-front-word">...</h2>
                
                <!-- Phiên âm IPA nằm dưới từ tiếng Anh -->
                <div class="card-phonetic-wrap" id="card-front-phonetic-wrap">
                  <span class="card-word-phonetic fc-phonetic" id="card-front-phonetic" style="display: none;">/ ... /</span>
                </div>
              </div>

              <!-- Footer Gợi Ý Thao Tác Lật Thẻ (Ẩn/Hiện qua cài đặt) -->
              <div class="card-hint-flip" id="card-front-hint" style="display: none;">
                <span class="hint-touch">👆 Chạm để xem đáp án</span>
                <span class="hint-mouse">Chạm hoặc nhấn Space để xem đáp án</span>
              </div>
            </div>

            <!-- ================= MẶT SAU (BACK FACE) ================= -->
            <div class="flashcard-face face-back">
              <!-- Top Header Meta: Từ gốc & Badges loại từ -->
              <div class="card-top-bar">
                <div class="card-back-word-context" title="Từ gốc tiếng Anh">
                  <span class="back-word-label" id="card-back-word-context-text">...</span>
                  <button class="btn-card-audio-mini" id="btn-audio-speaker-back" type="button" title="Nghe lại phát âm" aria-label="Nghe lại phát âm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  </button>
                </div>
                <div class="card-back-badges" id="card-back-badges-wrap" style="display: none;">
                  <span class="card-pos-tag" id="card-pos-badge-back">WORD</span>
                  <span class="card-cefr-tag" id="card-cefr-badge-back">A1</span>
                </div>
              </div>

              <!-- Nội dung Nghĩa & Các trường bổ trợ -->
              <div class="card-back-content">
                <!-- Khối Nghĩa Tiếng Việt Chủ Đạo -->
                <div class="card-meaning-hero">
                  <div class="card-meaning-tag">NGHĨA TIẾNG VIỆT</div>
                  <div class="card-back-meaning fc-meaning" id="card-back-meaning">...</div>
                </div>

                <!-- Khối Định nghĩa Tiếng Anh (Mặc định ẩn, bật qua 3 chấm) -->
                <div class="card-back-def-box" id="card-back-def-box" style="display: none;">
                  <div class="def-icon-quote">“</div>
                  <div class="card-back-def fc-def" id="card-back-def">...</div>
                </div>

                <!-- Khối Câu ví dụ & Bản dịch (Mặc định ẩn, bật qua 3 chấm) -->
                <div class="card-back-example fc-example" id="card-back-example-box" style="display: none;">
                  <div class="example-header-row">
                    <span class="example-label">Ví dụ ngữ cảnh</span>
                    <button class="btn-example-audio" id="btn-example-audio" type="button" title="Đọc câu ví dụ" aria-label="Phát âm câu ví dụ">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="card-example-en" id="card-back-example">...</div>
                  <div class="card-example-vi" id="card-back-example-vi">...</div>
                </div>
              </div>

              <!-- Footer Gợi Ý Thao Tác Lật Lại (Ẩn/Hiện qua cài đặt) -->
              <div class="card-hint-flip" id="card-back-hint" style="display: none;">
                <span class="hint-touch">👆 Chạm thẻ để lật lại</span>
                <span class="hint-mouse">Chạm hoặc nhấn Space để lật lại</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cụm Nút Điều Khiển Gần Thẻ (Nút Lật khi mặt trước / 4 Nút Đánh giá khi mặt sau) -->
        <div class="study-bottom-controls" id="study-controls-wrapper">
          
          <!-- 1. Nút Lật Thẻ Xem Đáp Án khi ở Mặt Trước -->
          <div id="front-flip-control" class="front-flip-control visible">
            <button class="btn-main-flip" id="btn-main-flip" type="button" title="Lật thẻ xem đáp án">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Xem đáp án</span>
            </button>
          </div>

          <!-- 2. Cụm 4 Nút Đánh Giá FSRS khi ở Mặt Sau -->
          <div id="fsrs-buttons-container" class="fsrs-buttons-grid">
            <button class="btn-fsrs-rating again" data-rating="1" title="Quên">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-icon">✕</span>
                <span class="fsrs-rating-title">Quên</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-again">1m</span>
            </button>

            <button class="btn-fsrs-rating hard" data-rating="2" title="Khó">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-icon">⚡</span>
                <span class="fsrs-rating-title">Khó</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-hard">10m</span>
            </button>

            <button class="btn-fsrs-rating good" data-rating="3" title="Nhớ">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-icon">✓</span>
                <span class="fsrs-rating-title">Nhớ</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-good">1d</span>
            </button>

            <button class="btn-fsrs-rating easy" data-rating="4" title="Dễ">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-icon">★</span>
                <span class="fsrs-rating-title">Dễ</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-easy">4d</span>
            </button>
          </div>
        </div>
      </main>

      <!-- Drawer / Modal Tùy chọn hiển thị Menu 3 Chấm -->
      <div class="study-prefs-drawer" id="study-prefs-drawer">
        <div class="study-prefs-backdrop" id="study-prefs-backdrop"></div>
        <div class="study-prefs-content">
          <div class="prefs-header">
            <div class="prefs-title-wrap">
              <span class="prefs-icon">⚙️</span>
              <h3 class="prefs-title">Tùy chọn hiển thị</h3>
            </div>
            <button class="btn-prefs-close" id="btn-prefs-close" title="Đóng bảng tùy chọn" aria-label="Đóng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <p class="prefs-desc">Mặc định hiển thị tinh gọn. Bật thêm trường dữ liệu theo nhu cầu học của bạn:</p>

          <div class="prefs-list">
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🖼️ Hình ảnh minh họa</span>
                <span class="pref-sub">Hiển thị ảnh minh họa từ vựng ở mặt trước</span>
              </div>
              <input type="checkbox" id="pref-toggle-image" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🗣️ Phiên âm IPA</span>
                <span class="pref-sub">Hiển thị ký hiệu phát âm quốc tế (/.../)</span>
              </div>
              <input type="checkbox" id="pref-toggle-phonetic" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">📖 Định nghĩa tiếng Anh</span>
                <span class="pref-sub">Hiển thị giải nghĩa tiếng Anh ở mặt sau</span>
              </div>
              <input type="checkbox" id="pref-toggle-definition" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">💬 Câu ví dụ & Dịch câu</span>
                <span class="pref-sub">Hiển thị câu văn ngữ cảnh thực tế</span>
              </div>
              <input type="checkbox" id="pref-toggle-example" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🏷️ Loại từ & Cấp độ CEFR</span>
                <span class="pref-sub">Hiển thị nhãn Noun, Verb, A1, B1...</span>
              </div>
              <input type="checkbox" id="pref-toggle-badges" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🔊 Tự động phát âm</span>
                <span class="pref-sub">Tự động đọc từ khi xuất hiện thẻ mới</span>
              </div>
              <input type="checkbox" id="pref-toggle-autoplay" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">💡 Gợi ý thao tác lật</span>
                <span class="pref-sub">Hiển thị dòng chữ hướng dẫn lật thẻ ở đáy</span>
              </div>
              <input type="checkbox" id="pref-toggle-hint" class="toggle-checkbox">
            </label>
          </div>

          <div class="prefs-footer">
            <button type="button" class="btn-reset-prefs" id="btn-reset-prefs">
              🔄 Khôi phục tối giản mặc định
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

    // Các checkbox tùy chọn
    const toggleImg = document.getElementById('pref-toggle-image');
    const togglePhonetic = document.getElementById('pref-toggle-phonetic');
    const toggleDef = document.getElementById('pref-toggle-definition');
    const toggleEx = document.getElementById('pref-toggle-example');
    const toggleBadges = document.getElementById('pref-toggle-badges');
    const toggleAutoplay = document.getElementById('pref-toggle-autoplay');
    const toggleHint = document.getElementById('pref-toggle-hint');

    if (!overlay || !flashcardEl) return;

    // Khởi tạo trạng thái checkbox theo Preferences hiện tại
    const syncCheckboxesFromPrefs = () => {
      const p = getStudyPrefs();
      if (toggleImg) toggleImg.checked = !!p.showImage;
      if (togglePhonetic) togglePhonetic.checked = !!p.showPhonetic;
      if (toggleDef) toggleDef.checked = !!p.showDefinition;
      if (toggleEx) toggleEx.checked = !!p.showExample;
      if (toggleBadges) toggleBadges.checked = !!p.showBadges;
      if (toggleAutoplay) toggleAutoplay.checked = !!p.autoplayAudio;
      if (toggleHint) toggleHint.checked = !!p.showHint;
    };

    const updatePrefFromCheckbox = () => {
      const p = {
        showImage: !!toggleImg?.checked,
        showPhonetic: !!togglePhonetic?.checked,
        showDefinition: !!toggleDef?.checked,
        showExample: !!toggleEx?.checked,
        showBadges: !!toggleBadges?.checked,
        autoplayAudio: !!toggleAutoplay?.checked,
        showHint: !!toggleHint?.checked
      };
      saveStudyPrefs(p);
      if (app.studySession?.currentCard) {
        applyFieldVisibility(p, app.studySession.currentCard);
      }
    };

    syncCheckboxesFromPrefs();

    [toggleImg, togglePhonetic, toggleDef, toggleEx, toggleBadges, toggleAutoplay, toggleHint].forEach(cb => {
      if (cb) {
        cb.addEventListener('change', updatePrefFromCheckbox);
      }
    });

    if (btnResetPrefs) {
      btnResetPrefs.addEventListener('click', () => {
        saveStudyPrefs(DEFAULT_STUDY_PREFS);
        syncCheckboxesFromPrefs();
        if (app.studySession?.currentCard) {
          applyFieldVisibility(DEFAULT_STUDY_PREFS, app.studySession.currentCard);
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

    // Lắng nghe trạng thái phát âm thanh
    onAudioPlayStateChange((isPlaying) => {
      if (btnAudioSpeaker) {
        btnAudioSpeaker.classList.toggle('playing', isPlaying);
      }
      if (btnAudioSpeakerBack) {
        btnAudioSpeakerBack.classList.toggle('playing', isPlaying);
      }
    });

    // Lật thẻ khi chạm hoặc bấm nút lật
    const triggerFlip = () => {
      try {
        if (!overlay.classList.contains('active')) return;
        globalStudyTimer.recordActivity();
        const isFlipped = app.studySession.flipCard();
        flashcardEl.classList.toggle('flipped', isFlipped);
        
        if (isFlipped) {
          frontFlipControl?.classList.remove('visible');
          fsrsButtonsContainer?.classList.add('visible');
        } else {
          frontFlipControl?.classList.add('visible');
          fsrsButtonsContainer?.classList.remove('visible');
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
        e.target.closest('.card-sound-btn') || 
        e.target.closest('#btn-audio-speaker') || 
        e.target.closest('#btn-audio-speaker-back') || 
        e.target.closest('#btn-example-audio') ||
        e.target.closest('.btn-card-audio-mini') ||
        e.target.closest('.btn-example-audio')
      ) {
        return;
      }
      triggerFlip();
    });

    let _isRatingInProgress = false;
    const safeRateCard = (rating) => {
      if (!app.studySession || !app.studySession.isActive) return;
      if (!app.studySession.isFlipped) return;
      if (_isRatingInProgress) return;
      _isRatingInProgress = true;
      try {
        globalStudyTimer.recordActivity();
        app.studySession.rateCard(rating);
      } catch (err) {
        console.error('Lỗi rating thẻ:', err);
      } finally {
        setTimeout(() => {
          _isRatingInProgress = false;
        }, 120);
      }
    };

    // Touch Swipe Gesture Support
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

      if (elapsed < 500) {
        if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
          if (app.studySession.isFlipped) {
            if (diffX < 0) {
              safeRateCard(Rating.Again);
            } else {
              safeRateCard(Rating.Good);
            }
          }
        } else if (diffY < -50 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
          if (!app.studySession.isFlipped) {
            triggerFlip();
          }
        }
      }
    }, { passive: true });

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
          document.getElementById('study-overlay')?.classList.remove('active');
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
    overlay: document.getElementById('study-overlay'),
    flashcardEl: document.getElementById('flashcard-element'),
    fsrsButtonsContainer: document.getElementById('fsrs-buttons-container'),
    frontFlipControl: document.getElementById('front-flip-control'),
    flashcardStage: document.querySelector('.flashcard-stage'),
    progressText: document.getElementById('study-progress-text'),
    progressBar: document.getElementById('study-progress-bar-fill'),
    imgContainer: document.getElementById('card-front-img-container'),
    imgEl: document.getElementById('card-front-img'),
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
    repsBadgeFront: document.getElementById('card-front-reps-badge'),
    repsTextFront: document.getElementById('card-front-reps-text')
  };
  return _dom;
}

export function startStudySession(app, queue) {
  try {
    unlockAudioContext();
    const overlay = document.getElementById('study-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    globalStudyTimer.startSession();
    _dom = null;
    app.studySession.start(queue);
  } catch (err) {
    console.error('Lỗi khi bắt đầu startStudySession:', err);
  }
}

function applyFieldVisibility(prefs, card) {
  const dom = getStudyDom();
  if (!dom.flashcardEl) return;

  const imgSrc = card.img || card.image || '';
  if (dom.imgContainer) {
    dom.imgContainer.style.display = (prefs.showImage && imgSrc) ? 'flex' : 'none';
  }

  if (dom.phoneticFront) {
    dom.phoneticFront.style.display = prefs.showPhonetic ? 'inline-block' : 'none';
  }

  if (dom.badgesBackWrap) {
    dom.badgesBackWrap.style.display = prefs.showBadges ? 'inline-flex' : 'none';
  }

  const defText = card.definition || card.def || '';
  if (dom.defBoxBack) {
    dom.defBoxBack.style.display = (prefs.showDefinition && defText) ? 'flex' : 'none';
  }

  if (dom.exBoxBack) {
    dom.exBoxBack.style.display = (prefs.showExample && card.example) ? 'block' : 'none';
  }

  if (dom.hintFront) {
    dom.hintFront.style.display = prefs.showHint ? 'flex' : 'none';
  }
  if (dom.hintBack) {
    dom.hintBack.style.display = prefs.showHint ? 'flex' : 'none';
  }
}

export function handleCardChange(app, card, progress) {
  try {
    const dom = getStudyDom();
    if (!dom.flashcardEl) return;

    const prefs = getStudyPrefs();

    // 1. Tắt transition và đưa thẻ về mặt trước (0deg) ngay lập tức (0ms)
    dom.flashcardEl.classList.add('no-transition');
    dom.flashcardEl.classList.remove('flipped');
    
    // Đặt lại hiển thị controls: Hiện nút Lật thẻ, ẩn 4 nút Rating
    if (dom.frontFlipControl) dom.frontFlipControl.classList.add('visible');
    if (dom.fsrsButtonsContainer) dom.fsrsButtonsContainer.classList.remove('visible');

    // Kích hoạt hiệu ứng xuất hiện thẻ mượt mà
    if (dom.flashcardStage) {
      dom.flashcardStage.classList.remove('card-enter-anim');
      requestAnimationFrame(() => {
        dom.flashcardStage?.classList.add('card-enter-anim');
        dom.flashcardEl?.classList.remove('no-transition');
      });
    }

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

    // Cập nhật trạng thái thẻ FSRS và số lần học bấm thẻ (reps)
    const cardState = card.fsrsState || StorageManager.getCardState(card.id) || { state: State.New, reps: 0 };
    const stateNum = cardState.state !== undefined ? cardState.state : State.New;
    const repsCount = cardState.reps || 0;

    let stateText = 'Từ mới';
    let stateClass = 'state-new';

    if (stateNum === State.Learning || stateNum === 1) {
      stateText = 'Đang học';
      stateClass = 'state-learning';
    } else if (stateNum === State.Review || stateNum === 2) {
      stateText = 'Ôn tập';
      stateClass = 'state-review';
    } else if (stateNum === State.Relearning || stateNum === 3) {
      stateText = 'Luyện lại';
      stateClass = 'state-relearning';
    } else {
      stateText = 'Từ mới';
      stateClass = 'state-new';
    }

    const repsText = repsCount === 0 ? '0 lần học' : `${repsCount} lần học`;

    if (dom.statusBadgeFront) {
      dom.statusBadgeFront.className = `card-status-badge ${stateClass}`;
    }
    if (dom.statusTextFront) {
      dom.statusTextFront.textContent = stateText;
    }
    if (dom.repsTextFront) {
      dom.repsTextFront.textContent = repsText;
    }

    // Xử lý hình ảnh minh họa
    const imgSrc = card.img || card.image || '';
    if (dom.imgEl) {
      if (imgSrc) {
        dom.imgEl.onerror = () => {
          if (dom.imgContainer) dom.imgContainer.style.display = 'none';
        };
        dom.imgEl.decoding = 'sync';
        dom.imgEl.loading = 'eager';
        dom.imgEl.src = imgSrc;
      } else {
        dom.imgEl.removeAttribute('src');
      }
    }

    // Tải và giải mã trước ảnh của 3 thẻ kế tiếp
    if (app.studySession?.queue && app.studySession.currentIndex !== undefined) {
      const nextIdx = app.studySession.currentIndex + 1;
      const nextBatch = app.studySession.queue.slice(nextIdx, nextIdx + 3);
      nextBatch.forEach(nc => {
        const nSrc = nc?.img || nc?.image;
        if (nSrc && typeof nSrc === 'string') {
          preloadCardImage(nSrc);
        }
      });
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

    if (dom.posBack) {
      dom.posBack.textContent = (card.pos || 'word').toUpperCase();
    }
    
    const cefrText = card.cefr || card.level || 'A1';
    if (dom.cefrBadgeBack) {
      dom.cefrBadgeBack.textContent = cefrText.toUpperCase();
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

    // Tự động phát âm nếu được bật
    if (prefs.autoplayAudio && card.word) {
      setTimeout(() => {
        speak(card.word, { cardObj: card });
      }, 100);
    }

    // Cập nhật FSRS Dynamic Intervals trên 4 nút
    if (card.previews) {
      if (dom.iAgain) dom.iAgain.textContent = formatCleanInterval(card.previews[Rating.Again]?.intervalText, '1m');
      if (dom.iHard) dom.iHard.textContent = formatCleanInterval(card.previews[Rating.Hard]?.intervalText, '10m');
      if (dom.iGood) dom.iGood.textContent = formatCleanInterval(card.previews[Rating.Good]?.intervalText, '1d');
      if (dom.iEasy) dom.iEasy.textContent = formatCleanInterval(card.previews[Rating.Easy]?.intervalText, '4d');
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

    if (app.currentStudyContext && app.currentStudyContext.deckId && app.currentStudyContext.subtopic) {
      const deckId = app.currentStudyContext.deckId;
      const subtopic = app.currentStudyContext.subtopic;
      const subCards = app.deckManager?.getSubtopicCards(deckId, subtopic) || [];
      const allLearned = subCards.length > 0 && subCards.every(c => {
        const s = StorageManager.getCardState(c.id);
        return s && s.state !== State.New && s.state !== 0;
      });

      if (allLearned) {
        const subId = typeof subtopic === 'object' ? (subtopic.id || `${deckId}-${subtopic.name}`) : `${deckId}-${subtopic}`;
        StorageManager.completeSubtopic(subId);
        if (typeof subtopic === 'string') {
          StorageManager.completeSubtopic(subtopic);
        }
      }
    }

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
