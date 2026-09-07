/**
 * Audio Service - Dual Audio Engine & Native Pronunciation Hunter
 * Săn âm thanh người bản xứ chất lượng cao từ Youdao Studio, Google HD, Cambridge, DictionaryAPI
 * kết hợp bộ đệm RAM tải trước 0ms delay và Neural Web Speech API fallback.
 */

import { StorageManager } from './storage.js';

const _audioCache = new Map(); // Key: `${accent}_${cleanWord}` -> { audio: HTMLAudioElement, ready: boolean, failed: boolean, urls: [] }
let _currentPlayingAudio = null;
let _cachedUsVoice = null;
let _cachedUkVoice = null;
let _voicesInitialized = false;
let _audioUnlocked = false;
const _listeners = new Set(); // (playing: boolean, accent: string, word: string) => void

function getCurrentSettings(baseSettings = null) {
  if (typeof window !== 'undefined' && window.app?.settings) {
    return window.app.settings;
  }
  return baseSettings || StorageManager.getSettings();
}

/**
 * Đăng ký lắng nghe trạng thái phát âm thanh (để cập nhật UI equalizer sống động)
 */
export function onAudioPlayStateChange(callback) {
  if (typeof callback === 'function') {
    _listeners.add(callback);
    return () => _listeners.delete(callback);
  }
  return () => {};
}

function notifyPlayState(isPlaying, accent = 'us', word = '') {
  _listeners.forEach(cb => {
    try {
      cb(isPlaying, accent, word);
    } catch (e) {
      console.warn('Lỗi listener audio play state:', e);
    }
  });
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

export function initVoiceCache() {
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
 * SĂN TẤT CẢ GIỌNG BẢN XỨ (Native Audio Hunter Engine):
 * Tạo danh sách URL âm thanh người bản xứ theo thứ tự ưu tiên cao nhất -> thấp dần
 */
export function getNativeAudioUrls(cleanText, accent = 'us', cardObj = null) {
  const isUk = (accent || 'us').toLowerCase() === 'uk';
  const lower = (cleanText || '').toLowerCase().trim();
  const encoded = encodeURIComponent(lower);
  const singleWord = lower.replace(/[^a-z0-9]/g, '');
  const lang = isUk ? 'en-GB' : 'en-US';

  const urls = [];

  // 1. Ưu tiên cao nhất: Audio trực tiếp từ metadata của từ vựng nếu có
  if (cardObj && cardObj.audio) {
    if (isUk && cardObj.audio.uk) urls.push(cardObj.audio.uk);
    if (!isUk && cardObj.audio.us) urls.push(cardObj.audio.us);
  }

  // 2. Youdao Native Human Studio Recordings (Oxford & Merriam-Webster Studio CDNs)
  // Type 1: UK English (Giọng Anh chuẩn Oxford)
  // Type 2: US English (Giọng Mỹ chuẩn Webster)
  urls.push(`https://dict.youdao.com/dictvoice?audio=${encoded}&type=${isUk ? 1 : 2}`);

  // 3. Google Translate High-Definition Speech Engine (Bản xứ phát âm tự nhiên)
  urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encoded}`);
  urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${lang}&q=${encoded}`);

  // 4. Google GStatic Official Dictionary Sound CDN (nếu là từ đơn)
  if (singleWord && singleWord === lower) {
    urls.push(`https://ssl.gstatic.com/dictionary/static/sounds/20200429/${singleWord}--_${isUk ? 'gb' : 'us'}_1.mp3`);
    urls.push(`https://api.dictionaryapi.dev/media/pronunciations/en/${singleWord}-${isUk ? 'uk' : 'us'}.mp3`);
  }

  // 5. Fallback US/UK đảo chiều nếu nguồn trên hoàn toàn mất
  urls.push(`https://dict.youdao.com/dictvoice?audio=${encoded}&type=${isUk ? 2 : 1}`);

  return urls;
}

/**
 * Tải trước (Preload) 1 từ vựng vào bộ nhớ đệm RAM
 */
export function preloadWordAudio(cleanText, accent = 'us', cardObj = null) {
  if (!cleanText || typeof Audio === 'undefined') return null;
  const safeText = cleanText.trim().toLowerCase();
  const safeAccent = (accent || 'us').toLowerCase();
  const key = `${safeAccent}_${safeText}`;
  if (_audioCache.has(key)) {
    return _audioCache.get(key);
  }

  const urls = getNativeAudioUrls(safeText, safeAccent, cardObj);
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

/**
 * Tải trước cả 2 giọng US và UK cho danh sách thẻ
 */
export function preloadBothAccents(cleanText, cardObj = null) {
  if (!cleanText) return;
  preloadWordAudio(cleanText, 'us', cardObj);
  preloadWordAudio(cleanText, 'uk', cardObj);
}

/**
 * Dừng toàn bộ âm thanh đang phát
 */
export function stopAudio() {
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
  notifyPlayState(false);
}

/**
 * Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API)
 */
export function speakTTS(text, accent = 'us', lang = null, speechRate = 0.9, onEnd = null) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    notifyPlayState(false, accent, text);
    return;
  }

  try {
    initVoiceCache();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const targetLang = lang || (accent === 'uk' ? 'en-GB' : 'en-US');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const chosenVoice = accent === 'uk' 
      ? (_cachedUkVoice || _cachedUsVoice)
      : (_cachedUsVoice || _cachedUkVoice);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    notifyPlayState(true, accent, text);

    const finish = () => {
      notifyPlayState(false, accent, text);
      if (onEnd) onEnd();
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      finish();
      if (e && e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Lỗi SpeechSynthesis utterance:', e.error);
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Lỗi SpeechSynthesis TTS:', e);
    notifyPlayState(false, accent, text);
    if (onEnd) onEnd();
  }
}

/**
 * Phát âm từ vựng với Dual Native Audio Engine & Kích hoạt hiệu ứng Equalizer
 */
export function speak(text, options = {}) {
  if (!text || typeof text !== 'string') return;
  const cleanText = text.trim();
  if (!cleanText) return;

  const settings = getCurrentSettings(options.settings);
  const accent = (options.accent || settings.audioAccent || 'us').toLowerCase();
  const lang = options.lang || null;
  const speechRate = options.speechRate || settings.speechRate || 1.0;
  const onStart = options.onStart || null;
  const onEnd = options.onEnd || null;

  unlockAudioContext();
  stopAudio();

  const wordCount = cleanText.split(/\s+/).length;

  // Phát âm từ hoặc cụm từ ngắn (<= 6 từ) qua Native MP3 Audio
  if (wordCount <= 6 && typeof Audio !== 'undefined') {
    try {
      const cachedEntry = preloadWordAudio(cleanText, accent, options.cardObj);
      if (cachedEntry && !cachedEntry.failed) {
        const audio = cachedEntry.audio;
        _currentPlayingAudio = audio;
        audio.currentTime = 0;
        audio.playbackRate = speechRate;

        const handleEnded = () => {
          if (_currentPlayingAudio === audio) {
            _currentPlayingAudio = null;
          }
          notifyPlayState(false, accent, cleanText);
          if (onEnd) onEnd();
        };

        const handlePlaying = () => {
          notifyPlayState(true, accent, cleanText);
          if (onStart) onStart();
        };

        const fallbackTimer = setTimeout(() => {
          if (_currentPlayingAudio === audio && audio.paused) {
            try {
              audio.pause();
            } catch (e) {}
            _currentPlayingAudio = null;
            speakTTS(cleanText, accent, lang, speechRate, onEnd);
          }
        }, 2500);

        audio.addEventListener('playing', () => {
          clearTimeout(fallbackTimer);
          handlePlaying();
        }, { once: true });

        audio.addEventListener('ended', handleEnded, { once: true });

        audio.addEventListener('error', () => {
          if (cachedEntry.failed) {
            clearTimeout(fallbackTimer);
            speakTTS(cleanText, accent, lang, speechRate, onEnd);
          }
        }, { once: true });

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {}).catch((err) => {
            clearTimeout(fallbackTimer);
            if (err && err.name === 'AbortError') return;
            speakTTS(cleanText, accent, lang, speechRate, onEnd);
          });
        }
        return;
      }
    } catch (e) {
      console.warn('Lỗi phát Native Audio, chuyển sang TTS:', e);
    }
  }

  // Fallback sang Neural Web Speech API
  speakTTS(cleanText, accent, lang, speechRate, onEnd);
}

export const AudioService = {
  unlockAudioContext,
  initVoiceCache,
  preloadWordAudio,
  preloadBothAccents,
  getNativeAudioUrls,
  onAudioPlayStateChange,
  speak,
  speakTTS,
  stopAudio
};
