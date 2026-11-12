/**
 * Study Queue Scoring, 5:1 Interleaving & Final Hydration Helpers
 */

import { StorageManager } from '../../services/storage.js';
import { FSRS, State, isCardDue } from '../fsrs.js';
import { getLearningGoal } from '../../config.js';
import { normalizePos } from '../../utils.js';

function getCefrTierScore(cardLevel, cefrRatios) {
  const { a1Ratio, a2Ratio, b1Ratio, b2Ratio } = cefrRatios;
  if (a1Ratio < 0.80) {
    const table = { A1: 3000, A2: 1500, B1: 800, B2: 400 };
    return table[cardLevel] ?? 100;
  }
  if (a2Ratio < 0.80) {
    const table = { A2: 3000, A1: 2000, B1: 1000, B2: 500 };
    return table[cardLevel] ?? 100;
  }
  if (b1Ratio < 0.80) {
    const table = { B1: 3000, A2: 2000, A1: 1500, B2: 800 };
    return table[cardLevel] ?? 100;
  }
  if (b2Ratio < 0.80) {
    const table = { B2: 3000, B1: 2000, A2: 1500 };
    return table[cardLevel] ?? 500;
  }
  const c1Table = { C1: 3000, B2: 2000 };
  return c1Table[cardLevel] ?? 1000;
}

/**
 * Chấm điểm ưu tiên cho từng từ mới theo bậc CEFR tuần tự, mục tiêu học và từ loại cốt lõi
 */
export function scoreAndSortNewCards(newCards, cefrRatios, settings) {
  const activeGoalId = settings.activeGoal?.id || 'cefr-b1';
  const activeGoal = getLearningGoal(activeGoalId);
  const targetDecksSet = new Set(activeGoal?.targetDecks || []);
  const targetDecksList = Array.from(targetDecksSet);
  const targetCefrSet = new Set((activeGoal?.targetCefr || []).map(c => c.toUpperCase()));
  const posWeights = { verb: 300, noun: 250, adj: 200 };

  for (let i = 0; i < newCards.length; i++) {
    const c = newCards[i];
    const cardLevel = (c.level || c.cefr || 'A1').toUpperCase();
    const topicIds = Array.isArray(c.topicIds) ? c.topicIds : [];
    const deckId = c.deckId || '';
    const posKey = normalizePos(c.pos);

    let score = getCefrTierScore(cardLevel, cefrRatios);

    if (targetCefrSet.has(cardLevel)) score += 600;
    if (targetDecksSet.has(deckId)) score += 500;
    for (let j = 0; j < topicIds.length; j++) {
      const tid = topicIds[j];
      if (targetDecksSet.has(tid) || targetDecksList.some(d => tid.startsWith(d))) {
        score += 400;
        break;
      }
    }

    score += posWeights[posKey] ?? 100;

    if (deckId === 'top-1000-core' || topicIds.some(t => t.startsWith('top-1000-core'))) {
      score += 350;
    }

    c._score = score;
  }

  newCards.sort((a, b) => b._score - a._score);
}

/**
 * SSOT: Phân bổ hàng đợi học chính theo tỷ lệ 5 từ đến hạn : 1 từ mới, bổ sung thẻ khó ở cuối
 */
export function interleaveDueWeakNew(selectedDue, eligibleWeakCards, selectedNew) {
  const interleaved = [];
  let dIdx = 0;
  let wIdx = 0;
  let nIdx = 0;
  const seenIds = new Set();
  const MAX_TOTAL_WEAK_CARDS = 15;
  let weakAddedCount = 0;

  const addCard = (card) => {
    if (card && card.id && !seenIds.has(card.id)) {
      seenIds.add(card.id);
      interleaved.push(card);
      return true;
    }
    return false;
  };

  while (dIdx < selectedDue.length || (wIdx < eligibleWeakCards.length && weakAddedCount < MAX_TOTAL_WEAK_CARDS) || nIdx < selectedNew.length) {
    for (let i = 0; i < 5; i++) {
      if (dIdx < selectedDue.length) {
        addCard(selectedDue[dIdx++]);
      } else if (wIdx < eligibleWeakCards.length && weakAddedCount < MAX_TOTAL_WEAK_CARDS) {
        if (addCard(eligibleWeakCards[wIdx++])) {
          weakAddedCount++;
        }
      }
    }

    if (nIdx < selectedNew.length) {
      while (nIdx < selectedNew.length && !addCard(selectedNew[nIdx++])) {}
    }

    const hasMoreDue = dIdx < selectedDue.length;
    const hasMoreWeak = wIdx < eligibleWeakCards.length && weakAddedCount < MAX_TOTAL_WEAK_CARDS;
    const hasMoreNew = nIdx < selectedNew.length;
    if (!hasMoreDue && !hasMoreWeak && !hasMoreNew) {
      break;
    }
  }
  return interleaved;
}

/**
 * Lọc an toàn kép & hydrate đầy đủ từ điển cho hàng đợi cuối cùng
 */
export function filterAndHydrateFinalQueue({
  queueCards,
  mode,
  isAudioBlind,
  cardStates,
  wordsMap,
  deckId,
  now,
  isCardStudiedToday
}) {
  const queue = [];
  const seenQueueIds = new Set();

  for (const card of queueCards) {
    if (!card || !card.id || seenQueueIds.has(card.id)) continue;

    if (mode === 'new_only') {
      const st = cardStates[card.id] || StorageManager.getCardState(card.id);
      if (st && ((st.state !== State.New && st.state !== 0) || (st.reps && st.reps > 0) || st.last_review)) {
        continue;
      }
    } else {
      const st = cardStates[card.id] || StorageManager.getCardState(card.id);
      if (st && st.state !== State.New && st.state !== 0) {
        const isDueNow = isCardDue(st, now);
        if (isCardStudiedToday(card.id, st) && !isDueNow) {
          continue;
        }
      }
    }

    seenQueueIds.add(card.id);
    const cardObj = {
      ...(wordsMap.get(`${card.deckId || deckId}:${card.id}`) || wordsMap.get(card.id) || card),
      fsrsState: card.fsrsState || StorageManager.getCardState(card.id) || FSRS.createEmptyCard(card.id)
    };
    if (isAudioBlind) {
      cardObj._audioBlind = true;
    }
    queue.push(cardObj);
  }

  return queue;
}

