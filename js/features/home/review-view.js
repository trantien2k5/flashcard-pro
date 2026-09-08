/**
 * Review View - Minimalist 5-Column Memory Chart & Smart CTA
 */

import { StorageManager } from '../../services/storage.js';
import { FSRS, State } from '../../core/learning/fsrs.js';
import { showToast } from '../../shared/feedback.js';

export function renderReviewTab(app) {
  try {
    const allCards = app.deckManager.getAllCards();
    const cardStates = StorageManager.getAllCardStates();

    // Lọc chỉ lấy các từ ĐÃ HỌC (đã từng review và có stability > 0)
    const learnedCards = allCards.filter(card => {
      const s = cardStates[card.id];
      return s && s.state !== State.New && s.state !== 0 && s.stability && s.stability > 0;
    });
    const totalLearned = learnedCards.length;

    // 5 mức độ trí nhớ theo Độ bền FSRS (Stability S & Chu kỳ ôn tập):
    const levels = [
      {
        id: 'lvl-1',
        tag: 'Mức 1',
        name: 'Mới học',
        interval: '< 3 ngày',
        desc: 'Độ bền trí nhớ dưới 3 ngày (giai đoạn khởi đầu)',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M12 18v4"/><path d="M12 2v3"/></svg>`,
        color: '#ef4444',
        gradient: 'linear-gradient(180deg, #f87171, #dc2626)',
        trackBg: 'rgba(239, 68, 68, 0.12)',
        emptyTrackBg: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        emptyBorderColor: 'rgba(239, 68, 68, 0.18)',
        emptyPill: 'linear-gradient(180deg, rgba(239, 68, 68, 0.45), rgba(239, 68, 68, 0.25))',
        badgeBg: 'rgba(239, 68, 68, 0.14)',
        glow: '0 4px 14px rgba(239, 68, 68, 0.4)',
        count: 0
      },
      {
        id: 'lvl-2',
        tag: 'Mức 2',
        name: 'Ngắn hạn',
        interval: '3 – 7 ngày',
        desc: 'Độ bền 3 đến 7 ngày (đang củng cố)',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/></svg>`,
        color: '#f97316',
        gradient: 'linear-gradient(180deg, #fb923c, #ea580c)',
        trackBg: 'rgba(249, 115, 22, 0.12)',
        emptyTrackBg: 'rgba(249, 115, 22, 0.05)',
        borderColor: 'rgba(249, 115, 22, 0.35)',
        emptyBorderColor: 'rgba(249, 115, 22, 0.18)',
        emptyPill: 'linear-gradient(180deg, rgba(249, 115, 22, 0.45), rgba(249, 115, 22, 0.25))',
        badgeBg: 'rgba(249, 115, 22, 0.14)',
        glow: '0 4px 14px rgba(249, 115, 22, 0.4)',
        count: 0
      },
      {
        id: 'lvl-3',
        tag: 'Mức 3',
        name: 'Trung hạn',
        interval: '1 – 2 tuần',
        desc: 'Độ bền 7 đến 14 ngày (trí nhớ ổn định)',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/></svg>`,
        color: '#f59e0b',
        gradient: 'linear-gradient(180deg, #fbbf24, #d97706)',
        trackBg: 'rgba(245, 158, 11, 0.12)',
        emptyTrackBg: 'rgba(245, 158, 11, 0.05)',
        borderColor: 'rgba(245, 158, 11, 0.35)',
        emptyBorderColor: 'rgba(245, 158, 11, 0.18)',
        emptyPill: 'linear-gradient(180deg, rgba(245, 158, 11, 0.45), rgba(245, 158, 11, 0.25))',
        badgeBg: 'rgba(245, 158, 11, 0.14)',
        glow: '0 4px 14px rgba(245, 158, 11, 0.4)',
        count: 0
      },
      {
        id: 'lvl-4',
        tag: 'Mức 4',
        name: 'Bền vững',
        interval: '2 – 4 tuần',
        desc: 'Độ bền 14 đến 30 ngày (khả năng nhớ rất tốt)',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/><line x1="14" x2="14" y1="11" y2="13"/></svg>`,
        color: '#3b82f6',
        gradient: 'linear-gradient(180deg, #60a5fa, #2563eb)',
        trackBg: 'rgba(59, 130, 246, 0.12)',
        emptyTrackBg: 'rgba(59, 130, 246, 0.05)',
        borderColor: 'rgba(59, 130, 246, 0.35)',
        emptyBorderColor: 'rgba(59, 130, 246, 0.18)',
        emptyPill: 'linear-gradient(180deg, rgba(59, 130, 246, 0.45), rgba(59, 130, 246, 0.25))',
        badgeBg: 'rgba(59, 130, 246, 0.14)',
        glow: '0 4px 14px rgba(59, 130, 246, 0.4)',
        count: 0
      },
      {
        id: 'lvl-5',
        tag: 'Mức 5',
        name: 'Ghi nhớ sâu',
        interval: '≥ 30 ngày',
        desc: 'Trí nhớ dài hạn, trưởng thành (độ bền ≥ 30 ngày)',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>`,
        color: '#10b981',
        gradient: 'linear-gradient(180deg, #34d399, #059669)',
        trackBg: 'rgba(16, 185, 129, 0.12)',
        emptyTrackBg: 'rgba(16, 185, 129, 0.05)',
        borderColor: 'rgba(16, 185, 129, 0.35)',
        emptyBorderColor: 'rgba(16, 185, 129, 0.18)',
        emptyPill: 'linear-gradient(180deg, rgba(16, 185, 129, 0.45), rgba(16, 185, 129, 0.25))',
        badgeBg: 'rgba(16, 185, 129, 0.14)',
        glow: '0 4px 14px rgba(16, 185, 129, 0.4)',
        count: 0
      }
    ];

    const levelCards = [[], [], [], [], []];

    learnedCards.forEach(card => {
      const s = cardStates[card.id];
      const stability = (s && typeof s.stability === 'number' && !isNaN(s.stability)) ? s.stability : 0;

      let lvlIdx = 0;
      if (stability < 3) {
        lvlIdx = 0;
      } else if (stability < 7) {
        lvlIdx = 1;
      } else if (stability < 14) {
        lvlIdx = 2;
      } else if (stability < 30) {
        lvlIdx = 3;
      } else {
        lvlIdx = 4;
      }
      levels[lvlIdx].count++;
      levelCards[lvlIdx].push(card);
    });

    // 0. Cập nhật Lời chào theo thời gian trong ngày
    const hour = new Date().getHours();
    let timeGreeting = 'Chào buổi sáng! ☀️';
    if (hour >= 12 && hour < 18) timeGreeting = 'Chào buổi chiều! 🌤️';
    else if (hour >= 18 || hour < 5) timeGreeting = 'Chào buổi tối! 🌙';

    const greetingTitleEl = document.getElementById('home-greeting-title');
    if (greetingTitleEl) greetingTitleEl.textContent = timeGreeting;

    // 1. Cập nhật Thống kê Trang chủ (Mục tiêu ngày & Thời gian học)
    const dailyGoal = app.settings?.dailyNewLimit || 10;
    const logs = StorageManager.getStudyLogs();
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayNewLogs = logs.filter(l => {
      if (!l.timestamp) return false;
      const timeStr = typeof l.timestamp === 'string' ? l.timestamp : new Date(l.timestamp).toISOString();
      return timeStr.slice(0, 10) === todayStr && (l.oldState === State.New || l.oldState === 0);
    });
    const studiedToday = new Set(todayNewLogs.map(l => l.cardId)).size;

    const goalEl = document.getElementById('home-goal-count');
    if (goalEl) {
      goalEl.textContent = `${studiedToday}/${dailyGoal}`;
      if (studiedToday >= dailyGoal) {
        goalEl.title = `Đã hoàn thành xuất sắc mục tiêu hôm nay (${studiedToday}/${dailyGoal} từ)`;
        goalEl.style.color = '#10b981';
      } else {
        goalEl.title = `Đã học ${studiedToday} trên mục tiêu ${dailyGoal} từ hôm nay`;
        goalEl.style.color = 'var(--text-primary)';
      }
    }

    // 1. Tính toán Từ tới hạn ôn tập hôm nay
    const queue = app.deckManager.getStudyQueue(null, app.settings);
    const dueCount = queue.dueCards ? queue.dueCards.length : 0;
    const dueEl = document.getElementById('home-due-count');
    const iconWrapDue = document.getElementById('icon-wrap-due');

    if (dueEl) {
      dueEl.textContent = dueCount > 0 ? dueCount : '0';
      if (dueCount > 25) {
        dueEl.title = `Có ${dueCount} từ vựng quá hạn cần ôn tập gấp`;
        dueEl.style.color = '#ef4444';
        if (iconWrapDue) {
          iconWrapDue.style.background = 'rgba(239, 68, 68, 0.14)';
          iconWrapDue.style.color = '#ef4444';
        }
      } else if (dueCount > 10) {
        dueEl.title = `Có ${dueCount} từ vựng cần lưu ý ôn tập`;
        dueEl.style.color = '#f59e0b';
        if (iconWrapDue) {
          iconWrapDue.style.background = 'rgba(245, 158, 11, 0.14)';
          iconWrapDue.style.color = '#f59e0b';
        }
      } else {
        dueEl.title = dueCount > 0 ? `Có ${dueCount} từ vựng đến hạn ôn tập hôm nay` : 'Hiện không có từ nào đến hạn ôn tập';
        dueEl.style.color = dueCount > 0 ? 'var(--primary)' : 'var(--text-primary)';
        if (iconWrapDue) {
          iconWrapDue.style.background = 'rgba(99, 102, 241, 0.12)';
          iconWrapDue.style.color = 'var(--primary)';
        }
      }
    }

    // 2. Render 5 Cột Biểu Đồ
    const barsContainer = document.getElementById('home-memory-bars');
    const totalBadgeEl = document.getElementById('memory-total-badge');
    const hintEl = document.getElementById('memory-chart-hint');

    if (totalBadgeEl) {
      totalBadgeEl.textContent = `${totalLearned} từ đã học`;
    }
    if (hintEl) {
      hintEl.style.display = totalLearned === 0 ? 'flex' : 'none';
    }

    if (barsContainer) {
      barsContainer.innerHTML = '';
      const fragment = document.createDocumentFragment();

      levels.forEach((lvl) => {
        const hasCards = lvl.count > 0;
        const percentOfTotal = totalLearned > 0 ? Math.round((lvl.count / totalLearned) * 100) : 0;
        const percentHeight = totalLearned > 0 && hasCards
          ? Math.min(100, Math.max(12, percentOfTotal))
          : 0;

        const col = document.createElement('div');
        col.className = `memory-col ${hasCards ? 'has-cards' : 'empty-tier'}`;
        col.title = hasCards 
          ? `${lvl.name} (${lvl.interval}): ${lvl.count} từ (${percentOfTotal}% trên tổng ${totalLearned} từ đã học)`
          : `${lvl.name} (${lvl.interval}): 0 từ • ${lvl.desc}`;

        col.innerHTML = `
          <div class="memory-track-wrap">
            <div class="memory-col-track" style="background: ${hasCards ? lvl.trackBg : lvl.emptyTrackBg}; border-color: ${hasCards ? lvl.borderColor : lvl.emptyBorderColor};">
              <div class="memory-col-fill" style="height: ${percentHeight}%; background: ${hasCards ? lvl.gradient : 'transparent'}; box-shadow: ${hasCards ? lvl.glow : 'none'};"></div>
            </div>
          </div>
          <div class="memory-icon-badge" style="background: ${lvl.badgeBg}; color: ${lvl.color};">
            ${lvl.iconSvg}
          </div>
          <span class="memory-col-name">${lvl.name}</span>
          <span class="memory-col-interval">${lvl.interval}</span>
          <span class="memory-col-val" style="color: ${hasCards ? lvl.color : 'var(--text-secondary)'}; font-weight: ${hasCards ? '800' : '700'};">${lvl.count}</span>
        `;
        fragment.appendChild(col);
      });

      barsContainer.appendChild(fragment);
    }

    // 3. Logic Nút CTA Thông Minh
    const btnCta = document.getElementById('btn-home-cta');
    const ctaIcon = document.getElementById('home-cta-icon');
    const ctaText = document.getElementById('home-cta-text');

    if (btnCta) {
      if (dueCount > 0) {
        if (ctaIcon) ctaIcon.textContent = '🔄';
        if (ctaText) ctaText.textContent = 'Ôn tập ngay';

        if (dueCount > 25) {
          btnCta.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
          btnCta.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
        } else if (dueCount > 10) {
          btnCta.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
          btnCta.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.35)';
        } else {
          btnCta.style.background = 'linear-gradient(135deg, #4f46e5, #6366f1)';
          btnCta.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.35)';
        }

        btnCta.onclick = () => {
          try {
            app.startStudySession(queue.dueCards);
          } catch (err) {
            console.error('Lỗi bắt đầu phiên ôn tập:', err);
          }
        };
      } else {
        if (ctaIcon) ctaIcon.textContent = '🚀';
        if (ctaText) ctaText.textContent = 'Học từ mới';
        btnCta.style.background = 'linear-gradient(135deg, #4f46e5, #6366f1)';
        btnCta.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.35)';
        btnCta.onclick = () => {
          try {
            app.switchTab('tab-decks');
          } catch (err) {
            console.error('Lỗi chuyển tab-decks từ CTA:', err);
          }
        };
      }
    }
  } catch (err) {
    console.error('Lỗi trong renderReviewTab:', err);
  }
}
