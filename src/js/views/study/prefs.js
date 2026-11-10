/**
 * Study Preferences & Configuration Controller
 * Quản lý cấu hình hiển thị, chế độ nút đánh giá & tùy chọn Autoplay
 */

// ==========================================
// CẤU HÌNH TỰ ĐỘNG HỌC (AUTO-PLAY CONFIG & PREFS)
// ==========================================
export const DEFAULT_AUTOPLAY_CONFIG = {
  frontDelaySec: 3.0,     // Giây dừng ở mặt trước để suy nghĩ
  backDelaySec: 2.5,      // Giây dừng ở mặt sau để tiếp thu
  speakVi: true,          // Phát âm nghĩa tiếng Việt ở mặt sau
  loopList: false         // Tự động lặp lại vô tận khi hết danh sách
};

export function getAutoPlayPrefs() {
  try {
    const raw = localStorage.getItem('study_autoplay_prefs');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        frontDelaySec: typeof parsed.frontDelaySec === 'number' ? parsed.frontDelaySec : DEFAULT_AUTOPLAY_CONFIG.frontDelaySec,
        backDelaySec: typeof parsed.backDelaySec === 'number' ? parsed.backDelaySec : DEFAULT_AUTOPLAY_CONFIG.backDelaySec,
        speakVi: parsed.speakVi !== undefined ? !!parsed.speakVi : DEFAULT_AUTOPLAY_CONFIG.speakVi,
        loopList: parsed.loopList !== undefined ? !!parsed.loopList : DEFAULT_AUTOPLAY_CONFIG.loopList
      };
    }
  } catch (e) {}
  return { ...DEFAULT_AUTOPLAY_CONFIG };
}

export function saveAutoPlayPrefs(prefs) {
  try {
    localStorage.setItem('study_autoplay_prefs', JSON.stringify(prefs));
  } catch (e) {}
}

// Cấu hình học tập (Mặc định: Từ tiếng Anh, Nghĩa tiếng Việt, Phiên âm, Từ loại, Câu ví dụ tiếng Anh)
export const DEFAULT_STUDY_PREFS = {
  studyMode: 'flashcard',    // 'flashcard' (lật thẻ)
  ratingButtonsMode: '2_buttons', // Mặc định 2 nút (Tối giản: Quên / Nhớ)
  showImage: false,          // Mặc định TẮT hình ảnh (tránh lỗi/chiếm diện tích)
  showPhonetic: true,        // Mặc định BẬT phiên âm IPA
  showDefinition: false,     // Mặc định TẮT định nghĩa tiếng Anh dài dòng
  showExample: true,         // Mặc định BẬT câu ví dụ tiếng Anh
  showExampleVi: false,      // Mặc định TẮT bản dịch câu ví dụ
  showPos: true,             // Mặc định BẬT từ loại (POS) & CEFR
  showCefr: true,            // Mặc định BẬT nhãn CEFR
  showCloze: true,           // Mặc định BẬT gợi ý ngữ cảnh khuyết từ
  autoplayAudio: true,
  audioAccent: 'us',
  showHint: true,
  thinkDelaySec: 0,          // Mặc định tắt (0s) lật tức thì
  enableBackLock: false      // Mặc định tắt khóa chống bấm nhầm mặt sau
};

export function getStudyPrefs() {
  try {
    const raw = localStorage.getItem('study_display_prefs');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STUDY_PREFS,
        studyMode: 'flashcard',
        ratingButtonsMode: parsed.ratingButtonsMode || DEFAULT_STUDY_PREFS.ratingButtonsMode,
        showImage: parsed.showImage !== undefined ? !!parsed.showImage : DEFAULT_STUDY_PREFS.showImage,
        showPhonetic: parsed.showPhonetic !== undefined ? !!parsed.showPhonetic : DEFAULT_STUDY_PREFS.showPhonetic,
        showDefinition: parsed.showDefinition !== undefined ? !!parsed.showDefinition : DEFAULT_STUDY_PREFS.showDefinition,
        showExample: parsed.showExample !== undefined ? !!parsed.showExample : DEFAULT_STUDY_PREFS.showExample,
        showExampleVi: parsed.showExampleVi !== undefined ? !!parsed.showExampleVi : DEFAULT_STUDY_PREFS.showExampleVi,
        showPos: parsed.showPos !== undefined ? !!parsed.showPos : DEFAULT_STUDY_PREFS.showPos,
        showCefr: parsed.showCefr !== undefined ? !!parsed.showCefr : DEFAULT_STUDY_PREFS.showCefr,
        showCloze: parsed.showCloze !== undefined ? !!parsed.showCloze : DEFAULT_STUDY_PREFS.showCloze,
        autoplayAudio: parsed.autoplayAudio !== undefined ? !!parsed.autoplayAudio : DEFAULT_STUDY_PREFS.autoplayAudio,
        audioAccent: parsed.audioAccent || DEFAULT_STUDY_PREFS.audioAccent,
        thinkDelaySec: parsed.thinkDelaySec !== undefined ? Number(parsed.thinkDelaySec) : DEFAULT_STUDY_PREFS.thinkDelaySec,
        enableBackLock: parsed.enableBackLock !== undefined ? !!parsed.enableBackLock : DEFAULT_STUDY_PREFS.enableBackLock
      };
    }
  } catch (e) {}
  return { ...DEFAULT_STUDY_PREFS };
}

export function saveStudyPrefs(prefs) {
  try {
    localStorage.setItem('study_display_prefs', JSON.stringify(prefs));
  } catch (e) {}
}

export function applyRatingButtonsMode(mode = '2_buttons') {
  const container = document.getElementById('fsrs-buttons-container');
  if (!container) return;
  const is2 = mode === '2_buttons';
  if (is2) {
    container.classList.add('mode-2-buttons');
    const titleAgain = container.querySelector('.btn-fsrs-rating.again .fsrs-rating-title');
    const titleGood = container.querySelector('.btn-fsrs-rating.good .fsrs-rating-title');
    const btnAgain = container.querySelector('.btn-fsrs-rating.again');
    const btnGood = container.querySelector('.btn-fsrs-rating.good');
    if (titleAgain) titleAgain.textContent = 'Quên';
    if (btnAgain) btnAgain.setAttribute('title', 'Quên (Phím 1 hoặc ←)');
    if (titleGood) titleGood.textContent = 'Nhớ';
    if (btnGood) btnGood.setAttribute('title', 'Nhớ (Phím 2, Space hoặc →)');
  } else {
    container.classList.remove('mode-2-buttons');
    const titleAgain = container.querySelector('.btn-fsrs-rating.again .fsrs-rating-title');
    const titleGood = container.querySelector('.btn-fsrs-rating.good .fsrs-rating-title');
    const btnAgain = container.querySelector('.btn-fsrs-rating.again');
    const btnGood = container.querySelector('.btn-fsrs-rating.good');
    if (titleAgain) titleAgain.textContent = 'Again';
    if (btnAgain) btnAgain.setAttribute('title', 'Again (Phím 1)');
    if (titleGood) titleGood.textContent = 'Good';
    if (btnGood) btnGood.setAttribute('title', 'Good (Phím 3)');
  }
}
