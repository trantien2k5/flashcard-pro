/**
 * Behavioral Optimizer Submodule: CEFR Memory Matrix & Leech Radar Diagnostics
 */

import { State } from '../fsrs.js';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

export function resolveWordsMap(app) {
  let wordsMap = app?.deckManager?.wordsMap;
  if ((!wordsMap || wordsMap.size === 0) && Array.isArray(app?.deckManager?.allCards) && app.deckManager.allCards.length > 0) {
    wordsMap = new Map();
    for (const c of app.deckManager.allCards) {
      if (c && c.id) wordsMap.set(c.id, c);
    }
  }
  return wordsMap;
}

export function computeCefrBreakdown(cardStates, logs, wordsMap) {
  const cefrMap = new Map();
  for (const lvl of CEFR_LEVELS) {
    cefrMap.set(lvl, {
      level: lvl,
      wordsLearned: 0,
      reviews: 0,
      passScore: 0,
      latencySum: 0,
      latencyCount: 0
    });
  }

  const getLevelEntry = (cardId) => {
    const c = wordsMap ? wordsMap.get(cardId) : null;
    let lvl = (c?.level || 'A1').toUpperCase();
    if (!cefrMap.has(lvl)) lvl = 'A1';
    return cefrMap.get(lvl);
  };

  for (const [cid, st] of Object.entries(cardStates)) {
    if (!st || st.state === State.New || st.state === 0) continue;
    getLevelEntry(cid).wordsLearned++;
  }

  for (const l of logs) {
    if (!l.cardId || !(l.rating >= 1 && l.rating <= 4)) continue;
    const entry = getLevelEntry(l.cardId);
    entry.reviews++;
    if (l.rating === 3 || l.rating === 4) entry.passScore += 1;
    else if (l.rating === 2) entry.passScore += 0.7;
    if (typeof l.latencySec === 'number' && l.latencySec >= 0.2 && l.latencySec <= 60) {
      entry.latencySum += l.latencySec;
      entry.latencyCount++;
    }
  }

  return CEFR_LEVELS.map(lvl => {
    const item = cefrMap.get(lvl);
    const retPct = item.reviews > 0 ? Math.round((item.passScore / item.reviews) * 100) : 0;
    const avgLat = item.latencyCount > 0 ? Number((item.latencySum / item.latencyCount).toFixed(1)) : 0;
    let status = 'Đang tích lũy';
    let statusColor = '#94a3b8';
    if (item.reviews >= 4) {
      if (retPct >= 90 && (avgLat === 0 || avgLat <= 2.8)) {
        status = 'Vững vàng (Mastered)';
        statusColor = '#10b981';
      } else if (retPct >= 80) {
        status = 'Tiến bộ ổn định';
        statusColor = '#3b82f6';
      } else {
        status = 'Cần gia cố thêm';
        statusColor = '#f59e0b';
      }
    }
    return {
      level: lvl,
      wordsLearned: item.wordsLearned,
      reviews: item.reviews,
      retentionPct: retPct,
      avgLatency: avgLat,
      status,
      statusColor,
      hasData: item.reviews > 0
    };
  });
}

export function computeLeechDiagnostics(cardStates, wordsMap) {
  const leechList = [];
  for (const [cid, st] of Object.entries(cardStates)) {
    if (!st) continue;
    const lapses = Number(st.lapses) || 0;
    if (st.isLeech === true || lapses >= 8) {
      const c = wordsMap ? wordsMap.get(cid) : null;
      leechList.push({
        cardId: cid,
        word: c?.word || st.word || cid,
        meaning: c?.meaning || '',
        ipa: c?.ipa || '',
        level: (c?.level || 'A1').toUpperCase(),
        lapses,
        reps: st.reps || 0,
        stability: st.stability ? Number(st.stability.toFixed(1)) : 0
      });
    }
  }
  leechList.sort((a, b) => b.lapses - a.lapses);
  return {
    count: leechList.length,
    topWords: leechList.slice(0, 5)
  };
}
