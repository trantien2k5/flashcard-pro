/**
 * Library View State, Full-Text RAM Index, Filtering & Sorting Engine
 */

import { StorageManager } from '../../services/storage.js';
import { State, isCardDue } from '../../core/fsrs.js';
import { MASTERY_STABILITY_THRESHOLD } from '../../config.js';

const CEFR_ORDER = { a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 6 };

// Trạng thái bộ lọc và tìm kiếm cục bộ của Thư viện (bảo toàn khi chuyển tab)
export const libState = {
  searchQuery: '',
  selectedCefr: 'all',        // all, a1, a2, b1, b2, c1
  selectedPos: 'all',         // all, noun, verb, adjective, adverb, phrase, phrasal verb, idiom, preposition
  selectedStatus: 'all',      // all, due, new, learning, leech, hard, mastered
  selectedDeck: 'all',        // all, or any deck/topic id
  sortBy: 'due_asc',          // due_asc, due_desc, alpha_asc, alpha_desc, cefr_asc, cefr_desc, stability_desc, stability_asc, difficulty_desc
  pageSize: 20,               // 20, 50, 100
  currentPage: 1
};

// RAM Search Index Cache (Tối ưu sub-millisecond filtering)
let _searchIndexCache = null;
let _searchIndexSourceLength = 0;

function buildSearchIndex(allCards) {
  if (_searchIndexCache && _searchIndexSourceLength === allCards.length) {
    return _searchIndexCache;
  }
  _searchIndexSourceLength = allCards.length;
  _searchIndexCache = allCards.map(c => ({
    id: c.id,
    card: c,
    wordLower: (c.word || '').toLowerCase(),
    meaningLower: (c.meaning || '').toLowerCase(),
    ipaLower: (c.ipa || c.phonetic || '').toLowerCase(),
    defLower: (c.definition || c.def || '').toLowerCase(),
    exampleLower: (c.example || '').toLowerCase(),
    exampleViLower: (c.exampleVi || '').toLowerCase(),
    levelLower: (c.level || c.cefr || 'a1').toLowerCase(),
    posLower: (c.pos || '').toLowerCase(),
    topicIds: Array.isArray(c.topicIds) ? c.topicIds : []
  }));
  return _searchIndexCache;
}

/**
 * Đặt lại toàn bộ bộ lọc thư viện về mặc định
 */
export function resetLibFilters() {
  libState.searchQuery = '';
  libState.selectedCefr = 'all';
  libState.selectedPos = 'all';
  libState.selectedStatus = 'all';
  libState.selectedDeck = 'all';
  libState.sortBy = 'due_asc';
  libState.currentPage = 1;
}

/**
 * Kiểm tra xem có bộ lọc nào khác mặc định đang hoạt động không
 */
export function isFilterActive() {
  return Boolean(
    libState.searchQuery ||
    libState.selectedCefr !== 'all' ||
    libState.selectedPos !== 'all' ||
    libState.selectedStatus !== 'all' ||
    libState.selectedDeck !== 'all' ||
    libState.sortBy !== 'due_asc'
  );
}

/**
 * Rút gọn nhãn từ loại POS để hiển thị gọn trên bảng
 */
export function formatShortPos(pos) {
  if (!pos) return '';
  const p = String(pos).toLowerCase().trim();
  if (p === 'noun' || p === 'n') return 'n.';
  if (p === 'verb' || p === 'v') return 'v.';
  if (p === 'adjective' || p === 'adj' || p === 'a') return 'adj.';
  if (p === 'adverb' || p === 'adv') return 'adv.';
  if (p === 'phrasal verb' || p === 'phrasal') return 'phr v.';
  if (p === 'phrase') return 'phr.';
  if (p === 'idiom') return 'idiom';
  if (p === 'preposition' || p === 'prep') return 'prep.';
  return p;
}

function matchesPosFilter(posLower, posFilter) {
  if (posFilter === 'noun') return posLower.includes('noun') || posLower === 'n';
  if (posFilter === 'verb') return (posLower.includes('verb') && !posLower.includes('phrasal')) || posLower === 'v';
  if (posFilter === 'adjective' || posFilter === 'adj') return posLower.includes('adj') || posLower.includes('adjective') || posLower === 'a';
  if (posFilter === 'adverb' || posFilter === 'adv') return posLower.includes('adv') || posLower.includes('adverb');
  if (posFilter === 'phrase') return (posLower.includes('phrase') || posLower.includes('idiom') || posLower.includes('expression')) && !posLower.includes('phrasal');
  if (posFilter === 'phrasal verb' || posFilter === 'phrasal') return posLower.includes('phrasal');
  if (posFilter === 'idiom') return posLower.includes('idiom');
  if (posFilter === 'preposition' || posFilter === 'prep') return posLower.includes('prep');
  return posLower.includes(posFilter);
}

/**
 * Lọc và sắp xếp danh sách từ vựng theo State hiện hành
 */
export function getFilteredAndSortedCards(app) {
  if (!app.deckManager) return [];
  const allCards = app.deckManager.getAllCards();
  const searchIndex = buildSearchIndex(allCards);

  const now = new Date();
  const query = libState.searchQuery.toLowerCase();
  const cefrFilter = libState.selectedCefr.toLowerCase();
  const posFilter = libState.selectedPos.toLowerCase();
  const statusFilter = libState.selectedStatus;
  const deckFilter = libState.selectedDeck;

  const filtered = [];

  for (let i = 0; i < searchIndex.length; i++) {
    const item = searchIndex[i];
    const c = item.card;

    if (deckFilter !== 'all') {
      const inDeck = item.topicIds.some(tid => tid === deckFilter || tid.startsWith(deckFilter)) ||
                     (c.deckId && (c.deckId === deckFilter || c.deckId.startsWith(deckFilter)));
      if (!inDeck) continue;
    }

    if (cefrFilter !== 'all' && item.levelLower !== cefrFilter) continue;

    if (posFilter !== 'all' && !matchesPosFilter(item.posLower, posFilter)) continue;

    if (statusFilter !== 'all') {
      const state = StorageManager.getCardState(c.id);
      const isNew = !state || state.state === 0 || state.state === State.New;
      const isDue = isCardDue(state, now);
      const s = state ? (Number(state.stability) || 0) : 0;
      const isLeech = state ? Boolean(state.isLeech === true || (state.lapses && state.lapses >= 8)) : false;

      if (statusFilter === 'due' && !isDue) continue;
      if (statusFilter === 'new' && !isNew) continue;
      if (statusFilter === 'learning' && (isNew || s >= MASTERY_STABILITY_THRESHOLD)) continue;
      if (statusFilter === 'mastered' && (isNew || s < MASTERY_STABILITY_THRESHOLD)) continue;
      if ((statusFilter === 'leech' || statusFilter === 'hard') && (isNew || !isLeech)) continue;
    }

    if (query) {
      const match = item.wordLower.includes(query) ||
                    item.meaningLower.includes(query) ||
                    item.ipaLower.includes(query) ||
                    item.defLower.includes(query) ||
                    item.exampleLower.includes(query) ||
                    item.exampleViLower.includes(query);
      if (!match) continue;
    }

    filtered.push(c);
  }

  filtered.sort((a, b) => {
    const stateA = StorageManager.getCardState(a.id);
    const stateB = StorageManager.getCardState(b.id);

    if (libState.sortBy === 'due_asc') {
      const isDueA = isCardDue(stateA, now) ? 1 : 0;
      const isDueB = isCardDue(stateB, now) ? 1 : 0;
      if (isDueA !== isDueB) return isDueB - isDueA;
      const dueA = stateA?.due ? new Date(stateA.due).getTime() : Infinity;
      const dueB = stateB?.due ? new Date(stateB.due).getTime() : Infinity;
      return dueA - dueB;
    }
    if (libState.sortBy === 'due_desc') {
      const dueA = stateA?.due ? new Date(stateA.due).getTime() : 0;
      const dueB = stateB?.due ? new Date(stateB.due).getTime() : 0;
      return dueB - dueA;
    }
    if (libState.sortBy === 'cefr_asc') {
      const orderA = CEFR_ORDER[(a.cefr || a.level || 'a1').toLowerCase()] || 1;
      const orderB = CEFR_ORDER[(b.cefr || b.level || 'a1').toLowerCase()] || 1;
      return orderA - orderB;
    }
    if (libState.sortBy === 'cefr_desc') {
      const orderA = CEFR_ORDER[(a.cefr || a.level || 'a1').toLowerCase()] || 1;
      const orderB = CEFR_ORDER[(b.cefr || b.level || 'a1').toLowerCase()] || 1;
      return orderB - orderA;
    }
    if (libState.sortBy === 'stability_desc') {
      return (stateB?.stability || 0) - (stateA?.stability || 0);
    }
    if (libState.sortBy === 'stability_asc') {
      return (stateA?.stability || 0) - (stateB?.stability || 0);
    }
    if (libState.sortBy === 'difficulty_desc') {
      return (stateB?.difficulty || 0) - (stateA?.difficulty || 0);
    }
    if (libState.sortBy === 'alpha_desc') {
      return (b.word || '').localeCompare(a.word || '');
    }
    return (a.word || '').localeCompare(b.word || '');
  });

  return filtered;
}

