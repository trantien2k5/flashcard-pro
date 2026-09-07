/**
 * Subtopics View (Level 2 Subpage) - Danh sách các chặng / chủ đề con của bộ đề
 */

import { DECK_ENGLISH_NAMES, getSubtopicIcon } from '../constants.js';
import { StorageManager } from '../storage.js';
import { State } from '../fsrs.js';
import { showToast } from '../components/feedback.js';
import { TopicRepository } from '../../data/index.js';
import { escapeHTML, safeColor } from '../utils/helpers.js';
import { openSubtopicDetailPage } from '../components/subtopic-modal.js';

/**
 * Mở trang danh sách chủ đề con (Level 2)
 */
export function openSubtopicsPage(app, deckId) {
  app.currentSubtopicsDeckId = deckId;
  app.switchTab('tab-subtopics');
}

/**
 * Render trang danh sách chủ đề con (Level 2)
 */
export function renderSubtopicsPage(app, deckId) {
  try {
    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const cards = app.deckManager.getCardsByDeckId(deckId);
    const englishTitle = DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title || deck.name;
    const vietnameseTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
    const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
    const deckStats = app.deckManager.getDeckStats(deck.id);
    const learnedCount = deckStats.total - deckStats.newCount;
    const deckColor = safeColor(deck.color);

    // 1. Cập nhật Top Navigation Title & Subtitle
    const topTitleEl = document.getElementById('subpage-top-title');
    const topSubtitleEl = document.getElementById('subpage-top-subtitle');
    if (topTitleEl) topTitleEl.textContent = 'Bộ đề từ vựng';
    if (topSubtitleEl) topSubtitleEl.textContent = 'Tất cả chủ đề';

    const cardStates = StorageManager.getAllCardStates();
    const userProgress = StorageManager.getUserProgress();
    const nowMs = Date.now();
    const isProgressive = deck.isProgressive === true || deck.id === 'toeic-b1';

    const subtopicStatusList = [];

    for (let i = 0; i < rawSubtopics.length; i++) {
      const subObj = rawSubtopics[i];
      const subName = typeof subObj === 'object' ? (subObj.name || subObj.id) : String(subObj);
      const subId = typeof subObj === 'object' ? (subObj.id || `${deck.id}-${i}`) : `${deck.id}-${i}`;
      
      const subCards = app.deckManager.getSubtopicCards(deck.id, subObj);

      let dueSubCount = 0;
      let learnedSubCount = 0;

      for (let j = 0; j < subCards.length; j++) {
        const s = cardStates[subCards[j].id];
        if (s && s.state !== State.New && s.state !== 0) {
          learnedSubCount++;
          if (s.due && Date.parse(s.due) <= nowMs) {
            dueSubCount++;
          }
        }
      }

      const isSubDone = subCards.length > 0 && (learnedSubCount >= subCards.length);
      if (isSubDone) {
        StorageManager.completeSubtopic(subId);
      }

      const isLocked = isProgressive 
        ? !TopicRepository.isSubtopicUnlocked(typeof subObj === 'object' ? subObj : { id: subId, unlockRule: i === 0 ? null : { type: 'completeSubtopic', subtopicId: rawSubtopics[i - 1]?.id } }, userProgress)
        : false;

      subtopicStatusList.push({
        sub: subName,
        subId,
        subObj,
        index: i,
        subCards,
        dueSubCount,
        learnedSubCount,
        subProgress: subCards.length > 0 ? Math.round((learnedSubCount / subCards.length) * 100) : 0,
        isDone: isSubDone,
        isLocked,
        prevSubName: i > 0 ? (typeof rawSubtopics[i - 1] === 'object' ? (rawSubtopics[i - 1].name || rawSubtopics[i - 1].id) : rawSubtopics[i - 1]) : null
      });
    }

    const unlockedSubtopics = subtopicStatusList.filter(s => !s.isLocked);
    const unlockedCards = isProgressive 
      ? subtopicStatusList.filter(s => !s.isLocked).flatMap(s => s.subCards)
      : cards;

    // 2. Render Hero Card Banner tổng quan bộ đề
    const heroContainer = document.getElementById('subpage-hero-container');
    if (heroContainer) {
      let dueBannerHtml = '';
      if (deckStats.dueCount > 0) {
        dueBannerHtml = `<span class="subtopic-badge badge-due">⚠️ ${deckStats.dueCount} cần ôn</span>`;
      } else if (learnedCount === deckStats.total && deckStats.total > 0) {
        dueBannerHtml = `<span class="subtopic-badge badge-done">✓ Đã thuộc</span>`;
      } else if (learnedCount > 0) {
        dueBannerHtml = `<span class="subtopic-badge badge-learning">Đang học (${deckStats.progressPercent}%)</span>`;
      } else {
        dueBannerHtml = `<span class="subtopic-badge badge-new">Chưa học</span>`;
      }

      let pathwayBadgeHtml = '';
      if (isProgressive) {
        pathwayBadgeHtml = `<span class="subtopic-badge badge-learning" style="background: rgba(14, 165, 233, 0.12); color: #0284c7; border: 1px solid rgba(14, 165, 233, 0.3);">🔓 Mở ${unlockedSubtopics.length}/${rawSubtopics.length} chặng</span><span class="tax-bullet">•</span>`;
      }

      const studyQueueResult = app.deckManager.getStudyQueue(deckId, app.settings);
      const totalDue = studyQueueResult.totalDue;
      const totalNew = studyQueueResult.totalNew;
      const totalLearned = studyQueueResult.totalLearned;

      let heroStudyIcon = '🚀';
      let heroStudyText = 'Học toàn bộ';

      if (isProgressive) {
        if (totalDue > 0) {
          heroStudyIcon = '⚡';
          heroStudyText = 'Ôn tập chặng';
        } else if (totalLearned > 0 && totalNew > 0) {
          heroStudyIcon = '✨';
          heroStudyText = 'Học tiếp';
        } else if (totalLearned === 0) {
          heroStudyIcon = '🚀';
          heroStudyText = 'Bắt đầu học';
        } else {
          heroStudyIcon = '🔄';
          heroStudyText = 'Ôn lại';
        }
      } else {
        if (totalDue > 0) {
          heroStudyIcon = '⚡';
          heroStudyText = 'Ôn tập ngay';
        } else if (totalLearned > 0 && totalNew > 0) {
          heroStudyIcon = '✨';
          heroStudyText = 'Học tiếp';
        } else if (totalLearned === 0) {
          heroStudyIcon = '🚀';
          heroStudyText = 'Bắt đầu học';
        } else {
          heroStudyIcon = '🔄';
          heroStudyText = 'Ôn lại toàn bộ';
        }
      }

      heroContainer.innerHTML = `
        <div class="subpage-hero-card">
          <div class="subpage-hero-header">
            <div class="subpage-deck-icon" style="background: ${deckColor}18; color: ${deckColor};">
              ${escapeHTML(deck.icon || '📚')}
            </div>
            <div class="subpage-deck-info">
              <h3 class="subpage-deck-title">${escapeHTML(englishTitle)}</h3>
              ${vietnameseTitle ? `<div class="subpage-vi-title">${escapeHTML(vietnameseTitle)}</div>` : ''}
              <div class="subpage-deck-meta">
                ${pathwayBadgeHtml}
                <span>${rawSubtopics.length} chủ đề con</span>
                <span class="tax-bullet">•</span>
                <span>${deckStats.total} từ vựng</span>
                ${dueBannerHtml ? `<span class="tax-bullet">•</span>${dueBannerHtml}` : ''}
              </div>
            </div>
          </div>
          
          <div class="subpage-hero-progress-section">
            <div class="subpage-deck-footer">
              <span class="subpage-deck-footer-left">Tiến độ: <strong>${learnedCount}/${deckStats.total} từ</strong></span>
              <span class="subpage-deck-footer-right">${deckStats.progressPercent}%</span>
            </div>
            <div class="deck-progress-bar-bg">
              <div class="deck-progress-fill" style="width: ${deckStats.progressPercent}%;"></div>
            </div>
          </div>

          <button type="button" class="btn-primary-hero btn-hero-study" id="btn-hero-study-deck">
            <span>${heroStudyIcon} ${heroStudyText}</span>
          </button>
        </div>
      `;

      const btnHeroStudy = heroContainer.querySelector('#btn-hero-study-deck');
      if (btnHeroStudy) {
        btnHeroStudy.onclick = async () => {
          if (app.deckManager && app.deckManager.ensureTopicLoaded) {
            await app.deckManager.ensureTopicLoaded(deckId);
          }
          if (unlockedCards.length === 0) {
            showToast('Chưa có thẻ nào được mở khóa để học!', 'warning');
            return;
          }
          const currentQueueResult = app.deckManager.getStudyQueue(deckId, app.settings);
          if (currentQueueResult && currentQueueResult.queue && currentQueueResult.queue.length > 0) {
            app.startStudySession(currentQueueResult.queue);
          } else {
            app.startStudySession(unlockedCards);
          }
        };
      }
    }

    // 3. Cập nhật Section Heading
    const headingCount = document.getElementById('subtopics-list-count');
    if (headingCount) {
      headingCount.textContent = `${rawSubtopics.length} chủ đề`;
    }

    // 4. Render danh sách chủ đề con dạng Grid
    const listContainer = document.getElementById('subpage-subtopics-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (subtopicStatusList.length > 0) {
      const fragment = document.createDocumentFragment();

      subtopicStatusList.forEach(sInfo => {
        const { sub, subCards, dueSubCount, learnedSubCount, subProgress, isDone, isLocked, prevSubName } = sInfo;

        const subIcon = isLocked ? '🔒' : getSubtopicIcon(sub, deck.icon || '📖');

        let subBadgeHtml = '';
        if (isLocked) {
          subBadgeHtml = `<span class="subtopic-badge badge-locked">🔒 Khóa</span>`;
        } else if (dueSubCount > 0) {
          subBadgeHtml = `<span class="subtopic-badge badge-due">⚠️ ${dueSubCount} cần ôn</span>`;
        } else if (isDone) {
          subBadgeHtml = `<span class="subtopic-badge badge-done">✓ Đã thuộc</span>`;
        } else if (learnedSubCount > 0) {
          subBadgeHtml = `<span class="subtopic-badge badge-learning">${learnedSubCount}/${subCards.length} từ (${subProgress}%)</span>`;
        } else {
          subBadgeHtml = `<span class="subtopic-badge badge-new">Chưa học</span>`;
        }

        const subCardEl = document.createElement('div');
        subCardEl.className = `subtopic-card-btn${isLocked ? ' locked' : ''}`;
        subCardEl.setAttribute('role', 'button');
        subCardEl.setAttribute('tabindex', '0');
        subCardEl.innerHTML = `
          <div class="subtopic-card-top-row">
            <div class="subtopic-icon-badge" style="background: ${isLocked ? 'rgba(148, 163, 184, 0.12)' : `${deckColor}15`}; color: ${isLocked ? 'var(--text-muted)' : deckColor};">
              ${escapeHTML(subIcon)}
            </div>
            <div class="subtopic-card-info">
              <div class="subtopic-card-title">${escapeHTML(sub)}</div>
              <div class="subtopic-card-meta">
                <span class="subtopic-count-text">${subCards.length} từ</span>
                <span class="tax-bullet">•</span>
                ${subBadgeHtml}
              </div>
            </div>
            <div class="subtopic-card-right">
              <span class="subtopic-stats-fraction">${isLocked ? '' : `${learnedSubCount}/${subCards.length}`}</span>
              <span class="subtopic-chevron" style="${isLocked ? 'color: #f59e0b; font-size: 1.1rem;' : ''}">${isLocked ? '🔒' : '›'}</span>
            </div>
          </div>
          <div class="subtopic-mini-progress-bg">
            <div class="subtopic-mini-progress-fill" style="width: ${isLocked ? 0 : subProgress}%;"></div>
          </div>
        `;

        subCardEl.onclick = () => {
          if (isLocked) {
            subCardEl.classList.remove('shake');
            if (typeof requestAnimationFrame !== 'undefined') {
              requestAnimationFrame(() => subCardEl.classList.add('shake'));
            } else {
              subCardEl.classList.add('shake');
            }
            showToast(`🔒 Chặng này đang khóa! Hãy hoàn thành "${prevSubName || 'chặng trước'}" để mở khóa nhé.`, 'warning');
            return;
          }

          if (app && typeof app.openSubtopicDetailPage === 'function') {
            app.openSubtopicDetailPage(deckId, sub);
          } else {
            openSubtopicDetailPage(app, deckId, sub);
          }
        };

        fragment.appendChild(subCardEl);
      });

      listContainer.appendChild(fragment);
    }
  } catch (err) {
    console.error(`Lỗi renderSubtopicsPage(${deckId}):`, err);
  }
}
