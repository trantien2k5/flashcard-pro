/**
 * Review View - World-Class Bento Grid Dashboard Architecture
 */

import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { StatsManager } from '../core/stats.js';
import { getLocalDateKey, escapeHTML } from '../utils.js';
import { showToast } from './components.js';
import { speak } from '../services/audio.js';

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-bento-container')) {
    container.innerHTML = `
      <div class="review-bento-container">
        
        <!-- 1. Top Unboxed Hero Header -->
        <div class="review-hero-banner">
          <div class="review-hero-left">
            <div class="review-hero-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div class="review-hero-text">
              <h2 class="review-hero-title">Nhiệm Vụ Hôm Nay</h2>
              <p class="review-hero-subtitle" id="home-today-status">Kế hoạch ôn tập & tích lũy từ vựng</p>
            </div>
          </div>
          <div class="review-hero-badges">
            <span class="pill-today-pct" id="home-goal-pct">0%</span>
          </div>
        </div>

        <!-- 2. Bento Hero Card: Tiến Độ Mục Tiêu & 4 Khối Chỉ Số -->
        <div class="bento-section-group">
          <div class="bento-card bento-hero-card">
            <!-- Thanh tiến độ mục tiêu ngày -->
            <div class="hero-bar-track" title="Tiến độ mục tiêu hôm nay">
              <div class="hero-bar-fill" id="home-goal-bar-fill" style="width: 0%;"></div>
            </div>

            <!-- 4 Khối chỉ số 2 Cột (2x2 Quad Grid) - Không trùng lặp -->
            <div class="hero-quad-grid">
              <!-- Card 1: Cần ôn ngay -->
              <div class="quad-tile tile-due" id="box-home-due">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">⏰</span>
                  <span class="quad-label">CẦN ÔN TẬP</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-due-val">0</span>
                  <span class="quad-unit">từ</span>
                </div>
                <span class="quad-sub-hint">Ưu tiên ôn trước</span>
              </div>

              <!-- Card 2: Đã học hôm nay -->
              <div class="quad-tile tile-new" id="box-home-new">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">✨</span>
                  <span class="quad-label">ĐÃ HỌC HÔM NAY</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-new-today-val">0/10</span>
                  <span class="quad-unit">từ</span>
                </div>
                <span class="quad-sub-hint" id="home-goal-hint">Mục tiêu: 10 từ</span>
              </div>

              <!-- Card 3: Thời gian học -->
              <div class="quad-tile tile-time" id="box-home-time">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">⏱️</span>
                  <span class="quad-label">THỜI GIAN HỌC</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-study-timer">0p</span>
                </div>
                <span class="quad-sub-hint">Tập trung hôm nay</span>
              </div>

              <!-- Card 4: Tỉ lệ ghi nhớ -->
              <div class="quad-tile tile-retention" id="box-home-retention">
                <div class="quad-tile-top">
                  <span class="quad-icon-badge">🎯</span>
                  <span class="quad-label">TỈ LỆ GHI NHỚ</span>
                </div>
                <div class="quad-num-wrap">
                  <span class="quad-number" id="home-retention-rate">100%</span>
                </div>
                <span class="quad-sub-hint">Độ bền trí nhớ</span>
              </div>
            </div>

            <!-- Nút Hành Động Chính (Hero CTA) -->
            <button class="btn-hero-action" id="btn-home-hero-cta">
              <svg class="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span id="home-hero-cta-text">Ôn 0 từ ngay</span>
            </button>

            <!-- Dòng thông tin ước tính & chuỗi -->
            <div class="hero-meta-hint">
              <span id="home-estimated-time">⏱️ Khoảng 0 phút</span>
              <span class="hint-sep">•</span>
              <span id="home-streak-hint">Học hôm nay để giữ chuỗi 🔥</span>
            </div>
          </div>
        </div>

        <!-- 3. Lịch Ôn Tập 7 Ngày (Section Header ngoài trần + Inset Card) -->
        <div class="bento-section-group">
          <div class="section-group-header">
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:8px;">
              <span class="section-group-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                LỊCH ÔN TẬP 7 NGÀY TỚI
              </span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="bento-badge-forecast" id="home-forecast-total">0 từ / 7 ngày</span>
                <button type="button" class="btn-open-calendar-modal" id="btn-open-calendar-modal" title="Xem lịch tháng chi tiết" aria-label="Mở lịch tháng">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Lịch tháng ↗</span>
                </button>
              </div>
            </div>
            <span class="section-group-hint">Số lượng thẻ đến hạn ôn theo từng ngày (Chạm để xem chi tiết)</span>
          </div>
          <div class="bento-card bento-forecast-card">
            <div class="forecast-capsules-grid" id="home-review-forecast"></div>
          </div>
        </div>

        <!-- 4. Bento Trend Card: Biểu Đồ Tiến Bộ 7 Ngày -->
        <div class="bento-section-group">
          <div class="section-group-header">
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
              <span class="section-group-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
                TIẾN BỘ 7 NGÀY QUA
              </span>
              <span class="trend-delta-pill" id="home-trend-delta">↑ 0 từ nhớ tốt</span>
            </div>
            <span class="section-group-hint">Số từ vựng ôn tập và ghi nhớ thành công</span>
          </div>

          <div class="bento-card bento-trend-card">
            <!-- Dynamic SVG Area Sparkline Chart -->
            <div class="trend-chart-wrapper" id="home-trend-chart-box"></div>

            <!-- Sub Row: Thống kê nhịp độ tinh gọn -->
            <div class="trend-sub-row">
              <div class="trend-stat-meta">
                <span class="meta-item">⚡ Trung bình: <strong id="trend-avg-val">0</strong> từ/ngày</span>
                <span class="meta-sep">•</span>
                <span class="meta-item">Tổng cộng: <strong id="trend-total-val">0</strong> từ</span>
              </div>
            </div>
          </div>
        </div>
        </div>

      </div>
    `;
  }
}

export function renderReviewTab(app) {
  try {
    const container = document.getElementById('tab-review') || document.getElementById('tab-home');
    if (!container) return;
    renderReviewShell(container);

    const allCards = app.deckManager.getAllCards();
    const cardStates = StorageManager.getAllCardStates();
    const now = new Date();
    const totalCards = allCards.length;

    // 1. Phân loại từ vựng & 3 Cấp độ thành tựu FSRS
    let masteredCount = 0; // S >= 14d
    let learningCount = 0; // 3d <= S < 14d
    let newCount = 0;      // Chưa học
    let learnedCount = 0;
    let goodMemoryCount = 0;
    let dueCount = 0;

    for (const card of allCards) {
      const state = StorageManager.getCardState(card.id);
      if (!state || state.state === State.New || state.state === 0) {
        newCount++;
      } else {
        learnedCount++;
        if (isCardDue(state, now)) {
          dueCount++;
        }
        const s = state.stability || 0;
        if (s >= 14) {
          masteredCount++;
          goodMemoryCount++;
        } else if (s >= 3) {
          learningCount++;
          goodMemoryCount++;
        } else {
          learningCount++;
        }
      }
    }

    const retentionRate = learnedCount > 0 ? Math.round((goodMemoryCount / learnedCount) * 100) : 100;

    // Cập nhật Timer & Retention Rate trong 4 Card (Không lặp lại emoji)
    const elTimer = document.getElementById('home-study-timer');
    if (elTimer) {
      const todaySecs = StorageManager.getTodayStudySeconds();
      if (todaySecs < 60) {
        elTimer.textContent = todaySecs > 0 ? `${todaySecs}s` : `0p`;
      } else {
        elTimer.textContent = `${Math.round(todaySecs / 60)}p`;
      }
    }

    const elRetention = document.getElementById('home-retention-rate');
    if (elRetention) {
      elRetention.textContent = `${retentionRate}%`;
    }

    // Cập nhật 3 Mini Badges
    const elMMastered = document.getElementById('m-count-mastered');
    if (elMMastered) elMMastered.textContent = masteredCount.toLocaleString('vi-VN');

    const elMLearning = document.getElementById('m-count-learning');
    if (elMLearning) elMLearning.textContent = learningCount.toLocaleString('vi-VN');

    const elMNew = document.getElementById('m-count-new');
    if (elMNew) elMNew.textContent = newCount.toLocaleString('vi-VN');

    // 2. Mục tiêu hôm nay & Nhật ký học
    const dailyGoal = app.settings.dailyNewLimit || 10;
    const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
    const queueDue = studyQueue.totalDue !== undefined ? studyQueue.totalDue : dueCount;

    const todayLogs = StorageManager.getStudyLogs().filter(l => 
      l.timestamp && getLocalDateKey(l.timestamp) === getLocalDateKey()
    );
    const todayLearned = todayLogs.length;
    const remainingGoal = Math.max(0, dailyGoal - todayLearned);
    const goalPct = Math.min(100, Math.round((todayLearned / dailyGoal) * 100));

    // A. Trạng thái hôm nay
    const elTodayStatus = document.getElementById('home-today-status');
    if (elTodayStatus) {
      if (queueDue > 0) {
        elTodayStatus.textContent = `Có ${queueDue} từ cần ôn tập hôm nay`;
      } else if (todayLearned >= dailyGoal) {
        elTodayStatus.textContent = 'Đã hoàn thành mục tiêu hôm nay ✓';
      } else {
        elTodayStatus.textContent = `Còn ${remainingGoal} từ để đạt mục tiêu hôm nay`;
      }
    }

    // B. Chuỗi ngày học
    const streak = StatsManager.calculateStreak(StorageManager.getStudyLogs());
    const elHeaderStreak = document.getElementById('home-header-streak');
    if (elHeaderStreak) {
      elHeaderStreak.textContent = `🔥 ${streak} ngày`;
    }

    const elStreakHint = document.getElementById('home-streak-hint');
    if (elStreakHint) {
      if (todayLearned > 0) {
        elStreakHint.textContent = `Đã giữ chuỗi ${streak} ngày hôm nay! 🌟`;
      } else {
        elStreakHint.textContent = `Học hôm nay để giữ chuỗi ${streak} ngày 🔥`;
      }
    }

    // C. Tiến độ mục tiêu ngày
    const elGoalRatio = document.getElementById('home-goal-ratio');
    if (elGoalRatio) elGoalRatio.textContent = `${todayLearned} / ${dailyGoal}`;

    const elGoalPct = document.getElementById('home-goal-pct');
    if (elGoalPct) elGoalPct.textContent = `${goalPct}%`;

    const elGoalBar = document.getElementById('home-goal-bar-fill');
    if (elGoalBar) elGoalBar.style.width = `${goalPct}%`;

    // D. Từ cần ôn ngay & Đã học hôm nay
    const elDueVal = document.getElementById('home-due-val');
    if (elDueVal) elDueVal.textContent = queueDue;

    const elNewVal = document.getElementById('home-new-today-val');
    if (elNewVal) elNewVal.textContent = `${todayLearned}/${dailyGoal}`;

    const elGoalHint = document.getElementById('home-goal-hint');
    if (elGoalHint) {
      if (todayLearned >= dailyGoal) {
        elGoalHint.textContent = `Đạt mục tiêu ngày ✓`;
      } else {
        elGoalHint.textContent = `Còn ${remainingGoal} từ nữa`;
      }
    }

    // E. CTA Nổi Bật: Ưu tiên ôn từ đến hạn; nếu hết từ cần ôn -> chuyển sang tab Chủ đề để học từ mới
    const btnHeroCta = document.getElementById('btn-home-hero-cta');
    const elCtaText = document.getElementById('home-hero-cta-text');
    const elEstTime = document.getElementById('home-estimated-time');

    if (btnHeroCta) {
      if (queueDue > 0) {
        // Ưu tiên 1: Có từ đến hạn -> Ôn ngay
        if (elCtaText) elCtaText.textContent = `Ôn ${queueDue} từ ngay`;
        const estMin = Math.max(1, Math.ceil(queueDue * 0.5));
        if (elEstTime) elEstTime.textContent = `⏱️ Khoảng ${estMin} phút`;
        btnHeroCta.className = 'btn-hero-action cta-priority-due';

        btnHeroCta.onclick = () => {
          try {
            app.startStudySession(null, null, null, { mode: 'due_only' });
          } catch (err) {
            console.error('Lỗi phiên ôn tập:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      } else if (todayLearned < dailyGoal) {
        // Ưu tiên 2: Hết từ cần ôn, chưa đủ mục tiêu ngày -> Điều hướng sang tab Chủ đề để chọn bài học từ mới
        if (elCtaText) elCtaText.textContent = `📚 Chọn chủ đề học từ mới`;
        if (elEstTime) elEstTime.textContent = `💡 Không có từ cần ôn • Còn ${remainingGoal} từ mục tiêu`;
        btnHeroCta.className = 'btn-hero-action cta-priority-learn';

        btnHeroCta.onclick = () => {
          try {
            app.switchTab('tab-decks');
          } catch (err) {
            console.error('Lỗi chuyển tab chủ đề:', err);
          }
        };
      } else {
        // Ưu tiên 3: Đã hoàn thành mục tiêu ngày và không có từ cần ôn -> Điều hướng sang tab Chủ đề
        if (elCtaText) elCtaText.textContent = `✨ Khám phá thêm chủ đề mới`;
        if (elEstTime) elEstTime.textContent = `🎉 Đã hoàn thành mục tiêu ngày!`;
        btnHeroCta.className = 'btn-hero-action cta-priority-extra';

        btnHeroCta.onclick = () => {
          try {
            app.switchTab('tab-decks');
          } catch (err) {
            console.error('Lỗi chuyển tab chủ đề:', err);
          }
        };
      }
    }

    // F. Lịch Ôn Tập 7 Ngày Tới
    const forecastContainer = document.getElementById('home-review-forecast');
    const forecastTotalBadge = document.getElementById('home-forecast-total');

    if (forecastContainer) {
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfTodayMs = today.getTime();
      const oneDayMs = 86400000;
      const sevenDaysMs = 7 * oneDayMs;

      const forecastCounts = [0, 0, 0, 0, 0, 0, 0];

      for (const card of allCards) {
        const state = StorageManager.getCardState(card.id);
        if (state && state.due && state.state !== State.New && state.state !== 0) {
          const dueMs = new Date(state.due).getTime();
          const diffMs = dueMs - startOfTodayMs;
          if (diffMs < 0) {
            forecastCounts[0]++;
          } else if (diffMs < sevenDaysMs) {
            const dayIndex = Math.floor(diffMs / oneDayMs);
            if (dayIndex >= 0 && dayIndex < 7) {
              forecastCounts[dayIndex]++;
            }
          }
        }
      }

      let totalWeekDue = 0;
      const maxForecast = Math.max(...forecastCounts, 8);
      forecastContainer.innerHTML = '';

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const count = forecastCounts[i];
        totalWeekDue += count;

        const dayName = dayNames[d.getDay()];
        const label = i === 0 ? 'H.nay' : (i === 1 ? 'Mai' : dayName);
        const barHeightPct = count > 0 ? Math.min(100, Math.max(25, Math.round((count / maxForecast) * 100))) : 8;

        const itemEl = document.createElement('div');
        itemEl.className = `forecast-capsule ${i === 0 ? 'is-today' : ''} ${count > 0 ? 'has-due' : 'is-empty'}`;
        itemEl.title = `${label} (Ngày ${d.getDate()}/${d.getMonth() + 1}): ${count} từ cần ôn. Chạm để mở lịch tháng!`;
        itemEl.style.cursor = 'pointer';

        itemEl.innerHTML = `
          <div class="capsule-top-row">
            <span class="capsule-day">${label}</span>
            <span class="capsule-date-sub">${d.getDate()}</span>
          </div>
          <div class="capsule-bar-track">
            <div class="capsule-bar-fill ${count > 0 ? 'fill-active' : ''}" style="height: ${barHeightPct}%;"></div>
          </div>
          <span class="capsule-count ${count > 0 ? 'has-count' : ''}">${count}</span>
        `;

        itemEl.onclick = () => {
          openCalendarForecastModal(app, d);
        };

        forecastContainer.appendChild(itemEl);
      }

      if (forecastTotalBadge) {
        forecastTotalBadge.textContent = `${totalWeekDue} từ / 7 ngày`;
      }

      const btnOpenCal = document.getElementById('btn-open-calendar-modal');
      if (btnOpenCal) {
        btnOpenCal.onclick = () => {
          openCalendarForecastModal(app, new Date());
        };
      }
    }


    // H. Biểu Đồ Tiến Bộ 7 Ngày Qua (Sparkline Area Chart)
    const elTrendDelta = document.getElementById('home-trend-delta');
    const chartBox = document.getElementById('home-trend-chart-box');
    const elAvgVal = document.getElementById('trend-avg-val');
    const elTotalVal = document.getElementById('trend-total-val');

    const studyLogs = StorageManager.getStudyLogs();
    const weeklyData = StatsManager.getWeeklyProgress(studyLogs);

    let weekTotalCount = 0;
    const counts = weeklyData.map(d => {
      weekTotalCount += d.count;
      return d.count;
    });
    const avgCount = Math.round(weekTotalCount / 7);

    if (elAvgVal) elAvgVal.textContent = avgCount;
    if (elTotalVal) elTotalVal.textContent = weekTotalCount;

    if (elTrendDelta) {
      if (goodMemoryCount > 0) {
        elTrendDelta.textContent = `↑ ${goodMemoryCount} từ nhớ tốt`;
      } else if (weekTotalCount > 0) {
        elTrendDelta.textContent = `+${weekTotalCount} từ / 7 ngày`;
      } else {
        elTrendDelta.textContent = `+${todayLearned} từ hôm nay`;
      }
    }

    if (chartBox) {
      const w = 320;
      const h = 48;
      const padX = 14;
      const padY = 8;
      const maxVal = Math.max(...counts, 5);

      const points = weeklyData.map((d, i) => {
        const x = padX + (i / 6) * (w - 2 * padX);
        const y = h - padY - (d.count / maxVal) * (h - 2 * padY);
        return { x, y, count: d.count, dayName: d.dayName, isToday: d.isToday };
      });

      let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpx1 = (p0.x + (p1.x - p0.x) / 2).toFixed(1);
        const cpy1 = p0.y.toFixed(1);
        const cpx2 = cpx1;
        const cpy2 = p1.y.toFixed(1);
        pathD += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      }

      const areaD = `${pathD} L ${points[6].x.toFixed(1)} ${h} L ${points[0].x.toFixed(1)} ${h} Z`;

      const dotsSvg = points.map((p) => `
        <g class="chart-point-group" title="${p.dayName}: ${p.count} từ">
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.isToday ? '3.8' : '2.8'}" class="chart-dot ${p.isToday ? 'dot-today' : ''} ${p.count > 0 ? 'dot-active' : ''}"/>
          ${p.count > 0 ? `<text x="${p.x.toFixed(1)}" y="${Math.max(7, p.y - 5).toFixed(1)}" class="chart-val-txt" text-anchor="middle">${p.count}</text>` : ''}
        </g>
      `).join('');

      const axisSvg = points.map(p => `
        <span class="chart-axis-label ${p.isToday ? 'is-today' : ''}">${p.dayName}</span>
      `).join('');

      chartBox.innerHTML = `
        <div class="trend-svg-container">
          <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="trend-spark-svg">
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.30"/>
                <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <path d="${areaD}" fill="url(#trendGrad)"/>
            <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="trend-spark-line"/>
            ${dotsSvg}
          </svg>
        </div>
        <div class="trend-axis-row">
          ${axisSvg}
        </div>
      `;
    }

    // I. Thanh Lối Tắt Chủ Đề Gần Đây (Quick Deck Resume)
    const allDecks = app.deckManager.getAllDecks();
    let recentDeck = null;
    let maxStudyTime = 0;

    for (const deck of allDecks) {
      const dStats = app.deckManager.getDeckStats(deck.id);
      if (dStats && dStats.lastStudiedTime && dStats.lastStudiedTime > maxStudyTime) {
        maxStudyTime = dStats.lastStudiedTime;
        recentDeck = deck;
      }
    }

    if (!recentDeck && allDecks.length > 0) {
      const top1000 = allDecks.find(d => d.id === 'top-1000-core-words');
      recentDeck = top1000 || allDecks[0];
    }

    const elDeckName = document.getElementById('home-recent-deck-name');
    if (elDeckName && recentDeck) {
      elDeckName.textContent = recentDeck.name || recentDeck.title || 'Top 1000 từ cốt lõi';
    }

    const btnResumeDeck = document.getElementById('btn-home-resume-deck');
    if (btnResumeDeck && recentDeck) {
      btnResumeDeck.onclick = () => {
        try {
          if (typeof app.openSubtopicsPage === 'function') {
            app.openSubtopicsPage(recentDeck.id);
          } else {
            app.startStudySession(recentDeck.id, null);
          }
        } catch (err) {
          console.error('Lỗi mở chủ đề:', err);
        }
      };
    }

  } catch (err) {
    console.error('Lỗi khi render Review Tab:', err);
  }
}

let _calSelectedDate = new Date();
let _calViewingYear = _calSelectedDate.getFullYear();
let _calViewingMonth = _calSelectedDate.getMonth();

/**
 * Mở Modal Lịch Tháng Dự Báo Ôn Tập FSRS-6 Toàn Diện
 */
export function openCalendarForecastModal(app, targetDate = new Date()) {
  let modal = document.getElementById('calendar-forecast-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'calendar-forecast-modal';
    modal.className = 'calendar-forecast-modal-overlay';
    document.body.appendChild(modal);
  }

  _calSelectedDate = targetDate instanceof Date ? targetDate : new Date(targetDate);
  _calViewingYear = _calSelectedDate.getFullYear();
  _calViewingMonth = _calSelectedDate.getMonth();

  const renderModalContent = () => {
    const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
    
    // Thu thập danh sách thẻ đến hạn cho từng ngày
    // key: "YYYY-MM-DD" -> Array of { card, state }
    const monthDueMap = new Map();
    const todayObj = new Date();
    const todayKey = getLocalDateKey(todayObj);

    for (const card of allCards) {
      const state = StorageManager.getCardState(card.id);
      if (state && state.state !== State.New && state.state !== 0 && state.due) {
        const dueDate = new Date(state.due);
        if (!isNaN(dueDate.getTime())) {
          let cardDueKey = '';
          if (state.scheduled_days >= 1) {
            cardDueKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
          } else {
            // Intraday step (< 1 ngày)
            cardDueKey = todayKey;
          }

          // Thẻ quá hạn từ các ngày trước được gom vào hôm nay
          if (cardDueKey < todayKey && isCardDue(state, todayObj)) {
            cardDueKey = todayKey;
          }

          if (!monthDueMap.has(cardDueKey)) {
            monthDueMap.set(cardDueKey, []);
          }
          monthDueMap.get(cardDueKey).push({ card, state });
        }
      }
    }

    // Tính toán thống kê tháng
    let monthTotalDue = 0;
    let daysWithReviews = 0;
    let maxDueInSingleDay = 0;

    const daysInMonth = new Date(_calViewingYear, _calViewingMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = (monthDueMap.get(dateKey) || []).length;
      if (count > 0) {
        monthTotalDue += count;
        daysWithReviews++;
        if (count > maxDueInSingleDay) maxDueInSingleDay = count;
      }
    }

    // Tính offset các ngày đầu tuần (Thứ 2 đến Chủ nhật)
    const firstDayIndex = new Date(_calViewingYear, _calViewingMonth, 1).getDay(); // 0 = CN, 1 = T2 ...
    const startDayOffset = (firstDayIndex + 6) % 7; // 0 = T2, 6 = CN
    const prevMonthDays = new Date(_calViewingYear, _calViewingMonth, 0).getDate();

    const selectedDateKey = `${_calSelectedDate.getFullYear()}-${String(_calSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(_calSelectedDate.getDate()).padStart(2, '0')}`;

    // Render Khung Modal
    modal.innerHTML = `
      <div class="calendar-forecast-dialog" role="dialog" aria-modal="true" aria-labelledby="cal-modal-title">
        <!-- 1. Modal Header -->
        <div class="cal-modal-header">
          <div class="cal-header-title-group">
            <span class="cal-icon-badge">📅</span>
            <div>
              <h3 class="cal-modal-title" id="cal-modal-title">Lịch Ôn Tập Chi Tiết</h3>
              <p class="cal-modal-subtitle">Thống kê & Dự báo phân bổ trí nhớ FSRS-6</p>
            </div>
          </div>
          <button class="btn-cal-close" id="btn-close-cal-modal" title="Đóng (Esc)" aria-label="Đóng">✕</button>
        </div>

        <!-- 2. Month Navigation Toolbar -->
        <div class="cal-month-nav-bar">
          <div class="cal-nav-controls">
            <button class="btn-cal-arrow" id="btn-cal-prev-month" title="Tháng trước">◀</button>
            <span class="cal-current-month-text">Tháng ${_calViewingMonth + 1}, ${_calViewingYear}</span>
            <button class="btn-cal-arrow" id="btn-cal-next-month" title="Tháng sau">▶</button>
          </div>
          <button class="btn-cal-today-jump" id="btn-cal-today-jump">Về hôm nay</button>
        </div>

        <!-- 3. Monthly Summary Meta Bar -->
        <div class="cal-summary-strip">
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Tổng lượt ôn:</span>
            <strong class="cal-sum-val">${monthTotalDue} từ</strong>
          </div>
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Ngày có bài:</span>
            <strong class="cal-sum-val">${daysWithReviews} / ${daysInMonth} ngày</strong>
          </div>
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Cao điểm nhất:</span>
            <strong class="cal-sum-val">${maxDueInSingleDay} từ/ngày</strong>
          </div>
        </div>

        <!-- 4. Calendar Month Grid Table -->
        <div class="cal-grid-container">
          <div class="cal-weekdays-header">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>

          <div class="cal-days-grid" id="cal-days-grid">
            <!-- Grid cells generated dynamically -->
          </div>
        </div>

        <!-- 5. Selected Day Detail Drawer / Inspector -->
        <div class="cal-day-inspector" id="cal-day-inspector">
          <!-- Inspector content generated dynamically -->
        </div>
      </div>
    `;

    // Render các ô ngày vào Grid
    const daysGrid = modal.querySelector('#cal-days-grid');
    if (daysGrid) {
      const frag = document.createDocumentFragment();

      // A. Ngày mờ của tháng trước
      for (let i = startDayOffset - 1; i >= 0; i--) {
        const prevDayNum = prevMonthDays - i;
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell is-other-month';
        cell.innerHTML = `<span class="cal-day-num">${prevDayNum}</span>`;
        frag.appendChild(cell);
      }

      // B. Toàn bộ 28 - 31 ngày của tháng hiện tại
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateKey === todayKey;
        const isSelected = dateKey === selectedDateKey;
        const dayCards = monthDueMap.get(dateKey) || [];
        const count = dayCards.length;

        let loadClass = 'load-zero';
        if (count > 0 && count <= 3) loadClass = 'load-low';
        else if (count > 3 && count <= 8) loadClass = 'load-medium';
        else if (count > 8) loadClass = 'load-high';

        const cell = document.createElement('div');
        cell.className = `cal-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${loadClass}`;
        cell.setAttribute('data-date-key', dateKey);
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');

        cell.innerHTML = `
          <div class="cal-day-cell-top">
            <span class="cal-day-num">${day}</span>
            ${isToday ? '<span class="cal-today-badge" title="Hôm nay">Nay</span>' : ''}
          </div>
          <div class="cal-day-cell-bottom">
            ${count > 0 ? `<span class="cal-count-badge">${count}</span>` : '<span class="cal-empty-dot">·</span>'}
          </div>
        `;

        cell.onclick = () => {
          _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, day);
          renderModalContent();
        };

        frag.appendChild(cell);
      }

      // C. Ngày mờ của tháng sau để hoàn thành hàng lưới 35 hoặc 42 ô
      const totalRendered = startDayOffset + daysInMonth;
      const targetTotal = totalRendered <= 35 ? 35 : 42;
      const remainingCells = targetTotal - totalRendered;
      for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell is-other-month';
        cell.innerHTML = `<span class="cal-day-num">${nextDay}</span>`;
        frag.appendChild(cell);
      }

      daysGrid.appendChild(frag);
    }

    // Render Khung Chi Tiết Ngày Đang Chọn
    const inspector = modal.querySelector('#cal-day-inspector');
    if (inspector) {
      const selDay = _calSelectedDate.getDate();
      const selMonth = _calSelectedDate.getMonth() + 1;
      const selYear = _calSelectedDate.getFullYear();
      const selDateFormatted = `${String(selDay).padStart(2, '0')}/${String(selMonth).padStart(2, '0')}/${selYear}`;
      const dayCards = monthDueMap.get(selectedDateKey) || [];
      const isSelectedToday = selectedDateKey === todayKey;

      let inspectorHtml = `
        <div class="inspector-header">
          <div class="inspector-header-left">
            <div class="inspector-date-title">Ngày ${selDateFormatted}</div>
            <div class="inspector-tags-row">
              ${isSelectedToday ? '<span class="inspector-today-tag">Hôm nay</span>' : ''}
              <span class="inspector-count-tag">${dayCards.length} từ đến hạn ôn</span>
            </div>
          </div>
          ${dayCards.length > 0 ? `
            <button class="btn-inspector-study" id="btn-inspector-study-day">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Ôn ${dayCards.length} từ này</span>
            </button>
          ` : ''}
        </div>
      `;

      if (dayCards.length === 0) {
        inspectorHtml += `
          <div class="inspector-empty">
            <span class="inspector-empty-icon">✨</span>
            <p class="inspector-empty-text">Không có từ vựng nào đến hạn ôn trong ngày này.</p>
          </div>
        `;
      } else {
        inspectorHtml += `<div class="inspector-words-list">`;
        dayCards.forEach(({ card, state }) => {
          const cefr = (card.cefr || card.level || 'A1').toLowerCase();
          const s = state?.stability ? Number(state.stability).toFixed(1) : '0';
          const phonetic = card.phonetic || card.ipa || '';

          inspectorHtml += `
            <div class="inspector-word-item" data-word="${escapeHTML(card.word || '')}">
              <button class="btn-inspector-sound" data-word="${escapeHTML(card.word || '')}" title="Phát âm" aria-label="Phát âm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
              <div class="inspector-word-info">
                <div class="inspector-word-top">
                  <strong class="inspector-word-text">${escapeHTML(card.word || '')}</strong>
                  ${phonetic ? `<span class="inspector-word-ipa">${escapeHTML(phonetic)}</span>` : ''}
                  <span class="badge-cefr" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
                </div>
                <div class="inspector-word-meaning">${escapeHTML(card.meaning || '')}</div>
              </div>
              <div class="inspector-word-stability" title="Độ bền trí nhớ FSRS (Stability)">
                <span>S: ${s}d</span>
              </div>
            </div>
          `;
        });
        inspectorHtml += `</div>`;
      }

      inspector.innerHTML = inspectorHtml;

      // Event: Phát âm từ vựng trong inspector
      inspector.querySelectorAll('.btn-inspector-sound').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const w = btn.getAttribute('data-word');
          if (w) {
            btn.classList.add('playing');
            speak(w);
            setTimeout(() => btn.classList.remove('playing'), 1200);
          }
        };
      });

      // Event: Ôn tập danh sách từ của ngày này
      const btnStudyDay = inspector.querySelector('#btn-inspector-study-day');
      if (btnStudyDay && dayCards.length > 0) {
        btnStudyDay.onclick = () => {
          closeModal();
          app.startStudySession(null, null, dayCards.map(d => d.card));
        };
      }
    }

    // Điều hướng Tháng trước / Tháng sau / Hôm nay
    const btnPrev = modal.querySelector('#btn-cal-prev-month');
    const btnNext = modal.querySelector('#btn-cal-next-month');
    const btnToday = modal.querySelector('#btn-cal-today-jump');

    if (btnPrev) {
      btnPrev.onclick = () => {
        if (_calViewingMonth === 0) {
          _calViewingMonth = 11;
          _calViewingYear--;
        } else {
          _calViewingMonth--;
        }
        _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, 1);
        renderModalContent();
      };
    }

    if (btnNext) {
      btnNext.onclick = () => {
        if (_calViewingMonth === 11) {
          _calViewingMonth = 0;
          _calViewingYear++;
        } else {
          _calViewingMonth++;
        }
        _calSelectedDate = new Date(_calViewingYear, _calViewingMonth, 1);
        renderModalContent();
      };
    }

    if (btnToday) {
      btnToday.onclick = () => {
        const now = new Date();
        _calSelectedDate = now;
        _calViewingYear = now.getFullYear();
        _calViewingMonth = now.getMonth();
        renderModalContent();
      };
    }

    const btnClose = modal.querySelector('#btn-close-cal-modal');
    if (btnClose) btnClose.onclick = closeModal;
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  renderModalContent();
}
