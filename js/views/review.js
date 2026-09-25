import { StorageManager } from '../services/storage.js';
import { State, isCardDue } from '../core/fsrs.js';
import { StatsManager } from '../core/stats.js';
import { getLocalDateKey, escapeHTML } from '../utils.js';
import { showToast } from './components.js';
import { speak, speakVi, stopAudio } from '../services/audio.js';

let _cachedApp = null;
let _lazyAudioState = {
  active: false,
  words: [],
  currentIndex: 0,
  isPlaying: false,
  speed: 1.0,
  isLoop: true,
  timerId: null
};

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

        <!-- 2. Daily 3-Step Micro-Quests Bento Card (Nhiệm Vụ 3 Bước Nhỏ Mỗi Ngày) -->
        <div class="review-quests-card">
          <div class="quests-card-header">
            <div class="quests-header-left">
              <div class="quests-icon-badge">🏆</div>
              <div class="quests-title-wrap">
                <span class="quests-tag">3 BƯỚC NHỎ MỖI NGÀY</span>
                <h3 class="quests-main-title">Dễ dàng & Chắc chắn hoàn thành</h3>
              </div>
            </div>
            <span class="quests-progress-pill" id="review-quests-badge">0/3 bước</span>
          </div>

          <div class="quests-list" id="review-quests-list">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- 3. Comprehension Power Meter Bento Card (Thước Đo Tỷ Lệ Hiểu Tiếng Anh Thực Tế) -->
        <div class="review-comprehension-card">
          <div class="comprehension-header">
            <div class="comprehension-header-left">
              <div class="comprehension-icon-badge" id="comprehension-badge-icon">🌱</div>
              <div class="comprehension-title-wrap">
                <span class="comprehension-tag">NĂNG LỰC HIỂU THỰC TẾ (OXFORD 3000)</span>
                <h3 class="comprehension-rank-title" id="comprehension-rank-title">Mầm Non Ngôn Ngữ</h3>
              </div>
            </div>
            <div class="comprehension-score-badge">
              <span class="comprehension-pct" id="comprehension-pct-val">0%</span>
              <span class="comprehension-pct-sub">đọc hiểu</span>
            </div>
          </div>

          <div class="comprehension-bar-track">
            <div class="comprehension-bar-fill" id="comprehension-bar-fill" style="width: 0%;"></div>
          </div>

          <div class="comprehension-impact-box">
            <p class="comprehension-impact-desc" id="comprehension-impact-desc">Đang phân tích năng lực hiểu thực tế...</p>
          </div>

          <div class="comprehension-next-milestone" id="comprehension-next-row">
            <span class="milestone-icon">🎯</span>
            <span class="milestone-text" id="comprehension-next-text">Mục tiêu tiếp theo: Chạm mốc 50 từ</span>
          </div>
        </div>

        <!-- 4. Lazy Hands-free Audio Walk Shortcut -->
        <div class="review-lazy-walk-card">
          <div class="lazy-walk-left">
            <div class="lazy-walk-icon">🎧</div>
            <div class="lazy-walk-text">
              <span class="lazy-walk-title">Học Lười Rảnh Tay</span>
              <span class="lazy-walk-desc">Tự động phát âm & dịch nghĩa khi đi bộ, lái xe, làm việc nhà</span>
            </div>
          </div>
          <button type="button" class="btn-lazy-walk-trigger" id="btn-trigger-lazy-walk" title="Bắt đầu nghe thụ động rảnh tay">
            <span>Bật Nghe</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        </div>

        <!-- 5. Bệnh Án Từ Vựng: Cấp Cứu Từ Hay Quên (Weak Words Drill) -->
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

        <!-- 6. Fast Navigation Shortcuts Row -->
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

      <!-- Lazy Audio Walk Floating Player Modal -->
      <div id="lazy-audio-modal" class="lazy-audio-modal" style="display: none;">
        <div class="lazy-audio-card">
          <div class="lazy-modal-header">
            <div class="lazy-modal-tag">
              <span class="lazy-pulse-dot"></span>
              <span>🎧 ĐANG PHÁT RẢNH TAY</span>
            </div>
            <button type="button" class="btn-lazy-close" id="btn-lazy-close" title="Đóng trình phát">✕</button>
          </div>

          <div class="lazy-word-display">
            <div class="lazy-word-counter" id="lazy-word-counter">Từ 1 / 10</div>
            <h2 class="lazy-word-text" id="lazy-word-text">Vocabulary</h2>
            <div class="lazy-word-phonetic" id="lazy-word-phonetic">/vəˈkæbjələri/</div>
            <div class="lazy-word-meaning" id="lazy-word-meaning">Từ vựng</div>
            <div class="lazy-word-badges">
              <span class="lazy-badge-cefr" id="lazy-badge-cefr">A1</span>
              <span class="lazy-badge-cat" id="lazy-badge-cat">Giao tiếp</span>
            </div>
          </div>

          <div class="lazy-controls-row">
            <button type="button" class="btn-lazy-ctrl" id="btn-lazy-prev" title="Từ trước">⏮️</button>
            <button type="button" class="btn-lazy-ctrl btn-lazy-play" id="btn-lazy-play-toggle" title="Tạm dừng / Tiếp tục">⏸️</button>
            <button type="button" class="btn-lazy-ctrl" id="btn-lazy-next" title="Từ tiếp theo">⏭️</button>
            <button type="button" class="btn-lazy-ctrl btn-lazy-speed" id="btn-lazy-speed" title="Tốc độ đọc">1.0x</button>
            <button type="button" class="btn-lazy-ctrl btn-lazy-loop active" id="btn-lazy-loop" title="Lặp lại danh sách">🔁</button>
          </div>
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
          elBacklogDesc.textContent = `Hàng đợi có ${queueDue} từ cần ôn. Đã tạm hoãn nạp từ mới để bạn tập trung dọn sạch hàng đợi!`;
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

    // E. Render 3 Nhiệm Vụ 3 Bước Nhỏ (Daily 3-Step Micro-Quests)
    const microQuestsData = StatsManager.getDailyMicroQuests(allLogs, studyQueue, dailyGoal);
    const elQuestsBadge = document.getElementById('review-quests-badge');
    if (elQuestsBadge) {
      elQuestsBadge.textContent = `${microQuestsData.completedCount}/3 bước`;
      if (microQuestsData.isAllCompleted) {
        elQuestsBadge.classList.add('all-done');
      } else {
        elQuestsBadge.classList.remove('all-done');
      }
    }

    const elQuestsList = document.getElementById('review-quests-list');
    if (elQuestsList) {
      elQuestsList.innerHTML = microQuestsData.quests.map((q, idx) => {
        let actionBtnHtml = '';
        if (q.done) {
          actionBtnHtml = `<span class="quest-done-tag">✓ Đạt</span>`;
        } else if (q.id === 'warmup') {
          actionBtnHtml = `<button type="button" class="btn-quest-action btn-quest-warmup" data-quest="warmup">Ôn ngay</button>`;
        } else if (q.id === 'learn') {
          actionBtnHtml = `<button type="button" class="btn-quest-action btn-quest-learn" data-quest="learn">Nạp ngay</button>`;
        } else if (q.id === 'quiz') {
          actionBtnHtml = `<button type="button" class="btn-quest-action btn-quest-quiz" data-quest="quiz">Làm Quiz</button>`;
        }

        return `
          <div class="quest-step-item ${q.done ? 'is-done' : ''}">
            <div class="quest-step-icon">${q.icon}</div>
            <div class="quest-step-info">
              <div class="quest-step-title-row">
                <span class="quest-step-name">${escapeHTML(q.title)}</span>
                <span class="quest-step-progress">${escapeHTML(q.progressText)}</span>
              </div>
              <span class="quest-step-sub">${escapeHTML(q.sub)}</span>
            </div>
            <div class="quest-step-action-wrap">
              ${actionBtnHtml}
            </div>
          </div>
        `;
      }).join('');

      // Gán sự kiện click cho các nút hành động của từng nhiệm vụ nhỏ
      elQuestsList.querySelectorAll('.btn-quest-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const qType = btn.dataset.quest;
          if (qType === 'warmup') {
            app.startStudySession(null, null, null, { mode: 'due_only' });
          } else if (qType === 'learn') {
            app.startStudySession(null, null, null, { mode: 'new_only' });
          } else if (qType === 'quiz') {
            app.startQuizSession();
          }
        });
      });
    }

    // F. Render Thước Đo Tỷ Lệ Hiểu Tiếng Anh Thực Tế (Comprehension Power Meter)
    const comprehension = StatsManager.getComprehensionPower(learnedCount);
    const elCompIcon = document.getElementById('comprehension-badge-icon');
    if (elCompIcon) elCompIcon.textContent = comprehension.badgeIcon;

    const elCompRank = document.getElementById('comprehension-rank-title');
    if (elCompRank) elCompRank.textContent = `${comprehension.rankTitle} (${comprehension.count} từ)`;

    const elCompPct = document.getElementById('comprehension-pct-val');
    if (elCompPct) elCompPct.textContent = `${comprehension.percent}%`;

    const elCompFill = document.getElementById('comprehension-bar-fill');
    if (elCompFill) elCompFill.style.width = `${comprehension.percent}%`;

    const elCompDesc = document.getElementById('comprehension-impact-desc');
    if (elCompDesc) elCompDesc.textContent = comprehension.impactDesc;

    const elCompNext = document.getElementById('comprehension-next-text');
    if (elCompNext) {
      if (comprehension.wordsNeededForNext > 0) {
        elCompNext.textContent = `Mục tiêu tiếp theo: Chạm mốc ${comprehension.nextMilestone} từ (còn ${comprehension.wordsNeededForNext} từ)`;
      } else {
        elCompNext.textContent = `Đã chinh phục trọn vẹn toàn bộ 2.582 từ vựng Oxford Pro! 👑`;
      }
    }

    // G. Bệnh Án Từ Vựng (Weak Word Drill)
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

    // H. CTA Nổi Bật: Twin Buttons (Luôn hiển thị đầy đủ cả 2 chế độ 3D & Trắc nghiệm)
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

    // I. Lazy Audio Walk Trigger & Controller
    const btnTriggerLazy = document.getElementById('btn-trigger-lazy-walk');
    if (btnTriggerLazy) {
      btnTriggerLazy.onclick = () => {
        let walkCards = [];
        if (studyQueue.dueCards && studyQueue.dueCards.length > 0) {
          walkCards = studyQueue.dueCards;
        } else if (studyQueue.newCards && studyQueue.newCards.length > 0) {
          walkCards = studyQueue.newCards;
        } else {
          walkCards = allCards.slice(0, 20);
        }

        if (!walkCards || walkCards.length === 0) {
          showToast('Chưa có từ vựng khả dụng để nghe', 'info');
          return;
        }

        startLazyAudioWalk(walkCards, app);
      };
    }

    // J. Gán sự kiện cho các nút điều hướng nhanh
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

/**
 * Lazy Hands-free Audio Walk Implementation
 */
function startLazyAudioWalk(cards = [], app = null) {
  _lazyAudioState.words = cards;
  _lazyAudioState.currentIndex = 0;
  _lazyAudioState.active = true;
  _lazyAudioState.isPlaying = true;
  _lazyAudioState.speed = Number(app?.settings?.speechRate) || 1.0;

  const modal = document.getElementById('lazy-audio-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  setupLazyModalEvents(app);
  playLazyWordStep();
}

function setupLazyModalEvents(app) {
  const btnClose = document.getElementById('btn-lazy-close');
  if (btnClose) {
    btnClose.onclick = () => stopLazyAudioWalk();
  }

  const btnPlay = document.getElementById('btn-lazy-play-toggle');
  if (btnPlay) {
    btnPlay.onclick = () => {
      if (_lazyAudioState.isPlaying) {
        _lazyAudioState.isPlaying = false;
        btnPlay.textContent = '▶️';
        if (_lazyAudioState.timerId) clearTimeout(_lazyAudioState.timerId);
        stopAudio();
      } else {
        _lazyAudioState.isPlaying = true;
        btnPlay.textContent = '⏸️';
        playLazyWordStep();
      }
    };
  }

  const btnNext = document.getElementById('btn-lazy-next');
  if (btnNext) {
    btnNext.onclick = () => {
      if (_lazyAudioState.timerId) clearTimeout(_lazyAudioState.timerId);
      stopAudio();
      _lazyAudioState.currentIndex = (_lazyAudioState.currentIndex + 1) % _lazyAudioState.words.length;
      playLazyWordStep();
    };
  }

  const btnPrev = document.getElementById('btn-lazy-prev');
  if (btnPrev) {
    btnPrev.onclick = () => {
      if (_lazyAudioState.timerId) clearTimeout(_lazyAudioState.timerId);
      stopAudio();
      _lazyAudioState.currentIndex = (_lazyAudioState.currentIndex - 1 + _lazyAudioState.words.length) % _lazyAudioState.words.length;
      playLazyWordStep();
    };
  }

  const btnSpeed = document.getElementById('btn-lazy-speed');
  if (btnSpeed) {
    btnSpeed.onclick = () => {
      if (_lazyAudioState.speed === 1.0) _lazyAudioState.speed = 0.8;
      else if (_lazyAudioState.speed === 0.8) _lazyAudioState.speed = 1.2;
      else _lazyAudioState.speed = 1.0;
      btnSpeed.textContent = `${_lazyAudioState.speed}x`;
    };
  }

  const btnLoop = document.getElementById('btn-lazy-loop');
  if (btnLoop) {
    btnLoop.onclick = () => {
      _lazyAudioState.isLoop = !_lazyAudioState.isLoop;
      if (_lazyAudioState.isLoop) {
        btnLoop.classList.add('active');
      } else {
        btnLoop.classList.remove('active');
      }
    };
  }
}

function playLazyWordStep() {
  if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;

  const wordObj = _lazyAudioState.words[_lazyAudioState.currentIndex];
  if (!wordObj) {
    stopLazyAudioWalk();
    return;
  }

  // Update UI
  const elCounter = document.getElementById('lazy-word-counter');
  if (elCounter) elCounter.textContent = `Từ ${_lazyAudioState.currentIndex + 1} / ${_lazyAudioState.words.length}`;

  const elWord = document.getElementById('lazy-word-text');
  if (elWord) elWord.textContent = wordObj.word || '';

  const elPhonetic = document.getElementById('lazy-word-phonetic');
  if (elPhonetic) elPhonetic.textContent = wordObj.phonetic || '';

  const elMeaning = document.getElementById('lazy-word-meaning');
  if (elMeaning) elMeaning.textContent = wordObj.meaning || '';

  const elCefr = document.getElementById('lazy-badge-cefr');
  if (elCefr) elCefr.textContent = (wordObj.level || 'A1').toUpperCase();

  const elCat = document.getElementById('lazy-badge-cat');
  if (elCat) elCat.textContent = wordObj.category || 'Từ vựng';

  const btnPlay = document.getElementById('btn-lazy-play-toggle');
  if (btnPlay) btnPlay.textContent = '⏸️';

  // Step 1: Speak English
  speak(wordObj.word, {
    speechRate: _lazyAudioState.speed,
    cardObj: wordObj,
    onEnd: () => {
      if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
      // Delay 700ms then speak Vietnamese translation
      _lazyAudioState.timerId = setTimeout(() => {
        if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
        speakVi(wordObj.meaning, () => {
          if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
          // Delay 1200ms then advance to next word
          _lazyAudioState.timerId = setTimeout(() => {
            if (!_lazyAudioState.active || !_lazyAudioState.isPlaying) return;
            if (_lazyAudioState.currentIndex + 1 < _lazyAudioState.words.length) {
              _lazyAudioState.currentIndex++;
              playLazyWordStep();
            } else if (_lazyAudioState.isLoop) {
              _lazyAudioState.currentIndex = 0;
              playLazyWordStep();
            } else {
              showToast('Đã nghe hết danh sách từ vựng 🎉', 'success');
              stopLazyAudioWalk();
            }
          }, 1200);
        });
      }, 700);
    }
  });
}

function stopLazyAudioWalk() {
  _lazyAudioState.active = false;
  _lazyAudioState.isPlaying = false;
  if (_lazyAudioState.timerId) clearTimeout(_lazyAudioState.timerId);
  stopAudio();

  const modal = document.getElementById('lazy-audio-modal');
  if (modal) modal.style.display = 'none';
}
