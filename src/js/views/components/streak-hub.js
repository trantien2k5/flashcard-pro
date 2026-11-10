/**
 * Streak Hub & Recovery Modal
 * UI quản lý chuỗi ngày học, đóng băng streak và auto-heal
 */

import { StorageManager } from '../../services/storage.js';
import { StatsManager } from '../../core/stats.js';

import { mountGlobalModals } from './shell.js';

/* ==========================================================================
   5. TRUNG TÂM CHUỖI & BẢO VỆ STREAK (STREAK HUB & RECOVERY MODAL)
   ========================================================================== */

export function showStreakHubModal(app) {
  let modal = document.getElementById('modal-streak-hub');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-streak-hub';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const logs = StorageManager.getStudyLogs() || [];
  const streakState = StorageManager.getStreakState();
  const currentStreak = StatsManager.calculateStreak(logs, streakState);
  const brokenInfo = StatsManager.detectBrokenStreak(logs, streakState);
  const longestStreak = Math.max(streakState.longestStreak || 0, currentStreak);
  const freezes = streakState.freezes || 0;
  const maxFreezes = streakState.maxFreezes || 2;

  let statusSectionHtml = '';

  if (brokenInfo.isBroken && brokenInfo.canRecover) {
    // Trường hợp chuỗi vừa bị đứt hôm qua
    statusSectionHtml = `
      <div class="streak-hub-broken-alert">
        <div class="broken-alert-header">
          <span class="broken-alert-icon">⚠️</span>
          <div>
            <h4 class="broken-alert-title">Chuỗi ${brokenInfo.pastStreakBeforeMiss} ngày vừa bị gián đoạn!</h4>
            <span class="broken-alert-sub">Ngày bị lỡ: <strong>${brokenInfo.missedDate}</strong> (Hôm qua)</span>
          </div>
        </div>
        <p class="broken-alert-desc">
          Đừng nản lòng! Bạn có 2 hình thức công bằng để bảo toàn và khôi phục lại chuỗi <strong>${brokenInfo.potentialRestoredStreak} ngày</strong>:
        </p>

        <!-- Lựa chọn 1: Khiên đóng băng -->
        <div class="streak-recovery-option-card ${brokenInfo.canUseFreeze ? 'option-available' : 'option-disabled'}">
          <div class="option-icon-box">🛡️</div>
          <div class="option-info">
            <div class="option-title-row">
              <strong class="option-name">Dùng Khiên Đóng Băng</strong>
              <span class="option-badge ${brokenInfo.canUseFreeze ? 'badge-ok' : 'badge-empty'}">
                ${brokenInfo.canUseFreeze ? `Còn ${freezes} khiên` : 'Hết khiên (0/2)'}
              </span>
            </div>
            <p class="option-desc">Bảo vệ ngày bị lỡ và nối lại chuỗi ngay lập tức mà không cần làm bài kiểm tra.</p>
          </div>
          <button type="button" class="btn-use-streak-freeze" id="btn-use-freeze-action" ${!brokenInfo.canUseFreeze ? 'disabled' : ''}>
            ${brokenInfo.canUseFreeze ? '❄️ Kích hoạt khiên' : 'Không khả dụng'}
          </button>
        </div>

        <!-- Lựa chọn 2: Thử thách chuộc lỗi -->
        <div class="streak-recovery-option-card ${brokenInfo.canRedeem ? 'option-available' : 'option-disabled'}">
          <div class="option-icon-box">⚡</div>
          <div class="option-info">
            <div class="option-title-row">
              <strong class="option-name">Thử Thách Chuộc Lỗi (Smart Quiz)</strong>
              <span class="option-badge ${brokenInfo.canRedeem ? 'badge-quiz' : 'badge-cooldown'}">
                ${brokenInfo.canRedeem ? '15 câu • ≥ 80%' : `Hồi chiêu (${brokenInfo.cooldownDaysLeft} ngày)`}
              </span>
            </div>
            <p class="option-desc">
              ${brokenInfo.canRedeem 
                ? 'Chứng minh nỗ lực học tập gấp đôi: hoàn thành 15 câu trắc nghiệm FSRS với độ chính xác từ 80% trở lên.' 
                : `Quyền chuộc lỗi đang trong thời gian hồi chiêu (${brokenInfo.cooldownDaysLeft} ngày nữa). Tối đa 1 lần / 14 ngày để giữ tính kỷ luật.`}
            </p>
          </div>
          <button type="button" class="btn-start-redemption-quiz" id="btn-start-redemption-action" ${!brokenInfo.canRedeem ? 'disabled' : ''}>
            ${brokenInfo.canRedeem ? '⚡ Làm bài chuộc lỗi' : 'Đang hồi chiêu'}
          </button>
        </div>
      </div>
    `;
  } else {
    // Trường hợp chuỗi đang an toàn & hoạt động bình thường
    statusSectionHtml = `
      <div class="streak-hub-safe-card">
        <div class="safe-status-head">
          <span class="safe-status-icon">${brokenInfo.studiedToday ? '✅' : '⏳'}</span>
          <div>
            <h4 class="safe-status-title">
              ${brokenInfo.studiedToday ? 'Chuỗi hôm nay đã được bảo toàn an toàn!' : 'Hôm nay chưa ghi nhận lượt học nào'}
            </h4>
            <span class="safe-status-sub">
              ${brokenInfo.studiedToday 
                ? 'Bạn đã ôn tập hôm nay và giữ vững phong độ học tập liên tục.' 
                : 'Hãy ôn tập ít nhất 1 từ vựng trước 24:00 để duy trì chuỗi ngày học.'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog streak-hub-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-streak-hub">🔥</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Hồ Sơ Chuỗi & Bảo Vệ Streak</h3>
            <span class="quick-modal-sub">Hệ thống bảo toàn kỷ luật học tập FSRS-6</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>

      <div class="quick-modal-body streak-hub-modal-body">
        <!-- 3 Bento Stat Tiles -->
        <div class="quick-stats-grid streak-hub-grid">
          <div class="quick-stat-tile ${brokenInfo.isBroken ? 'tile-broken-state' : ''}">
            <div class="tile-icon">🔥</div>
            <div class="tile-info">
              <span class="tile-label">Chuỗi hiện tại</span>
              <strong class="tile-val text-warning">
                ${currentStreak} <span class="tile-unit">ngày</span>
              </strong>
              ${brokenInfo.isBroken ? '<span class="tile-tag-broken">Đứt hôm qua</span>' : ''}
            </div>
          </div>

          <div class="quick-stat-tile">
            <div class="tile-icon">🏆</div>
            <div class="tile-info">
              <span class="tile-label">Kỷ lục dài nhất</span>
              <strong class="tile-val text-primary">
                ${longestStreak} <span class="tile-unit">ngày</span>
              </strong>
            </div>
          </div>

          <div class="quick-stat-tile">
            <div class="tile-icon">🛡️</div>
            <div class="tile-info">
              <span class="tile-label">Khiên đóng băng</span>
              <strong class="tile-val text-success">
                ${freezes}/${maxFreezes} <span class="tile-unit">khiên</span>
              </strong>
            </div>
          </div>
        </div>

        <!-- Trạng thái chi tiết & Cứu chuỗi -->
        ${statusSectionHtml}

        <!-- Hộp hướng dẫn cơ chế công bằng (Fair-play Rules) -->
        <div class="quick-tip-box streak-hub-rules-box">
          <span class="tip-icon">💡</span>
          <div class="tip-content">
            <strong style="display: block; font-size: 0.76rem; color: var(--text-primary); margin-bottom: 2px;">Cơ chế bảo vệ công bằng & không gian lận:</strong>
            <ul style="margin: 0; padding-left: 14px; font-size: 0.72rem; color: var(--text-secondary); line-height: 1.45;">
              <li><strong>Tích lũy Khiên:</strong> Duy trì học đều đặn <strong>7 ngày liên tục</strong> được thưởng tự động <strong>1 Khiên đóng băng</strong> (Tối đa trữ 2 khiên).</li>
              <li><strong>Thử Thách Chuộc Lỗi:</strong> Không mua bằng tiền, chỉ đổi bằng nỗ lực học tập gấp đôi (Làm Quiz 15 câu ≥ 80%). Tối đa 1 lần / 14 ngày.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đã hiểu</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtns = modal.querySelectorAll('.btn-quick-close');
  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };

  // Xử lý nút Kích hoạt khiên đóng băng
  const btnUseFreeze = modal.querySelector('#btn-use-freeze-action');
  if (btnUseFreeze && !btnUseFreeze.disabled) {
    btnUseFreeze.onclick = () => {
      const ok = StorageManager.useStreakFreeze(brokenInfo.missedDate);
      if (ok) {
        showToast('❄️ Đã kích hoạt Khiên Đóng Băng! Chuỗi ngày học của bạn đã được bảo toàn trọn vẹn.', 'success', 3500);
        modal.classList.remove('active');
        if (app && typeof app.updateHeaderBadges === 'function') app.updateHeaderBadges();
        if (app && typeof app.refreshAllViews === 'function') app.refreshAllViews();
      } else {
        showToast('Không thể kích hoạt khiên.', 'error');
      }
    };
  }

  // Xử lý nút Bắt đầu Thử Thách Chuộc Lỗi
  const btnStartRedeem = modal.querySelector('#btn-start-redemption-action');
  if (btnStartRedeem && !btnStartRedeem.disabled) {
    btnStartRedeem.onclick = () => {
      modal.classList.remove('active');
      if (typeof app.startQuizSession === 'function') {
        app.startQuizSession(null, {
          mode: 'redemption',
          targetDateKey: brokenInfo.missedDate,
          potentialStreak: brokenInfo.potentialRestoredStreak
        });
      }
    };
  }
}


