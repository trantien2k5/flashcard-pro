/**
 * Shared UI Shell Mounter
 * Mounts container DOM elements for Global Modals
 */

/* ==========================================================================
   0. MODALS DYNAMIC MOUNTING (APP SHELL ARCHITECTURE)
   ========================================================================== */

export function mountGlobalModals() {
  const root = document.getElementById('modals-root') || document.body;

  // 1. Toast Container
  if (!document.getElementById('toast-container')) {
    const toastDiv = document.createElement('div');
    toastDiv.id = 'toast-container';
    toastDiv.className = 'toast-container';
    document.body.appendChild(toastDiv);
  }

  // 2. Custom Confirmation Modal
  if (!document.getElementById('app-confirm-modal')) {
    const confirmModal = document.createElement('div');
    confirmModal.id = 'app-confirm-modal';
    confirmModal.className = 'modal-backdrop';
    confirmModal.innerHTML = `
      <div class="modal-dialog confirm-dialog">
        <button class="btn-icon-close confirm-modal-close" id="btn-confirm-close" title="Đóng (Esc)">✕</button>
        <div class="confirm-icon-wrapper" id="confirm-icon-box">
          <span id="confirm-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </span>
        </div>
        <h3 class="confirm-title" id="confirm-title">Thoát phiên học?</h3>
        <p class="confirm-message" id="confirm-message">Bạn có chắc chắn muốn thoát phiên học này không?</p>
        <div class="confirm-actions">
          <button type="button" class="btn-confirm-secondary" id="btn-confirm-cancel">
            <span>Hủy</span>
            <kbd class="kbd-pill-sm">Esc</kbd>
          </button>
          <button type="button" class="btn-confirm-primary" id="btn-confirm-ok">
            <span>Xác nhận</span>
            <kbd class="kbd-pill-sm" style="background: rgba(255, 255, 255, 0.22); color: #ffffff; border-color: rgba(255, 255, 255, 0.35);">Enter</kbd>
          </button>
        </div>
      </div>
    `;
    root.appendChild(confirmModal);
  }

  // 3. Subtopic Detail Modal
  if (!document.getElementById('subtopic-detail-modal')) {
    const subtopicModal = document.createElement('div');
    subtopicModal.id = 'subtopic-detail-modal';
    subtopicModal.className = 'modal-backdrop';
    subtopicModal.innerHTML = `
      <div class="modal-dialog subtopic-modal-dialog">
        <div class="subtopic-modal-header">
          <div class="subtopic-modal-title-group">
            <div class="subtopic-modal-icon" id="subtopic-detail-icon">📖</div>
            <div class="subtopic-modal-title-text">
              <h3 class="subtopic-modal-title" id="subtopic-detail-title">Chủ đề con</h3>
              <div class="subtopic-modal-subtitle" id="subtopic-detail-meta">0 từ vựng • 0 cần ôn</div>
            </div>
          </div>
          <button class="btn-icon-close" id="btn-close-subtopic-modal" title="Đóng">✕</button>
        </div>

        <div class="subtopic-modal-body">
          <div class="subtopic-overview-stats">
            <div class="overview-stat-pill">
              <span class="overview-stat-num" id="subtopic-stat-total">0</span>
              <span class="overview-stat-lbl">Tổng số từ</span>
            </div>
            <div class="overview-stat-pill">
              <span class="overview-stat-num text-success" id="subtopic-stat-learned">0</span>
              <span class="overview-stat-lbl">Đã thuộc</span>
            </div>
            <div class="overview-stat-pill">
              <span class="overview-stat-num text-warning" id="subtopic-stat-due">0</span>
              <span class="overview-stat-lbl">Cần ôn</span>
            </div>
          </div>

          <div class="deck-progress-bar-bg" style="margin-top: 14px;">
            <div class="deck-progress-fill" id="subtopic-detail-progress-fill" style="width: 0%;"></div>
          </div>
          <div class="subpage-deck-footer">
            <span id="subtopic-detail-progress-text">Tiến độ: 0/0 từ</span>
            <span id="subtopic-detail-due-status"></span>
          </div>

          <div class="subtopic-action-group">
            <button id="btn-start-subtopic-study" class="btn-primary-hero btn-modal-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              <span>Bắt đầu học</span>
            </button>
            <button id="btn-view-subtopic-words" class="btn-secondary-action btn-modal-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <span id="btn-view-words-text">Danh sách từ</span>
            </button>
          </div>
        </div>
      </div>
    `;
    root.appendChild(subtopicModal);
  }

  // 4. Study Summary Modal
  if (!document.getElementById('study-summary-modal')) {
    const summaryModal = document.createElement('div');
    summaryModal.id = 'study-summary-modal';
    summaryModal.className = 'modal-backdrop';
    summaryModal.innerHTML = `
      <div class="modal-dialog study-summary-dialog">
        <div class="summary-hero-badge">
          <span class="summary-trophy-icon">🏆</span>
        </div>
        <h3 class="summary-title" id="summary-modal-title">Xuất sắc! Hoàn thành phiên học</h3>
        <p class="summary-subtitle" id="summary-modal-subtitle">Trí nhớ của bạn vừa được củng cố với thuật toán FSRS-6</p>

        <div class="summary-stats-grid">
          <div class="summary-stat-box total">
            <span class="summary-stat-num" id="sum-stat-total">0</span>
            <span class="summary-stat-lbl">Thẻ đã học</span>
          </div>
          <div class="summary-stat-box retention">
            <span class="summary-stat-num" id="sum-stat-remembered">0</span>
            <span class="summary-stat-lbl">Từ đã nhớ tốt</span>
          </div>
        </div>

        <div class="summary-progression-section">
          <span class="summary-sec-header">Chuyển hóa & Tiến bộ Trí nhớ</span>
          <div class="summary-progression-grid">
            <div class="progression-pill-card prog-new">
              <span class="prog-icon">🌱</span>
              <div class="prog-info">
                <span class="prog-label">Tiếp thu từ mới</span>
                <strong class="prog-val" id="sum-stat-new">+0 từ</strong>
              </div>
            </div>
            <div class="progression-pill-card prog-strengthened">
              <span class="prog-icon">⚡</span>
              <div class="prog-info">
                <span class="prog-label">Tăng độ bền (S)</span>
                <strong class="prog-val" id="sum-stat-strengthened">+0 từ</strong>
              </div>
            </div>
            <div class="progression-pill-card prog-recovered">
              <span class="prog-icon">🛡️</span>
              <div class="prog-info">
                <span class="prog-label">Phục hồi trí nhớ</span>
                <strong class="prog-val" id="sum-stat-recovered">+0 từ</strong>
              </div>
            </div>
            <div class="progression-pill-card prog-relearn">
              <span class="prog-icon">🔄</span>
              <div class="prog-info">
                <span class="prog-label">Đã lên lịch ôn bù</span>
                <strong class="prog-val" id="sum-stat-relearn">0 từ</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="summary-insight-banner" id="summary-insight-banner">
          <span class="insight-icon">💡</span>
          <span class="insight-text" id="summary-insight-text">Thuật toán FSRS-6 đã tự động tối ưu hóa lịch giãn cách để bạn sớm thuần thục toàn bộ từ vựng!</span>
        </div>

        <div class="summary-actions">
          <button class="btn-primary-hero btn-summary-home-btn" id="btn-summary-home">
            <span>Về màn hình ôn tập</span>
          </button>
        </div>
      </div>
    `;
    root.appendChild(summaryModal);
  }

  // 5. Spotlight Search Modal
  if (!document.getElementById('search-modal')) {
    const searchModal = document.createElement('div');
    searchModal.id = 'search-modal';
    searchModal.className = 'modal-backdrop';
    searchModal.innerHTML = `
      <div class="modal-dialog search-modal-dialog">
        <div class="search-modal-header">
          <div class="search-box-wrapper">
            <span class="search-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input type="text" id="global-search-input" class="search-input" placeholder="Tìm từ vựng, nghĩa, IPA, ví dụ, cấp độ CEFR..." autocomplete="off" spellcheck="false">
            <button type="button" id="btn-clear-search-input" class="search-clear-btn" style="display: none;" title="Xóa từ khóa">✕</button>
          </div>
          <button type="button" class="btn-icon-close" id="btn-close-search-modal" title="Đóng tìm kiếm" aria-label="Đóng tìm kiếm">✕</button>
        </div>

        <div class="search-quick-filters" id="search-quick-filters">
          <button class="search-filter-tag active" data-search-filter="all" type="button">Tất cả</button>
          <button class="search-filter-tag" data-search-filter="pos:noun" type="button">Danh từ</button>
          <button class="search-filter-tag" data-search-filter="pos:verb" type="button">Động từ</button>
          <button class="search-filter-tag" data-search-filter="pos:adj" type="button">Tính từ</button>
          <button class="search-filter-tag" data-search-filter="cefr:b1" type="button">B1/B2</button>
          <button class="search-filter-tag" data-search-filter="cefr:c1" type="button">C1/C2</button>
          <button class="search-filter-tag" data-search-filter="state:due" type="button">Cần ôn</button>
          <button class="search-filter-tag" data-search-filter="state:new" type="button">Chưa học</button>
        </div>

        <div id="search-empty-state" class="search-empty-state"></div>
        <div class="search-modal-results" id="search-modal-results" style="display: none;"></div>

        <div class="search-modal-footer">
          <div class="search-shortcut-hints">
            <span><kbd>Esc</kbd> Đóng</span>
            <span><kbd>↵</kbd> Chi tiết</span>
            <span><kbd>Ctrl</kbd>+<kbd>K</kbd> Tìm kiếm</span>
          </div>
          <span id="search-result-count" class="search-result-count-label"></span>
        </div>
      </div>
    `;
    root.appendChild(searchModal);
  }

}


