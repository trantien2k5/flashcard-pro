/**
 * Flashcard English Pro - Tiện ích lõi (Core Utilities)
 * Tổng hợp xử lý DOM, Async, Format định dạng, Xử lý chuỗi & Bảo mật Sanitization
 */

/**
 * Mã hóa ký tự đặc biệt HTML chống tấn công XSS
 */
export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

/**
 * Kiểm tra và làm sạch chuỗi mã màu CSS hợp lệ
 */
export function safeColor(value, fallback = '#6366f1') {
  const color = String(value || '').trim();
  return /^(#[0-9a-f]{3,8}|rgb(a)?\([\d\s.,%]+\)|hsl(a)?\([\d\s.,%]+\)|[a-z]+)$/i.test(color) ? color : fallback;
}

/**
 * Thoát các ký tự đặc biệt khi tạo RegExp động
 */
export function escapeRegex(string) {
  return String(string || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Định dạng thời gian trôi qua (giây) thành chuỗi mm:ss hoặc hh:mm
 */
export function formatTime(seconds = 0) {
  const sec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM < 10 ? '0' : ''}${remM}m`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Định dạng đối tượng Date thành chuỗi ngày theo chuẩn tiếng Việt (vd: "08/09/2026")
 */
export function formatDate(date) {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Định dạng số nguyên với dấu chấm ngăn cách hàng nghìn tiếng Việt (vd: 1.250)
 */
export function formatNumber(num = 0) {
  const n = Number(num) || 0;
  return n.toLocaleString('vi-VN');
}

/**
 * Làm sạch chuỗi chu kỳ FSRS cho nhãn nút ngắn gọn (bỏ ký tự <, ≤, khoảng trắng thừa)
 */
export function formatCleanInterval(text, fallback = '1d') {
  return (text || fallback).toString().replace(/^[<≤\s]+/, '').trim();
}

/**
 * Lấy khóa ngày dạng YYYY-MM-DD theo giờ địa phương của thiết bị (chống lệch múi giờ UTC)
 */
export function getLocalDateKey(date = new Date()) {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Kiểm tra thiết bị hiện tại có hỗ trợ cảm ứng (Touch Screen) không
 */
export function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
}

/**
 * Cuộn mượt mà cửa sổ hoặc container lên đầu trang
 */
export function scrollToTop(target = null, smooth = true) {
  try {
    if (target && target !== window && typeof target.scrollTo === 'function') {
      target.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      return;
    }
    const behavior = smooth ? 'smooth' : 'auto';
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior });
    }
    if (typeof document !== 'undefined') {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior });
      const activePane = document.querySelector('.tab-pane.active');
      if (activePane) activePane.scrollTop = 0;
      const subtopicsList = document.getElementById('subpage-subtopics-list');
      if (subtopicsList) subtopicsList.scrollTop = 0;
      const wordsList = document.getElementById('subtopic-words-list');
      if (wordsList) wordsList.scrollTop = 0;
    }
  } catch (e) {}
}

/**
 * Đánh dấu từ khóa tìm kiếm trong chuỗi văn bản an toàn với thẻ <mark>
 */
export function highlightKeyword(text, keyword) {
  if (!text || !keyword) return escapeHTML(text || '');
  const escapedText = escapeHTML(text);
  const escapedKeyword = escapeRegex(escapeHTML(keyword));
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
}

/**
 * Hàm Debounce trì hoãn gọi hàm liên tục (tối ưu gõ phím tìm kiếm)
 */
export function debounce(fn, delay = 150) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Hàm Throttle giới hạn tần suất thực thi hàm theo chu kỳ mili-giây
 */
export function throttle(fn, limit = 200) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Gắn sự kiện đóng Modal khi click ra ngoài backdrop hoặc bấm phím Escape
 * @param {HTMLElement} modalEl - Element backdrop modal
 * @param {Function} closeCallback - Hàm callback khi đóng
 * @returns {Function} Hàm unbind gỡ bỏ sự kiện
 */
export function bindModalBackdropAndEsc(modalEl, closeCallback) {
  if (!modalEl || typeof closeCallback !== 'function') return () => {};

  const handleBackdrop = (e) => {
    if (e.target === modalEl) {
      closeCallback(e);
    }
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closeCallback(e);
    }
  };

  modalEl.addEventListener('click', handleBackdrop);
  window.addEventListener('keydown', handleEsc);

  return () => {
    modalEl.removeEventListener('click', handleBackdrop);
    window.removeEventListener('keydown', handleEsc);
  };
}

/**
 * Hàm trì hoãn Async Promise (Sleep)
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
