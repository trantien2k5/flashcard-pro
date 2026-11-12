/**
 * Study Overlay Shell Renderer
 * Dựng bộ khung HTML DOM cho màn hình học Flashcard 3D và các Drawer tùy chọn
 */

let _studyOverlayEl = null;

export function getStudyOverlay() {
  if (!_studyOverlayEl || !_studyOverlayEl.isConnected) {
    _studyOverlayEl = document.getElementById('study-overlay');
  }
  return _studyOverlayEl;
}

export function renderStudyOverlayShell() {
  let overlay = getStudyOverlay();
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'study-overlay';
    overlay.className = 'study-overlay';
    document.body.appendChild(overlay);
    _studyOverlayEl = overlay;
  }

  if (!overlay.querySelector('.study-header-bar')) {
    overlay.innerHTML = `
      <!-- Minimalist Header Bar (Tích hợp Thanh đếm thời gian & Thống kê phiên học) -->
      <header class="study-header-bar">
        <div class="study-header-inner">
          <button id="btn-study-close" class="btn-study-exit" title="Thoát phiên học (Esc)" aria-label="Đóng phiên học">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Nút Thay Đổi Thứ Tự Ưu Tiên Học (Priority Switcher) -->
          <div class="study-header-priority-wrap">
            <button type="button" id="btn-study-priority" class="btn-study-priority" title="Thay đổi thứ tự ưu tiên học" aria-haspopup="true">
              <span class="priority-icon" id="study-priority-icon">🎯</span>
              <span class="priority-label" id="study-priority-label">Cần ôn</span>
              <svg class="priority-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>

          <!-- Right Action: 3 Dots Menu for Study Options -->
          <div class="study-header-right">
            <button id="btn-study-menu" class="btn-study-icon" title="Tùy chọn phiên học" aria-label="Tùy chọn phiên học">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Study Canvas Center Area -->
      <main class="study-body-wrapper">

        <div class="flashcard-stage">
          <div id="flashcard-element" class="flashcard-3d-wrapper" role="button" tabindex="0" aria-label="Thẻ học từ vựng">
            
            <!-- ================= MẶT TRƯỚC (FRONT FACE) ================= -->
            <div class="flashcard-face face-front">
              <!-- Top Minimal Status Badge & Top-Right Badges -->
              <div class="card-top-bar">
                <div class="card-top-left-wrap">
                  <div class="card-status-badge state-new" id="card-front-status-badge">
                    <span class="status-dot"></span>
                    <span class="status-text" id="card-front-status-text">Từ mới</span>
                  </div>
                  <button type="button" class="btn-card-info" id="btn-card-info-front" title="Xem thông tin tiến trình học" aria-label="Xem thông tin tiến trình học">!</button>
                </div>
                <div class="card-front-top-right">
                  <div class="card-badges-row" id="card-front-badges-wrap">
                    <span class="card-pos-tag" id="card-pos-badge-front">WORD</span>
                    <span class="card-cefr-tag" id="card-cefr-badge-front">A1</span>
                  </div>
                </div>
              </div>

              <!-- Hình ảnh minh họa (nếu từ vựng có ảnh) -->
              <div class="card-image-container" id="card-front-img-container" style="display: none;">
                <img id="card-front-img" class="fc-image" alt="Visual representation" />
              </div>

              <!-- Cụm Từ Vựng Chính Giữa (Vibrant Focus Layout - Cho Chế Độ Lật Thẻ) -->
              <div class="card-word-center" id="card-front-flip-center">
                <!-- Nút loa dời lên đầu từ tiếng Anh sinh động, bắt mắt -->
                <button class="card-speaker-hero" id="btn-audio-speaker" type="button" title="Phát âm từ vựng" aria-label="Phát âm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </button>

                <!-- Từ vựng tiếng Anh to, rõ, font hiện đại -->
                <h2 class="card-word-title fc-title" id="card-front-word">...</h2>
                
                <!-- Phiên âm IPA -->
                <div class="card-meta-row" id="card-front-meta-row">
                  <span class="card-word-phonetic fc-phonetic" id="card-front-phonetic">/ ... /</span>
                </div>
              </div>

              <!-- Luyện Nghe Phản Xạ Mù (Audio Blind Waveform) -->
              <div class="card-audio-blind-wrap" id="card-audio-blind-wrap" style="display: none;">
                <div class="audio-wave-visualizer">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                <div class="audio-blind-prompt">🎧 Nghe kỹ âm thanh & đoán từ vựng</div>
              </div>

              <!-- Gợi ý ngữ cảnh khuyết từ (Contextual Cloze Deletion Hint - Trong Chế Độ Lật Thẻ) -->
              <div class="card-cloze-hint-container" id="card-cloze-hint-container" style="display: none;">
                <div class="card-cloze-pill" id="card-cloze-pill" title="Gợi ý câu ngữ cảnh khuyết từ">
                  <span class="cloze-icon">💡</span>
                  <span class="cloze-text" id="card-cloze-text">...</span>
                </div>
              </div>

            </div>

            <!-- ================= MẶT SAU (BACK FACE) ================= -->
            <div class="flashcard-face face-back">
              <!-- Top Context: Từ gốc tiếng Anh & Loa mini -->
              <div class="card-top-bar">
                <div class="card-back-context-word">
                  <span class="back-word-label" id="card-back-word-context-text">...</span>
                  <button class="btn-card-audio-mini" id="btn-audio-speaker-back" type="button" title="Nghe lại phát âm" aria-label="Nghe lại phát âm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                  </button>
                  <button type="button" class="btn-card-info" id="btn-card-info-back" title="Xem thông tin tiến trình học" aria-label="Xem thông tin tiến trình học">!</button>
                </div>
                <div class="card-back-badges" id="card-back-badges-wrap" style="display: none;">
                  <span class="card-pos-tag" id="card-pos-badge-back">WORD</span>
                  <span class="card-cefr-tag" id="card-cefr-badge-back">A1</span>
                </div>
              </div>

              <!-- Cụm Nội Dung Mặt Sau Chính Giữa (Cân bằng & Tự động Căn Giữa khi ẩn Định nghĩa/Ví dụ) -->
              <div class="card-back-center" id="card-back-center">
                <!-- Nghĩa Tiếng Việt Chủ Đạo -->
                <div class="card-meaning-hero">
                  <h3 class="card-back-meaning fc-meaning" id="card-back-meaning">...</h3>
                </div>

                <!-- Định nghĩa Tiếng Anh -->
                <div class="card-back-def-box" id="card-back-def-box" style="display: none;">
                  <p class="card-back-def fc-def" id="card-back-def">...</p>
                </div>

                <!-- Câu ví dụ tiếng Anh (Italic) & Bản dịch bên dưới -->
                <div class="card-back-example fc-example" id="card-back-example-box" style="display: none;">
                  <div class="example-top-header" id="example-top-header">
                    <span class="example-label-tag">Ví dụ</span>
                    <button class="btn-example-audio" id="btn-example-audio" type="button" title="Đọc câu ví dụ" aria-label="Phát âm câu ví dụ">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                      </svg>
                    </button>
                  </div>
                  <p class="card-example-en" id="card-back-example">...</p>
                  <p class="card-example-vi" id="card-back-example-vi">...</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Cụm Nút Điều Khiển Gần Thẻ -->
        <div class="study-bottom-controls" id="study-controls-wrapper">
          
          <!-- 1. Gợi ý Vuốt Thẻ Lật Dọc ở Mặt Trước (Đã ẩn theo yêu cầu người dùng) -->
          <div id="front-flip-control" class="front-flip-control" style="display: none !important;">
            <div class="swipe-flip-hint" id="btn-main-flip" role="button" tabindex="0" title="Vuốt lên để lật thẻ" style="display: none !important;"></div>
          </div>

          <!-- 2. Cụm 4 Nút Đánh Giá Anki/FSRS: Vibrant Solid Tint -->
          <div id="fsrs-buttons-container" class="fsrs-buttons-grid">
            <button class="btn-fsrs-rating again" data-rating="1" title="Again (Phím 1)">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-title">Again</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-again">1m</span>
            </button>

            <button class="btn-fsrs-rating hard" data-rating="2" title="Hard (Phím 2)">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-title">Hard</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-hard">10m</span>
            </button>

            <button class="btn-fsrs-rating good" data-rating="3" title="Good (Phím 3)">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-title">Good</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-good">1d</span>
            </button>

            <button class="btn-fsrs-rating easy" data-rating="4" title="Easy (Phím 4)">
              <div class="fsrs-btn-top">
                <span class="fsrs-rating-title">Easy</span>
              </div>
              <span class="fsrs-badge-interval" id="interval-easy">4d</span>
            </button>
          </div>
        </div>
      </main>

      <!-- Drawer / Modal Tùy chọn học tập Menu 3 Chấm -->
      <div class="study-prefs-drawer" id="study-prefs-drawer">
        <div class="study-prefs-backdrop" id="study-prefs-backdrop"></div>
        <div class="study-prefs-content">
          <div class="prefs-header">
            <div class="prefs-title-wrap">
              <span class="prefs-icon">⚙️</span>
              <h3 class="prefs-title">Tùy chọn phiên học</h3>
            </div>
            <button class="btn-prefs-close" id="btn-prefs-close" title="Đóng bảng tùy chọn" aria-label="Đóng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <p class="prefs-desc">Tùy chỉnh chế độ học, nhịp độ và cấu hình hiển thị thẻ FSRS:</p>

          <div class="prefs-list">
            <!-- 1. Chế độ ôn tập -->
            <div class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🎮 Chế độ ôn</span>
                <span class="pref-sub">Chọn phương pháp học trong phiên</span>
              </div>
              <select id="pref-select-study-mode" class="pref-select-dropdown">
                <option value="flashcard" selected>🎴 Thẻ Flashcard 3D</option>
                <option value="quiz">🎯 Trắc nghiệm (Quiz)</option>
              </select>
            </div>

            <!-- 1b. Kiểu nút tự chấm điểm FSRS -->
            <div class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🔘 Kiểu nút tự chấm</span>
                <span class="pref-sub">Chọn số lượng nút đánh giá khi lật thẻ</span>
              </div>
              <select id="pref-select-buttons-mode" class="pref-select-dropdown">
                <option value="2_buttons" selected>⚡ 2 nút (Tối giản: Quên / Nhớ)</option>
                <option value="4_buttons">📊 4 nút (Chi tiết: Anki / FSRS)</option>
              </select>
            </div>

            <!-- 2. Tự động phát âm -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🔊 Tự động phát âm</span>
                <span class="pref-sub">Tự động đọc từ khi xuất hiện thẻ mới</span>
              </div>
              <input type="checkbox" id="pref-toggle-autoplay" class="toggle-checkbox">
            </label>

            <!-- 3. Giọng phát âm -->
            <div class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🗣️ Giọng đọc tiếng Anh</span>
                <span class="pref-sub">Chọn giọng bản xứ chuẩn Mỹ / Anh</span>
              </div>
              <select id="pref-select-accent" class="pref-select-dropdown">
                <option value="us">🇺🇸 Giọng Mỹ (US)</option>
                <option value="uk">🇬🇧 Giọng Anh (UK)</option>
              </select>
            </div>

            <!-- 4. Hình ảnh minh họa -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🖼️ Hình ảnh minh họa</span>
                <span class="pref-sub">Hiển thị hình ảnh minh họa ở mặt trước</span>
              </div>
              <input type="checkbox" id="pref-toggle-show-image" class="toggle-checkbox">
            </label>

            <!-- 5. Phiên âm IPA -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🔤 Phiên âm quốc tế IPA</span>
                <span class="pref-sub">Hiển thị ký hiệu phát âm ở mặt trước</span>
              </div>
              <input type="checkbox" id="pref-toggle-show-phonetic" class="toggle-checkbox">
            </label>

            <!-- 6. Từ loại & Trình độ CEFR -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🏷️ Từ loại & Trình độ CEFR</span>
                <span class="pref-sub">Hiển thị nhãn loại từ và CEFR (A1-C1)</span>
              </div>
              <input type="checkbox" id="pref-toggle-show-pos" class="toggle-checkbox">
            </label>

            <!-- 7. Câu ví dụ tiếng Anh -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">💬 Câu ví dụ tiếng Anh</span>
                <span class="pref-sub">Hiển thị câu ví dụ ngữ cảnh ở mặt sau</span>
              </div>
              <input type="checkbox" id="pref-toggle-show-example" class="toggle-checkbox">
            </label>

            <!-- 8. Dịch nghĩa câu ví dụ -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🇻🇳 Dịch nghĩa câu ví dụ</span>
                <span class="pref-sub">Hiển thị bản dịch tiếng Việt của ví dụ</span>
              </div>
              <input type="checkbox" id="pref-toggle-show-example-vi" class="toggle-checkbox">
            </label>

            <!-- 9. Định nghĩa Anh - Anh -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">📖 Định nghĩa Anh - Anh</span>
                <span class="pref-sub">Hiển thị giải thích nghĩa bằng tiếng Anh</span>
              </div>
              <input type="checkbox" id="pref-toggle-show-def" class="toggle-checkbox">
            </label>

            <!-- 10. Chờ suy nghĩ mặt trước -->
            <div class="pref-item">
              <div class="pref-info">
                <span class="pref-label">⏱️ Chờ suy nghĩ (Mặt trước)</span>
                <span class="pref-sub">Đếm ngược trước khi mở nút lật đáp án</span>
              </div>
              <select id="pref-select-think-delay" class="pref-select-dropdown">
                <option value="0">Tắt (0s - Lật tức thì)</option>
                <option value="1">1 giây</option>
                <option value="2">2 giây</option>
                <option value="3">3 giây</option>
                <option value="5">5 giây</option>
              </select>
            </div>

            <!-- 11. Khóa chống bấm nhầm mặt sau -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">🛡️ Khóa chống bấm nhầm (Mặt sau)</span>
                <span class="pref-sub">Khóa nút đánh giá 1.2s để xem kỹ đáp án</span>
              </div>
              <input type="checkbox" id="pref-toggle-back-lock" class="toggle-checkbox">
            </label>

            <!-- 12. Gợi ý ngữ cảnh khuyết từ -->
            <label class="pref-item">
              <div class="pref-info">
                <span class="pref-label">💡 Gợi ý ngữ cảnh khuyết từ</span>
                <span class="pref-sub">Hiện câu ví dụ ẩn từ khóa ở mặt trước</span>
              </div>
              <input type="checkbox" id="pref-toggle-show-cloze" class="toggle-checkbox">
            </label>
          </div>

          <div class="prefs-card-actions-section">
            <h4 class="prefs-section-subtitle">Thao tác thẻ hiện tại</h4>
            <div class="prefs-actions-grid">
              <button type="button" class="btn-study-card-action" id="btn-action-reset-card" title="Đặt lại từ đầu">
                <span class="action-icon">🔄</span>
                <div class="action-text">
                  <span class="action-title">Đặt lại tiến độ thẻ</span>
                  <span class="action-desc">Xóa lịch sử về Từ mới</span>
                </div>
              </button>
            </div>
          </div>

          <div class="prefs-footer">
            <button type="button" class="btn-reset-prefs" id="btn-reset-prefs">
              🔄 Khôi phục mặc định
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Drawer / Modal Tùy chỉnh Tự động học (Auto-Play) -->
      <div class="study-autoplay-modal" id="study-autoplay-modal">
        <div class="study-autoplay-backdrop" id="study-autoplay-backdrop"></div>
        <div class="study-autoplay-content">
          <div class="autoplay-modal-header">
            <div class="autoplay-title-wrap">
              <span class="autoplay-modal-icon">⚡</span>
              <h3 class="autoplay-modal-title">Tự động học (Auto-Play)</h3>
            </div>
            <button class="btn-autoplay-modal-close" id="btn-autoplay-modal-close" title="Đóng bảng cài đặt" aria-label="Đóng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <p class="autoplay-modal-desc">Học rảnh tay: tự động phát âm tiếng Anh, chờ suy nghĩ, lật thẻ và đọc nghĩa tiếng Việt. Duy trì chuỗi ngày học (Streak) và giữ nguyên lịch ôn tập FSRS của thẻ.</p>

          <div class="autoplay-settings-list">
            <!-- 1. Delay mặt trước -->
            <div class="autoplay-setting-item">
              <div class="autoplay-setting-info">
                <span class="autoplay-setting-label">⏱️ Chờ suy nghĩ (Mặt trước)</span>
                <span class="autoplay-setting-sub">Thời gian dừng để nhớ từ trước khi lật</span>
              </div>
              <div class="stepper-wrap">
                <button class="btn-stepper" id="btn-front-delay-minus" type="button" title="Giảm 0.5s" aria-label="Giảm">−</button>
                <span class="stepper-value" id="val-front-delay">3.0s</span>
                <button class="btn-stepper" id="btn-front-delay-plus" type="button" title="Tăng 0.5s" aria-label="Tăng">+</button>
              </div>
            </div>

            <!-- 2. Delay mặt sau -->
            <div class="autoplay-setting-item">
              <div class="autoplay-setting-info">
                <span class="autoplay-setting-label">📖 Chờ tiếp thu (Mặt sau)</span>
                <span class="autoplay-setting-sub">Thời gian xem nghĩa trước khi sang từ mới</span>
              </div>
              <div class="stepper-wrap">
                <button class="btn-stepper" id="btn-back-delay-minus" type="button" title="Giảm 0.5s" aria-label="Giảm">−</button>
                <span class="stepper-value" id="val-back-delay">2.5s</span>
                <button class="btn-stepper" id="btn-back-delay-plus" type="button" title="Tăng 0.5s" aria-label="Tăng">+</button>
              </div>
            </div>

            <!-- 3. Phát âm tiếng Việt -->
            <label class="autoplay-setting-item clickable">
              <div class="autoplay-setting-info">
                <span class="autoplay-setting-label"><svg class="flag-icon-vn" width="18" height="12" viewBox="0 0 30 20" fill="none"><rect width="30" height="20" rx="2" fill="#DA251D"/><polygon points="15,4 16.545,8.755 21.548,8.755 17.501,11.695 19.046,16.45 15,13.51 10.954,16.45 12.499,11.695 8.452,8.755 13.455,8.755" fill="#FFFF00"/></svg> Đọc nghĩa Tiếng Việt</span>
                <span class="autoplay-setting-sub">Tự động phát âm bản dịch tiếng Việt ở mặt sau</span>
              </div>
              <input type="checkbox" id="toggle-autoplay-speak-vi" class="toggle-checkbox">
            </label>

            <!-- 4. Lặp vô tận -->
            <label class="autoplay-setting-item clickable">
              <div class="autoplay-setting-info">
                <span class="autoplay-setting-label">🔁 Lặp lại khi hết thẻ</span>
                <span class="autoplay-setting-sub">Tự động quay lại từ đầu khi kết thúc danh sách</span>
              </div>
              <input type="checkbox" id="toggle-autoplay-loop" class="toggle-checkbox">
            </label>
          </div>

          <!-- Nút bắt đầu / tạm dừng lớn -->
          <div class="autoplay-modal-footer">
            <button id="btn-autoplay-main-action" class="btn-autoplay-main-action is-start" type="button">
              <span class="action-icon">▶️</span>
              <span class="action-text">Bắt đầu tự động học</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Modal Chọn Thứ Tự Ưu Tiên Học (Priority Switcher Modal) -->
      <div class="study-priority-modal" id="study-priority-modal">
        <div class="study-priority-backdrop" id="study-priority-backdrop"></div>
        <div class="study-priority-content">
          <div class="priority-modal-header">
            <div class="priority-title-wrap">
              <span class="priority-modal-icon">🎯</span>
              <h3 class="priority-modal-title">Thứ tự ưu tiên học</h3>
            </div>
            <button type="button" class="btn-priority-modal-close" id="btn-priority-modal-close" aria-label="Đóng">✕</button>
          </div>
          <div class="priority-options-list">
            <button type="button" class="priority-option-btn active" data-mode="due_first">
              <span class="priority-opt-icon">🎯</span>
              <div class="priority-opt-info">
                <span class="priority-opt-name">Cần ôn (Mặc định)</span>
                <span class="priority-opt-desc">Ôn thẻ đến hạn FSRS kết hợp xen kẽ từ mới (5 : 1)</span>
              </div>
              <span class="priority-opt-check">✓</span>
            </button>
            <button type="button" class="priority-option-btn" data-mode="new_only">
              <span class="priority-opt-icon">🌱</span>
              <div class="priority-opt-info">
                <span class="priority-opt-name">Ưu tiên từ mới</span>
                <span class="priority-opt-desc">Chỉ học các từ vựng mới chưa từng học</span>
              </div>
              <span class="priority-opt-check">✓</span>
            </button>
            <button type="button" class="priority-option-btn" data-mode="weak_hunter">
              <span class="priority-opt-icon">🔥</span>
              <div class="priority-opt-info">
                <span class="priority-opt-name">Ưu tiên từ khó</span>
                <span class="priority-opt-desc">Tập trung diệt từ hay quên (quên ≥ 2 lần, R &lt; 0.65)</span>
              </div>
              <span class="priority-opt-check">✓</span>
            </button>
            <button type="button" class="priority-option-btn" data-mode="sprint_10">
              <span class="priority-opt-icon">⚡</span>
              <div class="priority-opt-info">
                <span class="priority-opt-name">Tốc chiến 10 từ</span>
                <span class="priority-opt-desc">Phiên học nhanh 10 từ cấp bách nhất</span>
              </div>
              <span class="priority-opt-check">✓</span>
            </button>
            <button type="button" class="priority-option-btn" data-mode="audio_blind">
              <span class="priority-opt-icon">🎧</span>
              <div class="priority-opt-info">
                <span class="priority-opt-name">Luyện nghe</span>
                <span class="priority-opt-desc">Ẩn chữ mặt trước, chỉ nghe âm thanh để đoán</span>
              </div>
              <span class="priority-opt-check">✓</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Checkpoint đã được lược bỏ để học liên tục không bị ngắt quãng -->
    `;
  }
}
