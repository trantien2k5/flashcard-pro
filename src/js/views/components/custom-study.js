/**
 * Custom Study Modal Controller
 * Tùy biến bộ lọc học tập theo tag, CEFR, độ khó và chế độ ôn tập
 */

import { StorageManager } from '../../services/storage.js';
import { State, isCardDue } from '../../core/fsrs.js';
import { MASTERY_STABILITY_THRESHOLD } from '../../config.js';
import { escapeHTML } from '../../utils.js';
import { showToast } from './toast.js';


/* ==========================================================================
   6. ÔN TẬP TÙY CHỌN & BỘ LỌC ĐA DẠNG (CUSTOM STUDY MODAL)
   ========================================================================== */

export async function openCustomStudyModal(app) {
  try {
    let modal = document.getElementById('modal-custom-study');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-custom-study';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const allDecks = app.deckManager ? (app.deckManager.getAllDecks() || []) : [];
    
    // Tạo options cho select bộ từ
    let deckOptionsHtml = `<option value="all">🌟 Tất cả kho từ (Toàn bộ)</option>`;
    allDecks.forEach(deck => {
      const icon = deck.icon || '📁';
      const name = deck.name || deck.id;
      const cards = app.deckManager ? (app.deckManager.getCardsByDeckId(deck.id) || []) : [];
      const count = cards.length || deck.totalWords || deck.wordIds?.length || 0;
      deckOptionsHtml += `<option value="${escapeHTML(deck.id)}">${icon} ${escapeHTML(name)} (${count} từ)</option>`;
    });

    modal.innerHTML = `
      <div class="modal-dialog custom-study-dialog">
        <div class="modal-header custom-study-header">
          <div class="custom-study-header-left">
            <div class="custom-study-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
              </svg>
            </div>
            <div>
              <h3 class="custom-study-modal-title">Ôn tập Tùy chọn</h3>
              <span class="custom-study-modal-sub">Tự tạo phiên flashcard theo tiêu chí riêng</span>
            </div>
          </div>
          <button type="button" class="btn-icon-close" id="btn-close-custom-study" title="Đóng (Esc)">✕</button>
        </div>

        <div class="modal-body custom-study-body">
          <!-- 1. Chọn Bộ từ / Chủ đề -->
          <div class="custom-study-group">
            <label class="custom-study-label" for="custom-study-deck-select">
              <span class="label-icon">📁</span>
              <span class="label-text">Bộ từ vựng / Chủ đề</span>
            </label>
            <div class="custom-study-select-wrap">
              <select id="custom-study-deck-select" class="custom-study-select">
                ${deckOptionsHtml}
              </select>
            </div>
          </div>

          <!-- 2. Chọn Trạng thái từ vựng FSRS -->
          <div class="custom-study-group">
            <label class="custom-study-label">
              <span class="label-icon">🎯</span>
              <span class="label-text">Trạng thái trí nhớ FSRS</span>
            </label>
            <div class="custom-study-chips-grid" id="custom-status-chips">
              <button type="button" class="custom-chip active" data-status="all">
                <span>Tất cả</span>
              </button>
              <button type="button" class="custom-chip chip-due" data-status="due">
                <span>⏰ Cần ôn ngay</span>
              </button>
              <button type="button" class="custom-chip chip-new" data-status="new">
                <span>🌿 Từ mới</span>
              </button>
              <button type="button" class="custom-chip chip-learning" data-status="learning">
                <span>📖 Đang học</span>
              </button>
              <button type="button" class="custom-chip chip-mastered" data-status="mastered">
                <span>💎 Đã thuộc</span>
              </button>
              <button type="button" class="custom-chip chip-leech" data-status="leech">
                <span>🔥 Hay quên</span>
              </button>
            </div>
          </div>

          <!-- 3. Cấp độ CEFR -->
          <div class="custom-study-group">
            <label class="custom-study-label">
              <span class="label-icon">📊</span>
              <span class="label-text">Cấp độ thông thạo CEFR</span>
            </label>
            <div class="custom-study-chips-grid custom-study-cefr-grid" id="custom-cefr-chips">
              <button type="button" class="custom-chip active" data-cefr="all">Tất cả</button>
              <button type="button" class="custom-chip" data-cefr="a1">A1</button>
              <button type="button" class="custom-chip" data-cefr="a2">A2</button>
              <button type="button" class="custom-chip" data-cefr="b1">B1</button>
              <button type="button" class="custom-chip" data-cefr="b2">B2</button>
              <button type="button" class="custom-chip" data-cefr="c1">C1</button>
            </div>
          </div>

          <!-- 4. Số lượng thẻ mỗi phiên -->
          <div class="custom-study-group">
            <label class="custom-study-label">
              <span class="label-icon">⏱️</span>
              <span class="label-text">Số lượng từ mỗi phiên</span>
            </label>
            <div class="custom-study-chips-grid custom-study-limit-grid" id="custom-limit-chips">
              <button type="button" class="custom-chip" data-limit="10">10</button>
              <button type="button" class="custom-chip active" data-limit="20">20</button>
              <button type="button" class="custom-chip" data-limit="30">30</button>
              <button type="button" class="custom-chip" data-limit="50">50</button>
              <button type="button" class="custom-chip" data-limit="all">Tất cả</button>
            </div>
          </div>

          <!-- Live Preview Box -->
          <div class="custom-study-preview-box" id="custom-study-preview-box">
            <div class="preview-spinner">Đang chuẩn bị...</div>
          </div>
        </div>

        <div class="modal-footer custom-study-footer">
          <button type="button" class="btn-custom-cancel" id="btn-cancel-custom-study">Đóng</button>
          <button type="button" class="btn-custom-submit" id="btn-start-custom-study">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <span id="btn-start-custom-text">Bắt đầu học ngay</span>
          </button>
        </div>
      </div>
    `;

    // Local filter state
    const filterState = {
      deckId: 'all',
      status: 'all',
      cefr: 'all',
      limit: '20'
    };

    let currentMatchedCards = [];

    const selectDeck = modal.querySelector('#custom-study-deck-select');
    const statusChips = modal.querySelectorAll('#custom-status-chips .custom-chip');
    const cefrChips = modal.querySelectorAll('#custom-cefr-chips .custom-chip');
    const limitChips = modal.querySelectorAll('#custom-limit-chips .custom-chip');
    const previewBox = modal.querySelector('#custom-study-preview-box');
    const btnSubmit = modal.querySelector('#btn-start-custom-study');
    const btnSubmitText = modal.querySelector('#btn-start-custom-text');

    // Hàm tính toán danh sách từ thỏa mãn
    const updateMatchingCards = async () => {
      previewBox.innerHTML = `<span class="preview-calc-text">⏳ Đang tìm từ phù hợp...</span>`;
      
      // Nếu chọn 1 deck cụ thể, đảm bảo từ của deck đó đã nạp
      if (filterState.deckId !== 'all' && app.deckManager?.ensureTopicLoaded) {
        await app.deckManager.ensureTopicLoaded(filterState.deckId);
      }

      let sourceCards = [];
      if (filterState.deckId === 'all') {
        sourceCards = app.deckManager ? (app.deckManager.getAllCards() || []) : [];
      } else {
        sourceCards = app.deckManager ? (app.deckManager.getCardsByDeckId(filterState.deckId) || app.deckManager.getDeckCards?.(filterState.deckId) || []) : [];
      }

      const now = new Date();
      const matched = [];

      for (let i = 0; i < sourceCards.length; i++) {
        const card = sourceCards[i];
        if (!card) continue;

        // Bỏ qua thẻ đã bị tạm hoãn/đóng băng (suspended)
        const state = StorageManager.getCardState(card.id);
        if (state && state.suspended) continue;

        // 1. Lọc theo CEFR Level
        if (filterState.cefr !== 'all') {
          const lvl = (card.level || card.cefr || '').toLowerCase().trim();
          if (lvl !== filterState.cefr) continue;
        }

        // 2. Lọc theo trạng thái FSRS
        if (filterState.status !== 'all') {
          const isActuallyNew = !state || state.state === 0 || (state.state === State.New && (state.reps === 0 || !state.last_review));
          const isDue = !isActuallyNew && isCardDue(state, now);
          const s = state ? (Number(state.stability) || 0) : 0;
          const lapses = state ? (Number(state.lapses) || 0) : 0;
          const isLeech = Boolean(state && (state.isLeech === true || lapses >= 8));
          const isMastered = !isActuallyNew && s >= MASTERY_STABILITY_THRESHOLD;
          const isLearning = !isActuallyNew && !isMastered;

          if (filterState.status === 'due' && !isDue) continue;
          if (filterState.status === 'new' && !isActuallyNew) continue;
          if (filterState.status === 'learning' && !isLearning) continue;
          if (filterState.status === 'mastered' && !isMastered) continue;
          if (filterState.status === 'leech' && !isLeech) continue;
        }

        matched.push(card);
      }

      currentMatchedCards = matched;

      // Cập nhật giao diện Preview dạng thanh Banner phẳng thoáng mắt
      if (matched.length === 0) {
        previewBox.innerHTML = `
          <div class="preview-banner-empty">
            <span class="preview-banner-icon">⚠️</span>
            <span class="preview-banner-text">Không có từ nào thỏa mãn bộ lọc đã chọn. Hãy thử nới lỏng điều kiện lọc!</span>
          </div>
        `;
        btnSubmit.disabled = true;
        btnSubmitText.textContent = 'Không có từ phù hợp';
      } else {
        const takeLimit = filterState.limit === 'all' ? matched.length : Math.min(Number(filterState.limit), matched.length);
        const formattedTotal = matched.length.toLocaleString('vi-VN');
        const formattedTake = takeLimit.toLocaleString('vi-VN');
        previewBox.innerHTML = `
          <div class="preview-banner-row">
            <div class="preview-banner-left">
              <span class="preview-banner-icon">🎯</span>
              <span class="preview-banner-text">Có sẵn <strong>${formattedTotal}</strong> từ phù hợp</span>
            </div>
            <div class="preview-banner-badge">
              <span>Học <strong>${formattedTake}</strong> thẻ</span>
            </div>
          </div>
        `;
        btnSubmit.disabled = false;
        btnSubmitText.textContent = `Bắt đầu học (${formattedTake} thẻ)`;
      }
    };

    // Sự kiện thay đổi Deck
    if (selectDeck) {
      selectDeck.onchange = (e) => {
        filterState.deckId = e.target.value;
        updateMatchingCards();
      };
    }

    // Sự kiện chọn Status chip
    statusChips.forEach(chip => {
      chip.onclick = () => {
        statusChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterState.status = chip.dataset.status;
        navigator.vibrate?.(6);
        updateMatchingCards();
      };
    });

    // Sự kiện chọn CEFR chip
    cefrChips.forEach(chip => {
      chip.onclick = () => {
        cefrChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterState.cefr = chip.dataset.cefr;
        navigator.vibrate?.(6);
        updateMatchingCards();
      };
    });

    // Sự kiện chọn Limit chip
    limitChips.forEach(chip => {
      chip.onclick = () => {
        limitChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterState.limit = chip.dataset.limit;
        navigator.vibrate?.(6);
        updateMatchingCards();
      };
    });

    // Đóng Modal
    const closeModal = () => {
      modal.classList.remove('active');
    };

    modal.querySelector('#btn-close-custom-study')?.addEventListener('click', closeModal);
    modal.querySelector('#btn-cancel-custom-study')?.addEventListener('click', closeModal);
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    // Bắt đầu học
    btnSubmit.onclick = () => {
      if (!currentMatchedCards || currentMatchedCards.length === 0) return;

      const takeLimit = filterState.limit === 'all' 
        ? currentMatchedCards.length 
        : Math.min(Number(filterState.limit), currentMatchedCards.length);

      // Ưu tiên sắp xếp FSRS: Cần ôn ngay (Due) -> Đang học (Learning) -> Từ mới (New) -> Đã thuộc (Mastered)
      const now = new Date();
      const sortedCards = [...currentMatchedCards].sort((a, b) => {
        const stateA = StorageManager.getCardState(a.id);
        const stateB = StorageManager.getCardState(b.id);

        const isNewA = !stateA || stateA.state === 0 || (stateA.state === State.New && (stateA.reps === 0 || !stateA.last_review));
        const isNewB = !stateB || stateB.state === 0 || (stateB.state === State.New && (stateB.reps === 0 || !stateB.last_review));

        const dueA = !isNewA && isCardDue(stateA, now);
        const dueB = !isNewB && isCardDue(stateB, now);

        const sA = stateA ? (Number(stateA.stability) || 0) : 0;
        const sB = stateB ? (Number(stateB.stability) || 0) : 0;

        const isMasteredA = !isNewA && sA >= MASTERY_STABILITY_THRESHOLD;
        const isMasteredB = !isNewB && sB >= MASTERY_STABILITY_THRESHOLD;

        const isLearningA = !isNewA && !isMasteredA;
        const isLearningB = !isNewB && !isMasteredB;

        // Bậc ưu tiên: 1: Due, 2: Learning, 3: New, 4: Mastered
        const getTier = (due, learning, isNew, mastered) => {
          if (due) return 1;
          if (learning) return 2;
          if (isNew) return 3;
          if (mastered) return 4;
          return 3;
        };

        const tierA = getTier(dueA, isLearningA, isNewA, isMasteredA);
        const tierB = getTier(dueB, isLearningB, isNewB, isMasteredB);

        if (tierA !== tierB) {
          return tierA - tierB;
        }

        // Tier 1: Cần ôn ngay -> thẻ quá hạn lâu nhất lên trước
        if (tierA === 1) {
          const dueTimeA = stateA?.due ? new Date(stateA.due).getTime() : 0;
          const dueTimeB = stateB?.due ? new Date(stateB.due).getTime() : 0;
          return dueTimeA - dueTimeB;
        }

        // Tier 2: Đang học -> độ bền thấp hơn (yếu hơn) lên trước
        if (tierA === 2) {
          return sA - sB;
        }

        // Tier 3: Từ mới -> bảo toàn thứ tự gốc của bộ thẻ
        if (tierA === 3) {
          return 0;
        }

        // Tier 4: Đã thuộc -> độ bền thấp hơn lên trước
        return sA - sB;
      });

      const finalQueue = sortedCards.slice(0, takeLimit).map(card => {
        const state = StorageManager.getCardState(card.id);
        return {
          ...card,
          fsrsState: state || null
        };
      });

      navigator.vibrate?.(12);
      closeModal();
      
      // Khởi động phiên học Flashcard 3D thông thường với context deck đã chọn
      const selectedDeckId = filterState.deckId === 'all' ? null : filterState.deckId;
      app.startStudySession(selectedDeckId, null, finalQueue, { 
        mode: 'custom_filter',
        filterTitle: 'Ôn tập Tùy chọn'
      });
    };

    // Hiển thị modal và tính toán lần đầu
    modal.classList.add('active');
    updateMatchingCards();

  } catch (err) {
    console.error('Lỗi openCustomStudyModal:', err);
    if (app.showToast) app.showToast('Không thể mở bộ lọc tùy chọn: ' + (err?.message || err), 'error');
  }
}

