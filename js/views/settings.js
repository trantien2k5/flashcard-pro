import { StorageManager, BackupService } from '../services/storage.js';
import { StatsManager } from '../core/stats.js';
import { State } from '../core/fsrs.js';
import { showConfirm, showToast, openBehavioralOptimizerModal, openGoalPlannerModal } from './components.js';

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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div class="settings-hero-text">
            <h2 class="settings-hero-title">Cài Đặt Hệ Thống</h2>
          </div>
        </div>
        <div class="settings-hero-badges">
          <span class="settings-pill-badge" style="background: rgba(99, 102, 241, 0.12); color: var(--primary);">v2.8 Pro</span>
        </div>
      </div>

      <!-- Symmetrical 2-Column Dashboard Grid (iOS Inset Grouped Style) -->
      <!-- Profile Card Summary in Settings -->
      <div class="settings-profile-card inset-grouped-card" style="margin-bottom: 14px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <button type="button" id="settings-avatar-btn" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--primary); background: var(--bg-tertiary); font-size: 1.4rem; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Đổi Avatar Emoji">
            <span id="settings-avatar-emoji">🎓</span>
          </button>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="settings-username-display" style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">Học Viên Flashcard Pro</span>
              <button type="button" id="btn-settings-edit-name" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px;" title="Đổi tên">✏️</button>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
              <span id="settings-rank-pill" style="font-size: 0.72rem; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: rgba(99,102,241,0.12); color: var(--primary);">Tập Sự</span>
              <span id="settings-streak-pill" style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);">🔥 0 ngày</span>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-layout-grid">
        
        <!-- Column 1: FSRS-6 Algorithm & Learning Profiles -->
        <div class="settings-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>
              THUẬT TOÁN FSRS-6
            </span>
          </div>

          <div class="inset-grouped-card">
            <!-- AI Behavioral Optimizer Feature Banner -->
            <div class="optimizer-feature-card">
              <div class="optimizer-feature-left">
                <div class="optimizer-feature-badge">⚡ AI OPTIMIZER</div>
                <div class="optimizer-feature-title">Tối ưu hóa FSRS theo hành vi</div>
              </div>
              <button type="button" class="btn-primary-hero btn-run-optimizer" id="btn-run-behavioral-optimizer">
                <span>🧠 Phân tích & Tối ưu</span>
              </button>
            </div>

            <!-- 1-Tap Learning Profile Presets -->
            <div class="setting-row profile-presets-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
              <div class="setting-info">
                <span class="setting-title">Gói mục tiêu học</span>
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
              </div>
              <select id="setting-review-limit" class="setting-select">
                <option value="10">10 từ</option>
                <option value="20" selected>20 từ (Chuẩn)</option>
                <option value="30">30 từ</option>
                <option value="50">50 từ</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Chống dồn lịch ôn (Fuzz)</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-enable-fuzz" checked>
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Mốc bắt đầu ngày mới</span>
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
                <span class="setting-title">Ngưỡng từ khó (Leech)</span>
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
              </div>
              <select id="setting-leech-action" class="setting-select">
                <option value="tag">⚠️ Gắn cờ cảnh báo</option>
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
            </div>

            <div class="inset-grouped-card">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Tự động phát âm</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="setting-auto-speech" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Giọng phát âm ưu tiên</span>
                </div>
                <select id="setting-audio-accent" class="setting-select">
                  <option value="us">🇺🇸 Anh - Mỹ (US)</option>
                  <option value="uk">🇬🇧 Anh - Anh (UK)</option>
                  <option value="au">🇦🇺 Anh - Úc (AU)</option>
                </select>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Tốc độ phát âm</span>
                </div>
                <select id="setting-speech-rate" class="setting-select">
                  <option value="0.75">0.75x (Chậm)</option>
                  <option value="0.90" selected>0.90x (Tự nhiên)</option>
                  <option value="1.00">1.00x (Chuẩn bản ngữ)</option>
                  <option value="1.15">1.15x (Nhanh)</option>
                </select>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Chế độ nền tối (Dark Mode)</span>
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
            </div>

            <div class="inset-grouped-card">
              <div class="setting-row setting-actions-compact-row" style="border-bottom: none; padding: 16px;">
                <div class="settings-buttons-group">
                  <button type="button" id="btn-test-native-audio" class="btn-setting-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    <span>Nghe thử âm thanh</span>
                  </button>
                  <button type="button" id="btn-settings-export-data" class="btn-setting-btn primary">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    <span>Xuất file JSON sao lưu</span>
                  </button>
                  <button type="button" id="btn-settings-import-data-trigger" class="btn-setting-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    <span>Nhập file JSON phục hồi</span>
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
          app.switchTab(app.previousTab || 'tab-review');
        } catch (err) {
          console.error('Lỗi khi quay lại từ Cài đặt:', err);
        }
      };
    }

    // 1. Hồ sơ người dùng trong Cài đặt
    const savedName = localStorage.getItem('fc_pro_user_name') || 'Học Viên Flashcard Pro';
    const savedAvatar = localStorage.getItem('fc_pro_user_avatar') || '🎓';

    const nameEl = document.getElementById('settings-username-display');
    if (nameEl) nameEl.textContent = savedName;

    const avatarEl = document.getElementById('settings-avatar-emoji');
    if (avatarEl) avatarEl.textContent = savedAvatar;

    const btnEditName = document.getElementById('btn-settings-edit-name');
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

    const avatarBtn = document.getElementById('settings-avatar-btn');
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

    try {
      const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
      const memIntel = StatsManager.getMemoryIntelligence(allCards);
      const logs = StorageManager.getStudyLogs();
      const streak = StatsManager.calculateStreak(logs);

      const rankPill = document.getElementById('settings-rank-pill');
      if (rankPill && memIntel && memIntel.rank) {
        rankPill.textContent = `${memIntel.rank.title} (${memIntel.rank.badge})`;
        rankPill.style.background = `${memIntel.rank.color}18`;
        rankPill.style.color = memIntel.rank.color;
      }

      const streakPill = document.getElementById('settings-streak-pill');
      if (streakPill) {
        streakPill.textContent = `🔥 ${streak} ngày học`;
      }
    } catch (e) {}

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


