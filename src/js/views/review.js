/**
 * Flashcard English Pro - Màn hình Trang Chủ (Home / Review View Facade)
 */

import { StorageManager } from "../services/storage.js";
import { globalStudyTimer } from "../core/stats.js";
import { openCustomStudyModal } from "./components.js";
import {
  showGoalCustomizerModal,
  showForecastDetailModal,
} from "./modals/goal-modal.js";
import { renderReviewShell } from "./review/shell.js";
import { updateHomeStatsRealtime } from "./review/realtime.js";
import {
  setStatModalsApp,
  showAttentionCardsModal,
  showDueWordsModal,
  showReviewedTodayModal,
  showStudyTimeModal,
  showMasteredTiersModal,
} from "./review/stat-modals.js";

export {
  renderReviewShell,
  updateHomeStatsRealtime,
  showGoalCustomizerModal,
  showForecastDetailModal,
  showAttentionCardsModal,
  showDueWordsModal,
  showReviewedTodayModal,
  showStudyTimeModal,
  showMasteredTiersModal,
};

let _isTimerListening = false;

function bindClickOnce(id, handler) {
  const el = document.getElementById(id);
  if (!el || el._bound) return;
  el._bound = true;
  el.onclick = handler;
}

function bindCardActivateOnce(id, handler, stopProp = false) {
  const el = document.getElementById(id);
  if (!el || el._bound) return;
  el._bound = true;
  el.onclick = (e) => {
    if (stopProp) e.stopPropagation();
    handler(e);
  };
  el.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (stopProp) e.stopPropagation();
      handler(e);
    }
  };
}

export function renderReviewTab(app) {
  try {
    setStatModalsApp(app);
    const container =
      document.getElementById("tab-review") ||
      document.getElementById("tab-home");
    if (!container) return;
    renderReviewShell(container);

    if (!_isTimerListening) {
      _isTimerListening = true;
      globalStudyTimer.subscribe(() => {
        const elTimer = document.getElementById("home-study-timer");
        if (elTimer) {
          const todaySecs = StorageManager.getTodayStudySeconds();
          const liveSecs =
            todaySecs + Math.floor(globalStudyTimer.unflushedSeconds || 0);
          const mins =
            liveSecs > 0 && liveSecs < 60 ? 1 : Math.round(liveSecs / 60);
          elTimer.textContent = mins;
        }
      });
    }

    bindCardActivateOnce("home-goal-card", () => showGoalCustomizerModal(app));
    bindCardActivateOnce(
      "home-goal-eta",
      () => showForecastDetailModal(app),
      true,
    );

    bindClickOnce("btn-home-start-flashcard", () =>
      app.startStudySession(null, null, null, { mode: "due_first" }),
    );
    bindClickOnce("btn-home-start-new", () =>
      app.startStudySession(null, null, null, { mode: "new_only" }),
    );
    bindClickOnce("btn-home-start-reels", () => {
      navigator.vibrate?.(10);
      if (typeof app.startReelsSession === "function") {
        app.startReelsSession(null, { mode: "mixed" });
      }
    });
    bindClickOnce("btn-home-start-quiz", () => {
      navigator.vibrate?.(10);
      if (typeof app.startQuizSession === "function") {
        app.startQuizSession(null, { mode: "due_first" });
      }
    });

    bindClickOnce("btn-mode-weak-hunter", () =>
      app.startStudySession(null, null, null, { mode: "weak_hunter" }),
    );
    bindClickOnce("btn-mode-audio-blind", () =>
      app.startStudySession(null, null, null, {
        mode: "audio_blind",
        audioBlind: true,
      }),
    );
    bindClickOnce("btn-mode-sprint-10", () =>
      app.startStudySession(null, null, null, { mode: "sprint_10" }),
    );

    bindClickOnce("btn-home-custom-study", () => {
      navigator.vibrate?.(8);
      openCustomStudyModal(app);
    });
    bindClickOnce("btn-mode-custom-filter", () => {
      navigator.vibrate?.(8);
      openCustomStudyModal(app);
    });

    bindCardActivateOnce("metric-card-due", () => showDueWordsModal(app));
    bindCardActivateOnce("metric-card-reviewed", () =>
      showReviewedTodayModal(app),
    );
    bindCardActivateOnce("metric-card-time", () => showStudyTimeModal(app));
    bindCardActivateOnce("metric-card-mastered", () =>
      showMasteredTiersModal(app),
    );
    bindCardActivateOnce("home-attention-card", () =>
      showAttentionCardsModal(app),
    );

    updateHomeStatsRealtime(app);
  } catch (err) {
    console.error("Lỗi khi render Review Tab:", err);
  }
}

if (typeof window !== "undefined") {
  window.updateHomeStatsRealtime = updateHomeStatsRealtime;
}
