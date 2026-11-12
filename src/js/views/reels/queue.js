/**
 * Reels Smart Queue Builder & FSRS-6 Rating Handler
 */

import { FSRS, Rating, State, isCardDue } from '../../core/fsrs.js';
import { StorageManager } from '../../services/storage.js';
import { WORDS, WORDS_MAP } from '../../../data/index.js';
import { shuffle } from '../../utils.js';
import { spawnFloatingReaction } from './templates.js';
import { reelsState } from './state.js';

/**
 * Xây dựng hàng đợi bảng tin từ vựng thông minh theo bộ lọc FSRS/CEFR/Topic
 */
export function buildSmartFeedQueue(filter = reelsState.filter) {
  const allWords = Array.isArray(WORDS) && WORDS.length > 0 ? WORDS : [];
  const cardStates = StorageManager.getAllCardStates() || {};
  const now = new Date();

  let filtered = allWords;
  if (filter.level && filter.level !== 'all') {
    const targetLvl = filter.level.toUpperCase();
    filtered = filtered.filter(w => (w.level || '').toUpperCase() === targetLvl);
  }

  if (filter.topicId && filter.topicId !== 'all') {
    filtered = filtered.filter(w => Array.isArray(w.topicIds) && w.topicIds.some(t => t.startsWith(filter.topicId)));
  }

  const dueList = [];
  const newList = [];
  const reviewList = [];
  const bookmarkedList = [];
  const hardList = [];

  for (let i = 0; i < filtered.length; i++) {
    const word = filtered[i];
    const state = cardStates[word.id] || StorageManager.getCardState(word.id);

    if (state && state.suspended && filter.status !== 'hard') continue;

    if (reelsState.bookmarkedWordIds.has(word.id)) {
      bookmarkedList.push({ ...word, fsrsState: state });
    }

    const isNew = (!state || state.state === State.New || state.state === 0) &&
                  (!state || !state.reps || state.reps === 0);

    if (isNew) {
      newList.push({ ...word, fsrsState: state || FSRS.createEmptyCard(word.id) });
    } else if (isCardDue(state, now)) {
      dueList.push({ ...word, fsrsState: state });
    } else {
      reviewList.push({ ...word, fsrsState: state });
    }

    if (state && (state.lapses >= 3 || state.difficulty >= 7)) {
      hardList.push({ ...word, fsrsState: state });
    }
  }

  shuffle(newList);
  shuffle(dueList);
  shuffle(reviewList);
  shuffle(bookmarkedList);
  shuffle(hardList);

  let result = [];

  if (filter.status === 'due') {
    result = dueList.length > 0 ? dueList : reviewList;
  } else if (filter.status === 'new') {
    result = newList.length > 0 ? newList : filtered;
  } else if (filter.status === 'bookmarked') {
    result = bookmarkedList.length > 0 ? bookmarkedList : filtered;
  } else if (filter.status === 'hard') {
    result = hardList.length > 0 ? hardList : dueList;
  } else {
    let d = 0;
    let n = 0;
    let r = 0;
    while (d < dueList.length || n < newList.length || r < reviewList.length) {
      if (d < dueList.length) result.push(dueList[d++]);
      if (n < newList.length) result.push(newList[n++]);
      if (d < dueList.length) result.push(dueList[d++]);
      if (r < reviewList.length) result.push(reviewList[r++]);
      if (result.length >= 250) break;
    }
    if (result.length === 0) {
      result = [...filtered];
      shuffle(result);
    }
  }

  return result.length > 0 ? result : allWords.slice(0, 30);
}

/**
 * Xử lý đánh giá FSRS-6 trực tiếp trên thẻ bài viết Newsfeed
 */
export function handleRateCardFSRS(cardId, rating, sourceEl) {
  const card = WORDS_MAP.get(cardId);
  if (!card) return;

  if (sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    const emojis = { [Rating.Again]: '❌', [Rating.Hard]: '⏳', [Rating.Good]: '✨', [Rating.Easy]: '💎' };
    spawnFloatingReaction(rect.left + rect.width / 2, rect.top, emojis[rating] || '✨');
  }

  try {
    navigator.vibrate?.(rating === Rating.Again ? 25 : 12);
  } catch (e) {}

  try {
    const appSettings = reelsState.app?.settings;
    const fsrs = new FSRS({
      w: appSettings?.fsrsW,
      requestRetention: appSettings?.requestRetention || 0.90,
      enableFuzz: appSettings?.enableFuzz !== false,
      leechThreshold: appSettings?.leechThreshold || 8,
      leechAction: appSettings?.leechAction || 'suspend'
    });

    const { nextState } = StorageManager.applyCardReview({
      card,
      rating,
      fsrsInstance: fsrs,
      settings: appSettings,
      now: new Date(),
      logExtra: { isReels: true }
    });

    const postEl = document.getElementById(`fb-post-${card.id}`);
    if (postEl) {
      const metaSpan = postEl.querySelector('.fb-post-meta span:first-child');
      if (metaSpan) {
        metaSpan.textContent = `Đã ôn ${nextState.reps} lần • Độ bền: ${Math.round(nextState.stability * 10) / 10}d`;
      }
      postEl.style.transition = 'box-shadow 0.25s ease';
      postEl.style.boxShadow = '0 0 0 2px var(--fb-primary)';
      setTimeout(() => {
        postEl.style.boxShadow = '';
      }, 600);
    }

    const label = rating === 1 ? 'Again' : rating === 2 ? 'Hard' : rating === 3 ? 'Good' : 'Easy';
    reelsState.app?.showToast(`Đã ghi nhận FSRS: ${label}`, 'success', 1200);
  } catch (err) {
    console.warn('Lỗi ghi nhận FSRS trong FB Feed:', err);
  }
}

