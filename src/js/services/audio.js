/**
 * Audio Service Facade - Dual Audio Engine & Native Pronunciation Hunter
 * Điều phối phát âm Native MP3 Audio + fallback Neural Web Speech API.
 */

import { getCurrentSettings } from '../utils.js';
import { onAudioPlayStateChange, notifyPlayState, unlockAudioContext } from './audio/state.js';
import { getNativeAudioUrls, preloadWordAudio } from './audio/native.js';
import { initVoiceCache, speakTTS, speakVi } from './audio/tts.js';

const NATIVE_MAX_WORDS = 6;
const NATIVE_FALLBACK_TIMEOUT_MS = 2500;

let _currentPlayingAudio = null;

export {
  onAudioPlayStateChange,
  unlockAudioContext,
  initVoiceCache,
  getNativeAudioUrls,
  preloadWordAudio,
  speakTTS,
  speakVi
};

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

  if (options.preloadOnly) {
    preloadWordAudio(cleanText, accent, options.cardObj);
    return;
  }

  unlockAudioContext();
  stopAudio();

  const wordCount = cleanText.split(/\s+/).length;

  // Phát âm từ hoặc cụm từ ngắn qua Native MP3 Audio
  if (wordCount <= NATIVE_MAX_WORDS && typeof Audio !== 'undefined') {
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
        }, NATIVE_FALLBACK_TIMEOUT_MS);

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

  speakTTS(cleanText, accent, lang, speechRate, onEnd);
}
