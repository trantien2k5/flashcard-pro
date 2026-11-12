/**
 * Quiz Engine Helpers - Feedback Audio, Smart Distractors, Queue Builder & Card Status
 */

import { StorageManager } from '../../services/storage.js';
import { WORDS } from '../../../data/index.js';
import { shuffle } from '../../utils.js';
import { QUIZ_SESSION_LIMIT, quizState } from './state.js';

/**
 * Phát âm thanh phản hồi nhẹ nhàng bằng Web Audio API
 */
export function playFeedbackTone(isCorrect) {
  try {
    if (!quizState.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) quizState.audioCtx = new AudioCtxClass();
    }
    const ctx = quizState.audioCtx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (isCorrect) {
      // Tiếng ting 2 âm sắc vui tươi
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Tiếng buzzer nhẹ cảnh báo
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(196, now + 0.1); // G3
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {}
}

/**
 * Sinh 3 đáp án gây nhiễu thông minh (Smart Distractors)
 */
export function generateDistractors(targetCard, allPool) {
  const correctMeaning = (targetCard.meaning || '').trim();
  const targetPos = (targetCard.pos || '').toLowerCase();
  const targetTopicId = Array.isArray(targetCard.topicIds) && targetCard.topicIds.length > 0 ? targetCard.topicIds[0] : null;

  const pool = allPool && allPool.length > 0 ? allPool : WORDS;
  const candidates = pool.filter(c => c.id !== targetCard.id && (c.meaning || '').trim() !== correctMeaning);

  // 1. Phân loại theo độ ưu tiên
  const sameTopicSamePos = [];
  const samePos = [];
  const sameTopic = [];
  const remaining = [];

  candidates.forEach(c => {
    const cPos = (c.pos || '').toLowerCase();
    const cTopicId = Array.isArray(c.topicIds) && c.topicIds.length > 0 ? c.topicIds[0] : null;

    const isPosMatch = targetPos && cPos === targetPos;
    const isTopicMatch = targetTopicId && cTopicId === targetTopicId;

    if (isPosMatch && isTopicMatch) sameTopicSamePos.push(c);
    else if (isPosMatch) samePos.push(c);
    else if (isTopicMatch) sameTopic.push(c);
    else remaining.push(c);
  });

  const selectedCards = [
    ...shuffle([...sameTopicSamePos]),
    ...shuffle([...samePos]),
    ...shuffle([...sameTopic]),
    ...shuffle([...remaining])
  ];

  const distractors = [];
  const seenMeanings = new Set([correctMeaning]);

  for (const c of selectedCards) {
    const m = (c.meaning || '').trim();
    if (m && !seenMeanings.has(m)) {
      seenMeanings.add(m);
      distractors.push(m);
      if (distractors.length >= 3) break;
    }
  }

  // Dự phòng nếu chưa đủ 3
  while (distractors.length < 3) {
    distractors.push(`Ý nghĩa dự phòng #${distractors.length + 1}`);
  }

  // Kết hợp đáp án đúng và 3 đáp án gây nhiễu rồi xáo trộn
  const options = [
    { text: correctMeaning, isCorrect: true },
    { text: distractors[0], isCorrect: false },
    { text: distractors[1], isCorrect: false },
    { text: distractors[2], isCorrect: false }
  ];

  return shuffle(options);
}

/**
 * Xây dựng hàng đợi câu hỏi trắc nghiệm đan xen 3-1-3-1 theo FSRS
 */
export function buildQuizQueue(app, customQueue = null, options = {}) {
  let queue = customQueue;
  if (!queue || queue.length === 0) {
    if (options && options.mode === 'redemption') {
      // Thử Thách Chuộc Lỗi: Lấy từ vựng (ưu tiên từ đã học)
      const allCards = app.deckManager ? app.deckManager.getAllCards() : WORDS;
      const cardStates = StorageManager.getAllCardStates() || {};
      const learnedPool = allCards.filter(c => {
        const s = cardStates[c.id];
        return s && (s.state > 0 || s.reps > 0);
      });
      const pool = learnedPool.length >= QUIZ_SESSION_LIMIT ? learnedPool : allCards;
      queue = shuffle([...pool]).slice(0, QUIZ_SESSION_LIMIT);
    } else {
      const studyQueue = app.deckManager.getStudyQueue(null, app.settings, null, { mode: 'interleave' });

      if (options && options.mode === 'new_only') {
        queue = (studyQueue.newCards || []).slice(0, QUIZ_SESSION_LIMIT);
      } else if (options && options.mode === 'due_only') {
        queue = (studyQueue.dueCards || []).slice(0, QUIZ_SESSION_LIMIT);
      } else {
        // VÒNG LẶP TRẮC NGHIỆM 3-1-3-1 ĐAN XEN NHẬN THỨC THEO NHỊP:
        // - Đợt 1: 3 từ đến hạn ôn
        // - Xen 1 từ khó / hay quên (nếu có)
        // - Đợt 2: 3 từ đến hạn ôn tiếp theo
        // - Xen 1 từ mới sau 2 đợt ôn (6 lượt ôn)
        const dueList = studyQueue.dueCards || [];
        const newList = studyQueue.newCards || [];
        const weakList = studyQueue.weakCards || [];

        if (dueList.length > 0 || newList.length > 0) {
          const interleaved = [];
          let d = 0;
          let w = 0;
          let n = 0;
          const seenIds = new Set();

          const pushCard = (card) => {
            if (card && card.id && !seenIds.has(card.id) && interleaved.length < QUIZ_SESSION_LIMIT) {
              seenIds.add(card.id);
              interleaved.push(card);
              return true;
            }
            return false;
          };

          while (interleaved.length < QUIZ_SESSION_LIMIT && (d < dueList.length || w < weakList.length || n < newList.length)) {
            for (let i = 0; i < 3 && d < dueList.length; i++) {
              pushCard(dueList[d++]);
            }

            if (w < weakList.length) {
              while (w < weakList.length && !pushCard(weakList[w++])) {}
            }

            for (let i = 0; i < 3 && d < dueList.length; i++) {
              pushCard(dueList[d++]);
            }

            if (n < newList.length) {
              while (n < newList.length && !pushCard(newList[n++])) {}
            }

            if (d >= dueList.length && w >= weakList.length && n >= newList.length) break;
          }
          queue = interleaved;
        } else if (weakList.length > 0) {
          queue = weakList.slice(0, QUIZ_SESSION_LIMIT);
        } else if (studyQueue.queue && studyQueue.queue.length > 0) {
          queue = studyQueue.queue.slice(0, QUIZ_SESSION_LIMIT);
        } else {
          // Luyện phản xạ từ vựng tổng hợp
          const allCards = app.deckManager.getAllCards() || WORDS;
          queue = shuffle([...allCards]).slice(0, Math.min(QUIZ_SESSION_LIMIT, 15));
        }
      }
    }
  }

  if (queue && queue.length > QUIZ_SESSION_LIMIT) {
    queue = queue.slice(0, QUIZ_SESSION_LIMIT);
  }
  return queue || [];
}

/**
 * Phân tích trạng thái FSRS của từ vựng hiện tại
 */
export function getCardStatusInfo(card) {
  const state = StorageManager.getCardState(card.id);
  if (!state || state.state === 0 || state.reps === 0) {
    return { label: '🌱 Từ mới', className: 'status-new' };
  }
  if (state.state === 3 || (state.lapses && state.lapses >= 2)) {
    return { label: '🔥 Hay quên', className: 'status-lapse' };
  }
  if (state.stability && state.stability >= 21) {
    return { label: '💎 Ghi nhớ sâu', className: 'status-mastered' };
  }
  if (state.stability && state.stability < 3) {
    return { label: '⚠️ Cần củng cố', className: 'status-fragile' };
  }
  return { label: '⚡ Tới hạn ôn', className: 'status-due' };
}

