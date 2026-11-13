/**
 * Home / Review Tab - Realtime Dashboard Stats & CEFR Progress Updater
 */

import { StorageManager } from "../../services/storage.js";
import { State, isCardDue } from "../../core/fsrs.js";
import { globalStudyTimer, StatsManager } from "../../core/stats.js";
import { getLocalDateKey } from "../../utils.js";
import { MASTERY_STABILITY_THRESHOLD } from "../../config.js";
import { showStreakHubModal } from "../components.js";
import { getStatModalsApp } from "./modal-utils.js";

/**
 * Cập nhật toàn bộ các chỉ số thống kê trên Home Dashboard theo thời gian thực.
 */
export function updateHomeStatsRealtime(app = getStatModalsApp()) {
  if (!app || !app.deckManager) return;
  const allCards = app.deckManager.getAllCards();
  const now = new Date();

  let masteredCount = 0;
  let dueCount = 0;

  for (const card of allCards) {
    const state = StorageManager.getCardState(card.id);
    if (
      state &&
      state.state !== State.New &&
      state.state !== 0 &&
      !state.suspended
    ) {
      if (isCardDue(state, now)) dueCount++;
      const s = Number(state.stability) || 0;
      if (s >= MASTERY_STABILITY_THRESHOLD) masteredCount++;
    }
  }

  // 1. Số từ tới hạn
  const elDue = document.getElementById("home-due-count");
  if (elDue) elDue.textContent = dueCount;

  const elDueTag = document.getElementById("badge-home-due-tag");
  if (elDueTag) {
    if (dueCount > 0) {
      elDueTag.textContent = `${dueCount} từ`;
      elDueTag.className = "btn-cta-tag tag-due";
    } else {
      elDueTag.textContent = "Đã xong";
      elDueTag.className = "btn-cta-tag tag-done";
    }
  }

  // 2. Số thẻ đã ôn hôm nay
  const logs = StorageManager.getStudyLogs() || [];
  const todayKey = getLocalDateKey();
  let todayCount = 0;
  const todayNewCardIds = new Set();
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (!log || !log.timestamp) continue;
    if (getLocalDateKey(log.timestamp) === todayKey) {
      todayCount++;
      if (
        log.oldState === State.New ||
        log.oldState === 0 ||
        (log.oldState === undefined &&
          (log.state === State.New || log.state === 0 || log.isNew))
      ) {
        if (log.cardId) todayNewCardIds.add(log.cardId);
      }
    }
  }
  const todayNewCount = todayNewCardIds.size;

  const elReviewed = document.getElementById("home-reviewed-count");
  if (elReviewed) elReviewed.textContent = todayCount;

  // 3. Thời gian đã học
  const elTimer = document.getElementById("home-study-timer");
  if (elTimer) {
    const todaySecs = StorageManager.getTodayStudySeconds();
    const liveSecs =
      todaySecs + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
    const mins = liveSecs > 0 && liveSecs < 60 ? 1 : Math.round(liveSecs / 60);
    elTimer.textContent = mins;
  }

  // 4. Từ đã thuộc
  const elRetention = document.getElementById("home-retention-rate");
  if (elRetention) elRetention.textContent = masteredCount;

  // 4.5. Số đếm từ yếu cho huy hiệu Diệt từ khó
  if (app.deckManager?.getStudyModeCounts) {
    try {
      const modeCounts = app.deckManager.getStudyModeCounts(null, app.settings);
      const elWeakBadge = document.getElementById("badge-weak-count");
      if (elWeakBadge) elWeakBadge.textContent = `${modeCounts.weakCount} từ`;
    } catch (e) {}
  }

  // 4.6. Thẻ Thống Kê Từ Khó (Attention Cards - Quên >= 8 lần)
  if (app.deckManager?.getAttentionCards) {
    try {
      const attentionData = app.deckManager.getAttentionCards();
      const elAttentionCard = document.getElementById("home-attention-card");
      const elTotalBadge = document.getElementById("attention-total-badge");
      const elLeechTag = document.getElementById("attention-leech-tag");

      if (elTotalBadge) {
        elTotalBadge.textContent = `${attentionData.totalCount} từ`;
      }
      if (elLeechTag) elLeechTag.textContent = "Quên ≥ 8 lần";

      if (elAttentionCard) {
        elAttentionCard.classList.toggle(
          "is-empty",
          attentionData.totalCount === 0,
        );
      }
    } catch (e) {
      console.warn("Lỗi khi cập nhật Attention Cards:", e);
    }
  }

  // 5. LỘ TRÌNH CEFR & DỰ BÁO NHỊP ĐỘ HỌC TẬP
  const cefrData = StatsManager.getCefrRoadmapAndForecast(
    allCards,
    app.settings || {},
  );
  const { levels, currentLevel, goal, forecast } = cefrData;
  const dailyNewTarget =
    Number(app.settings?.activeGoal?.dailyNew) ||
    Number(app.settings?.dailyNewLimit) ||
    10;
  const remainingNewToday = Math.max(0, dailyNewTarget - todayNewCount);

  const elGoalIcon = document.getElementById("home-goal-icon");
  if (elGoalIcon) elGoalIcon.textContent = goal.icon || "🎯";

  const elGoalTitle = document.getElementById("home-goal-title");
  if (elGoalTitle) {
    elGoalTitle.textContent =
      currentLevel.fullTitle ||
      `Trình Độ ${currentLevel.id} (${currentLevel.name})`;
  }

  const elTargetTag = document.getElementById("home-target-tag");
  if (elTargetTag) {
    elTargetTag.textContent = `Mục tiêu: ${goal.shortTitle || goal.title} ❯`;
  }

  const elCurBadge = document.getElementById("home-current-level-badge");
  if (elCurBadge) {
    elCurBadge.textContent = `${currentLevel.id} (${currentLevel.progressPct}%)`;
    elCurBadge.style.borderColor = `${currentLevel.color}40`;
    elCurBadge.style.color = currentLevel.color;
    elCurBadge.style.background = `${currentLevel.color}15`;
  }

  ["A1", "A2", "B1", "B2", "C1"].forEach((tierId) => {
    const dot = document.getElementById(`dot-${tierId}`);
    if (!dot) return;
    const tier = levels[tierId];
    const tierPct = tier && tier.total > 0 ? tier.learned / tier.total : 0;
    dot.className = "cefr-step-dot";
    if (tierPct >= 0.9) {
      dot.classList.add("completed");
      dot.innerHTML = "✓";
    } else if (tierId === currentLevel.id) {
      dot.classList.add("active");
      dot.innerHTML = tierId;
    } else if (tierPct > 0) {
      dot.classList.add("in-progress");
      dot.innerHTML = tierId;
    } else {
      dot.innerHTML = tierId;
    }
  });

  const updateLineFill = (lineId, fromTierId) => {
    const elLine = document.getElementById(lineId);
    if (!elLine) return;
    const fromTier = levels[fromTierId];
    const fromPct =
      fromTier && fromTier.total > 0 ? fromTier.learned / fromTier.total : 0;
    elLine.style.width = `${Math.min(100, Math.round(fromPct * 100))}%`;
  };

  updateLineFill("fill-A1-A2", "A1");
  updateLineFill("fill-A2-B1", "A2");
  updateLineFill("fill-B1-B2", "B1");
  updateLineFill("fill-B2-C1", "B2");

  const elGoalWords = document.getElementById("home-goal-progress-words");
  if (elGoalWords) {
    elGoalWords.textContent = `${goal.learnedWords} / ${goal.targetWords} từ`;
  }

  const elGoalPct = document.getElementById("home-goal-percent");
  if (elGoalPct) elGoalPct.textContent = `${goal.completionPct}%`;

  const elGoalFill = document.getElementById("home-goal-progress-fill");
  if (elGoalFill) elGoalFill.style.width = `${goal.completionPct}%`;

  const elNewTag = document.getElementById("badge-home-new-tag");
  const elNewSubtext = document.getElementById("subtext-home-new-progress");
  if (elNewTag) {
    if (todayNewCount >= dailyNewTarget) {
      elNewTag.textContent = `✓ ${todayNewCount}/${dailyNewTarget} từ`;
      elNewTag.className = "btn-cta-tag tag-done";
    } else {
      elNewTag.textContent = `${todayNewCount}/${dailyNewTarget} từ`;
      elNewTag.className = "btn-cta-tag tag-new";
    }
  }
  if (elNewSubtext) {
    elNewSubtext.textContent =
      todayNewCount >= dailyNewTarget
        ? "Đã đạt chỉ tiêu • Học thêm"
        : `Còn thiếu ${remainingNewToday} từ • Phổ biến nhất`;
  }

  const elGoalEta = document.getElementById("home-goal-eta-text");
  const elGoalEtaWrapper = document.getElementById("home-goal-eta-wrapper");
  if (elGoalEta) {
    if (goal.unmasteredWords === 0) {
      elGoalEta.textContent = `✓ Thuộc ${forecast.shortGoalTitle}`;
      if (elGoalEtaWrapper) {
        elGoalEtaWrapper.innerHTML = `<strong style="color: #10b981;">✓ Thuộc ${forecast.shortGoalTitle} (100%)</strong>`;
      }
    } else {
      elGoalEta.textContent = `~${forecast.etaDays} ngày`;
      if (elGoalEtaWrapper) {
        elGoalEtaWrapper.innerHTML = `<span>Đạt <strong>${forecast.shortGoalTitle}</strong>: <strong>~${forecast.etaDays} ngày</strong></span>`;
      }
    }
  }

  const elEtaIcon = document.getElementById("home-goal-eta-icon");
  if (elEtaIcon) {
    elEtaIcon.textContent = forecast.isUsingRealBehavior ? "⚡" : "🏁";
  }

  // 7. Cảnh báo khôi phục Streak nếu vừa bị đứt hôm qua
  const alertContainer = document.getElementById("home-streak-alert-container");
  if (alertContainer) {
    const brokenInfo = StatsManager.detectBrokenStreak(logs);
    if (brokenInfo && brokenInfo.isBroken && brokenInfo.canRecover) {
      alertContainer.innerHTML = `
        <div class="streak-recovery-alert-card" id="btn-open-streak-hub-banner" role="button" tabindex="0" title="Nhấn để mở Trung tâm bảo vệ & cứu chuỗi ngày học">
          <div class="alert-pulse-dot"></div>
          <div class="recovery-icon-badge">⚠️</div>
          <div class="recovery-text-group">
            <div class="recovery-title-row">
              <strong class="recovery-main-title">Chuỗi ${brokenInfo.pastStreakBeforeMiss} ngày vừa bị gián đoạn!</strong>
              <span class="recovery-badge-pill">Có thể cứu</span>
            </div>
            <span class="recovery-sub-text">Dùng Khiên Đóng Băng hoặc làm Thử Thách Chuộc Lỗi để nối lại chuỗi ngay.</span>
          </div>
          <button type="button" class="btn-recovery-cta">Cứu Streak ❯</button>
        </div>
      `;
      const bannerBtn = alertContainer.querySelector(
        "#btn-open-streak-hub-banner",
      );
      if (bannerBtn) {
        bannerBtn.onclick = () => showStreakHubModal(app);
        bannerBtn.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            showStreakHubModal(app);
          }
        };
      }
    } else {
      alertContainer.innerHTML = "";
    }
  }
}

