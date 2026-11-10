/**
 * Stats View Controller - Spaced Repetition FSRS-6 Cognitive Analytics
 * 1. Đánh giá Trí Nhớ Thật & Năng Lực Nhận Thức FSRS-6 (Retrievability R, Average Stability, Cognitive Score)
 * 2. Dự Báo Lịch Ôn 7 Ngày (7-Day Forecast Capsules & Lịch tháng chi tiết FSRS)
 * 3. Lịch Học Tập Theo Ngày (Calendar Heatmap Tháng/Năm & Thống kê tích lũy)
 * 4. Tháp 5 Tầng Độ Bền Trí Nhớ (Memory Stability Pyramid)
 * 5. Phân Tích Phản Xạ & Tỉ Lệ Phục Hồi (Recall Quality & Recovery Rate)
 */

import { WORDS } from '../../data/index.js';
import { StorageManager } from '../services/storage.js';
import { State } from '../core/fsrs.js';
import { StatsManager, globalStudyTimer } from '../core/stats.js';
import { escapeHTML } from '../utils.js';
import { speak } from '../services/audio.js';
import { openBehavioralOptimizerModal } from './components.js';
import {
  renderStatsTabShell,
  showDayPopover,
  hideDayPopover,
  getCurrentJournalPeriod
} from './stats/journal.js';
import { openCalendarForecastModal } from './stats/forecast-modal.js';

export { renderStatsTabShell, openCalendarForecastModal };

let _cachedApp = null;

/**
 * Điều phối render toàn bộ nội dung của màn hình Thống Kê & Năng Lực Trí Nhớ
 */
export function renderStatsTab(app) {
  try {
    _cachedApp = app;
    const container = document.getElementById('tab-stats');
    if (!container) return;

    // Render khung DOM tĩnh & gắn callback điều hướng tháng
    renderStatsTabShell(container, () => {
      if (_cachedApp) renderStatsTab(_cachedApp);
    });

    const allCards = app.deckManager ? app.deckManager.getAllCards() : WORDS;

    // 1. Phân Tích Năng Lực Trí Nhớ Thật & Tháp FSRS-6
    const memoryIntel = StatsManager.getMemoryIntelligence(WORDS);

    const btnOpenOpt = container.querySelector('#btn-open-optimizer-from-stats');
    if (btnOpenOpt) {
      btnOpenOpt.onclick = () => {
        try {
          openBehavioralOptimizerModal(app);
        } catch (err) {
          console.error('Lỗi mở Behavioral Optimizer từ stats:', err);
        }
      };
    }

    // 4 Khối Chỉ Số Trí Nhớ Thật
    const elRetrievability = container.querySelector('#cog-stat-retrievability');
    const elStability = container.querySelector('#cog-stat-stability');
    const elTotalTime = container.querySelector('#cog-stat-total-time');
    const elRecovery = container.querySelector('#cog-stat-recovery');

    if (elRetrievability) {
      elRetrievability.textContent = `${memoryIntel.currentRetrievability}%`;
    }
    if (elStability) {
      elStability.innerHTML = `${memoryIntel.avgStability}<span class="pnl-unit">ngày</span>`;
    }
    if (elTotalTime) {
      const totalSecs = (typeof StorageManager.getTotalStudySeconds === 'function'
        ? StorageManager.getTotalStudySeconds()
        : 0) + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.round((totalSecs % 3600) / 60);
      if (hours > 0) {
        elTotalTime.innerHTML = `${hours}h ${mins}<span class="pnl-unit">phút</span>`;
      } else {
        const displayMins = totalSecs > 0 && totalSecs < 60 ? 1 : mins;
        elTotalTime.innerHTML = `${displayMins}<span class="pnl-unit">phút</span>`;
      }
    }
    if (elRecovery) {
      elRecovery.textContent = `${memoryIntel.recoveryRate}%`;
    }

    // 2. DỰ BÁO LỊCH ÔN 7 NGÀY TỚI (FSRS-6 Forecast)
    const forecastContainer = container.querySelector('#stats-review-forecast');
    const forecastTotalBadge = container.querySelector('#stats-forecast-total');

    if (forecastContainer) {
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfTodayMs = today.getTime();
      const oneDayMs = 86400000;
      const sevenDaysMs = 7 * oneDayMs;

      let queueDue = 0;
      if (app.deckManager) {
        const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
        queueDue = studyQueue.totalDue !== undefined ? studyQueue.totalDue : 0;
      }

      const forecastCounts = [queueDue, 0, 0, 0, 0, 0, 0];

      for (const card of allCards) {
        const state = StorageManager.getCardState(card.id);
        if (state && state.due && state.state !== State.New && state.state !== 0) {
          const dueMs = new Date(state.due).getTime();
          const diffMs = dueMs - startOfTodayMs;
          if (diffMs >= oneDayMs && diffMs < sevenDaysMs) {
            const dayIndex = Math.floor(diffMs / oneDayMs);
            if (dayIndex >= 1 && dayIndex < 7) {
              forecastCounts[dayIndex]++;
            }
          }
        }
      }

      let totalWeekDue = 0;
      const maxForecast = Math.max(...forecastCounts, 1);
      forecastContainer.innerHTML = '';

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const count = forecastCounts[i];
        totalWeekDue += count;

        const dayName = dayNames[d.getDay()];
        const label = i === 0 ? 'H.nay' : (i === 1 ? 'Mai' : dayName);
        const barWidthPct = count > 0 ? Math.min(100, Math.max(15, Math.round((count / maxForecast) * 100))) : 0;

        let loadClass = 'load-zero';
        if (count > 25) {
          loadClass = 'load-high';
        } else if (count > 10) {
          loadClass = 'load-med';
        } else if (count > 0) {
          loadClass = 'load-low';
        }

        const itemEl = document.createElement('div');
        itemEl.className = `forecast-smart-card ${i === 0 ? 'is-today' : ''} ${count > 0 ? 'has-due' : 'is-zero'}`;
        itemEl.title = `${label} (${d.getDate()}/${d.getMonth() + 1}): ${count} từ cần ôn. Chạm để xem chi tiết!`;

        itemEl.innerHTML = `
          <div class="fc-card-header">
            <span class="fc-card-day">${label}</span>
            <span class="fc-card-date">${d.getDate()}/${d.getMonth() + 1}</span>
          </div>
          <div class="fc-card-count ${count > 0 ? 'count-active ' + loadClass : ''}">${count}</div>
          <div class="fc-card-bar">
            <div class="fc-bar-fill ${count > 0 ? 'fill-active ' + loadClass : ''}" style="width: ${barWidthPct}%;"></div>
          </div>
        `;

        itemEl.onclick = () => {
          openCalendarForecastModal(app, d);
        };

        forecastContainer.appendChild(itemEl);
      }

      if (forecastTotalBadge) {
        forecastTotalBadge.textContent = `${totalWeekDue} từ / 7 ngày`;
      }

      const btnOpenCal = container.querySelector('#btn-open-calendar-modal');
      if (btnOpenCal) {
        btnOpenCal.onclick = () => {
          openCalendarForecastModal(app, new Date());
        };
      }
    }

    // 3. BỆNH ÁN TỪ VỰNG HAY QUÊN (Top Weak Words Clinic)
    const weakWords = app.deckManager?.getWeakWords ? app.deckManager.getWeakWords(5) : [];
    const elWeakCount = container.querySelector('#stats-weak-words-count');
    const elWeakList = container.querySelector('#stats-weak-words-list');

    if (elWeakCount) {
      elWeakCount.textContent = `${weakWords.length} từ`;
    }

    if (elWeakList) {
      if (weakWords.length === 0) {
        elWeakList.innerHTML = `
          <div class="weak-words-empty">
            <span>🎉 Tuyệt vời! Bạn không có từ vựng nào bị quên dồn ứ.</span>
          </div>
        `;
      } else {
        elWeakList.innerHTML = '';
        weakWords.forEach(w => {
          const item = document.createElement('div');
          item.className = 'weak-word-item';
          const wordText = escapeHTML(w.word || '');
          const ipaText = escapeHTML(w.phonetic || w.ipa || '');
          const posText = escapeHTML((w.pos || 'word').toUpperCase());
          const meaningText = escapeHTML(w.meaning || '');
          const lapses = w._lapses || (w.fsrsState?.lapses || 1);

          item.innerHTML = `
            <div class="weak-word-left">
              <div class="weak-word-head">
                <span class="weak-word-text">${wordText}</span>
                ${ipaText ? `<span class="weak-word-ipa">${ipaText}</span>` : ''}
                <span class="weak-word-pos">${posText}</span>
                <span class="weak-word-badge">⚠️ Quên x${lapses}</span>
              </div>
              <div class="weak-word-meaning">${meaningText}</div>
            </div>
            <div class="weak-word-right">
              <button type="button" class="btn-weak-sound" title="Phát âm">🔊</button>
              <button type="button" class="btn-weak-study-one" title="Ôn ngay từ này">⚡ Ôn ngay</button>
            </div>
          `;

          const btnSound = item.querySelector('.btn-weak-sound');
          if (btnSound) {
            btnSound.onclick = (e) => {
              e.stopPropagation();
              speak(w.word, { cardObj: w });
            };
          }

          const btnStudyOne = item.querySelector('.btn-weak-study-one');
          if (btnStudyOne) {
            btnStudyOne.onclick = (e) => {
              e.stopPropagation();
              app.startStudySession(w.deckId || null, null, [w]);
            };
          }

          elWeakList.appendChild(item);
        });
      }
    }

    // 4. LỊCH HỌC TẬP THEO NGÀY (Monthly Activity Heatmap)
    const { year: curYear, month: curMonth } = getCurrentJournalPeriod();
    const periodTitle = container.querySelector('#journal-period-title');
    if (periodTitle) {
      periodTitle.textContent = `Tháng ${curMonth}, ${curYear}`;
    }

    const monthData = StatsManager.getMonthJournalData(curYear, curMonth);

    // Summary Strip
    const calSummaryText = container.querySelector('#journal-cal-summary-text');
    if (calSummaryText) {
      calSummaryText.innerHTML = `Tháng này: <strong>+${monthData.monthTotalWords}</strong> từ đã học • <strong>${monthData.monthMasteredWords || 0}</strong> từ đã thuộc • <strong>${monthData.activeDaysCount}/${monthData.elapsedDays}</strong> ngày học`;
    }

    // Render Bảng Lịch Ô Vuông 7 Cột
    const grid = container.querySelector('#journal-calendar-grid');
    if (grid) {
      grid.innerHTML = '';
      const frag = document.createDocumentFragment();

      for (let i = 0; i < monthData.firstDayOfWeek; i++) {
        const padCell = document.createElement('div');
        padCell.className = 'calendar-day-cell cell-empty-padding';
        frag.appendChild(padCell);
      }

      monthData.days.forEach(dayObj => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `calendar-day-cell heat-${dayObj.heatLevel} ${dayObj.isToday ? 'is-today' : ''} ${dayObj.isFuture ? 'is-future' : ''} ${dayObj.isFrozen ? 'is-frozen' : ''} ${dayObj.isRecovered ? 'is-recovered' : ''}`;
        cell.dataset.dateKey = dayObj.dateKey;

        let countText = dayObj.count > 0 ? `+${dayObj.count}` : (dayObj.isFuture ? '' : '0');
        if (dayObj.isFrozen) countText = '❄️';
        else if (dayObj.isRecovered) countText = '🛡️';

        cell.innerHTML = `
          <div class="day-cell-top">
            <span class="day-number">${dayObj.day}</span>
            ${dayObj.isToday ? '<span class="today-dot"></span>' : ''}
          </div>
          <div class="day-cell-bottom">
            <span class="day-pnl-val">${countText}</span>
          </div>
        `;

        if (!dayObj.isFuture) {
          cell.addEventListener('mouseenter', () => showDayPopover(cell, dayObj));
          cell.addEventListener('mouseleave', () => hideDayPopover());
          cell.addEventListener('click', (e) => {
            e.stopPropagation();
            showDayPopover(cell, dayObj);
          });
        }

        frag.appendChild(cell);
      });

      grid.appendChild(frag);
    }

    // 5. Tháp 5 Tầng Trí Nhớ (Memory Pyramid)
    const pyramidTotalBadge = container.querySelector('#stats-pyramid-total');
    if (pyramidTotalBadge) {
      pyramidTotalBadge.textContent = `${memoryIntel.totalLearned} từ đã học`;
    }

    const t5 = memoryIntel.tiers.tier5.count;
    const t4 = memoryIntel.tiers.tier4.count;
    const t3 = memoryIntel.tiers.tier3.count;
    const t2 = memoryIntel.tiers.tier2.count;
    const t1 = memoryIntel.tiers.tier1.count;
    const totalLearned = memoryIntel.totalLearned || 1;

    const p5 = Math.round((t5 / totalLearned) * 100);
    const p4 = Math.round((t4 / totalLearned) * 100);
    const p3 = Math.round((t3 / totalLearned) * 100);
    const p2 = Math.round((t2 / totalLearned) * 100);
    const p1 = Math.round((t1 / totalLearned) * 100);

    const seg5 = container.querySelector('#seg-tier5');
    const seg4 = container.querySelector('#seg-tier4');
    const seg3 = container.querySelector('#seg-tier3');
    const seg2 = container.querySelector('#seg-tier2');
    const seg1 = container.querySelector('#seg-tier1');

    if (seg5) seg5.style.width = `${p5}%`;
    if (seg4) seg4.style.width = `${p4}%`;
    if (seg3) seg3.style.width = `${p3}%`;
    if (seg2) seg2.style.width = `${p2}%`;
    if (seg1) seg1.style.width = `${p1}%`;

    const setTierCnt = (id, count, pct) => {
      const elCnt = container.querySelector(`#tier-cnt-${id}`);
      const elPct = container.querySelector(`#tier-pct-${id}`);
      if (elCnt) elCnt.textContent = `${count} từ`;
      if (elPct) elPct.textContent = `${pct}%`;
    };

    setTierCnt('5', t5, p5);
    setTierCnt('4', t4, p4);
    setTierCnt('3', t3, p3);
    setTierCnt('2', t2, p2);
    setTierCnt('1', t1, p1);

    // 6. Phân Bố Đánh Giá Phản Xạ
    const totalRevBadge = container.querySelector('#stats-total-reviews-badge');
    if (totalRevBadge) {
      totalRevBadge.textContent = `${memoryIntel.totalRatings} lượt ôn`;
    }

    const setReflex = (type, count, pct) => {
      const elCnt = container.querySelector(`#reflex-cnt-${type}`);
      const elPct = container.querySelector(`#reflex-pct-${type}`);
      if (elCnt) elCnt.textContent = count;
      if (elPct) elPct.textContent = `${pct}%`;
    };

    setReflex('easy', memoryIntel.ratingCounts[4] || 0, memoryIntel.ratingPct.easy);
    setReflex('good', memoryIntel.ratingCounts[3] || 0, memoryIntel.ratingPct.good);
    setReflex('hard', memoryIntel.ratingCounts[2] || 0, memoryIntel.ratingPct.hard);
    setReflex('again', memoryIntel.ratingCounts[1] || 0, memoryIntel.ratingPct.again);

    const elRecoveryVal = container.querySelector('#reflex-recovery-val');
    if (elRecoveryVal) {
      elRecoveryVal.textContent = `${memoryIntel.recoveryRate}%`;
    }

  } catch (err) {
    console.error('Lỗi khi render Stats Tab:', err);
  }
}
