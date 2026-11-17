/**
 * Study Session - FSRS Rating, Adaptive Latency & Relearn Queue Handler
 */

import { Rating, State } from '../fsrs.js';

const LATENCY_NOISE_MIN_SEC = 0.3;
const LATENCY_NOISE_MAX_SEC = 7.0;
const MATURE_STABILITY_DAYS = 21;
const STUBBORN_AGAIN_THRESHOLD = 3;

/**
 * Bộ điều phối nhận thức tự thích ứng (Adaptive Cognitive Latency Engine)
 * Phân hóa nút Good dựa trên phản xạ thực tế kèm màng lọc chống nhiễu.
 */
export function resolveEffectiveRating(card, rating, latencySec) {
  if (rating !== Rating.Good || typeof latencySec !== 'number') {
    return rating;
  }
  if (latencySec >= LATENCY_NOISE_MAX_SEC || latencySec <= LATENCY_NOISE_MIN_SEC) {
    return rating;
  }

  const wordLen = Math.max(3, (card?.word || '').length);
  const fastThreshold = Math.min(1.8, 0.8 + (wordLen * 0.05));
  const slowThreshold = Math.max(3.8, 3.2 + (wordLen * 0.08));

  if (latencySec <= fastThreshold) {
    return Rating.Easy;
  }
  if (latencySec >= slowThreshold && latencySec < LATENCY_NOISE_MAX_SEC) {
    return Rating.Hard;
  }
  return rating;
}

/**
 * Cập nhật thống kê phiên học và hàng đợi củng cố (Closed-Loop Relearn) sau khi đánh giá thẻ
 */
export function applyRatingOutcome(session, { cardId, rating, effectiveRating, oldState, nextState, isRelearnPass }) {
  const isOldNew = oldState.state === State.New || oldState.state === 0;
  const isOldRelearning = oldState.state === State.Relearning || oldState.state === 3;
  const oldStability = Number(oldState.stability) || 0;
  const nextStability = Number(nextState.stability) || 0;

  if (isOldNew && !isRelearnPass) {
    session.sessionStats.newLearned = (session.sessionStats.newLearned || 0) + 1;
  }

  if (rating === Rating.Again) {
    session.sessionStats.again++;
    if (!isRelearnPass) {
      session.sessionStats.relearnCount = (session.sessionStats.relearnCount || 0) + 1;
    }

    const againCount = (session.inSessionAgainCounts.get(cardId) || 0) + 1;
    session.inSessionAgainCounts.set(cardId, againCount);

    if (session.relearnInSession) {
      session.relearningCardIds.add(cardId);
      let insertIdx;
      if (againCount < STUBBORN_AGAIN_THRESHOLD) {
        const jitter = Math.floor(Math.random() * 2);
        insertIdx = Math.min(session.queue.length, session.currentIndex + 1 + session.relearnStepOffset + jitter);
      } else {
        insertIdx = session.queue.length;
      }
      session.queue.splice(insertIdx, 0, {
        ...session.currentCard,
        _isRelearnPass: true,
        _againCountInSession: againCount,
        _isDeferredStubborn: againCount >= STUBBORN_AGAIN_THRESHOLD
      });
    } else {
      session.relearningCardIds.delete(cardId);
      session.completedUniqueIds.add(cardId);
    }
  } else {
    if (effectiveRating === Rating.Hard) session.sessionStats.hard++;
    else if (effectiveRating === Rating.Easy) session.sessionStats.easy++;
    else session.sessionStats.good++;

    if (isRelearnPass) {
      session.relearningCardIds.delete(cardId);
      session.sessionStats.inSessionRecovered = (session.sessionStats.inSessionRecovered || 0) + 1;
    }

    if (isOldRelearning || (oldState.lapses && oldState.lapses > 0 && (effectiveRating === Rating.Good || effectiveRating === Rating.Easy))) {
      session.sessionStats.recovered = (session.sessionStats.recovered || 0) + 1;
    }

    if (nextStability > oldStability) {
      session.sessionStats.strengthened = (session.sessionStats.strengthened || 0) + 1;
    }

    if (nextStability >= MATURE_STABILITY_DAYS && oldStability < MATURE_STABILITY_DAYS) {
      session.sessionStats.promotedMature = (session.sessionStats.promotedMature || 0) + 1;
    }

    session.completedUniqueIds.add(cardId);
  }

  session.sessionStats.reviewedCount++;
  session.completedCount = session.completedUniqueIds.size;
}
