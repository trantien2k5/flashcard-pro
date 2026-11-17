/**
 * Goal & CEFR Roadmap Modals
 * Quản lý Modal Lộ trình CEFR, Phân loại từ vựng & Dự báo nhịp độ cá nhân hóa
 */

import { StatsManager } from '../../core/stats.js';
import { StorageManager } from '../../services/storage.js';
import { LEARNING_GOALS } from '../../config.js';
import { escapeHTML } from '../../utils.js';

/* ==========================================================================
   POPUP 4: LỘ TRÌNH CEFR, PHÂN LOẠI TỪ VỰNG & DỰ BÁO NHỊP ĐỘ CÁ NHÂN HÓA
   ========================================================================== */
export function showGoalCustomizerModal(app = _cachedApp) {
  if (!app) return;
  const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
  let currentGoalId = app.settings?.activeGoal?.id || 'cefr-b1';
  let selectedGoalId = currentGoalId;
  let selectedDailyNew = Number(app.settings?.activeGoal?.dailyNew) || Number(app.settings?.dailyNewLimit) || 10;
  let selectedTargetWords = Number(app.settings?.activeGoal?.targetWords) || 3027;

  let modal = document.getElementById('modal-quick-goal-customizer');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-quick-goal-customizer';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const renderModalContent = () => {
    // 1. Phân tích dữ liệu CEFR Roadmap & Dynamic Forecast từ StatsManager
    const tempSettings = {
      ...app.settings,
      activeGoal: {
        id: selectedGoalId,
        dailyNew: selectedDailyNew,
        targetWords: selectedTargetWords
      }
    };
    const cefrData = StatsManager.getCefrRoadmapAndForecast(allCards, tempSettings);
    const { levels, currentLevel, goal, forecast } = cefrData;

    // Phân tích từ còn thiếu cho cấp độ kế tiếp (Next Level Requirements)
    const targetNextId = currentLevel.nextLevelId !== 'Master' ? currentLevel.nextLevelId : 'C1';
    const nextLevelObj = levels[targetNextId] || levels.A1;
    const wordsRemainingToNext = Math.max(0, nextLevelObj.total - nextLevelObj.learned);
    const nextPosRemaining = nextLevelObj.remainingByPos || { noun: 0, verb: 0, adj: 0, other: 0 };

    const estDailyMins = Math.round(selectedDailyNew * 1.2 + 5);

    modal.innerHTML = `
      <div class="modal-dialog quick-preview-dialog goal-customizer-dialog cefr-roadmap-modal">
        <div class="quick-modal-header">
          <div class="quick-modal-title-wrap">
            <div class="quick-modal-icon badge-due">🗺️</div>
            <div class="quick-modal-headings">
              <h3 class="quick-modal-title">Lộ Trình CEFR & Nhịp Độ Cá Nhân Hóa</h3>
              <span class="quick-modal-sub">Đo lường năng lực thực tế, phân loại từ vựng & dự báo thích ứng</span>
            </div>
          </div>
          <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
        </div>

        <div class="quick-modal-body">
          <!-- KHUNG 1: ĐÁNH GIÁ TRÌNH ĐỘ & NHU CẦU TỪ VỰNG CỤ THỂ (POS Breakdown) -->
          <div class="cefr-analyzer-section">
            <div class="cefr-cur-level-card" style="border-left: 4px solid ${currentLevel.color};">
              <div class="cefr-cur-level-header">
                <div>
                  <span class="cefr-card-eyebrow">ĐÁNH GIÁ NĂNG LỰC HIỆN TẠI</span>
                  <h4 class="cefr-cur-title">${escapeHTML(currentLevel.fullTitle)}</h4>
                </div>
                <span class="cefr-cur-badge" style="background: ${currentLevel.color}18; color: ${currentLevel.color}; border: 1px solid ${currentLevel.color}40;">
                  Cấp ${currentLevel.id} (${currentLevel.progressPct}%)
                </span>
              </div>

              <p class="cefr-cur-desc">
                Bạn đã tích lũy <strong>${currentLevel.learned} / ${currentLevel.total} từ</strong> thuộc chuẩn CEFR ${currentLevel.id}.
                ${wordsRemainingToNext > 0 
                  ? `Để thăng cấp lên <strong>${nextLevelObj.fullTitle}</strong>, bạn cần tích lũy thêm <strong>${wordsRemainingToNext} từ</strong> nữa:` 
                  : `🎉 Chúc mừng bạn đã hoàn thành trọn vẹn bậc ${currentLevel.id}!`}
              </p>

              ${wordsRemainingToNext > 0 ? `
                <div class="pos-breakdown-grid">
                  <div class="pos-chip pos-noun">
                    <span class="pos-chip-icon">📘</span>
                    <div class="pos-chip-info">
                      <span class="pos-chip-name">Danh từ (Nouns)</span>
                      <strong class="pos-chip-count">còn ${nextPosRemaining.noun} từ</strong>
                    </div>
                  </div>
                  <div class="pos-chip pos-verb">
                    <span class="pos-chip-icon">⚡</span>
                    <div class="pos-chip-info">
                      <span class="pos-chip-name">Động từ (Verbs)</span>
                      <strong class="pos-chip-count">còn ${nextPosRemaining.verb} từ</strong>
                    </div>
                  </div>
                  <div class="pos-chip pos-adj">
                    <span class="pos-chip-icon">🎨</span>
                    <div class="pos-chip-info">
                      <span class="pos-chip-name">Tính từ (Adj)</span>
                      <strong class="pos-chip-count">còn ${nextPosRemaining.adj} từ</strong>
                    </div>
                  </div>
                  <div class="pos-chip pos-other">
                    <span class="pos-chip-icon">🧩</span>
                    <div class="pos-chip-info">
                      <span class="pos-chip-name">Khác (Phrases/Adv)</span>
                      <strong class="pos-chip-count">còn ${nextPosRemaining.other} từ</strong>
                    </div>
                  </div>
                </div>
                <div class="cefr-priority-hint">
                  <span class="hint-icon">💡</span>
                  <span><strong>Thứ tự ưu tiên nạp từ:</strong> Thuật toán tự động ưu tiên nạp Động từ cốt lõi ➔ Danh từ thông dụng nhất ➔ Tính từ mô tả ➔ Cụm từ thành ngữ theo chuẩn Oxford Core.</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- KHUNG 2: BẢN ĐỒ TOÀN DIỆN 5 BẬC CEFR (A1 -> A2 -> B1 -> B2 -> C1) -->
          <div class="cefr-analyzer-section">
            <span class="goal-sec-label">Tiến độ phân bổ theo 5 Bậc CEFR:</span>
            <div class="cefr-5levels-grid">
              ${['A1', 'A2', 'B1', 'B2', 'C1'].map(lvlId => {
                const lvl = levels[lvlId];
                const pct = lvl.total > 0 ? Math.round((lvl.learned / lvl.total) * 100) : 0;
                const isCur = lvlId === currentLevel.id;
                return `
                  <div class="cefr-level-row-item ${isCur ? 'is-current' : ''}">
                    <div class="cefr-level-row-left">
                      <span class="cefr-lvl-tag" style="background: ${lvl.color}15; color: ${lvl.color}; border: 1px solid ${lvl.color}35;">${lvlId}</span>
                      <div class="cefr-lvl-meta">
                        <div class="cefr-lvl-title-row">
                          <strong class="cefr-lvl-name">${lvl.fullTitle}</strong>
                          ${isCur ? `<span class="cefr-current-indicator">Đang học</span>` : ''}
                        </div>
                        <div class="cefr-lvl-sub-row">
                          <span>${lvl.learned} / ${lvl.total} từ</span>
                          <span>•</span>
                          <span style="color: #10b981;">💎 Thuộc: ${lvl.mastered} từ</span>
                        </div>
                      </div>
                    </div>
                    <div class="cefr-level-row-right">
                      <span class="cefr-lvl-pct-text">${pct}%</span>
                      <div class="cefr-lvl-bar-mini">
                        <div class="cefr-lvl-fill-mini" style="width: ${pct}%; background: ${lvl.color};"></div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- KHUNG 3: DỰ BÁO TIẾN ĐỘ THÍCH ỨNG THEO HÀNH VI USER (Dynamic Adaptive ETA Engine) -->
          <div class="cefr-analyzer-section">
            <div class="cefr-forecast-header-row">
              <span class="goal-sec-label">Dự báo nhịp độ & thời gian hoàn thành:</span>
              <span class="pace-status-badge" style="background: ${forecast.paceBadgeColor}18; color: ${forecast.paceBadgeColor}; border: 1px solid ${forecast.paceBadgeColor}40;">
                ${forecast.paceStatus}
              </span>
            </div>
            
            <div class="goal-live-calc-card">
              <div class="goal-calc-box">
                <span class="goal-calc-label">Vốn từ cần nạp thêm</span>
                <span class="goal-calc-val" style="color: var(--primary);">${goal.remainingWords} <small style="font-size: 0.72rem; color: var(--text-secondary);">/ ${goal.targetWords} từ</small></span>
                <span class="goal-calc-sub">Đã nạp: ${goal.learnedWords} từ (${goal.completionPct}%)</span>
              </div>
              <div class="goal-calc-box">
                <span class="goal-calc-label">Thời gian về đích</span>
                <span class="goal-calc-val" style="color: #10b981;">~${forecast.etaDays} ngày</span>
                <span class="goal-calc-sub">Dự kiến: ${forecast.targetDateFormatted}</span>
              </div>
              <div class="goal-calc-box">
                <span class="goal-calc-label">Tốc độ thích ứng (Live)</span>
                <span class="goal-calc-val" style="color: #f59e0b;">${forecast.effectiveVelocity} từ/ngày</span>
                <span class="goal-calc-sub">${forecast.isUsingRealBehavior ? 'Dựa trên nhật ký học thực tế' : 'Mặc định benchmark chuẩn'}</span>
              </div>
              <div class="goal-calc-box">
                <span class="goal-calc-label">Thời gian ôn mỗi ngày</span>
                <span class="goal-calc-val" style="color: #6366f1;">~${estDailyMins} phút</span>
                <span class="goal-calc-sub">${selectedDailyNew} mới + từ tới hạn FSRS</span>
              </div>
            </div>
          </div>

          <!-- KHUNG 4: CHỌN MỤC TIÊU & NHỊP ĐỘ HỌC HÀNG NGÀY -->
          <div class="cefr-analyzer-section">
            <span class="goal-sec-label">Tùy chỉnh Mục tiêu mong muốn:</span>
            <div class="goal-presets-list">
              ${LEARNING_GOALS.map(g => `
                <div class="goal-preset-item ${g.id === selectedGoalId ? 'active' : ''}" data-goal-id="${g.id}">
                  <div class="goal-preset-left">
                    <span class="goal-preset-icon">${g.icon}</span>
                    <div class="goal-preset-meta">
                      <span class="goal-preset-title">${escapeHTML(g.title)}</span>
                      <span class="goal-preset-desc">${escapeHTML(g.desc)} (~${g.defaultTargetWords} từ)</span>
                    </div>
                  </div>
                  <div class="goal-preset-check">${g.id === selectedGoalId ? '✓' : ''}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- KHUNG 5: CHỌN NHỊP ĐỘ TỪ MỚI MỖI NGÀY -->
          <div class="cefr-analyzer-section">
            <span class="goal-sec-label">Nhịp độ nạp từ mới mỗi ngày:</span>
            <div class="pace-selector-group">
              ${[5, 10, 15, 20, 30].map(p => `
                <button type="button" class="pace-pill-btn ${p === selectedDailyNew ? 'active' : ''}" data-pace="${p}">
                  <strong>${p}</strong>
                  <span>từ/ngày</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="quick-modal-footer" style="display: flex; gap: 8px;">
          <button type="button" class="btn-quick-action-secondary btn-quick-close" style="flex: 1;">
            <span>Đóng</span>
          </button>
          <button type="button" class="btn-confirm-primary" id="btn-save-goal-settings" style="flex: 2; min-height: 44px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; background: var(--primary); color: #fff; border: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
            <span>Lưu & Áp Dụng Lộ Trình</span>
          </button>
        </div>
      </div>
    `;

    // Gán sự kiện chọn Lộ trình
    const presetItems = modal.querySelectorAll('.goal-preset-item');
    presetItems.forEach(item => {
      item.onclick = () => {
        selectedGoalId = item.getAttribute('data-goal-id');
        renderModalContent();
      };
    });

    // Gán sự kiện chọn Pace
    const paceBtns = modal.querySelectorAll('.pace-pill-btn');
    paceBtns.forEach(btn => {
      btn.onclick = () => {
        selectedDailyNew = Number(btn.getAttribute('data-pace')) || 10;
        renderModalContent();
      };
    });

    // Gán sự kiện Lưu
    const btnSave = modal.querySelector('#btn-save-goal-settings');
    if (btnSave) {
      btnSave.onclick = () => {
        const goalObj = getLearningGoal(selectedGoalId);
        if (!app.settings) app.settings = {};
        app.settings.dailyNewLimit = selectedDailyNew;
        app.settings.activeGoal = {
          id: selectedGoalId,
          dailyNew: selectedDailyNew,
          targetWords: selectedGoalId === 'custom' ? selectedTargetWords : (goalObj.defaultTargetWords || 3027),
          customTitle: ''
        };

        StorageManager.saveSettings(app.settings);
        modal.classList.remove('active');
        updateHomeStatsRealtime(app);
        if (app.deckManager) app.deckManager.invalidateStatsCache();
        app.showToast(`🎯 Đã áp dụng lộ trình: ${goalObj.shortTitle} (${selectedDailyNew} từ/ngày)`, 'success', 3000);
      };
    }

    // Gán sự kiện đóng modal
    const closeBtns = modal.querySelectorAll('.btn-quick-close');
    closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };
  };

  renderModalContent();
  modal.classList.add('active');
}

/* ==========================================================================
   POPUP 5: CHI TIẾT DỰ BÁO THÔNG MINH FSRS (MỨC 5 THUẦN THỤC S >= 30 NGÀY)
   ========================================================================== */
export function showForecastDetailModal(app = _cachedApp) {
  if (!app) return;
  const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
  const cefrData = StatsManager.getCefrRoadmapAndForecast(allCards, app.settings || {});
  const { goal, forecast } = cefrData;

  let modal = document.getElementById('modal-forecast-detail');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-forecast-detail';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog forecast-detail-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-due">⚡</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Dự Báo Cán Đích FSRS-6</h3>
            <span class="quick-modal-sub">Dựa trên tiêu chuẩn Mức 5 (Thuần thục S ≥ 30 ngày)</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>

      <div class="quick-modal-body">
        <!-- 1. Thẻ Kết Quả Dự Báo Nổi Bật -->
        <div class="forecast-hero-card">
          <div class="forecast-hero-badge">${forecast.isUsingRealBehavior ? '⚡ Thích Ứng Thời Gian Thực' : '🏁 Theo Kế Hoạch Chuẩn'}</div>
          <h4 class="forecast-hero-title">
            ${goal.unmasteredWords === 0 
              ? `Đã thuần thục 100% mục tiêu ${forecast.shortGoalTitle}! 🎉` 
              : `Bạn sẽ đạt <strong>${goal.title}</strong> sau <strong>~${forecast.etaDays} ngày</strong>`}
          </h4>
          <p class="forecast-hero-sub">
            ${goal.unmasteredWords === 0 
              ? `Toàn bộ ${goal.targetWords.toLocaleString('vi-VN')} từ vựng đã đạt độ bền trí nhớ sâu (S ≥ 30 ngày).` 
              : `Dự kiến cán đích vào: <strong style="color: #10b981;">${forecast.targetDateFormatted}</strong> nếu duy trì nhịp độ học hiện tại.`}
          </p>
        </div>

        <!-- 2. Bảng 4 Chỉ Số Cốt Lõi Tính Toán -->
        <div class="forecast-metrics-grid">
          <div class="forecast-metric-box">
            <span class="forecast-box-icon">💎</span>
            <div class="forecast-box-info">
              <span class="forecast-box-label">Đã thuần thục (S ≥ 30d)</span>
              <strong class="forecast-box-val" style="color: #10b981;">${goal.matureMasteredWords.toLocaleString('vi-VN')} <small>/ ${goal.targetWords.toLocaleString('vi-VN')}</small></strong>
              <span class="forecast-box-sub">Tiến độ vững chắc: ${goal.masteryPct}%</span>
            </div>
          </div>

          <div class="forecast-metric-box">
            <span class="forecast-box-icon">📖</span>
            <div class="forecast-box-info">
              <span class="forecast-box-label">Đã nạp / Tiếp cận</span>
              <strong class="forecast-box-val" style="color: var(--primary, #6366f1);">${goal.learnedWords.toLocaleString('vi-VN')} <small>/ ${goal.targetWords.toLocaleString('vi-VN')}</small></strong>
              <span class="forecast-box-sub">Độ phủ từ vựng: ${goal.completionPct}%</span>
            </div>
          </div>

          <div class="forecast-metric-box">
            <span class="forecast-box-icon">⚡</span>
            <div class="forecast-box-info">
              <span class="forecast-box-label">Tốc độ nạp mới</span>
              <strong class="forecast-box-val" style="color: #f59e0b;">${forecast.effectiveVelocity} <small>từ/ngày</small></strong>
              <span class="forecast-box-sub">${forecast.isUsingRealBehavior ? 'Đo từ 7 ngày gần nhất' : 'Mục tiêu thiết lập'}</span>
            </div>
          </div>

          <div class="forecast-metric-box">
            <span class="forecast-box-icon">🎯</span>
            <div class="forecast-box-info">
              <span class="forecast-box-label">Độ nhớ phản xạ FSRS</span>
              <strong class="forecast-box-val" style="color: #10b981;">${forecast.empiricalAccuracy}%</strong>
              <span class="forecast-box-sub">~${forecast.expectedRepsPerWord} lượt ôn để ngấm sâu</span>
            </div>
          </div>
        </div>

        <!-- 3. Giải thích công thức khoa học minh bạch -->
        <div class="forecast-formula-card">
          <div class="formula-card-title">
            <span>🔬</span>
            <strong>Công thức tính toán FSRS-6 minh bạch:</strong>
          </div>
          <ul class="formula-steps-list">
            <li><strong>Mốc thuần thục (Mức 5):</strong> Từ vựng chỉ được tính là "Đạt" khi đạt <em>Độ bền S ≥ 30 ngày</em> (trí nhớ dài hạn), không tính từ mới vừa lướt qua một lần.</li>
            <li><strong>Thời gian nạp từ mới:</strong> Cần khoảng <strong>${forecast.daysToAcquireAllNew || 0} ngày</strong> để tiếp cận toàn bộ ${goal.remainingWords.toLocaleString('vi-VN')} từ chưa học theo nhịp độ ${forecast.effectiveVelocity} từ/ngày.</li>
            <li><strong>Chu kỳ củng cố FSRS:</strong> Mẻ từ cuối cùng cần thêm khoảng <strong>~${forecast.consolidationBuffer || 0} ngày</strong> giãn cách để chuyển hóa vững chắc vào trí nhớ dài hạn.</li>
          </ul>
        </div>
      </div>

      <div class="quick-modal-footer" style="display: flex; gap: 8px;">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="flex: 1;">
          <span>Đóng</span>
        </button>
        <button type="button" class="btn-confirm-primary" id="btn-forecast-change-goal" style="flex: 1.5; min-height: 44px; border-radius: 12px; font-weight: 800; font-size: 0.88rem; cursor: pointer; background: var(--primary, #6366f1); color: #fff; border: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
          <span>⚙️ Đổi Mục Tiêu</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const btnChangeGoal = modal.querySelector('#btn-forecast-change-goal');
  if (btnChangeGoal) {
    btnChangeGoal.onclick = () => {
      modal.classList.remove('active');
      showGoalCustomizerModal(app);
    };
  }

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}


