/**
 * Audio Service - Dual Audio Engine
 * Combines Native Studio Audio MP3 (priority 1) with zero-delay preloader
 * and Neural Web Speech API fallback.
 */

import { StorageManager } from './storage.js';

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
 * Tạo URL âm thanh người bản xứ theo thứ tự ưu tiên
 */
export function getNativeAudioUrls(cleanText, accent = 'us') {
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
export function preloadWordAudio(cleanText, accent = 'us') {
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
}

/**
 * Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API)
 */
export function speakTTS(text, accent = 'us', lang = null, speechRate = 0.9) {
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
    utterance.rate = speechRate;
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
 * Phát âm từ vựng với Dual Native Audio Engine
 */
export function speak(text, options = {}) {
  if (!text || typeof text !== 'string') return;
  const cleanText = text.trim();
  if (!cleanText) return;

  const settings = getCurrentSettings(options.settings);
  const accent = (options.accent || settings.audioAccent || 'us').toLowerCase();
  const lang = options.lang || null;
  const speechRate = options.speechRate || settings.speechRate || 1.0;

  unlockAudioContext();
  stopAudio();

  const wordCount = cleanText.split(/\s+/).length;

  // Phát âm từ hoặc cụm từ ngắn (<= 6 từ) qua Native MP3 Audio
  if (wordCount <= 6 && typeof Audio !== 'undefined') {
    try {
      const cachedEntry = preloadWordAudio(cleanText, accent);
      if (cachedEntry && !cachedEntry.failed) {
        const audio = cachedEntry.audio;
        _currentPlayingAudio = audio;
        audio.currentTime = 0;
        audio.playbackRate = speechRate;
        const fallbackTimer = setTimeout(() => {
          if (_currentPlayingAudio === audio && audio.paused) {
            try {
              audio.pause();
            } catch (e) {}
            _currentPlayingAudio = null;
            speakTTS(cleanText, accent, lang, speechRate);
          }
        }, 2500);
        audio.addEventListener('playing', () => clearTimeout(fallbackTimer), { once: true });
        audio.addEventListener('error', () => {
          if (cachedEntry.failed) {
            clearTimeout(fallbackTimer);
            speakTTS(cleanText, accent, lang, speechRate);
          }
        }, { once: true });

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {}).catch((err) => {
            clearTimeout(fallbackTimer);
            if (err && err.name === 'AbortError') return;
            speakTTS(cleanText, accent, lang, speechRate);
          });
        }
        return;
      }
    } catch (e) {
      console.warn('Lỗi phát Native Audio, chuyển sang TTS:', e);
    }
  }

  // Fallback sang Neural Web Speech API
  speakTTS(cleanText, accent, lang, speechRate);
}

export const AudioService = {
  unlockAudioContext,
  initVoiceCache,
  preloadWordAudio,
  speak,
  speakTTS,
  stopAudio
};
