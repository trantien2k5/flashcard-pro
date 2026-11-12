/**
 * TOEIC Hub Screen & Practice/Exam Mode Selector Modal
 */

import { TOEIC_TEST_SETS } from '../../../data/toeic-tests.js';
import { StorageManager } from '../../services/storage.js';
import { escapeHTML } from '../../utils.js';
import { toeicState } from './state.js';

/**
 * Hiển thị Popup tùy chọn: Luyện tập vs Thi thật
 */
export function showTestModeSelectorModal(app, testSet, onStartSet) {
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
        <button type="button" class="btn-mode-choice choice-practice" id="btn-choose-practice">
          <div class="mode-choice-icon">📖</div>
          <div class="mode-choice-info">
            <span class="mode-choice-title">Chế Độ Luyện Tập</span>
            <span class="mode-choice-desc">Không áp lực thời gian • Hiện ngay đáp án & lời giải thích</span>
          </div>
          <span class="mode-choice-badge">Tự do</span>
        </button>

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

  const closeModal = () => modal.classList.remove('active');
  const btnClose = modal.querySelector('#btn-close-mode-modal');
  if (btnClose) btnClose.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const btnPractice = modal.querySelector('#btn-choose-practice');
  if (btnPractice) {
    btnPractice.onclick = () => {
      closeModal();
      onStartSet?.(app, testSet, 'practice');
    };
  }

  const btnExam = modal.querySelector('#btn-choose-exam');
  if (btnExam) {
    btnExam.onclick = () => {
      closeModal();
      onStartSet?.(app, testSet, 'exam');
    };
  }
}

/**
 * Hiển thị Màn hình Hub của Tab Thi Thử TOEIC (Danh sách đề thi & Lịch sử)
 */
export function renderToeicHub(app, onStartSet) {
  toeicState.app = app;
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

      <div class="toeic-section-bar">
        <h3 class="toeic-section-title">
          <span>📚 Danh Sách Đề Thi</span>
        </h3>
        <span class="toeic-section-count-tag">${TOEIC_TEST_SETS.length} đề thi</span>
      </div>

      <div class="toeic-sets-list">
        ${TOEIC_TEST_SETS.map(set => `
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
        `).join('')}
      </div>

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

  container.querySelectorAll('.toeic-set-card').forEach(card => {
    card.onclick = () => {
      const setId = card.getAttribute('data-set-id');
      const testSet = TOEIC_TEST_SETS.find(s => s.id === setId) || TOEIC_TEST_SETS[0];
      showTestModeSelectorModal(app, testSet, onStartSet);
    };
  });
}

