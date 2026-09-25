/**
 * Review View - Clean, High-Value Daily Review Center with Deep Personalization
 * 1. Header: Trạng thái, Chuỗi ngày học & Khung giờ vàng nhận thức
 * 2. Nhiệm vụ hôm nay: 4 chỉ số cốt lõi (Cần ôn tập, Đã học hôm nay, Thời gian học, Từ đã thuộc)
 * 3. Chế độ Chống Quá Tải Nhận Thức (Adaptive Backlog Protection)
 * 4. Bệnh Án Từ Vựng (Weak Word Drill - Luyện tập cấp cứu từ hay quên)
 * 5. Cụm nút hành động Twin Action: Ôn/Học Thẻ 3D & Trắc Nghiệm FSRS Smart Quiz
 * 6. Lối tắt nhanh: Duyệt 16 Chủ đề & Phân tích FSRS-6
 */

import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { StatsManager } from '../core/stats.js';
import { getLocalDateKey } from '../utils.js';
import { showToast } from './components.js';

let _cachedApp = null;

export function renderReviewShell(container) {
  if (!container) return;
  if (!container.querySelector('.review-bento-container')) {
    container.innerHTML = `
      <div class="review-bento-container">
        
        <!-- Adaptive Backlog Protection Alert Banner -->
        <div id="review-backlog-alert" class="review-backlog-alert" style="display: none;">
          <span class="alert-icon">🛡️</span>
          <div class="alert-text-wrap">
            <span class="alert-title">Chế Độ Chống Quá Tải Nhận Thức</span>
            <span class="alert-desc" id="review-backlog-desc">Hàng đợi ôn tập đang cao. Hệ thống tạm hoãn nạp từ mới để ưu tiên dọn sạch hàng đợi!</span>
          </div>
        </div>

        <!-- 1. Hero Card: Nhiệm Vụ Hôm Nay (Unified Bento Design) -->
        <div class="review-hero-card">
          <!-- Top Row Header -->
          <div class="review-card-header">
            <div class="review-card-header-left">
              <div class="review-hero-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <div class="review-hero-titles">
                <div class="review-hero-pill-tag">NHIỆM VỤ HÔM NAY</div>
                <h2 class="review-hero-main-title" id="home-today-status">Kế hoạch ôn tập & học từ vựng</h2>
              </div>
            </div>

            <div class="review-header-badges-wrap">
              <span class="pill-review-streak" id="home-header-streak">🔥 0 ngày</span>
              <span class="pill-review-goal" id="home-goal-pct">0%</span>
            </div>
          </div>

          <!-- Goal Progress Track -->
          <div class="review-goal-track">
            <div class="review-goal-fill" id="home-goal-progress-fill" style="width: 0%;"></div>
          </div>

          <!-- 4 Bento Metrics Grid (2x2) -->
          <div class="hero-quad-grid">
            <!-- Card 1: Cần ôn ngay -->
            <div class="quad-tile tile-due" id="box-home-due">
              <div class="quad-tile-top">
                <span class="quad-icon-badge">📥</span>
                <span class="quad-label">CẦN ÔN TẬP</span>
              </div>
              <div class="quad-num-wrap">
                <span class="quad-number" id="home-due-val">0</span>
                <span class="quad-unit">từ</span>
              </div>
              <span class="quad-sub-hint" id="home-due-hint">Ưu tiên ôn trước</span>
            </div>

            <!-- Card 2: Đã học hôm nay -->
            <div class="quad-tile tile-new" id="box-home-new">
              <div class="quad-tile-top">
                <span class="quad-icon-badge">✨</span>
                <span class="quad-label">ĐÃ HỌC HÔM NAY</span>
              </div>
              <div class="quad-num-wrap">
                <span class="quad-number" id="home-new-today-val">0/10</span>
                <span class="quad-unit">từ</span>
              </div>
              <span class="quad-sub-hint" id="home-goal-hint">Chỉ tiêu: 10 từ</span>
            </div>

            <!-- Card 3: Thời gian học -->
            <div class="quad-tile tile-time" id="box-home-time">
              <div class="quad-tile-top">
                <span class="quad-icon-badge">⏱️</span>
                <span class="quad-label">THỜI GIAN HỌC</span>
              </div>
              <div class="quad-num-wrap">
                <span class="quad-number" id="home-study-timer">0p</span>
              </div>
              <span class="quad-sub-hint">Tập trung hôm nay</span>
            </div>

            <!-- Card 4: Từ đã thuộc (Tầng 4 & 5 FSRS) -->
            <div class="quad-tile tile-retention" id="box-home-retention">
              <div class="quad-tile-top">
                <span class="quad-icon-badge">💎</span>
                <span class="quad-label">TỪ ĐÃ THUỘC</span>
              </div>
              <div class="quad-num-wrap">
                <span class="quad-number" id="home-retention-rate">0</span>
                <span class="quad-unit">từ</span>
              </div>
              <span class="quad-sub-hint" id="home-retention-hint">Tầng 4 & 5 FSRS</span>
            </div>
          </div>

          <!-- Dual Action Launchpad (Twin CTA Buttons) -->
          <div class="hero-action-container">
            <div class="hero-twin-cta-row" id="home-twin-cta-row">
              <button class="btn-hero-twin-study" id="btn-home-hero-cta" type="button" title="Học & Ôn bằng thẻ Flashcard 3D">
                <svg class="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span id="home-hero-cta-text">Ôn thẻ 3D</span>
              </button>

              <button class="btn-hero-twin-quiz" id="btn-home-quiz-cta" type="button" title="Học & Ôn bằng trắc nghiệm phản xạ FSRS">
                <span>⚡</span>
                <span id="home-quiz-cta-text">Trắc nghiệm FSRS</span>
              </button>
            </div>

            <div class="hero-meta-hint">
              <span id="home-estimated-time">⏱️ Khoảng 0 phút</span>
              <span class="hint-sep">•</span>
              <span id="home-streak-hint">Học hôm nay để giữ chuỗi 🔥</span>
            </div>
          </div>
        </div>

        <!-- 2. Bệnh Án Từ Vựng: Cấp Cứu Từ Hay Quên (Weak Words Drill) -->
        <div id="review-weak-words-box" class="review-weak-card" style="display: none;">
          <div class="weak-card-header">
            <div class="weak-header-left">
              <div class="weak-icon-badge">🩺</div>
              <div class="weak-title-wrap">
                <span class="weak-tag">BỆNH ÁN TỪ VỰNG</span>
                <h3 class="weak-main-title" id="weak-words-title">Có 0 từ hay quên cần củng cố</h3>
              </div>
            </div>
            <span class="weak-count-pill" id="weak-words-count-badge">0 từ</span>
          </div>

          <div class="weak-actions-row">
            <button type="button" class="btn-weak-action btn-weak-3d" id="btn-weak-drill-3d">
              <span>🎴 Cấp cứu Thẻ 3D</span>
            </button>
            <button type="button" class="btn-weak-action btn-weak-quiz" id="btn-weak-drill-quiz">
              <span>⚡ Trắc nghiệm Cấp Tốc</span>
            </button>
          </div>
        </div>

        <!-- 3. Fast Navigation Shortcuts Row -->
        <div class="review-shortcuts-grid">
          <button type="button" class="btn-review-shortcut" id="btn-shortcut-decks">
            <div class="shortcut-icon-badge icon-decks">📚</div>
            <div class="shortcut-text-wrap">
              <span class="shortcut-title">16 Chủ Đề Từ Vựng</span>
              <span class="shortcut-desc">Duyệt theo lộ trình & chặng học</span>
            </div>
            <svg class="shortcut-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button type="button" class="btn-review-shortcut" id="btn-shortcut-stats">
            <div class="shortcut-icon-badge icon-stats">📊</div>
            <div class="shortcut-text-wrap">
              <span class="shortcut-title">Thống Kê & Báo Cáo</span>
              <span class="shortcut-desc">Dự báo 7 ngày & Lịch học tập</span>
            </div>
            <svg class="shortcut-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

      </div>
    `;
  }
}

export function renderReviewTab(app) {
  try {
    _cachedApp = app;
    const container = document.getElementById('tab-review') || document.getElementById('tab-home');
    if (!container) return;
    renderReviewShell(container);

    const allCards = app.deckManager.getAllCards();
    const now = new Date();

    // 1. Phân loại từ vựng & Cấp độ thành tựu FSRS
    let learnedCount = 0;
    let masteredCount = 0; // Tầng 4 & 5 (Stability >= 14 ngày) VÀ CHƯA ĐẾN HẠN ÔN (!isDue)
    let dueCount = 0;

    for (const card of allCards) {
      const state = StorageManager.getCardState(card.id);
      if (state && state.state !== State.New && state.state !== 0 && !state.suspended) {
        learnedCount++;
        const isDue = isCardDue(state, now);
        if (isDue) {
          dueCount++;
        }
        const s = Number(state.stability) || 0;
        if (s >= 14 && !isDue) {
          masteredCount++;
        }
      }
    }

    // Cập nhật Timer & Từ Đã Thuộc
    const elTimer = document.getElementById('home-study-timer');
    if (elTimer) {
      const todaySecs = StorageManager.getTodayStudySeconds();
      if (todaySecs < 60) {
        elTimer.textContent = todaySecs > 0 ? `${todaySecs}s` : `0p`;
      } else {
        elTimer.textContent = `${Math.round(todaySecs / 60)}p`;
      }
    }

    const elRetention = document.getElementById('home-retention-rate');
    if (elRetention) {
      elRetention.textContent = masteredCount;
    }

    const elRetentionHint = document.getElementById('home-retention-hint');
    if (elRetentionHint) {
      if (masteredCount > 0) {
        elRetentionHint.textContent = 'Tầng 4 & 5 • Bền vững 🛡️';
      } else {
        elRetentionHint.textContent = 'Độ bền ≥ 14 ngày';
      }
    }

    // 2. Mục tiêu hôm nay & Nhật ký học
    const dailyGoal = Number(app.settings?.dailyNewLimit) || 10;
    const studyQueue = app.deckManager.getStudyQueue(null, app.settings);
    const queueDue = studyQueue.totalDue !== undefined ? studyQueue.totalDue : dueCount;
    const queueNew = studyQueue.totalNew !== undefined ? studyQueue.totalNew : 0;

    const allLogs = StorageManager.getStudyLogs();
    const todayLogs = allLogs.filter(l => 
      l.timestamp && getLocalDateKey(l.timestamp) === getLocalDateKey()
    );
    const todayNewLearned = todayLogs.filter(l => 
      l.oldState === State.New || l.oldState === 0 || (l.oldState === undefined && (l.state === State.New || l.state === 0 || l.isNew))
    ).length;
    const remainingGoal = Math.max(0, dailyGoal - todayNewLearned);
    const goalPct = Math.min(100, Math.round((todayNewLearned / dailyGoal) * 100));

    // A. Chế độ Chống Quá Tải Nhận Thức (Adaptive Backlog Protection)
    const elBacklogAlert = document.getElementById('review-backlog-alert');
    const elBacklogDesc = document.getElementById('review-backlog-desc');
    if (elBacklogAlert) {
      if (studyQueue.isBacklogProtected && queueDue >= 25) {
        elBacklogAlert.style.display = 'flex';
        if (elBacklogDesc) {
          elBacklogDesc.textContent = `Hàng đợi có ${queueDue} từ cần ôn. Đã tạm hoãn nạp từ mới để bạn tập trung dọn sạch ôn tập!`;
        }
      } else {
        elBacklogAlert.style.display = 'none';
      }
    }

    // B. Trạng thái hôm nay
    const elTodayStatus = document.getElementById('home-today-status');
    if (elTodayStatus) {
      if (queueDue > 0) {
        elTodayStatus.textContent = `Có ${queueDue} từ cần ôn tập đến hạn`;
      } else if (todayNewLearned >= dailyGoal) {
        elTodayStatus.textContent = 'Đã hoàn thành chỉ tiêu hôm nay ✓';
      } else {
        elTodayStatus.textContent = `Còn ${remainingGoal} từ mới để đạt chỉ tiêu hôm nay`;
      }
    }

    // C. Chuỗi ngày học & Khung giờ vàng nhận thức
    const streak = StatsManager.calculateStreak(allLogs);
    const primeHour = StatsManager.getPrimeStudyHour(allLogs);

    const elHeaderStreak = document.getElementById('home-header-streak');
    if (elHeaderStreak) {
      elHeaderStreak.textContent = `🔥 ${streak} ngày`;
    }

    const elGoalPct = document.getElementById('home-goal-pct');
    if (elGoalPct) {
      elGoalPct.textContent = `${goalPct}%`;
    }

    const elGoalFill = document.getElementById('home-goal-progress-fill');
    if (elGoalFill) {
      elGoalFill.style.width = `${goalPct}%`;
    }

    const elStreakHint = document.getElementById('home-streak-hint');
    if (elStreakHint) {
      if (primeHour && primeHour.text) {
        elStreakHint.textContent = `⏱️ Giờ vàng: ${primeHour.text}`;
      } else if (todayLogs.length > 0) {
        elStreakHint.textContent = `Đã giữ chuỗi ${streak} ngày hôm nay! 🌟`;
      } else {
        elStreakHint.textContent = `Học hôm nay để giữ chuỗi ${streak} ngày 🔥`;
      }
    }

    // D. Từ cần ôn ngay & Đã học hôm nay
    const elDueVal = document.getElementById('home-due-val');
    if (elDueVal) elDueVal.textContent = queueDue;

    const elDueHint = document.getElementById('home-due-hint');
    if (elDueHint) {
      elDueHint.textContent = queueDue > 0 ? 'Ưu tiên ôn trước' : 'Đã sạch hàng đợi ✓';
    }

    const elNewVal = document.getElementById('home-new-today-val');
    if (elNewVal) elNewVal.textContent = `${todayNewLearned}/${dailyGoal}`;

    const elGoalHint = document.getElementById('home-goal-hint');
    if (elGoalHint) {
      if (todayNewLearned >= dailyGoal) {
        elGoalHint.textContent = `Đạt chỉ tiêu ngày ✓`;
      } else {
        elGoalHint.textContent = `Còn ${remainingGoal} từ nữa`;
      }
    }

    // E. Bệnh Án Từ Vựng (Weak Word Drill)
    const weakWords = typeof app.deckManager.getWeakWords === 'function' ? app.deckManager.getWeakWords(10) : [];
    const boxWeak = document.getElementById('review-weak-words-box');
    const elWeakTitle = document.getElementById('weak-words-title');
    const elWeakCount = document.getElementById('weak-words-count-badge');
    const btnWeak3D = document.getElementById('btn-weak-drill-3d');
    const btnWeakQuiz = document.getElementById('btn-weak-drill-quiz');

    if (boxWeak) {
      if (weakWords.length > 0) {
        boxWeak.style.display = 'flex';
        if (elWeakTitle) elWeakTitle.textContent = `Có ${weakWords.length} từ bạn hay quên cần củng cố`;
        if (elWeakCount) elWeakCount.textContent = `${weakWords.length} từ`;

        if (btnWeak3D) {
          btnWeak3D.onclick = () => {
            try {
              app.startStudySession(null, null, weakWords);
            } catch (err) {
              console.error('Lỗi phiên cấp cứu thẻ 3D:', err);
              showToast('Lỗi: ' + err.message, 'error');
            }
          };
        }

        if (btnWeakQuiz) {
          btnWeakQuiz.onclick = () => {
            try {
              app.startQuizSession(weakWords);
            } catch (err) {
              console.error('Lỗi phiên cấp cứu trắc nghiệm:', err);
              showToast('Lỗi: ' + err.message, 'error');
            }
          };
        }
      } else {
        boxWeak.style.display = 'none';
      }
    }

    // F. CTA Nổi Bật: Twin Buttons (Luôn hiển thị đầy đủ cả 2 chế độ 3D & Trắc nghiệm)
    const btnHeroCta = document.getElementById('btn-home-hero-cta');
    const elCtaText = document.getElementById('home-hero-cta-text');
    const btnQuizCta = document.getElementById('btn-home-quiz-cta');
    const elQuizText = document.getElementById('home-quiz-cta-text');
    const elEstTime = document.getElementById('home-estimated-time');

    if (btnHeroCta && btnQuizCta) {
      if (queueDue > 0) {
        // TRƯỜNG HỢP 1: Có từ cần ôn tập đến hạn
        if (elCtaText) elCtaText.textContent = `Ôn ${queueDue} từ (Thẻ 3D)`;
        if (elQuizText) elQuizText.textContent = `Trắc nghiệm (${queueDue} từ)`;

        const estMin = Math.max(1, Math.ceil(queueDue * 0.5));
        if (elEstTime) elEstTime.textContent = `⏱️ Khoảng ${estMin} phút ôn tập`;

        btnHeroCta.onclick = () => {
          try {
            app.startStudySession(null, null, null, { mode: 'due_only' });
          } catch (err) {
            console.error('Lỗi phiên ôn tập thẻ 3D:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };

        btnQuizCta.onclick = () => {
          try {
            app.startQuizSession(studyQueue.dueCards, { mode: 'due_only' });
          } catch (err) {
            console.error('Lỗi phiên trắc nghiệm:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      } else if (todayNewLearned < dailyGoal) {
        // TRƯỜNG HỢP 2: Đã sạch từ ôn, nạp từ mới để đạt chỉ tiêu
        const newBatchCount = Math.min(remainingGoal, queueNew > 0 ? queueNew : remainingGoal);
        if (elCtaText) elCtaText.textContent = `Học ${newBatchCount} từ mới (Thẻ 3D)`;
        if (elQuizText) elQuizText.textContent = `Trắc nghiệm (${newBatchCount} từ mới)`;

        const estMin = Math.max(1, Math.ceil(newBatchCount * 0.6));
        if (elEstTime) elEstTime.textContent = `⏱️ Khoảng ${estMin} phút nạp từ mới`;

        btnHeroCta.onclick = () => {
          try {
            app.startStudySession(null, null, null, { mode: 'new_only' });
          } catch (err) {
            console.error('Lỗi phiên học từ mới thẻ 3D:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };

        btnQuizCta.onclick = () => {
          try {
            app.startQuizSession(studyQueue.newCards, { mode: 'new_only' });
          } catch (err) {
            console.error('Lỗi phiên trắc nghiệm từ mới:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      } else {
        // TRƯỜNG HỢP 3: Đã đạt chỉ tiêu ngày, luyện tập thêm
        if (elCtaText) elCtaText.textContent = `Luyện tập thêm (Thẻ 3D)`;
        if (elQuizText) elQuizText.textContent = `Trắc nghiệm phản xạ`;

        if (elEstTime) elEstTime.textContent = `🎉 Đã hoàn thành chỉ tiêu ngày! Sẵn sàng luyện thêm`;

        btnHeroCta.onclick = () => {
          try {
            app.startStudySession();
          } catch (err) {
            console.error('Lỗi phiên học thẻ 3D:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };

        btnQuizCta.onclick = () => {
          try {
            app.startQuizSession();
          } catch (err) {
            console.error('Lỗi phiên trắc nghiệm:', err);
            showToast('Lỗi: ' + err.message, 'error');
          }
        };
      }
    }

    // G. Gán sự kiện cho các nút điều hướng nhanh
    const btnShortcutDecks = document.getElementById('btn-shortcut-decks');
    if (btnShortcutDecks) {
      btnShortcutDecks.onclick = () => app.switchTab('tab-decks');
    }

    const btnShortcutStats = document.getElementById('btn-shortcut-stats');
    if (btnShortcutStats) {
      btnShortcutStats.onclick = () => app.switchTab('tab-stats');
    }

  } catch (err) {
    console.error('Lỗi khi render Review Tab:', err);
  }
}
