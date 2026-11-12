/**
 * Settings Profile Card & CEFR Roadmap Progress Controller
 */

import { StorageManager } from '../../services/storage.js';
import { StatsManager } from '../../core/stats.js';
import { showToast, showStreakHubModal } from '../components.js';
import { showGoalCustomizerModal, showForecastDetailModal } from '../modals/goal-modal.js';

const AVATAR_EMOJIS = ['🎓', '🦁', '🦉', '⚡', '🚀', '💎', '🐉', '🎯', '🌟', '👑', '🔥', '🏆', '🦊', '🐺', '🐯', '🧠'];

/**
 * Gắn sự kiện & cập nhật Hồ sơ người dùng cùng Lộ trình CEFR trong Tab Cài Đặt
 */
export function bindSettingsProfileAndRoadmap(app) {
  const savedName = localStorage.getItem('fc_pro_user_name') || 'Học Viên Flashcard Pro';
  const savedAvatar = localStorage.getItem('fc_pro_user_avatar') || '🎓';

  const nameEl = document.getElementById('settings-username-display');
  if (nameEl) nameEl.textContent = savedName;

  const avatarEl = document.getElementById('settings-avatar-emoji');
  if (avatarEl) avatarEl.textContent = savedAvatar;

  const btnEditName = document.getElementById('btn-settings-edit-name');
  if (btnEditName && !btnEditName._bound) {
    btnEditName._bound = true;
    btnEditName.onclick = () => {
      const newName = prompt('Nhập tên hiển thị của bạn:', nameEl ? nameEl.textContent : 'Học Viên');
      if (newName && newName.trim()) {
        const clean = newName.trim().slice(0, 30);
        localStorage.setItem('fc_pro_user_name', clean);
        if (nameEl) nameEl.textContent = clean;
        showToast(`Đã cập nhật tên: ${clean}`, 'success');
      }
    };
  }

  const avatarBtn = document.getElementById('settings-avatar-btn');
  if (avatarBtn && !avatarBtn._bound) {
    avatarBtn._bound = true;
    avatarBtn.onclick = () => {
      const choice = prompt(
        `Chọn Avatar của bạn (nhập số hoặc copy emoji):\n${AVATAR_EMOJIS.map((e, i) => `${i + 1}. ${e}`).join('  ')}`,
        '1'
      );
      if (choice !== null) {
        const num = parseInt(choice, 10);
        let selected = '';
        if (!isNaN(num) && num >= 1 && num <= AVATAR_EMOJIS.length) {
          selected = AVATAR_EMOJIS[num - 1];
        } else if (AVATAR_EMOJIS.includes(choice.trim())) {
          selected = choice.trim();
        }
        if (selected) {
          localStorage.setItem('fc_pro_user_avatar', selected);
          if (avatarEl) avatarEl.textContent = selected;
          showToast(`Đã đổi Avatar: ${selected}`, 'success');
        }
      }
    };
  }

  try {
    const allCards = app.deckManager ? app.deckManager.getAllCards() : [];
    const memIntel = StatsManager.getMemoryIntelligence(allCards);
    const logs = StorageManager.getStudyLogs();
    const streak = StatsManager.calculateStreak(logs);

    const rankPill = document.getElementById('settings-rank-pill');
    if (rankPill && memIntel && memIntel.rank) {
      rankPill.textContent = `${memIntel.rank.title} (${memIntel.rank.badge})`;
      rankPill.style.background = `${memIntel.rank.color}18`;
      rankPill.style.color = memIntel.rank.color;
    }

    const streakPill = document.getElementById('settings-streak-pill');
    if (streakPill) {
      streakPill.textContent = `🔥 ${streak} ngày học`;
      streakPill.style.cursor = 'pointer';
      streakPill.title = 'Nhấn để mở Hồ sơ Streak & Khiên bảo vệ';
      if (!streakPill._bound) {
        streakPill._bound = true;
        streakPill.onclick = () => showStreakHubModal(app);
      }
    }

    const cefrData = StatsManager.getCefrRoadmapAndForecast(allCards, app.settings || {});
    const { levels, currentLevel, goal, forecast } = cefrData;

    const cardGoal = document.getElementById('home-goal-card');
    if (cardGoal && !cardGoal._boundSettings) {
      cardGoal._boundSettings = true;
      cardGoal.onclick = () => showGoalCustomizerModal(app);
      cardGoal.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showGoalCustomizerModal(app);
        }
      };
    }

    const badgeEta = document.getElementById('home-goal-eta');
    if (badgeEta && !badgeEta._boundSettings) {
      badgeEta._boundSettings = true;
      badgeEta.onclick = (e) => {
        e.stopPropagation();
        showForecastDetailModal(app);
      };
      badgeEta.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          showForecastDetailModal(app);
        }
      };
    }

    const elGoalIcon = document.getElementById('home-goal-icon');
    if (elGoalIcon) elGoalIcon.textContent = goal.icon || '🎯';

    const elGoalTitle = document.getElementById('home-goal-title');
    if (elGoalTitle) elGoalTitle.textContent = currentLevel.fullTitle || `Trình Độ ${currentLevel.id} (${currentLevel.name})`;

    const elTargetTag = document.getElementById('home-target-tag');
    if (elTargetTag) elTargetTag.textContent = `Mục tiêu: ${goal.shortTitle || goal.title} ❯`;

    const elCurBadge = document.getElementById('home-current-level-badge');
    if (elCurBadge) {
      elCurBadge.textContent = `${currentLevel.id} (${currentLevel.progressPct}%)`;
      elCurBadge.style.borderColor = `${currentLevel.color}40`;
      elCurBadge.style.color = currentLevel.color;
      elCurBadge.style.background = `${currentLevel.color}15`;
    }

    ['A1', 'A2', 'B1', 'B2', 'C1'].forEach((tierId) => {
      const dot = document.getElementById(`dot-${tierId}`);
      if (!dot) return;
      const tier = levels[tierId];
      const tierPct = tier && tier.total > 0 ? (tier.learned / tier.total) : 0;
      dot.className = 'cefr-step-dot';
      if (tierPct >= 0.9) {
        dot.classList.add('completed');
        dot.innerHTML = '✓';
      } else if (tierId === currentLevel.id) {
        dot.classList.add('active');
        dot.innerHTML = tierId;
      } else if (tierPct > 0) {
        dot.classList.add('in-progress');
        dot.innerHTML = tierId;
      } else {
        dot.innerHTML = tierId;
      }
    });

    const updateLineFill = (lineId, fromTierId) => {
      const elLine = document.getElementById(lineId);
      if (elLine) {
        const fromTier = levels[fromTierId];
        const fromPct = fromTier && fromTier.total > 0 ? (fromTier.learned / fromTier.total) : 0;
        elLine.style.width = `${Math.min(100, Math.round(fromPct * 100))}%`;
      }
    };
    updateLineFill('fill-A1-A2', 'A1');
    updateLineFill('fill-A2-B1', 'A2');
    updateLineFill('fill-B1-B2', 'B1');
    updateLineFill('fill-B2-C1', 'B2');

    const elGoalWords = document.getElementById('home-goal-progress-words');
    if (elGoalWords) elGoalWords.textContent = `${goal.learnedWords} / ${goal.targetWords} từ`;

    const elGoalPct = document.getElementById('home-goal-percent');
    if (elGoalPct) elGoalPct.textContent = `${goal.completionPct}%`;

    const elGoalFill = document.getElementById('home-goal-progress-fill');
    if (elGoalFill) elGoalFill.style.width = `${goal.completionPct}%`;

    const dailyNewTarget = Number(app.settings?.activeGoal?.dailyNew) || Number(app.settings?.dailyNewLimit) || 10;
    const todayLogs = logs.filter(l => l.timestamp && new Date(l.timestamp).toDateString() === new Date().toDateString());
    const todayNewCount = new Set(todayLogs.filter(l => l.oldState === 0 || l.isNew).map(l => l.cardId)).size;

    const elTodayNew = document.getElementById('home-goal-today-new');
    if (elTodayNew) elTodayNew.textContent = `${todayNewCount}/${dailyNewTarget} từ`;

    const elGoalEta = document.getElementById('home-goal-eta-text');
    const elGoalEtaWrapper = document.getElementById('home-goal-eta-wrapper');
    if (elGoalEta) {
      if (goal.unmasteredWords === 0) {
        elGoalEta.textContent = `✓ Thuộc ${forecast.shortGoalTitle}`;
        if (elGoalEtaWrapper) elGoalEtaWrapper.innerHTML = `<strong style="color: #10b981;">✓ Thuộc ${forecast.shortGoalTitle} (100%)</strong>`;
      } else {
        elGoalEta.textContent = `~${forecast.etaDays} ngày`;
        if (elGoalEtaWrapper) elGoalEtaWrapper.innerHTML = `<span>Đạt <strong>${forecast.shortGoalTitle}</strong>: <strong>~${forecast.etaDays} ngày</strong></span>`;
      }
    }

    const elEtaIcon = document.getElementById('home-goal-eta-icon');
    if (elEtaIcon) elEtaIcon.textContent = forecast.isUsingRealBehavior ? '⚡' : '🏁';
  } catch (e) {
    console.warn('Lỗi cập nhật CEFR trong Settings:', e);
  }
}

