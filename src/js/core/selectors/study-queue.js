/**
 * Study Queue Construction & Mode Counters
 */

import { StorageManager } from '../../services/storage.js';
import { FSRS, State, isCardDue } from '../fsrs.js';
import { STUDY_MODES } from '../../config.js';
import { getLocalDateKey } from '../../utils.js';
import { TopicRepository } from '../../../data/index.js';
import {
  scoreAndSortNewCards,
  interleaveDueWeakNew,
  filterAndHydrateFinalQueue
} from './queue-scoring.js';

function resolveTargetCards(deckManager, deckId, subtopic) {
  let targetCards = [];

  if (deckId && subtopic) {
    targetCards = deckManager.getSubtopicCards(deckId, subtopic);
  } else if (deckId) {
    const deck = deckManager.getDeckById(deckId);
    const isProgressive = deck && deck.isProgressive === true;
    if (isProgressive) {
      const rawSubtopics = Array.isArray(deck.subtopics) ? deck.subtopics : (Array.isArray(deck.subcategories) ? deck.subcategories : []);
      const userProgress = StorageManager.getUserProgress();
      const unlockedCards = [];
      let prevDone = true;

      for (let i = 0; i < rawSubtopics.length; i++) {
        const subObj = rawSubtopics[i];
        const subId = typeof subObj === 'object' ? (subObj.id || `${deck.id}-${i}`) : `${deck.id}-${i}`;
        const subCards = deckManager.getSubtopicCards(deckId, subObj);

        const isCardsLearned = subCards.length > 0 && subCards.every(c => {
          const s = StorageManager.getCardState(c.id);
          return s && s.state !== State.New && s.state !== 0;
        });
        const isSubRecorded = StorageManager.isSubtopicCompleted(subId) ||
          (typeof subObj === 'object' && subObj.id && StorageManager.isSubtopicCompleted(subObj.id));
        const thisSubDone = isCardsLearned || isSubRecorded;

        let isUnlocked = (i === 0) || prevDone;
        if (!isUnlocked) {
          const unlockRule = typeof subObj === 'object' && subObj.unlockRule
            ? subObj.unlockRule
            : { type: 'completeSubtopic', subtopicId: rawSubtopics[i - 1]?.id || `${deck.id}-${i - 1}` };
          isUnlocked = TopicRepository.isSubtopicUnlocked({ id: subId, unlockRule }, userProgress);
        }

        if (isUnlocked) {
          unlockedCards.push(...subCards);
        }

        prevDone = thisSubDone;
      }
      targetCards = unlockedCards.length > 0 ? unlockedCards : deckManager.getCardsByDeckId(deckId);
    } else {
      targetCards = deckManager.getCardsByDeckId(deckId);
    }
  } else {
    return deckManager.allCards;
  }

  const seenTargetIds = new Set();
  const uniqueTargetCards = [];
  for (const c of targetCards) {
    if (c && c.id && !seenTargetIds.has(c.id)) {
      seenTargetIds.add(c.id);
      uniqueTargetCards.push(c);
    }
  }
  return uniqueTargetCards;
}

function selectQueueByMode(mode, { selectedDue, eligibleWeakCards, selectedNew, cardStates }) {
  if (mode === 'due_only') {
    return selectedDue;
  }
  if (mode === 'new_only') {
    return selectedNew.filter(c => {
      const st = cardStates[c.id] || StorageManager.getCardState(c.id);
      if (!st) return true;
      const isActuallyNew = (st.state === State.New || st.state === 0) && (!st.reps || st.reps === 0) && !st.last_review;
      return isActuallyNew && !st.suspended;
    });
  }
  if (mode === 'weak_hunter' || mode === STUDY_MODES.WEAK_HUNTER) {
    return eligibleWeakCards.length > 0 ? eligibleWeakCards.slice(0, 20) : selectedDue.slice(0, 20);
  }
  if (mode === 'sprint_10' || mode === STUDY_MODES.SPRINT_10) {
    if (selectedDue.length >= 10) return selectedDue.slice(0, 10);
    const pool = [...selectedDue, ...eligibleWeakCards, ...selectedNew];
    const seen = new Set();
    const sprint = [];
    for (const c of pool) {
      if (c && c.id && !seen.has(c.id)) {
        seen.add(c.id);
        sprint.push(c);
        if (sprint.length >= 10) break;
      }
    }
    return sprint;
  }
  if (mode === 'audio_blind' || mode === STUDY_MODES.AUDIO_BLIND) {
    return selectedDue.length > 0 ? selectedDue : [...selectedDue, ...selectedNew];
  }
  if (mode === 'due_first' || mode === 'auto' || mode === 'mixed' || mode === 'interleave') {
    return interleaveDueWeakNew(selectedDue, eligibleWeakCards, selectedNew);
  }
  return [...selectedDue, ...selectedNew];
}

/**
 * Xây dựng hàng đợi học tập thông minh theo thuật toán FSRS và quy tắc phân bổ 5:1
 */
export function buildStudyQueue(deckManager, deckId = null, userSettings = {}, subtopic = null, options = {}) {
  const settings = { dailyNewLimit: 10, dailyReviewLimit: 50, ...userSettings };
  const mode = options?.mode || (options?.onlyDue ? 'due_only' : 'auto');
  const isAudioBlind = mode === STUDY_MODES.AUDIO_BLIND || options?.audioBlind === true || mode === 'audio_blind';
  const stateRev = StorageManager.getStateRevision();
  const cacheKey = `${deckId || 'all'}_${subtopic || 'none'}_${mode}_${isAudioBlind ? 'ab' : 'norm'}_${stateRev}`;

  if (deckManager._studyQueueCache && deckManager._studyQueueCache.has(cacheKey)) {
    return deckManager._studyQueueCache.get(cacheKey);
  }

  const isAppWide = (deckId === null || deckId === undefined);
  const targetCards = resolveTargetCards(deckManager, deckId, subtopic);

  const now = new Date();
  const rolloverHour = Number(settings.rolloverHour) || 0;
  const todayKey = getLocalDateKey(now, rolloverHour);

  const logs = StorageManager.getStudyLogs() || [];
  const todayLogs = logs.filter(l => l.timestamp && getLocalDateKey(l.timestamp, rolloverHour) === todayKey);
  const reviewedTodayCardIds = new Set(todayLogs.map(l => l.cardId));

  const isCardStudiedToday = (cardId, state) => {
    if (reviewedTodayCardIds.has(cardId)) return true;
    return Boolean(state && state.last_review && getLocalDateKey(state.last_review, rolloverHour) === todayKey);
  };

  const dueCards = [];
  const newCards = [];
  const learningCards = [];
  const weakCards = [];

  const cardStates = StorageManager.getAllCardStates() || {};
  let a1Learned = 0, a1Total = 0;
  let a2Learned = 0, a2Total = 0;
  let b1Learned = 0, b1Total = 0;
  let b2Learned = 0, b2Total = 0;

  for (let i = 0; i < targetCards.length; i++) {
    const card = targetCards[i];
    const hydratedCard = isAppWide
      ? card
      : (deckManager.wordsMap.get(`${card.deckId || deckId}:${card.id}`) || deckManager.wordsMap.get(card.id) || card);
    const state = cardStates[card.id] || StorageManager.getCardState(card.id);

    const lvl = (card.level || card.cefr || 'A1').toUpperCase();
    const isLearned = state && state.state !== State.New && state.state !== 0 && !state.suspended;
    if (lvl === 'A1') { a1Total++; if (isLearned) a1Learned++; }
    else if (lvl === 'A2') { a2Total++; if (isLearned) a2Learned++; }
    else if (lvl === 'B1') { b1Total++; if (isLearned) b1Learned++; }
    else if (lvl === 'B2') { b2Total++; if (isLearned) b2Learned++; }

    if (state && state.suspended === true) continue;

    const isCardActuallyNew = (!state || state.state === State.New || state.state === 0) &&
                              (!state || !state.reps || state.reps === 0) &&
                              (!state || !state.last_review);
    const isDue = isCardDue(state, now);
    const wasStudiedToday = isCardStudiedToday(card.id, state);

    if (isCardActuallyNew) {
      newCards.push({ ...hydratedCard, fsrsState: state || FSRS.createEmptyCard(card.id) });
    } else if (isDue) {
      dueCards.push({ ...hydratedCard, fsrsState: state });
    } else if (state.state === State.Learning || state.state === State.Relearning) {
      learningCards.push({ ...hydratedCard, fsrsState: state });
    }

    if (state && state.state !== State.New && state.state !== 0 && !state.suspended) {
      const s = Number(state.stability) || 0;
      const d = Number(state.difficulty) || 0;
      const lapses = Number(state.lapses) || 0;
      const isLeech = state.isLeech === true || lapses >= 8;
      if (isLeech || s < 3 || d >= 7.0) {
        weakCards.push({
          ...hydratedCard,
          fsrsState: state,
          _weakScore: (lapses * 15) + ((10 - Math.min(10, s)) * 2) + d,
          _isDue: isDue,
          _wasStudiedToday: wasStudiedToday
        });
      }
    }
  }

  weakCards.sort((a, b) => (b._weakScore || 0) - (a._weakScore || 0));

  const eligibleWeakCards = weakCards.filter(c => {
    if (c._wasStudiedToday && !c._isDue) return false;
    const dueTime = c.fsrsState?.due ? new Date(c.fsrsState.due).getTime() : 0;
    return dueTime <= now.getTime();
  });

  const fsrsInstance = new FSRS({
    w: settings.fsrsW,
    requestRetention: Number(settings.requestRetention) || 0.90,
    enableFuzz: settings.enableFuzz !== false
  });

  dueCards.forEach(c => {
    c._retrievability = fsrsInstance.getRetrievability(c.fsrsState, now);
    c._dueTime = c.fsrsState?.due ? new Date(c.fsrsState.due).getTime() : 0;
  });

  dueCards.sort((a, b) => {
    if (a._retrievability !== b._retrievability) return a._retrievability - b._retrievability;
    return a._dueTime - b._dueTime;
  });

  scoreAndSortNewCards(newCards, {
    a1Ratio: a1Total > 0 ? (a1Learned / a1Total) : 0,
    a2Ratio: a2Total > 0 ? (a2Learned / a2Total) : 0,
    b1Ratio: b1Total > 0 ? (b1Learned / b1Total) : 0,
    b2Ratio: b2Total > 0 ? (b2Learned / b2Total) : 0
  }, settings);

  const dailyGoalNew = Number(settings.activeGoal?.dailyNew) || Number(settings.dailyNewLimit) || 10;
  const newCardsStudiedToday = todayLogs.filter(l =>
    l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
  ).length;
  const maxNew = (!deckId && !subtopic)
    ? Math.max(0, dailyGoalNew - newCardsStudiedToday)
    : Math.max(1, dailyGoalNew);

  const selectedDue = dueCards;
  const selectedNew = subtopic
    ? newCards
    : newCards.slice(0, mode === 'new_only' ? Math.max(1, dailyGoalNew) : maxNew);

  const queueCards = selectQueueByMode(mode, {
    selectedDue,
    eligibleWeakCards,
    selectedNew,
    cardStates
  });

  const queue = filterAndHydrateFinalQueue({
    queueCards,
    mode,
    isAudioBlind,
    cardStates,
    wordsMap: deckManager.wordsMap,
    deckId,
    now,
    isCardStudiedToday
  });

  const result = {
    dueCards: selectedDue,
    newCards: selectedNew,
    weakCards,
    learningCards,
    isBacklogProtected: dueCards.length >= 35,
    totalDue: dueCards.length,
    totalNew: newCards.length,
    totalWeak: weakCards.length,
    totalLearned: targetCards.length - newCards.length,
    totalCards: targetCards.length,
    queue
  };

  if (!deckManager._studyQueueCache) deckManager._studyQueueCache = new Map();
  if (deckManager._studyQueueCache.size > 20) deckManager._studyQueueCache.clear();
  deckManager._studyQueueCache.set(cacheKey, result);

  return result;
}

/**
 * Thống kê số lượng thẻ tương ứng cho từng Chế Độ Học Có Chủ Đích
 */
export function computeStudyModeCounts(deckManager, deckId = null, userSettings = {}) {
  const studyData = buildStudyQueue(deckManager, deckId, userSettings, null, { mode: 'due_first' });
  const dueCount = studyData.totalDue || 0;
  const newCount = studyData.newCards?.length || 0;
  const weakCount = studyData.totalWeak || 0;
  const sprintCount = Math.min(10, dueCount > 0 ? dueCount : (weakCount > 0 ? weakCount : (newCount > 0 ? newCount : 10)));
  return { dueCount, newCount, weakCount, sprintCount };
}

