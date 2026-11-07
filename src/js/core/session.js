/**
 * Study Session Manager - Core Learning Orchestrator
 */

import { FSRS, Rating, State } from './fsrs.js';
import { StorageManager } from '../services/storage.js';
import { RELEARN_STEP_OFFSET } from '../config.js';
import { getCurrentSettings } from '../utils.js';
import { 
  unlockAudioContext, 
  preloadWordAudio, 
  speak, 
  speakTTS, 
  stopAudio 
} from '../services/audio.js';

export { unlockAudioContext };

// Bộ nhớ đệm RAM lưu giữ tham chiếu hình ảnh đã giải mã (Decoded Image Cache với LRU)
const sessionImageCache = new Map();
const MAX_IMAGE_CACHE_SIZE = 60;

/**
 * Tải trước và giải mã hình ảnh vào GPU/Browser RAM cache
 * Đảm bảo khi hiển thị lên thẻ không có độ trễ decode và xuất hiện đồng thời cùng từ vựng
 */
export function preloadCardImage(src) {
  if (!src || typeof src !== 'string' || typeof Image === 'undefined') {
    return Promise.resolve(null);
  }
  if (sessionImageCache.has(src)) {
    const p = sessionImageCache.get(src);
    // Refresh LRU order
    sessionImageCache.delete(src);
    sessionImageCache.set(src, p);
    return p;
  }

  // Prune oldest if exceeds capacity
  if (sessionImageCache.size >= MAX_IMAGE_CACHE_SIZE) {
    const oldestKey = sessionImageCache.keys().next().value;
    sessionImageCache.delete(oldestKey);
  }

  const img = new Image();
  img.src = src;
  const promise = (img.decode ? img.decode() : new Promise((resolve) => {
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  })).then(() => img).catch(() => null);

  sessionImageCache.set(src, promise);
  return promise;
}

export class StudySession {
  constructor(options = {}) {
    this.deckManager = options.deckManager;
    this.settings = options.settings || StorageManager.getSettings();
    this.fsrs = new FSRS({
      w: this.settings?.fsrsW,
      requestRetention: this.settings?.requestRetention || 0.90,
      enableFuzz: this.settings?.enableFuzz !== false,
      leechThreshold: this.settings?.leechThreshold || 8,
      leechAction: this.settings?.leechAction || 'suspend'
    });
    this.onFinish = options.onFinish || (() => {});
    this.onCardChange = options.onCardChange || (() => {});
    this.onBatchCheckpoint = options.onBatchCheckpoint || null;

    this.relearnInSession = options.relearnInSession !== false; // Bật củng cố trong phiên theo nhịp nhận thức
    this.relearnStepOffset = options.relearnStepOffset || RELEARN_STEP_OFFSET || 4;
    this.batchSize = options.batchSize || 0;
    this.batchNumber = 1;
    this.cardsReviewedInCurrentBatch = 0;
    this.relearningCardIds = new Set();
    this.inSessionAgainCounts = new Map(); // Đếm số lần bấm Again của mỗi thẻ trong phiên để chống kẹt vô tận (Anti-Trap)

    this.queue = [];
    this.currentIndex = 0;
    this.currentCard = null;
    this.isFlipped = false;
    this.sessionId = null;
    this.ratedReviewKeys = new Set();
    this.sessionStats = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
      total: 0,
      reviewedCount: 0,
      newLearned: 0,
      strengthened: 0,
      promotedMature: 0,
      recovered: 0,
      relearnCount: 0,
      inSessionRecovered: 0
    };
  }

  updateSettings(settings = null) {
    this.settings = { ...getCurrentSettings(settings || this.settings) };
    try {
      const raw = localStorage.getItem('study_display_prefs');
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.autoplayAudio === 'boolean') {
          this.settings.autoPronounce = p.autoplayAudio;
        }
      }
    } catch (e) {}
    this.fsrs = new FSRS({
      w: this.settings?.fsrsW,
      requestRetention: this.settings?.requestRetention || 0.90,
      enableFuzz: this.settings?.enableFuzz !== false,
      leechThreshold: this.settings?.leechThreshold || 8,
      leechAction: this.settings?.leechAction || 'suspend'
    });
  }

  /**
   * Khởi động phiên học với hàng đợi thẻ (queue) & Kích hoạt tải trước âm thanh
   */
  start(queue) {
    unlockAudioContext();
    this.updateSettings();
    
    // Đảm bảo không bao giờ bị trùng lặp thẻ trong hàng đợi ban đầu (Nạp trọn vẹn toàn bộ danh sách ôn tập)
    const seenQueueIds = new Set();
    this.queue = [];
    const rawQueue = Array.isArray(queue) ? queue : [];
    for (const c of rawQueue) {
      if (c && c.id && !seenQueueIds.has(c.id)) {
        seenQueueIds.add(c.id);
        this.queue.push(c);
      }
    }
    this.totalCards = this.queue.length;
    this.uniqueCardIds = new Set(this.queue.map(c => c.id));
    this.completedUniqueIds = new Set();
    this.completedCount = 0;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.ratedReviewKeys.clear();
    this.failedInSessionIds = new Set();
    this.relearningCardIds = new Set();
    this.inSessionAgainCounts.clear();
    this.batchNumber = 1;
    this.cardsReviewedInCurrentBatch = 0;
    this.batchSize = this.settings?.batchSize || 0;
    this.sessionStats = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
      reviewedCount: 0,
      inSessionRecovered: 0,
      total: this.totalCards
    };

    this.isActive = true;
    if (this.queue.length === 0) {
      this.currentCard = null;
      this.isActive = false;
      return false;
    }

    // Tải trước toàn bộ âm thanh và hình ảnh trong phiên học để phát và chuyển thẻ tức thì 0ms delay
    this.preloadSessionAudio(this.queue);
    this.preloadSessionImages(this.queue);

    this.loadCurrentCard();
    return true;
  }

  /**
   * Tải trước âm thanh cho thẻ hiện tại và thẻ kế tiếp (nhẹ nhàng, không nghẽn mạng)
   */
  preloadSessionAudio(cards) {
    if (!cards || !Array.isArray(cards) || typeof Audio === 'undefined') return;
    const accent = (this.settings?.audioAccent || 'us').toLowerCase();
    const batch = cards.slice(0, 2);
    batch.forEach(card => {
      if (card && card.word) {
        preloadWordAudio(card.word.trim(), accent, card);
      }
    });
  }

  /**
   * Tải trước hình ảnh trong phiên học chỉ khi người dùng BẬT hiển thị hình ảnh
   */
  preloadSessionImages(cards) {
    if (!cards || !Array.isArray(cards) || typeof Image === 'undefined') return;
    let isImageEnabled = false;
    try {
      const raw = localStorage.getItem('study_display_prefs');
      if (raw) isImageEnabled = JSON.parse(raw).showImage === true;
    } catch (e) {}

    if (!isImageEnabled) return;

    const batch = cards.slice(0, 2);
    batch.forEach(card => {
      const src = card?.img || card?.image;
      if (src && typeof src === 'string') {
        preloadCardImage(src);
      }
    });
  }

  loadCurrentCard() {
    this.updateSettings();
    if (this.currentIndex >= this.queue.length) {
      this.currentCard = null;
      this.isActive = false;
      try { StorageManager.flushPendingSync(); } catch (e) {}
      this.onFinish(this.sessionStats);
      return null;
    }

    const baseCard = this.queue[this.currentIndex];
    const dictCard = this.deckManager ? this.deckManager.getCardById(baseCard.id) : null;
    this.currentCard = dictCard ? { ...baseCard, ...dictCard } : baseCard;
    this.isFlipped = false;

    // Lấy trạng thái FSRS mới nhất từ storage hoặc tạo mới
    let state = StorageManager.getCardState(this.currentCard.id);
    if (!state) {
      state = FSRS.createEmptyCard(this.currentCard.id);
    }
    this.currentCard.fsrsState = state;

    // Tính toán preview intervals cho 4 nút
    this.currentCard.previews = this.fsrs.preview(state, new Date());

    this.onCardChange(this.currentCard, {
      index: this.currentIndex,
      completed: this.completedCount,
      total: this.totalCards || this.queue.length,
      remaining: this.queue.length - this.currentIndex,
      isRelearnPass: !!this.currentCard._isRelearnPass,
      isAudioBlind: !!this.currentCard._audioBlind
    });

    // Hủy timer phát âm cũ nếu có
    if (this._autoSpeakTimer) {
      clearTimeout(this._autoSpeakTimer);
      this._autoSpeakTimer = null;
    }

    // Tự động phát âm ngay lập tức (0ms delay) khi chuyển sang thẻ mới (mặt trước)
    const isAutoplay = this.settings?.autoPronounce !== false;
    if (this.currentCard && this.currentCard.word && isAutoplay) {
      const cardToSpeak = this.currentCard;
      this.speak(cardToSpeak.word);
    }

    // Tải trước trượt 1 từ tiếp theo trong hàng đợi (Sliding Window 1 thẻ)
    const nextCard = this.queue[this.currentIndex + 1];
    if (nextCard && nextCard.word) {
      const accent = (this.settings?.audioAccent || 'us').toLowerCase();
      preloadWordAudio(nextCard.word.trim(), accent, nextCard);

      let isImageEnabled = false;
      try {
        const raw = localStorage.getItem('study_display_prefs');
        if (raw) isImageEnabled = JSON.parse(raw).showImage === true;
      } catch (e) {}

      if (isImageEnabled) {
        const nextImg = nextCard.img || nextCard.image;
        if (nextImg && typeof nextImg === 'string') {
          preloadCardImage(nextImg);
        }
      }
    }

    return this.currentCard;
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    return this.isFlipped;
  }

  /**
   * Đánh giá thẻ với điểm FSRS (Again: 1, Hard: 2, Good: 3, Easy: 4)
   */
  rateCard(rating, options = {}) {
    if (!this.currentCard) return null;
    this.updateSettings();
    const shouldPersist = options !== false && options.persist !== false;
    const isRelearnPass = this.currentCard._isRelearnPass === true;

    const reviewKey = `${this.sessionId || 'session'}_${this.currentIndex}_${this.currentCard.id}`;
    if (this.ratedReviewKeys.has(reviewKey)) {
      return this.currentCard;
    }
    this.ratedReviewKeys.add(reviewKey);

    const cardId = this.currentCard.id;
    const latencySec = typeof options.latencySec === 'number' ? options.latencySec : null;
    const backViewSec = typeof options.backViewSec === 'number' ? options.backViewSec : null;

    // ====================================================
    // TÍNH TOÁN VÀ LƯU THUẬT TOÁN FSRS-6
    // ====================================================
    const now = new Date();
    // Luôn ưu tiên nạp trạng thái FSRS mới nhất từ StorageManager để đảm bảo tính nhất quán
    const oldState = StorageManager.getCardState(cardId) || this.currentCard.fsrsState || FSRS.createEmptyCard(cardId);

    // BỘ ĐIỀU PHỐI NHẬN THỨC TỰ THÍCH ỨNG (ADAPTIVE COGNITIVE LATENCY ENGINE)
    // Tự động phân hóa độ tự tin 2 nút (Quên / Nhớ) thành FSRS-6 chuẩn xác với màng lọc chống nhiễu
    let effectiveRating = rating;
    if (rating === Rating.Good && typeof latencySec === 'number') {
      const isNoiseOrDistracted = latencySec >= 7.0 || latencySec <= 0.3;
      if (!isNoiseOrDistracted) {
        // Chuẩn hóa theo độ dài từ vựng (Word Length Normalization)
        const wordLen = Math.max(3, (this.currentCard.word || '').length);
        const fastThreshold = Math.min(1.8, 0.8 + (wordLen * 0.05)); // 3 chữ: 0.95s, 15 chữ: 1.55s
        const slowThreshold = Math.max(3.8, 3.2 + (wordLen * 0.08)); // 3 chữ: 3.44s, 15 chữ: 4.40s

        if (latencySec <= fastThreshold) {
          effectiveRating = Rating.Easy; // Phản xạ tức thì -> Thưởng độ bền (Easy)
        } else if (latencySec >= slowThreshold && latencySec < 7.0) {
          effectiveRating = Rating.Hard; // Nhớ ngập ngừng -> Tăng nhẹ độ khó D (Hard)
        }
      }
    }

    const nextState = this.fsrs.calculateNextState(oldState, effectiveRating, now, {
      enableFuzz: this.settings?.enableFuzz !== false,
      leechThreshold: this.settings?.leechThreshold || 8,
      leechAction: this.settings?.leechAction || 'suspend'
    });

    // Cập nhật fsrsState trên currentCard
    this.currentCard.fsrsState = nextState;

    // Lưu trạng thái thẻ vào Storage & IndexedDB
    if (shouldPersist) {
      StorageManager.saveCardState(nextState);

      // Nếu thẻ bị tự động tạm dừng (Leech suspend), loại bỏ các bản sao còn lại khỏi hàng đợi hiện tại
      if (nextState.suspended) {
        this.queue = this.queue.filter((c, idx) => idx <= this.currentIndex || c.id !== cardId);
      }

      // Ghi nhật ký học tập
      StorageManager.logReview({
        cardId: this.currentCard.id,
        word: this.currentCard.word,
        rating: rating,
        effectiveRating: effectiveRating,
        oldState: oldState.state,
        newState: nextState.state,
        scheduledDays: nextState.scheduled_days,
        stability: nextState.stability,
        difficulty: nextState.difficulty,
        isRelearnPass: isRelearnPass,
        latencySec: latencySec,
        backViewSec: backViewSec
      });
    }

    // Cập nhật thống kê và tiến độ chuyển hóa trí nhớ FSRS
    const isOldNew = oldState.state === State.New || oldState.state === 0;
    const isOldRelearning = oldState.state === State.Relearning || oldState.state === 3;
    const oldStability = Number(oldState.stability) || 0;
    const nextStability = Number(nextState.stability) || 0;

    if (isOldNew && !isRelearnPass) {
      this.sessionStats.newLearned = (this.sessionStats.newLearned || 0) + 1;
    }

    if (rating === Rating.Again) {
      this.sessionStats.again++;
      if (!isRelearnPass) {
        this.sessionStats.relearnCount = (this.sessionStats.relearnCount || 0) + 1;
      }

      // Đếm số lần bấm Quên của thẻ này trong phiên học hiện tại
      const againCount = (this.inSessionAgainCounts.get(cardId) || 0) + 1;
      this.inSessionAgainCounts.set(cardId, againCount);

      // =========================================================================
      // SSOT - VÒNG LẶP CỦNG CỐ KHÉP KÍN (CLOSED-LOOP RELEARN STRATEGY):
      // - Lần 1 & Lần 2 (againCount <= 2): Củng cố ngắn hạn trong mạch học chính.
      //   Chèn lùi sau 4 thẻ (+ jitter 0-1) để não bộ phục hồi và tái kích hoạt trí nhớ.
      // - Lần 3 trở đi (againCount >= 3): ĐÂY LÀ TỪ KHÓ NHAI / HAY QUÊN.
      //   Tuyệt đối không chèn xen kẽ làm đứt gãy luồng học chính nữa.
      //   ĐẨY HẲN RA SAU CÙNG HÀNG ĐỢI (insertIdx = queue.length).
      //   Sau khi người dùng học hết sạch toàn bộ từ đến hạn và từ mới, các từ khó
      //   này sẽ xuất hiện ở chặng cuối để ôn tập đến khi thuộc hết (hoặc chủ động nghỉ).
      // =========================================================================
      if (this.relearnInSession) {
        this.relearningCardIds.add(cardId);
        let insertIdx;
        if (againCount <= 2) {
          // Lần 1 & 2: Củng cố ngắn hạn sau 4 thẻ trong mạch học chính
          const jitter = Math.floor(Math.random() * 2);
          insertIdx = Math.min(this.queue.length, this.currentIndex + 1 + this.relearnStepOffset + jitter);
        } else {
          // Lần 3 trở đi: Đẩy hẳn về sau cùng hàng đợi (sau hết toàn bộ từ đến hạn & từ mới)
          insertIdx = this.queue.length;
        }
        this.queue.splice(insertIdx, 0, {
          ...this.currentCard,
          _isRelearnPass: true,
          _againCountInSession: againCount,
          _isDeferredStubborn: againCount >= 3
        });
        // Thẻ chưa vượt qua nên CHƯA tính hoàn thành (Vòng lặp khép kín)
      } else {
        // Tắt tính năng củng cố trong phiên: Đánh dấu hoàn thành
        this.relearningCardIds.delete(cardId);
        this.completedUniqueIds.add(cardId);
      }
    } else {
      if (effectiveRating === Rating.Hard) this.sessionStats.hard++;
      else if (effectiveRating === Rating.Easy) this.sessionStats.easy++;
      else this.sessionStats.good++;

      if (isRelearnPass) {
        this.relearningCardIds.delete(cardId);
        this.sessionStats.inSessionRecovered = (this.sessionStats.inSessionRecovered || 0) + 1;
      }

      if (isOldRelearning || (oldState.lapses && oldState.lapses > 0 && (effectiveRating === Rating.Good || effectiveRating === Rating.Easy))) {
        this.sessionStats.recovered = (this.sessionStats.recovered || 0) + 1;
      }

      if (nextStability > oldStability) {
        this.sessionStats.strengthened = (this.sessionStats.strengthened || 0) + 1;
      }

      if (nextStability >= 21 && oldStability < 21) {
        this.sessionStats.promotedMature = (this.sessionStats.promotedMature || 0) + 1;
      }

      this.completedUniqueIds.add(cardId);
    }
    this.sessionStats.reviewedCount++;
    this.completedCount = this.completedUniqueIds.size;

    if (shouldPersist) {
      try {
        const logs = StorageManager.getStudyLogs();
        if (logs.length > 0 && logs[logs.length - 1].cardId === cardId) {
          if (latencySec !== null) logs[logs.length - 1].latencySec = Number(latencySec.toFixed(2));
          if (backViewSec !== null) logs[logs.length - 1].backViewSec = Number(backViewSec.toFixed(2));
        }
      } catch (e) {}
    }

    // CHECKPOINT CHIA NHỎ PHIÊN THÔNG MINH (Đã tắt mặc định theo yêu cầu)
    if (this.batchSize > 0 && typeof this.onBatchCheckpoint === 'function') {
      this.cardsReviewedInCurrentBatch++;
      if (this.cardsReviewedInCurrentBatch >= this.batchSize && (this.currentIndex + 1) < this.queue.length) {
        const checkpointData = {
          batchNumber: this.batchNumber,
          cardsInBatch: this.cardsReviewedInCurrentBatch,
          completedCount: this.completedCount,
          totalCards: this.totalCards,
          remaining: this.queue.length - (this.currentIndex + 1)
        };
        this.cardsReviewedInCurrentBatch = 0;
        this.batchNumber++;
        this.onBatchCheckpoint(checkpointData);
      }
    }

    this.currentIndex++;
    return this.loadCurrentCard();
  }

  /**
   * Chuyển sang thẻ tiếp theo trong chế độ Auto-Play (Nghe/Xem thụ động)
   * Giữ nguyên 100% trạng thái FSRS của thẻ (không thay đổi lịch ôn hay độ bền)
   * Chỉ ghi nhận nhật ký học để duy trì Chuỗi ngày học (Streak) và Thời gian học.
   */
  stepNextAutoplayCard() {
    if (!this.currentCard) return null;

    StorageManager.logReview({
      cardId: this.currentCard.id,
      word: this.currentCard.word,
      isAutoplay: true
    });

    this.sessionStats.reviewedCount = (this.sessionStats.reviewedCount || 0) + 1;
    this.completedCount = (this.completedCount || 0) + 1;
    this.currentIndex++;
    return this.loadCurrentCard();
  }

  /**
   * Tạm dừng thẻ hiện tại và chuyển sang thẻ tiếp theo
   */
  suspendCurrentCard() {
    if (!this.currentCard) return null;
    const cardId = this.currentCard.id;
    StorageManager.suspendCard(cardId);
    
    // Loại bỏ mọi bản sao của thẻ này còn sót lại trong queue
    this.queue = this.queue.filter((c, idx) => idx <= this.currentIndex || c.id !== cardId);
    this.currentIndex++;
    return this.loadCurrentCard();
  }

  /**
   * Đặt lại tiến độ thẻ hiện tại về New
   */
  resetCurrentCard() {
    if (!this.currentCard) return null;
    const cardId = this.currentCard.id;
    const resetState = StorageManager.resetCardProgress(cardId);
    this.currentCard.fsrsState = resetState;
    this.currentCard.previews = this.fsrs.preview(resetState, new Date());
    return this.currentCard;
  }

  /**
   * Phát âm từ vựng với Dual Native Audio Engine
   */
  speak(text, lang = null) {
    speak(text, { settings: this.settings, lang, cardObj: this.currentCard });
  }

  /**
   * Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API)
   */
  speakTTS(text, accent = 'us', lang = null) {
    speakTTS(text, accent, lang, this.settings.speechRate || 0.9);
  }

  /**
   * Dừng toàn bộ âm thanh đang phát an toàn
   */
  stopAudio() {
    stopAudio();
  }
}
