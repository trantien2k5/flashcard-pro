# 🚀 TIẾN ĐỘ DỰ ÁN & NHẬT KÝ PHÁT TRIỂN
> **Dự án:** Flashcard English Pro (PWA Spaced Repetition)  
> **Phiên bản hiện tại:** `v3.76.51`  
> **Cập nhật lần cuối:** 2026-11-10  
> **Tài liệu tham chiếu kiến trúc:** Xem [`AGENTS.md`](./AGENTS.md)

---

## 📍 1. Trạng Thái Hiện Tại (Project Health & Status)

- **Phiên bản SSOT:** `v3.76.51` (Đồng bộ tuyệt đối qua `package.json`, `sw.js`, `src/js/config.js`, `index.html`).
- **Chất lượng mã nguồn:**
  - `node test/check.js`: **70/70 files hoàn hảo**, 100% cú pháp V8 AST chuẩn tuyệt đối.
  - Khớp đúng 100% Named Exports/Imports giữa các module.
  - 0 Circular Dependency (không có vòng lặp import).
  - 0 Dead Code / 0 Unused Imports.
- **Bộ kiểm thử tự động:** **52/52 test cases ĐẠT 100%**:
  - `test/test_fsrs_sync.js`: 39 bài test FSRS-6, khoảng thời gian ôn tập, Leech detection, Streak Auto-heal.
  - `test/test_quiz_balance.js`: 13 bài test thuật toán phân phối đáp án trắc nghiệm thông minh.
- **Quy mô dữ liệu:** 4.157 từ vựng, 569 chủ đề (22 gốc, 547 con), 2.582+ ảnh WebP cục bộ.

---

## ✅ 2. Các Mốc Đã Hoàn Thành Gần Nhất (Completed Milestones)

### [v3.76.51] — Dọn sạch triệt để Code Rác & Code Chết (Dead Code Cleanup) (2026-11-10)
- **Xóa sạch Import thừa:** Dọn sạch 3 import mồ côi (`Rating`, `escapeHTML`, `speak`) trong `views/review.js`.
- **Thanh lọc 11 hàm & hằng số chết:**
  - `config.js`: Xóa bỏ `DEFAULT_BATCH_SIZE`.
  - `core/fsrs.js`: Xóa bỏ hàm `isCardLearned`.
  - `services/audio.js`: Xóa bỏ Facade object `AudioService`.
  - `views/reels.js`: Xóa bỏ hàm tàn dư `closeReelsSession`.
  - `views/stats/journal.js`: Xóa bỏ setter `setCurrentJournalPeriod`.
  - `utils.js`: Xóa bỏ 6 hàm tiện ích mồ côi (`formatTime`, `formatDate`, `formatNumber`, `isTouchDevice`, `throttle`, `bindModalBackdropAndEsc`).
- **Tự động đồng bộ bản đồ:** Cập nhật lại toàn bộ `CODE_MAP.md` với số dòng mới sau khi thanh lọc.
- **Kiểm thử tự động:** 70/70 files V8 AST 100%, 52/52 test cases passed.

### [v3.76.50] — Tái cấu trúc Module hóa toàn diện 4 màn hình lớn & Ban hành Bộ quy chuẩn (2026-11-10)
- **Tái cấu trúc `views/stats.js` (từ 1.201 dòng ➔ 375 dòng):**
  - Tạo mới `src/js/views/stats/forecast-modal.js` (377 dòng): Chuyên trách popup lịch dự báo tải ôn tập FSRS.
  - Tạo mới `src/js/views/stats/journal.js` (503 dòng): Chuyên trách Lịch học tập Calendar Heatmap, nhật ký ôn tập hàng ngày và popover chi tiết.
  - Giữ `views/stats.js` làm Barrel Facade điều phối tab thống kê.
- **Tái cấu trúc `views/decks.js` (từ 1.030 dòng ➔ 376 dòng):**
  - Tạo mới `src/js/views/decks/subtopics.js` (355 dòng): Chuyên trách giao diện duyệt danh mục Cấp 2 và Cấp 3.
  - Tạo mới `src/js/views/decks/words.js` (304 dòng): Chuyên trách giao diện danh sách từ vựng & chi tiết từ Cấp 4.
  - Giữ `views/decks.js` làm Barrel Facade duyệt 22 danh mục gốc Cấp 1.
- **Tái cấu trúc `views/library.js` (từ 1.211 dòng ➔ 860 dòng):**
  - Tạo mới `src/js/views/library/detail-modal.js` (367 dòng): Chuyên trách Modal kiểm tra chi tiết từ vựng và tham số FSRS (Stability, Difficulty, Due).
  - Giữ `views/library.js` làm Barrel Facade quản lý bảng từ điển và bộ lọc.
- **Tái cấu trúc `views/review.js` (từ 1.258 dòng ➔ 673 dòng):**
  - Tạo mới `src/js/views/review/stat-modals.js` (637 dòng): Gom nhóm 5 modal phân tích chuyên sâu các chỉ số Dashboard (Attention Cards, Due Words, Reviewed Today, Study Time, Mastered Tiers).
  - Giữ `views/review.js` làm Controller Trang chủ Dashboard.
- **Ban hành Bộ tài liệu Quy chuẩn & Kiến trúc chuẩn hóa:**
  - `CODING_STANDARDS.md`: 20 quy chuẩn code cốt lõi chia thành 5 nhóm (Cấu trúc, Viết code, Dữ liệu, Kiểm thử, AI Agent).
  - `ARCHITECTURE.md`: Tài liệu kiến trúc phân tầng 4 lớp, sơ đồ Mermaid và luồng dữ liệu học FSRS.
  - `DECISIONS.md`: 6 bản ghi quyết định kiến trúc (ADR-001 đến ADR-006) bất biến.
- **Đăng ký Service Worker:** Cập nhật đầy đủ 6 module mới vào cache PWA (`sw.js`).
- **Kiểm thử tự động:** 70/70 files đạt 100% V8 AST, 52/52 test cases (39 FSRS + 13 Quiz) thành công tuyệt đối.

### [v3.76.49] — Hoàn thiện kiến trúc 5 mục tối ưu, Autoplay & Storage (2026-11-10)
- **Bóc tách Autoplay Engine:** Tạo mới `src/js/views/study/autoplay.js`, chuyển toàn bộ logic học rảnh tay, lặp vô tận và timer; tinh gọn `study.js`.
- **Bóc tách Storage Engine:**
  - Tạo mới `src/js/services/storage/streak.js`: Chuyên trách thuật toán đóng băng (freeze), khôi phục (redeem) và thưởng cột mốc chuỗi.
  - Tạo mới `src/js/services/storage/backup.js`: Chuyên trách đóng gói Nano FSRS Positional Tuples (giảm 85-95% dung lượng), giải nén GZIP stream và tải/đọc file JSON.
  - Giữ `StorageManager` & `BackupService` trong `storage.js` làm Facade tương thích ngược 100%.
- **Chuẩn hóa Design Tokens:** Thay thế 10 mã màu hex cứng trong `src/js/views/reels.js` bằng các biến CSS tokens chuẩn (`var(--primary)`, `var(--fsrs-again)`,...).
- **Đồng bộ hóa AGENTS.md:** Cập nhật toàn bộ cây sơ đồ thư mục và bổ sung bảng tra cứu siêu tốc *Feature-to-File Matrix*.
- **Precache PWA:** Đăng ký toàn bộ các module mới vào `sw.js`.

### [v3.76.48] — Phân rã phụ thuộc chéo & Hợp nhất FSRS Review (2026-11-10)
- **Decouple `settings.js` & `review.js`:** Tách `showGoalCustomizerModal` và `showForecastDetailModal` sang `src/js/views/modals/goal-modal.js`.
- **Hợp nhất FSRS Rating:** Xây dựng `StorageManager.applyCardReview(...)` dùng chung cho `session.js`, `quiz.js`, `reels.js`, loại bỏ hoàn toàn code trùng lặp.
- **Module hóa `components.js`:** Chuyển `components.js` thành Facade barrel, tách nhỏ thành `toast.js`, `search.js`, `streak-hub.js`, `custom-study.js`, `optimizer-modal.js`, `shell.js`.
- **Module hóa `core/stats.js`:** Tách `core/timer.js` (StudyTimer) và `core/optimizer.js` (BehavioralOptimizer).

### [v3.76.47] — Bóc tách sub-modules chuyên biệt cho `study.js` (2026-11-10)
- Tách `src/js/views/study/` thành `prefs.js`, `shell.js`, `pomodoro.js`, `summary-modal.js`.

---

## 🎯 3. Việc Cần Làm Tiếp Theo (Backlog & Roadmap)

### 3.1. Tối ưu kiến trúc (Refactoring Sprint)
- [x] **Tách nhỏ `src/js/views/stats.js` (1.201 dòng ➔ 375 dòng):** Tách `stats/forecast-modal.js` và `stats/journal.js`.
- [x] **Tách nhỏ `src/js/views/decks.js` (1.030 dòng ➔ 376 dòng):** Tách `decks/subtopics.js` và `decks/words.js`.
- [x] **Tách nhỏ `src/js/views/library.js` (1.211 dòng ➔ 860 dòng):** Tách `library/detail-modal.js`.
- [x] **Tách nhỏ `src/js/views/review.js` (1.258 dòng ➔ 673 dòng):** Tách `review/stat-modals.js`.

### 3.2. Tính năng & Trải nghiệm (Features Backlog)
- [ ] **Chế độ Luyện Nghe / Lái Xe (Audio Hands-Free Mode):** Tối ưu giao diện tối giản cực đại, tăng cường lặp phát âm từ vựng.
- [ ] **Thợ săn từ khó (Leech Hunter View):** Khu vực dành riêng để tiêu diệt các từ bị quên $\ge 8$ lần.
- [ ] **Xuất thẻ ảnh thành tích:** Cho phép tải ảnh tóm tắt chuỗi ngày Streak hoặc thành tích học để chia sẻ mạng xã hội.

---

## 🔒 4. Các Quyết Định Kiến Trúc Bất Biến (Architecture Decisions)

> [!IMPORTANT]
> Mọi AI Agent hoặc lập trình viên khi sửa đổi mã nguồn **BẮT BUỘC TUÂN THỦ** các nguyên tắc sau để tránh gây lỗi hồi quy (regression bugs):

1. **Đọc State Đồng Bộ (RAM Write-Through):**
   - Mọi phương thức đọc dữ liệu như `StorageManager.getCard(id)`, `StorageManager.getSettings()` là hàm đồng bộ (Synchronous).
   - **TUYỆT ĐỐI KHÔNG dùng `await`** khi đọc state để đảm bảo UI render 60fps tức thì.
2. **Hàng Đợi Học FSRS (`relearnInSession: false`):**
   - Khi người học bấm *Quên (Again)*, thẻ sẽ được lên lịch ôn tập cho ngày mai theo công thức FSRS, **không chèn lặp vô tận ngay giữa phiên học** gây mệt mỏi tinh thần.
3. **Mô Hình Facade Bảo Vệ:**
   - Khi tách file lớn thành module con, file gốc phải đóng vai trò Facade (re-export các hàm/class con) để đảm bảo toàn bộ mã nguồn khác gọi vào không bị gãy hoặc phải sửa đường dẫn import.
4. **Vị Trí Đặt Imports/Exports:**
   - Tất cả câu lệnh `import` và `export` bắt buộc phải nằm ở **đầu file** để thỏa mãn bộ kiểm tra cú pháp AST `test/check.js`.
5. **Đồng Bộ Phiên Bản (SSOT):**
   - Không sửa tay phiên bản trong `package.json` hay `sw.js`. Luôn sử dụng lệnh `npm run bump` để cập nhật tự động toàn bộ dự án.
6. **Đăng Ký PWA Precache:**
   - Mọi tệp JavaScript mới tạo ra trong `src/` đều phải được thêm vào mảng `STATIC_ASSETS` trong `sw.js` để ứng dụng hoạt động 100% offline.
