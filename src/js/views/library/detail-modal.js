/**
 * Word Detail Modal & FSRS Due Formatter Component
 * Quản lý Modal Popup xem chi tiết từ vựng đầy đủ, nghe phát âm US/UK,
 * theo dõi các thông số FSRS (Stability S, Difficulty D, Lapses) và đặt lại thẻ.
 */

import { StorageManager } from '../../services/storage.js';
import { State, isCardDue } from '../../core/fsrs.js';
import { MASTERY_STABILITY_THRESHOLD } from '../../config.js';
import { escapeHTML } from '../../utils.js';
import { speak } from '../../services/audio.js';

/**
 * Định dạng trạng thái FSRS, hạn ôn tập và nhãn phân tầng trí nhớ
 */
export function formatFSRSDueText(state, now = new Date()) {
  if (!state || state.state === State.New || state.state === 0 || !state.due) {
    return {
      statusClass: 'status-new',
      statusLabel: 'Mới',
      statusIcon: '✨',
      shortDueText: 'Mới',
      tierLabel: 'Chưa học',
      tierLevel: 0,
      dueFullText: 'Chưa có lịch ôn',
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      interval: 0,
      dueDateFormatted: '—'
    };
  }

  const dueDate = new Date(state.due);
  const isDue = isCardDue(state, now);
  const s = Number(state.stability) || 0;
  const d = Number(state.difficulty) || 0;
  const reps = Number(state.reps) || 0;
  const lapses = Number(state.lapses) || 0;
  const interval = Number(state.scheduled_days) || 0;

  let tierLabel = 'Mức 1 (Mới học)';
  let tierLevel = 1;
  if (s >= 30) {
    tierLabel = 'Mức 5 (Ghi nhớ sâu)';
    tierLevel = 5;
  } else if (s >= 14) {
    tierLabel = 'Mức 4 (Bền vững)';
    tierLevel = 4;
  } else if (s >= 7) {
    tierLabel = 'Mức 3 (Trung hạn)';
    tierLevel = 3;
  } else if (s >= 3) {
    tierLabel = 'Mức 2 (Ngắn hạn)';
    tierLevel = 2;
  }

  const dueDay = dueDate.getDate().toString().padStart(2, '0');
  const dueMonth = (dueDate.getMonth() + 1).toString().padStart(2, '0');
  const dueYear = dueDate.getFullYear();
  const dueDateFormatted = `${dueDay}/${dueMonth}/${dueYear}`;

  const isLeech = Boolean(state.isLeech === true || lapses >= 8);

  if (isDue) {
    return {
      statusClass: 'status-due',
      statusLabel: 'Cần ôn ngay',
      statusIcon: isLeech ? '⚠️' : '⏰',
      shortDueText: isLeech ? 'Thẻ khó' : 'Đến hạn',
      tierLabel: isLeech ? 'Thẻ khó (Leech)' : tierLabel,
      tierLevel,
      dueFullText: `Đã đến hạn ôn hôm nay (${dueDateFormatted})`,
      stability: s,
      difficulty: d,
      reps,
      lapses,
      interval,
      dueDateFormatted,
      isSuspended: false,
      isLeech
    };
  }

  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let shortDueText = '';
  let dueFullText = '';

  if (diffDays <= 1) {
    shortDueText = 'Ngày mai';
    dueFullText = `Ngày mai (${dueDateFormatted})`;
  } else if (diffDays < 30) {
    shortDueText = `${diffDays} ngày nữa`;
    dueFullText = `Sau ${diffDays} ngày (${dueDateFormatted})`;
  } else if (diffDays < 365) {
    shortDueText = `${(diffDays / 30).toFixed(0)} tháng nữa`;
    dueFullText = `Sau ${(diffDays / 30).toFixed(1)} tháng (${dueDateFormatted})`;
  } else {
    shortDueText = dueDateFormatted;
    dueFullText = dueDateFormatted;
  }

  if (isLeech) {
    shortDueText = 'Thẻ khó';
  }

  if (s >= MASTERY_STABILITY_THRESHOLD) {
    return {
      statusClass: 'status-mastered',
      statusLabel: 'Thuần thục',
      statusIcon: '🏆',
      shortDueText,
      tierLabel,
      tierLevel,
      dueFullText,
      stability: s,
      difficulty: d,
      reps,
      lapses,
      interval,
      dueDateFormatted
    };
  }

  return {
    statusClass: 'status-learning',
    statusLabel: 'Đang nhớ',
    statusIcon: '🌱',
    shortDueText,
    tierLabel,
    tierLevel,
    dueFullText,
    stability: s,
    difficulty: d,
    reps,
    lapses,
    interval,
    dueDateFormatted
  };
}

/**
 * Mở Modal Popup Chi Tiết Từ Vựng Đầy Đủ (Word Detail Modal)
 */
export function openWordDetailModal(card, app) {
  if (!card) return;

  let modal = document.getElementById('word-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'word-detail-modal';
    modal.className = 'word-detail-modal-overlay';
    document.body.appendChild(modal);
  }

  const now = new Date();
  const state = StorageManager.getCardState(card.id);
  const fsrsInfo = formatFSRSDueText(state, now);
  const cefr = (card.cefr || card.level || 'A1').toLowerCase();
  const pos = (card.pos || 'word').toUpperCase();
  const imgSrc = card.img || card.image || '';
  const phonetic = card.phonetic || card.ipa || '';

  // Render Modal HTML
  modal.innerHTML = `
    <div class="word-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-word-title">
      <!-- Modal Header -->
      <div class="word-detail-header">
        <div class="word-detail-header-tags">
          <span class="badge-cefr" data-cefr="${cefr}">${cefr.toUpperCase()}</span>
          <span class="badge-pos">${escapeHTML(pos)}</span>
        </div>
        <button class="btn-detail-close" id="btn-close-word-modal" title="Đóng (Esc)" aria-label="Đóng">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="word-detail-body">
        <!-- 1. Hero Area: Image & Word Head -->
        <div class="word-detail-hero">
          ${imgSrc ? `
            <div class="word-detail-image-wrap" id="detail-img-wrap" title="Nhấn để xem ảnh">
              <img src="${escapeHTML(imgSrc)}" class="word-detail-img" alt="${escapeHTML(card.word)}" loading="eager" />
            </div>
          ` : ''}

          <div class="word-detail-headline">
            <h2 class="word-detail-title" id="modal-word-title">${escapeHTML(card.word || '')}</h2>
            ${phonetic ? `<div class="word-detail-ipa">${escapeHTML(phonetic)}</div>` : ''}

            <!-- Dual Audio Pronunciation Buttons -->
            <div class="word-detail-audio-row">
              <button class="btn-modal-sound btn-sound-us" id="btn-sound-us" title="Phát âm chuẩn Mỹ (US)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                <span>US (Mỹ)</span>
              </button>
              <button class="btn-modal-sound btn-sound-uk" id="btn-sound-uk" title="Phát âm chuẩn Anh (UK)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                </svg>
                <span>UK (Anh)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Meaning & Definition -->
        <div class="word-detail-section">
          <div class="word-detail-meaning-box">
            <span class="detail-label">Nghĩa tiếng Việt</span>
            <p class="detail-meaning">${escapeHTML(card.meaning || '')}</p>
          </div>
          ${card.definition ? `
            <div class="word-detail-def-box">
              <span class="detail-label">Định nghĩa tiếng Anh</span>
              <p class="detail-definition">${escapeHTML(card.definition)}</p>
            </div>
          ` : ''}
        </div>

        <!-- 3. Example Sentences -->
        ${card.example ? `
          <div class="word-detail-section">
            <div class="word-detail-example-box">
              <span class="detail-label">Ví dụ ngữ cảnh</span>
              <p class="detail-example-en">"${escapeHTML(card.example)}"</p>
              ${card.exampleVi ? `<p class="detail-example-vi">${escapeHTML(card.exampleVi)}</p>` : ''}
            </div>
          </div>
        ` : ''}

        <!-- 4. FSRS Spaced Repetition Intelligence Card -->
        <div class="word-detail-section">
          <div class="detail-fsrs-card">
            <div class="fsrs-card-header">
              <div class="fsrs-card-title-group">
                <span class="fsrs-card-icon">🧠</span>
                <div>
                  <h4 class="fsrs-card-title">Bộ Nhớ FSRS-6</h4>
                  <p class="fsrs-card-sub">Trí nhớ dài hạn cá nhân hóa</p>
                </div>
              </div>
              <div class="fsrs-status-badge-wrap">
                <span class="status-pill ${fsrsInfo.statusClass}">
                  ${fsrsInfo.statusIcon} ${fsrsInfo.statusLabel}
                </span>
              </div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Hạn ôn tập tiếp theo</div>
              <div class="fsrs-stat-value highlight">${escapeHTML(fsrsInfo.dueFullText)}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Độ bền (Stability S)</div>
              <div class="fsrs-stat-value">${fsrsInfo.stability > 0 ? `${fsrsInfo.stability.toFixed(1)} ngày` : 'Chưa học'}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Độ khó (Difficulty D)</div>
              <div class="fsrs-stat-value">${fsrsInfo.difficulty > 0 ? `${fsrsInfo.difficulty.toFixed(1)} / 10` : 'Chưa học'}</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Số lần đã ôn</div>
              <div class="fsrs-stat-value">${fsrsInfo.reps} lần (Quên: ${fsrsInfo.lapses})</div>
            </div>

            <div class="fsrs-stat-item">
              <div class="fsrs-stat-label">Khoảng cách lịch ôn</div>
              <div class="fsrs-stat-value">${fsrsInfo.interval > 0 ? `${fsrsInfo.interval} ngày` : 'Mặc định'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer CTA -->
      <div class="word-detail-footer" style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
        ${(state && (state.isLeech || (state.lapses && state.lapses >= 8))) ? `
          <button class="btn-modal-unsuspend" id="btn-modal-unsuspend-card" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 10px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.88rem; transition: all 0.2s;">
            <span>🔄 Đặt lại thẻ khó & Học lại</span>
          </button>
        ` : ''}
        <button class="btn-modal-study-now" id="btn-modal-study-single">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Học Thẻ Này Ngay</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Sự kiện đóng Modal
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const btnClose = document.getElementById('btn-close-word-modal');
  if (btnClose) btnClose.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Nút phát âm US
  const btnUS = document.getElementById('btn-sound-us');
  if (btnUS) {
    btnUS.onclick = () => {
      btnUS.classList.add('playing');
      speak(card.word, { lang: 'en-US', cardObj: card });
    };
  }

  // Nút phát âm UK
  const btnUK = document.getElementById('btn-sound-uk');
  if (btnUK) {
    btnUK.onclick = () => {
      btnUK.classList.add('playing');
      speak(card.word, { lang: 'en-GB', cardObj: card });
    };
  }

  // Nút học ngay thẻ này
  const btnStudySingle = document.getElementById('btn-modal-study-single');
  if (btnStudySingle) {
    btnStudySingle.onclick = () => {
      closeModal();
      app.startStudySession(null, null, [card]);
    };
  }

  // Nút bỏ tạm treo và học lại thẻ khó
  const btnUnsuspend = document.getElementById('btn-modal-unsuspend-card');
  if (btnUnsuspend) {
    btnUnsuspend.onclick = () => {
      StorageManager.resetLeechStatus(card.id);
      if (app.showToast) app.showToast(`✅ Đã khôi phục từ "${card.word}" về hàng đợi ôn tập!`, 'success');
      closeModal();
      if (typeof app.renderLibraryTab === 'function') {
        app.renderLibraryTab();
      }
    };
  }
}
