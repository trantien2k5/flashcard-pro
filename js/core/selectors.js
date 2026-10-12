/**
 * Vocabulary Selectors & Deck Management Core
 */

import { StorageManager } from '../services/storage.js';
import { FSRS, State, isCardDue } from './fsrs.js';
import { MASTERY_STABILITY_THRESHOLD, STUDY_MODES, getLearningGoal } from '../config.js';
import { getLocalDateKey } from '../utils.js';
import { TopicRepository, INITIAL_DECKS, loadTopicWords, loadAllWords, WORDS_MAP } from '../../data/index.js';

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

    // 3. Nạp toàn bộ từ điển từ vựng (O(1) Direct Reference)
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

  getAllWords() {
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
   * Làm mới cache thống kê khi có thay đổi trạng thái hoặc chuyển tab
   */
  invalidateStatsCache() {
    this._statsCache.clear();
    this._statsRevision = StorageManager.getStateRevision();
  }

  /**
   * Lấy danh sách thẻ tới hạn cần ôn tập (Bỏ qua thẻ bị tạm dừng)
   */
  getDueCards(deckId = null) {
    const allDeckCards = deckId ? (this.deckCardsMap.get(deckId) || []) : this.allCards;
    const now = new Date();
    const dueCards = [];

    for (const card of allDeckCards) {
      const state = StorageManager.getCardState(card.id);
      if (state && state.suspended === true) continue; // Bỏ qua thẻ đã tạm dừng
      if (isCardDue(state, now)) {
        dueCards.push({
          ...(this.wordsMap.get(`${card.deckId || deckId}:${card.id}`) || this.wordsMap.get(card.id) || card),
          fsrsState: state
        });
      }
    }
    return dueCards;
  }

  /**
   * Lấy danh sách từ vựng yếu / hay quên nhất ("Bệnh Án Từ Vựng")
   * Tiêu chí: Từng bị quên lapses >= 2 hoặc có xác suất nhớ R(t) < 0.65 hoặc isLeech === true
   */
  getWeakWords(limit = 10) {
    const now = new Date();
    const fsrsInstance = new FSRS();
    const weakList = [];

    for (const card of this.allCards) {
      const state = StorageManager.getCardState(card.id);
      if (!state || state.state === State.New || state.state === 0 || state.suspended) {
        continue;
      }

      const lapses = Number(state.lapses) || 0;
      const isLeech = Boolean(state.isLeech || lapses >= 4);
      const r = fsrsInstance.getRetrievability(state, now);

      if (lapses >= 2 || isLeech || (state.reps >= 2 && r < 0.65)) {
        weakList.push({
          ...(this.wordsMap.get(`${card.deckId}:${card.id}`) || this.wordsMap.get(card.id) || card),
          fsrsState: state,
          _lapses: lapses,
          _isLeech: isLeech,
          _retrievability: r
        });
      }
    }

    // Sắp xếp: Ưu tiên từ có nhiều lapses nhất, sau đó đến từ có R(t) thấp nhất
    weakList.sort((a, b) => {
      if (b._lapses !== a._lapses) return b._lapses - a._lapses;
      return a._retrievability - b._retrievability;
    });

    return weakList.slice(0, limit);
  }

  /**
   * Tính toán thống kê tiến độ học của một bộ thẻ (New, Learning, Review, Mastered, Leech, Suspended)
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
      const empty = { total: 0, newCount: 0, learningCount: 0, reviewCount: 0, masteredCount: 0, dueCount: 0, leechCount: 0, suspendedCount: 0, progressPercent: 0 };
      return empty;
    }

    const cards = this.getCardsByDeckId(deckId);
    const cardStates = StorageManager.getAllCardStates();
    const now = new Date();

    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let dueCount = 0;
    let masteredCount = 0;
    let leechCount = 0;
    let suspendedCount = 0;
    let lastStudiedTime = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const state = StorageManager.getCardState(card.id);
      if (state && state.suspended === true) {
        suspendedCount++;
      }
      if (state && state.isLeech === true) {
        leechCount++;
      }
      if (!state || state.state === State.New || state.state === 0) {
        newCount++;
      } else {
        if (state.last_review) {
          const t = Date.parse(state.last_review) || 0;
          if (t > lastStudiedTime) lastStudiedTime = t;
        }
        if (state.state === State.Learning || state.state === State.Relearning) {
          learningCount++;
          if (isCardDue(state, now) && !state.suspended) dueCount++;
        } else if (state.state === State.Review) {
          reviewCount++;
          if (state.stability >= MASTERY_STABILITY_THRESHOLD) {
            masteredCount++;
          }
          if (isCardDue(state, now) && !state.suspended) dueCount++;
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
      leechCount,
      suspendedCount,
      lastStudiedTime,
      progressPercent: cards.length > 0 ? Math.round(((cards.length - newCount) / cards.length) * 100) : 0
    };

    this._statsCache.set(deckId, stats);
    return stats;
  }

  /**
   * Lấy danh sách thẻ ưu tiên thông minh theo thuật toán FSRS
   * @param {string|null} deckId
   * @param {object} userSettings
   * @param {string|null} subtopic
   * @param {object} options - { mode: 'due_only' | 'new_only' | 'auto' | 'mixed' }
   */
  getStudyQueue(deckId = null, userSettings = {}, subtopic = null, options = {}) {
    const settings = {
      dailyNewLimit: 10,
      dailyReviewLimit: 50,
      ...userSettings
    };

    const mode = options?.mode || (options?.onlyDue ? 'due_only' : 'auto');
    const isAudioBlind = mode === STUDY_MODES.AUDIO_BLIND || options?.audioBlind === true || mode === 'audio_blind';
    const stateRev = StorageManager.getStateRevision();
    const cacheKey = `${deckId || 'all'}_${subtopic || 'none'}_${mode}_${isAudioBlind ? 'ab' : 'norm'}_${stateRev}`;

    if (this._studyQueueCache && this._studyQueueCache.has(cacheKey)) {
      return this._studyQueueCache.get(cacheKey);
    }

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
        let prevDone = true;

        for (let i = 0; i < rawSubtopics.length; i++) {
          const subObj = rawSubtopics[i];
          const subId = typeof subObj === 'object' ? (subObj.id || `${deck.id}-${i}`) : `${deck.id}-${i}`;
          const subCards = this.getSubtopicCards(deckId, subObj);

          // Kiểm tra xem phần này đã học xong chưa
          const isCardsLearned = subCards.length > 0 && subCards.every(c => {
            const s = StorageManager.getCardState(c.id);
            return s && s.state !== State.New && s.state !== 0;
          });
          const isSubRecorded = StorageManager.isSubtopicCompleted(subId) || 
            (typeof subObj === 'object' && subObj.id && StorageManager.isSubtopicCompleted(subObj.id));
          const thisSubDone = isCardsLearned || isSubRecorded;

          let isUnlocked = (i === 0) || prevDone;
          if (!isUnlocked) {
            const unlockRule = typeof subObj === 'object' && subObj.unlockRule 
              ? subObj.unlockRule 
              : { type: 'completeSubtopic', subtopicId: rawSubtopics[i - 1]?.id || `${deck.id}-${i - 1}` };
            isUnlocked = TopicRepository.isSubtopicUnlocked({ id: subId, unlockRule }, userProgress);
          }

          if (isUnlocked) {
            unlockedCards.push(...subCards);
          }

          prevDone = thisSubDone;
        }
        targetCards = unlockedCards.length > 0 ? unlockedCards : this.getCardsByDeckId(deckId);
      } else {
        targetCards = this.getCardsByDeckId(deckId);
      }
    } else {
      // Toàn bộ ứng dụng (Đã deduplicate sẵn từ trước trong rebuildAllCardsList)
      targetCards = this.allCards;
    }

    const isAppWide = (deckId === null || deckId === undefined);
    if (!isAppWide) {
      // Đảm bảo không bao giờ có thẻ trùng lặp ID trong danh sách học theo chủ đề
      const seenTargetIds = new Set();
      const uniqueTargetCards = [];
      for (const c of targetCards) {
        if (c && c.id && !seenTargetIds.has(c.id)) {
          seenTargetIds.add(c.id);
          uniqueTargetCards.push(c);
        }
      }
      targetCards = uniqueTargetCards;
    }

    const now = new Date();
    const dueCards = [];
    const newCards = [];
    const learningCards = [];
    const weakCards = [];

    const cardStates = StorageManager.getAllCardStates() || {};
    let a1Learned = 0, a1Total = 0;
    let a2Learned = 0, a2Total = 0;
    let b1Learned = 0, b1Total = 0;
    let b2Learned = 0, b2Total = 0;

    for (let i = 0; i < targetCards.length; i++) {
      const card = targetCards[i];
      const hydratedCard = isAppWide ? card : (this.wordsMap.get(`${card.deckId || deckId}:${card.id}`) || this.wordsMap.get(card.id) || card);
      const state = cardStates[card.id];

      // Tích hợp đếm số từ theo bậc CEFR ngay trong lượt duyệt này (Zero duplicate loops)
      const lvl = (card.level || card.cefr || 'A1').toUpperCase();
      const isLearned = state && state.state !== State.New && state.state !== 0 && !state.suspended;
      if (lvl === 'A1') { a1Total++; if (isLearned) a1Learned++; }
      else if (lvl === 'A2') { a2Total++; if (isLearned) a2Learned++; }
      else if (lvl === 'B1') { b1Total++; if (isLearned) b1Learned++; }
      else if (lvl === 'B2') { b2Total++; if (isLearned) b2Learned++; }

      // Bỏ qua thẻ đã tạm dừng (Suspended)
      if (state && state.suspended === true) {
        continue;
      }

      if (!state || state.state === State.New || state.state === 0) {
        newCards.push({ ...hydratedCard, fsrsState: state || FSRS.createEmptyCard(card.id) });
      } else if (isCardDue(state, now)) {
        dueCards.push({ ...hydratedCard, fsrsState: state });
      } else if (state.state === State.Learning || state.state === State.Relearning) {
        learningCards.push({ ...hydratedCard, fsrsState: state });
      }

      // Thu thập thẻ khó / từ hay quên (Leech & Low Stability Hunter)
      if (state && state.state !== State.New && state.state !== 0 && !state.suspended) {
        const s = Number(state.stability) || 0;
        const d = Number(state.difficulty) || 0;
        const lapses = Number(state.lapses) || 0;
        const isLeech = state.isLeech === true || lapses >= 2;
        const isLowStability = s < 3;
        const isHighDifficulty = d >= 7.0;
        if (isLeech || isLowStability || isHighDifficulty) {
          weakCards.push({
            ...hydratedCard,
            fsrsState: state,
            _weakScore: (lapses * 15) + ((10 - Math.min(10, s)) * 2) + d
          });
        }
      }
    }

    // Sắp xếp từ khó nhất và hay quên nhất lên đầu
    weakCards.sort((a, b) => (b._weakScore || 0) - (a._weakScore || 0));

    // 1. SẮP XẾP ƯU TIÊN THEO ĐỘ KHẨN CẤP FSRS R(t) (Urgency Sorting)
    // Tính toán xác suất nhớ thực tế R(t). Thẻ có R(t) thấp nhất (nguy cơ quên cao nhất) được đưa lên đầu để cứu nguy trước
    const fsrsInstance = new FSRS({
      requestRetention: Number(settings.requestRetention) || 0.90,
      enableFuzz: settings.enableFuzz !== false
    });

    dueCards.forEach(c => {
      c._retrievability = fsrsInstance.getRetrievability(c.fsrsState, now);
      c._dueTime = c.fsrsState?.due ? new Date(c.fsrsState.due).getTime() : 0;
    });

    dueCards.sort((a, b) => {
      if (a._retrievability !== b._retrievability) {
        return a._retrievability - b._retrievability;
      }
      return a._dueTime - b._dueTime;
    });

    // 2. SẮP XẾP TỪ MỚI THEO NẤC THANG CEFR (A1 -> A2 -> B1 -> B2 -> C1) & ĐỘ PHỔ BIẾN CỐT LÕI
    const a1Ratio = a1Total > 0 ? (a1Learned / a1Total) : 0;
    const a2Ratio = a2Total > 0 ? (a2Learned / a2Total) : 0;
    const b1Ratio = b1Total > 0 ? (b1Learned / b1Total) : 0;
    const b2Ratio = b2Total > 0 ? (b2Learned / b2Total) : 0;

    const activeGoalId = settings.activeGoal?.id || 'cefr-b1';
    const activeGoal = getLearningGoal(activeGoalId);
    const targetDecksSet = new Set(activeGoal?.targetDecks || []);
    const targetDecksList = Array.from(targetDecksSet);
    const targetCefrSet = new Set((activeGoal?.targetCefr || []).map(c => c.toUpperCase()));

    const normalizePos = (pos) => {
      if (!pos) return 'other';
      const p = String(pos).toLowerCase();
      if (p.includes('noun') || p === 'n') return 'noun';
      if (p.includes('verb') || p === 'v') return 'verb';
      if (p.includes('adj') || p === 'a') return 'adj';
      return 'other';
    };

    // Pre-calculate score for every new card in a single O(N) pass
    for (let i = 0; i < newCards.length; i++) {
      const c = newCards[i];
      let score = 0;
      const cardLevel = (c.level || c.cefr || 'A1').toUpperCase();
      const topicIds = Array.isArray(c.topicIds) ? c.topicIds : [];
      const deckId = c.deckId || '';
      const posKey = normalizePos(c.pos);

      // 1. Trọng số Nấc thang CEFR tuần tự (A1 -> A2 -> B1 -> B2 -> C1)
      if (a1Ratio < 0.80) {
        if (cardLevel === 'A1') score += 3000;
        else if (cardLevel === 'A2') score += 1500;
        else if (cardLevel === 'B1') score += 800;
        else if (cardLevel === 'B2') score += 400;
        else score += 100;
      } else if (a2Ratio < 0.80) {
        if (cardLevel === 'A2') score += 3000;
        else if (cardLevel === 'A1') score += 2000;
        else if (cardLevel === 'B1') score += 1000;
        else if (cardLevel === 'B2') score += 500;
        else score += 100;
      } else if (b1Ratio < 0.80) {
        if (cardLevel === 'B1') score += 3000;
        else if (cardLevel === 'A2') score += 2000;
        else if (cardLevel === 'A1') score += 1500;
        else if (cardLevel === 'B2') score += 800;
        else score += 100;
      } else if (b2Ratio < 0.80) {
        if (cardLevel === 'B2') score += 3000;
        else if (cardLevel === 'B1') score += 2000;
        else if (cardLevel === 'A2') score += 1500;
        else score += 500;
      } else {
        if (cardLevel === 'C1') score += 3000;
        else if (cardLevel === 'B2') score += 2000;
        else score += 1000;
      }

      // 2. Trùng khớp với Mục tiêu học tập người dùng đã chọn
      if (targetCefrSet.has(cardLevel)) score += 600;
      if (targetDecksSet.has(deckId)) score += 500;
      for (let j = 0; j < topicIds.length; j++) {
        const tid = topicIds[j];
        if (targetDecksSet.has(tid) || targetDecksList.some(d => tid.startsWith(d))) {
          score += 400;
          break;
        }
      }

      // 3. Phân loại từ loại thiết yếu
      if (posKey === 'verb') score += 300;
      else if (posKey === 'noun') score += 250;
      else if (posKey === 'adj') score += 200;
      else score += 100;

      // 4. Ưu tiên từ thuộc 1000 từ cốt lõi
      if (deckId === 'top-1000-core' || topicIds.some(t => t.startsWith('top-1000-core'))) {
        score += 350;
      }

      c._score = score;
    }

    newCards.sort((a, b) => b._score - a._score);

    // 3. Tính hạn mức từ mới và thẻ đến hạn hôm nay
    const dailyGoalNew = Number(settings.activeGoal?.dailyNew) || Number(settings.dailyNewLimit) || 10;
    let maxNew = dailyGoalNew;
    let maxReview = Number(settings.dailyReviewLimit) || 50;
    const rolloverHour = Number(settings.rolloverHour) || 0;

    const logs = StorageManager.getStudyLogs();
    const todayKey = getLocalDateKey(now, rolloverHour);
    const todayLogs = logs.filter(l => l.timestamp && getLocalDateKey(l.timestamp, rolloverHour) === todayKey);

    const newCardsStudiedToday = todayLogs.filter(l => 
      l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
    ).length;

    if (!deckId && !subtopic) {
      maxNew = Math.max(0, dailyGoalNew - newCardsStudiedToday);
    } else {
      maxNew = Math.max(1, dailyGoalNew);
    }

    // Thẻ đến hạn: Lấy TOÀN BỘ từ đến hạn cần ôn (bỏ giới hạn trần - có bao nhiêu ôn bấy nhiêu)
    let selectedDue = dueCards;

    // Thẻ mới: Lấy vừa đủ số lượng mục tiêu từ mới hôm nay rồi thôi
    let selectedNew;
    if (subtopic) {
      selectedNew = newCards;
    } else {
      selectedNew = newCards.slice(0, mode === 'new_only' ? Math.max(1, dailyGoalNew) : maxNew);
    }

    let queueCards = [];
    if (mode === 'due_only') {
      // Chỉ ôn tập các thẻ ĐÃ ĐẾN HẠN
      queueCards = selectedDue;
    } else if (mode === 'new_only') {
      // Chỉ học các thẻ MỚI CHƯA TỪNG HỌC
      queueCards = selectedNew;
    } else if (mode === 'weak_hunter' || mode === STUDY_MODES.WEAK_HUNTER) {
      // Chế độ TIÊU DIỆT TỪ KHÓ (Leech & Weak Words Hunter)
      queueCards = weakCards.length > 0 ? weakCards.slice(0, 20) : selectedDue.slice(0, 20);
    } else if (mode === 'sprint_10' || mode === STUDY_MODES.SPRINT_10) {
      // Chế độ TỐC CHIẾN 3 PHÚT (Quick 10-Card Sprint)
      if (selectedDue.length >= 10) {
        queueCards = selectedDue.slice(0, 10);
      } else {
        const pool = [...selectedDue, ...weakCards, ...selectedNew];
        const seen = new Set();
        queueCards = [];
        for (const c of pool) {
          if (c && c.id && !seen.has(c.id)) {
            seen.add(c.id);
            queueCards.push(c);
            if (queueCards.length >= 10) break;
          }
        }
      }
    } else if (mode === 'audio_blind' || mode === STUDY_MODES.AUDIO_BLIND) {
      // Chế độ LUYỆN NGHE PHẢN XẠ (Audio Blind Recall)
      queueCards = selectedDue.length > 0 ? selectedDue : [...selectedDue, ...selectedNew];
    } else if (mode === 'due_first' || mode === 'auto' || mode === 'mixed') {
      // BẮT ĐẦU ÔN FLASHCARD: Mix trọn vẹn [Tất cả từ đến hạn cần ôn] + [Đủ số lượng mục tiêu từ mới hôm nay]
      queueCards = [...selectedDue, ...selectedNew];
    } else if (mode === 'interleave') {
      // KỸ THUẬT ĐAN XEN NHẬN THỨC (Cognitive Interleaving: 2 ôn -> 1 mới -> 2 ôn -> 1 mới)
      const interleaved = [];
      let dIdx = 0;
      let nIdx = 0;
      while (dIdx < selectedDue.length || nIdx < selectedNew.length) {
        if (dIdx < selectedDue.length) interleaved.push(selectedDue[dIdx++]);
        if (dIdx < selectedDue.length) interleaved.push(selectedDue[dIdx++]);
        if (nIdx < selectedNew.length) interleaved.push(selectedNew[nIdx++]);
      }
      queueCards = interleaved;
    } else {
      queueCards = [...selectedDue, ...selectedNew];
    }

    // 4. BẢO VỆ CHỐNG QUÁ TẢI NHẬN THỨC (Adaptive Backlog Protection)
    // Nếu có >= 35 từ đến hạn dồn ứ, ưu tiên dọn sạch hàng đợi đến hạn
    const isBacklogProtected = dueCards.length >= 35;
    if (isBacklogProtected && (mode === 'auto' || mode === 'due_first')) {
      queueCards = selectedDue;
    }

    const queue = [];
    const seenQueueIds = new Set();

    for (const card of queueCards) {
      if (card && card.id && !seenQueueIds.has(card.id)) {
        seenQueueIds.add(card.id);
        const cardObj = {
          ...(this.wordsMap.get(`${card.deckId || deckId}:${card.id}`) || this.wordsMap.get(card.id) || card),
          fsrsState: card.fsrsState || StorageManager.getCardState(card.id) || FSRS.createEmptyCard(card.id)
        };
        if (isAudioBlind) {
          cardObj._audioBlind = true;
        }
        queue.push(cardObj);
      }
    }

    const result = {
      dueCards: selectedDue,
      newCards: selectedNew,
      weakCards,
      learningCards,
      isBacklogProtected,
      totalDue: dueCards.length,
      totalNew: newCards.length,
      totalWeak: weakCards.length,
      totalLearned: targetCards.length - newCards.length,
      totalCards: targetCards.length,
      queue
    };

    if (!this._studyQueueCache) this._studyQueueCache = new Map();
    if (this._studyQueueCache.size > 20) this._studyQueueCache.clear();
    this._studyQueueCache.set(cacheKey, result);

    return result;
  }

  /**
   * Thống kê số lượng thẻ tương ứng cho từng Chế Độ Học Có Chủ Đích (Targeted Modes)
   */
  getStudyModeCounts(deckId = null, userSettings = {}) {
    const studyData = this.getStudyQueue(deckId, userSettings, null, { mode: 'due_first' });
    const dueCount = studyData.totalDue || 0;
    const newCount = studyData.newCards?.length || 0;
    const weakCount = studyData.totalWeak || 0;
    const sprintCount = Math.min(10, dueCount > 0 ? dueCount : (weakCount > 0 ? weakCount : (newCount > 0 ? newCount : 10)));
    return {
      dueCount,
      newCount,
      weakCount,
      sprintCount
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
