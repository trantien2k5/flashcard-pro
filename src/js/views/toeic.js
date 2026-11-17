/**
 * TOEIC Mini Test View Controller (Barrel Facade)
 * Điều phối Hub đề thi, Phòng thi CBT ETS và Modal phân tích điểm chuẩn.
 */

import { TOEIC_TEST_SETS, getToeicQuestionsBySet } from '../../data/toeic-tests.js';
import { toeicState, ensureArenaOverlayCreated } from './toeic/state.js';
import { renderToeicHub } from './toeic/hub.js';
import {
  renderArenaLayout,
  loadArenaQuestion,
  startArenaTimer,
  setupArenaKeyShortcuts
} from './toeic/arena.js';
import { confirmAndSubmitTest, closeArenaSession } from './toeic/results.js';

/**
 * Hiển thị Màn hình Hub của Tab Thi Thử TOEIC (Danh sách đề thi)
 */
export function renderToeicTestTab(app) {
  renderToeicHub(app, startToeicTestBySet);
}

/**
 * Khởi động phiên làm bài / thi thử theo bộ đề cụ thể
 */
export function startToeicTestBySet(app, testSet, mode = 'practice') {
  toeicState.app = app;
  toeicState.activeConfig = {
    setId: testSet.id,
    testCode: testSet.code || 'TEST 01',
    testTitle: testSet.title || 'Part 5 Incomplete Sentences',
    questionCount: testSet.questionCount,
    durationMinutes: mode === 'exam' ? testSet.durationMinutes : 0,
    mode
  };
  toeicState.currentQuestions = getToeicQuestionsBySet(testSet.id, mode === 'exam');
  toeicState.userAnswers = {};
  toeicState.flaggedQuestions = new Set();
  toeicState.currentQuestionIndex = 0;
  toeicState.totalDurationSeconds = toeicState.activeConfig.durationMinutes * 60;
  toeicState.remainingSeconds = toeicState.totalDurationSeconds;
  toeicState.testStartTime = Date.now();

  const overlay = ensureArenaOverlayCreated();
  const submitCallbacks = {
    onRefreshHub: () => {
      if (toeicState.app) renderToeicTestTab(toeicState.app);
    },
    onRetry: () => {
      if (toeicState.app && toeicState.activeConfig) {
        startToeicTest(toeicState.app, toeicState.activeConfig.questionCount, toeicState.activeConfig.durationMinutes);
      }
    }
  };

  renderArenaLayout({
    onExit: closeArenaSession,
    onSubmit: (isTimeUp) => confirmAndSubmitTest(isTimeUp, submitCallbacks)
  });

  if (toeicState.activeConfig.durationMinutes > 0) {
    startArenaTimer(() => confirmAndSubmitTest(true, submitCallbacks));
  }

  if (overlay) overlay.classList.add('active');

  loadArenaQuestion(toeicState.currentQuestionIndex);
  setupArenaKeyShortcuts();
}

/**
 * Hàm hỗ trợ tương thích
 */
export function startToeicTest(app, questionCount = 8, durationMinutes = 5, mode = 'practice', testTitle = '') {
  const defaultSet = TOEIC_TEST_SETS[0];
  startToeicTestBySet(app, defaultSet, mode);
}
