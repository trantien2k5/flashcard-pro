/**
 * Stats Journal & Calendar Heatmap Component
 * Quản lý khung giao diện DOM của Stats Tab, bảng lịch ô vuông ma trận học tập (Journal Heatmap)
 * và tooltip popover thông tin chi tiết từng ngày.
 */

import { getStatsTabTemplate } from './shell-template.js';

let _currentYear = new Date().getFullYear();
let _currentMonth = new Date().getMonth() + 1; // 1 - 12

export function getCurrentJournalPeriod() {
  return { year: _currentYear, month: _currentMonth };
}

/**
 * Khởi tạo khung DOM tĩnh ban đầu của Stats Tab
 */
export function renderStatsTabShell(container, onNavigate = null) {
  if (!container) return;
  if (!container.querySelector('.stats-hero-banner')) {
    container.innerHTML = getStatsTabTemplate(_currentMonth, _currentYear);

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
