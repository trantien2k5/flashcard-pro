/**
 * Review Home Tab - Stat Detail Modals
 * Quản lý các modal thống kê chi tiết khi click vào card trên Trang chủ:
 * 1. showAttentionCardsModal: Từ khó nhớ & cần chú ý (lapses >= 8)
 * 2. showDueWordsModal: Danh sách từ đến hạn hôm nay
 * 3. showReviewedTodayModal: Danh sách các từ đã ôn tập hôm nay
 * 4. showStudyTimeModal: Chi tiết thời gian học & phiên học
 * 5. showMasteredTiersModal: Phân bổ cấp độ ghi nhớ FSRS
 */

import { StorageManager } from '../../services/storage.js';
import { State, Rating, isCardDue } from '../../core/fsrs.js';
import { globalStudyTimer, StatsManager } from '../../core/stats.js';
import { escapeHTML, getLocalDateKey } from '../../utils.js';
import { showStreakHubModal } from '../components.js';
import { speak } from '../../services/audio.js';

let _cachedApp = null;

export function setStatModalsApp(app) {
  _cachedApp = app;
}

function triggerStatsRefresh(app) {
  if (app && typeof app.updateHomeStatsRealtime === 'function') {
    app.updateHomeStatsRealtime();
  } else if (typeof window !== 'undefined' && typeof window.updateHomeStatsRealtime === 'function') {
    window.updateHomeStatsRealtime(app);
  }
}

/* ==========================================================================
   POPUP 0: THỐNG KÊ THẺ QUÊN & TẠM DỪNG (ATTENTION & RECOVERY MODAL)
   ========================================================================== */
export function showAttentionCardsModal(app = _cachedApp) {
  if (!app || !app.deckManager) return;

  let modal = document.getElementById('modal-quick-attention-cards');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-attention-cards';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  let searchQuery = '';
  const initialData = app.deckManager.getAttentionCards();

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog attention-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-attention">🎯</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Danh Sách Từ Khó</h3>
            <span class="quick-modal-sub" id="attention-modal-sub">${initialData.totalCount} từ khó nhớ (ngưỡng quên ≥ 8 lần)</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>

      <div class="attention-filter-bar">
        <div class="attention-search-wrap" style="width: 100%;">
          <input type="text" class="attention-search-input" id="attention-search-input" placeholder="Tìm kiếm từ hoặc nghĩa..." />
          <button type="button" class="btn-clear-search" id="btn-clear-attention-search" style="display: none;">✕</button>
        </div>
      </div>

      <div class="quick-modal-body attention-modal-body">
        <div class="attention-word-list" id="attention-word-list"></div>
      </div>

      <div class="quick-modal-footer attention-modal-footer" id="attention-modal-footer"></div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => {
    b.onclick = () => modal.classList.remove('active');
  });
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };

  const updateModalView = () => {
    const freshData = app.deckManager.getAttentionCards();
    const difficultCards = freshData.difficultCards || freshData.allCards || [];

    // Cập nhật text tiêu đề phụ
    const subEl = modal.querySelector('#attention-modal-sub');
    if (subEl) subEl.textContent = `${difficultCards.length} từ khó nhớ (ngưỡng quên ≥ 8 lần)`;

    // Lọc danh sách hiển thị
    let displayList = difficultCards;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      displayList = displayList.filter(c => 
        (c.word && c.word.toLowerCase().includes(q)) ||
        (c.meaning && c.meaning.toLowerCase().includes(q))
      );
    }

    const listEl = modal.querySelector('#attention-word-list');
    if (listEl) {
      if (displayList.length === 0) {
        listEl.innerHTML = `
          <div class="quick-modal-empty">
            <span class="empty-emoji">${difficultCards.length === 0 ? '🎉' : '🔍'}</span>
            <h4 class="empty-title">${difficultCards.length === 0 ? 'Không có từ khó nào!' : 'Không tìm thấy từ phù hợp'}</h4>
            <p class="empty-desc">${difficultCards.length === 0 ? 'Tuyệt vời! Không có từ vựng nào đạt ngưỡng quên từ 8 lần trở lên.' : 'Hãy thử tìm kiếm với từ khóa khác.'}</p>
          </div>
        `;
      } else {
        listEl.innerHTML = displayList.map(c => `
          <div class="attention-word-row">
            <div class="attention-word-left">
              <div class="attention-word-top">
                <span class="attention-word-text">${escapeHTML(c.word)}</span>
                ${c.phonetic ? `<span class="attention-word-ipa">${escapeHTML(c.phonetic)}</span>` : ''}
                <span class="attention-word-pos">${escapeHTML((c.pos || 'word').toUpperCase())}</span>
                <button type="button" class="btn-word-audio btn-sound-mini" data-word="${escapeHTML(c.word)}" title="Nghe phát âm">🔊</button>
              </div>
              ${c.meaning ? `<div class="attention-word-meaning">${escapeHTML(c.meaning)}</div>` : ''}
            </div>
            <div class="attention-word-right">
              <div class="attention-badges-wrap">
                <span class="badge-tag tag-leech">Quên ${c._lapses || 0} lần</span>
              </div>
            </div>
          </div>
        `).join('');

        // Gán sự kiện âm thanh
        listEl.querySelectorAll('.btn-word-audio').forEach(b => {
          b.onclick = (e) => {
            e.stopPropagation();
            const w = b.getAttribute('data-word');
            if (w) speak(w);
          };
        });
      }
    }

    // Cập nhật Footer
    const footerEl = modal.querySelector('#attention-modal-footer');
    if (footerEl) {
      const count = displayList.length > 0 ? displayList.length : difficultCards.length;
      footerEl.innerHTML = `
        ${count > 0 ? `
          <button type="button" class="btn-quick-action-primary" id="btn-attention-start-study">
            <span>⚡ Ôn ngay ${count} từ khó này</span>
          </button>
        ` : ''}
        <button type="button" class="btn-quick-action-secondary btn-quick-close">
          <span>Đóng</span>
        </button>
      `;

      const btnStudy = footerEl.querySelector('#btn-attention-start-study');
      if (btnStudy) {
        btnStudy.onclick = () => {
          const targetPool = displayList.length > 0 ? displayList : difficultCards;
          if (!targetPool || targetPool.length === 0) return;
          modal.classList.remove('active');
          triggerStatsRefresh(app);
          app.showToast(`Bắt đầu ôn tập ${targetPool.length} từ khó!`, 'success');
          app.startStudySession(null, null, targetPool, { mode: 'attention_recovery' });
        };
      }

      const closeFtr = footerEl.querySelector('.btn-quick-close');
      if (closeFtr) {
        closeFtr.onclick = () => modal.classList.remove('active');
      }
    }
  };

  // Gán sự kiện tìm kiếm
  const searchInput = modal.querySelector('#attention-search-input');
  const btnClear = modal.querySelector('#btn-clear-attention-search');
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      if (btnClear) btnClear.style.display = searchQuery ? 'block' : 'none';
      updateModalView();
    };
  }
  if (btnClear) {
    btnClear.onclick = () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      btnClear.style.display = 'none';
      updateModalView();
    };
  }

  // Render lần đầu
  updateModalView();
}

/* ==========================================================================
   POPUP 1: DANH SÁCH TỪ TỚI HẠN (DUE WORDS LIST MODAL)
   ========================================================================== */
export function showDueWordsModal(app = _cachedApp) {
  if (!app || !app.deckManager) return;
  const allCards = app.deckManager.getAllCards();
  const now = new Date();
  const dueCards = [];

  for (const card of allCards) {
    const state = StorageManager.getCardState(card.id);
    if (state && state.state !== State.New && state.state !== 0 && !state.suspended) {
      if (isCardDue(state, now)) {
        dueCards.push(card);
      }
    }
  }

  let modal = document.getElementById('modal-quick-due-words');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-due-words';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const wordListHTML = dueCards.length > 0 
    ? dueCards.map(c => `
        <div class="due-word-row">
          <div class="due-word-left">
            <span class="due-word-text">${escapeHTML(c.word)}</span>
            ${c.phonetic ? `<span class="due-word-ipa">${escapeHTML(c.phonetic)}</span>` : ''}
          </div>
          <div class="due-word-right">
            <span class="due-word-pos">${escapeHTML((c.pos || 'word').toUpperCase())}</span>
          </div>
        </div>
      `).join('')
    : `
      <div class="quick-modal-empty">
        <span class="empty-emoji">🎉</span>
        <h4 class="empty-title">Không có từ tới hạn!</h4>
        <p class="empty-desc">Toàn bộ từ vựng đều đang trong chu kỳ ghi nhớ tốt. Hãy luyện từ mới hoặc thư giãn nhé!</p>
      </div>
    `;

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-due">⚡</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Từ Tới Hạn Cần Ôn</h3>
            <span class="quick-modal-sub">${dueCards.length} từ đến hạn cần củng cố</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        <div class="due-word-list">
          ${wordListHTML}
        </div>
      </div>
      <div class="quick-modal-footer">
        ${dueCards.length > 0 ? `
          <button type="button" class="btn-quick-action-primary" id="btn-quick-start-due">
            <span>⚡ Ôn ${dueCards.length} từ này ngay</span>
          </button>
        ` : ''}
        <button type="button" class="btn-quick-action-secondary btn-quick-close">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };

  const btnStartDue = modal.querySelector('#btn-quick-start-due');
  if (btnStartDue) {
    btnStartDue.onclick = () => {
      modal.classList.remove('active');
      app.startStudySession(null, null, null, { mode: 'due_only' });
    };
  }
}

/* ==========================================================================
   POPUP: DANH SÁCH THẺ ĐÃ ÔN HÔM NAY (REVIEWED TODAY MODAL)
   ========================================================================== */
export function showReviewedTodayModal(app = _cachedApp) {
  if (!app || !app.deckManager) return;
  const logs = StorageManager.getStudyLogs() || [];
  const todayKey = getLocalDateKey();
  const allCardsMap = new Map();
  app.deckManager.getAllCards().forEach(c => allCardsMap.set(c.id, c));

  const todayLogs = [];
  const ratingCounts = { [Rating.Easy]: 0, [Rating.Good]: 0, [Rating.Hard]: 0, [Rating.Again]: 0 };

  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (!log || !log.timestamp) continue;
    if (getLocalDateKey(log.timestamp) === todayKey) {
      todayLogs.push(log);
      if (ratingCounts[log.rating] !== undefined) {
        ratingCounts[log.rating]++;
      }
    }
  }

  let modal = document.getElementById('modal-quick-reviewed-today');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-reviewed-today';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const ratingLabelMap = {
    [Rating.Easy]: { text: 'DỄ', icon: '⚡', color: '#10b981' },
    [Rating.Good]: { text: 'TỐT', icon: '✨', color: '#6366f1' },
    [Rating.Hard]: { text: 'KHÓ', icon: '⏳', color: '#f59e0b' },
    [Rating.Again]: { text: 'QUÊN', icon: '❌', color: '#ef4444' }
  };

  const wordListHTML = todayLogs.length > 0
    ? todayLogs.map(log => {
        const card = allCardsMap.get(log.cardId) || { word: log.word || log.cardId, phonetic: '', pos: 'word', meaning: '' };
        const ratingInfo = ratingLabelMap[log.rating] || { text: 'ÔN', icon: '📝', color: '#6366f1' };
        const timeStr = new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        return `
          <div class="due-word-row reviewed-word-row">
            <div class="due-word-left">
              <span class="due-word-text">${escapeHTML(card.word)}</span>
              ${card.phonetic ? `<span class="due-word-ipa">${escapeHTML(card.phonetic)}</span>` : ''}
              ${card.meaning ? `<span class="reviewed-word-meaning">${escapeHTML(card.meaning)}</span>` : ''}
            </div>
            <div class="due-word-right" style="display: flex; align-items: center; gap: 8px;">
              <span class="reviewed-rating-tag" style="background: ${ratingInfo.color}18; color: ${ratingInfo.color}; border: 1px solid ${ratingInfo.color}40; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
                ${ratingInfo.icon} ${ratingInfo.text}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${timeStr}</span>
            </div>
          </div>
        `;
      }).join('')
    : `
      <div class="quick-modal-empty">
        <span class="empty-emoji">📝</span>
        <h4 class="empty-title">Chưa có lượt ôn nào hôm nay</h4>
        <p class="empty-desc">Nhấn "Bắt đầu ôn Flashcard" để củng cố từ vựng và ghi nhận thành tích ngay nhé!</p>
      </div>
    `;

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-reviewed">✅</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Thẻ Đã Ôn Hôm Nay</h3>
            <span class="quick-modal-sub">${todayLogs.length} lượt ôn tập đã hoàn thành</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        ${todayLogs.length > 0 ? `
          <div style="display: flex; gap: 6px; margin-bottom: 12px; justify-content: space-between;">
            <span style="flex: 1; text-align: center; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">⚡ Dễ: ${ratingCounts[Rating.Easy]}</span>
            <span style="flex: 1; text-align: center; background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">✨ Tốt: ${ratingCounts[Rating.Good]}</span>
            <span style="flex: 1; text-align: center; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">⏳ Khó: ${ratingCounts[Rating.Hard]}</span>
            <span style="flex: 1; text-align: center; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">❌ Quên: ${ratingCounts[Rating.Again]}</span>
          </div>
        ` : ''}
        <div class="due-word-list">
          ${wordListHTML}
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}

/* ==========================================================================
   POPUP 2: TỔNG QUAN THỜI GIAN ĐÃ HỌC (STUDY TIME OVERVIEW MODAL)
   ========================================================================== */
export function showStudyTimeModal(app = _cachedApp) {
  const todaySecs = (StorageManager.getTodayStudySeconds?.() || 0) + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
  const todayMins = todaySecs > 0 && todaySecs < 60 ? 1 : Math.round(todaySecs / 60);
  const totalStored = typeof StorageManager.getTotalStudySeconds === 'function'
    ? StorageManager.getTotalStudySeconds()
    : Object.values(StorageManager.getStudyTimeMap?.() || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  const totalSecs = totalStored + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
  const totalHours = Math.floor(totalSecs / 3600);
  const totalRemainingMins = Math.round((totalSecs % 3600) / 60);

  const logs = StorageManager.getStudyLogs() || [];
  const streak = StatsManager.calculateStreak(logs);
  const totalReviews = logs.length;

  let modal = document.getElementById('modal-quick-study-time');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-study-time';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-time">⏱️</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Thời Gian Đã Học</h3>
            <span class="quick-modal-sub">Tổng quan thời gian học chủ động FSRS</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        <div class="quick-stats-grid">
          <div class="quick-stat-tile">
            <div class="tile-icon">⏱️</div>
            <div class="tile-info">
              <span class="tile-label">Hôm nay</span>
              <strong class="tile-val text-primary">${todayMins} <span class="tile-unit">phút</span></strong>
            </div>
          </div>
          <div class="quick-stat-tile" id="quick-tile-streak-link" role="button" tabindex="0" style="cursor: pointer;" title="Nhấn để mở Hồ sơ Streak & Khiên bảo vệ">
            <div class="tile-icon">🔥</div>
            <div class="tile-info">
              <span class="tile-label">Chuỗi ngày (Streak) ❯</span>
              <strong class="tile-val text-warning">${streak} <span class="tile-unit">ngày</span></strong>
            </div>
          </div>
          <div class="quick-stat-tile">
            <div class="tile-icon">⏳</div>
            <div class="tile-info">
              <span class="tile-label">Tổng tích lũy</span>
              <strong class="tile-val text-info">${totalHours}h ${totalRemainingMins}m</strong>
            </div>
          </div>
          <div class="quick-stat-tile">
            <div class="tile-icon">📝</div>
            <div class="tile-info">
              <span class="tile-label">Lượt ôn tập</span>
              <strong class="tile-val text-success">${totalReviews} <span class="tile-unit">lượt</span></strong>
            </div>
          </div>
        </div>
        <div class="quick-tip-box">
          <span class="tip-icon">💡</span>
          <p class="tip-text">Học đều đặn mỗi ngày từ 5 - 15 phút giúp não bộ củng cố đường mòn trí nhớ FSRS tốt nhất!</p>
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đã hiểu</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const tileStreakLink = modal.querySelector('#quick-tile-streak-link');
  if (tileStreakLink) {
    tileStreakLink.onclick = () => {
      modal.classList.remove('active');
      showStreakHubModal(app);
    };
  }

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}

/* ==========================================================================
   POPUP 3: 5 MỨC ĐỘ GHI NHỚ FSRS (MASTERED STABILITY TIERS MODAL)
   ========================================================================== */
export function showMasteredTiersModal(app = _cachedApp) {
  if (!app || !app.deckManager) return;
  const allCards = app.deckManager.getAllCards();
  const intel = StatsManager.getMemoryIntelligence(allCards);
  const tiers = intel.tiers || {
    tier1: { count: 0 },
    tier2: { count: 0 },
    tier3: { count: 0 },
    tier4: { count: 0 },
    tier5: { count: 0 }
  };
  const totalLearned = intel.totalLearned || 0;
  const retrievability = intel.currentRetrievability || 0;

  let modal = document.getElementById('modal-quick-mastered-tiers');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-mastered-tiers';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-mastered">💎</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Cấp Độ Ghi Nhớ FSRS</h3>
            <span class="quick-modal-sub">Phân bổ ${totalLearned} từ theo độ bền trí nhớ</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        <!-- Visual distribution bar -->
        <div class="tier-distribution-track">
          <div class="tier-seg seg-5" style="flex: ${tiers.tier5.count || 0.001};" title="Ghi nhớ sâu: ${tiers.tier5.count}"></div>
          <div class="tier-seg seg-4" style="flex: ${tiers.tier4.count || 0.001};" title="Bền vững: ${tiers.tier4.count}"></div>
          <div class="tier-seg seg-3" style="flex: ${tiers.tier3.count || 0.001};" title="Trung hạn: ${tiers.tier3.count}"></div>
          <div class="tier-seg seg-2" style="flex: ${tiers.tier2.count || 0.001};" title="Ngắn hạn: ${tiers.tier2.count}"></div>
          <div class="tier-seg seg-1" style="flex: ${tiers.tier1.count || 0.001};" title="Mới học: ${tiers.tier1.count}"></div>
        </div>

        <div class="quick-tier-list">
          <div class="tier-row-item tier-5">
            <div class="tier-row-left">
              <span class="tier-dot dot-5"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 5: Ghi nhớ sâu</span>
                <span class="tier-desc">Độ bền S ≥ 30 ngày (Ôn > 1 tháng)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier5.count} <span class="tier-unit">từ</span></strong>
          </div>

          <div class="tier-row-item tier-4">
            <div class="tier-row-left">
              <span class="tier-dot dot-4"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 4: Bền vững</span>
                <span class="tier-desc">Độ bền 14 - 29 ngày (Ôn 2 - 4 tuần)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier4.count} <span class="tier-unit">từ</span></strong>
          </div>

          <div class="tier-row-item tier-3">
            <div class="tier-row-left">
              <span class="tier-dot dot-3"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 3: Trung hạn</span>
                <span class="tier-desc">Độ bền 7 - 13 ngày (Ôn 1 - 2 tuần)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier3.count} <span class="tier-unit">từ</span></strong>
          </div>

          <div class="tier-row-item tier-2">
            <div class="tier-row-left">
              <span class="tier-dot dot-2"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 2: Ngắn hạn</span>
                <span class="tier-desc">Độ bền 3 - 6 ngày (Ôn 3 - 7 ngày)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier2.count} <span class="tier-unit">từ</span></strong>
          </div>

          <div class="tier-row-item tier-1">
            <div class="tier-row-left">
              <span class="tier-dot dot-1"></span>
              <div class="tier-names">
                <span class="tier-title">Mức 1: Mới học</span>
                <span class="tier-desc">Độ bền < 3 ngày (Ôn 1 - 2 ngày)</span>
              </div>
            </div>
            <strong class="tier-count">${tiers.tier1.count} <span class="tier-unit">từ</span></strong>
          </div>
        </div>

        <div class="quick-intel-summary">
          <div class="intel-summary-item">
            <span class="intel-label">Xác suất nhớ thực tế R(t)</span>
            <strong class="intel-val" style="color: #10b981;">${retrievability}%</strong>
          </div>
          <div class="intel-summary-item">
            <span class="intel-label">Danh hiệu Trí nhớ</span>
            <strong class="intel-val" style="color: ${intel.rank?.color || '#6366f1'};">${intel.rank?.title || 'Khởi động'}</strong>
          </div>
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}

