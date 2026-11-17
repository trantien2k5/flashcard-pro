/**
 * Spotlight Search Submodule: Search History & Hot Context Tags
 */

const SEARCH_HISTORY_KEY = 'flashcard_search_history_v2';
const MAX_HISTORY_ITEMS = 8;

export const HOT_SEARCH_TAGS = [
  { label: '💼 Business & Work', query: 'work' },
  { label: '🗣️ Giao tiếp (B1)', query: 'b1' },
  { label: '✈️ Du lịch (Travel)', query: 'travel' },
  { label: '💰 Tài chính & Tiền', query: 'money' },
  { label: '🎯 Nâng cao (C1/C2)', query: 'c1' },
  { label: '🍔 Ăn uống (Food)', query: 'food' },
  { label: '🩺 Sức khỏe (Health)', query: 'health' }
];

export function getSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveSearchHistory(history) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
  } catch (e) {}
}

export function addQueryToHistory(query) {
  const q = query.trim();
  if (!q || q.length < 2) return;
  let history = getSearchHistory();
  history = history.filter(item => item.toLowerCase() !== q.toLowerCase());
  history.unshift(q);
  saveSearchHistory(history);
}

export function removeQueryFromHistory(query) {
  let history = getSearchHistory();
  history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
  saveSearchHistory(history);
}

export function clearSearchHistory() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (e) {}
}
