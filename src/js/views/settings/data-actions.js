/**
 * Settings Data Actions - Audio Test, SW Update, JSON Backup Export/Import & Data Reset
 */

import { StorageManager, BackupService } from '../../services/storage.js';
import { showConfirm, showToast } from '../components.js';
import { APP_CONFIG } from '../../config.js';
import { updateSettingsUIValues } from './controls.js';

/**
 * Thực thi nạp & phục hồi dữ liệu FSRS từ file JSON sao lưu
 */
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

/**
 * Gắn sự kiện cho các nút thao tác hệ thống & quản lý dữ liệu
 */
export function bindSettingsDataActions(app) {
  const btnTestAudio = document.getElementById('btn-test-native-audio');
  if (btnTestAudio && !btnTestAudio._bound) {
    btnTestAudio._bound = true;
    btnTestAudio.onclick = () => {
      try {
        const sampleWord = (app.settings.audioAccent || 'us') === 'uk' ? 'schedule' : 'wonderful';
        app.studySession.speak(sampleWord);
      } catch (err) {
        console.error('Lỗi test âm thanh:', err);
      }
    };
  }

  const btnCheckUpdate = document.getElementById('btn-settings-check-update');
  if (btnCheckUpdate) {
    btnCheckUpdate.onclick = async () => {
      const iconSpin = btnCheckUpdate.querySelector('.icon-update-spin');
      const textLabel = btnCheckUpdate.querySelector('#text-settings-check-update');
      const originalText = textLabel ? textLabel.textContent : '';

      try {
        if (iconSpin) iconSpin.classList.add('spinning');
        if (textLabel) textLabel.textContent = 'Đang kiểm tra...';
        btnCheckUpdate.disabled = true;

        if (app && typeof app.checkUpdate === 'function') {
          await app.checkUpdate({ manual: true });
        } else {
          showToast('🔍 Đang kiểm tra phiên bản mới từ máy chủ...', 'info', 2000);
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
          }
          showToast(`✅ Bạn đang ở phiên bản mới nhất (v${APP_CONFIG.version})!`, 'success', 2500);
        }
      } catch (err) {
        console.error('Lỗi check update:', err);
        showToast('⚠️ Không thể kiểm tra cập nhật lúc này.', 'warning', 2500);
      } finally {
        if (iconSpin) iconSpin.classList.remove('spinning');
        if (textLabel) textLabel.textContent = originalText || `Kiểm tra cập nhật (v${APP_CONFIG.version})`;
        btnCheckUpdate.disabled = false;
      }
    };
  }

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
}

