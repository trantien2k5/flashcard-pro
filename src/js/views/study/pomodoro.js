/**
 * Study Pomodoro Focus Tracker
 * Điều phối phiên học tập trung theo phương pháp Pomodoro (5p - 60p)
 */

const POMODORO_STORAGE_KEY = 'flashcard_pomodoro_duration_min';

let _pomodoroState = {
  durationMinutes: 25,
  elapsedSeconds: 0,
  isRunning: false,
  cardsReviewed: 0,
  hasNotifiedGoal: false,
  intervalId: null
};

export function initPomodoroTracker(app) {
  try {
    const savedDuration = Number(localStorage.getItem(POMODORO_STORAGE_KEY)) || 25;
    _pomodoroState.durationMinutes = savedDuration;
    _pomodoroState.elapsedSeconds = 0;
    _pomodoroState.cardsReviewed = 0;
    _pomodoroState.hasNotifiedGoal = false;
    _pomodoroState.isRunning = true;

    const selectEl = document.getElementById('pomodoro-duration-select');
    if (selectEl) {
      selectEl.value = String(savedDuration);
      if (!selectEl._bound) {
        selectEl._bound = true;
        selectEl.addEventListener('change', (e) => {
          const val = Number(e.target.value) || 25;
          localStorage.setItem(POMODORO_STORAGE_KEY, String(val));
          _pomodoroState.durationMinutes = val;
          _pomodoroState.elapsedSeconds = 0;
          _pomodoroState.cardsReviewed = 0;
          _pomodoroState.hasNotifiedGoal = false;
          _pomodoroState.isRunning = true;
          updatePomodoroUI();
        });
      }
    }

    const btnToggle = document.getElementById('btn-pomodoro-toggle');
    if (btnToggle && !btnToggle._bound) {
      btnToggle._bound = true;
      btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        _pomodoroState.isRunning = !_pomodoroState.isRunning;
        updatePomodoroUI();
      });
    }

    const btnReset = document.getElementById('btn-pomodoro-reset');
    if (btnReset && !btnReset._bound) {
      btnReset._bound = true;
      btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        _pomodoroState.elapsedSeconds = 0;
        _pomodoroState.cardsReviewed = 0;
        _pomodoroState.hasNotifiedGoal = false;
        _pomodoroState.isRunning = true;
        updatePomodoroUI();
        if (app && app.showToast) {
          app.showToast('🔄 Đã đặt lại thời gian phiên học', 'info', 1500);
        }
      });
    }

    startPomodoroTicker(app);
    updatePomodoroUI();
  } catch (err) {
    console.error('Lỗi initPomodoroTracker:', err);
  }
}

function startPomodoroTicker(app) {
  if (_pomodoroState.intervalId) {
    clearInterval(_pomodoroState.intervalId);
    _pomodoroState.intervalId = null;
  }

  _pomodoroState.intervalId = setInterval(() => {
    if (!_pomodoroState.isRunning) return;

    _pomodoroState.elapsedSeconds++;
    const targetSecs = _pomodoroState.durationMinutes * 60;

    // Chỉ thông báo DUY NHẤT 1 lần khi đạt mốc mục tiêu
    if (_pomodoroState.elapsedSeconds >= targetSecs && !_pomodoroState.hasNotifiedGoal) {
      _pomodoroState.hasNotifiedGoal = true;
      updatePomodoroUI();
      if (app && app.showToast) {
        app.showToast(`🎉 Xuất sắc! Bạn đã hoàn thành mục tiêu ${_pomodoroState.durationMinutes} phút và ôn được ${_pomodoroState.cardsReviewed} thẻ!`, 'success', 5000);
      }
    } else {
      updatePomodoroUI();
    }
  }, 1000);
}

export function stopPomodoroTracker() {
  if (_pomodoroState.intervalId) {
    clearInterval(_pomodoroState.intervalId);
    _pomodoroState.intervalId = null;
  }
  _pomodoroState.isRunning = false;
}

export function recordPomodoroCardReviewed() {
  _pomodoroState.cardsReviewed++;
  const elCount = document.getElementById('pomodoro-cards-count');
  if (elCount) {
    elCount.textContent = String(_pomodoroState.cardsReviewed);
  }
}

function updatePomodoroUI() {
  const elCountdown = document.getElementById('pomodoro-countdown');
  const elCount = document.getElementById('pomodoro-cards-count');
  const elIcon = document.getElementById('pomodoro-play-icon');
  const elFill = document.getElementById('pomodoro-progress-fill');
  const elBar = document.getElementById('study-pomodoro-bar');

  const totalSecs = Math.max(1, _pomodoroState.durationMinutes * 60);
  const elapsedSecs = Math.max(0, _pomodoroState.elapsedSeconds);

  // Đếm tăng dần: 00:00 -> 00:01 -> ...
  const m = Math.floor(elapsedSecs / 60);
  const s = elapsedSecs % 60;
  const timeFormatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  if (elCountdown) elCountdown.textContent = timeFormatted;
  if (elCount) elCount.textContent = String(_pomodoroState.cardsReviewed);
  if (elIcon) elIcon.textContent = _pomodoroState.isRunning ? '⏸️' : '▶️';

  // Tiến độ tăng dần từ 0% lên 100%
  const pct = Math.min(100, (elapsedSecs / totalSecs) * 100);
  if (elFill) elFill.style.width = `${pct}%`;

  if (elBar) {
    elBar.classList.toggle('is-paused', !_pomodoroState.isRunning);
  }
}
