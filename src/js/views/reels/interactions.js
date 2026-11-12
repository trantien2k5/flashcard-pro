/**
 * Reels Viewport Observer, Scroll Preloading & Post Interactions Delegation
 */

import { WORDS_MAP } from '../../../data/index.js';
import { escapeHTML } from '../../utils.js';
import { speak, preloadWordAudio } from '../../services/audio.js';
import { preloadCardImage } from '../../core/session.js';
import { spawnFloatingReaction } from './templates.js';
import { reelsState, getMainContentEl, saveUserInteractions } from './state.js';
import { handleRateCardFSRS } from './queue.js';

function handleCardInView(card) {
  if (!card || card.id === reelsState.lastSpokenWordId) return;

  preloadWordAudio(card.word, 'us', card);
  if (card.img) preloadCardImage(card.img);

  if (reelsState.filter.autoAudio) {
    if (reelsState.speechDebounceTimer) clearTimeout(reelsState.speechDebounceTimer);
    reelsState.speechDebounceTimer = setTimeout(() => {
      reelsState.lastSpokenWordId = card.id;
      speak(card.word, { accent: 'us', cardObj: card });
    }, 280);
  }
}

/**
 * Phát âm bài viết nằm chính giữa màn hình sau khi dừng lướt (Scroll Settled)
 */
export function checkAndPronounceCenterCard() {
  const reelsTab = document.getElementById('tab-reels');
  if (!reelsTab || !reelsTab.classList.contains('active')) return;
  if (!reelsState.feedContainer || !reelsState.filter.autoAudio) return;

  const centerY = window.innerHeight / 2;
  const cards = reelsState.feedContainer.querySelectorAll('.fb-post-card');
  let closestCard = null;
  let minDistance = Infinity;

  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect();
    if (rect.bottom < 40 || rect.top > window.innerHeight - 40) continue;
    const cardCenter = rect.top + rect.height / 2;
    const dist = Math.abs(cardCenter - centerY);
    if (dist < minDistance) {
      minDistance = dist;
      closestCard = cards[i];
    }
  }

  if (closestCard) {
    const cardId = closestCard.getAttribute('data-id');
    const card = WORDS_MAP.get(cardId);
    if (card && card.id !== reelsState.lastSpokenWordId) {
      reelsState.lastSpokenWordId = card.id;
      speak(card.word, { accent: 'us', cardObj: card });
    }
  }
}

export function setupFeedIntersectionObserver() {
  if (reelsState.activeObserver) {
    reelsState.activeObserver.disconnect();
  }

  reelsState.activeObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
        const cardId = entry.target.getAttribute('data-id');
        const card = WORDS_MAP.get(cardId);
        if (card) {
          handleCardInView(card);
        }
      }
    }
  }, {
    root: null,
    threshold: 0.55
  });

  if (reelsState.feedContainer) {
    const cards = reelsState.feedContainer.querySelectorAll('.fb-post-card');
    cards.forEach(card => reelsState.activeObserver.observe(card));
  }
}

function handleFeedClick(e) {
  const target = e.target;
  const postCard = target.closest('.fb-post-card');
  if (!postCard) return;

  const cardId = postCard.getAttribute('data-id');
  const card = WORDS_MAP.get(cardId);
  if (!card) return;

  // 1. Đánh giá FSRS-6
  const ratingBtn = target.closest('[data-rating]');
  if (ratingBtn) {
    e.stopPropagation();
    const rating = parseInt(ratingBtn.getAttribute('data-rating'), 10);
    handleRateCardFSRS(cardId, rating, ratingBtn);
    return;
  }

  const actionEl = target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.getAttribute('data-action');

  if (action === 'speak-word-us') {
    e.stopPropagation();
    const usBtn = postCard.querySelector('.fb-btn-accent-audio:first-child');
    usBtn?.classList.add('is-playing');
    speak(card.word, {
      accent: 'us',
      cardObj: card,
      onEnd: () => usBtn?.classList.remove('is-playing')
    });
    setTimeout(() => usBtn?.classList.remove('is-playing'), 1200);
  } else if (action === 'speak-word-uk') {
    e.stopPropagation();
    const ukBtn = postCard.querySelector('.fb-btn-accent-audio:last-child');
    ukBtn?.classList.add('is-playing');
    speak(card.word, {
      accent: 'uk',
      cardObj: card,
      onEnd: () => ukBtn?.classList.remove('is-playing')
    });
    setTimeout(() => ukBtn?.classList.remove('is-playing'), 1200);
  } else if (action === 'speak-example') {
    e.stopPropagation();
    if (card.example) speak(card.example);
  } else if (action === 'toggle-meaning-blur') {
    e.stopPropagation();
    postCard.querySelector('.fb-meaning-box')?.classList.toggle('is-blurred');
  } else if (action === 'toggle-like') {
    e.stopPropagation();
    const isNowLiked = !reelsState.likedWordIds.has(card.id);
    const rect = actionEl.getBoundingClientRect();
    const likeCountText = postCard.querySelector('.fb-like-count-text');

    if (isNowLiked) {
      reelsState.likedWordIds.add(card.id);
      actionEl.classList.add('is-liked');
      spawnFloatingReaction(rect.left + rect.width / 2, rect.top, '👍');
      if (likeCountText) likeCountText.textContent = 'Bạn và 2.5K người khác';
    } else {
      reelsState.likedWordIds.delete(card.id);
      actionEl.classList.remove('is-liked');
      if (likeCountText) likeCountText.textContent = '2.5K người khác';
    }
    saveUserInteractions();
  } else if (action === 'toggle-bookmark') {
    e.stopPropagation();
    const isNowBookmarked = !reelsState.bookmarkedWordIds.has(card.id);
    if (isNowBookmarked) {
      reelsState.bookmarkedWordIds.add(card.id);
      actionEl.classList.add('is-bookmarked');
      actionEl.querySelector('svg')?.setAttribute('fill', 'currentColor');
      reelsState.app?.showToast(`⭐ Đã lưu từ "${card.word}" vào mục Yêu thích`, 'success', 1500);
    } else {
      reelsState.bookmarkedWordIds.delete(card.id);
      actionEl.classList.remove('is-bookmarked');
      actionEl.querySelector('svg')?.setAttribute('fill', 'none');
      reelsState.app?.showToast(`Đã bỏ lưu từ "${card.word}"`, 'info', 1200);
    }
    saveUserInteractions();
  } else if (action === 'share-word') {
    e.stopPropagation();
    const shareText = `📚 Từ vựng: ${card.word} (${card.pos || ''})\nPhiên âm: ${card.ipa || ''}\nNghĩa: ${card.meaning}\nVí dụ: ${card.example || ''}\n(Học trên Flashcard English Pro)`;
    if (navigator.share) {
      navigator.share({
        title: `Từ vựng tiếng Anh: ${card.word}`,
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText).then(() => {
        reelsState.app?.showToast('📋 Đã sao chép nội dung từ vựng vào bộ nhớ tạm!', 'success', 2000);
      });
    }
  } else if (action === 'toggle-comments') {
    e.stopPropagation();
    const drawer = postCard.querySelector('.fb-comments-drawer');
    if (drawer) {
      const isOpen = drawer.classList.toggle('is-open');
      if (isOpen) drawer.querySelector('.fb-comment-input')?.focus();
    }
  } else if (action === 'submit-comment') {
    e.stopPropagation();
    const drawer = postCard.querySelector('.fb-comments-drawer');
    const input = drawer?.querySelector('.fb-comment-input');
    const text = input?.value?.trim();
    if (text) {
      if (!reelsState.wordComments[card.id]) reelsState.wordComments[card.id] = [];
      reelsState.wordComments[card.id].push(text);
      saveUserInteractions();

      const list = drawer.querySelector('.fb-comment-list');
      if (list) {
        const item = document.createElement('div');
        item.className = 'fb-comment-item';
        item.innerHTML = `
          <div class="fb-comment-avatar">Me</div>
          <div class="fb-comment-bubble">
            <div class="fb-comment-author">Ghi chú của bạn</div>
            <div>${escapeHTML(text)}</div>
          </div>
        `;
        list.appendChild(item);
      }

      input.value = '';
      const countEl = postCard.querySelector('.fb-comment-count-text');
      if (countEl) countEl.textContent = `${reelsState.wordComments[card.id].length} ghi chú`;
      reelsState.app?.showToast('💬 Đã lưu ghi chú vào từ vựng!', 'success', 1500);
    }
  } else if (action === 'open-post-menu') {
    e.stopPropagation();
    const selected = window.confirm(`Tùy chọn cho từ "${card.word}":\n- Bấm OK để nghe phát âm tốc độ chậm (0.8x)\n- Bấm Cancel để đóng.`);
    if (selected) {
      speak(card.word, { speechRate: 0.8, cardObj: card });
    }
  }
}

export function bindFeedInteractions() {
  const container = reelsState.feedContainer;
  if (!container || container._hasEvents) return;

  container._hasEvents = true;
  container.addEventListener('click', handleFeedClick);
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = e.target.closest('.fb-comment-input');
      if (input) {
        e.preventDefault();
        const drawer = input.closest('.fb-comments-drawer');
        drawer?.querySelector('[data-action="submit-comment"]')?.click();
      }
    }
  });
}

/**
 * Gắn listener cuộn rAF & Escape modal 1 lần duy nhất cho toàn phiên Reels
 */
export function bindScrollAndKeyboard({ onBatchNeeded, onEscapeCloseModal }) {
  reelsState.onBatchNeeded = onBatchNeeded;
  reelsState.onEscapeCloseModal = onEscapeCloseModal;

  if (!reelsState.scrollBound) {
    reelsState.scrollBound = true;
    let isScrollTicking = false;
    let scrollIdleTimer = null;

    const handleScroll = () => {
      const reelsTab = document.getElementById('tab-reels');
      if (!reelsTab || !reelsTab.classList.contains('active')) return;

      if (reelsState.speechDebounceTimer) {
        clearTimeout(reelsState.speechDebounceTimer);
        reelsState.speechDebounceTimer = null;
      }

      if (!isScrollTicking) {
        isScrollTicking = true;
        requestAnimationFrame(() => {
          const mainEl = getMainContentEl();
          const scrollPos = mainEl ? mainEl.scrollTop : (window.scrollY || 0);
          const scrollHeight = mainEl ? mainEl.scrollHeight : (document.documentElement.scrollHeight || 0);
          const clientHeight = mainEl ? mainEl.clientHeight : window.innerHeight;

          const btnScrollTop = document.getElementById('fb-btn-scroll-top');
          if (btnScrollTop) {
            btnScrollTop.classList.toggle('is-visible', scrollPos > 350);
          }

          if (scrollHeight - (scrollPos + clientHeight) < 750) {
            reelsState.onBatchNeeded?.();
          }

          isScrollTicking = false;
        });
      }

      if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(() => {
        checkAndPronounceCenterCard();
      }, 260);
    };

    const scrollTarget = getMainContentEl() || window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    if (scrollTarget !== window) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  }

  if (!reelsState.keysBound) {
    reelsState.keysBound = true;
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('fb-filter-modal');
        if (modal && modal.classList.contains('is-open')) {
          reelsState.onEscapeCloseModal?.();
        }
      }
    });
  }
}

