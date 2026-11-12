/**
 * Settings View Controller Facade
 * Điều phối shell, hồ sơ/CEFR, cấu hình FSRS & quản lý dữ liệu.
 */

import { openBehavioralOptimizerModal } from './components.js';
import { renderSettingsTabShell } from './settings/template.js';
import { bindSettingsProfileAndRoadmap } from './settings/cefr-profile.js';
import { bindSettingsControls, updateSettingsUIValues } from './settings/controls.js';
import { bindSettingsDataActions, executeBackupImport } from './settings/data-actions.js';

export {
  renderSettingsTabShell,
  updateSettingsUIValues,
  executeBackupImport
};

export function setupSettingsUI(app) {
  try {
    const tabPane = document.getElementById('tab-settings');
    if (tabPane) renderSettingsTabShell(tabPane);

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

    const btnBack = document.getElementById('btn-back-from-settings');
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

    bindSettingsProfileAndRoadmap(app);
    bindSettingsControls(app);
    bindSettingsDataActions(app);
  } catch (err) {
    console.error('Lỗi khởi tạo setupSettingsUI:', err);
  }
}
