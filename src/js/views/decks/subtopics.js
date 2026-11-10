/**
 * Subtopics View Controller (Levels 2 & 3: Subtopics List & Subtopic Detail Modal)
 * Quản lý trang danh sách các chủ đề nhánh con (Subtopics) và Popup Modal chi tiết chặng học.
 */

import { DECK_ENGLISH_NAMES, getSubtopicIcon, getSubtopicColor } from '../../config.js';
import { StorageManager } from '../../services/storage.js';
import { State, isCardDue } from '../../core/fsrs.js';
import { TopicRepository } from '../../../data/index.js';
import { escapeHTML, safeColor, scrollToTop } from '../../utils.js';
import { showToast } from '../components.js';
import { openSubtopicWordsPage } from './words.js';

export function renderSubtopicsPageShell(tabPane) {
  if (!tabPane) return;
  if (!tabPane.querySelector('.yt-subpage-header')) {
    tabPane.innerHTML = `
      <div class="yt-subpage-header">
        <button id="btn-back-to-decks" class="yt-back-btn" title="Quay lại danh mục (Esc)" aria-label="Quay lại">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div class="yt-subpage-title-wrap">
          <h2 class="yt-header-title" id="subpage-top-title">Chủ đề</h2>
          <span class="yt-header-subtitle" id="subpage-top-subtitle">0 phần • 0 từ vựng</span>
        </div>
      </div>

      <div class="subpage-content-body">
        <div id="subpage-hero-container"></div>
        <div class="subtopics-section-header">
          <h3 class="subtopics-section-title">Danh sách phần học</h3>
          <span class="subtopics-section-meta" id="subtopics-list-count">0 phần</span>
        </div>
        <div class="subtopics-list-container" id="subpage-subtopics-list"></div>
      </div>
    `;
  }
}

export function openSubtopicsPage(app, deckId) {
  app.currentSubtopicsDeckId = deckId;
  app.switchTab('tab-subtopics');
  scrollToTop();
}

export function renderSubtopicsPage(app, deckId) {
  try {
    const tabPane = document.getElementById('tab-subtopics');
    if (!tabPane) return;
    renderSubtopicsPageShell(tabPane);

    const btnBack = document.getElementById('btn-back-to-decks');
    if (btnBack && !btnBack._bound) {
      btnBack._bound = true;
      btnBack.onclick = () => app.switchTab(app.previousTab || 'tab-decks');
    }

    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const cards = app.deckManager.getCardsByDeckId(deckId);
    const englishTitle = deck.titleEn || deck.nameEn || DECK_ENGLISH_NAMES[deck.id] || deck.title || deck.name;
    const vietnameseTitle = deck.name || (deck.title && deck.title !== englishTitle ? deck.title : (deck.description || ''));
    const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
    const deckStats = app.deckManager.getDeckStats(deck.id);
    const learnedCount = deckStats.total - deckStats.newCount;
    const deckColor = safeColor(deck.color);

    const topTitleEl = document.getElementById('subpage-top-title');
    const topSubtitleEl = document.getElementById('subpage-top-subtitle');
    if (topTitleEl) topTitleEl.textContent = englishTitle;
    if (topSubtitleEl) topSubtitleEl.textContent = `${rawSubtopics.length} phần • ${deckStats.total} từ vựng`;

    const headingCount = document.getElementById('subtopics-list-count');
    if (headingCount) headingCount.textContent = `${rawSubtopics.length} phần`;

    const userProgress = StorageManager.getUserProgress();
    const isProgressive = deck.isProgressive === true;

    // 1. Render Hero Banner
    const heroContainer = document.getElementById('subpage-hero-container');
    if (heroContainer) {
      heroContainer.innerHTML = `
        <div class="subpage-hero-card">
          <div class="subpage-hero-header">
            <div class="subpage-deck-icon" style="background: ${deckColor}22; color: ${deckColor}; border: 1px solid ${deckColor}44;">
              <span>${deck.icon || '📚'}</span>
            </div>
            <div class="subpage-deck-info">
              <h2 class="subpage-deck-title">${escapeHTML(englishTitle)}</h2>
              <p class="subpage-vi-title">${escapeHTML(vietnameseTitle)}</p>
              <div class="subpage-deck-meta">
                <span>${rawSubtopics.length} phần</span>
                <span>•</span>
                <span>${deckStats.total} từ vựng</span>
                ${deckStats.dueCount > 0 ? `<span>•</span><span style="color: #ef4444; font-weight: 700;">${deckStats.dueCount} cần ôn</span>` : ''}
              </div>
            </div>
          </div>

          <div class="subpage-hero-progress-section">
            <div class="deck-progress-bar-bg">
              <div class="deck-progress-fill" style="width: ${deckStats.progressPercent}%; background: ${deckColor};"></div>
            </div>
            <div class="subpage-deck-footer">
              <span class="subpage-deck-footer-left">Đã học: <strong>${learnedCount}</strong>/${deckStats.total} từ</span>
              <span class="subpage-deck-footer-right">${deckStats.progressPercent}%</span>
            </div>
          </div>

          <button class="btn-hero-study" id="btn-hero-study-deck">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>${deckStats.dueCount > 0 ? 'Ôn tập ngay' : 'Bắt đầu học'}</span>
          </button>
        </div>
      `;

      const btnHeroStudy = heroContainer.querySelector('#btn-hero-study-deck');
      if (btnHeroStudy) {
        btnHeroStudy.onclick = () => {
          app.startStudySession(deck.id, null, null, { mode: deckStats.dueCount > 0 ? 'due_only' : 'new_only' });
        };
      }
    }

    // 2. Render Subtopics Cards
    const subtopicsContainer = document.getElementById('subpage-subtopics-list');
    if (subtopicsContainer) {
      subtopicsContainer.innerHTML = '';
      const frag = document.createDocumentFragment();

      let prevSubDone = true;

      for (let i = 0; i < rawSubtopics.length; i++) {
        const subObj = rawSubtopics[i];
        const subName = typeof subObj === 'object' ? (subObj.name || subObj.id) : String(subObj);
        const subId = typeof subObj === 'object' ? (subObj.id || `${deck.id}-${i}`) : `${deck.id}-${i}`;
        const subCards = app.deckManager.getSubtopicCards(deck.id, subObj);

        // Chuẩn hóa tên hiển thị: "Phần X: [Tên chủ đề]"
        const cleanTitle = subName.replace(/^\d+[\.:\s-]+/, '').trim();
        const displayTitle = `Phần ${i + 1}: ${cleanTitle || subName}`;

        let dueSubCount = 0;
        let learnedSubCount = 0;

        for (let j = 0; j < subCards.length; j++) {
          const s = StorageManager.getCardState(subCards[j].id);
          if (s && s.state !== State.New && s.state !== 0) {
            learnedSubCount++;
            if (isCardDue(s, new Date())) dueSubCount++;
          }
        }

        const isSubDone = subCards.length > 0 && (learnedSubCount >= subCards.length);
        const percent = subCards.length > 0 ? Math.round((learnedSubCount / subCards.length) * 100) : 0;
        const icon = (typeof subObj === 'object' && subObj.icon) ? subObj.icon : getSubtopicIcon(subObj || subName, deck.icon || '📖', i);
        const subColor = (typeof subObj === 'object' && subObj.color) ? safeColor(subObj.color) : getSubtopicColor(subObj || subName, deckColor, i);

        if (isSubDone) {
          StorageManager.completeSubtopic(subId);
          if (typeof subObj === 'object' && subObj.id) StorageManager.completeSubtopic(subObj.id);
          if (subName) StorageManager.completeSubtopic(subName);
          StorageManager.completeSubtopic(`${deck.id}-${i}`);
        }

        let isUnlocked = true;
        if (isProgressive && i > 0) {
          const unlockRule = typeof subObj === 'object' && subObj.unlockRule 
            ? subObj.unlockRule 
            : { type: 'completeSubtopic', subtopicId: rawSubtopics[i - 1]?.id || `${deck.id}-${i - 1}` };
          
          isUnlocked = prevSubDone || TopicRepository.isSubtopicUnlocked({ id: subId, unlockRule }, userProgress);
        }

        prevSubDone = isSubDone || StorageManager.isSubtopicCompleted(subId) || 
                      (typeof subObj === 'object' && subObj.id && StorageManager.isSubtopicCompleted(subObj.id));

        const card = document.createElement('div');
        card.className = `subtopic-card-btn ${!isUnlocked ? 'locked' : ''} ${isSubDone ? 'completed' : ''}`;
        card.dataset.subtopicId = subId;

        let badgeHtml = `<span class="subtopic-badge">Phần ${i + 1}</span>`;
        if (!isUnlocked) {
          badgeHtml = `<span class="subtopic-badge badge-locked">🔒 Đang khóa</span>`;
        } else if (isSubDone) {
          badgeHtml = `<span class="subtopic-badge badge-done">✓ Hoàn thành</span>`;
        } else if (dueSubCount > 0) {
          badgeHtml = `<span class="subtopic-badge badge-due">⚠️ ${dueSubCount} cần ôn</span>`;
        } else if (learnedSubCount > 0) {
          badgeHtml = `<span class="subtopic-badge badge-learning">${percent}%</span>`;
        }

        card.innerHTML = `
          <div class="subtopic-card-top-row">
            <div class="subtopic-icon-badge" style="background: ${subColor}18; color: ${subColor}; border: 1px solid ${subColor}33;">
              <span>${icon}</span>
            </div>
            <div class="subtopic-card-info">
              <h4 class="subtopic-card-title">${escapeHTML(displayTitle)}</h4>
              <div class="subtopic-card-meta">
                <span class="subtopic-count-text">${subCards.length} từ vựng</span>
                <span class="subtopic-meta-dot">•</span>
                <span class="subtopic-learned-text">Đã học ${learnedSubCount}/${subCards.length}</span>
              </div>
            </div>
            <div class="subtopic-card-right">
              ${badgeHtml}
              <div class="subtopic-chevron">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </div>
          ${percent > 0 ? `
          <div class="subtopic-card-progress">
            <div class="deck-progress-bar-bg">
              <div class="deck-progress-fill" style="width: ${percent}%; background: ${subColor};"></div>
            </div>
          </div>` : ''}
        `;

        card.onclick = () => {
          if (!isUnlocked) {
            navigator.vibrate?.(25);
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 400);
            showToast('Phần này đang bị khóa, hãy hoàn thành phần trước đó!', 'warning');
            return;
          }
          navigator.vibrate?.(8);
          openSubtopicDetailPage(app, deck.id, subName);
        };

        frag.appendChild(card);
      }

      subtopicsContainer.appendChild(frag);
    }

  } catch (err) {
    console.error('Lỗi renderSubtopicsPage:', err);
  }
}

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

export async function renderSubtopicDetailPage(app, deckId, subtopicName) {
  try {
    if (app.deckManager && app.deckManager.ensureTopicLoaded) {
      await app.deckManager.ensureTopicLoaded(deckId);
    }
    const deck = app.deckManager.getDeckById(deckId);
    if (!deck) return;

    const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
    const subObj = rawSubtopics.find(s => (typeof s === 'object' ? (s.name === subtopicName || s.id === subtopicName) : s === subtopicName));
    const subCards = app.deckManager.getSubtopicCards(deckId, subtopicName);
    const subIcon = (subObj && subObj.icon) ? subObj.icon : getSubtopicIcon(subtopicName, deck.icon || '📖');

    const dueSubCount = subCards.filter(c => {
      const s = StorageManager.getCardState(c.id);
      return isCardDue(s, new Date());
    }).length;

    const learnedSubCount = subCards.filter(c => {
      const s = StorageManager.getCardState(c.id);
      return s && s.state !== State.New && s.state !== 0;
    }).length;

    const subProgress = subCards.length > 0 ? Math.round((learnedSubCount / subCards.length) * 100) : 0;

    const iconEl = document.getElementById('subtopic-detail-icon');
    const titleEl = document.getElementById('subtopic-detail-title');
    const metaEl = document.getElementById('subtopic-detail-meta');
    const progressEl = document.getElementById('subtopic-detail-progress-fill');
    const progressTextEl = document.getElementById('subtopic-detail-progress-text');
    const countLearnedEl = document.getElementById('subtopic-stat-learned') || document.getElementById('subtopic-detail-count-learned');
    const countDueEl = document.getElementById('subtopic-stat-due') || document.getElementById('subtopic-detail-count-due');
    const countTotalEl = document.getElementById('subtopic-stat-total') || document.getElementById('subtopic-detail-count-total');

    const subIndex = rawSubtopics.findIndex(s => (typeof s === 'object' ? (s.name === subtopicName || s.id === subtopicName) : s === subtopicName));
    const cleanDetailTitle = subtopicName.replace(/^\d+[\.:\s-]+/, '').trim();
    const displayDetailTitle = subIndex >= 0 ? `Phần ${subIndex + 1}: ${cleanDetailTitle || subtopicName}` : subtopicName;

    if (iconEl) iconEl.textContent = subIcon;
    if (titleEl) titleEl.textContent = displayDetailTitle;
    if (metaEl) metaEl.textContent = `${subCards.length} từ vựng • ${DECK_ENGLISH_NAMES[deck.id] || deck.titleEn || deck.title}`;
    if (progressEl) progressEl.style.width = `${subProgress}%`;
    if (progressTextEl) progressTextEl.textContent = `Tiến độ: ${learnedSubCount}/${subCards.length} từ (${subProgress}%)`;
    if (countLearnedEl) countLearnedEl.textContent = learnedSubCount;
    if (countDueEl) countDueEl.textContent = dueSubCount;
    if (countTotalEl) countTotalEl.textContent = subCards.length;

    const btnStudyModal = document.getElementById('btn-start-subtopic-study') || document.getElementById('btn-modal-study-subtopic');
    if (btnStudyModal) {
      if (dueSubCount > 0) {
        btnStudyModal.textContent = `⚡ Ôn tập ${dueSubCount} từ`;
      } else if (learnedSubCount < subCards.length) {
        btnStudyModal.textContent = `🚀 Học ${subCards.length - learnedSubCount} từ mới`;
      } else {
        btnStudyModal.textContent = `✓ Đã hoàn thành phần này`;
      }

      btnStudyModal.onclick = () => {
        const modal = document.getElementById('subtopic-detail-modal');
        if (modal) modal.classList.remove('active');
        if (dueSubCount > 0) {
          app.startStudySession(deckId, subtopicName, null, { mode: 'due_only' });
        } else if (learnedSubCount < subCards.length) {
          app.startStudySession(deckId, subtopicName, null, { mode: 'new_only' });
        } else {
          openSubtopicWordsPage(app, deckId, subtopicName);
        }
      };
    }

    const btnViewWordsModal = document.getElementById('btn-view-subtopic-words') || document.getElementById('btn-modal-view-words');
    if (btnViewWordsModal) {
      btnViewWordsModal.onclick = () => {
        const modal = document.getElementById('subtopic-detail-modal');
        if (modal) modal.classList.remove('active');
        openSubtopicWordsPage(app, deckId, subtopicName);
      };
    }

    const btnClose = document.getElementById('btn-close-subtopic-modal') || document.getElementById('btn-close-subtopic-detail');
    if (btnClose) {
      btnClose.onclick = () => {
        const modal = document.getElementById('subtopic-detail-modal');
        if (modal) modal.classList.remove('active');
      };
    }
  } catch (err) {
    console.error('Lỗi renderSubtopicDetailPage:', err);
  }
}
