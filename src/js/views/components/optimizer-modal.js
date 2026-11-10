/**
 * Behavioral Optimizer Modal
 * UI hiển thị radar leech, phân tích nhịp sinh học và độ trễ nhận thức
 */

import { StorageManager } from '../../services/storage.js';
import { BehavioralOptimizer } from '../../core/stats.js';
import { escapeHTML } from '../../utils.js';


/* ==========================================================================
   6. BEHAVIORAL OPTIMIZER MODAL (PHÂN TÍCH HÀNH VI & TỐI ƯU HÓA CÁ NHÂN HÓA)
   ========================================================================== */

export function openBehavioralOptimizerModal(app) {
  let modal = document.getElementById('behavioral-optimizer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'behavioral-optimizer-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const analysis = BehavioralOptimizer.analyze(app);
  const { profile, recommendations, hasOptimizations } = analysis;
  const circadian = profile.circadian || {};
  const cefrList = profile.cefrBreakdown || [];
  const leechData = profile.leechDiagnostics || { count: 0, topWords: [] };

  modal.innerHTML = `
    <div class="modal-dialog optimizer-dialog">
      <div class="modal-header optimizer-header">
        <div class="optimizer-title-group">
          <div class="optimizer-icon">🧠</div>
          <div>
            <h3 class="optimizer-title">Phân tích Hành vi & Tối ưu hóa FSRS</h3>
            <p class="optimizer-subtitle">Tự động cân chỉnh thông số theo nhịp sinh học và năng lực tiếp thu thực tế</p>
          </div>
        </div>
        <button class="btn-icon-close" id="btn-close-optimizer-modal" title="Đóng" aria-label="Đóng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body optimizer-body">
        <!-- 0. Giới thiệu ngắn gọn cơ chế hoạt động -->
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 10px 12px; margin-bottom: 14px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45;">
          💡 <strong>Cách hoạt động:</strong> Thuật toán AI đo lường độ trễ phản xạ Active Recall, nhịp sinh học và tỷ lệ quên thực tế để cá nhân hóa: <em>Độ bền FSRS khởi điểm, tỷ lệ nhớ mục tiêu và nhịp độ học</em> chuẩn xác cho não bộ của bạn.
        </div>

        <!-- 1. Behavioral Profile Metrics -->
        <div class="optimizer-section-label">📊 Hồ sơ Phản xạ & Trí nhớ Thực tế</div>
        <div class="optimizer-profile-grid">
          <div class="profile-stat-box">
            <div class="stat-top">
              <span class="stat-icon">⏱️</span>
              <span class="stat-num">${profile.avgLatencySec > 0 ? profile.avgLatencySec + 's' : '—'}</span>
            </div>
            <div class="stat-title">Tốc độ nhớ lại</div>
            <div class="stat-desc text-muted">${profile.speedType}</div>
          </div>

          <div class="profile-stat-box">
            <div class="stat-top">
              <span class="stat-icon">🎯</span>
              <span class="stat-num ${profile.actualRetentionPct >= 80 ? 'text-success' : 'text-warning'}">${profile.totalReviews > 0 ? profile.actualRetentionPct + '%' : '90%'}</span>
            </div>
            <div class="stat-title">Tỉ lệ nhớ thành công</div>
            <div class="stat-desc text-muted">${profile.totalReviews > 0 ? `${profile.totalReviews} lượt đánh giá` : 'Đang thu thập'}</div>
          </div>

          <div class="profile-stat-box">
            <div class="stat-top">
              <span class="stat-icon">👁️</span>
              <span class="stat-num">${profile.avgBackViewSec > 0 ? profile.avgBackViewSec + 's' : '0s'}</span>
            </div>
            <div class="stat-title">Thời gian xem đáp án</div>
            <div class="stat-desc text-muted">${profile.verificationType}</div>
          </div>

          <div class="profile-stat-box">
            <div class="stat-top">
              <span class="stat-icon">⏳</span>
              <span class="stat-num">${profile.avgDailyMinutes > 0 ? profile.avgDailyMinutes + 'p' : '0p'}</span>
            </div>
            <div class="stat-title">Thời gian học/ngày</div>
            <div class="stat-desc text-muted">${profile.activeDays} ngày ghi nhận</div>
          </div>
        </div>

        <!-- 2. Circadian Learning Insight (Khung giờ vàng ghi nhớ) -->
        <div class="optimizer-insight-card">
          <div class="optimizer-section-label" style="margin-bottom: 4px;">🕒 Nhịp Sinh Học & Khung Giờ Vàng Trí Nhớ</div>
          ${circadian.peakPeriod ? `
            <div style="font-size: 0.8rem; line-height: 1.45; color: var(--text-primary); margin-top: 4px;">
              🌟 <strong>Giờ Não Bộ Đỉnh Cao:</strong> Bạn đạt phong độ cao nhất vào <strong>${escapeHTML(circadian.peakPeriod.name)}</strong> (${escapeHTML(circadian.peakPeriod.range)}) với tỷ lệ nhớ <strong>${circadian.peakPeriod.retentionPct}%</strong>${circadian.peakPeriod.avgLatency ? ` và phản xạ <strong>${circadian.peakPeriod.avgLatency}s</strong>` : ''}. Đây là thời điểm vàng để nạp từ mới!
            </div>
          ` : `
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
              Đang phân tích khung giờ học... Hãy duy trì học thêm vài phiên để hệ thống phát hiện thời điểm não bộ tiếp thu tốt nhất trong ngày.
            </div>
          `}
          ${circadian.fatiguePeriod ? `
            <div style="font-size: 0.78rem; line-height: 1.4; color: #f59e0b; margin-top: 6px;">
              💤 <strong>Cảnh báo giảm sút:</strong> Vào <strong>${escapeHTML(circadian.fatiguePeriod.name)}</strong> (${escapeHTML(circadian.fatiguePeriod.range)}), tỷ lệ nhớ giảm còn <strong>${circadian.fatiguePeriod.retentionPct}%</strong>. Nên tránh học dồn từ mới vào khung giờ này để không quá tải.
            </div>
          ` : ''}
          <div class="optimizer-circadian-grid">
            ${(circadian.periods || []).map(p => `
              <div class="circadian-pill ${circadian.peakPeriod?.id === p.id ? 'peak' : (circadian.fatiguePeriod?.id === p.id ? 'fatigue' : '')}">
                <div class="circadian-title">
                  <span>${p.icon}</span>
                  <span>${escapeHTML(p.name)}</span>
                </div>
                <div class="circadian-val">
                  ${p.hasData ? `${p.retentionPct}% nhớ ${p.avgLatency ? `• ${p.avgLatency}s` : ''}` : '<span class="text-muted" style="font-size: 0.72rem;">Chưa có dữ liệu</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. CEFR Memory Matrix Breakdown -->
        <div class="optimizer-insight-card">
          <div class="optimizer-section-label" style="margin-bottom: 6px;">🎯 Ma Trận Trí Nhớ Phân Tầng CEFR</div>
          <div class="optimizer-cefr-list">
            ${cefrList.map(c => `
              <div class="optimizer-cefr-row">
                <span class="cefr-tag">${c.level}</span>
                <div class="cefr-bar-container">
                  <div class="cefr-bar-fill" style="width: ${c.hasData ? Math.max(10, c.retentionPct) : 0}%; background: ${c.statusColor};"></div>
                </div>
                <span class="cefr-stat-text" style="color: ${c.statusColor};">
                  ${c.hasData ? `${c.retentionPct}% ${c.avgLatency ? `(${c.avgLatency}s)` : ''}` : '0 từ'}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. Leech Cards Radar (Thẻ Bẫy Não nếu có) -->
        ${leechData.count > 0 ? `
          <div class="optimizer-alert warning" style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="alert-icon">⚠️</span>
              <strong>Phát hiện ${leechData.count} từ vựng bẫy não (quên ≥ 3 lần):</strong>
            </div>
            <p style="margin: 0; font-size: 0.78rem;">Đừng cố học vẹt các từ này. Hãy đọc to câu ví dụ 3 lần và liên tưởng ngữ cảnh thực tế:</p>
            <div class="leech-chips-wrap">
              ${leechData.topWords.map(w => `
                <span class="leech-word-chip">
                  <strong>${escapeHTML(w.word)}</strong>
                  <span class="leech-lapse-badge">${w.lapses}x quên</span>
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 5. Prompt Speed Warning if any -->
        ${profile.totalReviews >= 6 && profile.rushedRatingPct >= 40 && profile.avgBackViewSec < 1.2 ? `
          <div class="optimizer-alert warning" style="margin-top: 10px;">
            <span class="alert-icon">⚠️</span>
            <div class="alert-content">
              <strong>Lưu ý thao tác:</strong> Bạn đang bấm chuyển thẻ rất nhanh. Dành thêm 1-2 giây nghe phát âm và đọc ví dụ ở mặt sau sẽ giúp FSRS củng cố trí nhớ sâu hơn.
            </div>
          </div>
        ` : ''}

        <!-- 6. Recommendations -->
        <div class="optimizer-section-label" style="margin-top: 16px;">✨ Đề xuất Cân chỉnh Thuật toán FSRS-6</div>
        ${hasOptimizations ? `
          <div class="recommendations-list">
            ${recommendations.map(rec => `
              <div class="rec-card">
                <div class="rec-card-header">
                  <span class="rec-icon">${rec.icon}</span>
                  <div class="rec-label">${escapeHTML(rec.label)}</div>
                </div>
                <div class="rec-diff">
                  <span class="rec-val old">${escapeHTML(rec.currentValue)}</span>
                  <span class="rec-arrow">➔</span>
                  <span class="rec-val new">${escapeHTML(rec.recommendedValue)}</span>
                </div>
                <p class="rec-reason">${escapeHTML(rec.reason)}</p>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="optimizer-perfect-state">
            <div class="perfect-icon">🎉</div>
            <h4>Cấu hình hiện tại đã tối ưu hóa hoàn hảo!</h4>
            <p>${profile.totalReviews < 8 
              ? `Hệ thống FSRS đang theo dõi nhịp độ học của bạn (${profile.totalReviews}/8 lượt ôn). Thuật toán sẽ tiếp tục tự động học đường cong ghi nhớ khi bạn học thêm.`
              : 'Tỷ lệ ghi nhớ mục tiêu 90%, tốc độ audio và các tham số FSRS cá nhân hóa hiện tại đang hoàn toàn đồng bộ với năng lực tiếp thu của bạn.'
            }</p>
          </div>
        `}
      </div>

      <div class="modal-footer optimizer-footer">
        <button type="button" class="btn-confirm-secondary" id="btn-cancel-optimizer">Đóng</button>
        ${hasOptimizations ? `
          <button type="button" class="btn-primary-hero" id="btn-apply-optimizer" style="padding: 10px 22px; font-size: 0.95rem;">
            <span>✨ Áp dụng tối ưu (${recommendations.length})</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;

  const closeModal = () => {
    modal.classList.remove('active');
  };

  modal.querySelector('#btn-close-optimizer-modal')?.addEventListener('click', closeModal);
  modal.querySelector('#btn-cancel-optimizer')?.addEventListener('click', closeModal);
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const btnApply = modal.querySelector('#btn-apply-optimizer');
  if (btnApply) {
    btnApply.addEventListener('click', () => {
      const ok = BehavioralOptimizer.applyOptimizations(recommendations);
      if (ok) {
        if (app) {
          app.settings = StorageManager.getSettings();
          if (typeof app.refreshAllViews === 'function') app.refreshAllViews();
        }
        // Đồng bộ tức thời các ô input trên màn hình Cài đặt nếu đang mở
        try {
          const s = StorageManager.getSettings();
          const elRetention = document.getElementById('setting-retention');
          if (elRetention && s.requestRetention) elRetention.value = String(s.requestRetention);
          const elNewLimit = document.getElementById('setting-new-limit');
          if (elNewLimit && s.dailyNewLimit) elNewLimit.value = String(s.dailyNewLimit);
          const elReviewLimit = document.getElementById('setting-review-limit');
          if (elReviewLimit && s.dailyReviewLimit) elReviewLimit.value = String(s.dailyReviewLimit);
          const elSpeechRate = document.getElementById('setting-speech-rate');
          if (elSpeechRate && s.speechRate) elSpeechRate.value = String(s.speechRate);
        } catch (e) {}

        showToast('✨ Đã áp dụng các thông số cá nhân hóa tối ưu thành công!', 'success');
        closeModal();
      } else {
        showToast('Không thể cập nhật cấu hình.', 'error');
      }
    });
  }

  modal.classList.add('active');
}


