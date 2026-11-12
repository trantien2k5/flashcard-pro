/**
 * Facebook-Style Vocabulary Newsfeed Controller Facade
 * Điều phối render, bộ lọc bottom-sheet & vòng đời tab Lướt từ vựng.
 */

import { stopAudio, unlockAudioContext } from '../services/audio.js';
import { renderFacebookPostCardHTML, renderFilterModalHTML } from './reels/templates.js';
import {
  REELS_BATCH_SIZE,
  DEFAULT_REELS_FILTER,
  reelsState,
  getMainContentEl,
  loadUserInteractions,
  saveUserInteractions
} from './reels/state.js';
import { buildSmartFeedQueue } from './reels/queue.js';
import {
  setupFeedIntersectionObserver,
  bindFeedInteractions,
  bindScrollAndKeyboard
} from './reels/interactions.js';

function appendNextBatch() {
  if (!reelsState.feedContainer || reelsState.renderedCount >= reelsState.queue.length) return;

  const nextBatch = reelsState.queue.slice(reelsState.renderedCount, reelsState.renderedCount + REELS_BATCH_SIZE);
  if (nextBatch.length === 0) return;

  const frag = document.createDocumentFragment();
  const temp = document.createElement('div');

  nextBatch.forEach((card, idx) => {
    temp.innerHTML = renderFacebookPostCardHTML(card, reelsState.renderedCount + idx, {
      likedWordIds: reelsState.likedWordIds,
      bookmarkedWordIds: reelsState.bookmarkedWordIds,
      wordComments: reelsState.wordComments,
      fbFilter: reelsState.filter
    });
    const child = temp.firstElementChild;
    if (child) {
      frag.appendChild(child);
      if (reelsState.activeObserver) reelsState.activeObserver.observe(child);
    }
  });

  reelsState.feedContainer.appendChild(frag);
  reelsState.renderedCount += nextBatch.length;

  updateFilterPillLabel();
}

function updateFilterPillLabel() {
  const labelEl = document.getElementById('fb-filter-pill-text');
  if (!labelEl) return;
  const parts = [];
  if (reelsState.filter.level !== 'all') parts.push(reelsState.filter.level);
  if (reelsState.filter.status !== 'mixed') {
    const statusMap = { due: 'Cần ôn', new: 'Từ mới', bookmarked: 'Đã lưu', hard: 'Từ khó' };
    parts.push(statusMap[reelsState.filter.status] || reelsState.filter.status);
  }
  labelEl.textContent = parts.length > 0 ? `Lọc: ${parts.join(' • ')}` : 'Bộ lọc';
}

function openFilterModal() {
  const modal = document.getElementById('fb-filter-modal');
  if (modal) modal.classList.add('is-open');
}

function closeFilterModal() {
  const modal = document.getElementById('fb-filter-modal');
  if (modal) modal.classList.remove('is-open');
}

function applyCurrentFilter() {
  closeFilterModal();
  saveUserInteractions();

  reelsState.queue = buildSmartFeedQueue(reelsState.filter);
  reelsState.renderedCount = 0;
  reelsState.lastSpokenWordId = null;

  if (reelsState.feedContainer) {
    reelsState.feedContainer.innerHTML = '';
    appendNextBatch();
    setupFeedIntersectionObserver();
    const mainEl = getMainContentEl();
    if (mainEl) mainEl.scrollTop = 0;
    reelsState.feedContainer.scrollTop = 0;
    window.scrollTo({ top: 0 });
  }

  updateFilterPillLabel();
  reelsState.app?.showToast(`Đã áp dụng bộ lọc: ${reelsState.queue.length} từ vựng phù hợp`, 'info', 1800);
}

function bindToolbarAndFilterSheet(btnSound) {
  const btnFilter = document.getElementById('fb-btn-filter-pill');
  if (btnFilter) btnFilter.onclick = openFilterModal;

  const composerFilter = document.getElementById('fb-composer-btn-filter');
  if (composerFilter) composerFilter.onclick = openFilterModal;

  const composerTrigger = document.getElementById('fb-composer-trigger');
  if (composerTrigger) composerTrigger.onclick = openFilterModal;

  const filterClose = document.getElementById('fb-filter-close-btn');
  if (filterClose) filterClose.onclick = closeFilterModal;

  const filterBackdrop = document.getElementById('fb-filter-modal');
  if (filterBackdrop) {
    filterBackdrop.onclick = (e) => {
      if (e.target === filterBackdrop) closeFilterModal();
    };
  }

  if (btnSound) {
    btnSound.onclick = () => {
      reelsState.filter.autoAudio = !reelsState.filter.autoAudio;
      btnSound.classList.toggle('is-on', reelsState.filter.autoAudio);
      btnSound.title = reelsState.filter.autoAudio ? 'Đang bật tự phát âm' : 'Đang tắt tự phát âm';
      saveUserInteractions();
      reelsState.app?.showToast(
        reelsState.filter.autoAudio ? '🔊 Đã bật tự động phát âm khi lướt' : '🔇 Đã tắt tự động phát âm',
        'info',
        1500
      );
    };
  }

  const btnShuffle = document.getElementById('fb-composer-btn-shuffle');
  if (btnShuffle) {
    btnShuffle.onclick = () => {
      reelsState.queue.sort(() => Math.random() - 0.5);
      reelsState.renderedCount = 0;
      if (reelsState.feedContainer) {
        reelsState.feedContainer.innerHTML = '';
        appendNextBatch();
        setupFeedIntersectionObserver();
        const mainEl = document.getElementById('main-content');
        if (mainEl) mainEl.scrollTop = 0;
      }
      reelsState.app?.showToast('🎲 Đã xáo trộn bảng tin mới!', 'success', 1500);
    };
  }

  const btnScrollTop = document.getElementById('fb-btn-scroll-top');
  if (btnScrollTop) {
    btnScrollTop.onclick = () => {
      const mainEl = getMainContentEl();
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      reelsState.feedContainer?.scrollTo?.({ top: 0, behavior: 'smooth' });
    };
  }

  const levelChips = document.querySelectorAll('#filter-level-chips .fb-filter-chip');
  levelChips.forEach(chip => {
    chip.onclick = () => {
      levelChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      reelsState.filter.level = chip.getAttribute('data-level');
    };
  });

  const statusChips = document.querySelectorAll('#filter-status-chips .fb-filter-chip');
  statusChips.forEach(chip => {
    chip.onclick = () => {
      statusChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      reelsState.filter.status = chip.getAttribute('data-status');
    };
  });

  const topicSelect = document.getElementById('filter-topic-select');
  if (topicSelect) {
    topicSelect.onchange = () => {
      reelsState.filter.topicId = topicSelect.value;
    };
  }

  const toggleAudio = document.getElementById('filter-toggle-audio');
  if (toggleAudio) {
    toggleAudio.onchange = () => {
      reelsState.filter.autoAudio = toggleAudio.checked;
      if (btnSound) btnSound.classList.toggle('is-on', reelsState.filter.autoAudio);
    };
  }

  const toggleBlur = document.getElementById('filter-toggle-blur');
  if (toggleBlur) {
    toggleBlur.onchange = () => {
      reelsState.filter.blurMeaning = toggleBlur.checked;
    };
  }

  const btnApplyFilter = document.getElementById('fb-filter-apply-btn');
  if (btnApplyFilter) btnApplyFilter.onclick = applyCurrentFilter;

  const btnResetFilter = document.getElementById('fb-filter-reset-btn');
  if (btnResetFilter) {
    btnResetFilter.onclick = () => {
      reelsState.filter = { ...DEFAULT_REELS_FILTER };
      levelChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-level') === 'all'));
      statusChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-status') === 'mixed'));
      if (topicSelect) topicSelect.value = 'all';
      if (toggleAudio) toggleAudio.checked = true;
      if (toggleBlur) toggleBlur.checked = false;
      if (btnSound) btnSound.classList.add('is-on');
      applyCurrentFilter();
    };
  }
}

/**
 * Tạm dừng observer và âm thanh khi rời tab Reels
 */
export function pauseReelsSession() {
  if (reelsState.activeObserver) {
    reelsState.activeObserver.disconnect();
    reelsState.activeObserver = null;
  }
  if (reelsState.speechDebounceTimer) {
    clearTimeout(reelsState.speechDebounceTimer);
    reelsState.speechDebounceTimer = null;
  }
  if (reelsState.scrollTimeout) {
    clearTimeout(reelsState.scrollTimeout);
    reelsState.scrollTimeout = null;
  }
  stopAudio();
}

/**
 * Điểm vào chính dựng Tab Lướt Từ Vựng
 */
export function renderReelsTab(app, customQueue = null, options = {}) {
  reelsState.app = app || (typeof window !== 'undefined' ? window.app : null);
  unlockAudioContext();
  loadUserInteractions();

  const mountTarget = document.getElementById('tab-reels');
  if (!mountTarget) {
    console.error('Không tìm thấy #tab-reels trong DOM.');
    return;
  }

  const existingFeed = mountTarget.querySelector('#fb-feed-container');
  if (existingFeed && existingFeed.children.length > 1 && !customQueue && !options?.forceReload) {
    reelsState.feedContainer = existingFeed;
    setupFeedIntersectionObserver();
    return;
  }

  if (Array.isArray(customQueue) && customQueue.length > 0) {
    reelsState.queue = [...customQueue];
  } else {
    reelsState.queue = buildSmartFeedQueue(reelsState.filter);
  }

  if (!reelsState.queue || reelsState.queue.length === 0) {
    mountTarget.innerHTML = `
      <div class="fb-feed-stage" style="padding: 40px 20px; text-align: center;">
        <h3 style="color: var(--fb-text-main); margin-bottom: 12px;">🎉 Bạn đã xem hết từ vựng!</h3>
        <p style="color: var(--fb-text-sub); margin-bottom: 20px;">Không có từ nào phù hợp với bộ lọc hiện tại.</p>
        <button type="button" class="fb-btn-accent-audio" id="fb-btn-empty-reset" style="margin: 0 auto; padding: 10px 20px;">
          Đặt lại bộ lọc
        </button>
      </div>
    `;
    const btnReset = mountTarget.querySelector('#fb-btn-empty-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        reelsState.filter = { ...DEFAULT_REELS_FILTER };
        saveUserInteractions();
        renderReelsTab(reelsState.app, null, { forceReload: true });
      };
    }
    return;
  }

  mountTarget.innerHTML = `
    <div class="fb-feed-stage">
      <!-- 1. Facebook Top App Bar -->
      <header class="fb-top-header">
        <div class="fb-header-left">
          <div class="fb-brand-title">
            <span>facebook</span>
            <span class="fb-brand-badge">Feed</span>
          </div>
        </div>

        <div class="fb-header-right">
          <button type="button" class="fb-btn-filter-pill" id="fb-btn-filter-pill" title="Mở bộ lọc nội dung từ vựng">
            <span class="fb-filter-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </span>
            <span id="fb-filter-pill-text">Bộ lọc</span>
            <span class="fb-filter-arrow">▾</span>
          </button>

          <button type="button" class="fb-btn-circle fb-btn-toggle-sound ${reelsState.filter.autoAudio ? 'is-on' : ''}" id="fb-btn-toggle-sound" title="${reelsState.filter.autoAudio ? 'Đang bật tự phát âm' : 'Đang tắt tự phát âm'}">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
        </div>
      </header>

      <!-- 2. Newsfeed Scroll Container -->
      <main class="fb-feed-container" id="fb-feed-container">
        <section class="fb-composer-card">
          <div class="fb-composer-top">
            <div class="fb-user-avatar">FB</div>
            <div class="fb-composer-input-fake" id="fb-composer-trigger">
              Hôm nay bạn muốn học chủ đề gì? Chạm để lọc...
            </div>
          </div>
          <div class="fb-composer-bottom">
            <button type="button" class="fb-composer-action-btn" id="fb-composer-btn-filter">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span>Bộ lọc từ vựng</span>
            </button>
            <button type="button" class="fb-composer-action-btn" id="fb-composer-btn-shuffle">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
              <span>Xáo trộn Feed</span>
            </button>
          </div>
        </section>
      </main>

      <!-- Nút cuộn lên đầu trang -->
      <button type="button" class="fb-btn-scroll-top" id="fb-btn-scroll-top" title="Lên đầu trang">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

      <!-- 3. Bộ lọc Modal / Bottom Sheet -->
      ${renderFilterModalHTML(reelsState.filter)}
    </div>
  `;

  reelsState.feedContainer = document.getElementById('fb-feed-container');
  reelsState.renderedCount = 0;

  appendNextBatch();
  setupFeedIntersectionObserver();
  updateFilterPillLabel();

  const btnSound = document.getElementById('fb-btn-toggle-sound');
  bindToolbarAndFilterSheet(btnSound);
  bindFeedInteractions();
  bindScrollAndKeyboard({
    onBatchNeeded: appendNextBatch,
    onEscapeCloseModal: closeFilterModal
  });
}

// Giữ tương thích ngược với các lời gọi startReelsSession cũ
export function startReelsSession(app, customQueue = null, options = {}) {
  const targetApp = app || reelsState.app || (typeof window !== 'undefined' ? window.app : null);
  if (targetApp && typeof targetApp.switchTab === 'function') {
    targetApp.switchTab('tab-reels');
    if (Array.isArray(customQueue) && customQueue.length > 0) {
      renderReelsTab(targetApp, customQueue, { ...options, forceReload: true });
    }
  } else {
    renderReelsTab(targetApp, customQueue, options);
  }
}
