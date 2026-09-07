/**
 * Study Session Manager:
 * Handles 3D Flashcard Flip, FSRS Grading, Dual Native Audio Engine with Zero-Delay Preloading, and Queue Progress.
 */

import { FSRS, Rating } from './fsrs.js';
import { StorageManager } from './storage.js';

// ==========================================================================
// 1. Dual Audio Engine & In-Memory Preloader
// ==========================================================================
const _audioCache = new Map(); // Key: `${accent}_${cleanWord}` -> { audio: HTMLAudioElement, ready: boolean, failed: boolean }
let _currentPlayingAudio = null;
let _cachedUsVoice = null;
let _cachedUkVoice = null;
let _voicesInitialized = false;
let _audioUnlocked = false;

function getCurrentSettings(baseSettings = null) {
  if (typeof window !== 'undefined' && window.app?.settings) {
    return window.app.settings;
  }
  return baseSettings || StorageManager.getSettings();
}

/**
 * Mở khóa quyền Autoplay của trình duyệt qua thao tác đầu tiên của người dùng
 */
export function unlockAudioContext() {
  if (_audioUnlocked || typeof window === 'undefined') return;
  try {
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    const p = silentAudio.play();
    if (p !== undefined) {
      p.then(() => {
        _audioUnlocked = true;
      }).catch(() => {});
    }
  } catch (e) {}

  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudioContext();
    window.removeEventListener('pointerdown', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };
  window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
  window.addEventListener('click', handleFirstInteraction, { passive: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true });
}

function scoreVoice(voice, targetLang) {
  let score = 0;
  const name = (voice.name || '').toLowerCase();
  const lang = (voice.lang || '').toLowerCase();

  // Match target accent (e.g. en-us vs en-gb)
  if (lang === targetLang.toLowerCase() || lang.replace('_', '-') === targetLang.toLowerCase()) {
    score += 50;
  } else if (lang.startsWith('en')) {
    score += 20;
  } else {
    return -100; // Not English
  }

  // Premium Neural / Natural voices (Edge, Chrome, Apple, Android)
  if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 100;
  if (name.includes('google')) score += 60;
  if (name.includes('siri') || name.includes('enhanced')) score += 60;
  if (name.includes('jenny') || name.includes('sonia') || name.includes('guy') || name.includes('aria')) score += 50;
  if (name.includes('samantha') || name.includes('daniel') || name.includes('karen')) score += 40;

  // Penalize robotic legacy desktop voices
  if (name.includes('desktop') || name.includes('microsoft david') || name.includes('microsoft zira')) score -= 30;

  return score;
}

function initVoiceCache() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const update = () => {
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const usVoices = [...voices].sort((a, b) => scoreVoice(b, 'en-US') - scoreVoice(a, 'en-US'));
        _cachedUsVoice = usVoices.length > 0 && scoreVoice(usVoices[0], 'en-US') > 0 ? usVoices[0] : null;

        const ukVoices = [...voices].sort((a, b) => scoreVoice(b, 'en-GB') - scoreVoice(a, 'en-GB'));
        _cachedUkVoice = ukVoices.length > 0 && scoreVoice(ukVoices[0], 'en-GB') > 0 ? ukVoices[0] : null;
      }
    } catch (e) {
      console.warn('Lỗi initVoiceCache:', e);
    }
  };

  update();
  if (!_voicesInitialized && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = update;
    _voicesInitialized = true;
  }
}

if (typeof window !== 'undefined') {
  initVoiceCache();
}

/**
 * Tạo URL âm thanh người bản xứ theo thứ tự ưu tiên
 */
function getNativeAudioUrls(cleanText, accent = 'us') {
  const isUk = (accent || 'us').toLowerCase() === 'uk';
  const lower = (cleanText || '').toLowerCase().trim();
  const encoded = encodeURIComponent(lower);
  const lang = isUk ? 'en-GB' : 'en-US';
  return [
    `https://dict.youdao.com/dictvoice?audio=${encoded}&type=${isUk ? 1 : 2}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encoded}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encoded}`
  ];
}


/**
 * Tải trước (Preload) 1 từ vựng vào bộ nhớ đệm
 */
function preloadWordAudio(cleanText, accent = 'us') {
  if (!cleanText || typeof Audio === 'undefined') return null;
  const safeText = cleanText.trim().toLowerCase();
  const safeAccent = (accent || 'us').toLowerCase();
  const key = `${safeAccent}_${safeText}`;
  if (_audioCache.has(key)) {
    return _audioCache.get(key);
  }

  const urls = getNativeAudioUrls(safeText, safeAccent);
  const audio = new Audio();
  audio.preload = 'auto';

  const entry = {
    audio: audio,
    ready: false,
    failed: false,
    urls,
    urlIndex: 0
  };

  audio.addEventListener('canplaythrough', () => {
    entry.ready = true;
  }, { once: true });

  audio.addEventListener('error', () => {
    if (entry.urlIndex < urls.length - 1) {
      entry.urlIndex++;
      entry.ready = false;
      try {
        audio.src = urls[entry.urlIndex];
        audio.load();
      } catch (e) {}
    } else {
      entry.failed = true;
    }
  });

  try {
    audio.src = urls[entry.urlIndex];
    audio.load();
  } catch (e) {
    entry.failed = true;
  }

  _audioCache.set(key, entry);
  return entry;
}


// ==========================================================================
// 2. Study Session Manager Class
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

    initVoiceCache();
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
   * Cơ chế tải trước (Preload) toàn bộ thẻ trong phiên
   */
  preloadSessionAudio(cards) {
    if (!cards || !Array.isArray(cards) || typeof Audio === 'undefined') return;
    const accent = (this.settings.audioAccent || 'us').toLowerCase();

    // 1. Tải ngay 5 từ đầu tiên tức thì
    const immediateBatch = cards.slice(0, 5);
    immediateBatch.forEach(card => {
      if (card && card.word) {
        preloadWordAudio(card.word.trim(), accent);
      }
    });

    // 2. Tải nền các từ còn lại trong phiên theo từng đợt nhỏ để tiết kiệm tài nguyên
    if (cards.length > 5) {
      const remainingBatch = cards.slice(5);
      setTimeout(() => {
        remainingBatch.forEach((card, idx) => {
          setTimeout(() => {
            if (card && card.word) {
              preloadWordAudio(card.word.trim(), accent);
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

    // Đảm bảo từ tiếp theo luôn được chuẩn bị sẵn
    const accent = (this.settings.audioAccent || 'us').toLowerCase();
    if (this.currentIndex + 1 < this.queue.length && this.queue[this.currentIndex + 1]?.word) {
      preloadWordAudio(this.queue[this.currentIndex + 1].word.trim(), accent);
    }

    // Tự động phát âm khi vào thẻ nếu được bật trong cài đặt
    if (this.settings.autoPronounce && this.currentCard.word) {
      this.speak(this.currentCard.word);
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
   * Phát âm từ vựng với Dual Native Audio Engine:
   * 1. Ưu tiên âm thanh người bản xứ đã tải trước (0ms delay)
   * 2. Tự động fallback sang Google Native MP3 / Neural Web Speech API khi mất mạng hoặc gặp lỗi
   */
  speak(text, lang = null) {
    if (!text || typeof text !== 'string') return;
    const cleanText = text.trim();
    if (!cleanText) return;

    unlockAudioContext();
    this.updateSettings();
    this.stopAudio();

    const accent = (this.settings.audioAccent || 'us').toLowerCase();
    const wordCount = cleanText.split(/\s+/).length;

    // Phát âm từ hoặc cụm từ ngắn (<= 6 từ)
    if (wordCount <= 6 && typeof Audio !== 'undefined') {
      try {
        const cachedEntry = preloadWordAudio(cleanText, accent);
        if (cachedEntry && !cachedEntry.failed) {
          const audio = cachedEntry.audio;
          _currentPlayingAudio = audio;
          audio.currentTime = 0;
          audio.playbackRate = this.settings.speechRate || 1.0;
          const fallbackTimer = setTimeout(() => {
            if (_currentPlayingAudio === audio && audio.paused) {
              try {
                audio.pause();
              } catch (e) {}
              _currentPlayingAudio = null;
              this.speakTTS(cleanText, accent, lang);
            }
          }, 2500);
          audio.addEventListener('playing', () => clearTimeout(fallbackTimer), { once: true });
          audio.addEventListener('error', () => {
            if (cachedEntry.failed) {
              clearTimeout(fallbackTimer);
              this.speakTTS(cleanText, accent, lang);
            }
          }, { once: true });

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {}).catch((err) => {
              clearTimeout(fallbackTimer);
              // Nếu bị hủy do bấm liên tục (AbortError), không làm gì thêm
              if (err && err.name === 'AbortError') return;
              // Nếu lỗi Autoplay hoặc Network, chuyển sang Neural TTS mượt mà
              this.speakTTS(cleanText, accent, lang);
            });
          }
          return;
        }
      } catch (e) {
        console.warn('Lỗi phát Native Audio, chuyển sang TTS:', e);
      }
    }

    // Fallback sang Neural Web Speech API
    this.speakTTS(cleanText, accent, lang);
  }

  /**
   * Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API)
   */
  speakTTS(text, accent = 'us', lang = null) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      initVoiceCache();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const targetLang = lang || (accent === 'uk' ? 'en-GB' : 'en-US');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = this.settings.speechRate || 0.9;
      utterance.pitch = 1.0;

      const chosenVoice = accent === 'uk' 
        ? (_cachedUkVoice || _cachedUsVoice)
        : (_cachedUsVoice || _cachedUkVoice);

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.onerror = (e) => {
        if (e && e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Lỗi SpeechSynthesis utterance:', e.error);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Lỗi SpeechSynthesis TTS:', e);
    }
  }

  /**
   * Dừng toàn bộ âm thanh đang phát an toàn
   */
  stopAudio() {
    if (_currentPlayingAudio) {
      try {
        _currentPlayingAudio.pause();
        _currentPlayingAudio.currentTime = 0;
      } catch (e) {}
      _currentPlayingAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}
