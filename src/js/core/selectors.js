/**
 * Vocabulary Selectors & Deck Management Core (Barrel Facade)
 */

import { StorageManager } from '../services/storage.js';
import { INITIAL_DECKS, loadTopicWords, loadAllWords, WORDS_MAP, LEGACY_ID_MAP, getWordsByTopic } from '../../data/index.js';
import {
  selectDueCards,
  selectWeakWords,
  selectAttentionCards,
  computeDeckStats
} from './selectors/deck-stats.js';
import {
  buildStudyQueue,
  computeStudyModeCounts
} from './selectors/study-queue.js';

export class DeckManager {
  constructor() {
    this.decks = [];
    this.deckCardsMap = new Map();
    this.wordsMap = new Map(); // O(1) Global Words Dictionary Map
    this.allCards = [];
    this.loadedDecks = new Set();
    this._isAllWordsLoaded = false;
    this._statsCache = new Map();
    this._statsRevision = 0;
  }

  /**
   * Khởi tạo danh mục Decks và nạp từ vựng sẵn sàng
   */
  async init() {
    this.decks = INITIAL_DECKS.map(deck => ({ ...deck }));

    const customDecks = StorageManager.getCustomDecks();
    this.decks = [...this.decks, ...customDecks];

    try {
      if (WORDS_MAP instanceof Map) {
        for (const [id, wordData] of WORDS_MAP.entries()) {
          this.wordsMap.set(id, wordData);
          if (wordData && wordData.word && !this.wordsMap.has(wordData.word)) {
            this.wordsMap.set(wordData.word, wordData);
          }
        }
      }
      this._isAllWordsLoaded = true;
    } catch (e) {
      console.warn('[DeckManager] Lỗi nạp loadAllWords:', e);
    }

    this.deckCardsMap.clear();
    for (const deck of this.decks) {
      if (Array.isArray(deck.wordIds)) {
        this.hydrateDeckCards(deck.id);
        this.loadedDecks.add(deck.id);
      } else if (Array.isArray(deck.cards)) {
        const customCards = deck.cards.map(c => {
          const cardObj = { ...c, deckId: deck.id };
          this.wordsMap.set(c.id, cardObj);
          return cardObj;
        });
        this.deckCardsMap.set(deck.id, customCards);
        this.loadedDecks.add(deck.id);
      }
    }

    this.rebuildAllCardsList();
    return this.decks;
  }

  /**
   * Nạp ngầm toàn bộ từ vựng vào Map O(1)
   */
  async preloadAllWordsInBackground() {
    if (this._isAllWordsLoaded) return;
    try {
      const allWords = await loadAllWords();
      if (allWords && typeof allWords === 'object') {
        for (const [key, wordData] of Object.entries(allWords)) {
          const id = wordData.id || key;
          this.wordsMap.set(key, { ...wordData, id });
          this.wordsMap.set(id, { ...wordData, id });
        }
      }
      this._isAllWordsLoaded = true;
      for (const deck of this.decks) {
        if (Array.isArray(deck.wordIds)) {
          this.hydrateDeckCards(deck.id);
        }
      }
      this.rebuildAllCardsList();
    } catch (e) {
      console.warn('[DeckManager] Lỗi preloadAllWordsInBackground:', e);
    }
  }

  /**
   * Đảm bảo từ vựng của một chủ đề đã được nạp đầy đủ (On-Demand / Lazy Load)
   */
  async ensureTopicLoaded(deckId) {
    if (this.loadedDecks.has(deckId)) {
      this.hydrateDeckCards(deckId);
      return;
    }
    try {
      const words = await loadTopicWords(deckId);
      if (Array.isArray(words)) {
        for (const item of words) {
          if (item && item.id) {
            const wordObj = { ...item, deckId };
            this.wordsMap.set(item.id, wordObj);
            this.wordsMap.set(`${deckId}:${item.id}`, wordObj);
          }
        }
      } else if (words && typeof words === 'object') {
        for (const [wordId, wordData] of Object.entries(words)) {
          const id = wordData.id || wordId;
          const wordObj = { id, ...wordData, deckId };
          this.wordsMap.set(id, wordObj);
          this.wordsMap.set(`${deckId}:${id}`, wordObj);
        }
      }
      this.hydrateDeckCards(deckId, words);
      this.loadedDecks.add(deckId);
      this.rebuildAllCardsList();
    } catch (e) {
      console.error(`[DeckManager] Lỗi nạp dữ liệu cho chủ đề ${deckId}:`, e);
    }
  }

  /**
   * Hydrate danh sách thẻ của một deck từ wordsMap
   */
  hydrateDeckCards(deckId, wordsDict = null) {
    const deck = this.getDeckById(deckId);
    if (!deck) return;

    if (Array.isArray(deck.wordIds) && deck.wordIds.length > 0) {
      const resolvedCards = deck.wordIds.map(wordId => {
        const wordDef = (wordsDict && wordsDict[wordId]) || this.wordsMap.get(`${deckId}:${wordId}`) || this.wordsMap.get(wordId);
        return wordDef ? { ...wordDef, id: wordId, deckId: deck.id } : { id: wordId, word: wordId, deckId: deck.id };
      });
      this.deckCardsMap.set(deck.id, resolvedCards);
      return;
    }

    if (Array.isArray(deck.cards) && deck.cards.length > 0) {
      const resolvedCards = deck.cards.map(c => {
        const wordDef = (wordsDict && wordsDict[c.id]) || this.wordsMap.get(`${deckId}:${c.id}`) || this.wordsMap.get(c.id) || c;
        return { ...wordDef, id: c.id, deckId: deck.id };
      });
      this.deckCardsMap.set(deck.id, resolvedCards);
      return;
    }

    const topicWords = getWordsByTopic(deckId);
    if (Array.isArray(topicWords) && topicWords.length > 0) {
      const resolvedCards = topicWords.map(w => {
        const wordDef = (wordsDict && wordsDict[w.id]) || this.wordsMap.get(`${deckId}:${w.id}`) || this.wordsMap.get(w.id) || w;
        return { ...wordDef, id: w.id, deckId: deck.id };
      });
      this.deckCardsMap.set(deck.id, resolvedCards);
    }
  }

  rebuildAllCardsList() {
    this.allCards = [];
    const seenIds = new Set();
    for (const [, cards] of this.deckCardsMap.entries()) {
      for (const card of cards) {
        if (card && card.id && !seenIds.has(card.id)) {
          seenIds.add(card.id);
          this.allCards.push(card);
        }
      }
    }
  }

  getAllDecks() { return this.decks; }
  getDeckById(deckId) { return this.decks.find(d => d.id === deckId); }

  getCardsByDeckId(deckId) {
    let cards = this.deckCardsMap.get(deckId);
    if (!cards || cards.length === 0) {
      this.hydrateDeckCards(deckId);
      cards = this.deckCardsMap.get(deckId);
    }
    if (!cards || cards.length === 0) {
      const topicWords = getWordsByTopic(deckId);
      if (Array.isArray(topicWords) && topicWords.length > 0) {
        cards = topicWords.map(w => ({ ...w, deckId }));
        this.deckCardsMap.set(deckId, cards);
      }
    }
    return cards || [];
  }

  getDeckCards(deckId) { return this.getCardsByDeckId(deckId); }
  getAllCards() { return this.allCards; }
  getAllWords() { return this.allCards; }

  /**
   * Lấy danh sách thẻ từ vựng đầy đủ của một chủ đề con (Subtopic)
   */
  getSubtopicCards(deckId, subtopicIdentifier) {
    const deck = this.getDeckById(deckId);
    if (!deck) return [];

    const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
    const cleanIdent = typeof subtopicIdentifier === 'string' ? subtopicIdentifier.trim() : '';
    const cleanIdentNoNum = cleanIdent.replace(/^\d+\.\s*/, '').toLowerCase();

    const subObj = typeof subtopicIdentifier === 'object' && subtopicIdentifier !== null
      ? subtopicIdentifier
      : rawSubtopics.find(s => {
          if (typeof s === 'string') {
            return s === subtopicIdentifier || s.replace(/^\d+\.\s*/, '').toLowerCase() === cleanIdentNoNum;
          }
          if (typeof s === 'object' && s) {
            const sName = (s.name || '').trim();
            const sNameNoNum = sName.replace(/^\d+\.\s*/, '').toLowerCase();
            return s.id === subtopicIdentifier || sName === cleanIdent || sNameNoNum === cleanIdentNoNum;
          }
          return false;
        });

    if (subObj && typeof subObj === 'object' && Array.isArray(subObj.wordIds) && subObj.wordIds.length > 0) {
      return subObj.wordIds.map(id => {
        const card = this.wordsMap.get(`${deckId}:${id}`) || this.wordsMap.get(id);
        if (card && (card.meaning || card.word !== id)) {
          return { ...card, id, deckId };
        }
        const deckCard = (this.deckCardsMap.get(deckId) || []).find(c => c.id === id);
        if (deckCard && (deckCard.meaning || deckCard.word !== id)) {
          return { ...deckCard, id, deckId };
        }
        return card || deckCard || { id, word: id, deckId };
      });
    }

    const subName = (typeof subObj === 'object' && subObj ? subObj.name : subtopicIdentifier);
    const allCards = this.getCardsByDeckId(deckId);
    return allCards.filter(c => c.subtopic === subName);
  }

  /**
   * Tra cứu thẻ từ vựng O(1) tức thời theo wordId
   */
  getCardById(cardId, deckId = null) {
    if (!cardId) return null;
    const resolvedId = (LEGACY_ID_MAP && LEGACY_ID_MAP[cardId]) || cardId;
    if (deckId && this.wordsMap.has(`${deckId}:${resolvedId}`)) {
      return this.wordsMap.get(`${deckId}:${resolvedId}`);
    }
    if (this.wordsMap.has(resolvedId)) {
      return this.wordsMap.get(resolvedId);
    }
    if (deckId && this.wordsMap.has(`${deckId}:${cardId}`)) {
      return this.wordsMap.get(`${deckId}:${cardId}`);
    }
    return this.wordsMap.get(cardId) || null;
  }

  invalidateStatsCache() {
    this._statsCache.clear();
    this._statsRevision = StorageManager.getStateRevision();
  }

  getDueCards(deckId = null) {
    return selectDueCards({
      deckCardsMap: this.deckCardsMap,
      allCards: this.allCards,
      wordsMap: this.wordsMap,
      deckId
    });
  }

  getWeakWords(limit = 10) {
    return selectWeakWords({
      allCards: this.allCards,
      wordsMap: this.wordsMap,
      limit
    });
  }

  getAttentionCards(deckId = null) {
    return selectAttentionCards({
      deckCardsMap: this.deckCardsMap,
      allCards: this.allCards,
      wordsMap: this.wordsMap,
      deckId
    });
  }

  getDeckStats(deckId) {
    const rev = StorageManager.getStateRevision();
    if (this._statsRevision !== rev) {
      this._statsCache.clear();
      this._statsRevision = rev;
    }

    if (this._statsCache.has(deckId)) {
      return this._statsCache.get(deckId);
    }

    const deck = this.getDeckById(deckId);
    if (!deck) {
      return { total: 0, newCount: 0, learningCount: 0, reviewCount: 0, masteredCount: 0, dueCount: 0, leechCount: 0, suspendedCount: 0, progressPercent: 0 };
    }

    const cards = this.getCardsByDeckId(deckId);
    const stats = computeDeckStats(cards);
    this._statsCache.set(deckId, stats);
    return stats;
  }

  getStudyQueue(deckId = null, userSettings = {}, subtopic = null, options = {}) {
    return buildStudyQueue(this, deckId, userSettings, subtopic, options);
  }

  getStudyModeCounts(deckId = null, userSettings = {}) {
    return computeStudyModeCounts(this, deckId, userSettings);
  }

  /**
   * Tìm kiếm từ vựng độc nhất theo từ khóa
   */
  searchCards(query) {
    if (!query || !query.trim()) return this.allCards;
    const q = query.toLowerCase().trim();
    const matches = [];
    const sourceCards = this.allCards.length > 0 ? this.allCards : Array.from(new Set(this.wordsMap.values()));
    for (let i = 0; i < sourceCards.length; i++) {
      const card = sourceCards[i];
      if (
        (card.word && card.word.toLowerCase().includes(q)) ||
        (card.meaning && card.meaning.toLowerCase().includes(q)) ||
        (card.definition && card.definition.toLowerCase().includes(q)) ||
        (card.phonetic && card.phonetic.toLowerCase().includes(q)) ||
        (card.example && card.example.toLowerCase().includes(q))
      ) {
        matches.push(card);
      }
    }
    return matches;
  }

  /**
   * Tạo bộ từ vựng tùy chỉnh mới
   */
  createCustomDeck(title, description, icon = '📚', color = '#8b5cf6', cards = []) {
    const id = `custom-${Date.now()}`;
    const newDeck = {
      id,
      title,
      description,
      category: 'Tự tạo',
      icon,
      color,
      cards,
      isCustom: true
    };
    StorageManager.saveCustomDeck(newDeck);
    this.decks.push(newDeck);
    this.deckCardsMap.set(id, cards);
    this.rebuildAllCardsList();
    return newDeck;
  }
}
