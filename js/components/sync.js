import { SyncManager, SimpleQRCode } from '../sync-manager.js';
import { StorageManager } from '../storage.js';
import { showToast } from './feedback.js';

let _currentHostSession = null;
let _cameraStream = null;
let _cameraScanRaf = null;
let _scannerCanvas = null;
let _scannerCtx = null;
let _isScanning = false;
let _jsQRLoaderPromise = null;

/**
 * Tải jsQR fallback cho iOS / trình duyệt không có BarcodeDetector
 */
function getJsQR() {
  if (window.jsQR) return Promise.resolve(window.jsQR);
  if (_jsQRLoaderPromise) return _jsQRLoaderPromise;
  _jsQRLoaderPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.onload = () => resolve(window.jsQR);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return _jsQRLoaderPromise;
}

/**
 * Khởi tạo Controller Đồng bộ 2 Chiều Thông Minh
 */
export function setupSyncController(app) {
  const modal = document.getElementById('sync-modal');
  if (!modal) return;

  // Nút đóng modal
  const btnClose = document.getElementById('btn-close-sync-modal');
  if (btnClose) {
    btnClose.onclick = () => closeSyncModal();
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSyncModal();
  });

  // Nút Bật Camera quét mã máy kia
  const btnStartCamera = document.getElementById('btn-start-camera');
  const btnStopCamera = document.getElementById('btn-stop-camera');

  if (btnStartCamera) {
    btnStartCamera.onclick = async () => {
      await startCameraScanner(app);
    };
  }

  if (btnStopCamera) {
    btnStopCamera.onclick = () => {
      stopCameraScanner();
    };
  }

  // Nút Đổi mã mới
  const btnRefreshPair = document.getElementById('btn-sync-refresh-pair');
  if (btnRefreshPair) {
    btnRefreshPair.onclick = () => {
      startHostSession(app);
      showToast('Đã tạo mã kết nối mới 🔄', 'info', 2000);
    };
  }

  // Nút Toggle nhập PIN tay
  const btnToggleManual = document.getElementById('btn-sync-toggle-manual');
  const manualBox = document.getElementById('sync-manual-box');
  if (btnToggleManual && manualBox) {
    btnToggleManual.onclick = () => {
      const isHidden = manualBox.style.display === 'none';
      manualBox.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        document.getElementById('input-sync-pin')?.focus();
      }
    };
  }

  // Nút Submit PIN tay
  const btnManualSubmit = document.getElementById('btn-sync-manual-submit');
  const inputSyncPin = document.getElementById('input-sync-pin');
  if (btnManualSubmit && inputSyncPin) {
    btnManualSubmit.onclick = async () => {
      const pin = inputSyncPin.value.trim();
      if (!pin) {
        showToast('Vui lòng nhập mã PIN trên máy kia!', 'error');
        return;
      }

      btnManualSubmit.disabled = true;
      btnManualSubmit.textContent = '⏳ ...';

      try {
        const res = await SyncManager.executeClientHandshake(pin);
        if (res.success) {
          app.settings = StorageManager.getSettings();
          app.applyTheme(app.settings.theme || 'light');
          app.refreshAllViews();

          showToast(`🎉 Đồng bộ 2 chiều thành công! Cả 2 máy đã cập nhật.`, 'success', 5000);
          inputSyncPin.value = '';
          closeSyncModal();
        } else {
          showToast(res.error || 'Kết nối thất bại, vui lòng thử lại.', 'error');
        }
      } catch (err) {
        console.error('Lỗi sync PIN:', err);
        showToast('Có lỗi xảy ra khi truyền dữ liệu.', 'error');
      } finally {
        btnManualSubmit.disabled = false;
        btnManualSubmit.textContent = 'Bắt đầu 🚀';
      }
    };
  }
}

/**
 * Khởi tạo trạm chờ trên máy hiện tại
 */
function startHostSession(app) {
  stopHostSession();

  const qrImg = document.getElementById('sync-qr-image');
  const qrLoading = document.getElementById('sync-qr-loading');
  const pinDisplay = document.getElementById('sync-pin-display');
  const statusText = document.getElementById('sync-receiver-status-text');

  if (qrLoading) qrLoading.style.display = 'block';
  if (qrImg) qrImg.style.display = 'none';
  if (pinDisplay) pinDisplay.textContent = '⏳ ...';
  if (statusText) statusText.textContent = 'Sẵn sàng kết nối 2 chiều...';

  _currentHostSession = SyncManager.startUniversalHostSession({
    onConnected: ({ pin, pairUrl }) => {
      if (pinDisplay) {
        pinDisplay.textContent = `${pin.slice(0, 3)} ${pin.slice(3)}`;
      }
      if (qrImg) {
        qrImg.src = SimpleQRCode.generateURL(pairUrl, 260);
        qrImg.onload = () => {
          if (qrLoading) qrLoading.style.display = 'none';
          qrImg.style.display = 'block';
        };
      }
      if (statusText) {
        statusText.textContent = 'Sẵn sàng kết nối 2 chiều...';
      }
    },
    onSyncCompleted: ({ pin, stats }) => {
      if (statusText) {
        statusText.textContent = '🎉 Đã đồng bộ 2 chiều thành công!';
      }

      app.settings = StorageManager.getSettings();
      app.applyTheme(app.settings.theme || 'light');
      app.refreshAllViews();

      showToast(`🎉 Đồng bộ 2 chiều thành công! Đã gộp ${stats.total} thẻ FSRS`, 'success', 5000);
      
      setTimeout(() => {
        closeSyncModal();
      }, 1500);
    },
    onError: (err) => {
      if (statusText) statusText.textContent = 'Đang đợi kết nối...';
    }
  });
}

/**
 * Ngắt trạm chờ
 */
function stopHostSession() {
  if (_currentHostSession) {
    _currentHostSession.stop();
    _currentHostSession = null;
  }
}

/**
 * Bật Camera quét mã QR thời gian thực
 */
async function startCameraScanner(app) {
  const cameraWrapper = document.getElementById('camera-scanner-wrapper');
  const video = document.getElementById('sync-camera-video');
  const btnStartCamera = document.getElementById('btn-start-camera');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('Trình duyệt không hỗ trợ mở Camera trực tiếp.', 'error');
    return;
  }

  try {
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    _cameraStream = await navigator.mediaDevices.getUserMedia(constraints);

    if (video) {
      video.srcObject = _cameraStream;
      video.setAttribute('playsinline', 'true');
      await video.play();
    }

    if (cameraWrapper) cameraWrapper.style.display = 'block';
    if (btnStartCamera) btnStartCamera.style.display = 'none';

    if (!_scannerCanvas) {
      _scannerCanvas = document.createElement('canvas');
      _scannerCtx = _scannerCanvas.getContext('2d', { willReadFrequently: true });
    }

    let barcodeDetector = null;
    if ('BarcodeDetector' in window) {
      try {
        barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch (e) {}
    }
    if (!barcodeDetector) {
      getJsQR();
    }

    _isScanning = true;
    let lastScanTime = 0;

    const scanFrame = async (timestamp) => {
      if (!_isScanning) return;

      if (timestamp - lastScanTime > 100 && video && video.readyState === video.HAVE_ENOUGH_DATA) {
        lastScanTime = timestamp;

        let detectedCode = null;

        // 1. Native BarcodeDetector
        if (barcodeDetector) {
          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              detectedCode = barcodes[0].rawValue;
            }
          } catch (e) {}
        }

        // 2. Fallback jsQR
        if (!detectedCode && _scannerCtx && video.videoWidth > 0 && window.jsQR) {
          const w = Math.min(video.videoWidth, 640);
          const h = Math.round((w / video.videoWidth) * video.videoHeight);
          
          if (_scannerCanvas.width !== w || _scannerCanvas.height !== h) {
            _scannerCanvas.width = w;
            _scannerCanvas.height = h;
          }

          _scannerCtx.drawImage(video, 0, 0, w, h);
          const imageData = _scannerCtx.getImageData(0, 0, w, h);
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            detectedCode = code.data;
          }
        }

        if (detectedCode) {
          _isScanning = false;
          if (navigator.vibrate) {
            try { navigator.vibrate([40, 60, 40]); } catch (e) {}
          }
          showToast('Đã quét được mã! 🎯 Đang bắt tay đồng bộ 2 chiều...', 'info');
          stopCameraScanner();

          // Thực hiện bắt tay 2 chiều ngay lập tức
          const res = await SyncManager.executeClientHandshake(detectedCode);
          if (res.success) {
            app.settings = StorageManager.getSettings();
            app.applyTheme(app.settings.theme || 'light');
            app.refreshAllViews();

            showToast(`🎉 Đồng bộ 2 chiều thành công! Cả 2 máy đã cập nhật bài học mới nhất.`, 'success', 5000);
            closeSyncModal();
          } else {
            showToast(res.error || 'Đồng bộ thất bại, vui lòng thử lại.', 'error');
          }
          return;
        }
      }

      if (_isScanning) {
        _cameraScanRaf = requestAnimationFrame(scanFrame);
      }
    };

    _cameraScanRaf = requestAnimationFrame(scanFrame);
    showToast('Hướng camera về mã QR trên máy kia 📷', 'info', 3000);
  } catch (err) {
    console.error('Lỗi mở Camera:', err);
    showToast('Không thể truy cập camera. Vui lòng cấp quyền Camera trong cài đặt.', 'error');
    stopCameraScanner();
  }
}

/**
 * Tắt Camera Scanner
 */
function stopCameraScanner() {
  _isScanning = false;

  if (_cameraScanRaf) {
    cancelAnimationFrame(_cameraScanRaf);
    _cameraScanRaf = null;
  }

  if (_cameraStream) {
    _cameraStream.getTracks().forEach(track => track.stop());
    _cameraStream = null;
  }

  const cameraWrapper = document.getElementById('camera-scanner-wrapper');
  const btnStartCamera = document.getElementById('btn-start-camera');
  const video = document.getElementById('sync-camera-video');

  if (video) video.srcObject = null;
  if (cameraWrapper) cameraWrapper.style.display = 'none';
  if (btnStartCamera) btnStartCamera.style.display = 'block';
}

/**
 * Mở Modal Đồng bộ (Tự động bật trạm chờ nhận)
 */
export function openSyncModal(app) {
  const modal = document.getElementById('sync-modal');
  if (!modal) return;
  modal.classList.add('active');

  const manualBox = document.getElementById('sync-manual-box');
  if (manualBox) manualBox.style.display = 'none';

  startHostSession(app);
}

/**
 * Đóng Modal Đồng bộ
 */
export function closeSyncModal() {
  stopCameraScanner();
  stopHostSession();
  const modal = document.getElementById('sync-modal');
  if (modal) {
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove('active');
  }
}
