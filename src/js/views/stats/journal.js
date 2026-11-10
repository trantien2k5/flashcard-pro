/**
 * Stats Journal & Calendar Heatmap Component
 * Quản lý khung giao diện DOM của Stats Tab, bảng lịch ô vuông ma trận học tập (Journal Heatmap)
 * và tooltip popover thông tin chi tiết từng ngày.
 */

let _currentYear = new Date().getFullYear();
let _currentMonth = new Date().getMonth() + 1; // 1 - 12

export function getCurrentJournalPeriod() {
  return { year: _currentYear, month: _currentMonth };
}

export function setCurrentJournalPeriod(year, month) {
  _currentYear = year;
  _currentMonth = month;
}

/**
 * Khởi tạo khung DOM tĩnh ban đầu của Stats Tab
 */
export function renderStatsTabShell(container, onNavigate = null) {
  if (!container) return;
  if (!container.querySelector('.stats-hero-banner')) {
    container.innerHTML = `
      <div class="stats-bento-container">
        <!-- 1. Top Unboxed Page Header -->
        <div class="stats-hero-banner">
          <div class="stats-hero-left">
            <div class="stats-hero-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div class="stats-hero-text">
              <h2 class="stats-hero-title">Thống Kê & Năng Lực Trí Nhớ</h2>
              <span class="stats-hero-subtitle">Phân tích khoa học chu kỳ lặp lại FSRS-6</span>
            </div>
          </div>
          <div class="stats-hero-badges">
            <span style="display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.25); color: var(--primary, #6366f1); padding: 5px 12px; border-radius: 99px; font-size: 0.78rem; font-weight: 700;">
              ⚡ FSRS Tự động cá nhân hóa
            </span>
          </div>
        </div>

        <!-- Main Responsive Layout -->
        <div class="stats-main-grid">
          <div class="stats-col-main">
            <!-- 2. KHỐI 1: NĂNG LỰC TRÍ NHỚ THẬT (FSRS-6 COGNITIVE CAPACITY) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>
                    </svg>
                    NĂNG LỰC TRÍ NHỚ THẬT
                  </span>
                </div>
              </div>

              <div class="journal-pnl-grid cognitive-quad-grid">
                <!-- Box 1: Xác suất nhớ thật lúc này -->
                <div class="pnl-stat-box cog-stat-retrievability">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">🧠</span>
                    <span class="pnl-box-label">XÁC SUẤT NHỚ THẬT</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-retrievability">0%</div>
                </div>

                <!-- Box 2: Độ bền trung bình -->
                <div class="pnl-stat-box cog-stat-stability">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">⏳</span>
                    <span class="pnl-box-label">ĐỘ BỀN TRUNG BÌNH</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-stability">0<span class="pnl-unit">ngày</span></div>
                </div>

                <!-- Box 3: Tổng thời gian học -->
                <div class="pnl-stat-box cog-stat-time">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">⏱️</span>
                    <span class="pnl-box-label">TỔNG THỜI GIAN HỌC</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-total-time">0<span class="pnl-unit">phút</span></div>
                </div>

                <!-- Box 4: Tỉ lệ phục hồi sau khi quên -->
                <div class="pnl-stat-box cog-stat-recovery">
                  <div class="pnl-box-header">
                    <span class="pnl-box-icon">🛡️</span>
                    <span class="pnl-box-label">TỈ LỆ PHỤC HỒI</span>
                  </div>
                  <div class="pnl-box-val" id="cog-stat-recovery">100%</div>
                </div>
              </div>
            </div>

            <!-- 3. KHỐI 2: DỰ BÁO LỊCH ÔN 7 NGÀY (Unboxed Dải Capsule) -->
            <div class="stats-section-group stats-group-forecast">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    DỰ BÁO LỊCH ÔN 7 NGÀY
                  </span>
                  <div class="section-header-actions">
                    <span class="bento-badge-forecast" id="stats-forecast-total">0 từ / 7 ngày</span>
                    <button type="button" class="btn-open-calendar-modal" id="btn-open-calendar-modal" title="Xem lịch chi tiết">
                      <span>Lịch tháng ↗</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="forecast-capsules-grid" id="stats-review-forecast"></div>
            </div>

            <!-- 4. KHỐI 3: BỆNH ÁN TỪ VỰNG HAY QUÊN (WEAK WORDS CLINIC) -->
            <div class="stats-section-group" id="stats-weak-words-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="m19 14-7 7-7-7"/>
                      <path d="M12 3v18"/>
                    </svg>
                    TỪ VỰNG CẦN CHÚ Ý (HAY QUÊN)
                  </span>
                  <span class="bento-badge-forecast" id="stats-weak-words-count" style="background: rgba(239, 68, 68, 0.12); color: #ef4444; border-color: rgba(239, 68, 68, 0.28);">0 từ</span>
                </div>
              </div>

              <div class="weak-words-list" id="stats-weak-words-list">
                <div class="weak-words-empty">
                  <span>🎉 Tuyệt vời! Bạn không có từ vựng nào bị quên dồn ứ.</span>
                </div>
              </div>
            </div>

            <!-- 5. KHỐI 4: LỊCH HỌC TẬP THEO NGÀY (Heatmap Ô Vuông) -->
            <div class="stats-section-group" id="journal-main-container">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    LỊCH HỌC TẬP THEO NGÀY
                  </span>
                  
                  <div class="section-header-actions">
                    <div class="journal-legend">
                      <span>Ít</span>
                      <span class="legend-cell heat-0"></span>
                      <span class="legend-cell heat-1"></span>
                      <span class="legend-cell heat-2"></span>
                      <span class="legend-cell heat-3"></span>
                      <span class="legend-cell heat-4"></span>
                      <span>Nhiều</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Calendar Wrapper (Compact Card) -->
              <div class="bento-card journal-calendar-card" id="journal-month-section">
                <!-- Navigation Header -->
                <div class="journal-month-nav-row">
                  <button type="button" class="btn-journal-nav" id="btn-journal-prev" title="Tháng trước">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  
                  <div class="journal-period-info">
                    <span class="period-title" id="journal-period-title">Tháng ${_currentMonth}, ${_currentYear}</span>
                    <button type="button" class="btn-journal-today" id="btn-journal-today">Hôm nay</button>
                  </div>

                  <button type="button" class="btn-journal-nav" id="btn-journal-next" title="Tháng sau">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>

                <!-- 7-Day Header -->
                <div class="calendar-weekdays-row">
                  <span class="weekday-cell">T2</span>
                  <span class="weekday-cell">T3</span>
                  <span class="weekday-cell">T4</span>
                  <span class="weekday-cell">T5</span>
                  <span class="weekday-cell">T6</span>
                  <span class="weekday-cell">T7</span>
                  <span class="weekday-cell sun">CN</span>
                </div>

                <!-- Calendar Grid Cells -->
                <div class="calendar-grid-cells" id="journal-calendar-grid"></div>

                <!-- Submeta summary bar -->
                <div class="journal-cal-summary-strip" id="journal-cal-summary">
                  <span id="journal-cal-summary-text">Tháng này: <strong>+0</strong> từ • <strong>0</strong> ngày học</span>
                </div>
              </div>
            </div>

            <!-- 6. KHỐI 5: THÁP 5 TẦNG TRÍ NHỚ FSRS-6 (MEMORY STABILITY PYRAMID) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polygon points="12 2 2 22 22 22"/>
                    </svg>
                    THÁP 5 TẦNG ĐỘ BỀN TRÍ NHỚ
                  </span>
                  <span class="bento-badge-forecast" id="stats-pyramid-total">0 từ đã học</span>
                </div>
              </div>

              <div class="inset-grouped-card memory-pyramid-card">
                <!-- Multi-segment visual progress bar -->
                <div class="pyramid-segment-bar" id="pyramid-segment-bar">
                  <div class="seg-fill seg-tier5" id="seg-tier5" style="width: 0%;" title="Nhớ sâu (≥ 30d)"></div>
                  <div class="seg-fill seg-tier4" id="seg-tier4" style="width: 0%;" title="Bền vững (14-30d)"></div>
                  <div class="seg-fill seg-tier3" id="seg-tier3" style="width: 0%;" title="Trung hạn (7-14d)"></div>
                  <div class="seg-fill seg-tier2" id="seg-tier2" style="width: 0%;" title="Ngắn hạn (3-7d)"></div>
                  <div class="seg-fill seg-tier1" id="seg-tier1" style="width: 0%;" title="Mới nạp (< 3d)"></div>
                </div>

                <!-- 5 Tiers Detailed Rows -->
                <div class="pyramid-tiers-list">
                  <!-- Tier 5 -->
                  <div class="pyramid-tier-row tier-5">
                    <div class="tier-left">
                      <span class="tier-icon">💎</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 5: Nhớ sâu vĩnh viễn (≥ 30 ngày)</strong>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-5">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-5">0%</span>
                    </div>
                  </div>

                  <!-- Tier 4 -->
                  <div class="pyramid-tier-row tier-4">
                    <div class="tier-left">
                      <span class="tier-icon">🛡️</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 4: Ghi nhớ bền vững (14 - 30 ngày)</strong>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-4">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-4">0%</span>
                    </div>
                  </div>

                  <!-- Tier 3 -->
                  <div class="pyramid-tier-row tier-3">
                    <div class="tier-left">
                      <span class="tier-icon">🌳</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 3: Ghi nhớ trung hạn (7 - 14 ngày)</strong>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-3">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-3">0%</span>
                    </div>
                  </div>

                  <!-- Tier 2 -->
                  <div class="pyramid-tier-row tier-2">
                    <div class="tier-left">
                      <span class="tier-icon">🌿</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 2: Trí nhớ ngắn hạn (3 - 7 ngày)</strong>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-2">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-2">0%</span>
                    </div>
                  </div>

                  <!-- Tier 1 -->
                  <div class="pyramid-tier-row tier-1">
                    <div class="tier-left">
                      <span class="tier-icon">🌱</span>
                      <div class="tier-meta">
                        <strong class="tier-name">Tầng 1: Mới nạp vào não (< 3 ngày)</strong>
                      </div>
                    </div>
                    <div class="tier-right">
                      <strong class="tier-count" id="tier-cnt-1">0 từ</strong>
                      <span class="tier-pct" id="tier-pct-1">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 7. KHỐI 6: PHÂN BỐ PHẢN XẠ ĐÁNH GIÁ (RECALL REFLEX BREAKDOWN) -->
            <div class="stats-section-group">
              <div class="stats-section-header">
                <div class="stats-section-top-row">
                  <span class="stats-section-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    PHÂN BỐ ĐÁNH GIÁ PHẢN XẠ
                  </span>
                  <span class="bento-badge-forecast" id="stats-total-reviews-badge">0 lượt ôn</span>
                </div>
              </div>

              <div class="inset-grouped-card reflex-quality-card">
                <div class="reflex-quad-grid">
                  <div class="reflex-pill-item reflex-easy">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">⚡</span>
                      <span class="reflex-pill-name">DỄ</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-easy">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-easy">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-good">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">✨</span>
                      <span class="reflex-pill-name">TỐT</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-good">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-good">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-hard">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">⏳</span>
                      <span class="reflex-pill-name">KHÓ</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-hard">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-hard">0%</span>
                  </div>

                  <div class="reflex-pill-item reflex-again">
                    <div class="reflex-pill-top">
                      <span class="reflex-pill-icon">❌</span>
                      <span class="reflex-pill-name">QUÊN</span>
                    </div>
                    <strong class="reflex-pill-val" id="reflex-cnt-again">0</strong>
                    <span class="reflex-pill-pct" id="reflex-pct-again">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Day Popover Tooltip Container -->
      <div id="day-popover-tooltip" class="day-popover-tooltip" style="display: none;"></div>
    `;

    setupJournalEvents(container, onNavigate);
  }
}

/**
 * Gắn sự kiện điều hướng tháng trên Journal Heatmap
 */
export function setupJournalEvents(container, onNavigate = null) {
  const btnPrev = container.querySelector('#btn-journal-prev');
  const btnNext = container.querySelector('#btn-journal-next');
  const btnToday = container.querySelector('#btn-journal-today');

  if (btnPrev) {
    btnPrev.onclick = () => {
      hideDayPopover();
      _currentMonth--;
      if (_currentMonth < 1) {
        _currentMonth = 12;
        _currentYear--;
      }
      if (typeof onNavigate === 'function') onNavigate(_currentYear, _currentMonth);
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      hideDayPopover();
      _currentMonth++;
      if (_currentMonth > 12) {
        _currentMonth = 1;
        _currentYear++;
      }
      if (typeof onNavigate === 'function') onNavigate(_currentYear, _currentMonth);
    };
  }

  if (btnToday) {
    btnToday.onclick = () => {
      hideDayPopover();
      const now = new Date();
      _currentYear = now.getFullYear();
      _currentMonth = now.getMonth() + 1;
      if (typeof onNavigate === 'function') onNavigate(_currentYear, _currentMonth);
    };
  }

  // Dismiss popover on global click/touch outside
  if (!container._popoverBound) {
    container._popoverBound = true;
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.calendar-day-cell') && !e.target.closest('.day-popover-tooltip')) {
        hideDayPopover();
      }
    });
    window.addEventListener('scroll', () => hideDayPopover(), { passive: true });
  }
}

/**
 * Hiển thị Tooltip Popover thông tin học tập của một ngày khi rê chuột / click
 */
export function showDayPopover(cell, dayObj) {
  const tooltip = document.getElementById('day-popover-tooltip');
  if (!tooltip || !cell || !dayObj) return;

  const parts = dayObj.dateKey.split('-');
  const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
  const dateTitle = dayObj.isToday ? `Hôm nay (${formatted})` : `Ngày ${formatted}`;

  let totalBadge = dayObj.count > 0 ? '+' + dayObj.count + ' từ' : '0 từ';
  if (dayObj.isFrozen) totalBadge = '❄️ Khiên đóng băng';
  else if (dayObj.isRecovered) totalBadge = '🛡️ Đã chuộc lỗi';

  tooltip.innerHTML = `
    <div class="popover-header">
      <span class="popover-date">📅 ${dateTitle}</span>
      <span class="popover-badge-total">${totalBadge}</span>
    </div>
    <div class="popover-body">
      <div class="popover-item">
        <span>📚 Từ đã học:</span>
        <strong>+${dayObj.count} từ</strong>
      </div>
      <div class="popover-item">
        <span>💎 Từ đã thuộc:</span>
        <strong>${dayObj.masteredCount || 0} từ</strong>
      </div>
      <div class="popover-item">
        <span>⏱️ Thời gian:</span>
        <strong>${dayObj.minutes} phút</strong>
      </div>
    </div>
  `;

  tooltip.style.display = 'flex';

  const rect = cell.getBoundingClientRect();
  const popWidth = tooltip.offsetWidth || 230;
  const popHeight = tooltip.offsetHeight || 120;

  let left = rect.left + (rect.width / 2) - (popWidth / 2);
  if (left < 10) left = 10;
  if (left + popWidth > window.innerWidth - 10) left = window.innerWidth - popWidth - 10;

  let top = rect.top - popHeight - 8;
  if (top < 10) {
    top = rect.bottom + 8;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  requestAnimationFrame(() => {
    tooltip.classList.add('active');
  });
}

/**
 * Ẩn Tooltip Popover
 */
export function hideDayPopover() {
  const tooltip = document.getElementById('day-popover-tooltip');
  if (tooltip) {
    tooltip.classList.remove('active');
    setTimeout(() => {
      if (!tooltip.classList.contains('active')) {
        tooltip.style.display = 'none';
      }
    }, 180);
  }
}
