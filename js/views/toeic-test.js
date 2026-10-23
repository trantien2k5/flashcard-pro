/**
 * TOEIC Mini Test View Controller - Authentic ETS CBT Style
 * Trình thi thử TOEIC Part 5 chuyên nghiệp với đồng hồ đếm ngược,
 * bảng điều hướng câu hỏi, phân tích điểm chuẩn ETS (10-495) và giải thích chi tiết.
 */

import { TOEIC_TEST_SETS, getToeicQuestionsBySet, calculateToeicScore } from '../../data/toeic-tests.js';
import { StorageManager } from '../services/storage.js';
import { escapeHTML, scrollToTop } from '../utils.js';
import { showConfirm } from './components.js';

let _toeicApp = null;
let _currentQuestions = [];
let _userAnswers = {}; // { [questionIdx]: selectedOptionIdx }
let _flaggedQuestions = new Set();
let _currentQuestionIndex = 0;
let _timerInterval = null;
let _remainingSeconds = 0;
let _totalDurationSeconds = 0;
let _testStartTime = 0;
let _activeConfig = null;

/**
 * Hiển thị Màn hình Hub của Tab Thi Thử TOEIC (Danh sách đề thi)
 */
export function renderToeicTestTab(app) {
  _toeicApp = app;
  const container = document.getElementById('tab-test');
  if (!container) return;

  const history = StorageManager.getToeicTestHistory() || [];
  const totalTests = history.length;
  const highestScore = totalTests > 0 ? Math.max(...history.map(h => h.score || 0)) : 0;
  const avgAccuracy = totalTests > 0 
    ? Math.round(history.reduce((sum, h) => sum + (h.accuracyPct || 0), 0) / totalTests)
    : 0;

  container.innerHTML = `
    <div class="toeic-container">
      <!-- 1. Header & Integrated Metrics Strip (Flat, Precision, No Nested Cards) -->
      <div class="toeic-hub-header">
        <div class="toeic-hub-header-top">
          <div class="toeic-hub-brand-row">
            <span class="toeic-hub-badge">ETS PART 5</span>
            <span class="toeic-hub-badge-sub">Incomplete Sentences</span>
          </div>
          <h2 class="toeic-hub-title">Thi Thử & Luyện Đề TOEIC</h2>
          <p class="toeic-hub-desc">
            Rèn luyện phản xạ ngữ pháp và từ vựng Part 5 theo chuẩn format đề thi ETS TOEIC thực tế.
          </p>
        </div>

        <div class="toeic-metrics-strip">
          <div class="metric-segment">
            <span class="metric-val">${highestScore > 0 ? highestScore : '--'}</span>
            <span class="metric-lbl">Điểm cao nhất</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-segment">
            <span class="metric-val">${totalTests}</span>
            <span class="metric-lbl">Bài đã nộp</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-segment">
            <span class="metric-val">${avgAccuracy > 0 ? avgAccuracy + '%' : '--'}</span>
            <span class="metric-lbl">Độ chính xác TB</span>
          </div>
        </div>
      </div>

      <!-- 2. Danh sách Bộ Đề Thi (Test Sets List) -->
      <div class="toeic-section-bar">
        <h3 class="toeic-section-title">
          <span>📚 Danh Sách Đề Thi</span>
        </h3>
        <span class="toeic-section-count-tag">${TOEIC_TEST_SETS.length} đề thi</span>
      </div>

      <div class="toeic-sets-list">
        ${TOEIC_TEST_SETS.map(set => {
          return `
            <div class="toeic-set-card" data-set-id="${set.id}">
              <div class="set-card-left">
                <div class="set-card-code-tag">${escapeHTML(set.code)}</div>
                <div class="set-card-main-info">
                  <div class="set-card-title-row">
                    <h4 class="set-card-title">${escapeHTML(set.title)}</h4>
                    <span class="set-card-level-tag">${escapeHTML(set.tag)}</span>
                  </div>
                  <div class="set-card-meta">
                    <span class="meta-item">📝 ${set.questionCount} câu</span>
                    <span class="meta-sep">•</span>
                    <span class="meta-item">⏱️ ${set.durationMinutes} phút</span>
                    <span class="meta-sep">•</span>
                    <span class="meta-feature-tag">Luyện tập & Thi thật</span>
                  </div>
                </div>
              </div>
              <button type="button" class="btn-open-set-mode" data-set-id="${set.id}">
                <span>Chọn bài</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 3. Recent Test History (Flat List, No Card-Inside-Card) -->
      <div class="toeic-history-section">
        <div class="toeic-section-bar">
          <h3 class="toeic-section-title">
            <span>📊 Lịch Sử Làm Bài</span>
          </h3>
          <span class="history-sub-tag">Gần đây</span>
        </div>

        ${history.length === 0 ? `
          <div class="empty-history-box">
            Chưa có bài thi nào. Chọn một đề thi phía trên để bắt đầu!
          </div>
        ` : `
          <div class="toeic-history-table">
            ${history.slice(0, 10).map(h => {
              const dateStr = h.date ? new Date(h.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--';
              const mins = Math.floor((h.timeSpentSeconds || 0) / 60);
              const secs = (h.timeSpentSeconds || 0) % 60;
              const timeFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
              const isPractice = h.mode === 'practice';
              return `
                <div class="history-table-row">
                  <div class="history-col-mode">
                    <span class="history-mode-tag ${isPractice ? 'practice' : 'exam'}">
                      ${isPractice ? 'Luyện tập' : 'Thi thật'}
                    </span>
                    <span class="history-date">${dateStr}</span>
                  </div>
                  <div class="history-col-accuracy">
                    <span class="history-score-ratio">
                      ${h.correctCount}/${h.totalCount} <small>(${h.accuracyPct}%)</small>
                    </span>
                    <span class="history-duration">⏱️ ${timeFormatted}</span>
                  </div>
                  <div class="history-col-points">
                    <span class="history-score-pts" style="color: ${h.color || 'var(--primary, #6366f1)'};">
                      ${h.score} <small>/ 495</small>
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Gán sự kiện click vào đề thi để mở Popup tùy chọn chế độ
  container.querySelectorAll('.toeic-set-card').forEach(card => {
    card.onclick = (e) => {
      const setId = card.getAttribute('data-set-id');
      const testSet = TOEIC_TEST_SETS.find(s => s.id === setId) || TOEIC_TEST_SETS[0];
      showTestModeSelectorModal(app, testSet);
    };
  });
}

/**
 * Hiển thị Popup đơn giản tùy chọn: Luyện tập vs Thi thật
 */
function showTestModeSelectorModal(app, testSet) {
  let modal = document.getElementById('toeic-mode-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'toeic-mode-modal';
    modal.className = 'modal-backdrop toeic-mode-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog toeic-mode-dialog" role="dialog" aria-modal="true">
      <div class="toeic-mode-header">
        <div>
          <span class="modal-pre-tag">${escapeHTML(testSet.code)}</span>
          <h3 class="modal-test-title">${escapeHTML(testSet.title)}</h3>
          <span class="modal-test-sub">${testSet.questionCount} câu hỏi • Incomplete Sentences</span>
        </div>
        <button type="button" class="btn-icon-close" id="btn-close-mode-modal" title="Đóng">✕</button>
      </div>

      <div class="toeic-mode-options">
        <!-- Tùy chọn 1: Luyện Tập -->
        <button type="button" class="btn-mode-choice choice-practice" id="btn-choose-practice">
          <div class="mode-choice-icon">📖</div>
          <div class="mode-choice-info">
            <span class="mode-choice-title">Chế Độ Luyện Tập</span>
            <span class="mode-choice-desc">Không áp lực thời gian • Hiện ngay đáp án & lời giải thích</span>
          </div>
          <span class="mode-choice-badge">Tự do</span>
        </button>

        <!-- Tùy chọn 2: Thi Thật -->
        <button type="button" class="btn-mode-choice choice-exam" id="btn-choose-exam">
          <div class="mode-choice-icon">🎯</div>
          <div class="mode-choice-info">
            <span class="mode-choice-title">Chế Độ Thi Thật</span>
            <span class="mode-choice-desc">Đếm ngược ${testSet.durationMinutes} phút • Giữ bí mật đáp án & tính điểm ETS</span>
          </div>
          <span class="mode-choice-badge exam">Bấm giờ</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeModal = () => {
    modal.classList.remove('active');
  };

  const btnClose = modal.querySelector('#btn-close-mode-modal');
  if (btnClose) btnClose.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const btnPractice = modal.querySelector('#btn-choose-practice');
  if (btnPractice) {
    btnPractice.onclick = () => {
      closeModal();
      startToeicTestBySet(app, testSet, 'practice');
    };
  }

  const btnExam = modal.querySelector('#btn-choose-exam');
  if (btnExam) {
    btnExam.onclick = () => {
      closeModal();
      startToeicTestBySet(app, testSet, 'exam');
    };
  }
}

/**
 * Khởi động phiên làm bài / thi thử theo bộ đề cụ thể
 */
export function startToeicTestBySet(app, testSet, mode = 'practice') {
  _toeicApp = app;
  _activeConfig = { 
    setId: testSet.id,
    testCode: testSet.code || 'TEST 01',
    testTitle: testSet.title || 'Part 5 Incomplete Sentences',
    questionCount: testSet.questionCount, 
    durationMinutes: mode === 'exam' ? testSet.durationMinutes : 0, 
    mode 
  };
  _currentQuestions = getToeicQuestionsBySet(testSet.id, mode === 'exam');
  _userAnswers = {};
  _flaggedQuestions = new Set();
  _currentQuestionIndex = 0;
  _totalDurationSeconds = _activeConfig.durationMinutes * 60;
  _remainingSeconds = _totalDurationSeconds;
  _testStartTime = Date.now();

  ensureArenaOverlayCreated();
  renderArenaLayout();
  if (_activeConfig.durationMinutes > 0) {
    startArenaTimer();
  }

  const overlay = document.getElementById('toeic-arena-overlay');
  if (overlay) overlay.classList.add('active');

  loadArenaQuestion(_currentQuestionIndex);
  setupArenaKeyShortcuts();
}

/**
 * Hàm hỗ trợ tương thích
 */
export function startToeicTest(app, questionCount = 8, durationMinutes = 5, mode = 'practice', testTitle = '') {
  const defaultSet = TOEIC_TEST_SETS[0];
  startToeicTestBySet(app, defaultSet, mode);
}

/**
 * Tạo khung shell phòng thi nếu chưa có
 */
function ensureArenaOverlayCreated() {
  let overlay = document.getElementById('toeic-arena-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'toeic-arena-overlay';
    overlay.className = 'toeic-arena-overlay';
    document.body.appendChild(overlay);
  }
}

/**
 * Mở / Đóng Bảng câu hỏi (Drawer/Bottom Sheet)
 */
function togglePalletDrawer(forceState) {
  const drawer = document.getElementById('arena-pallet-drawer');
  const backdrop = document.getElementById('arena-pallet-backdrop');
  if (!drawer || !backdrop) return;

  const isOpen = forceState !== undefined ? forceState : !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  backdrop.classList.toggle('active', isOpen);
}

/**
 * Render bố cục phòng thi ETS CBT
 */
function renderArenaLayout() {
  const overlay = document.getElementById('toeic-arena-overlay');
  if (!overlay) return;

  const total = _currentQuestions.length;
  const isPractice = _activeConfig?.mode === 'practice';
  const testCode = _activeConfig?.testCode || 'TEST 01';

  overlay.innerHTML = `
    <!-- Top Header Bar (Bố cục 3 vùng đều đặn: Trái - Giữa - Phải) -->
    <header class="arena-top-header">
      <!-- Vùng Trái: Nút Thoát & Tên Đề Thi -->
      <div class="arena-header-left">
        <button type="button" class="btn-exit-arena" id="btn-exit-toeic-arena" title="Thoát phòng">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="arena-title-wrap">
          <div class="arena-exam-name-row">
            <span class="arena-exam-name">${escapeHTML(testCode)}</span>
            <span class="arena-mode-pill ${isPractice ? 'is-practice' : 'is-exam'}">
              ${isPractice ? 'Luyện tập' : 'Thi thật'}
            </span>
          </div>
        </div>
      </div>

      <!-- Vùng Giữa: Cụm Điều Hướng & Tiến Độ Tích Hợp (Luôn cố định trên Top, cực kỳ đều) -->
      <div class="arena-header-center">
        <div class="arena-top-nav-cluster">
          <button type="button" class="btn-arena-step-compact" id="btn-arena-prev" title="Câu trước (←)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          <button type="button" class="btn-pallet-trigger-compact" id="btn-toggle-pallet" title="Bấm xem danh sách câu hỏi / Tiến độ (Phím M)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
            </svg>
            <span id="arena-progress-indicator">Câu 1 / ${total}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <button type="button" class="btn-arena-step-compact" id="btn-arena-next" title="Câu tiếp theo (→)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Vùng Phải: Luyện tập chỉ có Đánh dấu (bỏ Nộp bài), Thi thật có Đồng hồ & Nộp bài -->
      <div class="arena-header-right">
        <button type="button" class="btn-flag-question" id="btn-flag-question" title="Đánh dấu câu hỏi để xem lại (Phím F)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
          </svg>
          <span id="flag-btn-text">Đánh dấu</span>
        </button>

        ${!isPractice ? `
          ${_activeConfig?.durationMinutes > 0 ? `
            <div class="arena-timer-pill" id="arena-timer-pill" title="Thời gian còn lại">
              <span style="font-size: 0.95rem;">⏱️</span>
              <span id="arena-timer-digits">00:00</span>
            </div>
          ` : ''}

          <button type="button" class="btn-submit-arena" id="btn-submit-toeic-arena">
            <span>Nộp bài</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        ` : ''}
      </div>
    </header>

    <!-- Main Body: Tập trung toàn bộ vào câu hỏi -->
    <div class="arena-split-body">
      <main class="arena-question-stage">
        <div class="question-stage-content">
          <!-- Question Prompt Card -->
          <div class="question-prompt-card">
            <p class="question-prompt-text" id="arena-question-text">Loading...</p>
          </div>

          <!-- 4 Options -->
          <div class="arena-options-grid" id="arena-options-grid"></div>

          <!-- Practice Mode Instant Explanation Box -->
          <div class="practice-explanation-box" id="practice-explanation-box" style="display: none;"></div>
        </div>
      </main>

      <!-- Bảng câu hỏi Drawer (Mặc định ẩn, bấm nút tiến độ trên Top mới trượt hiện ra) -->
      <div class="arena-pallet-backdrop" id="arena-pallet-backdrop"></div>
      <aside class="arena-pallet-drawer" id="arena-pallet-drawer">
        <div class="pallet-drawer-header">
          <div class="pallet-title-group">
            <span class="pallet-drawer-title">Bảng Câu Hỏi</span>
            <span class="pallet-drawer-sub" id="pallet-answered-count">0 / ${total} đã làm</span>
          </div>
          <button type="button" class="btn-close-pallet" id="btn-close-pallet" title="Đóng bảng câu hỏi">✕</button>
        </div>

        <div class="pallet-matrix-grid" id="arena-pallet-grid"></div>

        <div class="pallet-legend-row">
          <div class="legend-item"><span class="legend-dot answered"></span> Đã trả lời</div>
          <div class="legend-item"><span class="legend-dot unanswered"></span> Chưa trả lời</div>
          <div class="legend-item"><span class="legend-dot flagged"></span> Đã đánh dấu (🚩)</div>
        </div>
      </aside>
    </div>
  `;

  // Gán sự kiện
  const btnExit = document.getElementById('btn-exit-toeic-arena');
  if (btnExit) {
    btnExit.onclick = async () => {
      const answeredCount = Object.keys(_userAnswers).length;
      const confirmed = await showConfirm({
        title: 'Thoát bài thi TOEIC?',
        message: answeredCount > 0 
          ? `Bạn đã làm ${answeredCount}/${total} câu hỏi. Nếu thoát ngay bây giờ, kết quả bài thi này sẽ không được tính.`
          : 'Bạn có chắc chắn muốn rời khỏi phòng thi không?',
        confirmText: 'Rời phòng thi',
        type: 'danger',
        icon: '🚪'
      });
      if (confirmed) {
        closeArenaSession();
      }
    };
  }

  const btnSubmit = document.getElementById('btn-submit-toeic-arena');
  if (btnSubmit) {
    btnSubmit.onclick = () => {
      confirmAndSubmitTest(false);
    };
  }

  const btnPrev = document.getElementById('btn-arena-prev');
  if (btnPrev) {
    btnPrev.onclick = () => {
      if (_currentQuestionIndex > 0) {
        _currentQuestionIndex--;
        loadArenaQuestion(_currentQuestionIndex);
      }
    };
  }

  const btnNext = document.getElementById('btn-arena-next');
  if (btnNext) {
    btnNext.onclick = () => {
      if (_currentQuestionIndex + 1 < _currentQuestions.length) {
        _currentQuestionIndex++;
        loadArenaQuestion(_currentQuestionIndex);
      } else if (!isPractice) {
        confirmAndSubmitTest(false);
      } else {
        togglePalletDrawer(true);
      }
    };
  }

  const btnFlag = document.getElementById('btn-flag-question');
  if (btnFlag) {
    btnFlag.onclick = () => {
      toggleFlagCurrentQuestion();
    };
  }

  // Sự kiện mở / đóng Bảng câu hỏi
  const btnTogglePallet = document.getElementById('btn-toggle-pallet');
  if (btnTogglePallet) {
    btnTogglePallet.onclick = () => togglePalletDrawer();
  }

  const btnClosePallet = document.getElementById('btn-close-pallet');
  if (btnClosePallet) {
    btnClosePallet.onclick = () => togglePalletDrawer(false);
  }

  const backdrop = document.getElementById('arena-pallet-backdrop');
  if (backdrop) {
    backdrop.onclick = () => togglePalletDrawer(false);
  }
}

/**
 * Nạp câu hỏi tại index vào giao diện
 */
function loadArenaQuestion(index) {
  if (index < 0 || index >= _currentQuestions.length) return;
  _currentQuestionIndex = index;

  const q = _currentQuestions[index];
  const total = _currentQuestions.length;
  const isPracticeMode = _activeConfig?.mode === 'practice';
  const currentSelected = _userAnswers[index];
  const isAnswered = currentSelected !== undefined;

  // Cập nhật Tags & Navigation trên Top Nav
  const elIndicator = document.getElementById('arena-progress-indicator');
  const btnPrev = document.getElementById('btn-arena-prev');
  const btnNext = document.getElementById('btn-arena-next');

  if (elIndicator) elIndicator.textContent = `Câu ${index + 1} / ${total}`;

  if (btnPrev) btnPrev.disabled = index === 0;
  if (btnNext) {
    btnNext.disabled = isPracticeMode ? (index === total - 1) : false;
  }

  // Cập nhật Cờ Flag
  const isFlagged = _flaggedQuestions.has(index);
  const btnFlag = document.getElementById('btn-flag-question');
  const flagText = document.getElementById('flag-btn-text');
  if (btnFlag) {
    btnFlag.classList.toggle('flagged', isFlagged);
    if (flagText) flagText.textContent = isFlagged ? 'Đã cờ' : 'Đánh dấu';
  }

  // Cập nhật Chỗ đục lỗ (Không còn bị 2 gạch đè nhau, hiển thị từ đã chọn nếu có)
  const elPrompt = document.getElementById('arena-question-text');
  if (elPrompt) {
    const rawQuestion = q.question || '';
    let blankHtml = '';
    if (isAnswered && q.options && q.options[currentSelected]) {
      const selectedWord = escapeHTML(q.options[currentSelected]);
      blankHtml = `<span class="question-blank-slot has-value" title="Từ đã chọn: ${selectedWord}">${selectedWord}</span>`;
    } else {
      blankHtml = `<span class="question-blank-slot is-empty" aria-label="Chỗ trống điền từ"></span>`;
    }
    const formatted = rawQuestion.replace(/_{3,}/g, blankHtml);
    elPrompt.innerHTML = formatted;
  }

  // Render 4 phương án
  const optionsGrid = document.getElementById('arena-options-grid');

  if (optionsGrid) {
    optionsGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    (q.options || []).forEach((opt, optIdx) => {
      const tile = document.createElement('div');
      let statusClass = '';

      if (isPracticeMode && isAnswered) {
        if (optIdx === q.correctIndex) {
          statusClass = 'practice-correct';
        } else if (optIdx === currentSelected) {
          statusClass = 'practice-wrong';
        }
      } else if (currentSelected === optIdx) {
        statusClass = 'selected';
      }

      tile.className = `arena-option-tile ${statusClass}`;
      tile.innerHTML = `
        <span class="arena-option-letter">${letters[optIdx]}</span>
        <span class="arena-option-text">${escapeHTML(opt)}</span>
      `;

      tile.onclick = () => {
        _userAnswers[index] = optIdx;
        loadArenaQuestion(index);
        updatePalletMatrix();
      };

      optionsGrid.appendChild(tile);
    });
  }

  // Hộp giải thích tức thì cho Chế độ Luyện Tập (Kèm nút bấm tiện tay sang câu kế)
  const explanationBox = document.getElementById('practice-explanation-box');
  if (explanationBox) {
    if (isPracticeMode && isAnswered) {
      const isCorrect = currentSelected === q.correctIndex;
      explanationBox.style.display = 'block';
      explanationBox.className = `practice-explanation-box ${isCorrect ? 'is-correct' : 'is-wrong'}`;
      explanationBox.innerHTML = `
        <div class="exp-header">
          <span class="exp-badge">${isCorrect ? '✅ Chính xác' : '❌ Chưa chính xác'}</span>
          <span class="exp-correct-info">Đáp án đúng: <strong>(${['A', 'B', 'C', 'D'][q.correctIndex]}) ${escapeHTML(q.options[q.correctIndex])}</strong></span>
        </div>
        ${q.questionVi ? `<div class="exp-translation"><strong>Dịch câu:</strong> ${escapeHTML(q.questionVi)}</div>` : ''}
        ${q.explanation ? `<div class="exp-content"><strong>Giải thích:</strong> ${escapeHTML(q.explanation)}</div>` : ''}
        <div class="exp-quick-nav-row">
          <button type="button" class="btn-exp-quick-action" id="btn-exp-quick-next">
            <span>${index < total - 1 ? 'Sang câu tiếp theo' : 'Xem lại bảng câu hỏi'}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      `;

      const btnExpQuickNext = document.getElementById('btn-exp-quick-next');
      if (btnExpQuickNext) {
        btnExpQuickNext.onclick = () => {
          if (index < total - 1) {
            loadArenaQuestion(index + 1);
          } else {
            togglePalletDrawer(true);
          }
        };
      }
    } else {
      explanationBox.style.display = 'none';
    }
  }

  updatePalletMatrix();
}

/**
 * Cập nhật ma trận số câu hỏi ở thanh bên
 */
function updatePalletMatrix() {
  const pallet = document.getElementById('arena-pallet-grid');
  if (!pallet) return;

  const total = _currentQuestions.length;
  const answeredCount = Object.keys(_userAnswers).length;

  // Cập nhật tóm tắt tiến độ trên header drawer
  const elSub = document.getElementById('pallet-answered-count');
  if (elSub) {
    elSub.textContent = `${answeredCount} / ${total} đã làm`;
  }

  pallet.innerHTML = '';
  _currentQuestions.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isCurrent = idx === _currentQuestionIndex;
    const isAnswered = _userAnswers[idx] !== undefined;
    const isFlagged = _flaggedQuestions.has(idx);

    btn.className = `pallet-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}`;
    btn.textContent = idx + 1;
    btn.title = `Câu ${idx + 1}${isAnswered ? ' (Đã làm)' : ''}${isFlagged ? ' (Có cờ)' : ''}`;

    btn.onclick = () => {
      loadArenaQuestion(idx);
      togglePalletDrawer(false); // Bấm vào câu là tự động đóng bảng câu hỏi lại
    };

    pallet.appendChild(btn);
  });
}

function toggleFlagCurrentQuestion() {
  if (_flaggedQuestions.has(_currentQuestionIndex)) {
    _flaggedQuestions.delete(_currentQuestionIndex);
  } else {
    _flaggedQuestions.add(_currentQuestionIndex);
  }
  loadArenaQuestion(_currentQuestionIndex);
}

/**
 * Bắt đầu đồng hồ đếm ngược
 */
function startArenaTimer() {
  if (_timerInterval) clearInterval(_timerInterval);

  updateTimerDigitsUI();
  _timerInterval = setInterval(() => {
    _remainingSeconds--;
    updateTimerDigitsUI();

    if (_remainingSeconds <= 0) {
      clearInterval(_timerInterval);
      _timerInterval = null;
      confirmAndSubmitTest(true);
    }
  }, 1000);
}

function updateTimerDigitsUI() {
  const elDigits = document.getElementById('arena-timer-digits');
  const elPill = document.getElementById('arena-timer-pill');
  if (!elDigits) return;

  const mins = Math.floor(Math.max(0, _remainingSeconds) / 60);
  const secs = Math.max(0, _remainingSeconds) % 60;
  elDigits.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  if (elPill) {
    if (_remainingSeconds <= 60) {
      elPill.className = 'arena-timer-pill is-critical';
    } else if (_remainingSeconds <= 180) {
      elPill.className = 'arena-timer-pill is-warning';
    } else {
      elPill.className = 'arena-timer-pill';
    }
  }
}

/**
 * Xác nhận & Nộp bài thi
 */
async function confirmAndSubmitTest(isTimeUp = false) {
  if (isTimeUp) {
    finishToeicTest(true);
    return;
  }

  const total = _currentQuestions.length;
  const answeredCount = Object.keys(_userAnswers).length;
  const unAnsweredCount = total - answeredCount;

  let msg = `Bạn đã hoàn thành ${answeredCount}/${total} câu hỏi.`;
  if (unAnsweredCount > 0) {
    msg += ` Bạn vẫn còn ${unAnsweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài sớm không?`;
  } else {
    msg += ` Bạn có chắc chắn muốn nộp bài và xem điểm không?`;
  }

  const confirmed = await showConfirm({
    title: 'Xác nhận Nộp Bài Thi?',
    message: msg,
    confirmText: 'Nộp bài ngay',
    type: unAnsweredCount > 0 ? 'warning' : 'primary',
    icon: '📝'
  });

  if (confirmed) {
    finishToeicTest(false);
  }
}

/**
 * Tính toán kết quả bài thi, lưu vào Storage và hiển thị Modal giải thích
 */
function finishToeicTest(isTimeUp = false) {
  if (_timerInterval) {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }

  const timeSpentSeconds = Math.max(1, Math.round((Date.now() - _testStartTime) / 1000));
  const total = _currentQuestions.length;
  let correctCount = 0;

  _currentQuestions.forEach((q, idx) => {
    if (_userAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  const scoreData = calculateToeicScore(correctCount, total);

  // Lưu lịch sử
  const testRecord = {
    totalCount: total,
    correctCount,
    accuracyPct: scoreData.accuracyPct,
    score: scoreData.score,
    band: scoreData.band,
    color: scoreData.color,
    timeSpentSeconds,
    durationMinutes: _activeConfig ? _activeConfig.durationMinutes : 5,
    mode: _activeConfig ? _activeConfig.mode : 'all',
    testTitle: _activeConfig ? _activeConfig.testTitle : `Mini Test ${total} câu`
  };
  StorageManager.saveToeicTestResult(testRecord);

  // Đóng phòng thi và mở Modal kết quả
  closeArenaSession();
  showToeicResultModal(scoreData, timeSpentSeconds, _currentQuestions, _userAnswers, _flaggedQuestions);
  
  if (_toeicApp) {
    renderToeicTestTab(_toeicApp);
  }
}

function closeArenaSession() {
  if (_timerInterval) {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }
  const overlay = document.getElementById('toeic-arena-overlay');
  if (overlay) overlay.classList.remove('active');
  scrollToTop();
}

/**
 * Hiển thị Modal Báo Cáo Kết Quả & Lời Giải Thích Chi Tiết Từng Câu
 */
function showToeicResultModal(scoreData, timeSpentSeconds, questions, userAnswers, flaggedSet) {
  let modal = document.getElementById('toeic-result-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'toeic-result-overlay';
    modal.className = 'toeic-result-overlay active';
    document.body.appendChild(modal);
  } else {
    modal.className = 'toeic-result-overlay active';
  }

  const mins = Math.floor(timeSpentSeconds / 60);
  const secs = timeSpentSeconds % 60;
  const timeFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  const avgSecPerQuestion = questions.length > 0 ? (timeSpentSeconds / questions.length).toFixed(1) : 0;

  modal.innerHTML = `
    <div class="toeic-result-card">
      <div class="result-card-header">
        <div>
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 850; color: var(--text-primary);">
            🎉 Kết Quả Thi Thử TOEIC Part 5
          </h3>
          <span style="font-size: 0.76rem; color: var(--text-muted);">ETS Computer-Based Testing Assessment</span>
        </div>
        <button type="button" class="btn-exit-arena" id="btn-close-result-modal" style="padding: 6px 12px;">Đóng ✕</button>
      </div>

      <div class="result-card-body">
        <!-- Score Hero Banner -->
        <div class="result-score-hero">
          <div>
            <div class="result-score-digits">${scoreData.score}<span class="result-score-denom"> / 495</span></div>
            <div class="result-band-tag" style="color: ${scoreData.color};">${escapeHTML(scoreData.band)}</div>
          </div>
          <div class="result-feedback-text">
            <p style="margin: 0 0 6px 0; font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">
              Đạt ${scoreData.correctCount}/${scoreData.totalCount} câu đúng (${scoreData.accuracyPct}%)
            </p>
            <p style="margin: 0; line-height: 1.4;">${escapeHTML(scoreData.levelLabel)}</p>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: right;">
            <div>⏱️ Thời gian: <strong>${timeFormatted}</strong></div>
            <div style="margin-top: 4px;">⚡ Tốc độ: <strong>${avgSecPerQuestion}s / câu</strong></div>
          </div>
        </div>

        <!-- Section Title: Detailed Review -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--text-primary);">
            📝 Đáp Án & Giải Thích Chi Tiết
          </h4>
          <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">Xem lại toàn bộ câu hỏi</span>
        </div>

        <!-- Questions Review List -->
        <div class="review-questions-list">
          ${questions.map((q, idx) => {
            const userChoice = userAnswers[idx];
            const isCorrect = userChoice === q.correctIndex;
            const letters = ['A', 'B', 'C', 'D'];
            const isFlagged = flaggedSet.has(idx);

            return `
              <div class="review-item-card ${isCorrect ? 'is-correct' : 'is-wrong'}">
                <div class="review-item-header">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 850; font-size: 0.88rem; color: var(--primary);">Câu ${idx + 1}</span>
                    <span class="question-cat-tag">${escapeHTML(q.category || 'Part 5')}</span>
                    ${isFlagged ? '<span style="font-size: 0.72rem;">🚩 Có đánh dấu</span>' : ''}
                  </div>
                  <span class="review-result-badge ${isCorrect ? 'correct' : 'wrong'}">
                    ${isCorrect ? '✓ Đúng (+1)' : '✗ Chưa chính xác'}
                  </span>
                </div>

                <p class="review-prompt">
                  ${escapeHTML(q.question).replace(/______/g, `<strong style="color: var(--primary); text-decoration: underline;">${escapeHTML(q.options[q.correctIndex])}</strong>`)}
                </p>

                ${q.questionVi ? `
                  <p class="review-translation">🇻🇳 Dịch: ${escapeHTML(q.questionVi)}</p>
                ` : ''}

                <!-- 4 Options Pills -->
                <div class="review-options-pills">
                  ${q.options.map((opt, optIdx) => {
                    const isTheCorrectAnswer = optIdx === q.correctIndex;
                    const isTheUserWrongChoice = !isCorrect && userChoice === optIdx;
                    let extraClass = '';
                    let statusLabel = '';

                    if (isTheCorrectAnswer) {
                      extraClass = 'correct-answer';
                      statusLabel = ' ✓ Đáp án đúng';
                    } else if (isTheUserWrongChoice) {
                      extraClass = 'user-wrong-choice';
                      statusLabel = ' ✗ Bạn chọn sai';
                    }

                    return `
                      <div class="review-opt-pill ${extraClass}">
                        <strong>(${letters[optIdx]})</strong> ${escapeHTML(opt)}${statusLabel}
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Detailed Explanation Box -->
                <div class="review-explanation-box">
                  <strong>💡 Lời giải thích:</strong> ${escapeHTML(q.explanation || 'Không có giải thích chi tiết.')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="result-card-footer">
        <button type="button" class="btn-confirm-secondary" id="btn-result-retry" style="padding: 10px 18px; border-radius: 12px; font-weight: 750;">
          ⚡ Thi Bài Khác
        </button>
        <button type="button" class="btn-confirm-primary" id="btn-result-close" style="padding: 10px 22px; border-radius: 12px; font-weight: 750;">
          Về Danh Sách Đề
        </button>
      </div>
    </div>
  `;

  const btnCloseX = modal.querySelector('#btn-close-result-modal');
  const btnClose = modal.querySelector('#btn-result-close');
  const btnRetry = modal.querySelector('#btn-result-retry');

  const closeModal = () => {
    modal.className = 'toeic-result-overlay';
    setTimeout(() => {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 200);
  };

  if (btnCloseX) btnCloseX.onclick = closeModal;
  if (btnClose) btnClose.onclick = closeModal;
  if (btnRetry) {
    btnRetry.onclick = () => {
      closeModal();
      if (_toeicApp && _activeConfig) {
        startToeicTest(_toeicApp, _activeConfig.questionCount, _activeConfig.durationMinutes);
      }
    };
  }
}

/**
 * Lắng nghe phím tắt bàn phím trong phòng thi
 */
function setupArenaKeyShortcuts() {
  window.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('toeic-arena-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
      const drawer = document.getElementById('arena-pallet-drawer');
      if (drawer && drawer.classList.contains('open')) {
        togglePalletDrawer(false);
        return;
      }
      const btnExit = document.getElementById('btn-exit-toeic-arena');
      if (btnExit) btnExit.click();
      return;
    }

    if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'p') {
      e.preventDefault();
      togglePalletDrawer();
      return;
    }

    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFlagCurrentQuestion();
      return;
    }

    if (e.key === 'ArrowLeft') {
      const btnPrev = document.getElementById('btn-arena-prev');
      if (btnPrev && !btnPrev.disabled) btnPrev.click();
      return;
    }

    if (e.key === 'ArrowRight') {
      const btnNext = document.getElementById('btn-arena-next');
      if (btnNext) btnNext.click();
      return;
    }

    let optionIdx = -1;
    if (e.key === '1' || e.key.toLowerCase() === 'a') optionIdx = 0;
    else if (e.key === '2' || e.key.toLowerCase() === 'b') optionIdx = 1;
    else if (e.key === '3' || e.key.toLowerCase() === 'c') optionIdx = 2;
    else if (e.key === '4' || e.key.toLowerCase() === 'd') optionIdx = 3;

    if (optionIdx >= 0) {
      e.preventDefault();
      _userAnswers[_currentQuestionIndex] = optionIdx;
      loadArenaQuestion(_currentQuestionIndex);
    }
  });
}
