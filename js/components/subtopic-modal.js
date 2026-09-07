/**
 * Subtopic Detail Modal Component (Level 3 Popup)
 */

import { DECK_ENGLISH_NAMES, getSubtopicIcon } from '../constants.js';
import { StorageManager } from '../storage.js';
import { State } from '../fsrs.js';
import { escapeHTML } from '../utils/helpers.js';

/**
 * Mở Popup chi tiết của một Chủ đề con (Modal Popup giữa màn hình)
 */
export async function openSubtopicDetailPage(app, deckId, subtopicName) {
  try {
    app.currentSubtopicsDeckId = deckId;
    app.currentSubtopicName = subtopicName;
    if (app.deckManager && app.deckManager.ensureTopicLoaded) {
      await app.deckManager.ensureTopicLoaded(deckId);
    }
    await renderSubtopicDetailPage(app, deckId, subtopicName);
    const modal = document.getElementById('subtopic-detail-modal');
    if (modal) {
      modal.classList.add('active');
    }
  } catch (err) {
    console.error(`Lỗi openSubtopicDetailPage(${deckId}, ${subtopicName}):`, err);
  }
}

/**
 * Render Dữ liệu Modal Popup chi tiết Chủ đề con
 */
export async function renderSubtopicDetailPage(app, deckId, subtopicName) {
  try {
    if (app.deckManager && app.deckManager.ensureTopicLoaded) {
      await app.deckManager.ensureTopicLoaded(deckId);
    }
    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const subCards = app.deckManager.getSubtopicCards(deckId, subtopicName);
    const subIcon = getSubtopicIcon(subtopicName, deck.icon || '📖');

    // Tính toán chỉ số tiến độ chủ đề con
    const dueSubCount = subCards.filter(c => {
      const s = StorageManager.getCardState(c.id);
      return s && s.state !== State.New && s.state !== 0 && s.due && new Date(s.due) <= new Date();
    }).length;

    const learnedSubCount = subCards.filter(c => {
      const s = StorageManager.getCardState(c.id);
      return s && s.state !== State.New && s.state !== 0;
    }).length;

    const subProgress = subCards.length > 0 ? Math.round((learnedSubCount / subCards.length) * 100) : 0;

    // 1. Cập nhật Tiêu đề và biểu tượng trên Header của Modal
    const iconEl = document.getElementById('subtopic-detail-icon');
    const titleEl = document.getElementById('subtopic-detail-title');
    const metaEl = document.getElementById('subtopic-detail-meta');
    const fillEl = document.getElementById('subtopic-detail-progress-fill');
    const progressTextEl = document.getElementById('subtopic-detail-progress-text');
    const dueStatusEl = document.getElementById('subtopic-detail-due-status');
    const btnStartStudy = document.getElementById('btn-start-subtopic-study');

    if (iconEl) {
      iconEl.textContent = subIcon;
      iconEl.style.background = `${deck.color || '#6366f1'}18`;
      iconEl.style.color = deck.color || '#6366f1';
    }
    const englishDeckTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
    const vietnameseDeckTitle = deck.name || (deck.title && deck.title !== englishDeckTitle ? deck.title : '');
    if (titleEl) titleEl.textContent = subtopicName;
    if (metaEl) metaEl.textContent = `${vietnameseDeckTitle || englishDeckTitle} • ${subCards.length} từ vựng`;
    if (fillEl) fillEl.style.width = `${subProgress}%`;
    if (progressTextEl) progressTextEl.textContent = `Tiến độ: ${learnedSubCount}/${subCards.length} từ (${subProgress}%)`;
    if (dueStatusEl) {
      if (dueSubCount > 0) {
        dueStatusEl.innerHTML = `<span style="color: #ef4444; font-weight: 700;">⚠️ ${dueSubCount} từ cần ôn</span>`;
      } else if (learnedSubCount === subCards.length && subCards.length > 0) {
        dueStatusEl.innerHTML = `<span style="color: #10b981; font-weight: 600;">✓ Đã hoàn thành</span>`;
      } else if (learnedSubCount > 0) {
        dueStatusEl.innerHTML = `<span style="color: #10b981; font-weight: 600;">Đã học ${learnedSubCount}/${subCards.length} từ</span>`;
      } else {
        dueStatusEl.innerHTML = `<span style="color: var(--text-muted);">Chưa học</span>`;
      }
    }

    // 2. Cập nhật 3 thông số tổng quan
    const statTotal = document.getElementById('subtopic-stat-total');
    const statLearned = document.getElementById('subtopic-stat-learned');
    const statDue = document.getElementById('subtopic-stat-due');
    if (statTotal) statTotal.textContent = subCards.length;
    if (statLearned) statLearned.textContent = learnedSubCount;
    if (statDue) statDue.textContent = dueSubCount;

    // Helper đóng modal
    const closeModal = () => {
      const modal = document.getElementById('subtopic-detail-modal');
      if (modal) modal.classList.remove('active');
    };

    const btnClose = document.getElementById('btn-close-subtopic-modal');
    if (btnClose) btnClose.onclick = closeModal;

    const modal = document.getElementById('subtopic-detail-modal');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
    }

    // 3. Nút Cột 1: Bắt đầu / Tiếp tục học (CTA Chính)
    if (btnStartStudy) {
      const subQueueResult = app.deckManager.getStudyQueue(deckId, app.settings, subtopicName);
      let ctaIcon = '🚀';
      let ctaText = 'Bắt đầu học';

      if (subQueueResult.totalDue > 0) {
        ctaIcon = '⚡';
        ctaText = 'Ôn tập ngay';
      } else if (subQueueResult.totalLearned === subCards.length && subCards.length > 0) {
        ctaIcon = '🔄';
        ctaText = 'Ôn lại';
      } else if (subQueueResult.totalLearned > 0) {
        ctaIcon = '✨';
        ctaText = 'Học tiếp';
      }

      btnStartStudy.innerHTML = `<span>${ctaIcon} ${ctaText}</span>`;

      btnStartStudy.onclick = async () => {
        try {
          closeModal();
          if (app.deckManager && app.deckManager.ensureTopicLoaded) {
            await app.deckManager.ensureTopicLoaded(deckId);
          }
          const queue = app.deckManager.getStudyQueue(deckId, app.settings, subtopicName);
          if (queue.queue && queue.queue.length > 0) {
            app.startStudySession(queue.queue);
          } else {
            app.startStudySession(subCards);
          }
        } catch (err) {
          console.error('Lỗi khi bắt đầu học chủ đề con:', err);
        }
      };
    }

    // 4. Nút Cột 2: Xem danh sách từ vựng
    const btnViewWords = document.getElementById('btn-view-subtopic-words');
    const btnViewWordsText = document.getElementById('btn-view-words-text');
    if (btnViewWordsText) {
      btnViewWordsText.textContent = `📖 Danh sách từ (${subCards.length})`;
    }

    if (btnViewWords) {
      btnViewWords.onclick = async () => {
        try {
          closeModal();
          if (app && typeof app.openSubtopicWordsPage === 'function') {
            await app.openSubtopicWordsPage(deckId, subtopicName);
          }
        } catch (err) {
          console.error('Lỗi khi mở trang từ vựng:', err);
        }
      };
    }
  } catch (err) {
    console.error('Lỗi renderSubtopicDetailPage:', err);
  }
}
