/**
 * Vocabulary Selectors & Deck Management Core
 */

import { StorageManager } from '../services/storage.js';
import { FSRS, State } from './fsrs.js';
import { getLocalDateKey } from '../utils.js';
import { TopicRepository, INITIAL_DECKS, loadTopicWords, loadAllWords } from '../../data/index.js';

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
    // 1. Nạp danh mục các chủ đề hệ thống
    this.decks = INITIAL_DECKS.map(deck => ({ ...deck }));

    // 2. Nạp thêm các bộ thẻ người dùng tự tạo (Custom Decks)
    const customDecks = StorageManager.getCustomDecks();
    this.decks = [...this.decks, ...customDecks];

    // 3. Nạp toàn bộ từ điển từ vựng
    try {
      const allWords = await loadAllWords();
      if (allWords && typeof allWords === 'object') {
        for (const [key, wordData] of Object.entries(allWords)) {
          if (wordData && typeof wordData === 'object') {
            const id = wordData.id || key;
            this.wordsMap.set(key, { ...wordData, id });
            this.wordsMap.set(id, { ...wordData, id });
          }
        }
      }
      this._isAllWordsLoaded = true;
    } catch (e) {
      console.warn('[DeckManager] Lỗi nạp loadAllWords:', e);
    }

    // 4. Khởi tạo và hydrate cấu trúc thẻ cho từng bộ đề
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
    if (!deck || !Array.isArray(deck.wordIds)) return;

    const resolvedCards = deck.wordIds.map(wordId => {
      const wordDef = (wordsDict && wordsDict[wordId]) || this.wordsMap.get(`${deckId}:${wordId}`) || this.wordsMap.get(wordId);
      if (wordDef) {
        return { ...wordDef, id: wordId, deckId: deck.id };
      }
      return { id: wordId, word: wordId, deckId: deck.id };
    });

    this.deckCardsMap.set(deck.id, resolvedCards);
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

  getAllDecks() {
    return this.decks;
  }

  getDeckById(deckId) {
    return this.decks.find(d => d.id === deckId);
  }

  getCardsByDeckId(deckId) {
    return this.deckCardsMap.get(deckId) || [];
  }

  getAllCards() {
    return this.allCards;
  }

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
    if (deckId && this.wordsMap.has(`${deckId}:${cardId}`)) {
      return this.wordsMap.get(`${deckId}:${cardId}`);
    }
    return this.wordsMap.get(cardId) || null;
  }

  /**
   * Tính toán thống kê tiến độ học của một bộ thẻ (New, Learning, Review, Mastered)
   */
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
      const empty = { total: 0, newCount: 0, learningCount: 0, reviewCount: 0, masteredCount: 0, dueCount: 0, progressPercent: 0 };
      return empty;
    }

    const cards = this.getCardsByDeckId(deckId);
    const cardStates = StorageManager.getAllCardStates();
    const nowMs = Date.now();

    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let dueCount = 0;
    let masteredCount = 0;
    let lastStudiedTime = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const state = cardStates[card.id];
      if (!state || state.state === State.New || state.state === 0) {
        newCount++;
      } else {
        if (state.last_review) {
          const t = Date.parse(state.last_review) || 0;
          if (t > lastStudiedTime) lastStudiedTime = t;
        }
        if (state.state === State.Learning || state.state === State.Relearning) {
          learningCount++;
          if (state.due && Date.parse(state.due) <= nowMs) dueCount++;
        } else if (state.state === State.Review) {
          reviewCount++;
          if (state.stability >= 21) {
            masteredCount++;
          }
          if (state.due && Date.parse(state.due) <= nowMs) dueCount++;
        }
      }
    }

    const stats = {
      total: cards.length,
      newCount,
      learningCount,
      reviewCount,
      masteredCount,
      dueCount,
      lastStudiedTime,
      progressPercent: cards.length > 0 ? Math.round(((cards.length - newCount) / cards.length) * 100) : 0
    };

    this._statsCache.set(deckId, stats);
    return stats;
  }

  /**
   * Lấy danh sách thẻ ưu tiên thông minh theo thuật toán FSRS
   */
  getStudyQueue(deckId = null, settings = {}, subtopic = null) {
    const cardStates = StorageManager.getAllCardStates();
    let targetCards = [];

    if (deckId && subtopic) {
      targetCards = this.getSubtopicCards(deckId, subtopic);
    } else if (deckId) {
      const deck = this.getDeckById(deckId);
      const isProgressive = deck && deck.isProgressive === true;
      if (isProgressive) {
        const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
        const userProgress = StorageManager.getUserProgress();
        const unlockedCards = [];
        for (let i = 0; i < rawSubtopics.length; i++) {
          const subObj = rawSubtopics[i];
          const subId = typeof subObj === 'object' ? (subObj.id || `${deck.id}-${i}`) : `${deck.id}-${i}`;
          const isLocked = !TopicRepository.isSubtopicUnlocked(
            typeof subObj === 'object' ? subObj : { id: subId, unlockRule: i === 0 ? null : { type: 'completeSubtopic', subtopicId: rawSubtopics[i - 1]?.id } },
            userProgress
          );
          if (!isLocked) {
            unlockedCards.push(...this.getSubtopicCards(deckId, subObj));
          }
        }
        targetCards = unlockedCards.length > 0 ? unlockedCards : this.getCardsByDeckId(deckId);
      } else {
        targetCards = this.getCardsByDeckId(deckId);
      }
    } else {
      targetCards = this.allCards;
    }

    // Đảm bảo không bao giờ có thẻ trùng lặp ID trong danh sách học
    const seenTargetIds = new Set();
    const uniqueTargetCards = [];
    for (const c of targetCards) {
      if (c && c.id && !seenTargetIds.has(c.id)) {
        seenTargetIds.add(c.id);
        uniqueTargetCards.push(c);
      }
    }
    targetCards = uniqueTargetCards;

    const now = new Date();
    const dueCards = [];
    const newCards = [];
    const learningCards = [];
    const masteredCards = [];

    for (const card of targetCards) {
      const hydratedCard = this.wordsMap.get(`${card.deckId || deckId}:${card.id}`) || this.wordsMap.get(card.id) || card;
      const state = cardStates[card.id];

      if (!state || state.state === State.New || state.state === 0) {
        newCards.push({ ...hydratedCard, fsrsState: state || FSRS.createEmptyCard(card.id) });
      } else {
        const dueDate = new Date(state.due);
        if (dueDate <= now) {
          dueCards.push({ ...hydratedCard, fsrsState: state });
        } else if (state.stability >= 21) {
          masteredCards.push({ ...hydratedCard, fsrsState: state });
        } else {
          learningCards.push({ ...hydratedCard, fsrsState: state });
        }
      }
    }

    // 1. Sắp xếp thẻ đến hạn
    dueCards.sort((a, b) => new Date(a.fsrsState.due) - new Date(b.fsrsState.due));

    // 2. Tính hạn mức từ mới
    let maxNew = settings.dailyNewLimit || 10;
    if (!deckId && !subtopic) {
      const logs = StorageManager.getStudyLogs();
      const todayKey = getLocalDateKey();
      const newCardsStudiedToday = logs.filter(l => 
        l.timestamp && getLocalDateKey(l.timestamp) === todayKey && (l.oldState === State.New || l.oldState === 0)
      ).length;
      maxNew = Math.max(0, maxNew - newCardsStudiedToday);
    } else {
      maxNew = Math.max(10, settings.dailyNewLimit || 10);
    }

    const maxReview = settings.dailyReviewLimit || 50;
    const selectedDue = dueCards.slice(0, maxReview);
    const selectedNew = newCards.slice(0, maxNew);

    let queue = [];
    if (subtopic) {
      // Khi học theo chặng/chủ đề con cụ thể (10 từ): Ưu tiên thẻ đến hạn trước, sau đó là thẻ mới, rồi đến thẻ đang học/thuần thục
      const seenIds = new Set();
      queue = [];
      for (const card of [...selectedDue, ...selectedNew, ...learningCards, ...targetCards]) {
        if (card && card.id && !seenIds.has(card.id)) {
          seenIds.add(card.id);
          queue.push({
            ...(this.wordsMap.get(`${card.deckId || deckId}:${card.id}`) || this.wordsMap.get(card.id) || card),
            fsrsState: cardStates[card.id] || FSRS.createEmptyCard(card.id)
          });
        }
      }
    } else if (selectedDue.length > 0) {
      queue = selectedDue;
    } else if (selectedNew.length > 0) {
      queue = selectedNew;
    } else if (learningCards.length > 0) {
      queue = learningCards.slice(0, 10);
    } else if (targetCards.length > 0) {
      queue = targetCards.map(c => ({
        ...(this.wordsMap.get(`${c.deckId || deckId}:${c.id}`) || this.wordsMap.get(c.id) || c),
        fsrsState: cardStates[c.id] || FSRS.createEmptyCard(c.id)
      })).slice(0, 10);
    }

    return {
      dueCards: selectedDue,
      newCards: selectedNew,
      learningCards,
      totalDue: dueCards.length,
      totalNew: newCards.length,
      totalLearned: targetCards.length - newCards.length,
      totalCards: targetCards.length,
      queue
    };
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
      category: "Tự tạo",
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
