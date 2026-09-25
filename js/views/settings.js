/**
 * Cài Đặt & Hồ Sơ Cá Nhân - Quản lý tham số FSRS-6, âm thanh, giao diện và dữ liệu sao lưu
 */

import { StorageManager, BackupService } from '../services/storage.js';
import { StatsManager } from '../core/stats.js';
import { State } from '../core/fsrs.js';
import { showConfirm, showToast, openBehavioralOptimizerModal, openGoalPlannerModal, openSyncModal } from './components.js';

function saveAppSettings(app) {
  StorageManager.saveSettings(app.settings);
  if (app.studySession && typeof app.studySession.updateSettings === 'function') {
    app.studySession.updateSettings(app.settings);
  }
}

/* ==========================================================================
   1. ĐIỀU KHIỂN GIAO DIỆN CÀI ĐẶT & HỒ SƠ CÁ NHÂN
   ========================================================================== */

export function renderSettingsTabShell(container) {
  if (!container) return;
  if (!container.querySelector('.settings-hero-banner')) {
    container.innerHTML = `
      <!-- Top Hero Settings Banner -->
      <div class="settings-hero-banner">
        <div class="settings-hero-left">
          <div class="settings-hero-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div class="settings-hero-text">
            <h2 class="settings-hero-title">Cài Đặt Hệ Thống</h2>
            <p class="settings-hero-subtitle">Tùy chỉnh thuật toán FSRS-6, âm thanh và dữ liệu</p>
          </div>
        </div>
        <div class="settings-hero-badges">
          <span class="settings-pill-badge" style="background: rgba(99, 102, 241, 0.12); color: var(--primary);">v2.8 Pro</span>
        </div>
      </div>

      <!-- Symmetrical 2-Column Dashboard Grid (iOS Inset Grouped Style) -->
      <div class="settings-layout-grid">
        
        <!-- Column 1: FSRS-6 Algorithm & Learning Profiles -->
        <div class="settings-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>
              THUẬT TOÁN FSRS-6
            </span>
            <span class="section-group-hint">Tối ưu hóa khả năng ghi nhớ dài hạn</span>
          </div>

          <div class="inset-grouped-card">
            <!-- AI Behavioral Optimizer Feature Banner -->
            <div class="optimizer-feature-card">
              <div class="optimizer-feature-left">
                <div class="optimizer-feature-badge">⚡ AI OPTIMIZER</div>
                <div class="optimizer-feature-title">Tối ưu hóa FSRS theo hành vi</div>
                <div class="optimizer-feature-desc">Phân tích tốc độ tư duy, kiểm chứng đáp án & tự động hiệu chỉnh thông số cá nhân hóa.</div>
              </div>
              <button type="button" class="btn-primary-hero btn-run-optimizer" id="btn-run-behavioral-optimizer">
                <span>🧠 Phân tích & Tối ưu</span>
              </button>
            </div>

            <!-- 1-Tap Learning Profile Presets -->
            <div class="setting-row profile-presets-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
              <div class="setting-info">
                <span class="setting-title">Gói mục tiêu học cá nhân hóa</span>
                <span class="setting-desc">Thiết lập 1 chạm phù hợp theo lịch trình & mục tiêu</span>
              </div>
              <div class="settings-profile-chips-grid" id="settings-profile-chips" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 100%;">
                <button type="button" class="btn-profile-preset" data-preset="casual">
                  <span class="preset-icon">☕</span>
                  <span class="preset-name">Bận Rộn</span>
                  <span class="preset-sub">5 từ • 85%</span>
                </button>
                <button type="button" class="btn-profile-preset" data-preset="balanced">
                  <span class="preset-icon">⚖️</span>
                  <span class="preset-name">Tiêu Chuẩn</span>
                  <span class="preset-sub">10 từ • 90%</span>
                </button>
                <button type="button" class="btn-profile-preset" data-preset="intensive">
                  <span class="preset-icon">🚀</span>
                  <span class="preset-name">Cấp Tốc</span>
                  <span class="preset-sub">20 từ • 95%</span>
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Tỷ lệ nhớ mong muốn</span>
                <span class="setting-desc">Khuyến nghị 90% (cân bằng thời gian & độ nhớ)</span>
              </div>
              <select id="setting-retention" class="setting-select">
                <option value="0.80">80% (Ôn ít hơn)</option>
                <option value="0.85">85% (Tiết kiệm thời gian)</option>
                <option value="0.90">90% (Khuyên dùng - Chuẩn)</option>
                <option value="0.95">95% (Ghi nhớ tối đa)</option>
                <option value="0.97">97% (Tuyệt đối)</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Từ mới mỗi ngày</span>
                <span class="setting-desc">Số lượng từ mới giới thiệu trong 1 ngày</span>
              </div>
              <select id="setting-new-limit" class="setting-select">
                <option value="5">5 từ / ngày</option>
                <option value="10">10 từ / ngày</option>
                <option value="15">15 từ / ngày</option>
                <option value="20">20 từ / ngày</option>
                <option value="30">30 từ / ngày</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Giới hạn ôn tập / phiên</span>
                <span class="setting-desc">Số thẻ tối đa mỗi lần bắt đầu ôn tập</span>
              </div>
              <select id="setting-review-limit" class="setting-select">
                <option value="10">10 từ</option>
                <option value="20" selected>20 từ (Chuẩn - Khuyên dùng)</option>
                <option value="30">30 từ</option>
                <option value="50">50 từ</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Chống dồn lịch ôn (Fuzz Factor)</span>
                <span class="setting-desc">Làm mờ ngẫu nhiên khoảng cách ôn để tránh dồn thẻ cùng ngày</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-enable-fuzz" checked>
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Mốc bắt đầu ngày mới</span>
                <span class="setting-desc">Học sau nửa đêm vẫn tính cho ngày hôm trước</span>
              </div>
              <select id="setting-rollover-hour" class="setting-select">
                <option value="0">00:00 (Nửa đêm)</option>
                <option value="3">03:00 Sáng</option>
                <option value="4" selected>04:00 Sáng (Chuẩn Anki)</option>
                <option value="5">05:00 Sáng</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Ngưỡng phát hiện từ khó (Leech)</span>
                <span class="setting-desc">Số lần bấm Quên (Again) để coi là từ khó</span>
              </div>
              <select id="setting-leech-threshold" class="setting-select">
                <option value="4">4 lần quên</option>
                <option value="6" selected>6 lần quên (Khuyên dùng)</option>
                <option value="8">8 lần quên (Chuẩn Anki)</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Xử lý khi gặp từ khó</span>
                <span class="setting-desc">Hành động tự động khi đạt ngưỡng Leech</span>
              </div>
              <select id="setting-leech-action" class="setting-select">
                <option value="tag">⚠️ Gắn cờ cảnh báo (Tiếp tục học)</option>
                <option value="suspend">⏸️ Tự động tạm dừng thẻ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Column 2: Audio, Appearance & Data Management -->
        <div class="settings-column-right" style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Audio & Appearance Group -->
          <div class="settings-group">
            <div class="section-group-header">
              <span class="section-group-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                ÂM THANH & GIAO DIỆN
              </span>
              <span class="section-group-hint">Tự động phát âm bản xứ và đổi chủ đề</span>
            </div>

            <div class="inset-grouped-card">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Tự động phát âm</span>
                  <span class="setting-desc">Phát âm ngay khi lật sang từ vựng mới</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="setting-auto-speech" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Giọng phát âm ưu tiên</span>
                  <span class="setting-desc">Tự động chọn giọng bản xứ chất lượng cao</span>
                </div>
                <select id="setting-audio-accent" class="setting-select">
                  <option value="us">🇺🇸 Anh - Mỹ (US Accent)</option>
                  <option value="uk">🇬🇧 Anh - Anh (UK Accent)</option>
                  <option value="au">🇦🇺 Anh - Úc (AU Accent)</option>
                </select>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Tốc độ phát âm (Speed)</span>
                  <span class="setting-desc">Điều chỉnh tốc độ nghe phù hợp phản xạ</span>
                </div>
                <select id="setting-speech-rate" class="setting-select">
                  <option value="0.75">0.75x (Chậm)</option>
                  <option value="0.90" selected>0.90x (Tự nhiên - Khuyên dùng)</option>
                  <option value="1.00">1.00x (Chuẩn bản ngữ)</option>
                  <option value="1.15">1.15x (Nhanh)</option>
                </select>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Chế độ nền tối (Dark Mode)</span>
                  <span class="setting-desc">Bảo vệ mắt khi học ban đêm</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="setting-dark-theme">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Data Management & Backup Group -->
          <div class="settings-group">
            <div class="section-group-header">
              <span class="section-group-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 9 0 0 0 18 0"/></svg>
                QUẢN LÝ DỮ LIỆU & SAO LƯU
              </span>
              <span class="section-group-hint">Dữ liệu lưu 100% Offline trên máy của bạn</span>
            </div>

            <div class="inset-grouped-card">
              <div class="setting-row setting-actions-compact-row" style="border-bottom: none; padding: 16px;">
                <div class="settings-buttons-group">
                  <button type="button" id="btn-test-native-audio" class="btn-setting-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    <span>Nghe thử âm thanh</span>
                  </button>
                  <button type="button" id="btn-settings-open-sync" class="btn-setting-btn primary">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                    <span>Đồng bộ 2 chiều</span>
                  </button>
                  <button type="button" id="btn-settings-export-data" class="btn-setting-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    <span>Xuất file JSON</span>
                  </button>
                  <button type="button" id="btn-settings-import-data-trigger" class="btn-setting-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    <span>Nhập file JSON</span>
                  </button>
                  <input type="file" id="input-import-file" accept=".json" style="display: none;">
                  <button type="button" id="btn-settings-reset-data" class="btn-setting-btn danger">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    <span>Xóa & Đặt lại dữ liệu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}

export function setupSettingsUI(app) {
  try {
    const tabPane = document.getElementById('tab-settings');
    if (tabPane) renderSettingsTabShell(tabPane);

    const retentionSelect = document.getElementById('setting-retention');
    const newLimitSelect = document.getElementById('setting-new-limit');
    const reviewLimitSelect = document.getElementById('setting-review-limit');
    const autoSpeechToggle = document.getElementById('setting-auto-speech');
    const darkThemeToggle = document.getElementById('setting-dark-theme');
    const btnBack = document.getElementById('btn-back-from-settings');
    const btnRunOptimizer = document.getElementById('btn-run-behavioral-optimizer');

    if (btnRunOptimizer) {
      btnRunOptimizer.onclick = () => {
        try {
          openBehavioralOptimizerModal(app);
        } catch (err) {
          console.error('Lỗi mở Behavioral Optimizer Modal:', err);
        }
      };
    }

    if (btnBack) {
      btnBack.onclick = (e) => {
        try {
          if (e) e.preventDefault();
          app.switchTab('tab-profile');
        } catch (err) {
          console.error('Lỗi khi quay lại từ Cài đặt:', err);
        }
      };
    }

    if (!retentionSelect) return;

    // Đồng bộ nút preset hồ sơ học tập cá nhân hóa
    const syncPresetButtons = () => {
      const ret = parseFloat(app.settings.requestRetention || 0.9);
      const nw = parseInt(app.settings.dailyNewLimit || 10, 10);
      const presetBtns = document.querySelectorAll('.btn-profile-preset');
      presetBtns.forEach(b => {
        const type = b.getAttribute('data-preset');
        let isActive = false;
        if (type === 'casual' && nw <= 5 && ret <= 0.85) isActive = true;
        else if (type === 'intensive' && nw >= 20 && ret >= 0.95) isActive = true;
        else if (type === 'balanced' && ((nw === 10 && ret === 0.9) || (nw > 5 && nw < 20))) isActive = true;
        b.classList.toggle('active', isActive);
      });
    };

    document.querySelectorAll('.btn-profile-preset').forEach(btn => {
      btn.onclick = () => {
        const type = btn.getAttribute('data-preset');
        if (type === 'casual') {
          app.settings.dailyNewLimit = 5;
          app.settings.requestRetention = 0.85;
          app.showToast('☕ Đã chọn Gói Bận Rộn (5 từ/ngày • 85% Retention)', 'success', 2500);
        } else if (type === 'intensive') {
          app.settings.dailyNewLimit = 20;
          app.settings.requestRetention = 0.95;
          app.showToast('🚀 Đã chọn Gói Cấp Tốc (20 từ/ngày • 95% Retention)', 'success', 2500);
        } else {
          app.settings.dailyNewLimit = 10;
          app.settings.requestRetention = 0.90;
          app.showToast('⚖️ Đã chọn Gói Tiêu Chuẩn (10 từ/ngày • 90% Retention)', 'success', 2500);
        }

        if (retentionSelect) retentionSelect.value = String(app.settings.requestRetention);
        if (newLimitSelect) newLimitSelect.value = String(app.settings.dailyNewLimit);
        syncPresetButtons();
        saveAppSettings(app);
        app.refreshAllViews();
      };
    });

    syncPresetButtons();

    const currentRetention = parseFloat(app.settings.requestRetention || 0.9);
    retentionSelect.value = String(currentRetention);
    if (!retentionSelect.value) {
      retentionSelect.value = currentRetention.toFixed(2);
    }
    if (!retentionSelect.value) {
      retentionSelect.value = "0.9";
    }

    retentionSelect.addEventListener('change', (e) => {
      try {
        const val = parseFloat(e.target.value);
        app.settings.requestRetention = val;
        saveAppSettings(app);
        app.refreshAllViews();
      } catch (err) {
        console.error('Lỗi cập nhật retentionSelect:', err);
      }
    });

    if (newLimitSelect) {
      newLimitSelect.value = String(app.settings.dailyNewLimit || 10);
      newLimitSelect.addEventListener('change', (e) => {
        try {
          const val = parseInt(e.target.value, 10);
          app.settings.dailyNewLimit = val;
          saveAppSettings(app);
          app.refreshAllViews();
        } catch (err) {
          console.error('Lỗi cập nhật newLimitSelect:', err);
        }
      });
    }

    if (reviewLimitSelect) {
      reviewLimitSelect.value = String(app.settings.dailyReviewLimit || 50);
      reviewLimitSelect.addEventListener('change', (e) => {
        try {
          const val = parseInt(e.target.value, 10);
          app.settings.dailyReviewLimit = val;
          saveAppSettings(app);
          app.refreshAllViews();
        } catch (err) {
          console.error('Lỗi cập nhật reviewLimitSelect:', err);
        }
      });
    }

    const enableFuzzToggle = document.getElementById('setting-enable-fuzz');
    if (enableFuzzToggle) {
      enableFuzzToggle.checked = app.settings.enableFuzz !== false;
      enableFuzzToggle.addEventListener('change', (e) => {
        try {
          app.settings.enableFuzz = e.target.checked;
          saveAppSettings(app);
        } catch (err) {
          console.error('Lỗi cập nhật enableFuzzToggle:', err);
        }
      });
    }

    const rolloverHourSelect = document.getElementById('setting-rollover-hour');
    if (rolloverHourSelect) {
      rolloverHourSelect.value = String(app.settings.rolloverHour !== undefined ? app.settings.rolloverHour : 4);
      rolloverHourSelect.addEventListener('change', (e) => {
        try {
          app.settings.rolloverHour = parseInt(e.target.value, 10);
          saveAppSettings(app);
          app.refreshAllViews();
        } catch (err) {
          console.error('Lỗi cập nhật rolloverHourSelect:', err);
        }
      });
    }

    const leechThresholdSelect = document.getElementById('setting-leech-threshold');
    if (leechThresholdSelect) {
      leechThresholdSelect.value = String(app.settings.leechThreshold || 6);
      leechThresholdSelect.addEventListener('change', (e) => {
        try {
          app.settings.leechThreshold = parseInt(e.target.value, 10);
          saveAppSettings(app);
        } catch (err) {
          console.error('Lỗi cập nhật leechThresholdSelect:', err);
        }
      });
    }

    const leechActionSelect = document.getElementById('setting-leech-action');
    if (leechActionSelect) {
      leechActionSelect.value = app.settings.leechAction || 'tag';
      leechActionSelect.addEventListener('change', (e) => {
        try {
          app.settings.leechAction = e.target.value;
          saveAppSettings(app);
        } catch (err) {
          console.error('Lỗi cập nhật leechActionSelect:', err);
        }
      });
    }

    if (autoSpeechToggle) {
      autoSpeechToggle.checked = app.settings.autoPronounce === true;
      autoSpeechToggle.addEventListener('change', (e) => {
        try {
          app.settings.autoPronounce = e.target.checked;
          saveAppSettings(app);
          try {
            const raw = localStorage.getItem('study_display_prefs');
            const prefs = raw ? JSON.parse(raw) : {};
            prefs.autoplayAudio = e.target.checked;
            localStorage.setItem('study_display_prefs', JSON.stringify(prefs));
          } catch (e2) {}
          if (app.studySession) app.studySession.updateSettings();
        } catch (err) {
          console.error('Lỗi cập nhật autoSpeechToggle:', err);
        }
      });
    }

    if (darkThemeToggle) {
      darkThemeToggle.checked = (app.settings.theme || 'light') === 'dark';
      darkThemeToggle.addEventListener('change', (e) => {
        try {
          const theme = e.target.checked ? 'dark' : 'light';
          app.settings.theme = theme;
          app.applyTheme(theme);
          saveAppSettings(app);
        } catch (err) {
          console.error('Lỗi cập nhật darkThemeToggle:', err);
        }
      });
    }

    const audioAccentSelect = document.getElementById('setting-audio-accent');
    if (audioAccentSelect) {
      audioAccentSelect.value = app.settings.audioAccent || 'us';
      audioAccentSelect.addEventListener('change', (e) => {
        try {
          app.settings.audioAccent = e.target.value;
          saveAppSettings(app);
        } catch (err) {
          console.error('Lỗi cập nhật audioAccent:', err);
        }
      });
    }

    const speechRateSelect = document.getElementById('setting-speech-rate');
    if (speechRateSelect) {
      const currentSpeechRate = parseFloat(app.settings.speechRate || 0.9);
      speechRateSelect.value = String(currentSpeechRate);
      if (!speechRateSelect.value) {
        speechRateSelect.value = currentSpeechRate.toFixed(1);
      }
      if (!speechRateSelect.value) {
        speechRateSelect.value = "0.9";
      }

      speechRateSelect.addEventListener('change', (e) => {
        try {
          app.settings.speechRate = parseFloat(e.target.value);
          saveAppSettings(app);
        } catch (err) {
          console.error('Lỗi cập nhật speechRate:', err);
        }
      });
    }

    const btnTestAudio = document.getElementById('btn-test-native-audio');
    if (btnTestAudio) {
      btnTestAudio.addEventListener('click', () => {
        try {
          const sampleWord = (app.settings.audioAccent || 'us') === 'uk' ? 'schedule' : 'wonderful';
          app.studySession.speak(sampleWord);
        } catch (err) {
          console.error('Lỗi test âm thanh:', err);
        }
      });
    }

    // Xuất / Nhập dữ liệu sao lưu JSON & Đặt lại dữ liệu
    const btnExport = document.getElementById('btn-settings-export-data');
    if (btnExport) {
      btnExport.onclick = () => {
        try {
          const result = BackupService.exportToJSON();
          if (result && result.success) {
            const sizeStr = result.sizeKb > 0 ? ` (${result.sizeKb} KB)` : '';
            showToast(`Đã xuất file sao lưu siêu nhẹ${sizeStr}: ${result.filename} 📁`, 'success');
          } else {
            showToast('Lỗi khi xuất file sao lưu.', 'error');
          }
        } catch (err) {
          console.error('Lỗi xuất file:', err);
          showToast('Lỗi khi xuất file backup.', 'error');
        }
      };
    }

    const btnImportTrigger = document.getElementById('btn-settings-import-data-trigger');
    const inputImport = document.getElementById('input-import-file');
    if (btnImportTrigger && inputImport) {
      btnImportTrigger.onclick = () => {
        inputImport.value = '';
        inputImport.click();
      };

      if (!inputImport.dataset.bound) {
        inputImport.dataset.bound = 'true';
        inputImport.addEventListener('change', async (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            await executeBackupImport(file, app);
            inputImport.value = '';
          }
        });
      }
    }

    const btnReset = document.getElementById('btn-settings-reset-data');
    if (btnReset) {
      btnReset.onclick = async () => {
        try {
          const confirmed = await showConfirm({
            title: 'Xóa toàn bộ dữ liệu?',
            message: 'Hành động này sẽ đặt lại toàn bộ tiến trình học FSRS, lịch sử ôn tập về trạng thái ban đầu và không thể hoàn tác.',
            confirmText: 'Xóa vĩnh viễn',
            cancelText: 'Hủy bỏ',
            type: 'danger',
            icon: '🗑️'
          });

          if (confirmed) {
            await StorageManager.clearAllData();
            app.settings = StorageManager.getSettings();
            app.applyTheme(app.settings.theme || 'light');
            updateSettingsUIValues(app);
            showToast('Đã đặt lại toàn bộ dữ liệu FSRS thành công!', 'success');
            app.refreshAllViews();
          }
        } catch (err) {
          console.error('Lỗi khi reset data:', err);
          showToast('Lỗi khi đặt lại dữ liệu.', 'error');
        }
      };
    }
  } catch (err) {
    console.error('Lỗi khởi tạo setupSettingsUI:', err);
  }
}

export function updateSettingsUIValues(app) {
  try {
    const settings = app.settings || StorageManager.getSettings();
    const retentionSelect = document.getElementById('setting-retention');
    const newLimitSelect = document.getElementById('setting-new-limit');
    const reviewLimitSelect = document.getElementById('setting-review-limit');
    const autoSpeechToggle = document.getElementById('setting-auto-speech');
    const darkThemeToggle = document.getElementById('setting-dark-theme');
    const audioAccentSelect = document.getElementById('setting-audio-accent');
    const speechRateSelect = document.getElementById('setting-speech-rate');

    if (retentionSelect) {
      retentionSelect.value = String(settings.requestRetention || 0.90);
    }
    if (newLimitSelect) {
      newLimitSelect.value = String(settings.dailyNewLimit || 10);
    }
    if (reviewLimitSelect) {
      reviewLimitSelect.value = String(settings.dailyReviewLimit || 50);
    }
    if (autoSpeechToggle) autoSpeechToggle.checked = settings.autoPronounce !== false;
    if (darkThemeToggle) darkThemeToggle.checked = (settings.theme || 'light') === 'dark';
    if (audioAccentSelect) audioAccentSelect.value = settings.audioAccent || 'us';
    if (speechRateSelect) speechRateSelect.value = String(settings.speechRate || 0.9);
  } catch (err) {
    console.warn('Lỗi updateSettingsUIValues:', err);
  }
}

export async function executeBackupImport(file, app) {
  try {
    if (!file) return;
    const res = await BackupService.importFromFile(file);
    if (res && res.success) {
      const countStr = typeof res.count === 'number' ? ` (${res.count} từ)` : '';
      showToast(`Khôi phục dữ liệu FSRS thành công${countStr}! 🎉`, 'success');
      app.settings = StorageManager.getSettings();
      app.applyTheme(app.settings.theme || 'light');
      updateSettingsUIValues(app);
      app.refreshAllViews();
    } else {
      showToast('Lỗi dữ liệu file: ' + (res?.error || 'Không hợp lệ'), 'error');
    }
  } catch (err) {
    console.error('Lỗi khi import file backup:', err);
    showToast('Không thể đọc file JSON sao lưu.', 'error');
  }
}

/* ==========================================================================
   2. PROFILE VIEW CONTROLLER
   ========================================================================== */

export function renderProfileTabShell(container) {
  if (!container) return;
  if (!container.querySelector('.profile-hero-banner')) {
    container.innerHTML = `
      <!-- 1. Top Hero Profile Banner -->
      <div class="profile-hero-banner">
        <div class="profile-hero-left">
          <div class="user-avatar-circle" id="profile-avatar-btn" title="Bấm để đổi Avatar Emoji">
            <span id="profile-avatar-emoji">🎓</span>
            <span class="avatar-edit-hint">✏️</span>
          </div>
          <div class="user-info-text">
            <div class="profile-user-name-row">
              <h2 class="profile-user-name" id="profile-user-name-display">Học Viên Flashcard Pro</h2>
              <button class="btn-edit-username" id="btn-edit-username" title="Đổi tên hiển thị">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
            </div>
            <div class="profile-rank-badge-row">
              <span class="profile-rank-pill" id="profile-rank-pill">🌱 Tập Sự Khởi Đầu</span>
              <span class="profile-score-pill" id="profile-score-pill">0 / 1000 Điểm Nhận Thức</span>
            </div>
          </div>
        </div>
        <div class="profile-hero-badges">
          <span class="profile-pill-badge" style="background: rgba(99, 102, 241, 0.12); color: var(--primary);">⚡ FSRS-6 Realtime Engine</span>
        </div>
      </div>

      <!-- 2. Profile Dashboard Layout -->
      <div class="profile-dashboard-layout">
        
        <!-- Block 1: 4 Key Memory & Persistence Metrics -->
        <div class="profile-group" style="grid-column: 1 / -1;">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              NĂNG LỰC TRÍ NHỚ & THÀNH TÍCH HỌC TẬP
            </span>
            <span class="section-group-hint">Chỉ số thực tế đo lường theo thuật toán FSRS-6</span>
          </div>

          <div class="inset-grouped-card">
            <div class="profile-quad-metrics">
              <div class="quad-metric-card">
                <div class="quad-metric-icon" style="background: rgba(99, 102, 241, 0.12); color: #6366f1;">🧠</div>
                <div class="quad-metric-content">
                  <span class="quad-metric-val" id="profile-achieve-learned">0</span>
                  <span class="quad-metric-lbl">Vốn từ đã nạp</span>
                  <span class="quad-metric-sub" id="profile-learned-pct">0% toàn kho</span>
                </div>
              </div>

              <div class="quad-metric-card">
                <div class="quad-metric-icon" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">🔥</div>
                <div class="quad-metric-content">
                  <span class="quad-metric-val" id="profile-achieve-streak">0 ngày</span>
                  <span class="quad-metric-lbl">Chuỗi kiên trì</span>
                  <span class="quad-metric-sub">Kỷ luật học tập</span>
                </div>
              </div>

              <div class="quad-metric-card">
                <div class="quad-metric-icon" style="background: rgba(16, 185, 129, 0.12); color: #10b981;">⏱️</div>
                <div class="quad-metric-content">
                  <span class="quad-metric-val" id="profile-achieve-time">0 ph</span>
                  <span class="quad-metric-lbl">Thời lượng học</span>
                  <span class="quad-metric-sub">Tích lũy thực tế</span>
                </div>
              </div>

              <div class="quad-metric-card">
                <div class="quad-metric-icon" style="background: rgba(6, 182, 212, 0.12); color: #06b6d4;">🎯</div>
                <div class="quad-metric-content">
                  <span class="quad-metric-val" id="profile-retrievability-val">0%</span>
                  <span class="quad-metric-lbl">Khả năng gợi nhớ</span>
                  <span class="quad-metric-sub">Chỉ số R(t) FSRS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Block 2: 5 Stability Tiers Breakdown -->
        <div class="profile-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              5 CẤP ĐỘ ĐỘ BỀN TRÍ NHỚ FSRS
            </span>
            <span class="section-group-hint">Phân tầng độ bền bộ nhớ não bộ (Stability)</span>
          </div>

          <div class="inset-grouped-card profile-tiers-card" id="profile-tiers-container">
            <!-- Tiers rendered dynamically -->
          </div>
        </div>

        <!-- Block 3: Achievement Badges Showcase -->
        <div class="profile-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              BỘ SƯU TẬP HUY HIỆU VINH DANH
            </span>
            <span class="section-group-hint">Chinh phục các cột mốc học tập xuất sắc</span>
          </div>

          <div class="inset-grouped-card profile-badges-grid" id="profile-badges-container">
            <!-- Badges rendered dynamically -->
          </div>
        </div>

        <!-- Block 4: System Knowledge Base (20 Topics & 3523 Words) -->
        <div class="profile-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M2 10h20"/></svg>
              KHO DỮ LIỆU & LỘ TRÌNH 3 GIAI ĐOẠN
            </span>
            <span class="section-group-hint">Cơ sở dữ liệu từ vựng chuẩn hóa sư phạm</span>
          </div>

          <div class="inset-grouped-card">
            <div class="profile-stats-grid">
              <div class="profile-stat-box">
                <span class="profile-stat-icon">📚</span>
                <span class="profile-stat-num" id="tax-topics-count">20</span>
                <span class="profile-stat-lbl">Chủ đề lớn</span>
              </div>
              <div class="profile-stat-box">
                <span class="profile-stat-icon">🎯</span>
                <span class="profile-stat-num" id="tax-subtopics-count">467</span>
                <span class="profile-stat-lbl">Phần học con</span>
              </div>
              <div class="profile-stat-box">
                <span class="profile-stat-icon">💎</span>
                <span class="profile-stat-num" id="tax-words-count">3.523</span>
                <span class="profile-stat-lbl">Tổng từ vựng</span>
              </div>
            </div>

            <div class="profile-cefr-breakdown">
              <div class="cefr-badge-item"><span class="cefr-dot" style="background:#10b981;"></span> A1: <strong>673</strong></div>
              <div class="cefr-badge-item"><span class="cefr-dot" style="background:#06b6d4;"></span> A2: <strong>983</strong></div>
              <div class="cefr-badge-item"><span class="cefr-dot" style="background:#3b82f6;"></span> B1: <strong>1.194</strong></div>
              <div class="cefr-badge-item"><span class="cefr-dot" style="background:#8b5cf6;"></span> B2: <strong>542</strong></div>
              <div class="cefr-badge-item"><span class="cefr-dot" style="background:#f59e0b;"></span> C1: <strong>172</strong></div>
            </div>

            <div style="padding: 0 14px 14px 14px;">
              <button id="btn-profile-to-decks" class="btn-profile-action" style="width: 100%;">
                <span>📖 Khám phá Toàn Bộ Chủ Đề & Chặng Học</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Block 5: Action Hub & Data Management -->
        <div class="profile-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              TIỆN ÍCH & QUẢN TRỊ DỮ LIỆU
            </span>
            <span class="section-group-hint">Đồng bộ, sao lưu và tùy biến hệ thống</span>
          </div>

          <div class="inset-grouped-card profile-actions-grid">
            <button id="btn-profile-goal-planner" class="btn-profile-tool">
              <span class="tool-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">🎯</span>
              <div class="tool-text">
                <span class="tool-title">Kế Hoạch & Mục Tiêu</span>
                <span class="tool-desc">Căn chỉnh lộ trình và dự báo ngày hoàn thành</span>
              </div>
              <span class="tool-arrow">→</span>
            </button>

            <button id="btn-profile-sync" class="btn-profile-tool">
              <span class="tool-icon" style="background: rgba(6, 182, 212, 0.15); color: #06b6d4;">🔄</span>
              <div class="tool-text">
                <span class="tool-title">Đồng Bộ Đa Thiết Bị</span>
                <span class="tool-desc">Kết nối P2P 2 chiều không cần server</span>
              </div>
              <span class="tool-arrow">→</span>
            </button>

            <button id="btn-profile-backup" class="btn-profile-tool">
              <span class="tool-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">💾</span>
              <div class="tool-text">
                <span class="tool-title">Sao Lưu Dữ Liệu JSON</span>
                <span class="tool-desc">Xuất file tiến trình học an toàn</span>
              </div>
              <span class="tool-arrow">↓</span>
            </button>

            <button id="btn-profile-to-settings" class="btn-profile-tool">
              <span class="tool-icon" style="background: rgba(99, 102, 241, 0.15); color: #6366f1;">⚙️</span>
              <div class="tool-text">
                <span class="tool-title">Cài Đặt Hệ Thống & FSRS</span>
                <span class="tool-desc">Tùy chỉnh tham số học tập, âm thanh & giọng đọc</span>
              </div>
              <span class="tool-arrow">→</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }
}

export async function renderProfileTab(app) {
  try {
    const tabPane = document.getElementById('tab-profile');
    if (tabPane) renderProfileTabShell(tabPane);

    // 1. Tên người dùng & Avatar Emoji
    const savedName = localStorage.getItem('fc_pro_user_name') || 'Học Viên Flashcard Pro';
    const savedAvatar = localStorage.getItem('fc_pro_user_avatar') || '🎓';

    const nameEl = document.getElementById('profile-user-name-display');
    if (nameEl) nameEl.textContent = savedName;

    const avatarEl = document.getElementById('profile-avatar-emoji');
    if (avatarEl) avatarEl.textContent = savedAvatar;

    // Bắt sự kiện đổi tên người dùng
    const btnEditName = document.getElementById('btn-edit-username');
    if (btnEditName && !btnEditName._bound) {
      btnEditName._bound = true;
      btnEditName.onclick = () => {
        const newName = prompt('Nhập tên hiển thị của bạn:', nameEl ? nameEl.textContent : 'Học Viên');
        if (newName && newName.trim()) {
          const clean = newName.trim().slice(0, 30);
          localStorage.setItem('fc_pro_user_name', clean);
          if (nameEl) nameEl.textContent = clean;
          showToast(`Đã cập nhật tên: ${clean}`, 'success');
        }
      };
    }

    // Bắt sự kiện chọn Avatar Emoji
    const avatarBtn = document.getElementById('profile-avatar-btn');
    if (avatarBtn && !avatarBtn._bound) {
      avatarBtn._bound = true;
      avatarBtn.onclick = () => {
        const emojis = ['🎓', '🦁', '🦉', '⚡', '🚀', '💎', '🐉', '🎯', '🌟', '👑', '🔥', '🏆', '🦊', '🐺', '🐯', '🧠'];
        const choice = prompt(`Chọn Avatar của bạn (nhập số hoặc copy emoji):\n${emojis.map((e, i) => `${i + 1}. ${e}`).join('  ')}`, '1');
        if (choice !== null) {
          const num = parseInt(choice, 10);
          let selected = '';
          if (!isNaN(num) && num >= 1 && num <= emojis.length) {
            selected = emojis[num - 1];
          } else if (emojis.includes(choice.trim())) {
            selected = choice.trim();
          }
          if (selected) {
            localStorage.setItem('fc_pro_user_avatar', selected);
            if (avatarEl) avatarEl.textContent = selected;
            showToast(`Đã đổi Avatar: ${selected}`, 'success');
          }
        }
      };
    }

    const allDecks = app.deckManager.getAllDecks();
    const allCards = app.deckManager.getAllCards();
    const cardStates = StorageManager.getAllCardStates();
    const logs = StorageManager.getStudyLogs();

    // 2. Cập nhật Kho dữ liệu hệ thống
    const totalTopics = allDecks.length;
    const totalSubtopics = allDecks.reduce((sum, d) => sum + ((d.subtopics && d.subtopics.length) ? d.subtopics.length : (d.subcategories && d.subcategories.length ? d.subcategories.length : 1)), 0);
    const totalWords = allCards.length;

    const topicsEl = document.getElementById('tax-topics-count');
    if (topicsEl) topicsEl.textContent = totalTopics;

    const subtopicsEl = document.getElementById('tax-subtopics-count');
    if (subtopicsEl) subtopicsEl.textContent = totalSubtopics;

    const wordsEl = document.getElementById('tax-words-count');
    if (wordsEl) wordsEl.textContent = totalWords.toLocaleString('vi-VN');

    // 3. Phân tích Năng lực Trí nhớ FSRS & Cấp bậc
    const memIntel = StatsManager.getMemoryIntelligence(allCards);
    const { totalLearned, currentRetrievability, score, rank, tiers } = memIntel;

    // Cập nhật Cấp bậc & Điểm Nhận thức
    const rankPill = document.getElementById('profile-rank-pill');
    if (rankPill) {
      rankPill.textContent = `${rank.title} (${rank.badge})`;
      rankPill.style.background = `${rank.color}18`;
      rankPill.style.color = rank.color;
      rankPill.style.borderColor = `${rank.color}40`;
    }

    const scorePill = document.getElementById('profile-score-pill');
    if (scorePill) {
      scorePill.textContent = `${score} / 1000 Điểm Nhận Thức`;
    }

    // Vốn từ đã nạp
    const achieveLearnedEl = document.getElementById('profile-achieve-learned');
    if (achieveLearnedEl) achieveLearnedEl.textContent = totalLearned.toLocaleString('vi-VN');

    const learnedPctEl = document.getElementById('profile-learned-pct');
    if (learnedPctEl) {
      const pct = totalWords > 0 ? ((totalLearned / totalWords) * 100).toFixed(1) : 0;
      learnedPctEl.textContent = `${pct}% toàn kho`;
    }

    // Chuỗi ngày
    const streak = StatsManager.calculateStreak(logs);
    const achieveStreakEl = document.getElementById('profile-achieve-streak');
    if (achieveStreakEl) achieveStreakEl.textContent = `${streak} ngày`;

    // Thời gian học
    const timeMap = typeof StorageManager.getStudyTimeMap === 'function' ? StorageManager.getStudyTimeMap() : {};
    const totalSeconds = Object.values(timeMap).reduce((sum, s) => sum + (Number(s) || 0), 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const achieveTimeEl = document.getElementById('profile-achieve-time');
    if (achieveTimeEl) {
      if (totalMinutes >= 60) {
        const hours = (totalMinutes / 60).toFixed(1);
        achieveTimeEl.textContent = `${hours} giờ`;
      } else {
        achieveTimeEl.textContent = totalMinutes > 0 ? `${totalMinutes} ph` : (totalSeconds > 0 ? '< 1 ph' : '0 ph');
      }
    }

    // Khả năng gợi nhớ R(t)
    const retrievabilityEl = document.getElementById('profile-retrievability-val');
    if (retrievabilityEl) retrievabilityEl.textContent = `${currentRetrievability}%`;

    // 4. Render 5 Stability Tiers
    const tiersContainer = document.getElementById('profile-tiers-container');
    if (tiersContainer && tiers) {
      const tierList = [tiers.tier5, tiers.tier4, tiers.tier3, tiers.tier2, tiers.tier1];
      const maxCount = Math.max(1, ...tierList.map(t => t.count));

      tiersContainer.innerHTML = `
        <div class="tier-bars-wrapper">
          ${tierList.map(t => {
            const pct = totalLearned > 0 ? Math.round((t.count / totalLearned) * 100) : 0;
            const barWidth = Math.max(4, Math.round((t.count / maxCount) * 100));
            return `
              <div class="tier-bar-row">
                <div class="tier-info-header">
                  <span class="tier-label">${t.icon} ${t.label}</span>
                  <span class="tier-count"><strong>${t.count}</strong> từ (${pct}%)</span>
                </div>
                <div class="tier-progress-track">
                  <div class="tier-progress-fill" style="width: ${barWidth}%; background: ${t.color};"></div>
                </div>
                <div class="tier-desc-hint">${t.desc}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 5. Render Achievement Badges Showcase
    const badgesContainer = document.getElementById('profile-badges-container');
    if (badgesContainer) {
      const masteredCount = tiers ? (tiers.tier5.count + tiers.tier4.count) : 0;
      
      const BADGES = [
        {
          id: 'badge-starter',
          icon: '🌱',
          name: 'Bước Đầu Chinh Phục',
          desc: 'Nạp thành công 10 từ vựng đầu tiên',
          progress: Math.min(10, totalLearned),
          target: 10,
          unlocked: totalLearned >= 10,
          color: '#10b981'
        },
        {
          id: 'badge-streak-7',
          icon: '🔥',
          name: 'Ngọn Lửa Kiên Trì',
          desc: 'Duy trì chuỗi học 7 ngày liên tiếp',
          progress: Math.min(7, streak),
          target: 7,
          unlocked: streak >= 7,
          color: '#f59e0b'
        },
        {
          id: 'badge-mastery-100',
          icon: '💎',
          name: 'Trí Nhớ Kim Cương',
          desc: 'Đạt 100 từ vựng ở mức bền vững (≥14 ngày)',
          progress: Math.min(100, masteredCount),
          target: 100,
          unlocked: masteredCount >= 100,
          color: '#06b6d4'
        },
        {
          id: 'badge-vocabs-500',
          icon: '👑',
          name: 'Học Giả FSRS',
          desc: 'Nạp thành công 500 từ vựng vào bộ nhớ',
          progress: Math.min(500, totalLearned),
          target: 500,
          unlocked: totalLearned >= 500,
          color: '#8b5cf6'
        },
        {
          id: 'badge-discipline',
          icon: '🎯',
          name: 'Kỷ Luật Thép',
          desc: 'Tích lũy trên 60 phút học tập thực tế',
          progress: Math.min(60, totalMinutes),
          target: 60,
          unlocked: totalMinutes >= 60,
          color: '#ec4899'
        },
        {
          id: 'badge-explorer',
          icon: '🚀',
          name: 'Nhà Chinh Phục',
          desc: 'Hoàn thành ít nhất 5 chặng học vi mô',
          progress: Math.min(5, Math.floor(totalLearned / 10)),
          target: 5,
          unlocked: totalLearned >= 50,
          color: '#3b82f6'
        }
      ];

      badgesContainer.innerHTML = BADGES.map(b => {
        const pct = Math.round((b.progress / b.target) * 100);
        return `
          <div class="badge-item-card ${b.unlocked ? 'badge-unlocked' : 'badge-locked'}">
            <div class="badge-card-icon" style="background: ${b.color}15; color: ${b.color}; border: 1px solid ${b.color}30;">
              ${b.icon}
            </div>
            <div class="badge-card-body">
              <div class="badge-card-title">${b.name}</div>
              <div class="badge-card-desc">${b.desc}</div>
              <div class="badge-card-footer">
                ${b.unlocked 
                  ? `<span class="badge-status-unlocked" style="color: ${b.color};">✓ ĐÃ ĐẠT</span>`
                  : `<div class="badge-bar-track"><div class="badge-bar-fill" style="width: ${pct}%; background: ${b.color};"></div></div><span class="badge-pct">${b.progress}/${b.target}</span>`
                }
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 6. Gán sự kiện cho các nút chức năng
    const btnToSettings = document.getElementById('btn-profile-to-settings');
    if (btnToSettings && !btnToSettings._bound) {
      btnToSettings._bound = true;
      btnToSettings.onclick = () => app.switchTab('tab-settings');
    }

    const btnToDecks = document.getElementById('btn-profile-to-decks');
    if (btnToDecks && !btnToDecks._bound) {
      btnToDecks._bound = true;
      btnToDecks.onclick = () => app.switchTab('tab-decks');
    }

    const btnGoalPlanner = document.getElementById('btn-profile-goal-planner');
    if (btnGoalPlanner && !btnGoalPlanner._bound) {
      btnGoalPlanner._bound = true;
      btnGoalPlanner.onclick = () => {
        openGoalPlannerModal(app, () => {
          renderProfileTab(app);
        });
      };
    }

    const btnSync = document.getElementById('btn-profile-sync');
    if (btnSync && !btnSync._bound) {
      btnSync._bound = true;
      btnSync.onclick = () => openSyncModal(app);
    }

    const btnBackup = document.getElementById('btn-profile-backup');
    if (btnBackup && !btnBackup._bound) {
      btnBackup._bound = true;
      btnBackup.onclick = () => {
        BackupService.exportData();
        showToast('Đã tạo và tải xuống bản sao lưu dữ liệu JSON thành công!', 'success');
      };
    }

  } catch (err) {
    console.error('Lỗi trong renderProfileTab:', err);
  }
}

