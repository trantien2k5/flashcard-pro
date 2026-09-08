/**
 * Study Time Tracker - Accurate Active Learning Time with Anti-Idle Detection
 */

import { StorageManager } from '../../services/storage.js';

export class StudyTimeTracker {
  constructor() {
    this.isActiveSession = false;
    this.isPaused = false;
    this.isIdle = false;

    this.idleThresholdMs = 25 * 1000; // 25 giây không có tương tác -> coi như treo máy
    this.lastActivityTime = 0;
    this.lastTickTime = 0;
    this.unflushedSeconds = 0;

    this.intervalId = null;
    this._boundOnVisibilityChange = this._onVisibilityChange.bind(this);
    this._boundOnUserActivity = this.recordActivity.bind(this);
  }

  /**
   * Bắt đầu theo dõi thời gian cho phiên học
   */
  startSession() {
    if (this.isActiveSession) {
      this.flush();
    }

    const now = Date.now();
    this.isActiveSession = true;
    this.isPaused = false;
    this.isIdle = false;
    this.lastActivityTime = now;
    this.lastTickTime = now;
    this.unflushedSeconds = 0;

    // Lắng nghe sự kiện tab ẩn/hiện
    document.addEventListener('visibilitychange', this._boundOnVisibilityChange);
    window.addEventListener('pagehide', this._boundOnVisibilityChange);

    // Lắng nghe tương tác người dùng để duy trì trạng thái active
    const overlay = document.getElementById('study-overlay');
    if (overlay) {
      overlay.addEventListener('pointerdown', this._boundOnUserActivity, { passive: true });
      overlay.addEventListener('keydown', this._boundOnUserActivity, { passive: true });
      overlay.addEventListener('touchstart', this._boundOnUserActivity, { passive: true });
    }

    // Bắt đầu chu kỳ đếm 1s/lần
    this._startTicker();
  }

  /**
   * Ghi nhận người dùng vừa có hành vi học (lật thẻ, chấm điểm, nghe âm thanh, chạm)
   */
  recordActivity() {
    if (!this.isActiveSession) return;
    
    const now = Date.now();
    this.lastActivityTime = now;

    // Nếu trước đó đang bị tính là treo máy thì kích hoạt lại bộ đếm từ thời điểm này
    if (this.isIdle) {
      this.isIdle = false;
      this.lastTickTime = now;
    }
  }

  /**
   * Tạm dừng hoặc tiếp tục khi tab thay đổi trạng thái ẩn/hiện
   */
  _onVisibilityChange() {
    if (!this.isActiveSession) return;

    if (document.visibilityState === 'hidden') {
      this.pause();
    } else if (document.visibilityState === 'visible') {
      this.resume();
    }
  }

  pause() {
    if (!this.isActiveSession || this.isPaused) return;
    this._tick();
    this.flush();
    this.isPaused = true;
  }

  resume() {
    if (!this.isActiveSession || !this.isPaused) return;
    const now = Date.now();
    this.isPaused = false;
    this.isIdle = false;
    this.lastActivityTime = now;
    this.lastTickTime = now;
  }

  _startTicker() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this._tick();
    }, 1000);
  }

  _tick() {
    if (!this.isActiveSession || this.isPaused) return;

    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;

    // Kiểm tra phát hiện treo máy
    if (timeSinceLastActivity > this.idleThresholdMs) {
      this.isIdle = true;
      this.lastTickTime = now;
      return;
    }

    // Tính số giây thực tế trôi qua giữa 2 nhịp tick
    const deltaMs = now - this.lastTickTime;
    this.lastTickTime = now;

    if (deltaMs > 0 && deltaMs < 5000) { // Bỏ qua nếu có độ trễ bất thường
      this.unflushedSeconds += (deltaMs / 1000);
    }

    // Flush định kỳ mỗi khi tích lũy đủ 5 giây
    if (this.unflushedSeconds >= 5) {
      this.flush();
    }
  }

  /**
   * Lưu số giây tích lũy vào StorageManager
   */
  flush() {
    try {
      if (this.unflushedSeconds >= 0.5) {
        const secsToSave = Math.floor(this.unflushedSeconds);
        if (secsToSave > 0) {
          if (typeof StorageManager.addStudySeconds === 'function') {
            StorageManager.addStudySeconds(secsToSave);
          }
          this.unflushedSeconds -= secsToSave;
        }
      }
    } catch (err) {
      console.error('Lỗi khi flush study time:', err);
    }
  }

  /**
   * Kết thúc phiên học, gỡ bỏ listeners và flush toàn bộ thời gian còn lại
   */
  endSession() {
    if (!this.isActiveSession) return;

    this._tick();
    this.flush();

    this.isActiveSession = false;
    this.isPaused = false;
    this.isIdle = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    document.removeEventListener('visibilitychange', this._boundOnVisibilityChange);
    window.removeEventListener('pagehide', this._boundOnVisibilityChange);

    const overlay = document.getElementById('study-overlay');
    if (overlay) {
      overlay.removeEventListener('pointerdown', this._boundOnUserActivity);
      overlay.removeEventListener('keydown', this._boundOnUserActivity);
      overlay.removeEventListener('touchstart', this._boundOnUserActivity);
    }
  }
}

export const globalStudyTimer = new StudyTimeTracker();
