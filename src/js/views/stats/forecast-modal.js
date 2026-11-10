/**
 * Stats Calendar Forecast Modal - Chi tiết Lịch Tháng Dự Báo Ôn Tập FSRS-6
 * Cho phép xem trước khối lượng ôn tập từng ngày trong tháng, kiểm tra danh sách từ đến hạn và nghe phát âm.
 */

import { WORDS } from '../../../data/index.js';
import { StorageManager } from '../../services/storage.js';
import { State } from '../../core/fsrs.js';
import { escapeHTML } from '../../utils.js';
import { speak } from '../../services/audio.js';

let _calViewingYear = new Date().getFullYear();
let _calViewingMonth = new Date().getMonth(); // 0-indexed
let _calSelectedDate = new Date();

/**
 * Mở Modal Lịch Tháng Dự Báo Chi Tiết
 */
export function openCalendarForecastModal(app, initialDate = new Date()) {
  let modal = document.getElementById('calendar-forecast-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'calendar-forecast-modal-overlay';
    modal.className = 'calendar-forecast-modal-overlay';
    document.body.appendChild(modal);
  }

  _calSelectedDate = new Date(initialDate);
  _calViewingYear = _calSelectedDate.getFullYear();
  _calViewingMonth = _calSelectedDate.getMonth();

  const renderModalContent = () => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const selectedDateKey = `${_calSelectedDate.getFullYear()}-${String(_calSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(_calSelectedDate.getDate()).padStart(2, '0')}`;

    const allCards = app.deckManager?.getAllCards() || WORDS;
    const monthDueMap = new Map();

    const startOfMonth = new Date(_calViewingYear, _calViewingMonth, 1);
    const endOfMonth = new Date(_calViewingYear, _calViewingMonth + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      monthDueMap.set(dateKey, []);
    }

    allCards.forEach(card => {
      const state = StorageManager.getCardState(card.id);
      if (state && state.due && state.state !== State.New && state.state !== 0) {
        const dueDate = new Date(state.due);
        if (dueDate.getFullYear() === _calViewingYear && dueDate.getMonth() === _calViewingMonth) {
          const day = dueDate.getDate();
          const dateKey = `${_calViewingYear}-${String(_calViewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (monthDueMap.has(dateKey)) {
            monthDueMap.get(dateKey).push({ card, state });
          }
        }
      }
    });

    let totalMonthDue = 0;
    let maxDueInSingleDay = 0;
    let daysWithReviews = 0;

    monthDueMap.forEach(cardsList => {
      const count = cardsList.length;
      totalMonthDue += count;
      if (count > 0) {
        daysWithReviews++;
        if (count > maxDueInSingleDay) maxDueInSingleDay = count;
      }
    });

    const firstDayIndex = startOfMonth.getDay();
    const startDayOffset = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
    const prevMonthEnd = new Date(_calViewingYear, _calViewingMonth, 0);
    const prevMonthDays = prevMonthEnd.getDate();

    modal.innerHTML = `
      <div class="calendar-forecast-dialog">
        <!-- 1. Header Dialog & Close -->
        <div class="cal-modal-header">
          <div class="cal-modal-title-wrap">
            <span class="cal-modal-icon">📅</span>
            <div class="cal-modal-titles">
              <h3 class="cal-modal-title">Lịch Dự Báo Ôn Tập</h3>
              <p class="cal-modal-sub">Dự báo theo thuật toán FSRS-6</p>
            </div>
          </div>
          <button class="btn-cal-modal-close" id="btn-close-cal-modal" title="Đóng (Esc)" aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- 2. Navigation Tháng & Năm -->
        <div class="cal-nav-bar">
          <button class="btn-cal-nav" id="btn-cal-prev-month" title="Tháng trước">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div class="cal-nav-center">
            <span class="cal-nav-month">${monthNames[_calViewingMonth]} ${_calViewingYear}</span>
            <button class="btn-cal-today-jump" id="btn-cal-today-jump">Hôm nay</button>
          </div>

          <button class="btn-cal-nav" id="btn-cal-next-month" title="Tháng sau">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        <!-- 3. Mini Summary Pills -->
        <div class="cal-summary-pills">
          <div class="cal-summary-pill">
            <span class="cal-sum-label">Tổng ôn tháng:</span>
            <strong class="cal-sum-val">${totalMonthDue} từ</strong>
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
