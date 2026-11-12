/**
 * Quiz Session Shared State & Constants
 */

import { Rating } from '../../core/fsrs.js';

export const QUIZ_SESSION_LIMIT = 25;

/**
 * Tạo đối tượng thống kê phiên trắc nghiệm mặc định
 */
export function createEmptyQuizStats(total = 0) {
  return {
    total,
    correct: 0,
    wrong: 0,
    comboMax: 0,
    totalLatencyMs: 0,
    ratings: {
      [Rating.Again]: 0,
      [Rating.Hard]: 0,
      [Rating.Good]: 0,
      [Rating.Easy]: 0
    }
  };
}

export const quizState = {
  app: null,
  queue: [],
  index: 0,
  startTime: 0,
  questionStartTime: 0,
  reflexInterval: null,
  comboCount: 0,
  isAnswerLocked: false,
  audioCtx: null,
  timerUnsubscribe: null,
  autoSpeakTimer: null,
  options: {},
  reviewedCards: [],
  keysBound: false,
  stats: createEmptyQuizStats(0)
};

