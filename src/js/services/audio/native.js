/**
 * Audio Service - Native Audio Hunter & RAM Preload Cache
 */

const MAX_AUDIO_CACHE_SIZE = 100;
const _audioCache = new Map(); // Key: `${accent}_${cleanWord}` -> { audio, ready, failed, urls, urlIndex }

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
  urls.push(`https://dict.youdao.com/dictvoice?audio=${encoded}&type=${isUk ? 1 : 2}`);

  // 3. Google Translate High-Definition Speech Engine
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
  if (!urls || urls.length === 0) return null;

  const audio = new Audio();
  audio.preload = 'auto';

  const entry = {
    audio,
    ready: false,
    failed: false,
    urls,
    urlIndex: 0
  };

  audio.addEventListener('canplaythrough', () => {
    entry.ready = true;
  }, { once: true });

  audio.addEventListener('error', () => {
    // Dừng preload khi URL đầu không tải được, tránh cascade hàng chục request làm nghẽn main thread
    entry.failed = true;
  }, { once: true });

  try {
    audio.src = urls[0];
    audio.load();
  } catch (e) {
    entry.failed = true;
  }

  // Giới hạn bộ nhớ cache âm thanh để tránh rò rỉ RAM khi học nhiều giờ
  if (_audioCache.size > MAX_AUDIO_CACHE_SIZE) {
    const oldestKey = _audioCache.keys().next().value;
    const oldestEntry = _audioCache.get(oldestKey);
    if (oldestEntry && oldestEntry.audio) {
      try {
        oldestEntry.audio.pause();
        oldestEntry.audio.src = '';
        oldestEntry.audio.load();
      } catch (e) {}
    }
    _audioCache.delete(oldestKey);
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
