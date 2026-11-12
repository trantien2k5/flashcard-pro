/**
 * Settings View HTML Shell Template
 */

import { APP_CONFIG } from '../../config.js';

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

      <!-- Thanh Tiến Độ Trình Độ CEFR & Lộ Trình -->
      <div class="home-goal-bar-card" id="home-goal-card" role="button" tabindex="0" title="Nhấn để xem phân tích lộ trình CEFR & nhịp độ cá nhân hóa" style="margin-bottom: 16px;">
        <div class="goal-bar-header">
          <div class="goal-top-meta-row">
            <div class="goal-eyebrow-wrap">
              <span class="goal-eyebrow">TRÌNH ĐỘ HIỆN TẠI</span>
              <span class="goal-level-badge" id="home-current-level-badge">A1 (0%)</span>
            </div>
            <span class="goal-target-tag" id="home-target-tag">Mục tiêu: B1 ❯</span>
          </div>
          <div class="goal-main-title-row">
            <span class="goal-icon-badge" id="home-goal-icon">🎯</span>
            <div class="goal-title-content">
              <h2 class="goal-main-title" id="home-goal-title">Trình Độ A1 (Căn Bản Khởi Đầu)</h2>
            </div>
          </div>
        </div>

        <!-- Multi-Segment CEFR Roadmap Track (A1 -> A2 -> B1 -> B2 -> C1) -->
        <div class="cefr-milestone-track" id="home-cefr-track">
          <div class="cefr-step-item" data-step="A1">
            <div class="cefr-step-dot" id="dot-A1">A1</div>
            <span class="cefr-step-label">Căn bản</span>
          </div>
          <div class="cefr-step-line"><div class="cefr-step-line-fill" id="fill-A1-A2" style="width: 0%;"></div></div>
          <div class="cefr-step-item" data-step="A2">
            <div class="cefr-step-dot" id="dot-A2">A2</div>
            <span class="cefr-step-label">Sơ cấp</span>
          </div>
          <div class="cefr-step-line"><div class="cefr-step-line-fill" id="fill-A2-B1" style="width: 0%;"></div></div>
          <div class="cefr-step-item" data-step="B1">
            <div class="cefr-step-dot" id="dot-B1">B1</div>
            <span class="cefr-step-label">Trung cấp</span>
          </div>
          <div class="cefr-step-line"><div class="cefr-step-line-fill" id="fill-B1-B2" style="width: 0%;"></div></div>
          <div class="cefr-step-item" data-step="B2">
            <div class="cefr-step-dot" id="dot-B2">B2</div>
            <span class="cefr-step-label">Trung cao</span>
          </div>
          <div class="cefr-step-line"><div class="cefr-step-line-fill" id="fill-B2-C1" style="width: 0%;"></div></div>
          <div class="cefr-step-item" data-step="C1">
            <div class="cefr-step-dot" id="dot-C1">C1</div>
            <span class="cefr-step-label">Cao cấp</span>
          </div>
        </div>

        <div class="goal-progress-section">
          <div class="goal-progress-meta">
            <span class="goal-progress-label">Đã tích lũy mục tiêu: <strong id="home-goal-progress-words">0 / 3027 từ</strong></span>
            <span class="goal-percent-badge" id="home-goal-percent">0%</span>
          </div>
          <div class="goal-progress-track">
            <div class="goal-progress-fill" id="home-goal-progress-fill" style="width: 0%;"></div>
          </div>
        </div>

        <div class="goal-daily-status-row">
          <div class="goal-daily-badge" id="home-goal-daily-badge">
            <span class="goal-stat-icon">🌱</span>
            <span id="home-goal-today-wrapper">Hôm nay: <strong id="home-goal-today-new">0/10 từ</strong></span>
          </div>
          <div class="goal-eta-badge" id="home-goal-eta" role="button" tabindex="0" title="Nhấn để xem phân tích & công thức dự báo chi tiết FSRS">
            <span class="goal-stat-icon" id="home-goal-eta-icon">⚡</span>
            <span id="home-goal-eta-wrapper">Đạt B1: <strong id="home-goal-eta-text">-- ngày</strong></span>
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
            <!-- AI Behavioral Optimizer Feature Banner: Fully Autonomous Background -->
            <div class="optimizer-feature-card">
              <div class="optimizer-feature-left">
                <div class="optimizer-feature-badge">⚡ FSRS AUTONOMOUS</div>
                <div class="optimizer-feature-title">Tối ưu hóa FSRS Tự động</div>
                <div class="optimizer-feature-sub" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">
                  Tự động căn chỉnh nhịp sinh học, tốc độ phản xạ & tối ưu trọng số FSRS-6 hoàn toàn ngầm
                </div>
              </div>
              <div class="optimizer-auto-pill" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 99px; background: rgba(16, 185, 129, 0.12); color: #10b981; font-weight: 700; font-size: 0.82rem; border: 1px solid rgba(16, 185, 129, 0.25); white-space: nowrap;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981;"></span>
                <span>Tự động ngầm</span>
              </div>
            </div>

            <!-- 1-Tap Learning Profile Presets -->
            <div class="setting-row profile-presets-row">
              <div class="setting-info">
                <span class="setting-title">Gói mục tiêu học</span>
              </div>
              <div class="settings-profile-chips-grid" id="settings-profile-chips">
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

            <div class="setting-row setting-select-row">
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

            <div class="setting-row setting-select-row">
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

            <div class="setting-row setting-select-row">
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

            <div class="setting-row setting-switch-row">
              <div class="setting-info">
                <span class="setting-title">Chống dồn lịch ôn (Fuzz)</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="setting-enable-fuzz" checked>
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row setting-select-row">
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

            <div class="setting-row setting-select-row">
              <div class="setting-info">
                <span class="setting-title">Ngưỡng từ khó (Leech)</span>
              </div>
              <select id="setting-leech-threshold" class="setting-select">
                <option value="4">4 lần quên</option>
                <option value="6">6 lần quên</option>
                <option value="8" selected>8 lần quên (Chuẩn Anki mặc định)</option>
              </select>
            </div>

            <div class="setting-row setting-select-row">
              <div class="setting-info">
                <span class="setting-title">Xử lý khi gặp từ khó (Leech)</span>
              </div>
              <select id="setting-leech-action" class="setting-select">
                <option value="tag" selected>⚠️ Gắn nhãn & Nhắc nhở câu ví dụ</option>
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
              <div class="setting-row setting-switch-row">
                <div class="setting-info">
                  <span class="setting-title">Tự động phát âm</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="setting-auto-speech" checked>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-row setting-select-row">
                <div class="setting-info">
                  <span class="setting-title">Giọng phát âm ưu tiên</span>
                </div>
                <select id="setting-audio-accent" class="setting-select">
                  <option value="us">🇺🇸 Anh - Mỹ (US)</option>
                  <option value="uk">🇬🇧 Anh - Anh (UK)</option>
                  <option value="au">🇦🇺 Anh - Úc (AU)</option>
                </select>
              </div>

              <div class="setting-row setting-select-row">
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

              <div class="setting-row setting-switch-row">
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
                  <button type="button" id="btn-settings-check-update" class="btn-setting-btn btn-update-action" title="Kiểm tra bản cập nhật mới từ máy chủ">
                    <svg class="icon-update-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    <span id="text-settings-check-update">Kiểm tra cập nhật (v${APP_CONFIG.version})</span>
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

