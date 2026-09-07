/**
 * Settings View - FSRS Parameters, Audio, Theme Configuration & Data Management
 */

import { StorageManager } from '../storage.js';
import { showConfirm, showToast } from '../components/feedback.js';

function saveAppSettings(app) {
  StorageManager.saveSettings(app.settings);
  if (app.studySession && typeof app.studySession.updateSettings === 'function') {
    app.studySession.updateSettings(app.settings);
  }
}

export function setupSettingsUI(app) {
  try {
    const retentionSlider = document.getElementById('setting-retention');
    const retentionLabel = document.getElementById('retention-slider-label');
    const newLimitSlider = document.getElementById('setting-new-limit');
    const newLimitLabel = document.getElementById('new-limit-label');
    const reviewLimitSlider = document.getElementById('setting-review-limit');
    const reviewLimitLabel = document.getElementById('review-limit-label');
    const autoSpeechToggle = document.getElementById('setting-auto-speech');
    const darkThemeToggle = document.getElementById('setting-dark-theme');
    const btnBack = document.getElementById('btn-back-from-settings');

    // Nút Quay lại từ màn hình cài đặt
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

    if (!retentionSlider) return;

    // Khởi tạo giá trị
    retentionSlider.value = app.settings.requestRetention || 0.90;
    if (retentionLabel) retentionLabel.textContent = `${Math.round(retentionSlider.value * 100)}%`;

    if (newLimitSlider) {
      newLimitSlider.value = app.settings.dailyNewLimit || 10;
      if (newLimitLabel) newLimitLabel.textContent = `${newLimitSlider.value} từ/ngày`;
      newLimitSlider.addEventListener('input', (e) => {
        try {
          const val = parseInt(e.target.value, 10);
          if (newLimitLabel) newLimitLabel.textContent = `${val} từ/ngày`;
          app.settings.dailyNewLimit = val;
          saveAppSettings(app);
          app.refreshAllViews();
        } catch (err) {
          console.error('Lỗi cập nhật newLimitSlider:', err);
        }
      });
    }

    if (reviewLimitSlider) {
      reviewLimitSlider.value = app.settings.dailyReviewLimit || 50;
      if (reviewLimitLabel) reviewLimitLabel.textContent = `${reviewLimitSlider.value} thẻ/ngày`;
      reviewLimitSlider.addEventListener('input', (e) => {
        try {
          const val = parseInt(e.target.value, 10);
          if (reviewLimitLabel) reviewLimitLabel.textContent = `${val} thẻ/ngày`;
          app.settings.dailyReviewLimit = val;
          saveAppSettings(app);
          app.refreshAllViews();
        } catch (err) {
          console.error('Lỗi cập nhật reviewLimitSlider:', err);
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
      speechRateSelect.value = String(app.settings.speechRate || 0.9);
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

    // Retention slider event
    retentionSlider.addEventListener('input', (e) => {
      try {
        const val = parseFloat(e.target.value);
        if (retentionLabel) retentionLabel.textContent = `${Math.round(val * 100)}%`;
        app.settings.requestRetention = val;
        saveAppSettings(app);
      } catch (err) {
        console.error('Lỗi cập nhật retentionSlider:', err);
      }
    });

    // Quản lý dữ liệu & Đặt lại (Reset) từ màn hình Cài đặt
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

/**
 * Cập nhật lại giá trị hiển thị trên các thanh trượt và nút gạt của Settings
 */
export function updateSettingsUIValues(app) {
  try {
    const settings = app.settings || StorageManager.getSettings();
    const retentionSlider = document.getElementById('setting-retention');
    const retentionLabel = document.getElementById('retention-slider-label');
    const newLimitSlider = document.getElementById('setting-new-limit');
    const newLimitLabel = document.getElementById('new-limit-label');
    const reviewLimitSlider = document.getElementById('setting-review-limit');
    const reviewLimitLabel = document.getElementById('review-limit-label');
    const autoSpeechToggle = document.getElementById('setting-auto-speech');
    const darkThemeToggle = document.getElementById('setting-dark-theme');
    const audioAccentSelect = document.getElementById('setting-audio-accent');

    if (retentionSlider) {
      retentionSlider.value = settings.requestRetention || 0.90;
      if (retentionLabel) retentionLabel.textContent = `${Math.round(retentionSlider.value * 100)}%`;
    }
    if (newLimitSlider) {
      newLimitSlider.value = settings.dailyNewLimit || 10;
      if (newLimitLabel) newLimitLabel.textContent = `${newLimitSlider.value} từ/ngày`;
    }
    if (reviewLimitSlider) {
      reviewLimitSlider.value = settings.dailyReviewLimit || 50;
      if (reviewLimitLabel) reviewLimitLabel.textContent = `${reviewLimitSlider.value} thẻ/ngày`;
    }
    if (autoSpeechToggle) autoSpeechToggle.checked = settings.autoPronounce !== false;
    if (darkThemeToggle) darkThemeToggle.checked = (settings.theme || 'light') === 'dark';
    if (audioAccentSelect) audioAccentSelect.value = settings.audioAccent || 'us';
  } catch (err) {
    console.warn('Lỗi updateSettingsUIValues:', err);
  }
}

/**
 * Xử lý nhập file sao lưu JSON dùng chung
 */
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
