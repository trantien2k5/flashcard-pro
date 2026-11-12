# 🚀 TIẾN ĐỘ DỰ ÁN & NHẬT KÝ PHÁT TRIỂN

> **Dự án:** Flashcard English Pro (PWA Spaced Repetition)  
> **Phiên bản mới nhất:** Xem [package.json](../package.json) (`v3.76.57+`)  
> **Cập nhật lần cuối:** 2026-11-13  
> **Kiến trúc & Quy chuẩn:** Xem [ARCHITECTURE.md](./ARCHITECTURE.md) | **Định vị code:** [CODE_MAP.md](./CODE_MAP.md)

---

## 📍 1. Trạng Thái Hiện Tại (Project Health & Status)

- **Chất lượng mã nguồn (`npm test`):**
  - `node test/check.js`: **81/81 files hoàn hảo**, 100% cú pháp V8 AST, Named Exports/Imports, CSS Variables & Schema.
  - `test/test_fsrs_sync.js`: **39/39 test cases** FSRS-6, Leech detection, Streak Auto-heal đạt 100%.
  - `test/test_quiz_balance.js`: **13/13 test cases** cân bằng hàng đợi Quiz đạt 100%.
- **Quy mô dữ liệu:** 4.157 từ vựng, 569 chủ đề (22 gốc, 547 con), 2.582+ ảnh WebP cục bộ.

---

## ✅ 2. Các Mốc Đã Hoàn Thành Gần Nhất (Completed Milestones)

### [v3.76.56 – v3.76.57] — Quy Hoạch & Tối Ưu Toàn Diện Hệ Thống CSS (2026-11-13)
- **Tách tầng nền tảng & bố cục:** Tách `main.css` (927 dòng) thành `src/css/base/` (`tokens.css`, `reset.css`, `animations.css`) và `src/css/layout/` (`shell.css`, `responsive.css`), giữ `main.css` làm facade `@import`.
- **Tách thành phần dùng chung:** Bóc tách `components.css` (3.079 dòng) thành 6 module sống trong `src/css/components/` (`modals.css`, `toast.css`, `search.css`, `optimizer.css`, `streak.css`, `custom-study.css`).
- **Dọn Dead CSS & Khử trùng lặp:** Xóa 3 module dead CSS không còn sử dụng (`sync.css`, `checkpoint.css`, `goal.css` — 1.156 dòng); gộp/xóa selector trùng ở `settings.css`, `stats.css`, `flashcard.css`, `main.css`.
- **Chuẩn hóa vị trí View:** Đưa `flashcard.css` vào `src/css/views/flashcard.css` và cập nhật `index.html`, `style.css`, `sw.js` (`PRECACHE_ASSETS`).
- **Kết quả:** `src/css/` giảm từ 18.502 dòng (446.6 KB) xuống còn **17.452 dòng (422.3 KB)** across 23 module gọn nhẹ.

### [v3.76.54 – v3.76.55] — Dọn Rác Repo, Sửa Test CRLF & Quy Hoạch `docs/` (2026-11-12 – 2026-11-13)
- Xóa các thư mục nháp/script cũ không còn dùng (`scratch/`, `tools/`, `scripts/data_gen/`).
- Sửa lỗi regex CRLF trong `test/check.js` (`^\s*` ➔ `^[ \t]*`) giúp chạy ổn định trên Windows.
- Gom tài liệu `.md` ở root vào `docs/` và cập nhật `AGENTS.md`, `scripts/locate.js`, `scripts/bump.js`.

### [v3.76.51] — Dọn sạch Code Rác & Code Chết (2026-11-10)
- Xóa 3 import thừa (`Rating`, `escapeHTML`, `speak`) trong `views/review.js` và 11 hàm/hằng số chết (`DEFAULT_BATCH_SIZE`, `isCardLearned`, `AudioService`, `closeReelsSession`, `setCurrentJournalPeriod`, 6 helper mồ côi trong `utils.js`).

### [v3.76.50] — Tái cấu trúc Module hóa 4 Màn Hình Lớn (2026-11-10)
- Tách `views/stats.js`, `views/decks.js`, `views/library.js`, `views/review.js` theo mô hình Barrel Facade và đăng ký đầy đủ vào `sw.js`.

### [v3.76.47 – v3.76.49] — Tách Study, Storage, Components & Core (2026-11-10)
- Bóc tách `views/study/`, `services/storage/{streak,backup}.js`, `views/components/`, `views/modals/goal-modal.js`, `core/{timer,optimizer}.js`.

---

## 🎯 3. Việc Cần Làm Tiếp Theo (Backlog & Roadmap)

### 3.1. Tối ưu kỹ thuật (Technical Debt)
- [ ] **Dọn Dead CSS sâu trong các file `views/*.css`:** Rà soát kỹ các class ghép chuỗi động trong JS trước khi thanh lọc các class thừa còn lại.
- [ ] **Chuẩn hóa Design Tokens:** Thay thế dần các mã `#hex` cứng trong `src/css/views/*.css` sang CSS Variables (`var(--...)`).

### 3.2. Tính năng & Trải nghiệm (Features Backlog)
- [ ] **Chế độ Luyện Nghe / Lái Xe (Audio Hands-Free Mode):** Giao diện tối giản, tăng cường lặp phát âm từ vựng.
- [ ] **Thợ săn từ khó (Leech Hunter View):** Khu vực dành riêng để ôn tập các từ quên $\ge 8$ lần.
- [ ] **Xuất thẻ ảnh thành tích:** Tải ảnh tóm tắt chuỗi ngày Streak hoặc thành tích học để chia sẻ.
