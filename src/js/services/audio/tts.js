/**
 * Audio Service - Neural Web Speech API TTS Engine (EN & VI)
 */

import { notifyPlayState, unlockAudioContext } from './state.js';

let _cachedUsVoice = null;
let _cachedUkVoice = null;
let _voicesInitialized = false;

function scoreVoice(voice, targetLang) {
  let score = 0;
  const name = (voice.name || '').toLowerCase();
  const lang = (voice.lang || '').toLowerCase();

  if (lang === targetLang.toLowerCase() || lang.replace('_', '-') === targetLang.toLowerCase()) {
    score += 50;
  } else if (lang.startsWith('en')) {
    score += 20;
  } else {
    return -100;
  }

  if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 100;
  if (name.includes('google')) score += 60;
  if (name.includes('siri') || name.includes('enhanced')) score += 60;
  if (name.includes('jenny') || name.includes('sonia') || name.includes('guy') || name.includes('aria')) score += 50;
  if (name.includes('samantha') || name.includes('daniel') || name.includes('karen')) score += 40;
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
 * Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API)
 */
export function speakTTS(text, accent = 'us', lang = null, speechRate = 0.9, onStartOrEnd = null, onEndCb = null) {
  let onStart = null;
  let onEnd = null;
  if (typeof onEndCb === 'function') {
    onStart = typeof onStartOrEnd === 'function' ? onStartOrEnd : null;
    onEnd = onEndCb;
  } else if (typeof onStartOrEnd === 'function') {
    onEnd = onStartOrEnd;
  }

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
    if (onStart) onStart();

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

    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        finish();
      }
    }, 12);
  } catch (e) {
    console.warn('Lỗi SpeechSynthesis TTS:', e);
    notifyPlayState(false, accent, text);
    if (onEnd) onEnd();
  }
}

/**
 * Phát âm Tiếng Việt (Web Speech API vi-VN)
 */
export function speakVi(text, onEnd = null) {
  if (!text || typeof text !== 'string') {
    if (onEnd) onEnd();
    return;
  }
  const cleanText = text.trim();
  if (!cleanText || typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  try {
    unlockAudioContext();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const viVoice = voices.find(v =>
        (v.lang || '').toLowerCase().startsWith('vi') ||
        (v.name || '').toLowerCase().includes('vietnam') ||
        (v.name || '').toLowerCase().includes('vietnamese')
      );
      if (viVoice) utterance.voice = viVoice;
    }

    let isFinished = false;
    let safetyTimer = null;
    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      if (onEnd) onEnd();
    };

    const timeoutDuration = Math.max(1600, cleanText.length * 100);
    safetyTimer = setTimeout(finish, timeoutDuration);

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Lỗi speakVi:', e);
    if (onEnd) onEnd();
  }
}
