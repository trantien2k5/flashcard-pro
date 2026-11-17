/**
 * Audio Service - Playback State & Browser Autoplay Unlock
 */

let _audioUnlocked = false;
const _listeners = new Set(); // (playing: boolean, accent: string, word: string) => void

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

export function notifyPlayState(isPlaying, accent = 'us', word = '') {
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
