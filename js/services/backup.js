/**
 * Backup Service - Export / Import JSON & Data Reset Operations
 */

import { StorageManager } from './storage.js';

export class BackupService {
  /**
   * Export all user data to a downloadable JSON file
   */
  static exportToJSON(filename = null) {
    try {
      const data = StorageManager.exportBackup();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().slice(0, 10);
      const safeFilename = filename || `flashcard_pro_backup_${dateStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, count: Object.keys(data.cards || {}).length };
    } catch (e) {
      console.error('[BackupService] Export error:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Import data from a selected File or JSON text
   */
  static async importFromFile(file) {
    if (!file) {
      return { success: false, error: 'Không tìm thấy tệp dữ liệu để nhập.' };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const result = await StorageManager.importBackup(parsed);
          resolve(result);
        } catch (err) {
          resolve({ success: false, error: 'Tệp không đúng định dạng JSON hoặc bị lỗi cú pháp.' });
        }
      };
      reader.onerror = () => resolve({ success: false, error: 'Không thể đọc tệp tin đã chọn.' });
      reader.readAsText(file);
    });
  }

  /**
   * Reset all progress and settings
   */
  static async resetAll() {
    return await StorageManager.clearAllData();
  }
}
