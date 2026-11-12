/**
 * Settings Controls - Presets, FSRS Parameters, Audio & Appearance Handlers
 */

import { StorageManager } from '../../services/storage.js';

export function saveAppSettings(app) {
  StorageManager.saveSettings(app.settings);
  if (app.studySession && typeof app.studySession.updateSettings === 'function') {
    app.studySession.updateSettings(app.settings);
  }
}

/**
 * Đồng bộ & gắn sự kiện cho các control FSRS, Âm thanh & Giao diện
 */
export function bindSettingsControls(app) {
  const retentionSelect = document.getElementById('setting-retention');
  if (!retentionSelect) return;

  const newLimitSelect = document.getElementById('setting-new-limit');
  const reviewLimitSelect = document.getElementById('setting-review-limit');
  const enableFuzzToggle = document.getElementById('setting-enable-fuzz');
  const rolloverHourSelect = document.getElementById('setting-rollover-hour');
  const leechThresholdSelect = document.getElementById('setting-leech-threshold');
  const leechActionSelect = document.getElementById('setting-leech-action');
  const autoSpeechToggle = document.getElementById('setting-auto-speech');
  const darkThemeToggle = document.getElementById('setting-dark-theme');
  const audioAccentSelect = document.getElementById('setting-audio-accent');
  const speechRateSelect = document.getElementById('setting-speech-rate');

  const syncPresetButtons = () => {
    const ret = parseFloat(app.settings.requestRetention || 0.9);
    const nw = parseInt(app.settings.dailyNewLimit || 10, 10);
    document.querySelectorAll('.btn-profile-preset').forEach(b => {
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
  if (!retentionSelect.value) retentionSelect.value = currentRetention.toFixed(2);
  if (!retentionSelect.value) retentionSelect.value = '0.9';
  retentionSelect.onchange = (e) => {
    try {
      app.settings.requestRetention = parseFloat(e.target.value);
      saveAppSettings(app);
      app.refreshAllViews();
    } catch (err) {
      console.error('Lỗi cập nhật retentionSelect:', err);
    }
  };

  if (newLimitSelect) {
    newLimitSelect.value = String(app.settings.dailyNewLimit || 10);
    newLimitSelect.onchange = (e) => {
      try {
        app.settings.dailyNewLimit = parseInt(e.target.value, 10);
        saveAppSettings(app);
        app.refreshAllViews();
      } catch (err) {
        console.error('Lỗi cập nhật newLimitSelect:', err);
      }
    };
  }

  if (reviewLimitSelect) {
    reviewLimitSelect.value = String(app.settings.dailyReviewLimit || 50);
    reviewLimitSelect.onchange = (e) => {
      try {
        app.settings.dailyReviewLimit = parseInt(e.target.value, 10);
        saveAppSettings(app);
        app.refreshAllViews();
      } catch (err) {
        console.error('Lỗi cập nhật reviewLimitSelect:', err);
      }
    };
  }

  if (enableFuzzToggle) {
    enableFuzzToggle.checked = app.settings.enableFuzz !== false;
    enableFuzzToggle.onchange = (e) => {
      try {
        app.settings.enableFuzz = e.target.checked;
        saveAppSettings(app);
      } catch (err) {
        console.error('Lỗi cập nhật enableFuzzToggle:', err);
      }
    };
  }

  if (rolloverHourSelect) {
    rolloverHourSelect.value = String(app.settings.rolloverHour !== undefined ? app.settings.rolloverHour : 4);
    rolloverHourSelect.onchange = (e) => {
      try {
        app.settings.rolloverHour = parseInt(e.target.value, 10);
        saveAppSettings(app);
        app.refreshAllViews();
      } catch (err) {
        console.error('Lỗi cập nhật rolloverHourSelect:', err);
      }
    };
  }

  if (leechThresholdSelect) {
    leechThresholdSelect.value = String(app.settings.leechThreshold || 8);
    leechThresholdSelect.onchange = (e) => {
      try {
        app.settings.leechThreshold = parseInt(e.target.value, 10);
        saveAppSettings(app);
      } catch (err) {
        console.error('Lỗi cập nhật leechThresholdSelect:', err);
      }
    };
  }

  if (leechActionSelect) {
    leechActionSelect.value = app.settings.leechAction || 'suspend';
    leechActionSelect.onchange = (e) => {
      try {
        app.settings.leechAction = e.target.value;
        saveAppSettings(app);
      } catch (err) {
        console.error('Lỗi cập nhật leechActionSelect:', err);
      }
    };
  }

  if (autoSpeechToggle) {
    autoSpeechToggle.checked = app.settings?.autoPronounce !== false;
    autoSpeechToggle.onchange = (e) => {
      try {
        const isEnabled = e.target.checked;
        app.settings.autoPronounce = isEnabled;
        saveAppSettings(app);
        try {
          const raw = localStorage.getItem('study_display_prefs');
          const prefs = raw ? JSON.parse(raw) : {};
          prefs.autoplayAudio = isEnabled;
          localStorage.setItem('study_display_prefs', JSON.stringify(prefs));
        } catch (e2) {}
        if (app.studySession) app.studySession.updateSettings(app.settings);
      } catch (err) {
        console.error('Lỗi cập nhật autoSpeechToggle:', err);
      }
    };
  }

  if (darkThemeToggle) {
    darkThemeToggle.checked = (app.settings.theme || 'light') === 'dark';
    darkThemeToggle.onchange = (e) => {
      try {
        const theme = e.target.checked ? 'dark' : 'light';
        app.settings.theme = theme;
        app.applyTheme(theme);
        saveAppSettings(app);
      } catch (err) {
        console.error('Lỗi cập nhật darkThemeToggle:', err);
      }
    };
  }

  if (audioAccentSelect) {
    audioAccentSelect.value = app.settings.audioAccent || 'us';
    audioAccentSelect.onchange = (e) => {
      try {
        app.settings.audioAccent = e.target.value;
        saveAppSettings(app);
      } catch (err) {
        console.error('Lỗi cập nhật audioAccent:', err);
      }
    };
  }

  if (speechRateSelect) {
    const currentSpeechRate = parseFloat(app.settings.speechRate || 0.9);
    speechRateSelect.value = String(currentSpeechRate);
    if (!speechRateSelect.value) speechRateSelect.value = currentSpeechRate.toFixed(1);
    if (!speechRateSelect.value) speechRateSelect.value = '0.9';

    speechRateSelect.onchange = (e) => {
      try {
        app.settings.speechRate = parseFloat(e.target.value);
        saveAppSettings(app);
      } catch (err) {
        console.error('Lỗi cập nhật speechRate:', err);
      }
    };
  }
}

/**
 * Cập nhật lại giá trị UI của các ô select/toggle từ Storage/State hiện hành
 */
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

    if (retentionSelect) retentionSelect.value = String(settings.requestRetention || 0.90);
    if (newLimitSelect) newLimitSelect.value = String(settings.dailyNewLimit || 10);
    if (reviewLimitSelect) reviewLimitSelect.value = String(settings.dailyReviewLimit || 50);
    if (autoSpeechToggle) autoSpeechToggle.checked = settings.autoPronounce !== false;
    if (darkThemeToggle) darkThemeToggle.checked = (settings.theme || 'light') === 'dark';
    if (audioAccentSelect) audioAccentSelect.value = settings.audioAccent || 'us';
    if (speechRateSelect) speechRateSelect.value = String(settings.speechRate || 0.9);
  } catch (err) {
    console.warn('Lỗi updateSettingsUIValues:', err);
  }
}

