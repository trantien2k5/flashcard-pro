/**
 * Home / Review Tab - Static DOM Shell Template
 */

export function renderReviewShell(container) {
  if (!container) return;
  if (container.querySelector(".review-minimal-container")) return;

  container.innerHTML = `
      <div class="review-minimal-container">
        <!-- 1. Cảnh báo khôi phục chuỗi ngày học bị đứt (Streak Recovery Banner) -->
        <div id="home-streak-alert-container"></div>

        <!-- 2. Thẻ 4 chỉ số: Từ tới hạn, Đã ôn hôm nay, Thời gian đã học, Từ đã thuộc -->
        <div class="home-metrics-card inset-grouped-card">
          <div class="home-metric-item" id="metric-card-due" role="button" tabindex="0" title="Nhấn để xem danh sách từ tới hạn">
            <div class="metric-icon-badge badge-due" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">TỚI HẠN</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-due-count">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
            <span class="metric-tap-hint">Danh sách ›</span>
          </div>

          <div class="metric-divider"></div>

          <div class="home-metric-item" id="metric-card-reviewed" role="button" tabindex="0" title="Nhấn để xem các thẻ đã ôn hôm nay">
            <div class="metric-icon-badge badge-reviewed" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ ÔN</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-reviewed-count">0</strong>
                <span class="metric-unit">thẻ</span>
              </div>
            </div>
            <span class="metric-tap-hint">Chi tiết ›</span>
          </div>

          <div class="metric-divider"></div>

          <div class="home-metric-item" id="metric-card-time" role="button" tabindex="0" title="Nhấn để xem tổng quan thời gian đã học hôm nay">
            <div class="metric-icon-badge badge-time" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ HỌC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-study-timer">0</strong>
                <span class="metric-unit">phút</span>
              </div>
            </div>
            <span class="metric-tap-hint">Tổng quan ›</span>
          </div>

          <div class="metric-divider"></div>

          <div class="home-metric-item" id="metric-card-mastered" role="button" tabindex="0" title="Nhấn để xem 5 cấp độ trí nhớ FSRS">
            <div class="metric-icon-badge badge-mastered" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ THUỘC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-retention-rate">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
            <span class="metric-tap-hint">5 cấp độ ›</span>
          </div>
        </div>

        <!-- 3. NÚT CTA HỌC NGAY -->
        <div class="home-cta-section home-cta-single">
          <button type="button" class="btn-hero-flashcard-cta btn-cta-primary-due btn-cta-study-now" id="btn-home-start-flashcard" title="Học ngay">
            <div class="btn-cta-body">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              <span class="btn-cta-main-text">Học ngay</span>
              <span class="btn-cta-tag tag-due" id="badge-home-due-tag">0 từ</span>
            </div>
          </button>
        </div>

        <!-- 4. THẺ THỐNG KÊ: TỪ KHÓ (QUÊN ≥ 8 LẦN) -->
        <div class="home-attention-card inset-grouped-card" id="home-attention-card" role="button" tabindex="0" title="Nhấn để xem danh sách từ khó">
          <div class="attention-card-left">
            <div class="attention-icon-badge" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <div class="attention-info">
              <div class="attention-title-row">
                <span class="attention-title">Từ Khó</span>
                <span class="attention-total-badge" id="attention-total-badge">0 từ</span>
              </div>
              <div class="attention-sub-tags">
                <span class="attention-tag tag-leech" id="attention-leech-tag">Quên ≥ 8 lần</span>
              </div>
            </div>
          </div>
          <div class="attention-card-right">
            <span class="attention-action-btn">Chi tiết &amp; Ôn ›</span>
          </div>
        </div>

        <!-- 5. BỘ CHẾ ĐỘ HỌC CÓ CHỦ ĐÍCH (Targeted Systematic Study Modes) -->
        <div class="home-study-modes-section">
          <div class="modes-section-header">
            <span class="modes-header-title">CHẾ ĐỘ HỌC CÓ CHỦ ĐÍCH</span>
          </div>
          <div class="home-modes-grid">
            <button type="button" class="home-mode-card mode-weak" id="btn-mode-weak-hunter" title="Học chuyên sâu các từ khó nhớ và có độ bền trí nhớ thấp">
              <div class="mode-icon-wrap" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Diệt từ khó</span>
                  <span class="mode-badge" id="badge-weak-count">0 từ</span>
                </div>
              </div>
            </button>

            <button type="button" class="home-mode-card mode-audio" id="btn-mode-audio-blind" title="Mặt trước ẩn chữ, chỉ nghe phát âm để nhận diện từ vựng">
              <div class="mode-icon-wrap" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Phản xạ Nghe</span>
                  <span class="mode-badge badge-audio">Mù chữ</span>
                </div>
              </div>
            </button>

            <button type="button" class="home-mode-card mode-sprint" id="btn-mode-sprint-10" title="Phiên học nhanh 10 từ cấp bách nhất">
              <div class="mode-icon-wrap" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Tốc chiến 3p</span>
                  <span class="mode-badge badge-sprint">10 từ</span>
                </div>
              </div>
            </button>

            <button type="button" class="home-mode-card mode-custom" id="btn-mode-custom-filter" title="Tự chọn bộ từ, trạng thái FSRS và cấp độ CEFR">
              <div class="mode-icon-wrap" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>
              </div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Ôn tùy chọn</span>
                  <span class="mode-badge badge-custom">Bộ lọc riêng</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
}

