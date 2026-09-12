/**
 * Study Session Manager - Core Learning Orchestrator
 */

import { FSRS, Rating } from './fsrs.js';
import { StorageManager } from '../services/storage.js';
import { 
  unlockAudioContext, 
  preloadWordAudio, 
  speak, 
  speakTTS, 
  stopAudio 
} from '../services/audio.js';

export { unlockAudioContext };

// Bộ nhớ đệm RAM lưu giữ tham chiếu hình ảnh đã giải mã (Decoded Image Cache)
const sessionImageCache = new Map();

/**
 * Tải trước và giải mã hình ảnh vào GPU/Browser RAM cache
 * Đảm bảo khi hiển thị lên thẻ không có độ trễ decode và xuất hiện đồng thời cùng từ vựng
 */
export function preloadCardImage(src) {
  if (!src || typeof src !== 'string' || typeof Image === 'undefined') {
    return Promise.resolve(null);
  }
  if (sessionImageCache.has(src)) {
    return sessionImageCache.get(src);
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

function getCurrentSettings(baseSettings = null) {
  if (typeof window !== 'undefined' && window.app?.settings) {
    return window.app.settings;
  }
  return baseSettings || StorageManager.getSettings();
}

export class StudySession {
  constructor(options = {}) {
    this.deckManager = options.deckManager;
    this.fsrs = new FSRS({ requestRetention: options.settings?.requestRetention || 0.90 });
    this.settings = options.settings || StorageManager.getSettings();
    this.onFinish = options.onFinish || (() => {});
    this.onCardChange = options.onCardChange || (() => {});

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
      total: 0
    };
  }

  updateSettings(settings = null) {
    this.settings = getCurrentSettings(settings || this.settings);
    this.fsrs = new FSRS({ requestRetention: this.settings?.requestRetention || 0.90 });
  }

  /**
   * Khởi động phiên học với hàng đợi thẻ (queue) & Kích hoạt tải trước âm thanh
   */
  start(queue) {
    unlockAudioContext();
    this.updateSettings();
    
    // Đảm bảo không bao giờ bị trùng lặp thẻ trong hàng đợi ban đầu
    const seenQueueIds = new Set();
    this.queue = [];
    for (const c of (queue || [])) {
      if (c && c.id && !seenQueueIds.has(c.id)) {
        seenQueueIds.add(c.id);
        this.queue.push(c);
      }
    }
    this.totalCards = this.queue.length;
    this.completedCount = 0;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.ratedReviewKeys.clear();
    this.sessionStats = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
      reviewedCount: 0,
      total: this.totalCards
    };

    if (this.queue.length === 0) {
      this.currentCard = null;
      return false;
    }

    // Tải trước toàn bộ âm thanh và hình ảnh trong phiên học để phát và chuyển thẻ tức thì 0ms delay
    this.preloadSessionAudio(this.queue);
    this.preloadSessionImages(this.queue);

    this.loadCurrentCard();
    return true;
  }

  /**
   * Tải trước toàn bộ âm thanh trong phiên học (Cả giọng US & UK):
   * - Nạp ngay 3 từ đầu tiên tức thì để phát 0ms không chờ đợi.
   * - Tự động tải ngầm toàn bộ các từ còn lại trong phiên học (10 từ) để sẵn sàng 100%.
   */
  preloadSessionAudio(cards) {
    if (!cards || !Array.isArray(cards) || typeof Audio === 'undefined') return;

    // 1. Tải ngay 3 từ đầu tiên tức thì cả 2 giọng US & UK
    const immediateBatch = cards.slice(0, 3);
    immediateBatch.forEach(card => {
      if (card && card.word) {
        const w = card.word.trim();
        preloadWordAudio(w, 'us', card);
        preloadWordAudio(w, 'uk', card);
      }
    });

    // 2. Tải ngầm toàn bộ các từ còn lại trong phiên học (từ 4 đến 10)
    if (cards.length > 3) {
      const remainingBatch = cards.slice(3);
      setTimeout(() => {
        remainingBatch.forEach((card, idx) => {
          setTimeout(() => {
            if (card && card.word) {
              const w = card.word.trim();
              preloadWordAudio(w, 'us', card);
              preloadWordAudio(w, 'uk', card);
            }
          }, idx * 40);
        });
      }, 100);
    }
  }

  /**
   * Tải trước toàn bộ hình ảnh trong phiên học vào RAM/Browser Cache và giải mã trước
   * Giúp chuyển sang thẻ tiếp theo hiển thị ảnh tức thì 0ms, không bị chớp hay trễ mạng
   */
  preloadSessionImages(cards) {
    if (!cards || !Array.isArray(cards) || typeof Image === 'undefined') return;

    // Tải và giải mã ngay lập tức toàn bộ ảnh của các từ trong phiên học
    cards.forEach(card => {
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
      remaining: this.queue.length - this.currentIndex
    });

    // Hủy timer phát âm cũ nếu người dùng chuyển thẻ nhanh
    if (this._autoSpeakTimer) {
      clearTimeout(this._autoSpeakTimer);
      this._autoSpeakTimer = null;
    }

    // Tự động phát âm ngay khi chuyển sang thẻ mới (mặt trước)
    if (this.currentCard && this.currentCard.word && this.settings.autoPronounce !== false) {
      const cardToSpeak = this.currentCard;
      this._autoSpeakTimer = setTimeout(() => {
        if (this.currentCard && this.currentCard.id === cardToSpeak.id && !this.isFlipped) {
          this.speak(cardToSpeak.word);
        }
      }, 120);
    }

    // Tải trước trượt 3 từ tiếp theo trong hàng đợi (Sliding Window JIT) cả âm thanh và hình ảnh
    for (let offset = 1; offset <= 3; offset++) {
      const nextCard = this.queue[this.currentIndex + offset];
      if (nextCard) {
        if (nextCard.word) {
          const cleanWord = nextCard.word.trim();
          preloadWordAudio(cleanWord, 'us', nextCard);
          preloadWordAudio(cleanWord, 'uk', nextCard);
        }
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

    const reviewKey = `${this.sessionId || 'session'}_${this.currentIndex}_${this.currentCard.id}`;
    if (this.ratedReviewKeys.has(reviewKey)) {
      return this.currentCard;
    }
    this.ratedReviewKeys.add(reviewKey);

    const now = new Date();
    const oldState = this.currentCard.fsrsState;
    const nextState = this.fsrs.calculateNextState(oldState, rating, now);

    // Lưu trạng thái thẻ
    if (shouldPersist) {
      StorageManager.saveCardState(nextState);

      // Ghi nhật ký học tập
      StorageManager.logReview({
        cardId: this.currentCard.id,
        word: this.currentCard.word,
        rating: rating,
        oldState: oldState.state,
        newState: nextState.state,
        scheduledDays: nextState.scheduled_days,
        stability: nextState.stability,
        difficulty: nextState.difficulty
      });
    }

    // Cập nhật thống kê phiên học
    if (rating === Rating.Again) this.sessionStats.again++;
    else if (rating === Rating.Hard) this.sessionStats.hard++;
    else if (rating === Rating.Good) this.sessionStats.good++;
    else if (rating === Rating.Easy) this.sessionStats.easy++;
    this.sessionStats.reviewedCount++;

    // Nếu chọn Again (Quên) trong lúc học, thêm thẻ vào cuối hàng đợi để ôn lại ngay (KHÔNG tăng tiến độ)
    if (rating === Rating.Again) {
      const repeatCard = { ...this.currentCard, fsrsState: nextState };
      this.queue.push(repeatCard);
    } else {
      // Đã nhớ (Hard, Good, Easy) -> Tăng tiến độ hoàn thành
      this.completedCount = (this.completedCount || 0) + 1;
    }

    this.currentIndex++;
    return this.loadCurrentCard();
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
