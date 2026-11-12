/**
 * Storage Backup & Restore Helpers
 * Module đóng gói & giải nén bản sao lưu Nano FSRS siêu nhẹ (giảm 85-95% dung lượng),
 * chuẩn hóa positional tuples [id, state, reps, ...] và đọc/tải tệp JSON.
 */

/**
 * Nén mảng trạng thái thẻ FSRS sang dạng mảng Positional Tuples rút gọn
 */
export function serializeCompactCards(allCardStates = {}) {
  const compactCards = [];
  for (const [id, s] of Object.entries(allCardStates)) {
    if (!s) continue;
    const stateNum = s.state ?? 0;
    const reps = s.reps ?? 0;
    const lapses = s.lapses ?? 0;
    const stability = Number((s.stability || 0).toFixed(2));
    const difficulty = Number((s.difficulty || 5).toFixed(2));
    const isLeech = s.isLeech === true || (s.lapses && s.lapses >= 8);
    const isSuspended = s.suspended === true;

    // Chỉ lưu thẻ người học đã tương tác hoặc có trạng thái cá nhân hóa
    if (stateNum !== 0 || reps > 0 || lapses > 0 || stability > 0 || isLeech || isSuspended) {
      const dueSec = s.due ? Math.floor(new Date(s.due).getTime() / 1000) : 0;
      const lastReviewSec = s.last_review ? Math.floor(new Date(s.last_review).getTime() / 1000) : 0;
      const flags = (isLeech ? 1 : 0) | (isSuspended ? 2 : 0);

      compactCards.push([
        id,
        stateNum,
        reps,
        lapses,
        stability,
        difficulty,
        dueSec,
        lastReviewSec,
        flags
      ]);
    }
  }
  return compactCards;
}

/**
 * Nén lịch sử học tập logs sang định dạng tuple rút gọn
 */
export function serializeCompactLogs(logs = []) {
  return logs.map(l => {
    const tsSec = l.timestamp ? Math.floor(new Date(l.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000);
    return [
      l.cardId || l.word || '',
      l.rating || 3,
      tsSec,
      typeof l.latencySec === 'number' ? Number(l.latencySec.toFixed(2)) : 0,
      typeof l.backViewSec === 'number' ? Number(l.backViewSec.toFixed(2)) : 0
    ];
  });
}

/**
 * Tạo payload bản sao lưu Nano FSRS 3.1
 */
export function createNanoBackupPayload({
  allCardStates = {},
  logs = [],
  customDecks = [],
  studyTimeMap = {},
  userProgress = null,
  streakState = null,
  userProfile = null,
  settings = null,
  preferences = null
} = {}) {
  return {
    v: '3.1',
    type: 'fc_fsrs_nano',
    t: Math.floor(Date.now() / 1000),
    p: userProfile,
    s: settings,
    c: serializeCompactCards(allCardStates),
    l: serializeCompactLogs(logs),
    d: customDecks,
    st: studyTimeMap,
    up: userProgress,
    streak: streakState,
    prefs: preferences
  };
}

/**
 * Chuẩn hóa trạng thái thẻ từ cả định dạng Positional Tuple rút gọn lẫn Legacy Object
 */
export function normalizeCardState(raw, legacyIdMap = {}) {
  if (!raw) return null;

  // 1. Hỗ trợ định dạng Compact Positional Tuple: [id, state, reps, lapses, stability, difficulty, dueSec, lastReviewSec, flags]
  if (Array.isArray(raw)) {
    const [id, state, reps, lapses, stability, difficulty, dueSec, lastReviewSec, flags] = raw;
    if (!id) return null;
    const canonicalId = (legacyIdMap && legacyIdMap[id]) || id;
    const flagNum = flags || 0;

    return {
      id: canonicalId,
      state: typeof state === 'number' ? state : 0,
      reps: typeof reps === 'number' ? reps : 0,
      lapses: typeof lapses === 'number' ? lapses : 0,
      stability: typeof stability === 'number' ? stability : 0,
      difficulty: typeof difficulty === 'number' ? difficulty : 5,
      due: dueSec > 0 ? new Date(dueSec * 1000).toISOString() : null,
      last_review: lastReviewSec > 0 ? new Date(lastReviewSec * 1000).toISOString() : null,
      isLeech: (flagNum & 1) === 1,
      suspended: (flagNum & 2) === 2,
      elapsed_days: 0,
      scheduled_days: 0
    };
  }

  if (typeof raw !== 'object') return null;

  // 2. Hỗ trợ định dạng Object (Legacy 2.0 & 1.0)
  let due = raw.due || raw.du || null;
  if (due && typeof due === 'number') {
    due = new Date(due > 1e11 ? due : due * 1000).toISOString();
  }
  let lastReview = raw.last_review || raw.lr || null;
  if (lastReview && typeof lastReview === 'number') {
    lastReview = new Date(lastReview > 1e11 ? lastReview : lastReview * 1000).toISOString();
  }

  const id = raw.id;
  if (!id) return null;
  const canonicalId = (legacyIdMap && legacyIdMap[id]) || id;

  const lapses = raw.lapses ?? raw.l ?? 0;
  return {
    id: canonicalId,
    state: raw.state ?? raw.s ?? 0,
    reps: raw.reps ?? raw.r ?? 0,
    lapses,
    stability: raw.stability ?? raw.st ?? 0,
    difficulty: raw.difficulty ?? raw.d ?? 5,
    due: due,
    last_review: lastReview,
    isLeech: Boolean(raw.isLeech === true || lapses >= 8),
    suspended: Boolean(raw.suspended === true),
    elapsed_days: raw.elapsed_days ?? 0,
    scheduled_days: raw.scheduled_days ?? 0
  };
}

/**
 * Chuẩn hóa một item log lịch sử học tập
 */
export function normalizeBackupLog(item) {
  if (!item) return null;
  if (Array.isArray(item)) {
    const [cardId, rating, tsSec, latencySec, backViewSec] = item;
    return {
      id: `log_${tsSec}_${cardId}`,
      cardId: cardId,
      rating: rating || 3,
      timestamp: tsSec > 0 ? new Date(tsSec * 1000).toISOString() : new Date().toISOString(),
      latencySec: latencySec || null,
      backViewSec: backViewSec || null
    };
  }
  return item;
}

/**
 * Kích hoạt tải tệp JSON về trình duyệt an toàn
 */
export function triggerJSONDownload(data, customFilename = null) {
  try {
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const timeTag = `${yyyy}${mm}${dd}_${hh}h${min}`;

    const safeFilename = customFilename || `flashcard_backup_${timeTag}.json`;
    const sizeKb = Number((blob.size / 1024).toFixed(1));
    const cardCount = Array.isArray(data?.c) ? data.c.length : Object.keys(data?.cards || {}).length;

    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      count: cardCount,
      sizeKb: sizeKb,
      filename: safeFilename
    };
  } catch (e) {
    console.error('[BackupService] Lỗi xuất file sao lưu:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Đọc nội dung file sao lưu (hỗ trợ giải nén GZIP .gz / .fcpro nếu có)
 */
export async function readBackupFileText(file) {
  if (!file) {
    throw new Error('Không tìm thấy tệp dữ liệu để nhập.');
  }

  if (file.name && (file.name.endsWith('.gz') || file.name.endsWith('.fcpro')) && typeof DecompressionStream !== 'undefined') {
    try {
      const ds = new DecompressionStream('gzip');
      const decompressedStream = file.stream().pipeThrough(ds);
      const response = new Response(decompressedStream);
      return await response.text();
    } catch (decompErr) {
      return await file.text();
    }
  }
  return await file.text();
}
