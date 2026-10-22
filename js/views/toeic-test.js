/**
 * TOEIC Mini Test View Controller - Authentic ETS CBT Style
 * Trình thi thử TOEIC Part 5 chuyên nghiệp với đồng hồ đếm ngược,
 * bảng điều hướng câu hỏi, phân tích điểm chuẩn ETS (10-495) và giải thích chi tiết.
 */

import { getRandomToeicQuestions, calculateToeicScore } from '../../data/toeic-tests.js';
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
 * Hiển thị Màn hình Hub của Tab Thi Thử TOEIC
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
      <!-- 1. Hero Banner -->
      <div class="toeic-hero-banner">
        <div class="toeic-hero-content">
          <span class="toeic-hero-tag">🎯 Chuẩn ETS Part 5</span>
          <h2 class="toeic-hero-title">Luyện Thi TOEIC Part 5</h2>
          <p class="toeic-hero-desc">
            Phản xạ ngữ pháp & từ vựng công sở • Bảng điểm quy đổi chuẩn ETS (10 - 495).
          </p>
        </div>

        <div class="toeic-hero-stats">
          <div class="hero-stat-box">
            <div class="hero-stat-val">${highestScore > 0 ? highestScore : '--'}</div>
            <div class="hero-stat-label">Điểm cao nhất</div>
          </div>
          <div class="hero-stat-box">
            <div class="hero-stat-val">${totalTests}</div>
            <div class="hero-stat-label">Bài đã thi</div>
          </div>
          <div class="hero-stat-box">
            <div class="hero-stat-val">${avgAccuracy > 0 ? avgAccuracy + '%' : '--'}</div>
            <div class="hero-stat-label">Độ chính xác</div>
          </div>
        </div>
      </div>

      <!-- 2. Test Selection Grid (4 Cấp độ từ Căn bản đến Nâng cao) -->
      <div class="toeic-tests-grid">
        <!-- Test Option 1: Căn Bản / Khởi Động (350 - 500+) -->
        <div class="toeic-test-card card-basic">
          <span class="toeic-test-badge badge-basic">🟢 Căn bản (350-500)</span>
          <div class="test-card-header">
            <div class="test-card-icon icon-basic">🌱</div>
            <h3 class="test-card-title">TOEIC Căn Bản</h3>
          </div>
          <div class="test-card-meta">
            <span class="test-card-meta-item">📝 15 câu</span>
            <span>•</span>
            <span class="test-card-meta-item">⏱️ 8 phút</span>
          </div>
          <button type="button" class="btn-start-toeic-test" data-count="15" data-duration="8" data-mode="basic" data-title="TOEIC Căn Bản (350-500)">
            Bắt đầu thi ❯
          </button>
        </div>

        <!-- Test Option 2: Trung Cấp / Tăng Tốc (550 - 750+) -->
        <div class="toeic-test-card card-intermediate">
          <span class="toeic-test-badge badge-intermediate">🟡 Trung cấp (550-750)</span>
          <div class="test-card-header">
            <div class="test-card-icon icon-intermediate">⚡</div>
            <h3 class="test-card-title">TOEIC Trung Cấp</h3>
          </div>
          <div class="test-card-meta">
            <span class="test-card-meta-item">📝 20 câu</span>
            <span>•</span>
            <span class="test-card-meta-item">⏱️ 10 phút</span>
          </div>
          <button type="button" class="btn-start-toeic-test" data-count="20" data-duration="10" data-mode="intermediate" data-title="TOEIC Trung Cấp (550-750)">
            Bắt đầu thi ❯
          </button>
        </div>

        <!-- Test Option 3: Chuyên Sâu / Đột Phá (800 - 990+) -->
        <div class="toeic-test-card card-advanced">
          <span class="toeic-test-badge badge-advanced">🔴 Chuyên sâu (800-990)</span>
          <div class="test-card-header">
            <div class="test-card-icon icon-advanced">🔥</div>
            <h3 class="test-card-title">TOEIC Chuyên Sâu</h3>
          </div>
          <div class="test-card-meta">
            <span class="test-card-meta-item">📝 15 câu</span>
            <span>•</span>
            <span class="test-card-meta-item">⏱️ 10 phút</span>
          </div>
          <button type="button" class="btn-start-toeic-test" data-count="15" data-duration="10" data-mode="advanced" data-title="TOEIC Chuyên Sâu (800-990)">
            Bắt đầu thi ❯
          </button>
        </div>

        <!-- Test Option 4: Full Mini Test ETS (Lũy tiến từ Dễ ➔ Khó) -->
        <div class="toeic-test-card card-progressive">
          <span class="toeic-test-badge badge-progressive">🏆 Chuẩn ETS (Dễ ➔ Khó)</span>
          <div class="test-card-header">
            <div class="test-card-icon icon-progressive">🎯</div>
            <h3 class="test-card-title">Đề Chuẩn ETS</h3>
          </div>
          <div class="test-card-meta">
            <span class="test-card-meta-item">📝 30 câu</span>
            <span>•</span>
            <span class="test-card-meta-item">⏱️ 15 phút</span>
          </div>
          <button type="button" class="btn-start-toeic-test" data-count="30" data-duration="15" data-mode="progressive" data-title="Đề Chuẩn ETS (30 câu)">
            Bắt đầu thi ❯
          </button>
        </div>
      </div>

      <!-- 3. Recent Test History -->
      <div class="toeic-history-section">
        <div class="history-section-header">
          <h3 class="history-section-title">
            <span>📊 Lịch Sử Thi Gần Đây</span>
          </h3>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">50 bài gần nhất</span>
        </div>

        ${history.length === 0 ? `
          <div class="empty-history-placeholder">
            Bạn chưa làm bài thi thử nào. Hãy chọn một bài test ở trên để bắt đầu thử sức ngay!
          </div>
        ` : `
          <div style="overflow-x: auto;">
            <table class="toeic-history-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Gói đề thi</th>
                  <th>Số câu đúng</th>
                  <th>Điểm TOEIC</th>
                  <th>Thời gian làm</th>
                  <th>Trình độ đánh giá</th>
                </tr>
              </thead>
              <tbody>
                ${history.slice(0, 10).map(h => {
                  const dateStr = h.date ? new Date(h.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--';
                  const mins = Math.floor((h.timeSpentSeconds || 0) / 60);
                  const secs = (h.timeSpentSeconds || 0) % 60;
                  const timeFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
                  const testTitle = h.testTitle || `Mini Test ${h.totalCount || 10} câu`;
                  return `
                    <tr>
                      <td>${dateStr}</td>
                      <td><strong>${escapeHTML(testTitle)}</strong></td>
                      <td><span style="color: #10b981; font-weight: 750;">${h.correctCount}/${h.totalCount}</span> (${h.accuracyPct}%)</td>
                      <td class="history-score-cell">${h.score} / 495</td>
                      <td>${timeFormatted}</td>
                      <td><span style="font-weight: 700; color: ${h.color || 'var(--text-primary)'};">${escapeHTML(h.band || '')}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;

  // Gán sự kiện click nút bắt đầu thi
  container.querySelectorAll('.btn-start-toeic-test').forEach(btn => {
    btn.onclick = () => {
      const count = parseInt(btn.getAttribute('data-count'), 10) || 10;
      const duration = parseInt(btn.getAttribute('data-duration'), 10) || 5;
      const mode = btn.getAttribute('data-mode') || 'all';
      const title = btn.getAttribute('data-title') || `Mini Test ${count} câu`;
      startToeicTest(app, count, duration, mode, title);
    };
  });
}

/**
 * Khởi động phiên thi thử trong phòng thi trực tuyến
 */
export function startToeicTest(app, questionCount = 10, durationMinutes = 5, mode = 'all', testTitle = '') {
  _toeicApp = app;
  _activeConfig = { questionCount, durationMinutes, mode, testTitle: testTitle || `Mini Test ${questionCount} câu` };
  _currentQuestions = getRandomToeicQuestions(questionCount, mode);
  _userAnswers = {};
  _flaggedQuestions = new Set();
  _currentQuestionIndex = 0;
  _totalDurationSeconds = durationMinutes * 60;
  _remainingSeconds = _totalDurationSeconds;
  _testStartTime = Date.now();

  ensureArenaOverlayCreated();
  renderArenaLayout();
  startArenaTimer();

  const overlay = document.getElementById('toeic-arena-overlay');
  if (overlay) overlay.classList.add('active');

  loadArenaQuestion(_currentQuestionIndex);
  setupArenaKeyShortcuts();
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
 * Render bố cục phòng thi ETS CBT
 */
function renderArenaLayout() {
  const overlay = document.getElementById('toeic-arena-overlay');
  if (!overlay) return;

  const total = _currentQuestions.length;

  overlay.innerHTML = `
    <!-- Top Header Bar -->
    <header class="arena-top-header">
      <div class="arena-header-left">
        <button type="button" class="btn-exit-arena" id="btn-exit-toeic-arena" title="Thoát phòng thi">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          <span>Thoát</span>
        </button>
        <div class="arena-title-wrap">
          <span class="arena-exam-name">ETS TOEIC Part 5 Mini Test</span>
          <span class="arena-exam-sub" id="arena-exam-sub">Gói ${total} câu • Incomplete Sentences</span>
        </div>
      </div>

      <!-- Live Countdown Timer -->
      <div class="arena-timer-pill" id="arena-timer-pill" title="Thời gian còn lại">
        <span style="font-size: 1rem;">⏱️</span>
        <span id="arena-timer-digits">00:00</span>
      </div>

      <button type="button" class="btn-submit-arena" id="btn-submit-toeic-arena">
        <span>Nộp bài</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </button>
    </header>

    <!-- Main Split Body -->
    <div class="arena-split-body">
      <!-- Question Stage -->
      <main class="arena-question-stage">
        <div class="question-stage-content">
          <div class="question-meta-row">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="question-num-tag" id="arena-question-tag">Câu 1 / ${total}</span>
              <span class="question-level-tag" id="arena-level-tag">🟢 Căn bản</span>
              <span class="question-cat-tag" id="arena-category-tag">Từ loại</span>
            </div>
            <button type="button" class="btn-flag-question" id="btn-flag-question" title="Đánh dấu câu hỏi để xem lại sau (Phím F)">
              <span>🚩</span>
              <span id="flag-btn-text">Đánh dấu</span>
            </button>
          </div>

          <!-- Question Prompt -->
          <div class="question-prompt-card">
            <p class="question-prompt-text" id="arena-question-text">Loading...</p>
          </div>

          <!-- 4 Options -->
          <div class="arena-options-grid" id="arena-options-grid"></div>
        </div>

        <!-- Navigation Bar -->
        <div class="arena-nav-bar">
          <button type="button" class="btn-arena-step" id="btn-arena-prev">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>Câu trước</span>
          </button>

          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;" id="arena-progress-indicator">
            1 / ${total}
          </span>

          <button type="button" class="btn-arena-step" id="btn-arena-next">
            <span>Câu tiếp</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </main>

      <!-- Right Pallet Sidebar -->
      <aside class="arena-pallet-sidebar">
        <span class="pallet-header-title">Bảng Câu Hỏi</span>
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
      } else {
        confirmAndSubmitTest(false);
      }
    };
  }

  const btnFlag = document.getElementById('btn-flag-question');
  if (btnFlag) {
    btnFlag.onclick = () => {
      toggleFlagCurrentQuestion();
    };
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

  // Cập nhật Tags
  const elTag = document.getElementById('arena-question-tag');
  const elLevel = document.getElementById('arena-level-tag');
  const elCat = document.getElementById('arena-category-tag');
  const elIndicator = document.getElementById('arena-progress-indicator');
  const btnPrev = document.getElementById('btn-arena-prev');
  const btnNext = document.getElementById('btn-arena-next');

  if (elTag) elTag.textContent = `Câu ${index + 1} / ${total}`;
  
  if (elLevel) {
    const lvl = q.level || 'intermediate';
    if (lvl === 'basic') {
      elLevel.innerHTML = `🟢 Căn bản (${escapeHTML(q.difficulty || '350-500')})`;
      elLevel.className = 'question-level-tag level-basic';
    } else if (lvl === 'advanced') {
      elLevel.innerHTML = `🔴 Nâng cao (${escapeHTML(q.difficulty || '800-990')})`;
      elLevel.className = 'question-level-tag level-advanced';
    } else {
      elLevel.innerHTML = `🟡 Trung cấp (${escapeHTML(q.difficulty || '550-750')})`;
      elLevel.className = 'question-level-tag level-intermediate';
    }
  }

  if (elCat) elCat.textContent = q.category || 'Part 5';
  if (elIndicator) elIndicator.textContent = `${index + 1} / ${total}`;

  if (btnPrev) btnPrev.disabled = index === 0;
  if (btnNext) {
    btnNext.innerHTML = index === total - 1 
      ? `<span>Nộp bài</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`
      : `<span>Câu tiếp</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
  }

  // Cập nhật Cờ Flag
  const isFlagged = _flaggedQuestions.has(index);
  const btnFlag = document.getElementById('btn-flag-question');
  const flagText = document.getElementById('flag-btn-text');
  if (btnFlag) {
    btnFlag.classList.toggle('flagged', isFlagged);
    if (flagText) flagText.textContent = isFlagged ? 'Đã gắn cờ' : 'Đánh dấu';
  }

  // Cập nhật Text câu hỏi với chỗ trống highlight
  const elPrompt = document.getElementById('arena-question-text');
  if (elPrompt) {
    const rawQuestion = q.question || '';
    const formatted = rawQuestion.replace(/______/g, `<span class="question-blank-highlight">______</span>`);
    elPrompt.innerHTML = formatted;
  }

  // Render 4 phương án
  const optionsGrid = document.getElementById('arena-options-grid');
  if (optionsGrid) {
    optionsGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    const currentSelected = _userAnswers[index];

    (q.options || []).forEach((opt, optIdx) => {
      const tile = document.createElement('div');
      tile.className = `arena-option-tile ${currentSelected === optIdx ? 'selected' : ''}`;
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

  updatePalletMatrix();
}

/**
 * Cập nhật ma trận số câu hỏi ở thanh bên
 */
function updatePalletMatrix() {
  const pallet = document.getElementById('arena-pallet-grid');
  if (!pallet) return;

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
      const btnExit = document.getElementById('btn-exit-toeic-arena');
      if (btnExit) btnExit.click();
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
