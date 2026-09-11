/**
 * Settings & Profile View Controller
 * Consolidates FSRS Parameters, Audio, Theme Configuration, Achievements & Pure Local Data Management
 */

import { StorageManager } from '../services/storage.js';
import { StatsManager } from '../core/stats.js';
import { State } from '../core/fsrs.js';
import { showConfirm, showToast } from './components.js';

function saveAppSettings(app) {
  StorageManager.saveSettings(app.settings);
  if (app.studySession && typeof app.studySession.updateSettings === 'function') {
    app.studySession.updateSettings(app.settings);
  }
}

/* ==========================================================================
   1. SETTINGS VIEW CONTROLLER
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
        
        <!-- 1. FSRS Section Group -->
        <div class="settings-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>
              THUẬT TOÁN FSRS-6
            </span>
            <span class="section-group-hint">Tối ưu hóa khả năng ghi nhớ dài hạn</span>
          </div>

          <div class="inset-grouped-card">
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
                <option value="20">20 từ</option>
                <option value="50">50 từ (Chuẩn)</option>
                <option value="100">100 từ</option>
                <option value="200">200 từ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. Audio & Appearance Group -->
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

        <!-- 3. Data Management Group -->
        <div class="settings-group" style="grid-column: 1 / -1;">
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

    if (autoSpeechToggle) {
      autoSpeechToggle.checked = app.settings.autoPronounce !== false;
      autoSpeechToggle.addEventListener('change', (e) => {
        try {
          app.settings.autoPronounce = e.target.checked;
          saveAppSettings(app);
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

    // Export / Import JSON & Data Reset
    const btnExport = document.getElementById('btn-settings-export-data');
    if (btnExport) {
      btnExport.onclick = () => {
        try {
          const data = StorageManager.exportBackup();
          const jsonStr = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const dateStr = new Date().toISOString().slice(0, 10);
          a.href = url;
          a.download = `flashcard_pro_backup_${dateStr}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('Đã xuất file sao lưu JSON thành công! 📁', 'success');
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
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await StorageManager.importBackup(data);
    if (res.success) {
      showToast('Khôi phục dữ liệu FSRS thành công! 🎉', 'success');
      app.settings = StorageManager.getSettings();
      app.applyTheme(app.settings.theme || 'light');
      updateSettingsUIValues(app);
      app.refreshAllViews();
    } else {
      showToast('Lỗi dữ liệu file: ' + (res.error || 'Không hợp lệ'), 'error');
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
          <div class="user-avatar-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="user-info-text">
            <h2 class="profile-user-name">Học Viên Flashcard Pro</h2>
            <p class="profile-user-status">100% Offline · Dữ liệu mã hóa an toàn trên máy</p>
          </div>
        </div>
        <div class="profile-hero-badges">
          <span class="profile-pill-badge" style="background: rgba(99, 102, 241, 0.12); color: var(--primary);">FSRS-6 Engine</span>
        </div>
      </div>

      <!-- 2. Profile Dashboard Layout (iOS Inset Grouped Style) -->
      <div class="profile-dashboard-layout">
        
        <!-- Achievements Group -->
        <div class="profile-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
              THÀNH TÍCH HỌC TẬP
            </span>
            <span class="section-group-hint">Tiến trình và chuỗi ngày kiên trì</span>
          </div>

          <div class="inset-grouped-card">
            <div class="profile-achieve-grid">
              <div class="achieve-col">
                <span class="achieve-val" id="profile-achieve-learned">0</span>
                <span class="achieve-lbl">Từ đã thuộc</span>
              </div>
              <div class="achieve-divider"></div>
              <div class="achieve-col">
                <span class="achieve-val" id="profile-achieve-streak">0 ngày</span>
                <span class="achieve-lbl">Chuỗi ngày</span>
              </div>
              <div class="achieve-divider"></div>
              <div class="achieve-col">
                <span class="achieve-val" id="profile-achieve-time">0 ph</span>
                <span class="achieve-lbl">Thời gian học</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Knowledge Base Taxonomy Group -->
        <div class="profile-group">
          <div class="section-group-header">
            <span class="section-group-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M2 10h20"/></svg>
              KHO DỮ LIỆU HỆ THỐNG
            </span>
            <span class="section-group-hint">Cơ sở dữ liệu từ vựng chuẩn FSRS-6</span>
          </div>

          <div class="inset-grouped-card">
            <div class="profile-stats-grid">
              <div class="profile-stat-box">
                <span class="profile-stat-num" id="tax-topics-count">16</span>
                <span class="profile-stat-lbl">Chủ đề lớn</span>
              </div>
              <div class="profile-stat-box">
                <span class="profile-stat-num" id="tax-subtopics-count">149</span>
                <span class="profile-stat-lbl">Chặng học con</span>
              </div>
              <div class="profile-stat-box">
                <span class="profile-stat-num" id="tax-words-count">2,400</span>
                <span class="profile-stat-lbl">Tổng từ vựng</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access Settings -->
        <div class="profile-group" style="grid-column: 1 / -1;">
          <div class="inset-grouped-card" style="padding: 12px;">
            <button id="btn-profile-to-settings" class="btn-primary-hero" style="width: 100%; border: none; cursor: pointer;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Cài đặt hệ thống & FSRS</span>
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

    const btnToSettings = document.getElementById('btn-profile-to-settings');
    if (btnToSettings && !btnToSettings._bound) {
      btnToSettings._bound = true;
      btnToSettings.onclick = () => app.switchTab('tab-settings');
    }

    const allDecks = app.deckManager.getAllDecks();
    const allCards = app.deckManager.getAllCards();
    const cardStates = StorageManager.getAllCardStates();
    const logs = StorageManager.getStudyLogs();

    // 1. Cập nhật Kho kiến thức
    const totalTopics = allDecks.length;
    const totalSubtopics = allDecks.reduce((sum, d) => sum + ((d.subtopics && d.subtopics.length) ? d.subtopics.length : (d.subcategories && d.subcategories.length ? d.subcategories.length : 1)), 0);
    const totalWords = allCards.length;

    const topicsEl = document.getElementById('tax-topics-count');
    if (topicsEl) topicsEl.textContent = totalTopics;

    const subtopicsEl = document.getElementById('tax-subtopics-count');
    if (subtopicsEl) subtopicsEl.textContent = totalSubtopics;

    const wordsEl = document.getElementById('tax-words-count');
    if (wordsEl) wordsEl.textContent = totalWords.toLocaleString('vi-VN');

    // 2. Cập nhật Thành tích học tập cá nhân
    const learnedCards = allCards.filter(card => {
      const s = cardStates[card.id];
      return s && s.state !== State.New && s.state !== 0 && s.stability && s.stability > 0;
    });
    const achieveLearnedEl = document.getElementById('profile-achieve-learned');
    if (achieveLearnedEl) achieveLearnedEl.textContent = learnedCards.length;

    const streak = StatsManager.calculateStreak(logs);
    const achieveStreakEl = document.getElementById('profile-achieve-streak');
    if (achieveStreakEl) achieveStreakEl.textContent = `${streak} ngày`;

    // Tổng thời gian học
    const timeMap = typeof StorageManager.getStudyTimeMap === 'function' ? StorageManager.getStudyTimeMap() : {};
    const totalSeconds = Object.values(timeMap).reduce((sum, s) => sum + (Number(s) || 0), 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const achieveTimeEl = document.getElementById('profile-achieve-time');
    if (achieveTimeEl) {
      if (totalMinutes < 1) {
        achieveTimeEl.textContent = totalSeconds > 0 ? '< 1 ph' : '0 ph';
      } else {
        achieveTimeEl.textContent = `${totalMinutes} ph`;
      }
    }
  } catch (err) {
    console.error('Lỗi trong renderProfileTab:', err);
  }
}
