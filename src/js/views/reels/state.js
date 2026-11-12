/**
 * Reels (Facebook-Style Vocabulary Feed) State & Local Persistence
 */

export const REELS_BATCH_SIZE = 12;

export const DEFAULT_REELS_FILTER = {
  level: 'all',     // 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  topicId: 'all',   // 'all' | topicId
  status: 'mixed',  // 'mixed' | 'due' | 'new' | 'bookmarked' | 'hard'
  autoAudio: true,  // Tự động phát âm khi lướt
  blurMeaning: false // Che nghĩa tiếng Việt mặc định
};

export const reelsState = {
  app: null,
  queue: [],
  feedContainer: null,
  mainContentEl: null,
  renderedCount: 0,
  filter: { ...DEFAULT_REELS_FILTER },
  likedWordIds: new Set(),
  bookmarkedWordIds: new Set(),
  wordComments: {},
  activeObserver: null,
  scrollTimeout: null,
  speechDebounceTimer: null,
  lastSpokenWordId: null,
  scrollBound: false,
  keysBound: false,
  onBatchNeeded: null,
  onEscapeCloseModal: null
};

export function getMainContentEl() {
  if (!reelsState.mainContentEl || !reelsState.mainContentEl.isConnected) {
    reelsState.mainContentEl = document.getElementById('main-content');
  }
  return reelsState.mainContentEl;
}

export function loadUserInteractions() {
  try {
    const rawLiked = localStorage.getItem('fb_liked_word_ids');
    if (rawLiked) reelsState.likedWordIds = new Set(JSON.parse(rawLiked));
  } catch (e) {
    reelsState.likedWordIds = new Set();
  }

  try {
    const rawBm = localStorage.getItem('fb_bookmarked_ids') || localStorage.getItem('reels_bookmarked_ids');
    if (rawBm) reelsState.bookmarkedWordIds = new Set(JSON.parse(rawBm));
  } catch (e) {
    reelsState.bookmarkedWordIds = new Set();
  }

  try {
    const rawCm = localStorage.getItem('fb_word_comments');
    if (rawCm) reelsState.wordComments = JSON.parse(rawCm);
  } catch (e) {
    reelsState.wordComments = {};
  }

  try {
    const rawFilter = localStorage.getItem('fb_feed_filter_v2');
    if (rawFilter) {
      const parsed = JSON.parse(rawFilter);
      reelsState.filter = { ...reelsState.filter, ...parsed };
    }
  } catch (e) {}
}

export function saveUserInteractions() {
  try {
    localStorage.setItem('fb_liked_word_ids', JSON.stringify([...reelsState.likedWordIds]));
    localStorage.setItem('fb_bookmarked_ids', JSON.stringify([...reelsState.bookmarkedWordIds]));
    localStorage.setItem('fb_word_comments', JSON.stringify(reelsState.wordComments));
    localStorage.setItem('fb_feed_filter_v2', JSON.stringify(reelsState.filter));
  } catch (e) {}
}

