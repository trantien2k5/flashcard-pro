/**
 * Reels Submodule: HTML Templates & Visual Helpers for Facebook-Style Vocabulary Feed
 */

import { FSRS, State, isCardDue } from '../../core/fsrs.js';
import { StorageManager } from '../../services/storage.js';
import { TOPICS } from '../../../data/index.js';
import { escapeHTML } from '../../utils.js';

// ==========================================
// STRING & HTML HELPERS
// ==========================================
export function highlightTargetWord(sentence, targetWord) {
  if (!sentence) return '';
  if (!targetWord) return escapeHTML(sentence);
  const clean = targetWord.trim();
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${escaped}\\w*)\\b`, 'gi');
  if (regex.test(sentence)) {
    return escapeHTML(sentence).replace(regex, '<mark>$1</mark>');
  }
  return escapeHTML(sentence);
}

// Sinh Avatar Gradient ngẫu nhiên đẹp mắt (Dùng CSS Tokens để tương thích Theme)
export function getGradientForWord(wordText) {
  const gradients = [
    'linear-gradient(135deg, var(--primary), var(--accent))',
    'linear-gradient(135deg, var(--primary-light), var(--primary))',
    'linear-gradient(135deg, var(--fsrs-again), var(--fsrs-hard))',
    'linear-gradient(135deg, var(--fsrs-good), var(--accent))',
    'linear-gradient(135deg, var(--fsrs-hard), var(--primary-light))'
  ];
  let hash = 0;
  for (let i = 0; i < (wordText || '').length; i++) {
    hash = wordText.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

// ==========================================
// RENDER 1 FACEBOOK POST CARD
// ==========================================
export function renderFacebookPostCardHTML(card, index, ctx = {}) {
  const isLiked = (ctx.likedWordIds || new Set()).has(card.id);
  const isBookmarked = (ctx.bookmarkedWordIds || new Set()).has(card.id);
  const cefr = (card.level || 'A1').toUpperCase();
  const pos = (card.pos || 'word').toLowerCase();
  const ipa = card.ipa || card.phonetic || '';
  const wordText = card.word || '';
  const meaningText = card.meaning || '';
  const definitionEn = card.definition || '';
  const exampleEn = highlightTargetWord(card.example || '', card.word);
  const exampleVi = card.exampleVi || '';
  const imgSrc = card.img || '';
  const hasImg = imgSrc && imgSrc.length > 5;
  const isBlur = (ctx.fbFilter ? ctx.fbFilter.blurMeaning : false);

  // Lấy danh sách comments cá nhân của từ
  const comments = (ctx.wordComments || {})[card.id] || [];

  // Trạng thái FSRS
  const state = card.fsrsState || StorageManager.getCardState(card.id);
  const reps = state?.reps || 0;
  const stability = state?.stability ? Math.round(state.stability * 10) / 10 : 0;
  const timeDesc = reps > 0 ? `Đã ôn ${reps} lần • Độ bền: ${stability}d` : 'Từ mới gợi ý cho bạn';

  return `
    <article class="fb-post-card" data-index="${index}" data-id="${card.id}" id="fb-post-${card.id}">
      <!-- 1. Post Header (Tác giả, Tích xanh, Cấp độ, Thời gian, Menu 3 chấm) -->
      <header class="fb-post-header">
        <div class="fb-post-author-group" data-action="speak-word-us">
          <div class="fb-story-ring">
            <div class="fb-post-avatar" style="background: ${getGradientForWord(wordText)};">
              ${cefr}
            </div>
          </div>
          <div class="fb-post-author-info">
            <div class="fb-author-row">
              <span class="fb-author-name">Flashcard Pro</span>
              <svg class="fb-verified-tick" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4-7 7z"/>
              </svg>
              <span class="fb-author-level-tag level-tag-${cefr.toLowerCase()}">${cefr}</span>
            </div>
            <div class="fb-post-meta">
              <span>${timeDesc}</span>
              <span>•</span>
              <span class="fb-privacy-icon" title="Công khai">🌐</span>
            </div>
          </div>
        </div>

        <button type="button" class="fb-post-menu-btn" data-action="open-post-menu" title="Tùy chọn bài viết">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
          </svg>
        </button>
      </header>

      <!-- 2. Post Body Content -->
      <div class="fb-post-body">
        <!-- Word Headline & POS -->
        <div class="fb-word-headline-row">
          <h2 class="fb-word-title">${escapeHTML(wordText)}</h2>
          ${pos ? `<span class="fb-word-pos-badge">${escapeHTML(pos)}</span>` : ''}
        </div>

        <!-- Pronunciation Strip: IPA & 2 Loa US / UK riêng biệt -->
        <div class="fb-pronounce-strip">
          ${ipa ? `<span class="fb-ipa-pill">${escapeHTML(ipa)}</span>` : ''}
          <div class="fb-audio-btn-group">
            <button type="button" class="fb-btn-accent-audio" data-action="speak-word-us" title="Nghe phát âm chuẩn Anh - Mỹ (US)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>🇺🇸 US</span>
            </button>
            <button type="button" class="fb-btn-accent-audio" data-action="speak-word-uk" title="Nghe phát âm chuẩn Anh - Anh (UK)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>🇬🇧 UK</span>
            </button>
          </div>
        </div>

        <!-- Khung nghĩa tiếng Việt (Bấm để che/hiện) -->
        <div class="fb-meaning-box ${isBlur ? 'is-blurred' : ''}" data-action="toggle-meaning-blur" title="Bấm để ẩn / hiện nghĩa tiếng Việt">
          <div class="fb-meaning-main-text">${escapeHTML(meaningText)}</div>
          <div class="fb-meaning-blur-hint">
            <span>👁️ Chạm để xem nghĩa</span>
          </div>
        </div>

        <!-- English Definition -->
        ${definitionEn ? `
          <div class="fb-definition-en">
            <em>💡 ${escapeHTML(definitionEn)}</em>
          </div>
        ` : ''}

        <!-- Post Image hoặc Colored Status Background -->
        ${hasImg ? `
          <div class="fb-post-image-wrap" data-action="speak-word-us">
            <img class="fb-post-img" src="${imgSrc}" alt="${escapeHTML(wordText)}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none';" />
          </div>
        ` : `
          <div class="fb-post-colored-status" style="background: ${getGradientForWord(wordText)};" data-action="speak-word-us">
            <div class="fb-colored-word">${escapeHTML(wordText)}</div>
            <div class="fb-colored-meaning">${escapeHTML(meaningText)}</div>
          </div>
        `}

        <!-- Context Quote Card (Câu ví dụ song ngữ) -->
        ${card.example ? `
          <div class="fb-context-quote-card">
            <div class="fb-quote-header">
              <span class="fb-quote-label">📖 Ví dụ trong ngữ cảnh</span>
              <button type="button" class="fb-btn-listen-quote" data-action="speak-example" title="Nghe câu ví dụ">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <span>Nghe câu</span>
              </button>
            </div>
            <div class="fb-example-en">${exampleEn}</div>
            ${exampleVi ? `<div class="fb-example-vi">${escapeHTML(exampleVi)}</div>` : ''}
          </div>
        ` : ''}
      </div>

      <!-- 3. Reaction Stats Count Row (👍 ❤️ 💡 Bạn và 2.5K người khác) -->
      <div class="fb-stats-counter-row">
        <div class="fb-reaction-cluster">
          <div class="fb-reaction-icons">
            <span class="fb-reaction-bubble fb-bubble-like">👍</span>
            <span class="fb-reaction-bubble fb-bubble-love">❤️</span>
            <span class="fb-reaction-bubble fb-bubble-care">💡</span>
          </div>
          <span class="fb-like-count-text">${isLiked ? 'Bạn và 2.5K người khác' : '2.5K người khác'}</span>
        </div>
        <div class="fb-stats-right-text">
          <span class="fb-comment-count-text">${comments.length} ghi chú</span>
          <span>•</span>
          <span>FSRS-6</span>
        </div>
      </div>

      <!-- 4. Facebook Action Bar (Thích - Bình luận - Chia sẻ - Lưu) -->
      <div class="fb-action-bar">
        <button type="button" class="fb-action-btn ${isLiked ? 'is-liked' : ''}" data-action="toggle-like" title="Thích từ vựng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          <span>Thích</span>
        </button>

        <button type="button" class="fb-action-btn" data-action="toggle-comments" title="Ghi chú & Bình luận">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Bình luận</span>
        </button>

        <button type="button" class="fb-action-btn" data-action="share-word" title="Chia sẻ bài viết">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Chia sẻ</span>
        </button>

        <button type="button" class="fb-action-btn ${isBookmarked ? 'is-bookmarked' : ''}" data-action="toggle-bookmark" title="Lưu từ vào bộ sưu tập">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Lưu</span>
        </button>
      </div>

      <!-- 5. FSRS-6 Quick Scientific Rating Bar (Khoa học ghi nhớ ngắt quãng) -->
      <div class="fb-fsrs-rating-bar">
        <button type="button" class="fb-btn-fsrs fb-btn-fsrs-again" data-rating="1" title="Chưa nhớ - Ôn lại sớm">
          <span class="fb-fsrs-label">❌ Quên</span>
          <span class="fb-fsrs-desc">Học lại</span>
        </button>
        <button type="button" class="fb-btn-fsrs fb-btn-fsrs-hard" data-rating="2" title="Hơi khó nhớ">
          <span class="fb-fsrs-label">⏳ Khó</span>
          <span class="fb-fsrs-desc">Ôn sớm</span>
        </button>
        <button type="button" class="fb-btn-fsrs fb-btn-fsrs-good" data-rating="3" title="Nhớ tốt">
          <span class="fb-fsrs-label">✨ Tốt</span>
          <span class="fb-fsrs-desc">Chuẩn hạn</span>
        </button>
        <button type="button" class="fb-btn-fsrs fb-btn-fsrs-easy" data-rating="4" title="Rất dễ nhớ">
          <span class="fb-fsrs-label">💎 Dễ</span>
          <span class="fb-fsrs-desc">Nhớ sâu</span>
        </button>
      </div>

      <!-- 6. Comments & Notes Drawer -->
      <div class="fb-comments-drawer" id="fb-comments-${card.id}">
        <div class="fb-comment-list" id="fb-comment-list-${card.id}">
          ${comments.map(c => `
            <div class="fb-comment-item">
              <div class="fb-comment-avatar">Me</div>
              <div class="fb-comment-bubble">
                <div class="fb-comment-author">Ghi chú của bạn</div>
                <div>${escapeHTML(c)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="fb-comment-input-row">
          <input type="text" class="fb-comment-input" placeholder="Viết ghi chú / ví dụ riêng cho từ này..." />
          <button type="button" class="fb-btn-send-comment" data-action="submit-comment" title="Gửi ghi chú">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

// ==========================================
// RENDER BỘ LỌC TỪ VỰNG MODAL / BOTTOM SHEET
// ==========================================
export function renderFilterModalHTML(fbFilter = {}) {
  const rootTopics = Array.isArray(TOPICS) ? TOPICS.filter(t => !t.parentId) : [];

  return `
    <div class="fb-filter-modal-backdrop" id="fb-filter-modal">
      <div class="fb-filter-sheet">
        <div class="fb-filter-header">
          <div class="fb-filter-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Bộ Lọc Nội Dung Lướt Từ</span>
          </div>
          <button type="button" class="fb-btn-circle" id="fb-filter-close-btn" title="Đóng bộ lọc">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="fb-filter-body">
          <!-- 1. Cấp độ CEFR -->
          <div>
            <div class="fb-filter-group-title">🏷️ Cấp độ CEFR</div>
            <div class="fb-filter-chips-row" id="filter-level-chips">
              <button type="button" class="fb-filter-chip ${fbFilter.level === 'all' ? 'active' : ''}" data-level="all">Tất cả Cấp độ</button>
              <button type="button" class="fb-filter-chip ${fbFilter.level === 'A1' ? 'active' : ''}" data-level="A1">A1 Căn bản</button>
              <button type="button" class="fb-filter-chip ${fbFilter.level === 'A2' ? 'active' : ''}" data-level="A2">A2 Sơ cấp</button>
              <button type="button" class="fb-filter-chip ${fbFilter.level === 'B1' ? 'active' : ''}" data-level="B1">B1 Trung cấp</button>
              <button type="button" class="fb-filter-chip ${fbFilter.level === 'B2' ? 'active' : ''}" data-level="B2">B2 Nâng cao</button>
              <button type="button" class="fb-filter-chip ${fbFilter.level === 'C1' ? 'active' : ''}" data-level="C1">C1 Chuyên sâu</button>
            </div>
          </div>

          <!-- 2. Trạng thái học FSRS -->
          <div>
            <div class="fb-filter-group-title">🎯 Thuật toán & Trạng thái</div>
            <div class="fb-filter-chips-row" id="filter-status-chips">
              <button type="button" class="fb-filter-chip ${fbFilter.status === 'mixed' ? 'active' : ''}" data-status="mixed">🔀 Trộn Thông Minh (FB Feed)</button>
              <button type="button" class="fb-filter-chip ${fbFilter.status === 'due' ? 'active' : ''}" data-status="due">⏰ Đến Hạn Ôn (FSRS Due)</button>
              <button type="button" class="fb-filter-chip ${fbFilter.status === 'new' ? 'active' : ''}" data-status="new">✨ Từ Mới Chưa Học</button>
              <button type="button" class="fb-filter-chip ${fbFilter.status === 'bookmarked' ? 'active' : ''}" data-status="bookmarked">⭐ Đã Lưu / Yêu Thích</button>
              <button type="button" class="fb-filter-chip ${fbFilter.status === 'hard' ? 'active' : ''}" data-status="hard">🧠 Từ Khó / Hay Quên</button>
            </div>
          </div>

          <!-- 3. Chủ đề từ vựng -->
          <div>
            <div class="fb-filter-group-title">📚 Chủ đề từ vựng</div>
            <select class="fb-filter-select" id="filter-topic-select">
              <option value="all" ${fbFilter.topicId === 'all' ? 'selected' : ''}>Tất cả chủ đề từ vựng (Toàn bộ kho từ)</option>
              ${rootTopics.map(t => `
                <option value="${t.id}" ${fbFilter.topicId === t.id ? 'selected' : ''}>
                  ${t.icon || '📖'} ${escapeHTML(t.name)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- 4. Cài đặt hiển thị & phát âm -->
          <div>
            <div class="fb-filter-group-title">⚙️ Cài đặt lướt bảng tin</div>
            <div class="fb-filter-toggle-row">
              <div class="fb-filter-toggle-label">
                <span class="fb-filter-toggle-name">🔊 Tự động phát âm khi lướt</span>
                <span class="fb-filter-toggle-desc">Tự phát âm từ vựng khi bài viết trượt vào màn hình</span>
              </div>
              <label class="fb-switch">
                <input type="checkbox" id="filter-toggle-audio" ${fbFilter.autoAudio ? 'checked' : ''}>
                <span class="fb-slider"></span>
              </label>
            </div>

            <div class="fb-filter-toggle-row">
              <div class="fb-filter-toggle-label">
                <span class="fb-filter-toggle-name">👁️ Che nghĩa tiếng Việt mặc định</span>
                <span class="fb-filter-toggle-desc">Làm mờ nghĩa để bạn tự đoán trước khi chạm xem</span>
              </div>
              <label class="fb-switch">
                <input type="checkbox" id="filter-toggle-blur" ${fbFilter.blurMeaning ? 'checked' : ''}>
                <span class="fb-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="fb-filter-footer">
          <button type="button" class="fb-btn-reset-filter" id="fb-filter-reset-btn">Đặt lại</button>
          <button type="button" class="fb-btn-apply-filter" id="fb-filter-apply-btn">Áp dụng bộ lọc</button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// HIỆU ỨNG TIM BAY & REACTION FLOATING
// ==========================================
export function spawnFloatingReaction(x, y, emoji = '❤️') {
  const el = document.createElement('div');
  el.className = 'fb-floating-reaction';
  el.textContent = emoji;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
