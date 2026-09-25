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
import { onAudioPlayStateChange, speak, speakVi, stopAudio } from '../services/audio.js';

// ==========================================
// CẤU HÌNH TỰ ĐỘNG HỌC (AUTO-PLAY CONFIG & PREFS)
// ==========================================
export const DEFAULT_AUTOPLAY_CONFIG = {
  frontDelaySec: 3.0,     // Giây dừng ở mặt trước để suy nghĩ
  backDelaySec: 2.5,      // Giây dừng ở mặt sau để tiếp thu
  speakVi: true,          // Phát âm nghĩa tiếng Việt ở mặt sau
  loopList: false         // Tự động lặp lại vô tận khi hết danh sách
};

export function getAutoPlayPrefs() {
  try {
    const raw = localStorage.getItem('study_autoplay_prefs');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        frontDelaySec: typeof parsed.frontDelaySec === 'number' ? parsed.frontDelaySec : DEFAULT_AUTOPLAY_CONFIG.frontDelaySec,
        backDelaySec: typeof parsed.backDelaySec === 'number' ? parsed.backDelaySec : DEFAULT_AUTOPLAY_CONFIG.backDelaySec,
        speakVi: parsed.speakVi !== undefined ? !!parsed.speakVi : DEFAULT_AUTOPLAY_CONFIG.speakVi,
        loopList: parsed.loopList !== undefined ? !!parsed.loopList : DEFAULT_AUTOPLAY_CONFIG.loopList
      };
    }
  } catch (e) {}
  return { ...DEFAULT_AUTOPLAY_CONFIG };
}

export function saveAutoPlayPrefs(prefs) {
  try {
    localStorage.setItem('study_autoplay_prefs', JSON.stringify(prefs));
  } catch (e) {}
}

let _isAutoPlaying = false;
let _autoPlayTimer = null;
let _cardShowTime = 0;
let _lastFlipLatencyMs = 0;

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

// Cấu hình hiển thị trường dữ liệu mặc định (Tối giản tối đa)
const DEFAULT_STUDY_PREFS = {
  showImage: false,
  showPhonetic: false,
  showDefinition: false,
  showExample: false,
  showExampleVi: false,
  showPos: false,
  showCefr: false,
  autoplayAudio: false,
  showHint: false
};

export function getStudyPrefs() {
  try {
    const raw = localStorage.getItem('study_display_prefs');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.showBadges !== undefined) {
        if (parsed.showPos === undefined) parsed.showPos = !!parsed.showBadges;
        if (parsed.showCefr === undefined) parsed.showCefr = !!parsed.showBadges;
      }
      if (parsed.showExample !== undefined && parsed.showExampleVi === undefined) {
        parsed.showExampleVi = !!parsed.showExample;
      }
      return { ...DEFAULT_STUDY_PREFS, ...parsed };
    }
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
      <!-- 1. Top Ultra-thin 2px Progress Line (Browser Loading Style) -->
      <div class="study-progress-line-track">
        <div id="study-progress-bar-fill" class="study-progress-line-fill" style="width: 0%;"></div>
      </div>

      <!-- 2. Minimalist Header -->
      <header class="study-header-bar">
        <div class="study-header-inner">
          <button id="btn-study-close" class="btn-study-exit" title="Thoát phiên học (Esc)" aria-label="Đóng phiên học">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Middle Progress Counter -->
          <div class="study-header-center">
            <span class="study-progress-counter" id="study-progress-text" title="Tiến độ học">
              <span class="counter-num">0</span><span class="counter-sep">/</span><span class="counter-total">0</span>
            </span>
          </div>

          <!-- Right Actions (Auto-Play + Dark/Light Toggle + 3 Dots Menu) -->
          <div class="study-header-right">
            <button id="btn-study-autoplay" class="btn-study-icon btn-study-autoplay" title="Tự động lật thẻ & học rảnh tay" aria-label="Tự động học">
              <svg class="icon-autoplay-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 4 20 12 6 20 6 4"></polygon>
              </svg>
              <svg class="icon-autoplay-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            </button>

            <button id="btn-study-theme" class="btn-study-icon" title="Chuyển chế độ Sáng / Tối" aria-label="Đổi giao diện">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>

            <button id="btn-study-menu" class="btn-study-icon" title="Tùy chọn hiển thị" aria-label="Tùy chọn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Study Canvas Center Area -->
      <main class="study-body-wrapper">
        <div class="flashcard-stage">
          <div id="flashcard-element" class="flashcard-3d-wrapper" role="button" tabindex="0" aria-label="Thẻ học từ vựng (Nhấn Space hoặc chạm để lật)">
            
            <!-- ================= MẶT TRƯỚC (FRONT FACE) ================= -->
            <div class="flashcard-face face-front">
              <!-- Top Minimal Status Badge & Top-Right POS Badge -->
              <div class="card-top-bar">
                <div class="card-status-badge state-new" id="card-front-status-badge">
                  <span class="status-dot"></span>
                  <span class="status-text" id="card-front-status-text">Từ mới</span>
                </div>
                <div class="card-front-top-right">
                  <div class="card-leech-badge" id="card-front-leech-badge" style="display: none;" title="Thẻ khó nhớ (Leech)">
                    <span class="leech-icon">⚠️</span>
                    <span class="leech-text">Khó nhớ</span>
                  </div>
                  <div class="card-reps-badge" id="card-front-reps-badge" style="display: none;">
                    <span class="reps-text" id="card-front-reps-text">0</span>
                  </div>
                </div>
              </div>

              <!-- Hình ảnh minh họa (Mặc định ẩn, bật qua 3 chấm) -->
              <div class="card-image-container" id="card-front-img-container" style="display: none;">
                <img id="card-front-img" class="fc-image" alt="Visual representation" />
              </div>

              <!-- Cụm Từ Vựng Chính Giữa (One-Focus Clean Layout) -->
              <div class="card-word-center">
                <!-- Nút loa dời lên đầu từ tiếng Anh sinh động, bắt mắt -->
                <button class="card-speaker-hero" id="btn-audio-speaker" type="button" title="Phát âm từ vựng" aria-label="Phát âm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </button>

                <!-- Từ vựng tiếng Anh to, rõ, font hiện đại -->
                <h2 class="card-word-title fc-title" id="card-front-word">...</h2>
                
                <!-- Phiên âm IPA -->
                <div class="card-meta-row" id="card-front-meta-row">
                  <span class="card-word-phonetic fc-phonetic" id="card-front-phonetic">/ ... /</span>
                </div>
              </div>

              <!-- Footer Gợi Ý Thao Tác Lật Thẻ -->
              <div class="card-bottom-bar" id="card-front-hint">
                <span class="card-hint-text">Chạm để xem đáp án</span>
              </div>
            </div>

            <!-- ================= MẶT SAU (BACK FACE) ================= -->
            <div class="flashcard-face face-back">
              <!-- Top Context: Từ gốc tiếng Anh & Loa mini -->
              <div class="card-top-bar">
                <div class="card-back-context-word">
                  <span class="back-word-label" id="card-back-word-context-text">...</span>
                  <button class="btn-card-audio-mini" id="btn-audio-speaker-back" type="button" title="Nghe lại phát âm" aria-label="Nghe lại phát âm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                  </button>
                </div>
                <div class="card-back-badges" id="card-back-badges-wrap" style="display: none;">
                  <span class="card-pos-tag" id="card-pos-badge-back">WORD</span>
                  <span class="card-cefr-tag" id="card-cefr-badge-back">A1</span>
                </div>
              </div>

              <!-- Nội dung Nghĩa & Ví dụ Ngữ cảnh -->
              <div class="card-back-center">
                <!-- Nghĩa Tiếng Việt Chủ Đạo -->
                <div class="card-meaning-hero">
                  <h3 class="card-back-meaning fc-meaning" id="card-back-meaning">...</h3>
                </div>

                <!-- Định nghĩa Tiếng Anh (Mặc định ẩn, bật qua 3 chấm) -->
                <div class="card-back-def-box" id="card-back-def-box" style="display: none;">
                  <p class="card-back-def fc-def" id="card-back-def">...</p>
                </div>

                <!-- Câu ví dụ tiếng Anh (Italic) & Bản dịch mờ bên dưới -->
                <div class="card-back-example fc-example" id="card-back-example-box" style="display: none;">
                  <div class="example-top-header" id="example-top-header">
                    <span class="example-label-tag">Ví dụ</span>
                    <button class="btn-example-audio" id="btn-example-audio" type="button" title="Đọc câu ví dụ" aria-label="Phát âm câu ví dụ">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                      </svg>
                    </button>
                  </div>
                  <p class="card-example-en" id="card-back-example">...</p>
                  <p class="card-example-vi" id="card-back-example-vi">...</p>
                </div>
              </div>

              <!-- Footer Gợi Ý Thao Tác Lật Lại -->
              <div class="card-bottom-bar" id="card-back-hint">
                <span class="card-hint-text">Chạm để lật lại</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cụm Nút Điều Khiển Gần Thẻ -->
        <div class="study-bottom-controls" id="study-controls-wrapper">
          
          <!-- 1. Nút Lật Thẻ Xem Đáp Án khi ở Mặt Trước -->
          <div id="front-flip-control" class="front-flip-control visible">
            <button class="btn-main-flip" id="btn-main-flip" type="button" title="Lật thẻ xem nghĩa">
              <span>Xem đáp án</span>
            </button>
          </div>

          <!-- 2. Cụm 4 Nút Đánh Giá Anki/FSRS: Vibrant Solid Tint -->
          <div id="fsrs-buttons-container" class="fsrs-buttons-grid">
            <button class="btn-fsrs-rating again" data-rating="1" title="Lại (Phím 1)">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-title">Lại</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-again">1m</span>
            </button>

            <button class="btn-fsrs-rating hard" data-rating="2" title="Khó (Phím 2)">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-title">Khó</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-hard">10m</span>
            </button>

            <button class="btn-fsrs-rating good" data-rating="3" title="Tốt (Phím 3)">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-title">Tốt</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-good">1d</span>
            </button>

            <button class="btn-fsrs-rating easy" data-rating="4" title="Dễ (Phím 4)">
              <div class="fsrs-btn-top">
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
                <span class="pref-label">💬 Câu ví dụ tiếng Anh</span>
                <span class="pref-sub">Hiển thị câu ví dụ ngữ cảnh ở mặt sau</span>
              </div>
              <input type="checkbox" id="pref-toggle-example" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label"><svg class="flag-icon-vn" width="18" height="12" viewBox="0 0 30 20" fill="none"><rect width="30" height="20" rx="2" fill="#DA251D"/><polygon points="15,4 16.545,8.755 21.548,8.755 17.501,11.695 19.046,16.45 15,13.51 10.954,16.45 12.499,11.695 8.452,8.755 13.455,8.755" fill="#FFFF00"/></svg> Dịch câu ví dụ</span>
                <span class="pref-sub">Hiển thị bản dịch tiếng Việt của câu ví dụ</span>
              </div>
              <input type="checkbox" id="pref-toggle-example-vi" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🏷️ Loại từ (POS)</span>
                <span class="pref-sub">Hiển thị nhãn Danh từ, Động từ... ở mặt sau</span>
              </div>
              <input type="checkbox" id="pref-toggle-pos" class="toggle-checkbox">
            </label>

            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🎯 Cấp độ CEFR</span>
                <span class="pref-sub">Hiển thị huy hiệu cấp độ (A1, A2, B1, B2...)</span>
              </div>
              <input type="checkbox" id="pref-toggle-cefr" class="toggle-checkbox">
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

          <div class="prefs-card-actions-section">
            <h4 class="prefs-section-subtitle">Thao tác thẻ hiện tại</h4>
            <div class="prefs-actions-grid">
              <button type="button" class="btn-study-card-action" id="btn-action-suspend-card" title="Tạm ngưng học từ này">
                <span class="action-icon">⏸️</span>
                <div class="action-text">
                  <span class="action-title">Tạm dừng thẻ</span>
                  <span class="action-desc">Ẩn khỏi hàng đợi ôn tập</span>
                </div>
              </button>
              <button type="button" class="btn-study-card-action" id="btn-action-reset-card" title="Học lại từ này từ đầu">
                <span class="action-icon">🔄</span>
                <div class="action-text">
                  <span class="action-title">Đặt lại tiến độ</span>
                  <span class="action-desc">Xóa lịch sử về Từ mới</span>
                </div>
              </button>
            </div>
          </div>

          <div class="prefs-footer">
            <button type="button" class="btn-reset-prefs" id="btn-reset-prefs">
              🔄 Khôi phục tối giản mặc định
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Drawer / Modal Tùy chỉnh Tự động học (Auto-Play) -->
      <div class="study-autoplay-modal" id="study-autoplay-modal">
        <div class="study-autoplay-backdrop" id="study-autoplay-backdrop"></div>
        <div class="study-autoplay-content">
          <div class="autoplay-modal-header">
            <div class="autoplay-title-wrap">
              <span class="autoplay-modal-icon">⚡</span>
              <h3 class="autoplay-modal-title">Tự động học (Auto-Play)</h3>
            </div>
            <button class="btn-autoplay-modal-close" id="btn-autoplay-modal-close" title="Đóng bảng cài đặt" aria-label="Đóng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <p class="autoplay-modal-desc">Học rảnh tay: tự động phát âm tiếng Anh, chờ suy nghĩ, lật thẻ và đọc nghĩa tiếng Việt. Duy trì chuỗi ngày học (Streak) và giữ nguyên lịch ôn tập FSRS của thẻ.</p>

          <div class="autoplay-settings-list">
            <!-- 1. Delay mặt trước -->
            <div class="autoplay-setting-item">
              <div class="autoplay-setting-info">
                <span class="autoplay-setting-label">⏱️ Chờ suy nghĩ (Mặt trước)</span>
                <span class="autoplay-setting-sub">Thời gian dừng để nhớ từ trước khi lật</span>
              </div>
              <div class="stepper-wrap">
                <button class="btn-stepper" id="btn-front-delay-minus" type="button" title="Giảm 0.5s" aria-label="Giảm">−</button>
                <span class="stepper-value" id="val-front-delay">3.0s</span>
                <button class="btn-stepper" id="btn-front-delay-plus" type="button" title="Tăng 0.5s" aria-label="Tăng">+</button>
              </div>
            </div>

            <!-- 2. Delay mặt sau -->
            <div class="autoplay-setting-item">
              <div class="autoplay-setting-info">
                <span class="autoplay-setting-label">📖 Chờ tiếp thu (Mặt sau)</span>
                <span class="autoplay-setting-sub">Thời gian xem nghĩa trước khi sang từ mới</span>
              </div>
              <div class="stepper-wrap">
                <button class="btn-stepper" id="btn-back-delay-minus" type="button" title="Giảm 0.5s" aria-label="Giảm">−</button>
                <span class="stepper-value" id="val-back-delay">2.5s</span>
                <button class="btn-stepper" id="btn-back-delay-plus" type="button" title="Tăng 0.5s" aria-label="Tăng">+</button>
              </div>
            </div>

            <!-- 3. Phát âm tiếng Việt -->
            <label class="autoplay-setting-item clickable">
              <div class="autoplay-setting-info">
                <span class="autoplay-setting-label"><svg class="flag-icon-vn" width="18" height="12" viewBox="0 0 30 20" fill="none"><rect width="30" height="20" rx="2" fill="#DA251D"/><polygon points="15,4 16.545,8.755 21.548,8.755 17.501,11.695 19.046,16.45 15,13.51 10.954,16.45 12.499,11.695 8.452,8.755 13.455,8.755" fill="#FFFF00"/></svg> Đọc nghĩa Tiếng Việt</span>
                <span class="autoplay-setting-sub">Tự động phát âm bản dịch tiếng Việt ở mặt sau</span>
              </div>
              <input type="checkbox" id="toggle-autoplay-speak-vi" class="toggle-checkbox">
            </label>

            <!-- 4. Lặp vô tận -->
            <label class="autoplay-setting-item clickable">
              <div class="autoplay-setting-info">
                <span class="autoplay-setting-label">🔁 Lặp lại khi hết thẻ</span>
                <span class="autoplay-setting-sub">Tự động quay lại từ đầu khi kết thúc danh sách</span>
              </div>
              <input type="checkbox" id="toggle-autoplay-loop" class="toggle-checkbox">
            </label>
          </div>

          <!-- Nút bắt đầu / tạm dừng lớn -->
          <div class="autoplay-modal-footer">
            <button id="btn-autoplay-main-action" class="btn-autoplay-main-action is-start" type="button">
              <span class="action-icon">▶️</span>
              <span class="action-text">Bắt đầu tự động học</span>
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
    const toggleExVi = document.getElementById('pref-toggle-example-vi');
    const togglePos = document.getElementById('pref-toggle-pos');
    const toggleCefr = document.getElementById('pref-toggle-cefr');
    const toggleAutoplay = document.getElementById('pref-toggle-autoplay');
    const toggleHint = document.getElementById('pref-toggle-hint');

    if (!overlay || !flashcardEl || overlay._controlsBound) return;
    overlay._controlsBound = true;

    // Khởi tạo trạng thái checkbox theo Preferences hiện tại
    const syncCheckboxesFromPrefs = () => {
      const p = getStudyPrefs();
      if (toggleImg) toggleImg.checked = !!p.showImage;
      if (togglePhonetic) togglePhonetic.checked = !!p.showPhonetic;
      if (toggleDef) toggleDef.checked = !!p.showDefinition;
      if (toggleEx) toggleEx.checked = !!p.showExample;
      if (toggleExVi) toggleExVi.checked = !!p.showExampleVi;
      if (togglePos) togglePos.checked = !!p.showPos;
      if (toggleCefr) toggleCefr.checked = !!p.showCefr;
      if (toggleAutoplay) toggleAutoplay.checked = (app.settings?.autoPronounce === true) || !!p.autoplayAudio;
      if (toggleHint) toggleHint.checked = !!p.showHint;
    };

    const updatePrefFromCheckbox = () => {
      const isAutoplay = !!toggleAutoplay?.checked;
      const p = {
        showImage: !!toggleImg?.checked,
        showPhonetic: !!togglePhonetic?.checked,
        showDefinition: !!toggleDef?.checked,
        showExample: !!toggleEx?.checked,
        showExampleVi: !!toggleExVi?.checked,
        showPos: !!togglePos?.checked,
        showCefr: !!toggleCefr?.checked,
        autoplayAudio: isAutoplay,
        showHint: !!toggleHint?.checked
      };
      saveStudyPrefs(p);
      if (app.settings) {
        app.settings.autoPronounce = isAutoplay;
        StorageManager.saveSettings(app.settings);
      }
      if (app.studySession) {
        app.studySession.updateSettings();
      }
      if (app.studySession?.currentCard) {
        applyFieldVisibility(p, app.studySession.currentCard);
      }
    };

    syncCheckboxesFromPrefs();

    [toggleImg, togglePhonetic, toggleDef, toggleEx, toggleExVi, togglePos, toggleCefr, toggleAutoplay, toggleHint].forEach(cb => {
      if (cb) {
        cb.addEventListener('change', updatePrefFromCheckbox);
      }
    });

    if (btnResetPrefs) {
      btnResetPrefs.addEventListener('click', () => {
        saveStudyPrefs(DEFAULT_STUDY_PREFS);
        if (app.settings) {
          app.settings.autoPronounce = false;
          StorageManager.saveSettings(app.settings);
        }
        if (app.studySession) {
          app.studySession.updateSettings();
        }
        syncCheckboxesFromPrefs();
        if (app.studySession?.currentCard) {
          applyFieldVisibility(DEFAULT_STUDY_PREFS, app.studySession.currentCard);
        }
      });
    }

    const btnTheme = document.getElementById('btn-study-theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentTheme = app.settings?.theme || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        if (app.settings) app.settings.theme = nextTheme;
        app.applyTheme(nextTheme);
        StorageManager.saveSettings(app.settings);
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

    // Thao tác Thẻ: Tạm dừng (Suspend)
    const btnActionSuspend = document.getElementById('btn-action-suspend-card');
    if (btnActionSuspend) {
      btnActionSuspend.addEventListener('click', () => {
        if (!app.studySession?.currentCard) return;
        const cardWord = app.studySession.currentCard.word || 'từ vựng';
        closeDrawer();
        app.studySession.suspendCurrentCard();
        app.showToast(`⏸️ Đã tạm dừng thẻ "${cardWord}"`, 'info');
      });
    }

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

    // Lật thẻ khi chạm hoặc bấm nút lật
    const triggerFlip = () => {
      try {
        if (!overlay.classList.contains('active')) return;
        globalStudyTimer.recordActivity();
        const isFlipped = app.studySession.flipCard();
        flashcardEl.classList.toggle('flipped', isFlipped);
        
        if (isFlipped) {
          _lastFlipLatencyMs = performance.now() - (_cardShowTime || performance.now());
          frontFlipControl?.classList.remove('visible');
          fsrsButtonsContainer?.classList.add('visible');

          // Nhận diện hành vi phản xạ (Behavioral Latency Intelligence)
          const flipSec = _lastFlipLatencyMs / 1000;
          const btnHard = document.querySelector('.btn-fsrs-rating.hard');
          const btnGood = document.querySelector('.btn-fsrs-rating.good');
          const btnEasy = document.querySelector('.btn-fsrs-rating.easy');

          [btnHard, btnGood, btnEasy].forEach(b => b?.classList.remove('behavioral-recommend'));

          // Gợi ý mức đánh giá trung thực: Nếu phân vân lâu (>7s) gợi ý Hard, nếu siêu nhanh (<=1.8s) gợi ý Easy, bình thường Good
          if (flipSec >= 7.0 && btnHard) {
            btnHard.classList.add('behavioral-recommend');
          } else if (flipSec <= 1.8 && btnEasy) {
            btnEasy.classList.add('behavioral-recommend');
          } else if (btnGood) {
            btnGood.classList.add('behavioral-recommend');
          }
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
        e.target.closest('.card-sound-btn-inline') ||
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
        const latencySec = _lastFlipLatencyMs > 0 ? Number((_lastFlipLatencyMs / 1000).toFixed(2)) : null;
        app.studySession.rateCard(rating, { latencySec });
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
    leechBadgeFront: document.getElementById('card-front-leech-badge'),
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

  // Loại từ (Part of speech) & Cấp độ CEFR độc lập ở mặt sau
  if (dom.posBack) {
    dom.posBack.style.display = (prefs.showPos && card.pos) ? 'inline-block' : 'none';
  }

  if (dom.cefrBadgeBack) {
    const cefrVal = card.cefr || card.level;
    dom.cefrBadgeBack.style.display = (prefs.showCefr && cefrVal) ? 'inline-block' : 'none';
  }

  if (dom.badgesBackWrap) {
    const hasAnyBadge = (prefs.showPos && card.pos) || (prefs.showCefr && (card.cefr || card.level));
    dom.badgesBackWrap.style.display = hasAnyBadge ? 'inline-flex' : 'none';
  }

  // Định nghĩa tiếng Anh
  const defText = card.definition || card.def || '';
  if (dom.defBoxBack) {
    dom.defBoxBack.style.display = (prefs.showDefinition && defText) ? 'flex' : 'none';
  }

  // Câu ví dụ tiếng Anh & Bản dịch tiếng Việt độc lập
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

    // Khởi tạo bộ đo thời gian phản xạ lật thẻ của thẻ hiện tại
    _cardShowTime = performance.now();
    _lastFlipLatencyMs = 0;
    document.querySelectorAll('.btn-fsrs-rating').forEach(b => b.classList.remove('behavioral-recommend'));

    // Cập nhật trạng thái thẻ FSRS và số lần học bấm thẻ (reps)
    const cardState = card.fsrsState || StorageManager.getCardState(card.id) || { state: State.New, reps: 0 };
    const stateNum = cardState.state !== undefined ? cardState.state : State.New;
    const repsCount = cardState.reps || 0;
    const isLeech = Boolean(cardState.isLeech === true || (cardState.lapses && cardState.lapses >= (app.settings?.leechThreshold || 6)));

    let stateText = 'Từ mới';
    let stateClass = 'state-new';

    if (card._isRelearning) {
      stateText = 'Củng cố lại';
      stateClass = 'state-relearning';
    } else if (stateNum === State.Learning || stateNum === 1) {
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
    if (dom.leechBadgeFront) {
      dom.leechBadgeFront.style.display = isLeech ? 'inline-flex' : 'none';
      const leechTextEl = dom.leechBadgeFront.querySelector('.leech-text');
      if (leechTextEl) {
        leechTextEl.textContent = `Hay quên (Lapse x${cardState.lapses || 1})`;
      }
    }
    if (dom.repsTextFront) {
      dom.repsTextFront.textContent = repsText;
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

    // Cập nhật FSRS Dynamic Intervals trên 4 nút
    if (card.previews) {
      if (dom.iAgain) dom.iAgain.textContent = formatCleanInterval(card.previews[Rating.Again]?.intervalText, '1m');
      if (dom.iHard) dom.iHard.textContent = formatCleanInterval(card.previews[Rating.Hard]?.intervalText, '10m');
      if (dom.iGood) dom.iGood.textContent = formatCleanInterval(card.previews[Rating.Good]?.intervalText, '1d');
      if (dom.iEasy) dom.iEasy.textContent = formatCleanInterval(card.previews[Rating.Easy]?.intervalText, '4d');
    }

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
    app.studySession?.stopAudio();
    globalStudyTimer.endSession();
    const overlay = document.getElementById('study-overlay');
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
