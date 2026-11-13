/**
 * Review Stat Modals: Reviewed Today, Study Time & Mastered Stability Tiers
 */

import { StorageManager } from "../../services/storage.js";
import { Rating } from "../../core/fsrs.js";
import { globalStudyTimer, StatsManager } from "../../core/stats.js";
import { escapeHTML, getLocalDateKey } from "../../utils.js";
import { showStreakHubModal } from "../components.js";
import {
  getStatModalsApp,
  ensureQuickModal,
  openAndBindQuickModal,
} from "./modal-utils.js";

/**
 * Modal Danh sách thẻ đã ôn hôm nay
 */
export function showReviewedTodayModal(app = getStatModalsApp()) {
  if (!app || !app.deckManager) return;
  const logs = StorageManager.getStudyLogs() || [];
  const todayKey = getLocalDateKey();
  const allCardsMap = new Map();
  app.deckManager.getAllCards().forEach((c) => allCardsMap.set(c.id, c));

  const todayLogs = [];
  const ratingCounts = {
    [Rating.Easy]: 0,
    [Rating.Good]: 0,
    [Rating.Hard]: 0,
    [Rating.Again]: 0,
  };

  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (!log || !log.timestamp) continue;
    if (getLocalDateKey(log.timestamp) === todayKey) {
      todayLogs.push(log);
      if (ratingCounts[log.rating] !== undefined) {
        ratingCounts[log.rating]++;
      }
    }
  }

  const modal = ensureQuickModal("modal-quick-reviewed-today");
  const ratingLabelMap = {
    [Rating.Easy]: { text: "DỄ", icon: "⚡", color: "#10b981" },
    [Rating.Good]: { text: "TỐT", icon: "✨", color: "#6366f1" },
    [Rating.Hard]: { text: "KHÓ", icon: "⏳", color: "#f59e0b" },
    [Rating.Again]: { text: "QUÊN", icon: "❌", color: "#ef4444" },
  };

  const wordListHTML =
    todayLogs.length > 0
      ? todayLogs
          .map((log) => {
            const card = allCardsMap.get(log.cardId) || {
              word: log.word || log.cardId,
              phonetic: "",
              pos: "word",
              meaning: "",
            };
            const ratingInfo = ratingLabelMap[log.rating] || {
              text: "ÔN",
              icon: "📝",
              color: "#6366f1",
            };
            const timeStr = new Date(log.timestamp).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" },
            );

            return `
          <div class="due-word-row reviewed-word-row">
            <div class="due-word-left">
              <span class="due-word-text">${escapeHTML(card.word)}</span>
              ${card.phonetic ? `<span class="due-word-ipa">${escapeHTML(card.phonetic)}</span>` : ""}
              ${card.meaning ? `<span class="reviewed-word-meaning">${escapeHTML(card.meaning)}</span>` : ""}
            </div>
            <div class="due-word-right" style="display: flex; align-items: center; gap: 8px;">
              <span class="reviewed-rating-tag" style="background: ${ratingInfo.color}18; color: ${ratingInfo.color}; border: 1px solid ${ratingInfo.color}40; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
                ${ratingInfo.icon} ${ratingInfo.text}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${timeStr}</span>
            </div>
          </div>
        `;
          })
          .join("")
      : `
      <div class="quick-modal-empty">
        <span class="empty-emoji">📝</span>
        <h4 class="empty-title">Chưa có lượt ôn nào hôm nay</h4>
        <p class="empty-desc">Nhấn "Bắt đầu ôn Flashcard" để củng cố từ vựng và ghi nhận thành tích ngay nhé!</p>
      </div>
    `;

  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-reviewed">✅</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Thẻ Đã Ôn Hôm Nay</h3>
            <span class="quick-modal-sub">${todayLogs.length} lượt ôn tập đã hoàn thành</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        ${
          todayLogs.length > 0
            ? `
          <div style="display: flex; gap: 6px; margin-bottom: 12px; justify-content: space-between;">
            <span style="flex: 1; text-align: center; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">⚡ Dễ: ${ratingCounts[Rating.Easy]}</span>
            <span style="flex: 1; text-align: center; background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">✨ Tốt: ${ratingCounts[Rating.Good]}</span>
            <span style="flex: 1; text-align: center; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">⏳ Khó: ${ratingCounts[Rating.Hard]}</span>
            <span style="flex: 1; text-align: center; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 6px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">❌ Quên: ${ratingCounts[Rating.Again]}</span>
          </div>
        `
            : ""
        }
        <div class="due-word-list">
          ${wordListHTML}
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  openAndBindQuickModal(modal);
}

/**
 * Modal Tổng quan thời gian đã học
 */
export function showStudyTimeModal(app = getStatModalsApp()) {
  const todaySecs =
    (StorageManager.getTodayStudySeconds?.() || 0) +
    Math.floor(globalStudyTimer?.unflushedSeconds || 0);
  const todayMins =
    todaySecs > 0 && todaySecs < 60 ? 1 : Math.round(todaySecs / 60);
  const totalStored =
    typeof StorageManager.getTotalStudySeconds === "function"
      ? StorageManager.getTotalStudySeconds()
      : Object.values(StorageManager.getStudyTimeMap?.() || {}).reduce(
          (s, v) => s + (Number(v) || 0),
          0,
        );
  const totalSecs =
    totalStored + Math.floor(globalStudyTimer?.unflushedSeconds || 0);
  const totalHours = Math.floor(totalSecs / 3600);
  const totalRemainingMins = Math.round((totalSecs % 3600) / 60);

  const logs = StorageManager.getStudyLogs() || [];
  const streak = StatsManager.calculateStreak(logs);
  const totalReviews = logs.length;

  const modal = ensureQuickModal("modal-quick-study-time");
  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-time">⏱️</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Thời Gian Đã Học</h3>
            <span class="quick-modal-sub">Tổng quan thời gian học chủ động FSRS</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        <div class="quick-stats-grid">
          <div class="quick-stat-tile">
            <div class="tile-icon">⏱️</div>
            <div class="tile-info">
              <span class="tile-label">Hôm nay</span>
              <strong class="tile-val text-primary">${todayMins} <span class="tile-unit">phút</span></strong>
            </div>
          </div>
          <div class="quick-stat-tile" id="quick-tile-streak-link" role="button" tabindex="0" style="cursor: pointer;" title="Nhấn để mở Hồ sơ Streak & Khiên bảo vệ">
            <div class="tile-icon">🔥</div>
            <div class="tile-info">
              <span class="tile-label">Chuỗi ngày (Streak) ❯</span>
              <strong class="tile-val text-warning">${streak} <span class="tile-unit">ngày</span></strong>
            </div>
          </div>
          <div class="quick-stat-tile">
            <div class="tile-icon">⏳</div>
            <div class="tile-info">
              <span class="tile-label">Tổng tích lũy</span>
              <strong class="tile-val text-info">${totalHours}h ${totalRemainingMins}m</strong>
            </div>
          </div>
          <div class="quick-stat-tile">
            <div class="tile-icon">📝</div>
            <div class="tile-info">
              <span class="tile-label">Lượt ôn tập</span>
              <strong class="tile-val text-success">${totalReviews} <span class="tile-unit">lượt</span></strong>
            </div>
          </div>
        </div>
        <div class="quick-tip-box">
          <span class="tip-icon">💡</span>
          <p class="tip-text">Học đều đặn mỗi ngày từ 5 - 15 phút giúp não bộ củng cố đường mòn trí nhớ FSRS tốt nhất!</p>
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đã hiểu</span>
        </button>
      </div>
    </div>
  `;

  openAndBindQuickModal(modal);

  const tileStreakLink = modal.querySelector("#quick-tile-streak-link");
  if (tileStreakLink) {
    tileStreakLink.onclick = () => {
      modal.classList.remove("active");
      showStreakHubModal(app);
    };
  }
}

/**
 * Modal 5 mức độ ghi nhớ FSRS
 */
export function showMasteredTiersModal(app = getStatModalsApp()) {
  if (!app || !app.deckManager) return;
  const allCards = app.deckManager.getAllCards();
  const intel = StatsManager.getMemoryIntelligence(allCards);
  const tiers = intel.tiers || {
    tier1: { count: 0 },
    tier2: { count: 0 },
    tier3: { count: 0 },
    tier4: { count: 0 },
    tier5: { count: 0 },
  };
  const totalLearned = intel.totalLearned || 0;
  const retrievability = intel.currentRetrievability || 0;

  const tierRows = [
    { key: "tier5", num: 5, title: "Mức 5: Ghi nhớ sâu", desc: "Độ bền S ≥ 30 ngày (Ôn > 1 tháng)", short: "Ghi nhớ sâu" },
    { key: "tier4", num: 4, title: "Mức 4: Bền vững", desc: "Độ bền 14 - 29 ngày (Ôn 2 - 4 tuần)", short: "Bền vững" },
    { key: "tier3", num: 3, title: "Mức 3: Trung hạn", desc: "Độ bền 7 - 13 ngày (Ôn 1 - 2 tuần)", short: "Trung hạn" },
    { key: "tier2", num: 2, title: "Mức 2: Ngắn hạn", desc: "Độ bền 3 - 6 ngày (Ôn 3 - 7 ngày)", short: "Ngắn hạn" },
    { key: "tier1", num: 1, title: "Mức 1: Mới học", desc: "Độ bền < 3 ngày (Ôn 1 - 2 ngày)", short: "Mới học" },
  ];

  const modal = ensureQuickModal("modal-quick-mastered-tiers");
  modal.innerHTML = `
    <div class="modal-dialog quick-preview-dialog">
      <div class="quick-modal-header">
        <div class="quick-modal-title-wrap">
          <div class="quick-modal-icon badge-mastered">💎</div>
          <div class="quick-modal-headings">
            <h3 class="quick-modal-title">Cấp Độ Ghi Nhớ FSRS</h3>
            <span class="quick-modal-sub">Phân bổ ${totalLearned} từ theo độ bền trí nhớ</span>
          </div>
        </div>
        <button class="btn-icon-close btn-quick-close" type="button" title="Đóng">✕</button>
      </div>
      <div class="quick-modal-body">
        <div class="tier-distribution-track">
          ${tierRows
            .map(
              (r) =>
                `<div class="tier-seg seg-${r.num}" style="flex: ${tiers[r.key].count || 0.001};" title="${r.short}: ${tiers[r.key].count}"></div>`,
            )
            .join("")}
        </div>

        <div class="quick-tier-list">
          ${tierRows
            .map(
              (r) => `
            <div class="tier-row-item tier-${r.num}">
              <div class="tier-row-left">
                <span class="tier-dot dot-${r.num}"></span>
                <div class="tier-names">
                  <span class="tier-title">${r.title}</span>
                  <span class="tier-desc">${r.desc}</span>
                </div>
              </div>
              <strong class="tier-count">${tiers[r.key].count} <span class="tier-unit">từ</span></strong>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="quick-intel-summary">
          <div class="intel-summary-item">
            <span class="intel-label">Xác suất nhớ thực tế R(t)</span>
            <strong class="intel-val" style="color: #10b981;">${retrievability}%</strong>
          </div>
          <div class="intel-summary-item">
            <span class="intel-label">Danh hiệu Trí nhớ</span>
            <strong class="intel-val" style="color: ${intel.rank?.color || "#6366f1"};">${intel.rank?.title || "Khởi động"}</strong>
          </div>
        </div>
      </div>
      <div class="quick-modal-footer">
        <button type="button" class="btn-quick-action-secondary btn-quick-close" style="width: 100%;">
          <span>Đóng</span>
        </button>
      </div>
    </div>
  `;

  openAndBindQuickModal(modal);
}

