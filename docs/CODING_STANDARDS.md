# 📜 CODING_STANDARDS.md — Quy Chuẩn Viết Mã Nguồn Dự Án Flashcard English Pro

> **Single Source of Truth (SSOT)** về quy chuẩn viết code, thiết kế hệ thống và tiêu chuẩn triển khai cho Lập trình viên & AI Agent.

---

## 🏛️ NHÓM 1: CẤU TRÚC VÀ KIẾN TRÚC (Structure & Architecture)

### 1. Single Responsibility Principle (Đơn Trách Nhiệm)
- Mỗi tệp tin (`.js`) hoặc module chỉ chịu trách nhiệm cho một miền logic duy nhất.
- Không gộp chung: Màn hình chính (View coordinator), Hộp thoại chi tiết (Modals), Thuật toán toán học (Math/Engine), và Truy xuất dữ liệu (Storage DAO) vào chung một tệp.
- Ngưỡng cảnh báo: Khi một tệp vượt quá **300 - 500 dòng**, cần đánh giá để bóc tách module con chuyên trách (ví dụ: `views/stats/forecast-modal.js`, `views/review/stat-modals.js`).

### 2. Separation of Concerns (Tách Biệt Mối Quan Tâm)
- **UI & Presentation (`src/js/views/`)**: Chỉ quản lý DOM, render template, gán event listeners.
- **Business Logic & Math (`src/js/core/`)**: Tính toán FSRS, lọc danh sách từ vựng, tính toán streak. Hoàn toàn không chứa mã DOM (`document`, `window`).
- **Data & Storage (`src/js/services/`)**: Quản lý IndexedDB, localStorage, RAM cache và serialization.
- **Design Tokens & Styling (`src/css/`)**: Không hardcode mã màu hex trực tiếp trong JS template; luôn dùng biến CSS (`var(--...)`).

### 3. Modularization & Facade Pattern (Module Hóa & Mặt Tiền Tương Thích)
- Chia nhỏ các view phức tạp thành thư mục con (ví dụ: `views/study/`, `views/decks/`, `views/stats/`, `views/library/`, `views/review/`).
- Tệp gốc (`study.js`, `decks.js`, `stats.js`, `library.js`, `review.js`) đóng vai trò **Facade Barrel**: import các hàm từ thư mục con và `export` lại đầy đủ.
- Bảo đảm 100% tương thích ngược (Zero Breaking Changes) cho mọi module gọi từ bên ngoài.

### 4. Zero Circular Dependencies (Không Phụ Thuộc Vòng Tròn)
- Thiết kế luồng phụ thuộc một chiều (Unidirectional Dependency Flow):
  `UI Views` $\to$ `Core Logic / Selectors` $\to$ `Services (Storage/Audio)` $\to$ `Utils / Config`.
- Nếu module A cần gọi hàm của module B mà B đã import A, giải quyết bằng cách:
  - Truyền `app` context hoặc callback hàm qua tham số.
  - Sử dụng Event Bus hoặc cờ trạng thái trung gian.

### 5. Consistent Project Structure (Nhất Quán Cấu Trúc Thư Mục)
- `src/js/core/`: Lõi thuật toán độc lập nền tảng.
- `src/js/services/`: Dịch vụ lưu trữ, âm thanh, mạng.
- `src/js/views/`: Giao diện người dùng và các modal con.
- `src/js/data/`: Từ điển dữ liệu tĩnh và schemas.
- `test/`: Bộ kiểm tra tự động V8 AST và thuật toán.

---

## ✍️ NHÓM 2: QUY TẮC VIẾT CODE (Code Quality & Style)

### 6. Naming Conventions (Quy Ước Đặt Tên)
- **Files**: `kebab-case.js` (ví dụ: `forecast-modal.js`, `detail-modal.js`, `stat-modals.js`).
- **Classes**: `PascalCase` (ví dụ: `StorageManager`, `StatsManager`, `DeckManager`).
- **Functions & Variables**: `camelCase` (ví dụ: `renderReviewTab`, `isCardDue`, `activeGoalId`).
- **Constants & Enums**: `UPPER_SNAKE_CASE` (ví dụ: `DEFAULT_SETTINGS`, `STABILITY_MIN`).
- **Private / Internal Module State**: Tiền tố gạch dưới `_` (ví dụ: `_cachedApp`, `_isTimerListening`).

### 7. DRY (Don't Repeat Yourself)
- Không sao chép các đoạn mã xử lý dữ liệu (như định dạng ngày, tính khoảng cách FSRS, lọc thẻ).
- Mọi hàm tiện ích chung phải được tập trung tại `src/js/utils.js` hoặc module chuyên trách.

### 8. KISS (Keep It Simple, Stupid)
- Ưu tiên Vanilla ES6+ thuần túy, trực diện, dễ đọc hơn là sử dụng các mẫu thiết kế quá phức tạp hoặc meta-programming.
- Tránh trừu tượng hóa quá sớm (Over-engineering) khi chưa có ít nhất 3 nơi tái sử dụng.

### 9. Small & Focused Functions (Hàm Ngắn, Trọng Tâm)
- Mỗi hàm chỉ giải quyết một thao tác rõ ràng.
- Giữ độ dài hàm dưới 50 dòng nếu có thể. Tách các khối render HTML template dài thành các hàm `renderXYZShell()` hoặc `renderXYZItem()`.

### 10. No Magic Numbers or Strings (Không Rải Giá Trị Ma Thuật)
- Toàn bộ tham số cấu hình FSRS, tên Store IndexedDB, phím tắt, hạn mức học mặc định phải nằm trong `src/js/config.js` hoặc hằng số đầu file.

### 11. Type Safety & Defensive Checks (Kiểm Soát Kiểu & Phòng Thủ)
- Luôn kiểm tra tính hợp lệ của tham số (`if (!app || !app.deckManager) return;`).
- Ép kiểu rõ ràng khi đọc dữ liệu từ input hoặc storage (`Number(val) || 0`, `Boolean(flag)`).

### 12. Explicit Error Handling (Xử Lý Lỗi Rõ Ràng)
- Bọc các thao tác nhạy cảm (truy xuất IndexedDB, phát Web Speech Audio, phân tích JSON) trong khối `try...catch`.
- Ghi log lỗi có ngữ cảnh: `console.error('[ModuleName] Lỗi chi tiết:', err)`. Không âm thầm nuốt lỗi ngoại trừ fallback có chủ đích.

---

## 🛡️ NHÓM 3: QUẢN LÝ DỮ LIỆU VÀ BẢO MẬT (Data & Security)

### 13. Input Validation & Data Sanitization
- Luôn sử dụng hàm `escapeHTML()` từ `utils.js` trước khi chèn chuỗi ký tự do người dùng nhập hoặc từ khóa vào `innerHTML`.
- Ngăn chặn triệt để lỗ hổng XSS cục bộ trong PWA.

### 14. Data Consistency (Nhất Quán Cấu Trúc Dữ Liệu)
- Tất cả đối tượng thẻ học `Card` và chủ đề `Topic` phải tuân thủ nghiêm ngặt Schema định nghĩa tại `src/js/data/schemas.js`.
- Bất kỳ trường dữ liệu mới nào phải được cập nhật vào schema và bộ validator (`test/check.js`).

### 15. Security & Privacy (Bảo Mật & Riêng Tư)
- 100% Offline-First: Tuyệt đối không gửi dữ liệu học tập của người dùng lên bất kỳ server bên thứ ba nào nếu không có sự đồng ý rõ ràng.
- Không hardcode API key, token hoặc thông tin nhạy cảm trong mã nguồn.

### 16. Safe Data Operations (Thao Tác Dữ Liệu An Toàn)
- Cập nhật tiến trình qua In-Memory Cache Write-Through: ghi vào RAM trước để đảm bảo phản hồi 60fps, sau đó đồng bộ ngầm xuống IndexedDB.
- Trước khi xóa toàn bộ dữ liệu (`clearAllData`), luôn yêu cầu xác nhận kép từ người dùng.

---

## 🧪 NHÓM 4: KIỂM THỬ VÀ CHẤT LƯỢNG (Testing & Quality Gate)

### 17. Automated AST & Module Testing (`test/check.js`)
- Mọi sửa đổi phải vượt qua `node test/check.js` với kết quả **100% Hoàn hảo**.
- Bộ kiểm tra tự động xác minh: Cú pháp V8 AST, Khớp tên Named Exports/Imports, Tồn tại file liên kết, Biến CSS Tokens, Schema từ vựng, và Đồng bộ phiên bản SSOT.

### 18. FSRS Algorithm & Balance Test Suites
- Mọi thay đổi liên quan đến thuật toán FSRS phải vượt qua toàn bộ 39 test cases trong `test/test_fsrs_sync.js`.
- Mọi thay đổi liên quan đến Quiz/Reels phải vượt qua 13 test cases trong `test/test_quiz_balance.js`.
- Chạy toàn bộ với lệnh duy nhất: `npm test`.

### 19. Regression Prevention & PWA Offline Integrity
- Khi thêm file JS mới, bắt buộc phải đăng ký đường dẫn vào mảng `STATIC_ASSETS` trong `sw.js` để đảm bảo PWA hoạt động ngoại tuyến.
- Kiểm tra tính toàn vẹn của ứng dụng khi không có mạng (Offline mode).

### 20. Code Review & Clean Git Hygiene
- Mỗi commit phải tập trung vào một nhiệm vụ cụ thể theo chuẩn Conventional Commits: `refactor(scope): ...`, `fix(scope): ...`, `feat(scope): ...`.
- Nâng phiên bản tự động bằng lệnh SSOT `npm run bump` trước khi commit bản phát hành.

---

## 🤖 NHÓM 5: NGUYÊN TẮC DÀNH CHO AI AGENT (Agent Prime Directives)

1. **Không tự ý thay đổi kiến trúc tổng thể** khi chưa được người dùng yêu cầu hoặc phê duyệt.
2. **Không sửa file ngoài phạm vi nhiệm vụ** được giao. Đi thẳng vào tệp tin đích.
3. **Không cài đặt thêm thư viện NPM** bên ngoài. Giữ vững kiến trúc Vanilla Zero-Dependency.
4. **Phải khảo sát mã nguồn hiện có** và hiểu rõ các module phụ thuộc trước khi viết code mới.
5. **Tái sử dụng tối đa hàm và module đã có sẵn** trong `utils.js`, `storage.js`, `components.js`.
6. **Không tạo nhiều hàm thực hiện cùng một chức năng** gây phân mảnh logic.
7. **Không xóa code cũ khi chưa kiểm tra toàn bộ nơi sử dụng** (dùng `grep` để rà soát).
8. **Phải chạy `npm test` ngay sau khi sửa code** để tự động phát hiện và khắc phục sự cố (chỉ chạy sau khi sửa code hoặc khi được yêu cầu, tuyệt đối không chạy khi chỉ đọc/khảo sát).
9. **Cập nhật `PROGRESS.md` và `AGENTS.md`** ngay khi hoàn thành nhiệm vụ cấu trúc.
10. **Báo cáo rõ ràng**: Liệt kê tệp đã sửa, thay đổi cụ thể và số lượng test cases đã kiểm chứng.
11. **Khảo sát tinh gọn & Phản hồi nhanh**: Đối với các yêu cầu khảo sát, đọc lướt, ưu tiên mở tài liệu tổng quan (`ARCHITECTURE.md`), tóm tắt ngắn gọn và phản hồi ngay lập tức, không chạy các lệnh nặng tốn thời gian.
12. **Không đọc full code & Không đọc dạo**: Chỉ đọc chính xác phạm vi dòng/tệp tin liên quan trực tiếp đến nhiệm vụ. Tránh đọc tràn lan toàn bộ file hoặc mở file không cần thiết.
13. **Kỹ lưỡng theo mức độ rủi ro**: Chỉ khảo sát sâu và thận trọng tối đa khi gặp vấn đề lớn mang tính kiến trúc hoặc có nguy cơ gây lỗi cao (FSRS state, Storage, Core business). Tác vụ nhỏ xử lý nhanh, dứt khoát.
14. **Chủ động đề xuất tối ưu lâu dài**: Khi thấy module có dấu hiệu phình to (>300–500 dòng), cấu trúc rắc rối hoặc nợ kỹ thuật, luôn chủ động đề xuất giải pháp tái cấu trúc tối ưu bền vững.
15. **Tự động Bump & Push khi hoàn thành**: Sau khi code hoàn thiện và test 100% đạt chuẩn, tự động chạy `npm run bump`, commit và `git push origin main` luôn, không dừng lại hỏi người dùng.
