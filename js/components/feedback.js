/**
 * Toast and Confirmation Modal Utilities
 */

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

    const cleanup = () => {
      modal.classList.remove('active');
      if (btnOk) btnOk.onclick = null;
      if (btnCancel) btnCancel.onclick = null;
      if (btnCloseModal) btnCloseModal.onclick = null;
      modal.onclick = null;
    };

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
      };
    };
  });
}

/**
 * Upgraded In-App Floating Toast Notification (thay tháº¿ window.alert)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'OK',
    info: 'i',
    warning: '!',
    error: 'x'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.textContent = icons[type] || icons.info;

  const contentEl = document.createElement('div');
  contentEl.className = 'toast-content';
  contentEl.textContent = String(message || '');

  toast.append(iconEl, contentEl);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-12px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
