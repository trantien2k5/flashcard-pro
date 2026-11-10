/**
 * Study Time Tracker & Active Session Monitor
 * Đếm thời gian học tập thực tế, tự động tạm dừng khi AFK / ẩn tab trình duyệt
 */

import { StorageManager } from '../services/storage.js';

export class StudyTimeTracker {
  constructor() {
    this.isActiveSession = false;
    this.isPaused = false;
    this.isIdle = false;

    this.idleThresholdMs = 10 * 1000; // 10 giây không có tương tác học -> tạm dừng bộ đếm (Idle AFK)
    this.lastActivityTime = 0;
    this.lastTickTime = 0;
    this.unflushedSeconds = 0;
    this.sessionSeconds = 0;

    this.intervalId = null;
    this.subscribers = new Set();

    this._boundOnVisibilityChange = this._onVisibilityChange.bind(this);
    this._boundOnUserActivity = this.recordActivity.bind(this);
  }

  /**
   * Đăng ký lắng nghe nhịp tick thời gian học trực tiếp (cho Header Quiz/Study)
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.add(callback);
      // Gửi ngay trạng thái hiện tại
      callback(this.getTimerState());
      return () => this.subscribers.delete(callback);
    }
    return () => {};
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  _notifySubscribers() {
    const state = this.getTimerState();
    this.subscribers.forEach(cb => {
      try {
        cb(state);
      } catch (e) {
        console.warn('Lỗi subscriber study timer:', e);
      }
    });
  }

  getTimerState() {
    const secs = Math.max(0, Math.floor(this.sessionSeconds));
    return {
      isActive: this.isActiveSession,
      sessionSeconds: secs,
      formattedSessionTime: this.formatDuration(secs),
      isIdle: this.isIdle,
      isPaused: this.isPaused
    };
  }

  formatDuration(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${pad(hrs)}:${pad(remMins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  /**
   * Bắt đầu theo dõi thời gian cho phiên học (Study/Quiz Modal)
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
    this.sessionSeconds = 0;

    // Lắng nghe sự kiện tab ẩn/hiện
    document.addEventListener('visibilitychange', this._boundOnVisibilityChange);
    window.addEventListener('pagehide', this._boundOnVisibilityChange);

    // Lắng nghe tương tác chủ động (chạm, phím, click học)
    window.addEventListener('pointerdown', this._boundOnUserActivity, { passive: true, capture: true });
    window.addEventListener('keydown', this._boundOnUserActivity, { passive: true, capture: true });
    window.addEventListener('touchstart', this._boundOnUserActivity, { passive: true, capture: true });

    // Bắt đầu chu kỳ đếm 1s/lần
    this._startTicker();
    this._notifySubscribers();
  }

  /**
   * Ghi nhận người dùng vừa có hành vi học (lật thẻ, chấm điểm, nghe âm thanh, chạm, gõ phím)
   */
  recordActivity() {
    if (!this.isActiveSession) return;
    
    const now = Date.now();
    this.lastActivityTime = now;

    // Nếu trước đó đang bị tính là treo máy thì kích hoạt lại bộ đếm từ thời điểm này
    if (this.isIdle) {
      this.isIdle = false;
      this.lastTickTime = now;
      this._notifySubscribers();
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
    this._notifySubscribers();
  }

  resume() {
    if (!this.isActiveSession || !this.isPaused) return;
    const now = Date.now();
    this.isPaused = false;
    this.isIdle = false;
    this.lastActivityTime = now;
    this.lastTickTime = now;
    this._notifySubscribers();
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

    // Kiểm tra phát hiện treo máy (AFK > 10s)
    if (timeSinceLastActivity > this.idleThresholdMs) {
      const wasNotIdle = !this.isIdle;
      this.isIdle = true;
      this.lastTickTime = now;
      if (wasNotIdle) {
        this.flush();
        this._notifySubscribers();
      }
      return;
    }

    // Đang hoạt động tích cực
    this.isIdle = false;

    // Tính số giây thực tế trôi qua giữa 2 nhịp tick
    const deltaMs = now - this.lastTickTime;
    this.lastTickTime = now;

    if (deltaMs > 0 && deltaMs < 5000) { // Bỏ qua nếu có độ trễ bất thường
      const deltaSec = deltaMs / 1000;
      this.unflushedSeconds += deltaSec;
      this.sessionSeconds += deltaSec;
    }

    // Flush định kỳ mỗi khi tích lũy đủ 3 giây
    if (this.unflushedSeconds >= 3) {
      this.flush();
    }

    this._notifySubscribers();
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

    window.removeEventListener('pointerdown', this._boundOnUserActivity, { capture: true });
    window.removeEventListener('keydown', this._boundOnUserActivity, { capture: true });
    window.removeEventListener('touchstart', this._boundOnUserActivity, { capture: true });

    this._notifySubscribers();
  }
}

export const globalStudyTimer = new StudyTimeTracker();

