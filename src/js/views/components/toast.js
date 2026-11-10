/**
 * Toast Notifications & Custom Confirm Dialog
 */

import { mountGlobalModals } from './shell.js';

/* ==========================================================================
   1. FEEDBACK & NOTIFICATIONS (TOAST & CONFIRM MODAL)
   ========================================================================== */

/**
 * Custom Confirmation Modal (thay thế window.confirm hoàn toàn)
 */
export function showConfirm({
  title = 'Thoát phiên học?',
  message = 'Bạn có chắc chắn muốn thoát phiên học này không?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  icon = '🚪'
} = {}) {
  mountGlobalModals();
  return new Promise((resolve) => {
    const modal = document.getElementById('app-confirm-modal');
    if (!modal) {
      resolve(window.confirm(message));
      return;
    }

    const iconEl = document.getElementById('confirm-icon');
    const iconBox = document.getElementById('confirm-icon-box');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const btnCloseModal = document.getElementById('btn-confirm-close');
    const btnCancel = document.getElementById('btn-confirm-cancel');
    const btnOk = document.getElementById('btn-confirm-ok');

    if (iconEl) iconEl.textContent = icon;
    if (iconBox) iconBox.className = `confirm-icon-wrapper ${type}`;
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (btnCancel) btnCancel.textContent = cancelText;
    if (btnOk) {
      btnOk.textContent = confirmText;
      btnOk.className = `btn-confirm-primary ${type}`;
    }

    modal.classList.add('active');

    let keydownHandler = null;
    const cleanup = () => {
      modal.classList.remove('active');
      if (btnOk) btnOk.onclick = null;
      if (btnCancel) btnCancel.onclick = null;
      if (btnCloseModal) btnCloseModal.onclick = null;
      modal.onclick = null;
      if (keydownHandler) {
        window.removeEventListener('keydown', keydownHandler);
      }
    };

    keydownHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        resolve(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        cleanup();
        resolve(true);
      }
    };
    window.addEventListener('keydown', keydownHandler);

    if (btnOk) {
      btnOk.onclick = () => {
        cleanup();
        resolve(true);
      };
    }

    if (btnCancel) {
      btnCancel.onclick = () => {
        cleanup();
        resolve(false);
      };
    }

    if (btnCloseModal) {
      btnCloseModal.onclick = () => {
        cleanup();
        resolve(false);
      };
    }

    modal.onclick = (e) => {
      if (e.target === modal) {
        cleanup();
        resolve(false);
      }
    };
  });
}

/**
 * Upgraded In-App Floating Toast Notification (thay thế window.alert)
 * Tối ưu kích thước nhỏ gọn, không phình to khi nhiều chữ, hỗ trợ bấm để đóng ngay
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✕'
  };

  // Giới hạn tối đa 2 toast hiển thị cùng lúc để không choán màn hình
  while (container.children.length >= 2) {
    const old = container.firstChild;
    old.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');

  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.textContent = icons[type] || icons.info;

  const contentEl = document.createElement('div');
  contentEl.className = 'toast-content';
  contentEl.textContent = String(message || '');

  toast.append(iconEl, contentEl);

  // Cho phép bấm trực tiếp vào toast để tắt ngay
  const dismiss = () => {
    if (toast._dismissed) return;
    toast._dismissed = true;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px) scale(0.96)';
    setTimeout(() => toast.remove(), 200);
  };

  toast.onclick = dismiss;

  container.appendChild(toast);

  setTimeout(dismiss, duration);
}


