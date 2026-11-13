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
            <div class="metric-icon-badge badge-due">⚡</div>
            <div class="metric-info">
              <span class="metric-label">TỚI HẠN</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-due-count">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
            <span class="metric-tap-hint">Danh sách ❯</span>
          </div>

          <div class="metric-divider"></div>

          <div class="home-metric-item" id="metric-card-reviewed" role="button" tabindex="0" title="Nhấn để xem các thẻ đã ôn hôm nay">
            <div class="metric-icon-badge badge-reviewed">✅</div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ ÔN H.NAY</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-reviewed-count">0</strong>
                <span class="metric-unit">thẻ</span>
              </div>
            </div>
            <span class="metric-tap-hint">Chi tiết ❯</span>
          </div>

          <div class="metric-divider"></div>

          <div class="home-metric-item" id="metric-card-time" role="button" tabindex="0" title="Nhấn để xem tổng quan thời gian đã học hôm nay">
            <div class="metric-icon-badge badge-time">⏱️</div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ HỌC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-study-timer">0</strong>
                <span class="metric-unit">phút</span>
              </div>
            </div>
            <span class="metric-tap-hint">Tổng quan ❯</span>
          </div>

          <div class="metric-divider"></div>

          <div class="home-metric-item" id="metric-card-mastered" role="button" tabindex="0" title="Nhấn để xem 5 cấp độ trí nhớ FSRS">
            <div class="metric-icon-badge badge-mastered">💎</div>
            <div class="metric-info">
              <span class="metric-label">ĐÃ THUỘC</span>
              <div class="metric-val-row">
                <strong class="metric-val" id="home-retention-rate">0</strong>
                <span class="metric-unit">từ</span>
              </div>
            </div>
            <span class="metric-tap-hint">5 cấp độ ❯</span>
          </div>
        </div>

        <!-- 2b. THẺ THỐNG KÊ: TỪ KHÓ (QUÊN ≥ 8 LẦN) -->
        <div class="home-attention-card inset-grouped-card" id="home-attention-card" role="button" tabindex="0" title="Nhấn để xem danh sách từ khó">
          <div class="attention-card-left">
            <div class="attention-icon-badge">🎯</div>
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
            <span class="attention-action-btn">Chi tiết & Ôn ❯</span>
          </div>
        </div>

        <!-- 3. NÚT CTA HỌC NGAY DUY NHẤT -->
        <div class="home-cta-section home-cta-single">
          <button type="button" class="btn-hero-flashcard-cta btn-cta-primary-due btn-cta-study-now" id="btn-home-start-flashcard" title="Học ngay">
            <div class="btn-cta-glare"></div>
            <div class="btn-cta-body">
              <span class="btn-cta-main-text">Học ngay</span>
            </div>
          </button>
        </div>

        <!-- 3c. NÚT ÔN TẬP TÙY CHỌN (CUSTOM FILTERED STUDY) -->
        <div class="home-custom-study-row">
          <button type="button" class="btn-custom-study-bar" id="btn-home-custom-study" title="Ôn tập tùy chọn theo chủ đề, cấp độ & trạng thái FSRS">
            <div class="custom-study-bar-left">
              <div class="custom-study-bar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
                </svg>
              </div>
              <div class="custom-study-bar-text">
                <div class="custom-study-bar-title-wrap">
                  <span class="custom-study-bar-title">Ôn tập Tùy chọn</span>
                  <span class="custom-study-bar-badge">Bộ lọc riêng</span>
                </div>
              </div>
            </div>
            <div class="custom-study-bar-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>
        </div>

        <!-- 4. BỘ CHẾ ĐỘ HỌC CÓ CHỦ ĐÍCH (Targeted Systematic Study Modes) -->
        <div class="home-study-modes-section">
          <div class="modes-section-header">
            <span class="modes-header-title">CHẾ ĐỘ HỌC CÓ CHỦ ĐÍCH</span>
          </div>
          <div class="home-modes-grid">
            <button type="button" class="home-mode-card mode-weak" id="btn-mode-weak-hunter" title="Học chuyên sâu các từ khó nhớ và có độ bền trí nhớ thấp">
              <div class="mode-icon-wrap">🔥</div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Diệt từ khó</span>
                  <span class="mode-badge" id="badge-weak-count">0 từ</span>
                </div>
              </div>
            </button>

            <button type="button" class="home-mode-card mode-audio" id="btn-mode-audio-blind" title="Mặt trước ẩn chữ, chỉ nghe phát âm để nhận diện từ vựng">
              <div class="mode-icon-wrap">🎧</div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Phản xạ Nghe</span>
                  <span class="mode-badge badge-audio">Mù chữ</span>
                </div>
              </div>
            </button>

            <button type="button" class="home-mode-card mode-sprint" id="btn-mode-sprint-10" title="Phiên học nhanh 10 từ cấp bách nhất">
              <div class="mode-icon-wrap">⚡</div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Tốc chiến 3p</span>
                  <span class="mode-badge badge-sprint">10 từ</span>
                </div>
              </div>
            </button>

            <button type="button" class="home-mode-card mode-custom" id="btn-mode-custom-filter" title="Tự chọn bộ từ, trạng thái FSRS và cấp độ CEFR">
              <div class="mode-icon-wrap">🎛️</div>
              <div class="mode-info">
                <div class="mode-title-row">
                  <span class="mode-name">Ôn tùy chọn</span>
                  <span class="mode-badge badge-custom">Tự chọn</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
}

