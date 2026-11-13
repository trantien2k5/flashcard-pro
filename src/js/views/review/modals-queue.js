/**
 * Review Stat Modals: Attention (Leech) Cards & Due Words Queue Modals
 */

import { StorageManager } from "../../services/storage.js";
import { State, isCardDue } from "../../core/fsrs.js";
import { escapeHTML } from "../../utils.js";
import { speak } from "../../services/audio.js";
import {
  getStatModalsApp,
  triggerStatsRefresh,
  ensureQuickModal,
  openAndBindQuickModal,
} from "./modal-utils.js";

/**
 * Modal Danh sách từ khó nhớ (lapses >= 8)
 */
export function showAttentionCardsModal(app = getStatModalsApp()) {
  if (!app || !app.deckManager) return;

  const modal = ensureQuickModal("modal-quick-attention-cards");
  let searchQuery = "";
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

  openAndBindQuickModal(modal);

  const updateModalView = () => {
    const freshData = app.deckManager.getAttentionCards();
    const difficultCards =
      freshData.difficultCards || freshData.allCards || [];

    const subEl = modal.querySelector("#attention-modal-sub");
    if (subEl) {
      subEl.textContent = `${difficultCards.length} từ khó nhớ (ngưỡng quên ≥ 8 lần)`;
    }

    let displayList = difficultCards;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      displayList = displayList.filter(
        (c) =>
          (c.word && c.word.toLowerCase().includes(q)) ||
          (c.meaning && c.meaning.toLowerCase().includes(q)),
      );
    }

    const listEl = modal.querySelector("#attention-word-list");
    if (listEl) {
      if (displayList.length === 0) {
        listEl.innerHTML = `
          <div class="quick-modal-empty">
            <span class="empty-emoji">${difficultCards.length === 0 ? "🎉" : "🔍"}</span>
            <h4 class="empty-title">${difficultCards.length === 0 ? "Không có từ khó nào!" : "Không tìm thấy từ phù hợp"}</h4>
            <p class="empty-desc">${difficultCards.length === 0 ? "Tuyệt vời! Không có từ vựng nào đạt ngưỡng quên từ 8 lần trở lên." : "Hãy thử tìm kiếm với từ khóa khác."}</p>
          </div>
        `;
      } else {
        listEl.innerHTML = displayList
          .map(
            (c) => `
          <div class="attention-word-row">
            <div class="attention-word-left">
              <div class="attention-word-top">
                <span class="attention-word-text">${escapeHTML(c.word)}</span>
                ${c.phonetic ? `<span class="attention-word-ipa">${escapeHTML(c.phonetic)}</span>` : ""}
                <span class="attention-word-pos">${escapeHTML((c.pos || "word").toUpperCase())}</span>
                <button type="button" class="btn-word-audio btn-sound-mini" data-word="${escapeHTML(c.word)}" title="Nghe phát âm">🔊</button>
              </div>
              ${c.meaning ? `<div class="attention-word-meaning">${escapeHTML(c.meaning)}</div>` : ""}
            </div>
            <div class="attention-word-right">
              <div class="attention-badges-wrap">
                <span class="badge-tag tag-leech">Quên ${c._lapses || 0} lần</span>
              </div>
            </div>
          </div>
        `,
          )
          .join("");

        listEl.querySelectorAll(".btn-word-audio").forEach((b) => {
          b.onclick = (e) => {
            e.stopPropagation();
            const w = b.getAttribute("data-word");
            if (w) speak(w);
          };
        });
      }
    }

    const footerEl = modal.querySelector("#attention-modal-footer");
    if (footerEl) {
      const count =
        displayList.length > 0 ? displayList.length : difficultCards.length;
      footerEl.innerHTML = `
        ${
          count > 0
            ? `
          <button type="button" class="btn-quick-action-primary" id="btn-attention-start-study">
            <span>⚡ Ôn ngay ${count} từ khó này</span>
          </button>
        `
            : ""
        }
        <button type="button" class="btn-quick-action-secondary btn-quick-close">
          <span>Đóng</span>
        </button>
      `;

      const btnStudy = footerEl.querySelector("#btn-attention-start-study");
      if (btnStudy) {
        btnStudy.onclick = () => {
          const targetPool =
            displayList.length > 0 ? displayList : difficultCards;
          if (!targetPool || targetPool.length === 0) return;
          modal.classList.remove("active");
          triggerStatsRefresh(app);
          app.showToast(
            `Bắt đầu ôn tập ${targetPool.length} từ khó!`,
            "success",
          );
          app.startStudySession(null, null, targetPool, {
            mode: "attention_recovery",
          });
        };
      }

      const closeFtr = footerEl.querySelector(".btn-quick-close");
      if (closeFtr) {
        closeFtr.onclick = () => modal.classList.remove("active");
      }
    }
  };

  const searchInput = modal.querySelector("#attention-search-input");
  const btnClear = modal.querySelector("#btn-clear-attention-search");
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      if (btnClear) btnClear.style.display = searchQuery ? "block" : "none";
      updateModalView();
    };
  }
  if (btnClear) {
    btnClear.onclick = () => {
      searchQuery = "";
      if (searchInput) searchInput.value = "";
      btnClear.style.display = "none";
      updateModalView();
    };
  }

  updateModalView();
}

/**
 * Modal Danh sách từ tới hạn hôm nay
 */
export function showDueWordsModal(app = getStatModalsApp()) {
  if (!app || !app.deckManager) return;
  const allCards = app.deckManager.getAllCards();
  const now = new Date();
  const dueCards = [];

  for (const card of allCards) {
    const state = StorageManager.getCardState(card.id);
    if (
      state &&
      state.state !== State.New &&
      state.state !== 0 &&
      !state.suspended
    ) {
      if (isCardDue(state, now)) {
        dueCards.push(card);
      }
    }
  }

  const modal = ensureQuickModal("modal-quick-due-words");
  const wordListHTML =
    dueCards.length > 0
      ? dueCards
          .map(
            (c) => `
        <div class="due-word-row">
          <div class="due-word-left">
            <span class="due-word-text">${escapeHTML(c.word)}</span>
            ${c.phonetic ? `<span class="due-word-ipa">${escapeHTML(c.phonetic)}</span>` : ""}
          </div>
          <div class="due-word-right">
            <span class="due-word-pos">${escapeHTML((c.pos || "word").toUpperCase())}</span>
          </div>
        </div>
      `,
          )
          .join("")
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
        ${
          dueCards.length > 0
            ? `
          <button type="button" class="btn-quick-action-primary" id="btn-quick-start-due">
            <span>⚡ Ôn ${dueCards.length} từ này ngay</span>
          </button>
        `
            : ""
        }
        <button type="button" class="btn-quick-action-secondary btn-quick-close">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  openAndBindQuickModal(modal);

  const btnStartDue = modal.querySelector("#btn-quick-start-due");
  if (btnStartDue) {
    btnStartDue.onclick = () => {
      modal.classList.remove("active");
      app.startStudySession(null, null, null, { mode: "due_only" });
    };
  }
}

