/**
 * User Progress, Custom Decks, TOEIC Test History, Pinned Topics, Profile & Preferences
 */

import { STORES } from './idb.js';
import { STORAGE_KEYS, storageCache, putToIdb } from './state.js';

// ==========================================
// TOEIC MINI TEST HISTORY MANAGEMENT
// ==========================================

export function saveToeicTestResult(testResult) {
  try {
    const history = getToeicTestHistory();
    const entry = {
      id: `toeic_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      ...testResult
    };
    history.unshift(entry);
    if (history.length > 50) history.pop();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOEIC_TESTS, JSON.stringify(history));
    }
    return entry;
  } catch (e) {
    console.error('Error saving TOEIC test result:', e);
    return null;
  }
}

export function getToeicTestHistory() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TOEIC_TESTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading TOEIC test history:', e);
    return [];
  }
}

// ==========================================
// USER PROGRESS & SUBTOPIC UNLOCK MANAGEMENT
// ==========================================

export function getUserProgress() {
  if (storageCache.userProgress !== null) return storageCache.userProgress;
  try {
    if (typeof localStorage === 'undefined') return { id: 'global_progress', completedSubtopics: [] };
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    storageCache.userProgress = data ? JSON.parse(data) : { id: 'global_progress', completedSubtopics: [] };
    return storageCache.userProgress;
  } catch (e) {
    console.error('Error reading user progress:', e);
    return { id: 'global_progress', completedSubtopics: [] };
  }
}

export function saveUserProgress(progress) {
  try {
    storageCache.userProgress = { ...progress, id: 'global_progress' };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(storageCache.userProgress));
    }
    putToIdb(STORES.USER_PROGRESS, storageCache.userProgress);
  } catch (e) {
    console.error('Error saving user progress:', e);
  }
}

export function completeSubtopic(subtopicId) {
  if (!subtopicId) return;
  const progress = getUserProgress();
  if (!Array.isArray(progress.completedSubtopics)) {
    progress.completedSubtopics = [];
  }
  if (!progress.completedSubtopics.includes(subtopicId)) {
    progress.completedSubtopics.push(subtopicId);
    saveUserProgress(progress);
  }
}

export function isSubtopicCompleted(subtopicId) {
  if (!subtopicId) return false;
  const progress = getUserProgress();
  return Array.isArray(progress.completedSubtopics) && progress.completedSubtopics.includes(subtopicId);
}

// ==========================================
// PINNED TOPICS (GHIM CHỦ ĐỀ YÊU THÍCH)
// ==========================================

export function getPinnedTopicIds() {
  const progress = getUserProgress();
  if (!Array.isArray(progress.pinnedTopics)) {
    progress.pinnedTopics = [];
  }
  return progress.pinnedTopics;
}

export function isTopicPinned(topicId) {
  if (!topicId) return false;
  const pinned = getPinnedTopicIds();
  return pinned.includes(topicId);
}

export function togglePinTopic(topicId) {
  if (!topicId) return false;
  const progress = getUserProgress();
  if (!Array.isArray(progress.pinnedTopics)) {
    progress.pinnedTopics = [];
  }
  const idx = progress.pinnedTopics.indexOf(topicId);
  let isPinned = false;
  if (idx >= 0) {
    progress.pinnedTopics.splice(idx, 1);
    isPinned = false;
  } else {
    progress.pinnedTopics.push(topicId);
    isPinned = true;
  }
  saveUserProgress(progress);
  return isPinned;
}

// ==========================================
// CUSTOM DECKS
// ==========================================

export function getCustomDecks() {
  if (storageCache.customDecks !== null) return storageCache.customDecks;
  try {
    if (typeof localStorage === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_DECKS);
    storageCache.customDecks = data ? JSON.parse(data) : [];
    return storageCache.customDecks;
  } catch (e) {
    console.error('Error reading custom decks:', e);
    return [];
  }
}

export function saveCustomDeck(deck) {
  try {
    const decks = getCustomDecks();
    const index = decks.findIndex(d => d.id === deck.id);
    if (index >= 0) {
      decks[index] = deck;
    } else {
      decks.push(deck);
    }
    storageCache.customDecks = decks;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(decks));
    }
    putToIdb(STORES.CUSTOM_DECKS, deck);
  } catch (e) {
    console.error('Error saving custom deck:', e);
  }
}

export function deleteCustomDeck(deckId) {
  try {
    let decks = getCustomDecks();
    decks = decks.filter(d => d.id !== deckId);
    storageCache.customDecks = decks;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DECKS, JSON.stringify(decks));
    }
    if (storageCache.dbPromise) {
      storageCache.dbPromise.then(db => {
        try {
          const tx = db.transaction(STORES.CUSTOM_DECKS, 'readwrite');
          tx.objectStore(STORES.CUSTOM_DECKS).delete(deckId);
        } catch (e) {}
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error deleting custom deck:', e);
  }
}

// ==========================================
// USER PROFILE & PERSONALIZATION PREFERENCES
// ==========================================

export function getUserProfile() {
  if (typeof localStorage === 'undefined') {
    return { name: 'Học Viên Flashcard Pro', avatar: '🎓' };
  }
  try {
    return {
      name: localStorage.getItem('fc_pro_user_name') || 'Học Viên Flashcard Pro',
      avatar: localStorage.getItem('fc_pro_user_avatar') || '🎓'
    };
  } catch (e) {
    return { name: 'Học Viên Flashcard Pro', avatar: '🎓' };
  }
}

export function saveUserProfile(profile) {
  if (typeof localStorage === 'undefined' || !profile) return;
  try {
    if (profile.name) localStorage.setItem('fc_pro_user_name', String(profile.name).trim().slice(0, 50));
    if (profile.avatar) localStorage.setItem('fc_pro_user_avatar', String(profile.avatar).trim().slice(0, 10));
  } catch (e) {
    console.warn('Error saving user profile:', e);
  }
}

export function getUserPreferences() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const studyDisplay = localStorage.getItem('study_display_prefs');
    const studyAutoplay = localStorage.getItem('study_autoplay_prefs');
    const inlineDisplay = localStorage.getItem('inline_flashcard_display_prefs');
    const pinnedDecks = localStorage.getItem('fc_pro_pinned_decks');
    const searchHistory = localStorage.getItem('flashcard_search_history_v2');

    return {
      studyDisplay: studyDisplay ? JSON.parse(studyDisplay) : null,
      studyAutoplay: studyAutoplay ? JSON.parse(studyAutoplay) : null,
      inlineDisplay: inlineDisplay ? JSON.parse(inlineDisplay) : null,
      pinnedDecks: pinnedDecks ? JSON.parse(pinnedDecks) : null,
      searchHistory: searchHistory ? JSON.parse(searchHistory) : null
    };
  } catch (e) {
    return {};
  }
}

export function saveUserPreferences(prefs) {
  if (typeof localStorage === 'undefined' || !prefs) return;
  try {
    if (prefs.studyDisplay) localStorage.setItem('study_display_prefs', JSON.stringify(prefs.studyDisplay));
    if (prefs.studyAutoplay) localStorage.setItem('study_autoplay_prefs', JSON.stringify(prefs.studyAutoplay));
    if (prefs.inlineDisplay) localStorage.setItem('inline_flashcard_display_prefs', JSON.stringify(prefs.inlineDisplay));
    if (Array.isArray(prefs.pinnedDecks)) localStorage.setItem('fc_pro_pinned_decks', JSON.stringify(prefs.pinnedDecks));
    if (Array.isArray(prefs.searchHistory)) localStorage.setItem('flashcard_search_history_v2', JSON.stringify(prefs.searchHistory));
  } catch (e) {
    console.warn('Error saving user preferences:', e);
  }
}

