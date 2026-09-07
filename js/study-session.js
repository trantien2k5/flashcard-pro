import { FSRS, Rating } from './fsrs.js';
import { StorageManager } from './storage.js';
import { 
  AudioService, 
  unlockAudioContext, 
  preloadWordAudio, 
  speak, 
  speakTTS, 
  stopAudio 
} from './audio-service.js';

export { unlockAudioContext };

function getCurrentSettings(baseSettings = null) {
  if (typeof window !== 'undefined' && window.app?.settings) {
    return window.app.settings;
  }
  return baseSettings || StorageManager.getSettings();
}

// ==========================================================================
// Study Session Manager Class
// ==========================================================================
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
    this.queue = [...queue];
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

    // Tải trước toàn bộ âm thanh trong phiên học để bấm phát tức thì 0ms delay
    this.preloadSessionAudio(this.queue);

    this.loadCurrentCard();
    return true;
  }

  /**
   * Cơ chế tải trước (Preload) toàn bộ thẻ trong phiên (Cả giọng US và UK)
   */
  preloadSessionAudio(cards) {
    if (!cards || !Array.isArray(cards) || typeof Audio === 'undefined') return;

    // 1. Tải ngay 5 từ đầu tiên tức thì cả 2 giọng US & UK
    const immediateBatch = cards.slice(0, 5);
    immediateBatch.forEach(card => {
      if (card && card.word) {
        preloadWordAudio(card.word.trim(), 'us', card);
        preloadWordAudio(card.word.trim(), 'uk', card);
      }
    });

    // 2. Tải nền các từ còn lại trong phiên theo từng đợt nhỏ để tiết kiệm tài nguyên
    if (cards.length > 5) {
      const remainingBatch = cards.slice(5);
      setTimeout(() => {
        remainingBatch.forEach((card, idx) => {
          setTimeout(() => {
            if (card && card.word) {
              preloadWordAudio(card.word.trim(), 'us', card);
              preloadWordAudio(card.word.trim(), 'uk', card);
            }
          }, idx * 60);
        });
      }, 300);
    }
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

    // Đảm bảo từ tiếp theo luôn được chuẩn bị sẵn cả 2 giọng US & UK
    if (this.currentIndex + 1 < this.queue.length && this.queue[this.currentIndex + 1]?.word) {
      const nextWord = this.queue[this.currentIndex + 1].word.trim();
      preloadWordAudio(nextWord, 'us');
      preloadWordAudio(nextWord, 'uk');
    }

    return this.currentCard;
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    // Mỗi lần lật thẻ thì tự động phát âm thanh bản xứ
    if (this.isFlipped && this.currentCard && this.currentCard.word && this.settings.autoPronounce !== false) {
      this.speak(this.currentCard.word);
    }
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
    speak(text, { settings: this.settings, lang });
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

